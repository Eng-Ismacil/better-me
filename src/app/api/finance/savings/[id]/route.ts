import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";

type Context = { params: Promise<{ id: string }> };

function authError(error: unknown) {
  const err = error as Error;
  return NextResponse.json(
    { error: err.message },
    { status: err.message === "Unauthorized" ? 401 : 500 }
  );
}

export async function PATCH(req: NextRequest, context: Context) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid goal" }, { status: 400 });
    }

    const body = await req.json();
    const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    const increment: Record<string, number> = {};

    if (body.title !== undefined) update.title = String(body.title).trim();
    if (body.targetDate !== undefined) update.targetDate = String(body.targetDate || "");
    if (body.currency !== undefined) update.currency = String(body.currency).trim().toUpperCase();
    if (body.targetAmount !== undefined) {
      const targetAmount = Number(body.targetAmount);
      if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
        return NextResponse.json({ error: "Target must be positive" }, { status: 400 });
      }
      update.targetAmount = targetAmount;
    }
    if (body.amountToAdd !== undefined) {
      const amountToAdd = Number(body.amountToAdd);
      if (!Number.isFinite(amountToAdd) || amountToAdd <= 0) {
        return NextResponse.json({ error: "Savings amount must be positive" }, { status: 400 });
      }
      increment.savedAmount = amountToAdd;
    }

    const { db } = await connectToDatabase();
    const result = await db.collection("financeGoals").findOneAndUpdate(
      { _id: new ObjectId(id), userId: session.id, deletedAt: { $in: [null, undefined] } },
      {
        $set: update,
        ...(Object.keys(increment).length ? { $inc: increment } : {}),
      },
      { returnDocument: "after" }
    );
    if (!result) return NextResponse.json({ error: "Savings goal not found" }, { status: 404 });

    return NextResponse.json({
      success: true,
      goal: { ...result, _id: String(result._id) },
    });
  } catch (error) {
    return authError(error);
  }
}

export async function DELETE(_req: NextRequest, context: Context) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid goal" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const now = new Date().toISOString();
    const result = await db.collection("financeGoals").updateOne(
      { _id: new ObjectId(id), userId: session.id, deletedAt: { $in: [null, undefined] } },
      { $set: { deletedAt: now, updatedAt: now } }
    );
    if (!result.matchedCount) {
      return NextResponse.json({ error: "Savings goal not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return authError(error);
  }
}