-- ==============================================================================
-- Aria Showroom (Herat) - Database Schema Sync Script
-- Use this script if your PostgreSQL database is missing columns (e.g. yardLocation)
-- Run in pgAdmin, psql, Supabase SQL Editor, Neon Console, or Railway Query tab.
-- Alternatively, execute: npx prisma db push
-- ==============================================================================

-- 1. Vehicle Table: yardLocation, viewsCount, inquiriesCount, statusChangedAt
ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "yardLocation" TEXT DEFAULT 'Main Showroom - Bagh-e-Azadi';
ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "viewsCount" INTEGER DEFAULT 0;
ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "inquiriesCount" INTEGER DEFAULT 0;
ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "statusChangedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Customer Table: budget, interestedInVehicleId
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "budget" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "interestedInVehicleId" TEXT;

-- 3. User Table: passwordChangeRequired
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordChangeRequired" BOOLEAN DEFAULT false;

-- 4. AuditLog Table (if not already created)
CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT PRIMARY KEY,
  "actorId" TEXT,
  "actorEmail" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "changes" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

