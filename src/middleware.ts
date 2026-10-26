import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(request) {
    if (
      request.nextauth.token?.mustChangePassword &&
      request.nextUrl.pathname !== "/account/security/password"
    ) {
      return NextResponse.redirect(
        new URL("/account/security/password?forced=1", request.url)
      );
    }
  },
  {
    pages: { signIn: "/login" },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      authorized: ({ req, token }) => {
        if (!token) return false;
        if (req.nextUrl.pathname.startsWith("/accounting")) {
          return token.role === "ADMIN" || token.role === "ACCOUNTANT";
        }
        if (req.nextUrl.pathname.startsWith("/reports")) {
          return token.role === "ADMIN" || token.role === "ACCOUNTANT";
        }
        return true;
      },
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
