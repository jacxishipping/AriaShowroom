import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-auth";
import {
  createLedgerEntry,
  reverseLedgerEntriesByReference,
  roundCurrency,
} from "@/lib/ledger";
import { recordSessionAuditEvent } from "@/lib/audit-log";

function resolveExpenseDebitAccount(
  vehicleId: string | null | undefined,
  category: string
): string {
  if (vehicleId) {
    return "1040 - Vehicle Inventory Asset (Lot & Port)";
  }
  if (category.includes("Maintenance") || category.includes("Detailing")) {
    return "6010 - Operating Expense - Detailing & Prep";
  }
  if (category.includes("Staff") || category.includes("Salar")) {
    return "6030 - Operating Expense - Staff Salaries & Bonus";
  }
  if (category.includes("Gomrok") || category.includes("Freight") || category.includes("Customs")) {
    return "5020 - COGS - Freight & Port Clearance";
  }
  return "6020 - Operating Expense - Solar, Fuel & Generator";
}

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
    const amountUSD = roundCurrency(
      body.currency === "AFN" ? amount / exchangeRate : amount
    );

    if (!Number.isFinite(amountUSD) || amountUSD <= 0) {
      return NextResponse.json(
        { success: false, error: "Expense amount must be greater than zero" },
        { status: 400 }
      );
    }

    const vehicleId = body.vehicleId || null;
    const category = body.category || "Operational";
    const debitAccount = resolveExpenseDebitAccount(vehicleId, category);

    const created = await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          category,
          amount: amountUSD,
          currency: "USD",
          description: body.description || "Operational expense",
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

      const receiptSuffix = expense.receiptNum ? ` [Receipt ${expense.receiptNum}]` : "";
      await createLedgerEntry(tx, {
        entryNumber: `JE-EXP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        description: `${category}: ${expense.description}${receiptSuffix}`,
        reference: expense.id,
        debitAccount,
        creditAccount: "1010 - Showroom Central Cash Safe",
        amountUSD,
        amountAFN: Math.round(amountUSD * exchangeRate),
      });

      await recordSessionAuditEvent(tx, {
        action: "EXPENSE_CREATED",
        entityType: "Expense",
        entityId: expense.id,
        changes: {
          category: expense.category,
          amountUSD,
          vehicleId,
          receiptNum: expense.receiptNum,
        },
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

export async function PATCH(req: Request) {
  const unauthorized = await requireApiRole(["ADMIN", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true });
  }

  try {
    const body = await req.json();
    const expenseId = body.expenseId || body.id;
    if (!expenseId) {
      return NextResponse.json(
        { success: false, error: "Expense ID is required" },
        { status: 400 }
      );
    }

    const exchangeRate = Number(body.exchangeRate) || 70.5;

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.expense.findUnique({ where: { id: expenseId } });
      if (!existing) {
        throw new Error("Expense not found");
      }

      const nextAmount =
        body.amount !== undefined || body.amountUSD !== undefined
          ? roundCurrency(Number(body.amountUSD ?? body.amount))
          : roundCurrency(existing.amount);

      if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
        throw new Error("Expense amount must be greater than zero");
      }

      const updateData: Record<string, unknown> = {};
      if (body.category !== undefined) updateData.category = body.category;
      if (body.amount !== undefined || body.amountUSD !== undefined) {
        updateData.amount = nextAmount;
      }
      if (body.description !== undefined) updateData.description = body.description;
      if (body.payee !== undefined) updateData.payee = body.payee;
      if (body.receiptNum !== undefined || body.receiptNumber !== undefined) {
        updateData.receiptNum = body.receiptNum ?? body.receiptNumber;
      }

      const nextExpense = await tx.expense.update({
        where: { id: expenseId },
        data: updateData,
      });

      const delta = roundCurrency(nextAmount - existing.amount);
      if (delta !== 0 && existing.vehicleId) {
        await tx.vehicle.update({
          where: { id: existing.vehicleId },
          data: { landedCost: { increment: delta } },
        });
      }

      if (delta !== 0 || nextExpense.category !== existing.category) {
        await reverseLedgerEntriesByReference(tx, existing.id, "Expense modified");
        if (existing.receiptNum && existing.receiptNum !== existing.id) {
          await reverseLedgerEntriesByReference(
            tx,
            existing.receiptNum,
            "Expense modified"
          );
        }

        const receiptSuffix = nextExpense.receiptNum
          ? ` [Receipt ${nextExpense.receiptNum}]`
          : "";
        await createLedgerEntry(tx, {
          entryNumber: `JE-EXP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          description: `${nextExpense.category}: ${nextExpense.description}${receiptSuffix}`,
          reference: nextExpense.id,
          debitAccount: resolveExpenseDebitAccount(
            nextExpense.vehicleId,
            nextExpense.category
          ),
          creditAccount: "1010 - Showroom Central Cash Safe",
          amountUSD: nextAmount,
          amountAFN: Math.round(nextAmount * exchangeRate),
        });
      }

      await recordSessionAuditEvent(tx, {
        action: "EXPENSE_UPDATED",
        entityType: "Expense",
        entityId: nextExpense.id,
        changes: {
          fromAmount: existing.amount,
          toAmount: nextExpense.amount,
          category: nextExpense.category,
        },
      });

      return nextExpense;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    const status =
      error?.message === "Expense not found"
        ? 404
        : error?.message === "Expense amount must be greater than zero"
        ? 400
        : 500;
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update expense" },
      { status }
    );
  }
}

export async function DELETE(req: Request) {
  const unauthorized = await requireApiRole(["ADMIN", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const expenseId = body.expenseId || body.id;
    if (!expenseId) {
      return NextResponse.json(
        { success: false, error: "Expense ID is required" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      const existing = await tx.expense.findUnique({ where: { id: expenseId } });
      if (!existing) {
        throw new Error("Expense not found");
      }

      if (existing.vehicleId) {
        await tx.vehicle.update({
          where: { id: existing.vehicleId },
          data: { landedCost: { decrement: existing.amount } },
        });
      }

      await reverseLedgerEntriesByReference(tx, existing.id, "Expense deleted");
      if (existing.receiptNum && existing.receiptNum !== existing.id) {
        await reverseLedgerEntriesByReference(
          tx,
          existing.receiptNum,
          "Expense deleted"
        );
      }

      await tx.expense.delete({ where: { id: expenseId } });

      await recordSessionAuditEvent(tx, {
        action: "EXPENSE_DELETED",
        entityType: "Expense",
        entityId: expenseId,
        changes: {
          category: existing.category,
          amountUSD: existing.amount,
          vehicleId: existing.vehicleId,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Expense reversed and deleted successfully",
    });
  } catch (error: any) {
    const status = error?.message === "Expense not found" ? 404 : 500;
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete expense" },
      { status }
    );
  }
}
