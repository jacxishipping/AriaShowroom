import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireApiRole } from "@/lib/api-auth";
import { createLedgerEntry } from "@/lib/ledger";
import { recordSessionAuditEvent } from "@/lib/audit-log";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true, data: [] });
  }
  const unauthorized = await requireApiRole(["ADMIN", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;

  try {
    const vouchers = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: vouchers });
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
    const amountUSD = Number(body.amountUSD);
    const exchangeRate = Number(body.exchangeRate) || 70.5;
    const voucherType = body.voucherType || "CUSTOMER_PAYMENT";

    if (!Number.isFinite(amountUSD) || amountUSD <= 0) {
      return NextResponse.json(
        { success: false, error: "Payment amount must be greater than zero" },
        { status: 400 }
      );
    }
    if (!["CUSTOMER_PAYMENT", "SUPPLIER_PAYMENT", "EXPENSE_PAYMENT"].includes(voucherType)) {
      return NextResponse.json(
        { success: false, error: "Invalid voucher type" },
        { status: 400 }
      );
    }

    const paymentMethod = body.paymentMethod || "Cash";
    const session = await getServerSession(authOptions);
    const paymentAccount = paymentMethod.toLowerCase().includes("bank")
      ? "1030 - Azizi Bank Commercial USD Account"
      : paymentMethod.toLowerCase().includes("cash")
      ? "1010 - Showroom Central Cash Safe"
      : "1020 - Sarrafi Khorasan Holding Account";

    const created = await prisma.$transaction(async (tx) => {
      const linkedVehicle = voucherType === "EXPENSE_PAYMENT" && body.vehicleStock
        ? await tx.vehicle.findUnique({ where: { stockNumber: body.vehicleStock } })
        : null;
      if (voucherType === "EXPENSE_PAYMENT" && body.vehicleStock && !linkedVehicle) {
        throw new Error("The linked vehicle was not found");
      }

      const payment = await tx.payment.create({
        data: {
          voucherNumber: body.voucherNumber || `PV-HRT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          voucherType,
          partyName: body.partyName,
          partyPhone: body.partyPhone || null,
          partyTazkira: body.partyTazkira || null,
          amountUSD,
          amountAFN: Number(body.amountAFN) || Math.round(amountUSD * exchangeRate),
          exchangeRate,
          paymentMethod,
          sarrafiAccount: body.sarrafiAccount || null,
          referenceNumber: body.referenceNumber || null,
          vehicleStock: body.vehicleStock || null,
          supplierId: body.supplierId || null,
          purpose: body.purpose || "Payment settlement",
          recordedBy: session?.user?.name || "Accountant",
        },
      });

      if (voucherType === "EXPENSE_PAYMENT") {
        await tx.expense.create({
          data: {
            category: body.category || "Showroom Overhead & Fuel",
            amount: amountUSD,
            currency: "USD",
            description: body.purpose || "Expense payment",
            payee: body.partyName || null,
            receiptNum: body.referenceNumber || null,
            vehicleId: linkedVehicle?.id || null,
          },
        });
        if (linkedVehicle) {
          await tx.vehicle.update({
            where: { id: linkedVehicle.id },
            data: { landedCost: { increment: amountUSD } },
          });
        }
      }

      if (voucherType === "SUPPLIER_PAYMENT" && body.supplierId) {
        await tx.supplier.update({
          where: { id: body.supplierId },
          data: {
            totalPaidUSD: { increment: amountUSD },
            balanceUSD: { decrement: amountUSD },
          },
        });
      }

      const debitAccount = voucherType === "CUSTOMER_PAYMENT"
        ? paymentAccount
        : voucherType === "SUPPLIER_PAYMENT"
        ? "2010 - Accounts Payable (Auto Suppliers UAE/Japan)"
        : linkedVehicle
        ? "1040 - Vehicle Inventory Asset (Lot & Port)"
        : "6020 - Operating Expense - Solar, Fuel & Generator";
      const creditAccount = voucherType === "CUSTOMER_PAYMENT"
        ? "1050 - Accounts Receivable (Customer Installments)"
        : paymentAccount;

      await createLedgerEntry(tx, {
          entryNumber: `JE-PV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          description: body.purpose || "Payment settlement",
          reference: payment.voucherNumber,
          debitAccount,
          creditAccount,
          amountUSD,
          amountAFN: payment.amountAFN,
      });

      await recordSessionAuditEvent(tx, {
        action: "PAYMENT_RECORDED",
        entityType: "Payment",
        entityId: payment.id,
        changes: {
          voucherNumber: payment.voucherNumber,
          voucherType: payment.voucherType,
          amountUSD: payment.amountUSD,
          paymentMethod: payment.paymentMethod,
        },
      });
      return payment;
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create payment voucher in database:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create payment voucher" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const unauthorized = await requireApiRole(["ADMIN", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;
  if (!isDatabaseConfigured()) return NextResponse.json({ success: false, fallback: true });

  try {
    const body = await req.json();
    const voucherId = body.voucherId || body.id;
    if (!voucherId) return NextResponse.json({ success: false, error: "Voucher ID is required" }, { status: 400 });

    const updateData: any = {};
    if (body.partyName !== undefined) updateData.partyName = body.partyName;
    if (body.partyPhone !== undefined) updateData.partyPhone = body.partyPhone;
    if (body.amountUSD !== undefined) {
      updateData.amountUSD = Number(body.amountUSD);
      updateData.amountAFN = Math.round(Number(body.amountUSD) * (Number(body.exchangeRate) || 70.5));
    }
    if (body.paymentMethod !== undefined) updateData.paymentMethod = body.paymentMethod;
    if (body.sarrafiAccount !== undefined) updateData.sarrafiAccount = body.sarrafiAccount;
    if (body.purpose !== undefined) updateData.purpose = body.purpose;

    const updated = await prisma.payment.update({
      where: { id: voucherId },
      data: updateData,
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to update voucher" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const unauthorized = await requireApiRole(["ADMIN", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;
  if (!isDatabaseConfigured()) return NextResponse.json({ success: false, fallback: true });

  try {
    const body = await req.json().catch(() => ({}));
    const voucherId = body.voucherId || body.id;
    if (!voucherId) return NextResponse.json({ success: false, error: "Voucher ID is required" }, { status: 400 });

    await prisma.payment.delete({ where: { id: voucherId } });
    return NextResponse.json({ success: true, message: "Voucher deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to delete voucher" }, { status: 500 });
  }
}
