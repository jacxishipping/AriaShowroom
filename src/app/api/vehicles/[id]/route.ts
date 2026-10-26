import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured, ensureDatabaseSchemaSynced } from "@/lib/prisma";
import { VehicleStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireApiRole } from "@/lib/api-auth";
import { recordSessionAuditEvent } from "@/lib/audit-log";
import {
  createLedgerEntry,
  reverseLedgerEntriesByReference,
  roundCurrency,
} from "@/lib/ledger";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true });
  }
  const unauthorized = await requireApiRole(["ADMIN", "SALES", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;

  await ensureDatabaseSchemaSynced();

  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string } | undefined)?.role;

    const vehicle = await prisma.vehicle.findFirst({
      where: {
        OR: [{ id }, { stockNumber: id }, { vin: id }],
      },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        documents: true,
        sales: {
          include: {
            customer: true,
          },
        },
        expenses: true,
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: "Vehicle not found" },
        { status: 404 }
      );
    }

    if (role === "ADMIN" || role === "ACCOUNTANT") {
      return NextResponse.json({ success: true, data: vehicle });
    }

    const {
      purchasePrice: _purchasePrice,
      freightCost: _freightCost,
      customsDuty: _customsDuty,
      repairCost: _repairCost,
      landedCost: _landedCost,
      minTargetPrice: _minTargetPrice,
      expenses: _expenses,
      documents: _documents,
      ...salesVehicle
    } = vehicle;
    return NextResponse.json({ success: true, data: salesVehicle });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch vehicle" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true });
  }
  const unauthorized = await requireApiRole(["ADMIN", "SALES", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;

  await ensureDatabaseSchemaSynced();

  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string } | undefined)?.role;
    const body = await request.json();

    const adminAllowedFields = [
      "stockNumber", "vin", "make", "model", "year", "trim", "bodyType",
      "originCountry", "steering", "customsClearance", "cleanTitle", "mileage",
      "fuelType", "transmission", "driveType", "color", "status", "purchasePrice",
      "freightCost", "customsDuty", "repairCost", "landedCost", "minTargetPrice",
      "sellingPrice", "currency", "features", "description", "descriptionDari",
      "conditionNotes", "yardLocation", "viewsCount", "inquiriesCount",
    ];
    const operationalFields = [
      "status",
      "yardLocation",
      "conditionNotes",
      "viewsCount",
      "inquiriesCount",
      "mileage",
      "color",
      "customsClearance",
    ];

    const allowedFields = role === "ADMIN" ? adminAllowedFields : operationalFields;

    // Reject if a non-admin attempts to update price or cost fields
    if (
      role !== "ADMIN" &&
      (body.sellingPrice !== undefined ||
        body.purchasePrice !== undefined ||
        body.freightCost !== undefined ||
        body.customsDuty !== undefined ||
        body.repairCost !== undefined ||
        body.landedCost !== undefined ||
        body.minTargetPrice !== undefined)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Administrator access is required to modify vehicle pricing or costs",
        },
        { status: 403 }
      );
    }

    const previous = await prisma.vehicle.findUnique({ where: { id } });
    if (!previous) {
      return NextResponse.json(
        { success: false, error: "Vehicle not found" },
        { status: 404 }
      );
    }

    const data: Record<string, any> = Object.fromEntries(
      allowedFields
        .filter((field) => body[field] !== undefined)
        .map((field) => [field, body[field]])
    );

    if (data.mileage !== undefined) {
      data.mileage = Number(data.mileage);
    }

    // Recompute landedCost automatically when ADMIN edits component costs without explicitly setting landedCost
    if (
      role === "ADMIN" &&
      body.landedCost === undefined &&
      (body.purchasePrice !== undefined ||
        body.freightCost !== undefined ||
        body.customsDuty !== undefined ||
        body.repairCost !== undefined)
    ) {
      const nextPurchase = Number(data.purchasePrice ?? previous.purchasePrice) || 0;
      const nextFreight = Number(data.freightCost ?? previous.freightCost) || 0;
      const nextCustoms = Number(data.customsDuty ?? previous.customsDuty) || 0;
      const nextRepair = Number(data.repairCost ?? previous.repairCost) || 0;
      data.landedCost = roundCurrency(
        nextPurchase + nextFreight + nextCustoms + nextRepair
      );
    }

    if (body.yardLocation !== undefined || body.conditionNotes !== undefined) {
      const existingNotes =
        previous.conditionNotes && typeof previous.conditionNotes === "object"
          ? (previous.conditionNotes as Record<string, unknown>)
          : {};
      const incomingNotes =
        body.conditionNotes && typeof body.conditionNotes === "object"
          ? (body.conditionNotes as Record<string, unknown>)
          : {};
      data.conditionNotes = {
        ...existingNotes,
        ...incomingNotes,
        ...(body.yardLocation !== undefined ? { yardLocation: body.yardLocation } : {}),
      };
    }

    if (typeof data.status === "string") {
      const statusMap: Record<string, VehicleStatus> = {
        "In Transit": VehicleStatus.IN_TRANSIT,
        "Under Prep/Maintenance": VehicleStatus.UNDER_PREP,
        "Available on Lot": VehicleStatus.AVAILABLE,
        "Reserved/Deposit Paid": VehicleStatus.RESERVED,
        Sold: VehicleStatus.SOLD,
      };
      data.status = statusMap[data.status] || data.status;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: "No supported vehicle fields supplied" },
        { status: 400 }
      );
    }

    const syncCostAndAudit = async (
      tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
      updated: { id: string; stockNumber: string; landedCost: number; status: VehicleStatus },
      appliedData: Record<string, any>
    ) => {
      if (appliedData.status !== undefined && appliedData.status !== previous.status) {
        try {
          await tx.$executeRaw`
            UPDATE "Vehicle" SET "statusChangedAt" = NOW() WHERE id = ${id}
          `;
        } catch {
          // Ignore if statusChangedAt column is missing
        }
      }

      const costDelta =
        appliedData.landedCost !== undefined
          ? roundCurrency(Number(appliedData.landedCost) - previous.landedCost)
          : 0;

      if (costDelta !== 0 && updated.status !== VehicleStatus.SOLD) {
        const absDelta = Math.abs(costDelta);
        await createLedgerEntry(tx, {
          entryNumber: `JE-INV-ADJ-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          description: `Inventory landed cost adjustment (${updated.stockNumber})`,
          reference: updated.stockNumber,
          debitAccount:
            costDelta > 0
              ? "1040 - Vehicle Inventory Asset (Lot & Port)"
              : "3010 - Owner Capital & Equity",
          creditAccount:
            costDelta > 0
              ? "3010 - Owner Capital & Equity"
              : "1040 - Vehicle Inventory Asset (Lot & Port)",
          amountUSD: absDelta,
          amountAFN: Math.round(absDelta * 70.5),
        });
      }

      const trackedFields = ["status", "sellingPrice", "landedCost", "minTargetPrice"];
      const changes = Object.fromEntries(
        trackedFields
          .filter(
            (field) =>
              appliedData[field] !== undefined &&
              appliedData[field] !== previous[field as keyof typeof previous]
          )
          .map((field) => [
            field,
            {
              from: previous[field as keyof typeof previous],
              to: appliedData[field],
            },
          ])
      );
      await recordSessionAuditEvent(tx, {
        action: "VEHICLE_UPDATED",
        entityType: "Vehicle",
        entityId: id,
        changes:
          Object.keys(changes).length > 0
            ? changes
            : { fields: Object.keys(appliedData) },
      });
    };

    let vehicle;
    try {
      vehicle = await prisma.$transaction(async (tx) => {
        const updated = await tx.vehicle.update({
          where: { id },
          data,
          include: {
            images: true,
          },
        });
        await syncCostAndAudit(tx, updated, data);
        return updated;
      });
    } catch (updateError: any) {
      const errMsg = updateError?.message || "";
      const isMissingColumn =
        errMsg.includes("yardLocation") ||
        errMsg.includes("viewsCount") ||
        errMsg.includes("inquiriesCount") ||
        errMsg.includes("does not exist in the current database");

      if (isMissingColumn) {
        const fallbackData = { ...data };
        delete fallbackData.yardLocation;
        delete fallbackData.viewsCount;
        delete fallbackData.inquiriesCount;

        vehicle = await prisma.$transaction(async (tx) => {
          const updated = await tx.vehicle.update({
            where: { id },
            data: fallbackData,
            include: {
              images: true,
            },
          });
          await syncCostAndAudit(tx, updated, fallbackData);
          return updated;
        });
      } else {
        throw updateError;
      }
    }

    return NextResponse.json({ success: true, data: vehicle });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update vehicle" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true });
  }
  const unauthorized = await requireApiRole(["ADMIN"]);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;

    await prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.findUnique({
        where: { id },
        select: {
          id: true,
          stockNumber: true,
          sales: { select: { contractNumber: true } },
          expenses: { select: { id: true, receiptNum: true } },
        },
      });
      if (!vehicle) {
        throw new Error("Vehicle not found");
      }

      for (const sale of vehicle.sales) {
        await reverseLedgerEntriesByReference(
          tx,
          sale.contractNumber,
          `Vehicle ${vehicle.stockNumber} deleted`
        );
      }

      for (const expense of vehicle.expenses) {
        await reverseLedgerEntriesByReference(
          tx,
          expense.id,
          `Vehicle ${vehicle.stockNumber} deleted`
        );
        if (expense.receiptNum && expense.receiptNum !== expense.id) {
          await reverseLedgerEntriesByReference(
            tx,
            expense.receiptNum,
            `Vehicle ${vehicle.stockNumber} deleted`
          );
        }
      }

      await reverseLedgerEntriesByReference(
        tx,
        vehicle.stockNumber,
        `Vehicle ${vehicle.stockNumber} removed from inventory`
      );

      await tx.installmentPayment.deleteMany({
        where: {
          sale: {
            vehicleId: id,
          },
        },
      });
      await tx.sale.deleteMany({
        where: { vehicleId: id },
      });
      await tx.expense.deleteMany({
        where: { vehicleId: id },
      });
      await tx.vehicleDocument.deleteMany({
        where: { vehicleId: id },
      });
      await tx.vehicleImage.deleteMany({
        where: { vehicleId: id },
      });
      await tx.vehicle.delete({
        where: { id },
      });
      await recordSessionAuditEvent(tx, {
        action: "VEHICLE_DELETED",
        entityType: "Vehicle",
        entityId: id,
        changes: { stockNumber: vehicle.stockNumber },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status = error?.message === "Vehicle not found" ? 404 : 500;
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete vehicle" },
      { status }
    );
  }
}
