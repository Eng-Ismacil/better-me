import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, ensureIndexes } from "@/lib/db";
import {
  requireAdmin,
  AdminAuthError,
  serializeUser,
  writeAuditLog,
} from "@/lib/admin";
import { hashPassword } from "@/lib/auth";

function adminError(err: unknown) {
  if (err instanceof AdminAuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  const error = err as Error;
  return NextResponse.json({ error: error.message }, { status: 500 });
}

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    await ensureIndexes();
    const { db } = await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const status = searchParams.get("status") || "";
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 20)));
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const filter: Record<string, unknown> = {};
    if (!includeDeleted) {
      filter.deletedAt = { $in: [null, undefined] };
    }

    if (status === "active") {
      filter.$or = [{ status: "active" }, { status: { $exists: false } }, { status: null }];
    } else if (status === "inactive" || status === "disabled") {
      filter.status = status;
    }

    if (q) {
      filter.$and = [
        ...(Array.isArray(filter.$and) ? (filter.$and as object[]) : []),
        {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
            { phone: { $regex: q, $options: "i" } },
          ],
        },
      ];
      // clean conflicting $or when status=active
      if (status === "active") {
        delete filter.$or;
        filter.$and = [
          {
            $or: [{ status: "active" }, { status: { $exists: false } }, { status: null }],
          },
          {
            $or: [
              { name: { $regex: q, $options: "i" } },
              { email: { $regex: q, $options: "i" } },
              { phone: { $regex: q, $options: "i" } },
            ],
          },
        ];
      }
    }

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      db
        .collection("users")
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("users").countDocuments(filter),
    ]);

    void admin;
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
    await ensureIndexes();
    const { db } = await connectToDatabase();
    const body = await req.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!name || !email || password.length < 6) {
      return NextResponse.json(
        { error: "Name, email, and password (6+) are required" },
        { status: 400 }
      );
    }

    const existing = await db.collection("users").findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    const now = new Date().toISOString();
    const passwordHash = await hashPassword(password);
    const doc = {
      name,
      email,
      passwordHash,
      avatarUrl: body.avatarUrl || "/images/avatar.jpg",
      memberSince: "New",
      timezone: body.timezone || "UTC",
      isAdmin: Boolean(body.isAdmin),
      twoFactorEnabled: Boolean(body.twoFactorEnabled),
      status: body.status || "active",
      phone: body.phone || "",
      notes: body.notes || "",
      role: body.role || (body.isAdmin ? "admin" : "user"),
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("users").insertOne(doc);
    await writeAuditLog(db, {
      actorId: admin.id,
      actorEmail: admin.email,
      action: "user.create",
      entityType: "user",
      entityId: result.insertedId.toString(),
      details: { email, name },
    });

    return NextResponse.json({
      success: true,
      user: serializeUser({ ...doc, _id: result.insertedId } as Record<string, unknown>),
    });
  } catch (err) {
    return adminError(err);
  }
}
