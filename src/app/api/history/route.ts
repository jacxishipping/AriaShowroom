import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const unauthorized = await requireApiRole(["ADMIN", "SALES", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, error: "Database is not configured" }, { status: 503 });
  }

  const query = new URL(request.url).searchParams.get("q")?.trim() || "";
  if (query.length < 2 || query.length > 100) {
    return NextResponse.json(
      { success: false, error: "Search must contain between 2 and 100 characters" },
      { status: 400 }
    );
  }

  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  const canViewFinancials = role === "ADMIN" || role === "ACCOUNTANT";
  try {
    const [vehicles, customers, payments] = await Promise.all([
      prisma.vehicle.findMany({
        where: {
          OR: [
            { stockNumber: { contains: query, mode: "insensitive" } },
            { vin: { contains: query, mode: "insensitive" } },
            { make: { contains: query, mode: "insensitive" } },
            { model: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 25,
        orderBy: { updatedAt: "desc" },
        include: {
          sales: {
            take: 20,
            orderBy: { saleDate: "desc" },
            include: {
              customer: { select: { id: true, fullName: true, phone: true } },
            },
          },
        },
      }),
      prisma.customer.findMany({
        where: {
          OR: [
            { fullName: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
            { tazkiraNumber: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 25,
        orderBy: { updatedAt: "desc" },
        include: {
          sales: {
            take: 20,
            orderBy: { saleDate: "desc" },
            include: {
              vehicle: { select: { id: true, stockNumber: true, make: true, model: true, year: true } },
            },
          },
        },
      }),
      canViewFinancials
        ? prisma.payment.findMany({
            where: {
              OR: [
                { partyName: { contains: query, mode: "insensitive" } },
                { partyPhone: { contains: query, mode: "insensitive" } },
                { vehicleStock: { contains: query, mode: "insensitive" } },
              ],
            },
            take: 25,
            orderBy: { date: "desc" },
            select: {
              id: true,
              voucherNumber: true,
              voucherType: true,
              date: true,
              partyName: true,
              amountUSD: true,
              vehicleStock: true,
              purpose: true,
            },
          })
        : Promise.resolve([]),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        vehicles: vehicles.map((vehicle) => ({
          id: vehicle.id,
          stockNumber: vehicle.stockNumber,
          vin: vehicle.vin,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          status: vehicle.status,
          createdAt: vehicle.createdAt,
          sales: vehicle.sales.map((sale) => ({
            id: sale.id,
            contractNumber: sale.contractNumber,
            saleDate: sale.saleDate,
            salePrice: canViewFinancials ? sale.salePrice : undefined,
            customer: sale.customer,
          })),
        })),
        customers: customers.map((customer) => ({
          id: customer.id,
          fullName: customer.fullName,
          phone: customer.phone,
          leadStage: customer.leadStage,
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt,
          sales: customer.sales.map((sale) => ({
            id: sale.id,
            contractNumber: sale.contractNumber,
            saleDate: sale.saleDate,
            salePrice: canViewFinancials ? sale.salePrice : undefined,
            vehicle: sale.vehicle,
          })),
        })),
        payments,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to search business history" },
      { status: 500 }
    );
  }
}
