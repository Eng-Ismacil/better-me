import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase, ensureIndexes } from "@/lib/db";
import { requireAdmin, AdminAuthError, writeAuditLog } from "@/lib/admin";
import { createNotification } from "@/lib/notifications";
import { sendBroadcastEmail } from "@/lib/resend";

function adminError(err: unknown) {
  if (err instanceof AdminAuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  const error = err as Error;
  return NextResponse.json({ error: error.message }, { status: 500 });
}

export async function GET() {
  try {
    await requireAdmin();
    const { db } = await connectToDatabase();
    const messages = await db
      .collection("broadcastMessages")
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      success: true,
      messages: messages.map((m) => ({ ...m, _id: String(m._id) })),
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
    const body = await req.json();

    const title = String(body.title || "").trim();
    const message = String(body.message || "").trim();
    const sendEmail = Boolean(body.sendEmail);
    const userIds: string[] | null = Array.isArray(body.userIds)
      ? body.userIds.map((id: unknown) => String(id))
      : null;

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message are required" },
        { status: 400 }
      );
    }

    const userFilter: Record<string, unknown> = {
      deletedAt: { $in: [null, undefined] },
      status: { $ne: "disabled" },
    };

    if (userIds && userIds.length > 0) {
      const valid = userIds.filter((id) => ObjectId.isValid(id));
      userFilter._id = { $in: valid.map((id) => new ObjectId(id)) };
    }

    const recipients = await db
      .collection("users")
      .find(userFilter)
      .project({ name: 1, email: 1 })
      .toArray();

    const now = new Date().toISOString();
    for (const user of recipients) {
      const uid = String(user._id);
      await createNotification(uid, {
        title,
        message,
        type: "system",
        link: "/notifications",
      });

      if (sendEmail && user.email) {
        await sendBroadcastEmail({
          toEmail: user.email,
          userName: user.name,
          title,
          message,
        });
      }
    }

    await db.collection("broadcastMessages").insertOne({
      title,
      message,
      sentBy: admin.email,
      recipientCount: recipients.length,
      sendEmail,
      createdAt: now,
    });

    await writeAuditLog(db, {
      actorId: admin.id,
      actorEmail: admin.email,
      action: "broadcast.send",
      entityType: "broadcast",
      details: { title, recipientCount: recipients.length, sendEmail },
    });

    return NextResponse.json({
      success: true,
      recipientCount: recipients.length,
    });
  } catch (err) {
    return adminError(err);
  }
}
