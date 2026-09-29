import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getUserNotifications,
  createNotification,
  markNotificationAsRead,
  deleteNotification,
  clearAllNotifications,
} from "@/lib/notifications";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await getUserNotifications(session.id);
    const unreadCount = notifications.filter((n) => !n.read).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { notificationId } = body;

    await markNotificationAsRead(session.id, notificationId);

    return NextResponse.json({ success: true, message: "Marked as read" });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, message, type, link } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }

    await createNotification(session.id, { title, message, type, link });

    return NextResponse.json({ success: true, message: "Notification created" });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id || body.notificationId;
    }

    if (!id || id === "all") {
      const count = await clearAllNotifications(session.id);
      return NextResponse.json({
        success: true,
        clearedCount: count,
        message: "All notifications cleared",
      });
    }

    const deleted = await deleteNotification(session.id, id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Notification not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Notification deleted" });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

