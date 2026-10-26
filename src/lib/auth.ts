import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

const PASSWORD_STATE_TTL_MS = 15_000;

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Aria Motors Dealership Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@ariamotors.af" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email and password");
        }

        const email = credentials.email.toLowerCase().trim();

        if (!isDatabaseConfigured()) {
          throw new Error("Database authentication is unavailable");
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (
          !user ||
          credentials.password === "password123" ||
          credentials.password === "admin123" ||
          !(await bcrypt.compare(credentials.password, user.passwordHash))
        ) {
          return null;
        }

        let mustChangePassword = Boolean(user.passwordChangeRequired);
        try {
          const passwordState = await prisma.$queryRaw<{ passwordChangeRequired: boolean }[]>`
            SELECT "passwordChangeRequired" FROM "User" WHERE id = ${user.id}
          `;
          mustChangePassword = passwordState[0]?.passwordChangeRequired ?? mustChangePassword;
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

      const lastChecked = Number((token as { passwordCheckedAt?: number }).passwordCheckedAt || 0);
      if (token.id && isDatabaseConfigured() && now - lastChecked > PASSWORD_STATE_TTL_MS) {
        try {
          const passwordState = await prisma.$queryRaw<
            { passwordChangeRequired: boolean }[]
          >`
            SELECT "passwordChangeRequired" FROM "User" WHERE id = ${token.id}
          `;
          token.mustChangePassword =
            passwordState[0]?.passwordChangeRequired ?? token.mustChangePassword ?? false;
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
        (session.user as { phone?: string }).phone = token.phone as string;
        session.user.mustChangePassword = token.mustChangePassword === true;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
