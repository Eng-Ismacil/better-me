import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase, ensureIndexes } from "@/lib/db";
import {
  requireAdmin,
  AdminAuthError,
  serializeUser,
  writeAuditLog,
} from "@/lib/admin";

function adminError(err: unknown) {
  if (err instanceof AdminAuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  const error = err as Error;
  return NextResponse.json({ error: error.message }, { status: 500 });
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await ensureIndexes();
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 20)));

    const filter: Record<string, unknown> = {
      deletedAt: { $ne: null, $exists: true },
    };

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      db
        .collection("users")
        .find(filter)
        .sort({ deletedAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("users").countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      users: users.map((u) => serializeUser(u as Record<string, unknown>)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return adminError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { db } = await connectToDatabase();
    const body = await req.json();
    const ids: string[] = Array.isArray(body.ids)
      ? body.ids.map((id: unknown) => String(id)).filter((id: string) => ObjectId.isValid(id))
      : [];

    if (!ids.length) {
      return NextResponse.json({ error: "ids[] required" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const res = await db.collection("users").updateMany(
      { _id: { $in: ids.map((id) => new ObjectId(id)) } },
      {
        $set: {
          deletedAt: null,
          status: "active",
          updatedAt: now,
        },
      }
    );

    await writeAuditLog(db, {
      actorId: admin.id,
      actorEmail: admin.email,
      action: "user.restore",
      entityType: "user",
      details: { ids, modified: res.modifiedCount },
    });

    return NextResponse.json({ success: true, restored: res.modifiedCount });
  } catch (err) {
    return adminError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { db } = await connectToDatabase();
    const body = await req.json();
    const ids: string[] = Array.isArray(body.ids)
      ? body.ids.map((id: unknown) => String(id)).filter((id: string) => ObjectId.isValid(id))
      : [];

    if (!ids.length) {
      return NextResponse.json({ error: "ids[] required" }, { status: 400 });
    }

    // Only permanently delete soft-deleted users
    const res = await db.collection("users").deleteMany({
      _id: { $in: ids.map((id) => new ObjectId(id)) },
      deletedAt: { $ne: null },
    });

    await writeAuditLog(db, {
      actorId: admin.id,
      actorEmail: admin.email,
      action: "user.permanent_delete",
      entityType: "user",
      details: { ids, deleted: res.deletedCount },
    });

    return NextResponse.json({ success: true, deleted: res.deletedCount });
  } catch (err) {
    return adminError(err);
  }
}
