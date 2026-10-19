import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { VehicleStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireApiRole } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true });
  }
  const unauthorized = await requireApiRole(["ADMIN", "SALES", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;

  try {
    const { id } = params;
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
      purchasePrice,
      freightCost,
      customsDuty,
      repairCost,
      landedCost,
      minTargetPrice,
      conditionNotes,
      expenses,
      documents,
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
  { params }: { params: { id: string } }
) {
  const unauthorized = await requireApiRole(["ADMIN"]);
  if (unauthorized) return unauthorized;

  try {
    const { id } = params;
    const body = await request.json();
    const allowedFields = [
      "stockNumber", "vin", "make", "model", "year", "trim", "bodyType",
      "originCountry", "steering", "customsClearance", "cleanTitle", "mileage",
      "fuelType", "transmission", "driveType", "color", "status", "purchasePrice",
      "freightCost", "customsDuty", "repairCost", "landedCost", "minTargetPrice",
      "sellingPrice", "currency", "features", "description", "descriptionDari",
      "conditionNotes",
    ];
    const data = Object.fromEntries(
      allowedFields
        .filter((field) => body[field] !== undefined)
        .map((field) => [field, body[field]])
    );
    if (body.yardLocation !== undefined) {
      const existing = await prisma.vehicle.findUnique({ where: { id }, select: { conditionNotes: true } });
      const existingNotes = existing?.conditionNotes && typeof existing.conditionNotes === "object"
        ? existing.conditionNotes as Record<string, unknown>
        : {};
      data.conditionNotes = { ...existingNotes, yardLocation: body.yardLocation };
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
      return NextResponse.json({ success: false, error: "No supported vehicle fields supplied" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data,
      include: {
        images: true,
      },
    });

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
  { params }: { params: { id: string } }
) {
  const unauthorized = await requireApiRole(["ADMIN"]);
  if (unauthorized) return unauthorized;

  try {
    const { id } = params;

    await prisma.vehicleImage.deleteMany({ where: { vehicleId: id } });
    await prisma.vehicleDocument.deleteMany({ where: { vehicleId: id } });
    await prisma.vehicle.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Vehicle deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete vehicle" },
      { status: 500 }
    );
  }
}
