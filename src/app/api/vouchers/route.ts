import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireApiRole } from "@/lib/api-auth";
import {
  createLedgerEntry,
  reverseLedgerEntriesByReference,
  roundCurrency,
} from "@/lib/ledger";
import { recordSessionAuditEvent } from "@/lib/audit-log";

function resolvePaymentAccount(paymentMethod: string): string {
  const lower = String(paymentMethod || "").toLowerCase();
  if (lower.includes("bank")) {
    return "1030 - Azizi Bank Commercial USD Account";
  }
  if (lower.includes("cash")) {
    return "1010 - Showroom Central Cash Safe";
  }
  return "1020 - Sarrafi Khorasan Holding Account";
}

function resolveVoucherAccounts(
  voucherType: string,
  paymentMethod: string,
  hasLinkedVehicle: boolean
): { debitAccount: string; creditAccount: string } {
  const paymentAccount = resolvePaymentAccount(paymentMethod);
  const debitAccount =
    voucherType === "CUSTOMER_PAYMENT"
      ? paymentAccount
      : voucherType === "SUPPLIER_PAYMENT"
      ? "2010 - Accounts Payable (Auto Suppliers UAE/Japan)"
      : hasLinkedVehicle
      ? "1040 - Vehicle Inventory Asset (Lot & Port)"
      : "6020 - Operating Expense - Solar, Fuel & Generator";
  const creditAccount =
    voucherType === "CUSTOMER_PAYMENT"
      ? "1050 - Accounts Receivable (Customer Installments)"
      : paymentAccount;
  return { debitAccount, creditAccount };
}

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
  const unauthorized = await requireApiRole(["ADMIN", "ACCOUNTANT", "SALES"]);
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const amountUSD = roundCurrency(Number(body.amountUSD));
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

    const session = await getServerSession(authOptions);
    const sessionRole = (session?.user as { role?: string } | undefined)?.role;
    if (sessionRole === "SALES" && voucherType !== "CUSTOMER_PAYMENT") {
      return NextResponse.json(
        {
          success: false,
          error: "Sales agents may only record customer receipt vouchers",
        },
        { status: 403 }
      );
    }

    const paymentMethod = body.paymentMethod || "Cash";

    const created = await prisma.$transaction(async (tx) => {
      const linkedVehicle =
        voucherType === "EXPENSE_PAYMENT" && body.vehicleStock
          ? await tx.vehicle.findUnique({ where: { stockNumber: body.vehicleStock } })
          : null;
      if (voucherType === "EXPENSE_PAYMENT" && body.vehicleStock && !linkedVehicle) {
        throw new Error("The linked vehicle was not found");
      }

      const payment = await tx.payment.create({
        data: {
          voucherNumber:
            body.voucherNumber ||
            `PV-HRT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
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
            receiptNum: payment.voucherNumber,
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

      const { debitAccount, creditAccount } = resolveVoucherAccounts(
        voucherType,
        paymentMethod,
        Boolean(linkedVehicle)
      );

      await createLedgerEntry(tx, {
        entryNumber: `JE-PV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
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
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true });
  }

  try {
    const body = await req.json();
    const voucherId = body.voucherId || body.id;
    if (!voucherId) {
      return NextResponse.json(
        { success: false, error: "Voucher ID is required" },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.payment.findUnique({ where: { id: voucherId } });
      if (!existing) {
        throw new Error("Voucher not found");
      }

      const nextExchangeRate = Number(body.exchangeRate) || existing.exchangeRate || 70.5;
      const nextAmountUSD =
        body.amountUSD !== undefined
          ? roundCurrency(Number(body.amountUSD))
          : roundCurrency(existing.amountUSD);

      if (!Number.isFinite(nextAmountUSD) || nextAmountUSD <= 0) {
        throw new Error("Payment amount must be greater than zero");
      }

      const updateData: Record<string, unknown> = {};
      if (body.partyName !== undefined) updateData.partyName = body.partyName;
      if (body.partyPhone !== undefined) updateData.partyPhone = body.partyPhone;
      if (body.amountUSD !== undefined) {
        updateData.amountUSD = nextAmountUSD;
        updateData.amountAFN = Math.round(nextAmountUSD * nextExchangeRate);
        updateData.exchangeRate = nextExchangeRate;
      }
      if (body.paymentMethod !== undefined) updateData.paymentMethod = body.paymentMethod;
      if (body.sarrafiAccount !== undefined) updateData.sarrafiAccount = body.sarrafiAccount;
      if (body.purpose !== undefined) updateData.purpose = body.purpose;

      const nextPayment = await tx.payment.update({
        where: { id: voucherId },
        data: updateData,
      });

      const deltaUSD = roundCurrency(nextAmountUSD - existing.amountUSD);
      if (deltaUSD !== 0) {
        if (existing.voucherType === "SUPPLIER_PAYMENT" && existing.supplierId) {
          await tx.supplier.update({
            where: { id: existing.supplierId },
            data: {
              totalPaidUSD: { increment: deltaUSD },
              balanceUSD: { decrement: deltaUSD },
            },
          });
        }

        if (existing.voucherType === "EXPENSE_PAYMENT") {
          if (existing.vehicleStock) {
            await tx.vehicle.updateMany({
              where: { stockNumber: existing.vehicleStock },
              data: { landedCost: { increment: deltaUSD } },
            });
          }
          await tx.expense.updateMany({
            where: { receiptNum: existing.voucherNumber },
            data: { amount: nextAmountUSD },
          });
        }
      }

      if (deltaUSD !== 0 || nextPayment.paymentMethod !== existing.paymentMethod) {
        await reverseLedgerEntriesByReference(
          tx,
          existing.voucherNumber,
          "Payment voucher modified"
        );

        const { debitAccount, creditAccount } = resolveVoucherAccounts(
          nextPayment.voucherType,
          nextPayment.paymentMethod,
          Boolean(nextPayment.vehicleStock)
        );

        await createLedgerEntry(tx, {
          entryNumber: `JE-PV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          description: nextPayment.purpose || "Payment settlement",
          reference: nextPayment.voucherNumber,
          debitAccount,
          creditAccount,
          amountUSD: nextPayment.amountUSD,
          amountAFN: nextPayment.amountAFN,
        });
      }

      await recordSessionAuditEvent(tx, {
        action: "PAYMENT_UPDATED",
        entityType: "Payment",
        entityId: nextPayment.id,
        changes: {
          voucherNumber: nextPayment.voucherNumber,
          fromAmountUSD: existing.amountUSD,
          toAmountUSD: nextPayment.amountUSD,
          paymentMethod: nextPayment.paymentMethod,
        },
      });

      return nextPayment;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    const status =
      error?.message === "Voucher not found"
        ? 404
        : error?.message === "Payment amount must be greater than zero"
        ? 400
        : 500;
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update voucher" },
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
    const voucherId = body.voucherId || body.id;
    if (!voucherId) {
      return NextResponse.json(
        { success: false, error: "Voucher ID is required" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      const existing = await tx.payment.findUnique({ where: { id: voucherId } });
      if (!existing) {
        throw new Error("Voucher not found");
      }

      if (existing.voucherType === "SUPPLIER_PAYMENT" && existing.supplierId) {
        await tx.supplier.update({
          where: { id: existing.supplierId },
          data: {
            totalPaidUSD: { decrement: existing.amountUSD },
            balanceUSD: { increment: existing.amountUSD },
          },
        });
      }

      if (existing.voucherType === "EXPENSE_PAYMENT") {
        if (existing.vehicleStock) {
          await tx.vehicle.updateMany({
            where: { stockNumber: existing.vehicleStock },
            data: { landedCost: { decrement: existing.amountUSD } },
          });
        }
        await tx.expense.deleteMany({
          where: { receiptNum: existing.voucherNumber },
        });
      }

      await reverseLedgerEntriesByReference(
        tx,
        existing.voucherNumber,
        "Payment voucher voided/deleted"
      );

      await tx.payment.delete({ where: { id: voucherId } });

      await recordSessionAuditEvent(tx, {
        action: "PAYMENT_DELETED",
        entityType: "Payment",
        entityId: voucherId,
        changes: {
          voucherNumber: existing.voucherNumber,
          voucherType: existing.voucherType,
          amountUSD: existing.amountUSD,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Voucher reversed and deleted successfully",
    });
  } catch (error: any) {
    const status = error?.message === "Voucher not found" ? 404 : 500;
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete voucher" },
      { status }
    );
  }
}
