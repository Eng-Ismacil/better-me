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

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    await ensureIndexes();
    const { db } = await connectToDatabase();
    const body = await req.json();
    const action = String(body.action || "");
    const ids: string[] = Array.isArray(body.ids)
      ? body.ids.map((id: unknown) => String(id)).filter((id: string) => ObjectId.isValid(id))
      : [];

    if (!ids.length) {
      return NextResponse.json({ error: "ids[] required" }, { status: 400 });
    }

    const objectIds = ids.map((id) => new ObjectId(id));
    const now = new Date().toISOString();
    let modified = 0;

    if (action === "disable") {
      const res = await db.collection("users").updateMany(
        { _id: { $in: objectIds } },
        {
          $set: {
            status: "disabled",
            disabledAt: now,
            disabledReason: body.reason || "Disabled by admin",
            updatedAt: now,
          },
        }
      );
      modified = res.modifiedCount;
    } else if (action === "enable") {
      const res = await db.collection("users").updateMany(
        { _id: { $in: objectIds } },
        {
          $set: {
            status: "active",
            disabledAt: null,
            disabledReason: "",
            updatedAt: now,
          },
        }
      );
      modified = res.modifiedCount;
    } else if (action === "softDelete") {
      const res = await db.collection("users").updateMany(
        { _id: { $in: objectIds } },
        { $set: { deletedAt: now, status: "inactive", updatedAt: now } }
      );
      modified = res.modifiedCount;
    } else if (action === "restore") {
      const res = await db.collection("users").updateMany(
        { _id: { $in: objectIds } },
        { $set: { deletedAt: null, status: "active", updatedAt: now } }
      );
      modified = res.modifiedCount;
    } else if (action === "setInactive") {
      const res = await db.collection("users").updateMany(
        { _id: { $in: objectIds } },
        { $set: { status: "inactive", updatedAt: now } }
      );
      modified = res.modifiedCount;
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    await writeAuditLog(db, {
      actorId: admin.id,
      actorEmail: admin.email,
      action: `user.bulk_${action}`,
      entityType: "user",
      details: { ids, modified },
    });

    return NextResponse.json({ success: true, modified });
  } catch (err) {
    return adminError(err);
  }
}
