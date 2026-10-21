import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-auth";
import { createLedgerEntry } from "@/lib/ledger";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const unauthorized = await requireApiRole(["ADMIN", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const amountUSD = Number(body.amountUSD);
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
          entryNumber: `JE-BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          date: bill.issueDate,
          description: `Supplier bill: ${bill.vehicleDescription || "Consignment"}`,
          reference: bill.billNumber,
          debitAccount: "1040 - Vehicle Inventory Asset (Lot & Port)",
          creditAccount: "2010 - Accounts Payable (Auto Suppliers UAE/Japan)",
          amountUSD,
          amountAFN: bill.amountAFN,
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