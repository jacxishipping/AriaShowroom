import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured, ensureDatabaseSchemaSynced } from "@/lib/prisma";
import { VehicleStatus, FuelType, TransmissionType, SteeringSide } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireApiRole } from "@/lib/api-auth";
import { recordSessionAuditEvent } from "@/lib/audit-log";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true, data: [] });
  }

  await ensureDatabaseSchemaSynced();

  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string } | undefined)?.role;
    const canViewFinancials = role === "ADMIN" || role === "ACCOUNTANT";
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const make = searchParams.get("make");

    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status as VehicleStatus;
    }
    if (make && make !== "ALL") {
      where.make = make;
    }
    if (search) {
      where.OR = [
        { make: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { vin: { contains: search, mode: "insensitive" } },
        { stockNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: {
        images: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = canViewFinancials
      ? vehicles
      : vehicles.map(({ purchasePrice, freightCost, customsDuty, repairCost, landedCost, minTargetPrice, conditionNotes, ...vehicle }) => vehicle);

    return NextResponse.json({ success: true, count: data.length, data });
  } catch {
    return NextResponse.json({ success: false, fallback: true, data: [] });
  }
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true });
  }
  const unauthorized = await requireApiRole(["ADMIN"]);
  if (unauthorized) return unauthorized;

  await ensureDatabaseSchemaSynced();

  try {
    const body = await request.json();

    const {
      stockNumber,
      vin,
      make,
      model,
      year,
      trim,
      bodyType = "SUV",
      originCountry = "UAE",
      steering = "LEFT_HAND",
      customsClearance = "Gomrok Herat (Islam Qala)",
      cleanTitle = true,
      mileage,
      fuelType = "PETROL",
      transmission = "AUTOMATIC",
      driveType = "4WD",
      color,
      status = "AVAILABLE",
      purchasePrice,
      freightCost = 0,
      customsDuty = 0,
      repairCost = 0,
      minTargetPrice = 0,
      sellingPrice,
      currency = "USD",
      features = [],
      description = "",
      descriptionDari = "",
      conditionNotes = undefined,
      yardLocation = undefined,
      images = [],
    } = body;

    const landedCost =
      Number(purchasePrice || 0) +
      Number(freightCost || 0) +
      Number(customsDuty || 0) +
      Number(repairCost || 0);

    const initialData = {
      stockNumber,
      vin,
      make,
      model,
      year: Number(year),
      trim: trim || "",
      bodyType,
      originCountry,
      steering: steering as SteeringSide,
      customsClearance,
      cleanTitle: Boolean(cleanTitle),
      mileage: Number(mileage),
      fuelType: fuelType as FuelType,
      transmission: transmission as TransmissionType,
      driveType,
      color,
      status: status as VehicleStatus,
      purchasePrice: Number(purchasePrice),
      freightCost: Number(freightCost),
      customsDuty: Number(customsDuty),
      repairCost: Number(repairCost),
      landedCost,
      minTargetPrice: Number(minTargetPrice || landedCost * 1.05),
      sellingPrice: Number(sellingPrice),
      currency,
      features: Array.isArray(features) ? features : [],
      description,
      descriptionDari,
      yardLocation: yardLocation || "Main Showroom - Bagh-e-Azadi",
      viewsCount: Number(body.viewsCount) || 0,
      inquiriesCount: Number(body.inquiriesCount) || 0,
      conditionNotes: conditionNotes || (yardLocation ? { yardLocation } : undefined),
      images: {
        create: images.map((img: { url: string; isPrimary?: boolean }, idx: number) => ({
          url: typeof img === "string" ? img : img.url,
          isPrimary: idx === 0,
          order: idx,
        })),
      },
    };

    let vehicle;
    try {
      vehicle = await prisma.$transaction(async (tx) => {
        const created = await tx.vehicle.create({
          data: initialData,
          include: {
            images: true,
          },
        });
        await recordSessionAuditEvent(tx, {
          action: "VEHICLE_CREATED",
          entityType: "Vehicle",
          entityId: created.id,
          changes: { stockNumber, status, sellingPrice },
        });
        return created;
      });
    } catch (createError: any) {
      const errMsg = createError?.message || "";
      const isMissingColumn =
        errMsg.includes("yardLocation") ||
        errMsg.includes("viewsCount") ||
        errMsg.includes("inquiriesCount") ||
        errMsg.includes("does not exist in the current database");

      if (isMissingColumn) {
        // Fallback for databases running with pre-migration schemas:
        // Pack yardLocation into conditionNotes JSON safely and omit missing physical columns
        const fallbackData = { ...initialData };
        delete (fallbackData as any).yardLocation;
        delete (fallbackData as any).viewsCount;
        delete (fallbackData as any).inquiriesCount;
        fallbackData.conditionNotes = {
          ...(typeof conditionNotes === "object" ? conditionNotes : {}),
          yardLocation: yardLocation || "Main Showroom - Bagh-e-Azadi",
        };

        vehicle = await prisma.$transaction(async (tx) => {
          const created = await tx.vehicle.create({
            data: fallbackData,
            include: {
              images: true,
            },
          });
          await recordSessionAuditEvent(tx, {
            action: "VEHICLE_CREATED",
            entityType: "Vehicle",
            entityId: created.id,
            changes: { stockNumber, status, sellingPrice },
          });
          return created;
        });
      } else {
        throw createError;
      }
    }

    return NextResponse.json({ success: true, data: vehicle }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create vehicle" },
      { status: 500 }
    );
  }
}
