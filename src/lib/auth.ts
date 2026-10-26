import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { checkRateLimit, resetRateLimit, getClientIp } from "@/lib/rate-limit";

const PASSWORD_STATE_TTL_MS = 15_000;
const LOGIN_MAX_ATTEMPTS = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Dealership Staff Login",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "admin@ariamotors.af",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();
        const clientIp = getClientIp(req?.headers);
        const rateLimitKey = `auth:${clientIp}:${normalizedEmail}`;
        const rateCheck = checkRateLimit(
          rateLimitKey,
          LOGIN_MAX_ATTEMPTS,
          LOGIN_WINDOW_MS
        );
        if (!rateCheck.allowed) {
          throw new Error(
            `Too many sign-in attempts. Please wait ${rateCheck.retryAfterSeconds} seconds before trying again.`
          );
        }

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user) {
          throw new Error("Invalid staff email or password");
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error("Invalid staff email or password");
        }

        resetRateLimit(rateLimitKey);

        let mustChangePassword = Boolean(
          (user as { passwordChangeRequired?: boolean }).passwordChangeRequired
        );
        try {
          const passwordState = await prisma.$queryRaw<
            { passwordChangeRequired: boolean }[]
          >`
            SELECT "passwordChangeRequired" FROM "User" WHERE id = ${user.id}
          `;
          mustChangePassword =
            passwordState[0]?.passwordChangeRequired ?? mustChangePassword;
        } catch {
          // Fallback to Prisma model field if raw query fails
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone || undefined,
          mustChangePassword,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const now = Date.now();
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: UserRole }).role || UserRole.SALES;
        token.phone = (user as { phone?: string }).phone;
        token.mustChangePassword = Boolean(
          (user as { mustChangePassword?: boolean }).mustChangePassword
        );
        (token as { passwordCheckedAt?: number }).passwordCheckedAt = now;
        return token;
      }

      const lastChecked = Number(
        (token as { passwordCheckedAt?: number }).passwordCheckedAt || 0
      );
      if (
        token.id &&
        isDatabaseConfigured() &&
        now - lastChecked > PASSWORD_STATE_TTL_MS
      ) {
        try {
          const passwordState = await prisma.$queryRaw<
            { passwordChangeRequired: boolean }[]
          >`
            SELECT "passwordChangeRequired" FROM "User" WHERE id = ${token.id}
          `;
          token.mustChangePassword =
            passwordState[0]?.passwordChangeRequired ??
            token.mustChangePassword ??
            false;
          (token as { passwordCheckedAt?: number }).passwordCheckedAt = now;
        } catch {
          // Retain cached token state on transient database connection errors
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { phone?: string }).phone = token.phone as
          | string
          | undefined;
        (session.user as { mustChangePassword?: boolean }).mustChangePassword =
          Boolean(token.mustChangePassword);
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
