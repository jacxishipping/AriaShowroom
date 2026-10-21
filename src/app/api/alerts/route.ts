import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-auth";

export const dynamic = "force-dynamic";
const ALERT_AFTER_DAYS = 30;

export async function GET() {
  const unauthorized = await requireApiRole(["ADMIN", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, error: "Database is not configured" }, { status: 503 });
  }

  const cutoff = new Date(Date.now() - ALERT_AFTER_DAYS * 24 * 60 * 60 * 1000);
  try {
    const [transit, followUps, installments] = await Promise.all([
      prisma.$queryRaw<
        { id: string; stockNumber: string; make: string; model: string; statusChangedAt: Date }[]
      >`
        SELECT id, "stockNumber", make, model, "statusChangedAt"
        FROM "Vehicle"
        WHERE status = 'IN_TRANSIT' AND "statusChangedAt" <= ${cutoff}
        ORDER BY "statusChangedAt" ASC
        LIMIT 100
      `,
      prisma.$queryRaw<
        { id: string; fullName: string; phone: string; leadStage: string; updatedAt: Date }[]
      >`
        SELECT id, "fullName", phone, "leadStage", "updatedAt"
        FROM "Customer"
        WHERE "leadStage" NOT IN ('CLOSED_WON', 'LOST') AND "updatedAt" <= ${cutoff}
        ORDER BY "updatedAt" ASC
        LIMIT 100
      `,
      prisma.$queryRaw<
        { id: string; dueDate: Date; amount: number; contractNumber: string; customerName: string }[]
      >`
        SELECT i.id, i."dueDate", i.amount, s."contractNumber", c."fullName" AS "customerName"
        FROM "InstallmentPayment" i
        INNER JOIN "Sale" s ON s.id = i."saleId"
        INNER JOIN "Customer" c ON c.id = s."customerId"
        WHERE i.status = 'PENDING' AND i."dueDate" <= NOW()
        ORDER BY i."dueDate" ASC
        LIMIT 100
      `,
    ]);
    return NextResponse.json({
      success: true,
      data: { transit, followUps, installments },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to load workflow alerts; apply the latest database schema first" },
      { status: 500 }
    );
  }
}
