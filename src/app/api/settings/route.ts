import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { requireApiRole } from "@/lib/api-auth";
import { prisma, isDatabaseConfigured, ensureDatabaseSchemaSynced } from "@/lib/prisma";
import { recordSessionAuditEvent } from "@/lib/audit-log";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true });
  }

  await ensureDatabaseSchemaSynced();

  try {
    const settings = await prisma.dealershipSettings.findUnique({
      where: { id: "default" },
    });
    return NextResponse.json({ success: true, data: settings });
  } catch {
    return NextResponse.json({ success: false, fallback: true });
  }
}

export async function PATCH(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true });
  }
  const unauthorized = await requireApiRole(["ADMIN", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;

  await ensureDatabaseSchemaSynced();

  try {
    const session = await getServerSession(authOptions);
    const sessionRole = (session?.user as { role?: string } | undefined)?.role;
    const body = await request.json();

    if (body.branding !== undefined && sessionRole !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Only SuperAdmin may modify dealership white-label branding",
        },
        { status: 403 }
      );
    }

    const updatePayload: {
      exchangeRate?: number;
      activeBranch?: string;
      branding?: Prisma.InputJsonValue;
    } = {};

    if (body.exchangeRate !== undefined) {
      const parsedRate = Number(body.exchangeRate);
      if (!Number.isFinite(parsedRate) || parsedRate <= 0 || parsedRate > 100000) {
        return NextResponse.json(
          { success: false, error: "Exchange rate must be a positive number" },
          { status: 400 }
        );
      }
      updatePayload.exchangeRate = parsedRate;
    }

    if (body.activeBranch !== undefined && typeof body.activeBranch === "string") {
      const cleanBranch = body.activeBranch.trim();
      if (cleanBranch) {
        updatePayload.activeBranch = cleanBranch;
      }
    }

    if (body.branding !== undefined && body.branding && typeof body.branding === "object") {
      const existing = await prisma.dealershipSettings.findUnique({
        where: { id: "default" },
      });
      const prevBranding =
        existing?.branding && typeof existing.branding === "object"
          ? (existing.branding as Record<string, unknown>)
          : {};
      updatePayload.branding = {
        ...prevBranding,
        ...(body.branding as Record<string, unknown>),
      } as Prisma.InputJsonValue;
    }

    const saved = await prisma.$transaction(async (tx) => {
      const upserted = await tx.dealershipSettings.upsert({
        where: { id: "default" },
        create: {
          id: "default",
          exchangeRate: updatePayload.exchangeRate ?? 70.5,
          activeBranch: updatePayload.activeBranch ?? "Herat HQ · Bagh-e-Azadi",
          ...(updatePayload.branding !== undefined
            ? { branding: updatePayload.branding }
            : {}),
        },
        update: updatePayload,
      });

      await recordSessionAuditEvent(tx, {
        action: "SETTINGS_UPDATED",
        entityType: "DealershipSettings",
        entityId: "default",
        changes: {
          ...(updatePayload.exchangeRate !== undefined
            ? { exchangeRate: updatePayload.exchangeRate }
            : {}),
          ...(updatePayload.activeBranch !== undefined
            ? { activeBranch: updatePayload.activeBranch }
            : {}),
          ...(body.branding !== undefined
            ? { brandingFields: Object.keys(body.branding as object) }
            : {}),
        },
      });

      return upserted;
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save dealership settings" },
      { status: 500 }
    );
  }
}
