import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-auth";
import { createLedgerEntry } from "@/lib/ledger";
import { recordSessionAuditEvent } from "@/lib/audit-log";

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
      const invoice = await tx.invoice.create({
        data: {
        invoiceNumber: body.invoiceNumber || `INV-HRT-${Date.now().toString().slice(-6)}`,
        customerId: body.customerId || null,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        customerTazkira: body.customerTazkira || null,
        customerAddress: body.customerAddress || null,
        vehicleStock: body.vehicleStock || null,
        vehicleDesc: body.vehicleDesc || null,
        vin: body.vin || null,
        items: body.items || [],
        subtotalUSD: Number(body.subtotalUSD) || 0,
        customsFeeUSD: Number(body.customsFeeUSD) || 0,
        registrationFeeUSD: Number(body.registrationFeeUSD) || 0,
        discountUSD: Number(body.discountUSD) || 0,
        totalUSD: Number(body.totalUSD) || 0,
        totalAFN: Number(body.totalAFN) || 0,
        exchangeRate: Number(body.exchangeRate) || 70.5,
        status: body.status || "Paid",
        paymentMethod: body.paymentMethod || "Cash",
        issueDate: body.issueDate ? new Date(body.issueDate) : undefined,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
          notes: body.notes || null,
        },
      });

      const totalUSD = Number(invoice.totalUSD);
      const recordedSale = invoice.vehicleStock && invoice.customerTazkira
        ? await tx.sale.findFirst({
            where: {
              vehicle: { stockNumber: invoice.vehicleStock },
              customer: { tazkiraNumber: invoice.customerTazkira },
            },
          })
        : null;
      const baseRevenueUSD = recordedSale
        ? 0
        : Math.max(Number(invoice.subtotalUSD) - Number(invoice.discountUSD), 0);
      const feesUSD = recordedSale
        ? Math.max(Number(invoice.customsFeeUSD) + Number(invoice.registrationFeeUSD) - Number(invoice.discountUSD), 0)
        : Math.max(totalUSD - baseRevenueUSD, 0);
      const paymentAccount = invoice.status === "Paid"
        ? String(invoice.paymentMethod).toLowerCase().includes("bank")
          ? "1030 - Azizi Bank Commercial USD Account"
          : String(invoice.paymentMethod).toLowerCase().includes("sarrafi")
          ? "1020 - Sarrafi Khorasan Holding Account"
          : "1010 - Showroom Central Cash Safe"
        : "1050 - Accounts Receivable (Customer Installments)";

      if (baseRevenueUSD > 0) {
        await createLedgerEntry(tx, {
          entryNumber: `JE-INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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
          entryNumber: `JE-FEE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          date: invoice.issueDate,
          description: `Fees on invoice ${invoice.invoiceNumber}`,
          reference: invoice.invoiceNumber,
          debitAccount: paymentAccount,
          creditAccount: "4020 - Documentation & Transfer Fee Income",
          amountUSD: feesUSD,
          amountAFN: Math.round(feesUSD * invoice.exchangeRate),
        });
      }

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

  try {
    const body = await req.json();
    const allowedStatuses = ["Paid", "Partially Paid", "Draft", "Overdue"];
    if (!body.invoiceId || !allowedStatuses.includes(body.status)) {
      return NextResponse.json(
        { success: false, error: "Invoice ID and a valid status are required" },
        { status: 400 }
      );
    }

    const invoice = await prisma.$transaction(async (tx) => {
      const existing = await tx.invoice.findUnique({ where: { id: body.invoiceId } });
      if (!existing) throw new Error("Invoice not found");
      if (existing.status === "Paid" && body.status !== "Paid") {
        throw new Error("A paid invoice cannot be reopened without a reversal transaction");
      }

      if (body.status === "Paid" && existing.status !== "Paid") {
        const updated = await tx.invoice.updateMany({
          where: { id: body.invoiceId, status: { not: "Paid" } },
          data: { status: "Paid" },
        });
        if (updated.count !== 1) throw new Error("Invoice status changed concurrently; reload and try again");

        const paymentMethod = existing.paymentMethod.toLowerCase();
        const debitAccount = paymentMethod.includes("bank")
          ? "1030 - Azizi Bank Commercial USD Account"
          : paymentMethod.includes("sarrafi") || paymentMethod.includes("hawala")
          ? "1020 - Sarrafi Khorasan Holding Account"
          : "1010 - Showroom Central Cash Safe";

        await createLedgerEntry(tx, {
          entryNumber: `JE-INV-SETTLE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          description: `Settlement of invoice ${existing.invoiceNumber}`,
          reference: existing.invoiceNumber,
          debitAccount,
          creditAccount: "1050 - Accounts Receivable (Customer Installments)",
          amountUSD: existing.totalUSD,
          amountAFN: existing.totalAFN,
        });
      } else {
        await tx.invoice.update({
          where: { id: body.invoiceId },
          data: { status: body.status },
        });
      }

      const updated = await tx.invoice.findUniqueOrThrow({ where: { id: body.invoiceId } });
      await recordSessionAuditEvent(tx, {
        action: "INVOICE_STATUS_CHANGED",
        entityType: "Invoice",
        entityId: updated.id,
        changes: { status: { from: existing.status, to: updated.status } },
      });
      return updated;
    });
    return NextResponse.json({ success: true, data: invoice });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update invoice" },
      { status: 500 }
    );
  }
}
