import { NextResponse } from "next/server";
import { InstallmentStatus, VehicleStatus } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-auth";
import { calculateReportSummary } from "@/lib/report-metrics";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const unauthorized = await requireApiRole(["ADMIN", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, error: "Database is not configured" }, { status: 503 });
  }

  const params = new URL(request.url).searchParams;
  const from = new Date(params.get("from") || new Date(Date.now() - 30 * 86400000).toISOString());
  const to = new Date(params.get("to") || new Date().toISOString());
  if (!Number.isFinite(from.getTime()) || !Number.isFinite(to.getTime()) || from > to) {
    return NextResponse.json({ success: false, error: "Invalid report date range" }, { status: 400 });
  }

  try {
    const [sales, installments, inventory, sourcedVehicles, expenses] = await Promise.all([
      prisma.sale.findMany({
        where: { saleDate: { gte: from, lte: to } },
        include: {
          vehicle: { select: { id: true, stockNumber: true, make: true, model: true, year: true, landedCost: true } },
          customer: { select: { fullName: true } },
        },
        orderBy: { saleDate: "desc" },
      }),
      prisma.installmentPayment.findMany({
        where: { status: { in: [InstallmentStatus.PENDING, InstallmentStatus.OVERDUE] } },
        include: {
          sale: {
            select: {
              contractNumber: true,
              customer: { select: { fullName: true } },
            },
          },
        },
        orderBy: { dueDate: "asc" },
      }),
      prisma.vehicle.findMany({
        where: { status: { not: VehicleStatus.SOLD } },
        select: { id: true, stockNumber: true, make: true, model: true, year: true, createdAt: true, originCountry: true },
      }),
      prisma.vehicle.findMany({
        where: { createdAt: { gte: from, lte: to } },
        select: { originCountry: true },
      }),
      prisma.expense.aggregate({
        where: { date: { gte: from, lte: to } },
        _sum: { amount: true },
      }),
    ]);

    const sourcing = Object.entries(
      sourcedVehicles.reduce<Record<string, number>>((counts, vehicle) => {
        counts[vehicle.originCountry] = (counts[vehicle.originCountry] || 0) + 1;
        return counts;
      }, {})
    ).map(([originCountry, count]) => ({ originCountry, count }));

    return NextResponse.json({
      success: true,
      data: {
        summary: calculateReportSummary(
          sales.map((sale) => ({ salePrice: sale.salePrice, landedCost: sale.vehicle.landedCost })),
          installments.map((installment) => ({ amount: installment.amount })),
          inventory.map((vehicle) => vehicle.createdAt),
          expenses._sum.amount || 0
        ),
        sales: sales.map((sale) => ({
          id: sale.id,
          contractNumber: sale.contractNumber,
          saleDate: sale.saleDate,
          customerName: sale.customer.fullName,
          vehicle: `${sale.vehicle.year} ${sale.vehicle.make} ${sale.vehicle.model} (${sale.vehicle.stockNumber})`,
          salePriceUSD: sale.salePrice,
          grossProfitUSD: sale.salePrice - sale.vehicle.landedCost,
        })),
        receivables: installments.map((installment) => ({
          id: installment.id,
          contractNumber: installment.sale.contractNumber,
          customerName: installment.sale.customer.fullName,
          dueDate: installment.dueDate,
          amountUSD: installment.amount,
          status: installment.status,
        })),
        inventory: inventory.map((vehicle) => ({
          ...vehicle,
          ageDays: Math.floor((Date.now() - vehicle.createdAt.getTime()) / 86400000),
        })),
        sourcing,
      },
    });
  } catch (error) {
    console.error("Unable to calculate dealership report", error);
    return NextResponse.json(
      { success: false, error: "Unable to calculate dealership report" },
      { status: 500 }
    );
  }
}
