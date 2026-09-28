import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/db";
import { requireAdmin, AdminAuthError, writeAuditLog } from "@/lib/admin";

function adminError(err: unknown) {
  if (err instanceof AdminAuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  const error = err as Error;
  return NextResponse.json({ error: error.message }, { status: 500 });
}

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const admin = await requireAdmin();
    const { id } = await ctx.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const body = await req.json();
    const $set: Record<string, unknown> = { updatedAt: new Date().toISOString() };

    for (const key of [
      "name",
      "description",
      "category",
      "icon",
      "frequency",
      "status",
      "difficulty",
      "target",
      "targetUnit",
      "preferredTime",
      "currentStreak",
      "bestStreak",
    ]) {
      if (body[key] !== undefined) $set[key] = body[key];
    }

    const result = await db.collection("habits").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    await writeAuditLog(db, {
      actorId: admin.id,
      actorEmail: admin.email,
      action: "habit.update",
      entityType: "habit",
      entityId: id,
      details: { fields: Object.keys($set) },
    });

    return NextResponse.json({
      success: true,
      habit: { ...result, _id: String(result._id) },
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
    const result = await db.collection("habits").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    await db.collection("habitCompletions").deleteMany({ habitId: id });

    await writeAuditLog(db, {
      actorId: admin.id,
      actorEmail: admin.email,
      action: "habit.delete",
      entityType: "habit",
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return adminError(err);
  }
}
