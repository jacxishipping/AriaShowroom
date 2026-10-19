import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
  callbacks: {
    authorized: ({ req, token }) => {
      if (!token) return false;
      if (req.nextUrl.pathname.startsWith("/accounting")) {
        return token.role === "ADMIN" || token.role === "ACCOUNTANT";
      }
      return true;
    },
  },
});

export const config = {
  matcher: [
    "/accounting/:path*",
    "/admin/:path*",
    "/intake/:path*",
    "/logistics/:path*",
    "/scanner/:path*",
    "/vehicles/:id/deed/:path*",
    "/vehicles/:id/settlement/:path*",
  ],
};