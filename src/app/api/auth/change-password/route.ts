import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/audit-log";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const email = session?.user?.email;
  if (!userId || !email) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, error: "Database is not configured" }, { status: 503 });
  }

  const body = await request.json();
  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
  if (newPassword.length < 12) {
    return NextResponse.json(
      { success: false, error: "New password must be at least 12 characters" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, passwordHash: true },
  });
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    return NextResponse.json(
      { success: false, error: "Current password is incorrect" },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  try {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        UPDATE "User"
        SET "passwordHash" = ${passwordHash}, "passwordChangeRequired" = false, "updatedAt" = NOW()
        WHERE id = ${user.id}
      `;
      await recordAuditEvent(tx, {
        actorId: user.id,
        actorEmail: email,
        action: "PASSWORD_CHANGED",
        entityType: "User",
        entityId: user.id,
        changes: { passwordChangeRequired: false },
      });
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to change password" },
      { status: 500 }
    );
  }
}
