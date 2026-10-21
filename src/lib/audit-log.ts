import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type AuditSqlClient = Pick<typeof prisma, "$executeRaw">;

interface AuditEvent {
  actorId: string | null;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, unknown>;
}

export async function recordSessionAuditEvent(
  client: AuditSqlClient,
  event: Omit<AuditEvent, "actorId" | "actorEmail">
) {
  const session = await getServerSession(authOptions);
  const actorId = session?.user?.id;
  const actorEmail = session?.user?.email;
  if (!actorId || !actorEmail) {
    throw new Error("Authenticated audit actor is required");
  }
  await recordAuditEvent(client, { ...event, actorId, actorEmail });
}

export async function recordAuditEvent(client: AuditSqlClient, event: AuditEvent) {
  const id = randomUUID();
  const changes = event.changes ? JSON.stringify(event.changes) : null;
  await client.$executeRaw`
    INSERT INTO "AuditLog" (id, "actorId", "actorEmail", "action", "entityType", "entityId", "changes")
    VALUES (${id}, ${event.actorId}, ${event.actorEmail}, ${event.action}, ${event.entityType}, ${event.entityId}, ${changes}::jsonb)
  `;
}
