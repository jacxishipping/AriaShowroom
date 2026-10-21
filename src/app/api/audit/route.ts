import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

interface AuditRow {
  id: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: unknown;
  createdAt: Date;
}

export async function GET(request: Request) {
  const unauthorized = await requireApiRole(["ADMIN", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, error: "Database is not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const fromValue = searchParams.get("from");
  const toValue = searchParams.get("to");
  const from = fromValue ? new Date(fromValue) : new Date(Date.now() - 30 * 86400000);
  const to = toValue ? new Date(toValue) : new Date();
  if (!Number.isFinite(from.getTime()) || !Number.isFinite(to.getTime()) || from > to) {
    return NextResponse.json({ success: false, error: "Invalid audit date range" }, { status: 400 });
  }

  try {
    const rows = await prisma.$queryRaw<AuditRow[]>`
      SELECT id, "actorEmail", action, "entityType", "entityId", changes, "createdAt"
      FROM "AuditLog"
      WHERE "createdAt" >= ${from} AND "createdAt" <= ${to}
      ORDER BY "createdAt" DESC
      LIMIT 500
    `;
    return NextResponse.json({ success: true, data: rows });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to load audit history; apply the latest database schema first" },
      { status: 500 }
    );
  }
}
