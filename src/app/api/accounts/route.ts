import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { ensureChartOfAccounts } from "@/lib/ledger";
import { requireApiRole } from "@/lib/api-auth";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true, data: [] });
  }
  const unauthorized = await requireApiRole(["ADMIN", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;

  try {
    const accounts = await prisma.$transaction(async (tx) => {
      await ensureChartOfAccounts(tx);
      return tx.account.findMany({ orderBy: { code: "asc" } });
    });

    return NextResponse.json({ success: true, data: accounts });
  } catch {
    return NextResponse.json({ success: false, fallback: true, data: [] });
  }
}