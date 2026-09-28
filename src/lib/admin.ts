import { ObjectId, Db } from "mongodb";
import { getSession, SessionUser } from "./auth";
import { connectToDatabase, ensureIndexes } from "./db";

export class AdminAuthError extends Error {
  status: number;
  constructor(message: string, status = 403) {
    super(message);
    this.status = status;
  }
}

export async function requireAdmin(): Promise<SessionUser & { isAdmin: true }> {
  const session = await getSession();
  if (!session) {
    throw new AdminAuthError("Unauthorized", 401);
  }

  await ensureIndexes();
  const { db } = await connectToDatabase();
  const user = await db.collection("users").findOne({
    _id: new ObjectId(session.id),
  });

  if (!user) {
    throw new AdminAuthError("Unauthorized", 401);
  }

  if (user.deletedAt) {
    throw new AdminAuthError("Account deleted", 403);
  }

  if (user.status === "disabled") {
    throw new AdminAuthError("Account disabled", 403);
  }

  if (!user.isAdmin) {
    throw new AdminAuthError("Admin access required", 403);
  }

  return {
    ...session,
    isAdmin: true,
  };
}

export async function writeAuditLog(
  db: Db,
  entry: {
    actorId: string;
    actorEmail: string;
    action: string;
    entityType: string;
    entityId?: string;
    details?: Record<string, unknown>;
  }
): Promise<void> {
  await db.collection("auditLogs").insertOne({
    actorId: entry.actorId,
    actorEmail: entry.actorEmail,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId || null,
    details: entry.details || {},
    createdAt: new Date().toISOString(),
  });
}

export function serializeUser(user: Record<string, unknown>) {
  const { passwordHash: _passwordHash, ...rest } = user;
  return {
    ...rest,
    _id: user._id ? String(user._id) : undefined,
    id: user._id ? String(user._id) : undefined,
  };
}

export function normalizeOtp(value: unknown): string {
  return String(value ?? "").replace(/\D/g, "").trim();
}

export function normalizeCode(value: unknown): string {
  return normalizeOtp(value);
}

export function codesMatch(stored: unknown, provided: unknown): boolean {
  const a = normalizeCode(stored);
  const b = normalizeCode(provided);
  return a.length > 0 && a === b;
}
