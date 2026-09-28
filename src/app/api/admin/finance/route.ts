import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase, ensureIndexes } from "@/lib/db";
import { requireAdmin, AdminAuthError, writeAuditLog } from "@/lib/admin";

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
    const adminLedger = searchParams.get("scope") === "admin";
    const userId = searchParams.get("userId") || "";
    const type = searchParams.get("type") || "";
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 30)));

    const filter: Record<string, unknown> = {
      deletedAt: { $in: [null, undefined] },
    };
    if (!adminLedger && userId) filter.userId = userId;
    if (type === "income" || type === "expense") filter.type = type;
    const collectionName = adminLedger ? "adminFinanceEntries" : "financeTransactions";

    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      db
        .collection(collectionName)
        .find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection(collectionName).countDocuments(filter),
    ]);

    const userIds = adminLedger ? [] : [
      ...new Set(
        transactions.map((t) => String(t.userId)).filter((id) => ObjectId.isValid(id))
      ),
    ];
    const users = userIds.length
      ? await db
          .collection("users")
          .find({ _id: { $in: userIds.map((id) => new ObjectId(id)) } })
          .project({ name: 1, email: 1 })
          .toArray()
      : [];
    const userMap = new Map(users.map((u) => [String(u._id), u]));

    const summary = await db
      .collection(collectionName)
      .aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const income = summary.find((s) => s._id === "income")?.total || 0;
    const expense = summary.find((s) => s._id === "expense")?.total || 0;

    return NextResponse.json({
      success: true,
      transactions: transactions.map((t) => {
        const u = userMap.get(String(t.userId));
        return {
          ...t,
          _id: String(t._id),
          userName: adminLedger ? "BetterMe Operations" : u?.name || "Unknown",
          userEmail: u?.email || "",
        };
      }),
      summary: { income, expense, balance: income - expense },
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
    const adminLedger = new URL(req.url).searchParams.get("scope") === "admin";
    const body = await req.json();

    const userId = String(body.userId || "");
    const type = body.type === "income" ? "income" : "expense";
    const amount = Number(body.amount);
    const title = String(body.title || "").trim();
    const category = String(body.category || "general").trim();
    const currency = String(body.currency || "USD").trim();
    const date = String(body.date || new Date().toISOString().slice(0, 10));
    const notes = String(body.notes || "");

    if ((!adminLedger && !ObjectId.isValid(userId)) || !title || !(amount > 0)) {
      return NextResponse.json(
        { error: "A valid user, title, and positive amount are required" },
        { status: 400 }
      );
    }

    if (!adminLedger) {
      const userExists = await db.collection("users").findOne({ _id: new ObjectId(userId) });
      if (!userExists) return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    const doc = {
      ...(adminLedger ? { actorId: admin.id, actorEmail: admin.email } : { userId }),
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

    const result = await db
      .collection(adminLedger ? "adminFinanceEntries" : "financeTransactions")
      .insertOne(doc);
    await writeAuditLog(db, {
      actorId: admin.id,
      actorEmail: admin.email,
      action: adminLedger ? "finance.admin_ledger_create" : "finance.create",
      entityType: adminLedger ? "admin_finance" : "finance",
      entityId: result.insertedId.toString(),
      details: { userId: adminLedger ? undefined : userId, type, amount, title },
    });

    return NextResponse.json({
      success: true,
      transaction: { ...doc, _id: result.insertedId.toString() },
    });
  } catch (err) {
    return adminError(err);
  }
}
