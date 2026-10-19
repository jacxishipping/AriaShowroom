import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureChartOfAccounts } from "@/lib/ledger";
import { requireApiRole } from "@/lib/api-auth";

export async function GET() {
  const unauthorized = await requireApiRole(["ADMIN", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;

  try {
    const accounts = await prisma.$transaction(async (tx) => {
      await ensureChartOfAccounts(tx);
      return tx.account.findMany({ orderBy: { code: "asc" } });
    });

    return NextResponse.json({ success: true, data: accounts });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}