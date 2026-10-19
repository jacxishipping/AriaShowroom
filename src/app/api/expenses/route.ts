import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-auth";
import { createLedgerEntry } from "@/lib/ledger";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true, data: [] });
  }
  const unauthorized = await requireApiRole(["ADMIN", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;

  try {
    const expenses = await prisma.expense.findMany({
      include: { vehicle: { select: { stockNumber: true } } },
      orderBy: { date: "desc" },
    });
    return NextResponse.json({ success: true, data: expenses });
  } catch {
    return NextResponse.json({ success: false, fallback: true, data: [] });
  }
}

export async function POST(req: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true });
  }
  const unauthorized = await requireApiRole(["ADMIN", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const amount = Number(body.amount);
    const exchangeRate = Number(body.exchangeRate) || 70.5;
    const amountUSD = body.currency === "AFN" ? amount / exchangeRate : amount;

    if (!Number.isFinite(amountUSD) || amountUSD <= 0) {
      return NextResponse.json(
        { success: false, error: "Expense amount must be greater than zero" },
        { status: 400 }
      );
    }

    const vehicleId = body.vehicleId || null;
    const category = body.category || "Operational";
    const debitAccount = vehicleId
      ? "1040 - Vehicle Inventory Asset (Lot & Port)"
      : category.includes("Maintenance")
      ? "6010 - Operating Expense - Detailing"
      : category.includes("Staff")
      ? "6030 - Operating Expense - Staff Salaries & Bonus"
      : category.includes("Gomrok") || category.includes("Freight")
      ? "5020 - COGS - Freight & Port Clearance"
      : "6020 - Operating Expense - Solar, Fuel & Generator";

    const created = await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          category,
          amount: amountUSD,
          currency: "USD",
          description: body.description,
          payee: body.payee || null,
          receiptNum: body.receiptNum || null,
          vehicleId,
        },
      });

      if (vehicleId) {
        await tx.vehicle.update({
          where: { id: vehicleId },
          data: { landedCost: { increment: amountUSD } },
        });
      }

      await createLedgerEntry(tx, {
          entryNumber: `JE-EXP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          description: `${category}: ${body.description || "Expense"}`,
          reference: expense.receiptNum || expense.id,
          debitAccount,
          creditAccount: "1010 - Showroom Central Cash Safe",
          amountUSD,
          amountAFN: Math.round(amountUSD * exchangeRate),
      });

      return expense;
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create expense in database:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create expense" },
      { status: 500 }
    );
  }
}
