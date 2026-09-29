import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, ensureIndexes } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    await ensureIndexes();
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "";

    const filter: Record<string, unknown> = {
      userId: session.id,
      deletedAt: { $in: [null, undefined] },
    };
    if (type === "income" || type === "expense" || type === "saving") filter.type = type;

    const transactions = await db
      .collection("financeTransactions")
      .find(filter)
      .sort({ date: -1, createdAt: -1 })
      .limit(200)
      .toArray();

    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    const saving = transactions
      .filter((t) => t.type === "saving")
      .reduce((s, t) => s + Number(t.amount || 0), 0);

    return NextResponse.json({
      success: true,
      transactions: transactions.map((t) => ({ ...t, _id: String(t._id) })),
      summary: {
        income,
        expense,
        saving,
        balance: income - expense - saving,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    await ensureIndexes();
    const { db } = await connectToDatabase();
    const body = await req.json();

    const type = body.type === "income" ? "income" : body.type === "saving" ? "saving" : "expense";
    const amount = Number(body.amount);
    const title = String(body.title || "").trim();
    const category = String(body.category || "general").trim();
    const currency = String(body.currency || "USD").trim();
    const date = String(body.date || new Date().toISOString().slice(0, 10));
    const notes = String(body.notes || "");

    if (!title || !(amount > 0)) {
      return NextResponse.json(
        { error: "Title and positive amount are required" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const doc = {
      userId: session.id,
      type,
      amount,
      currency,
      category,
      title,
      notes,
      date,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    const result = await db.collection("financeTransactions").insertOne(doc);
    return NextResponse.json({
      success: true,
      transaction: { ...doc, _id: result.insertedId.toString() },
    });
  } catch (err: unknown) {
    const error = err as Error;
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
