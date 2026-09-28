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
    const adminLedger = new URL(req.url).searchParams.get("scope") === "admin";
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
    if (body.userId !== undefined && !adminLedger) {
      if (!ObjectId.isValid(String(body.userId))) {
        return NextResponse.json({ error: "Invalid user" }, { status: 400 });
      }
      $set.userId = String(body.userId);
    }
    if ($set.amount !== undefined) {
      $set.amount = Number($set.amount);
      if (!Number.isFinite($set.amount) || Number($set.amount) <= 0) {
        return NextResponse.json({ error: "Amount must be positive" }, { status: 400 });
      }
    }
    if ($set.type !== undefined && !["income", "expense"].includes(String($set.type))) {
      return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 });
    }

    const result = await db.collection(adminLedger ? "adminFinanceEntries" : "financeTransactions").findOneAndUpdate(
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
      action: adminLedger ? "finance.admin_ledger_update" : "finance.update",
      entityType: adminLedger ? "admin_finance" : "finance",
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

export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    const admin = await requireAdmin();
    const adminLedger = new URL(req.url).searchParams.get("scope") === "admin";
    const { id } = await ctx.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const now = new Date().toISOString();
    const result = await db.collection(adminLedger ? "adminFinanceEntries" : "financeTransactions").findOneAndUpdate(
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
      action: adminLedger ? "finance.admin_ledger_delete" : "finance.delete",
      entityType: adminLedger ? "admin_finance" : "finance",
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return adminError(err);
  }
}
