import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Sadozai Dealership Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@sadozaimotors.af" },
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
        const passwordState = await prisma.$queryRaw<{ passwordChangeRequired: boolean }[]>`
          SELECT "passwordChangeRequired" FROM "User" WHERE id = ${user.id}
        `;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone || undefined,
          mustChangePassword: passwordState[0]?.passwordChangeRequired ?? false,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "SALES";
        token.phone = (user as any).phone;
        token.mustChangePassword = (user as any).mustChangePassword ?? false;
      }
      if (token.id) {
        const passwordState = await prisma.$queryRaw<
          { passwordChangeRequired: boolean }[]
        >`
          SELECT "passwordChangeRequired" FROM "User" WHERE id = ${token.id}
        `;
        token.mustChangePassword =
          passwordState[0]?.passwordChangeRequired ?? token.mustChangePassword ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).phone = token.phone as string;
        session.user.mustChangePassword = token.mustChangePassword === true;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
