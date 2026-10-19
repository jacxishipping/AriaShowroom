import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "sadozai-motors-herat-erp-secret-key-2026",
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

        // 1. Check in PostgreSQL database via Prisma if configured
        if (isDatabaseConfigured()) {
          try {
            const user = await prisma.user.findUnique({
              where: { email },
            });

            if (user) {
              const isValid = await bcrypt.compare(credentials.password, user.passwordHash).catch(() => false);

              if (!isValid) {
                return null;
              }

              return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone || undefined,
              };
            }
          } catch {
            // Fall back to verified seed profiles when database is unreachable
          }
        }

        // 2. Demo fallback accounts for immediate offline/test access
        const demoUsers = [
          {
            id: "usr-admin-01",
            name: "Haji Ahmad Shah Sadozai",
            email: "admin@sadozaimotors.af",
            role: "ADMIN",
            phone: "+93 79 910 2030",
          },
          {
            id: "usr-sales-02",
            name: "Farhad Timori",
            email: "sales@sadozaimotors.af",
            role: "SALES",
            phone: "+93 70 245 8890",
          },
          {
            id: "usr-acct-03",
            name: "Mirwais Saljuqi",
            email: "finance@sadozaimotors.af",
            role: "ACCOUNTANT",
            phone: "+93 78 611 4400",
          },
        ];

        const demoUser = demoUsers.find((u) => u.email === email);
        if (demoUser && (credentials.password === "password123" || credentials.password === "admin123")) {
          return demoUser;
        }

        throw new Error("Invalid email or password");
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "SALES";
        token.phone = (user as any).phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).phone = token.phone as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
