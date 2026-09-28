import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const session = await requireAuth();
    const { id } = await ctx.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const body = await req.json();
    const $set: Record<string, unknown> = { updatedAt: new Date().toISOString() };

    for (const key of ["type", "amount", "currency", "category", "title", "notes", "date"]) {
      if (body[key] !== undefined) $set[key] = body[key];
    }
    if ($set.amount !== undefined) $set.amount = Number($set.amount);

    const result = await db.collection("financeTransactions").findOneAndUpdate(
      { _id: new ObjectId(id), userId: session.id },
      { $set },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      transaction: { ...result, _id: String(result._id) },
    });
  } catch (err: unknown) {
    const error = err as Error;
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const session = await requireAuth();
    const { id } = await ctx.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const now = new Date().toISOString();
    const result = await db.collection("financeTransactions").findOneAndUpdate(
      { _id: new ObjectId(id), userId: session.id },
      { $set: { deletedAt: now, updatedAt: now } },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
