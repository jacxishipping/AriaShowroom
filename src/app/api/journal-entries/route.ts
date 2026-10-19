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

    const created = await prisma.$transaction((tx) => createLedgerEntry(tx, {
        entryNumber: body.entryNumber || `JE-HRT-${Date.now().toString().slice(-6)}`,
        description: body.description,
        reference: body.reference || null,
        debitAccount: body.debitAccount,
        creditAccount: body.creditAccount,
        amountUSD: Number(body.amountUSD) || 0,
        amountAFN: Number(body.amountAFN) || 0,
    }));

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    console.error("Failed to create journal entry in database:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create journal entry" },
      { status: 500 }
    );
  }
}
