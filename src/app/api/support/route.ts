import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";
import {
  getConversationMessages,
  sendSupportMessage,
  getAllSupportConversations,
  markConversationRead,
} from "@/lib/support";
import { User } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId");
    const summary = searchParams.get("summary");

    // Admin requesting conversation summaries list
    if (session.isAdmin && (summary === "true" || !targetUserId)) {
      const conversations = await getAllSupportConversations();
      return NextResponse.json({ success: true, conversations });
    }

    // Admin requesting messages for a specific user
    if (session.isAdmin && targetUserId) {
      const messages = await getConversationMessages(targetUserId);
      await markConversationRead(targetUserId, "admin");
      return NextResponse.json({ success: true, messages });
    }

    // Normal user requesting their own conversation messages
    const messages = await getConversationMessages(session.id);
    await markConversationRead(session.id, "user");
    return NextResponse.json({ success: true, messages });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { text, imageUrl, targetUserId } = body;

    if (!text?.trim() && !imageUrl) {
      return NextResponse.json(
        { error: "Farriin qoraal ah ama sawir ayaa loo baahan yahay / Text or image required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // If sender is Admin
    if (session.isAdmin) {
      if (!targetUserId) {
        return NextResponse.json(
          { error: "Target userId is required for admin message" },
          { status: 400 }
        );
      }

      // Fetch recipient user details
      const recipient = await db
        .collection<User>("users")
        .findOne({ _id: new ObjectId(targetUserId) as unknown as string });

      if (!recipient) {
        return NextResponse.json({ error: "Recipient user not found" }, { status: 404 });
      }

      const message = await sendSupportMessage({
        userId: targetUserId,
        userName: recipient.name,
        userEmail: recipient.email,
        userAvatar: recipient.avatarUrl,
        senderId: session.id,
        senderRole: "admin",
        senderName: session.name || "BetterMe Support",
        text,
        imageUrl,
      });

      return NextResponse.json({ success: true, message });
    }

    // Sender is Normal User
    const user = await db
      .collection<User>("users")
      .findOne({ _id: new ObjectId(session.id) as unknown as string });

    const message = await sendSupportMessage({
      userId: session.id,
      userName: user?.name || session.name,
      userEmail: user?.email || session.email,
      userAvatar: user?.avatarUrl || session.avatarUrl,
      senderId: session.id,
      senderRole: "user",
      senderName: user?.name || session.name,
      text,
      imageUrl,
    });

    return NextResponse.json({ success: true, message });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
