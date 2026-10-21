import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export type ApiRole = "ADMIN" | "SALES" | "ACCOUNTANT";

export async function requireApiRole(allowedRoles: ApiRole[]) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  if (session.user.mustChangePassword) {
    return NextResponse.json(
      { success: false, error: "Change your temporary password before continuing" },
      { status: 403 }
    );
  }

  const role = (session.user as typeof session.user & { role?: ApiRole }).role;
  if (!role || !allowedRoles.includes(role)) {
    return NextResponse.json(
      { success: false, error: "Insufficient permissions" },
      { status: 403 }
    );
  }

  return null;
}