import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  schemaSynced: boolean | undefined;
};

export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL?.trim();
  return Boolean(url && (url.startsWith("postgresql://") || url.startsWith("postgres://")));
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Ensures any schema columns or singleton tables added in recent features exist
 * in the PostgreSQL database if provisioned prior to running `prisma migrate deploy`.
 * Safe, non-destructive, idempotent, and runs at most once per application runtime.
 */
export async function ensureDatabaseSchemaSynced(): Promise<void> {
  if (!isDatabaseConfigured() || globalForPrisma.schemaSynced) return;
  try {
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "yardLocation" TEXT DEFAULT 'Main Showroom - Bagh-e-Azadi';
        ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "viewsCount" INTEGER DEFAULT 0;
        ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "inquiriesCount" INTEGER DEFAULT 0;
        ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "statusChangedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "budget" DOUBLE PRECISION DEFAULT 0;
        ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "interestedInVehicleId" TEXT;
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordChangeRequired" BOOLEAN DEFAULT false;
        CREATE TABLE IF NOT EXISTS "DealershipSettings" (
          "id" TEXT NOT NULL DEFAULT 'default',
          "exchangeRate" DOUBLE PRECISION NOT NULL DEFAULT 70.5,
          "activeBranch" TEXT NOT NULL DEFAULT 'Herat HQ · Bagh-e-Azadi',
          "branding" JSONB,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "DealershipSettings_pkey" PRIMARY KEY ("id")
        );
      EXCEPTION
        WHEN OTHERS THEN NULL;
      END $$;
    `);
    globalForPrisma.schemaSynced = true;
  } catch {
    // If database connection is unavailable or DDL permissions restricted, ignore gracefully
  }
}
