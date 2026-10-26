import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured, ensureDatabaseSchemaSynced } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const VERIFY_LIMIT_PER_MINUTE = 30;
const VERIFY_WINDOW_MS = 60_000;

const steeringLabels: Record<string, string> = {
  LEFT_HAND: "Left-Hand Drive (LHD)",
  RIGHT_HAND_CONVERTED: "Right-Hand Drive (RHD Converted)",
};

const statusLabels: Record<string, string> = {
  AVAILABLE: "Available on Lot",
  IN_TRANSIT: "In Transit",
  RESERVED: "Reserved/Deposit Paid",
  SOLD: "Sold",
  UNDER_PREP: "Under Prep/Maintenance",
};

export async function GET(request: Request) {
  const clientIp = getClientIp(request.headers);
  const rateCheck = checkRateLimit(
    `verify:${clientIp}`,
    VERIFY_LIMIT_PER_MINUTE,
    VERIFY_WINDOW_MS
  );
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: "Too many verification queries. Please wait briefly and try again.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateCheck.retryAfterSeconds) },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const code = (searchParams.get("code") || "").trim();

  if (code.length < 2 || code.length > 64) {
    return NextResponse.json(
      { success: false, error: "Reference code must be between 2 and 64 characters" },
      { status: 400 }
    );
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true });
  }

  await ensureDatabaseSchemaSynced();

  try {
    const [sale, invoice, directVehicle] = await Promise.all([
      prisma.sale.findFirst({
        where: {
          contractNumber: { equals: code, mode: "insensitive" },
        },
        include: {
          vehicle: true,
          customer: {
            select: { fullName: true },
          },
        },
      }),
      prisma.invoice.findFirst({
        where: {
          OR: [
            { invoiceNumber: { equals: code, mode: "insensitive" } },
            { vin: { equals: code, mode: "insensitive" } },
          ],
        },
      }),
      prisma.vehicle.findFirst({
        where: {
          OR: [
            { vin: { equals: code, mode: "insensitive" } },
            { stockNumber: { equals: code, mode: "insensitive" } },
          ],
        },
      }),
    ]);

    let vehicle = directVehicle || sale?.vehicle || null;

    if (!vehicle && invoice && (invoice.vehicleStock || invoice.vin)) {
      const lookupFilters = [
        ...(invoice.vehicleStock
          ? [{ stockNumber: { equals: invoice.vehicleStock, mode: "insensitive" as const } }]
          : []),
        ...(invoice.vin
          ? [{ vin: { equals: invoice.vin, mode: "insensitive" as const } }]
          : []),
      ];
      if (lookupFilters.length > 0) {
        vehicle = await prisma.vehicle.findFirst({
          where: { OR: lookupFilters },
        });
      }
    }

    const matched = Boolean(vehicle || sale || invoice);
    const recordType = sale
      ? "SALE"
      : invoice
      ? "INVOICE"
      : vehicle
      ? "VEHICLE"
      : null;

    return NextResponse.json({
      success: true,
      matched,
      recordType,
      vehicle: vehicle
        ? {
            stockNumber: vehicle.stockNumber,
            vin: vehicle.vin,
            year: vehicle.year,
            make: vehicle.make,
            model: vehicle.model,
            trim: vehicle.trim || "",
            color: vehicle.color,
            mileage: vehicle.mileage,
            originCountry: vehicle.originCountry,
            steering: steeringLabels[vehicle.steering] || vehicle.steering,
            customsClearance: vehicle.customsClearance,
            cleanTitle: Boolean(vehicle.cleanTitle),
            status: statusLabels[vehicle.status] || vehicle.status,
            yardLocation:
              (vehicle as { yardLocation?: string | null }).yardLocation ||
              "Main Showroom - Bagh-e-Azadi",
          }
        : null,
      sale: sale
        ? {
            contractNumber: sale.contractNumber,
            customerName: sale.customer?.fullName || "Registered Buyer",
            vehicleName: sale.vehicle
              ? `${sale.vehicle.year} ${sale.vehicle.make} ${sale.vehicle.model}`
              : "Vehicle",
            saleDate: sale.saleDate.toISOString().split("T")[0],
          }
        : null,
      invoice: invoice
        ? {
            invoiceNumber: invoice.invoiceNumber,
            customerName: invoice.customerName,
            vehicleDesc: invoice.vehicleDesc || null,
            vin: invoice.vin || null,
            issueDate: invoice.issueDate.toISOString().split("T")[0],
          }
        : null,
    });
  } catch {
    return NextResponse.json({ success: false, fallback: true });
  }
}
