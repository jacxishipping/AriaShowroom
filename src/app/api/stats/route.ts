import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [vehicles, sales, customers, expenses] = await Promise.all([
      prisma.vehicle.findMany({
        select: {
          id: true,
          status: true,
          sellingPrice: true,
          landedCost: true,
          purchasePrice: true,
          customsDuty: true,
          freightCost: true,
        },
      }),
      prisma.sale.findMany({
        select: {
          id: true,
          salePrice: true,
          saleDate: true,
        },
      }),
      prisma.customer.count(),
      prisma.expense.findMany({
        select: {
          amount: true,
        },
      }),
    ]);

    const activeVehicles = vehicles.filter((v) => v.status === "AVAILABLE");
    const inTransitVehicles = vehicles.filter((v) => v.status === "IN_TRANSIT");
    const soldVehicles = vehicles.filter((v) => v.status === "SOLD");

    const totalActiveInventoryValue = activeVehicles.reduce((sum, v) => sum + v.sellingPrice, 0);
    const totalActiveLandedCost = activeVehicles.reduce((sum, v) => sum + v.landedCost, 0);
    const expectedMargin = totalActiveInventoryValue - totalActiveLandedCost;

    const totalSalesRevenue = sales.reduce((sum, s) => sum + s.salePrice, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return NextResponse.json({
      success: true,
      data: {
        activeInventoryValueUSD: totalActiveInventoryValue,
        activeLandedCostUSD: totalActiveLandedCost,
        expectedGrossProfitUSD: expectedMargin,
        totalSalesRevenueUSD: totalSalesRevenue,
        totalExpensesUSD: totalExpenses,
        counts: {
          totalVehicles: vehicles.length,
          available: activeVehicles.length,
          inTransit: inTransitVehicles.length,
          sold: soldVehicles.length,
          customersCount: customers,
          salesCount: sales.length,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to calculate stats" },
      { status: 500 }
    );
  }
}
