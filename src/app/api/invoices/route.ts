import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-auth";
import {
  createLedgerEntry,
  reverseLedgerEntriesByReference,
  roundCurrency,
} from "@/lib/ledger";
import { recordSessionAuditEvent } from "@/lib/audit-log";

function resolveInvoicePaymentAccount(
  status: string,
  paymentMethod: string
): string {
  if (status !== "Paid") {
    return "1050 - Accounts Receivable (Customer Installments)";
  }
  const lower = String(paymentMethod || "").toLowerCase();
  if (lower.includes("bank")) {
    return "1030 - Azizi Bank Commercial USD Account";
  }
  if (lower.includes("sarrafi") || lower.includes("hawala")) {
    return "1020 - Sarrafi Khorasan Holding Account";
  }
  return "1010 - Showroom Central Cash Safe";
}

async function postInvoiceLedgerEntries(
  tx: Prisma.TransactionClient,
  invoice: {
    invoiceNumber: string;
    vehicleStock: string | null;
    customerTazkira: string | null;
    subtotalUSD: number;
    customsFeeUSD: number;
    registrationFeeUSD: number;
    discountUSD: number;
    totalUSD: number;
    exchangeRate: number;
    status: string;
    paymentMethod: string;
    issueDate: Date;
  }
) {
  const totalUSD = roundCurrency(Number(invoice.totalUSD));
  const recordedSale =
    invoice.vehicleStock && invoice.customerTazkira
      ? await tx.sale.findFirst({
          where: {
            vehicle: { stockNumber: invoice.vehicleStock },
            customer: { tazkiraNumber: invoice.customerTazkira },
          },
        })
      : null;

  const baseRevenueUSD = recordedSale
    ? 0
    : roundCurrency(
        Math.max(Number(invoice.subtotalUSD) - Number(invoice.discountUSD), 0)
      );
  const feesUSD = recordedSale
    ? roundCurrency(
        Math.max(
          Number(invoice.customsFeeUSD) +
            Number(invoice.registrationFeeUSD) -
            Number(invoice.discountUSD),
          0
        )
      )
    : roundCurrency(Math.max(totalUSD - baseRevenueUSD, 0));

  const paymentAccount = resolveInvoicePaymentAccount(
    invoice.status,
    invoice.paymentMethod
  );

  if (baseRevenueUSD > 0) {
    await createLedgerEntry(tx, {
      entryNumber: `JE-INV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      date: invoice.issueDate,
      description: `Invoice ${invoice.invoiceNumber}`,
      reference: invoice.invoiceNumber,
      debitAccount: paymentAccount,
      creditAccount: "4010 - Vehicle Sales Revenue",
      amountUSD: baseRevenueUSD,
      amountAFN: Math.round(baseRevenueUSD * invoice.exchangeRate),
    });
  }

  if (feesUSD > 0) {
    await createLedgerEntry(tx, {
      entryNumber: `JE-FEE-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      date: invoice.issueDate,
      description: `Fees on invoice ${invoice.invoiceNumber}`,
      reference: invoice.invoiceNumber,
      debitAccount: paymentAccount,
      creditAccount: "4020 - Documentation & Transfer Fee Income",
      amountUSD: feesUSD,
      amountAFN: Math.round(feesUSD * invoice.exchangeRate),
    });
  }
}

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true, data: [] });
  }
  const unauthorized = await requireApiRole(["ADMIN", "SALES", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;

  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: invoices });
  } catch {
    return NextResponse.json({ success: false, fallback: true, data: [] });
  }
}

export async function POST(req: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true });
  }
  const unauthorized = await requireApiRole(["ADMIN", "SALES", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();

    const created = await prisma.$transaction(async (tx) => {
      const exchangeRate = Number(body.exchangeRate) || 70.5;
      const totalUSD = roundCurrency(Number(body.totalUSD) || 0);
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber:
            body.invoiceNumber ||
            `INV-HRT-${Date.now().toString().slice(-6)}-${Math.floor(10 + Math.random() * 90)}`,
          customerId: body.customerId || null,
          customerName: body.customerName,
          customerPhone: body.customerPhone,
          customerTazkira: body.customerTazkira || null,
          customerAddress: body.customerAddress || null,
          vehicleStock: body.vehicleStock || null,
          vehicleDesc: body.vehicleDesc || null,
          vin: body.vin || null,
          items: body.items || [],
          subtotalUSD: roundCurrency(Number(body.subtotalUSD) || 0),
          customsFeeUSD: roundCurrency(Number(body.customsFeeUSD) || 0),
          registrationFeeUSD: roundCurrency(Number(body.registrationFeeUSD) || 0),
          discountUSD: roundCurrency(Number(body.discountUSD) || 0),
          totalUSD,
          totalAFN: Number(body.totalAFN) || Math.round(totalUSD * exchangeRate),
          exchangeRate,
          status: body.status || "Paid",
          paymentMethod: body.paymentMethod || "Cash",
          issueDate: body.issueDate ? new Date(body.issueDate) : undefined,
          dueDate: body.dueDate ? new Date(body.dueDate) : null,
          notes: body.notes || null,
        },
      });

      await postInvoiceLedgerEntries(tx, invoice);

      await recordSessionAuditEvent(tx, {
        action: "INVOICE_CREATED",
        entityType: "Invoice",
        entityId: invoice.id,
        changes: {
          invoiceNumber: invoice.invoiceNumber,
          totalUSD: invoice.totalUSD,
          status: invoice.status,
        },
      });
      return invoice;
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    console.error("Failed to create invoice in database:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create invoice" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const unauthorized = await requireApiRole(["ADMIN", "SALES", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true });
  }

  try {
    const body = await req.json();
    const invoiceId = body.invoiceId || body.id;
    if (!invoiceId) {
      return NextResponse.json(
        { success: false, error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    const allowedStatuses = ["Paid", "Partially Paid", "Draft", "Overdue"];
    if (body.status !== undefined && !allowedStatuses.includes(body.status)) {
      return NextResponse.json(
        { success: false, error: "Invalid invoice status" },
        { status: 400 }
      );
    }

    const invoice = await prisma.$transaction(async (tx) => {
      const existing = await tx.invoice.findUnique({ where: { id: invoiceId } });
      if (!existing) throw new Error("Invoice not found");

      const nextStatus = body.status !== undefined ? String(body.status) : existing.status;
      if (existing.status === "Paid" && nextStatus !== "Paid") {
        throw new Error(
          "A paid invoice cannot be reopened without a reversal transaction"
        );
      }

      const nextExchangeRate =
        body.exchangeRate !== undefined
          ? Number(body.exchangeRate) || 70.5
          : existing.exchangeRate;
      const nextTotalUSD =
        body.totalUSD !== undefined
          ? roundCurrency(Number(body.totalUSD))
          : roundCurrency(existing.totalUSD);

      const updateData: Record<string, unknown> = { status: nextStatus };
      if (body.customerName !== undefined) updateData.customerName = body.customerName;
      if (body.customerPhone !== undefined) updateData.customerPhone = body.customerPhone;
      if (body.customerTazkira !== undefined) updateData.customerTazkira = body.customerTazkira || null;
      if (body.customerAddress !== undefined) updateData.customerAddress = body.customerAddress || null;
      if (body.vehicleStock !== undefined) updateData.vehicleStock = body.vehicleStock || null;
      if (body.vehicleDesc !== undefined) updateData.vehicleDesc = body.vehicleDesc || null;
      if (body.vin !== undefined) updateData.vin = body.vin || null;
      if (body.items !== undefined) updateData.items = body.items;
      if (body.subtotalUSD !== undefined) updateData.subtotalUSD = roundCurrency(Number(body.subtotalUSD));
      if (body.customsFeeUSD !== undefined) updateData.customsFeeUSD = roundCurrency(Number(body.customsFeeUSD));
      if (body.registrationFeeUSD !== undefined) {
        updateData.registrationFeeUSD = roundCurrency(Number(body.registrationFeeUSD));
      }
      if (body.discountUSD !== undefined) updateData.discountUSD = roundCurrency(Number(body.discountUSD));
      if (body.totalUSD !== undefined || body.exchangeRate !== undefined) {
        updateData.totalUSD = nextTotalUSD;
        updateData.exchangeRate = nextExchangeRate;
        updateData.totalAFN =
          body.totalAFN !== undefined
            ? Number(body.totalAFN)
            : Math.round(nextTotalUSD * nextExchangeRate);
      }
      if (body.paymentMethod !== undefined) updateData.paymentMethod = body.paymentMethod;
      if (body.dueDate !== undefined) {
        updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
      }
      if (body.notes !== undefined) updateData.notes = body.notes || null;

      const financialsChanged =
        nextTotalUSD !== roundCurrency(existing.totalUSD) ||
        (body.subtotalUSD !== undefined &&
          roundCurrency(Number(body.subtotalUSD)) !== roundCurrency(existing.subtotalUSD)) ||
        (body.customsFeeUSD !== undefined &&
          roundCurrency(Number(body.customsFeeUSD)) !== roundCurrency(existing.customsFeeUSD)) ||
        (body.registrationFeeUSD !== undefined &&
          roundCurrency(Number(body.registrationFeeUSD)) !==
            roundCurrency(existing.registrationFeeUSD)) ||
        (body.discountUSD !== undefined &&
          roundCurrency(Number(body.discountUSD)) !== roundCurrency(existing.discountUSD)) ||
        (body.paymentMethod !== undefined && body.paymentMethod !== existing.paymentMethod);

      if (financialsChanged) {
        const updatedRecord = await tx.invoice.update({
          where: { id: invoiceId },
          data: updateData,
        });
        await reverseLedgerEntriesByReference(
          tx,
          existing.invoiceNumber,
          "Invoice modified"
        );
        await postInvoiceLedgerEntries(tx, updatedRecord);
      } else if (nextStatus === "Paid" && existing.status !== "Paid") {
        const updatedCount = await tx.invoice.updateMany({
          where: { id: invoiceId, status: { not: "Paid" } },
          data: updateData,
        });
        if (updatedCount.count !== 1) {
          throw new Error("Invoice status changed concurrently; reload and try again");
        }

        const debitAccount = resolveInvoicePaymentAccount(
          "Paid",
          String(updateData.paymentMethod ?? existing.paymentMethod)
        );

        if (existing.totalUSD > 0) {
          await createLedgerEntry(tx, {
            entryNumber: `JE-INV-SETTLE-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
            description: `Settlement of invoice ${existing.invoiceNumber}`,
            reference: existing.invoiceNumber,
            debitAccount,
            creditAccount: "1050 - Accounts Receivable (Customer Installments)",
            amountUSD: existing.totalUSD,
            amountAFN: existing.totalAFN,
          });
        }
      } else {
        await tx.invoice.update({
          where: { id: invoiceId },
          data: updateData,
        });
      }

      const updated = await tx.invoice.findUniqueOrThrow({ where: { id: invoiceId } });
      await recordSessionAuditEvent(tx, {
        action:
          existing.status !== updated.status
            ? "INVOICE_STATUS_CHANGED"
            : "INVOICE_UPDATED",
        entityType: "Invoice",
        entityId: updated.id,
        changes: {
          invoiceNumber: updated.invoiceNumber,
          status: { from: existing.status, to: updated.status },
          totalUSD: { from: existing.totalUSD, to: updated.totalUSD },
        },
      });
      return updated;
    });

    return NextResponse.json({ success: true, data: invoice });
  } catch (error: any) {
    const status = error?.message === "Invoice not found" ? 404 : 500;
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update invoice" },
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
    const invoiceId = body.invoiceId || body.id;
    if (!invoiceId) {
      return NextResponse.json(
        { success: false, error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      const existing = await tx.invoice.findUnique({ where: { id: invoiceId } });
      if (!existing) {
        throw new Error("Invoice not found");
      }

      await reverseLedgerEntriesByReference(
        tx,
        existing.invoiceNumber,
        "Invoice voided/deleted"
      );

      await tx.invoice.delete({ where: { id: invoiceId } });

      await recordSessionAuditEvent(tx, {
        action: "INVOICE_DELETED",
        entityType: "Invoice",
        entityId: invoiceId,
        changes: {
          invoiceNumber: existing.invoiceNumber,
          totalUSD: existing.totalUSD,
          status: existing.status,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Invoice reversed and deleted successfully",
    });
  } catch (error: any) {
    const status = error?.message === "Invoice not found" ? 404 : 500;
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete invoice" },
      { status }
    );
  }
}
