import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-auth";
import { createLedgerEntry, reverseAndDeleteJournalEntry } from "@/lib/ledger";
import { recordSessionAuditEvent } from "@/lib/audit-log";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true, data: [] });
  }
  const unauthorized = await requireApiRole(["ADMIN", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;

  try {
    const entries = await prisma.journalEntry.findMany({
      orderBy: { date: "desc" },
    });
    return NextResponse.json({ success: true, data: entries });
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

    const created = await prisma.$transaction(async (tx) => {
      const entry = await createLedgerEntry(tx, {
        entryNumber:
          body.entryNumber ||
          `JE-HRT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
        description: body.description,
        reference: body.reference || null,
        debitAccount: body.debitAccount,
        creditAccount: body.creditAccount,
        amountUSD: Number(body.amountUSD) || 0,
        amountAFN: Number(body.amountAFN) || 0,
      });

      await recordSessionAuditEvent(tx, {
        action: "JOURNAL_ENTRY_CREATED",
        entityType: "JournalEntry",
        entityId: entry.id,
        changes: {
          entryNumber: entry.entryNumber,
          debitAccount: entry.debitAccount,
          creditAccount: entry.creditAccount,
          amountUSD: entry.amountUSD,
        },
      });

      return entry;
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    console.error("Failed to create journal entry in database:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create journal entry" },
      { status: 500 }
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
    const entryId = body.entryId || body.id;
    if (!entryId) {
      return NextResponse.json(
        { success: false, error: "Entry ID is required" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      const deleted = await reverseAndDeleteJournalEntry(tx, entryId);
      await recordSessionAuditEvent(tx, {
        action: "JOURNAL_ENTRY_DELETED",
        entityType: "JournalEntry",
        entityId: entryId,
        changes: {
          entryNumber: deleted.entryNumber,
          debitAccount: deleted.debitAccount,
          creditAccount: deleted.creditAccount,
          amountUSD: deleted.amountUSD,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Journal entry reversed and deleted successfully",
    });
  } catch (error: any) {
    const status = error?.message === "Journal entry not found" ? 404 : 500;
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete journal entry" },
      { status }
    );
  }
}
