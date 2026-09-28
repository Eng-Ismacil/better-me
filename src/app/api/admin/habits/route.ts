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
    const q = (searchParams.get("q") || "").trim();
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 20)));

    const filter: Record<string, unknown> = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const [habits, total] = await Promise.all([
      db
        .collection("habits")
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("habits").countDocuments(filter),
    ]);

    const userIds = [
      ...new Set(habits.map((h) => String(h.userId)).filter((id) => ObjectId.isValid(id))),
    ];
    const users = userIds.length
      ? await db
          .collection("users")
          .find({ _id: { $in: userIds.map((id) => new ObjectId(id)) } })
          .project({ name: 1, email: 1 })
          .toArray()
      : [];
    const userMap = new Map(users.map((u) => [String(u._id), u]));

    return NextResponse.json({
      success: true,
      habits: habits.map((h) => {
        const u = userMap.get(String(h.userId));
        return {
          ...h,
          _id: String(h._id),
          userName: u?.name || "Unknown",
          userEmail: u?.email || "",
        };
      }),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return adminError(err);
  }
}
