import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-auth";
import {
  createLedgerEntry,
  reverseLedgerEntriesByReference,
  roundCurrency,
} from "@/lib/ledger";
import { recordSessionAuditEvent } from "@/lib/audit-log";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true });
  }
  const unauthorized = await requireApiRole(["ADMIN", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const amountUSD = roundCurrency(Number(body.amountUSD));
    if (!Number.isFinite(amountUSD) || amountUSD <= 0 || !body.billNumber) {
      return NextResponse.json(
        { success: false, error: "A bill number and positive amount are required" },
        { status: 400 }
      );
    }

    const exchangeRate = Number(body.exchangeRate) || 70.5;
    const result = await prisma.$transaction(async (tx) => {
      const bill = await tx.supplierBill.create({
        data: {
          billNumber: body.billNumber,
          supplierId: id,
          stockNumber: body.stockNumber || null,
          vehicleDescription: body.vehicleDescription || null,
          amountUSD,
          amountAFN: Math.round(amountUSD * exchangeRate),
          status: body.status || "Unpaid",
          issueDate: body.issueDate ? new Date(body.issueDate) : new Date(),
          dueDate: body.dueDate ? new Date(body.dueDate) : null,
          notes: body.notes || null,
        },
      });

      await tx.supplier.update({
        where: { id },
        data: {
          totalPurchasedUSD: { increment: amountUSD },
          balanceUSD: { increment: amountUSD },
        },
      });

      if (bill.stockNumber) {
        await tx.vehicle.updateMany({
          where: { stockNumber: bill.stockNumber },
          data: { landedCost: { increment: amountUSD } },
        });
      }

      await createLedgerEntry(tx, {
        entryNumber: `JE-BILL-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        date: bill.issueDate,
        description: `Supplier bill: ${bill.vehicleDescription || "Consignment"}`,
        reference: bill.billNumber,
        debitAccount: "1040 - Vehicle Inventory Asset (Lot & Port)",
        creditAccount: "2010 - Accounts Payable (Auto Suppliers UAE/Japan)",
        amountUSD,
        amountAFN: bill.amountAFN,
      });

      await recordSessionAuditEvent(tx, {
        action: "SUPPLIER_BILL_CREATED",
        entityType: "SupplierBill",
        entityId: bill.id,
        changes: {
          supplierId: id,
          billNumber: bill.billNumber,
          amountUSD: bill.amountUSD,
          stockNumber: bill.stockNumber,
        },
      });

      return bill;
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record supplier bill" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true });
  }
  const unauthorized = await requireApiRole(["ADMIN", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json().catch(() => ({}));
    const billId = body.billId || body.id;
    if (!billId) {
      return NextResponse.json(
        { success: false, error: "Bill ID is required" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      const existing = await tx.supplierBill.findFirst({
        where: { id: billId, supplierId: id },
      });
      if (!existing) {
        throw new Error("Supplier bill not found");
      }

      await tx.supplier.update({
        where: { id },
        data: {
          totalPurchasedUSD: { decrement: existing.amountUSD },
          balanceUSD: { decrement: existing.amountUSD },
        },
      });

      if (existing.stockNumber) {
        await tx.vehicle.updateMany({
          where: { stockNumber: existing.stockNumber },
          data: { landedCost: { decrement: existing.amountUSD } },
        });
      }

      await reverseLedgerEntriesByReference(
        tx,
        existing.billNumber,
        "Supplier bill deleted"
      );

      await tx.supplierBill.delete({ where: { id: existing.id } });

      await recordSessionAuditEvent(tx, {
        action: "SUPPLIER_BILL_DELETED",
        entityType: "SupplierBill",
        entityId: existing.id,
        changes: {
          supplierId: id,
          billNumber: existing.billNumber,
          amountUSD: existing.amountUSD,
          stockNumber: existing.stockNumber,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Supplier bill reversed and deleted successfully",
    });
  } catch (error: any) {
    const status = error?.message === "Supplier bill not found" ? 404 : 500;
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete supplier bill" },
      { status }
    );
  }
}
