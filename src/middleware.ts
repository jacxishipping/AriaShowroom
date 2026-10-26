import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(request) {
    const { pathname } = request.nextUrl;
    const token = request.nextauth.token;
    const role = token?.role;

    if (token?.mustChangePassword && pathname !== "/account/security/password") {
      return NextResponse.redirect(
        new URL("/account/security/password?forced=1", request.url)
      );
    }

    if (pathname.startsWith("/accounting") || pathname.startsWith("/reports")) {
      if (role !== "ADMIN" && role !== "ACCOUNTANT") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    if (
      pathname.startsWith("/intake") ||
      pathname.startsWith("/inventory/import") ||
      pathname.startsWith("/admin/users") ||
      pathname.startsWith("/admin/audit")
    ) {
      if (role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  },
  {
    pages: { signIn: "/login" },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      authorized: ({ token }) => Boolean(token),
    },
  }
);

export const config = {
  matcher: [
    "/",
    "/inventory/:path*",
    "/compare/:path*",
    "/accounting/:path*",
    "/account/security/:path*",
    "/admin/:path*",
    "/reports/:path*",
    "/history/:path*",
    "/intake/:path*",
    "/logistics/:path*",
    "/scanner/:path*",
    "/settings/:path*",
    "/vehicles/:path*",
  ],
};
