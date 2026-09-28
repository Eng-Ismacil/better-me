import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";

function authError(error: unknown) {
  const err = error as Error;
  return NextResponse.json(
    { error: err.message },
    { status: err.message === "Unauthorized" ? 401 : 500 }
  );
}

export async function GET() {
  try {
    const session = await requireAuth();
    const { db } = await connectToDatabase();
    const goals = await db
      .collection("financeGoals")
      .find({ userId: session.id, deletedAt: { $in: [null, undefined] } })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      goals: goals.map((goal) => ({ ...goal, _id: String(goal._id) })),
    });
  } catch (error) {
    return authError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const title = String(body.title || "").trim();
    const targetAmount = Number(body.targetAmount);
    const currency = String(body.currency || "USD").trim().toUpperCase();
    const targetDate = String(body.targetDate || "").trim();

    if (!title || !Number.isFinite(targetAmount) || targetAmount <= 0) {
      return NextResponse.json(
        { error: "A title and positive savings target are required" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const goal = {
      userId: session.id,
      title,
      targetAmount,
      savedAmount: 0,
      currency,
      targetDate,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    const { db } = await connectToDatabase();
    const result = await db.collection("financeGoals").insertOne(goal);

    return NextResponse.json(
      { success: true, goal: { ...goal, _id: result.insertedId.toString() } },
      { status: 201 }
    );
  } catch (error) {
    return authError(error);
  }
}