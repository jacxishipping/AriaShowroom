import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/audit-log";
import { requireApiRole } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const unauthorized = await requireApiRole(["ADMIN"]);
  if (unauthorized) return unauthorized;
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, error: "Database is not configured" }, { status: 503 });
  }

  const session = await getServerSession(authOptions);
  const actorId = session?.user?.id;
  const actorEmail = session?.user?.email;
  if (!actorId || !actorEmail) {
    return NextResponse.json({ success: false, error: "Authenticated administrator required" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true },
  });
  if (!user) {
    return NextResponse.json({ success: false, error: "Staff account not found" }, { status: 404 });
  }

  const temporaryPassword = randomBytes(24).toString("base64url");
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        UPDATE "User"
        SET "passwordHash" = ${passwordHash}, "passwordChangeRequired" = true, "updatedAt" = NOW()
        WHERE id = ${user.id}
      `;
      await recordAuditEvent(tx, {
        actorId,
        actorEmail,
        action: "PASSWORD_RESET_ISSUED",
        entityType: "User",
        entityId: user.id,
        changes: { passwordChangeRequired: true },
      });
    });
    return NextResponse.json({ success: true, temporaryPassword });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to reset this account password" },
      { status: 500 }
    );
  }
}
