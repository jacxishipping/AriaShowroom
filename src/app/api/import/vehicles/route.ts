import { NextResponse } from "next/server";
import { FuelType, SteeringSide, TransmissionType, VehicleStatus } from "@prisma/client";
import { prisma, isDatabaseConfigured, ensureDatabaseSchemaSynced } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-auth";
import { parseCsv, parseCsvNumber } from "@/lib/csv";
import { recordSessionAuditEvent } from "@/lib/audit-log";
import { createLedgerEntry } from "@/lib/ledger";

export const dynamic = "force-dynamic";
const MAX_CSV_BYTES = 2 * 1024 * 1024;
const MAX_DATA_ROWS = 1000;

class CsvValidationError extends Error {}

interface ImportVehicle {
  sourceRow: number;
  stockNumber: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  color: string;
  purchasePrice: number;
  freightCost: number;
  customsDuty: number;
  repairCost: number;
  sellingPrice: number;
  minTargetPrice: number;
  bodyType: string;
  originCountry: string;
  fuelType: FuelType;
  transmission: TransmissionType;
  steering: SteeringSide;
  status: VehicleStatus;
  description: string;
}

interface ImportIssue {
  row: number;
  field?: string;
  message: string;
}

const required = [
  "stocknumber", "vin", "make", "model", "year", "mileage", "color",
  "purchaseprice", "sellingprice",
];
const statusMap: Record<string, VehicleStatus> = {
  AVAILABLE: VehicleStatus.AVAILABLE,
  "AVAILABLE ON LOT": VehicleStatus.AVAILABLE,
  IN_TRANSIT: VehicleStatus.IN_TRANSIT,
  "IN TRANSIT": VehicleStatus.IN_TRANSIT,
  RESERVED: VehicleStatus.RESERVED,
  "RESERVED/DEPOSIT PAID": VehicleStatus.RESERVED,
  UNDER_PREP: VehicleStatus.UNDER_PREP,
  "UNDER PREP/MAINTENANCE": VehicleStatus.UNDER_PREP,
  SOLD: VehicleStatus.SOLD,
};

function parseVehicles(csv: string) {
  let rows: string[][];
  try {
    rows = parseCsv(csv);
  } catch (error) {
    throw new CsvValidationError(error instanceof Error ? error.message : "CSV format is invalid");
  }
  if (rows.length < 2) throw new CsvValidationError("CSV must contain a header and at least one data row");
  if (rows.length > MAX_DATA_ROWS + 1) {
    throw new CsvValidationError(`CSV cannot contain more than ${MAX_DATA_ROWS} data rows`);
  }
  const headers = rows[0].map((header) => header.trim().toLowerCase().replace(/[\s_-]/g, ""));
  if (new Set(headers).size !== headers.length) {
    throw new CsvValidationError("CSV contains duplicate column headers");
  }
  const missingHeaders = required.filter((header) => !headers.includes(header));
  if (missingHeaders.length) {
    throw new CsvValidationError(`Missing required columns: ${missingHeaders.join(", ")}`);
  }

  const issues: ImportIssue[] = [];
  const vehicles: ImportVehicle[] = [];
  const seenStock = new Set<string>();
  const seenVin = new Set<string>();
  const value = (cells: string[], name: string) =>
    cells[headers.indexOf(name.replace(/[\s_-]/g, "").toLowerCase())]?.trim() || "";

  rows.slice(1).forEach((cells, index) => {
    const rowNumber = index + 2;
    if (cells.length !== headers.length) {
      issues.push({ row: rowNumber, message: "Column count does not match the header" });
      return;
    }
    const stockNumber = value(cells, "stockNumber");
    const vin = value(cells, "vin");
    const make = value(cells, "make");
    const model = value(cells, "model");
    const number = (name: string) => parseCsvNumber(value(cells, name));
    const optionalNumber = (name: string) => parseCsvNumber(value(cells, name), 0);
    const year = number("year");
    const mileage = number("mileage");
    const color = value(cells, "color");
    const purchasePrice = number("purchasePrice");
    const sellingPrice = number("sellingPrice");
    const freightCost = optionalNumber("freightCost");
    const customsDuty = optionalNumber("customsDuty");
    const repairCost = optionalNumber("repairCost");
    const minTargetPrice = optionalNumber("minTargetPrice");
    const checks: [string, boolean, string][] = [
      ["stockNumber", Boolean(stockNumber), "Stock number is required"],
      ["vin", Boolean(vin), "VIN is required"],
      ["make", Boolean(make), "Make is required"],
      ["model", Boolean(model), "Model is required"],
      ["year", Number.isInteger(year) && year >= 1950 && year <= new Date().getFullYear() + 1, "Year is invalid"],
      ["mileage", Number.isInteger(mileage) && mileage >= 0, "Mileage must be a non-negative integer"],
      ["color", Boolean(color), "Color is required"],
      ["purchasePrice", Number.isFinite(purchasePrice) && purchasePrice >= 0, "Purchase price must be non-negative"],
      ["sellingPrice", Number.isFinite(sellingPrice) && sellingPrice > 0, "Selling price must be greater than zero"],
    ];
    for (const [field, valid, message] of checks) {
      if (!valid) issues.push({ row: rowNumber, field, message });
    }
    const normalizedStock = stockNumber.toLowerCase();
    const normalizedVin = vin.toLowerCase();
    if (normalizedStock && seenStock.has(normalizedStock)) {
      issues.push({ row: rowNumber, field: "stockNumber", message: "Duplicate stock number in file" });
    }
    if (normalizedVin && seenVin.has(normalizedVin)) {
      issues.push({ row: rowNumber, field: "vin", message: "Duplicate VIN in file" });
    }
    seenStock.add(normalizedStock);
    seenVin.add(normalizedVin);
    const statusInput = (value(cells, "status") || "AVAILABLE").toUpperCase();
    const fuelInput = (value(cells, "fuelType") || "PETROL").toUpperCase();
    const transmissionInput = (value(cells, "transmission") || "AUTOMATIC").toUpperCase();
    const steeringInput = (value(cells, "steering") || "LEFT_HAND").toUpperCase();
    const status = statusMap[statusInput];
    if (!status) issues.push({ row: rowNumber, field: "status", message: "Status is invalid" });
    if (!Object.values(FuelType).includes(fuelInput as FuelType)) {
      issues.push({ row: rowNumber, field: "fuelType", message: "Fuel type is invalid" });
    }
    if (!Object.values(TransmissionType).includes(transmissionInput as TransmissionType)) {
      issues.push({ row: rowNumber, field: "transmission", message: "Transmission is invalid" });
    }
    if (!Object.values(SteeringSide).includes(steeringInput as SteeringSide)) {
      issues.push({ row: rowNumber, field: "steering", message: "Steering value is invalid" });
    }
    if ([freightCost, customsDuty, repairCost, minTargetPrice].some((amount) => !Number.isFinite(amount) || amount < 0)) {
      issues.push({ row: rowNumber, field: "costs", message: "Optional costs and target price must be non-negative numbers" });
    }

    vehicles.push({
      sourceRow: rowNumber,
      stockNumber, vin, make, model, year, mileage, color, purchasePrice,
      freightCost, customsDuty, repairCost, sellingPrice, minTargetPrice,
      bodyType: value(cells, "bodyType") || "SUV",
      originCountry: value(cells, "originCountry") || "UAE",
      fuelType: fuelInput as FuelType,
      transmission: transmissionInput as TransmissionType,
      steering: steeringInput as SteeringSide,
      status: status || VehicleStatus.AVAILABLE,
      description: value(cells, "description"),
    });
  });
  return { vehicles, issues };
}

export async function POST(request: Request) {
  const unauthorized = await requireApiRole(["ADMIN"]);
  if (unauthorized) return unauthorized;
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, error: "Database is not configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, error: "Request body must contain valid JSON" }, { status: 400 });
    }
    console.error("Unable to read vehicle import request", error);
    return NextResponse.json({ success: false, error: "Unable to read import request" }, { status: 500 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ success: false, error: "Request body must be a JSON object" }, { status: 400 });
  }
  const { csv, commit } = body as { csv?: unknown; commit?: unknown };
  if (typeof csv !== "string" || Buffer.byteLength(csv, "utf8") > MAX_CSV_BYTES) {
    return NextResponse.json({ success: false, error: "CSV must be a text file no larger than 2 MB" }, { status: 400 });
  }

  let vehicles: ImportVehicle[];
  let issues: ImportIssue[];
  try {
    ({ vehicles, issues } = parseVehicles(csv));
  } catch (error) {
    if (error instanceof CsvValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error("Unable to validate vehicle import CSV", error);
    return NextResponse.json({ success: false, error: "Unable to validate vehicle CSV" }, { status: 500 });
  }

  try {
    const [existingStock, existingVin] = await Promise.all([
      prisma.vehicle.findMany({
        where: { stockNumber: { in: vehicles.map((vehicle) => vehicle.stockNumber) } },
        select: { stockNumber: true },
      }),
      prisma.vehicle.findMany({
        where: { vin: { in: vehicles.map((vehicle) => vehicle.vin) } },
        select: { vin: true },
      }),
    ]);
    const stockSet = new Set(existingStock.map((vehicle) => vehicle.stockNumber.toLowerCase()));
    const vinSet = new Set(existingVin.map((vehicle) => vehicle.vin.toLowerCase()));
    vehicles.forEach((vehicle) => {
      if (stockSet.has(vehicle.stockNumber.toLowerCase())) {
        issues.push({ row: vehicle.sourceRow, field: "stockNumber", message: "Stock number already exists" });
      }
      if (vinSet.has(vehicle.vin.toLowerCase())) {
        issues.push({ row: vehicle.sourceRow, field: "vin", message: "VIN already exists" });
      }
    });

    const shouldCommit = commit === true;
    if (shouldCommit && issues.length) {
      return NextResponse.json(
        { success: false, error: "Fix all validation issues before importing", count: vehicles.length, issues },
        { status: 400 }
      );
    }
    if (shouldCommit) {
      await ensureDatabaseSchemaSynced();
      await prisma.$transaction(async (tx) => {
        for (const vehicle of vehicles) {
          const landedCost = vehicle.purchasePrice + vehicle.freightCost + vehicle.customsDuty + vehicle.repairCost;
          const { sourceRow: _sourceRow, ...data } = vehicle;
          const created = await tx.vehicle.create({
            data: {
              ...data,
              minTargetPrice: data.minTargetPrice || landedCost * 1.05,
              landedCost,
              customsClearance: "Gomrok Herat - Verified",
              cleanTitle: true,
              driveType: "AWD",
              currency: "USD",
            },
          });
          if (landedCost > 0 && created.status !== VehicleStatus.SOLD) {
            await createLedgerEntry(tx, {
              entryNumber: `JE-INV-IMP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
              description: `Imported vehicle inventory asset — ${created.year} ${created.make} ${created.model} (${created.stockNumber})`,
              reference: created.stockNumber,
              debitAccount: "1040 - Vehicle Inventory Asset (Lot & Port)",
              creditAccount: "3010 - Owner Capital & Equity",
              amountUSD: landedCost,
              amountAFN: Math.round(landedCost * 70.5),
            });
          }
          await recordSessionAuditEvent(tx, {
            action: "VEHICLE_IMPORTED",
            entityType: "Vehicle",
            entityId: created.id,
            changes: { stockNumber: created.stockNumber, status: created.status, landedCost },
          });
        }
      });
    }
    return NextResponse.json({
      success: true,
      committed: shouldCommit,
      count: vehicles.length,
      issueCount: issues.length,
      issues,
      preview: vehicles.slice(0, 100),
    });
  } catch (error) {
    console.error("Unable to process vehicle import", error);
    return NextResponse.json(
      { success: false, error: "Unable to process vehicle import" },
      { status: 500 }
    );
  }
}
