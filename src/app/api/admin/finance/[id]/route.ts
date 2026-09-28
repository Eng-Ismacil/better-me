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

    for (const key of ["type", "amount", "currency", "category", "title", "notes", "date", "userId"]) {
      if (body[key] !== undefined) $set[key] = body[key];
    }
    if ($set.amount !== undefined) $set.amount = Number($set.amount);

    const result = await db.collection("financeTransactions").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await writeAuditLog(db, {
      actorId: admin.id,
      actorEmail: admin.email,
      action: "finance.update",
      entityType: "finance",
      entityId: id,
    });

    return NextResponse.json({
      success: true,
      transaction: { ...result, _id: String(result._id) },
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
    const result = await db.collection("financeTransactions").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { deletedAt: now, updatedAt: now } },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await writeAuditLog(db, {
      actorId: admin.id,
      actorEmail: admin.email,
      action: "finance.delete",
      entityType: "finance",
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return adminError(err);
  }
}
