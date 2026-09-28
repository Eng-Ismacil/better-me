import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { AdminAuthError, requireAdmin, writeAuditLog } from "@/lib/admin";
import {
  getMaintenanceSettings,
  invalidateMaintenanceCache,
} from "@/lib/maintenance";

function adminError(err: unknown) {
  if (err instanceof AdminAuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  return NextResponse.json({ error: (err as Error).message }, { status: 500 });
}

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({ success: true, maintenance: await getMaintenanceSettings() });
  } catch (err) {
    return adminError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const enabled = Boolean(body.enabled);
    const message = String(body.message || "").trim().slice(0, 500);
    const endsAt = String(body.endsAt || "").trim();

    if (endsAt && !Number.isFinite(Date.parse(endsAt))) {
      return NextResponse.json({ error: "Invalid maintenance end time" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const settings = {
      enabled,
      message: message || "We are making BetterMe better. Please check back soon.",
      endsAt,
      updatedAt: now,
      updatedBy: admin.email,
    };
    const { db } = await connectToDatabase();
    await db.collection<{ _id: string }>("appSettings").updateOne(
      { _id: "maintenance" },
      { $set: settings },
      { upsert: true }
    );
    await writeAuditLog(db, {
      actorId: admin.id,
      actorEmail: admin.email,
      action: enabled ? "maintenance.enable" : "maintenance.disable",
      entityType: "platform",
      entityId: "maintenance",
      details: { endsAt, message },
    });
    invalidateMaintenanceCache();

    return NextResponse.json({ success: true, maintenance: settings });
  } catch (err) {
    return adminError(err);
  }
}