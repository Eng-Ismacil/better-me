import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
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

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne({ _id: new ObjectId(id) });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const habits = await db
      .collection("habits")
      .find({ userId: id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      user: serializeUser(user as Record<string, unknown>),
      habits: habits.map((h) => ({ ...h, _id: String(h._id) })),
    });
  } catch (err) {
    return adminError(err);
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const admin = await requireAdmin();
    const { id } = await ctx.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    await ensureIndexes();
    const { db } = await connectToDatabase();
    const body = await req.json();
    const now = new Date().toISOString();

    const $set: Record<string, unknown> = { updatedAt: now };
    const allowed = [
      "name",
      "email",
      "avatarUrl",
      "timezone",
      "phone",
      "notes",
      "role",
      "memberSince",
      "isAdmin",
      "twoFactorEnabled",
      "status",
      "disabledReason",
    ] as const;

    for (const key of allowed) {
      if (body[key] !== undefined) {
        if (key === "email") {
          $set.email = String(body.email).trim().toLowerCase();
        } else if (key === "isAdmin" || key === "twoFactorEnabled") {
          $set[key] = Boolean(body[key]);
        } else {
          $set[key] = body[key];
        }
      }
    }

    if (body.password && String(body.password).length >= 6) {
      $set.passwordHash = await hashPassword(String(body.password));
    }

    if (body.status === "disabled") {
      $set.disabledAt = now;
    } else if (body.status === "active" || body.status === "inactive") {
      $set.disabledAt = null;
      $set.disabledReason = "";
    }

    if ($set.email) {
      const clash = await db.collection("users").findOne({
        email: $set.email,
        _id: { $ne: new ObjectId(id) },
      });
      if (clash) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
    }

    const result = await db.collection("users").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await writeAuditLog(db, {
      actorId: admin.id,
      actorEmail: admin.email,
      action: "user.update",
      entityType: "user",
      entityId: id,
      details: { fields: Object.keys($set) },
    });

    return NextResponse.json({
      success: true,
      user: serializeUser(result as Record<string, unknown>),
    });
  } catch (err) {
    return adminError(err);
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const admin = await requireAdmin();
    const { id } = await ctx.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const now = new Date().toISOString();

    const result = await db.collection("users").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { deletedAt: now, status: "inactive", updatedAt: now } },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await writeAuditLog(db, {
      actorId: admin.id,
      actorEmail: admin.email,
      action: "user.soft_delete",
      entityType: "user",
      entityId: id,
    });

    return NextResponse.json({
      success: true,
      user: serializeUser(result as Record<string, unknown>),
    });
  } catch (err) {
    return adminError(err);
  }
}
