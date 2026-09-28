import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, ensureIndexes } from "@/lib/db";
import { requireAdmin, AdminAuthError } from "@/lib/admin";

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
    const action = (searchParams.get("action") || "").trim();
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 30)));

    const filter: Record<string, unknown> = {};
    if (action) filter.action = action;
    if (q) {
      filter.$or = [
        { actorEmail: { $regex: q, $options: "i" } },
        { action: { $regex: q, $options: "i" } },
        { entityType: { $regex: q, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      db
        .collection("auditLogs")
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("auditLogs").countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      logs: logs.map((l) => ({ ...l, _id: String(l._id) })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return adminError(err);
  }
}
