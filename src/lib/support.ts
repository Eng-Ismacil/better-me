import { connectToDatabase } from "./db";
import { ObjectId } from "mongodb";
import { createNotification } from "./notifications";

export interface SupportMessage {
  _id?: string;
  conversationId: string; // The user's ID
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  senderId: string;
  senderRole: "user" | "admin";
  senderName: string;
  text?: string;
  imageUrl?: string;
  readByAdmin: boolean;
  readByUser: boolean;
  createdAt: string;
}

export interface ConversationSummary {
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadForAdminCount: number;
}

/**
 * Fetch all chat messages for a specific user's support thread
 */
export async function getConversationMessages(userId: string): Promise<SupportMessage[]> {
  const { db } = await connectToDatabase();
  const docs = await db
    .collection("supportMessages")
    .find({ conversationId: userId })
    .sort({ createdAt: 1 })
    .toArray();

  return docs.map((doc) => ({
    ...doc,
    _id: doc._id.toString(),
  })) as SupportMessage[];
}

/**
 * Send a new support message
 */
export async function sendSupportMessage(params: {
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  senderId: string;
  senderRole: "user" | "admin";
  senderName: string;
  text?: string;
  imageUrl?: string;
}): Promise<SupportMessage> {
  const { db } = await connectToDatabase();
  const now = new Date().toISOString();

  const newDoc = {
    conversationId: params.userId,
    userId: params.userId,
    userName: params.userName,
    userEmail: params.userEmail,
    userAvatar: params.userAvatar || "/images/avatar.jpg",
    senderId: params.senderId,
    senderRole: params.senderRole,
    senderName: params.senderName,
    text: params.text?.trim() || "",
    imageUrl: params.imageUrl || null,
    readByAdmin: params.senderRole === "admin",
    readByUser: params.senderRole === "user",
    createdAt: now,
  };

  const result = await db.collection("supportMessages").insertOne(newDoc);

  // If admin sends a message, automatically deliver in-app notification to the user's notification box
  if (params.senderRole === "admin") {
    try {
      await createNotification(params.userId, {
        title: "Farriin cusub oo Support-ka ah 💬",
        message:
          params.text?.trim() ||
          "Waxaad heshay sawir/fariin cusub oo ka timid Taageerada BetterMe.",
        type: "system",
        link: "/support",
      });
    } catch {
      // Non-blocking notification fail
    }
  }

  return {
    ...newDoc,
    _id: result.insertedId.toString(),
  } as unknown as SupportMessage;
}

/**
 * Fetch list of all conversations for admin view
 */
export async function getAllSupportConversations(): Promise<ConversationSummary[]> {
  const { db } = await connectToDatabase();

  // Aggregate messages grouped by conversationId (userId)
  const pipeline = [
    {
      $sort: { createdAt: -1 as const },
    },
    {
      $group: {
        _id: "$conversationId",
        userId: { $first: "$userId" },
        userName: { $first: "$userName" },
        userEmail: { $first: "$userEmail" },
        userAvatar: { $first: "$userAvatar" },
        lastMessage: {
          $first: {
            $cond: [
              { $gt: [{ $strLenCP: { $ifNull: ["$text", ""] } }, 0] },
              "$text",
              "📷 [Sawir / Image]",
            ],
          },
        },
        lastMessageAt: { $first: "$createdAt" },
        unreadForAdminCount: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ["$senderRole", "user"] }, { $eq: ["$readByAdmin", false] }] },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $sort: { lastMessageAt: -1 as const },
    },
  ];

  const results = await db.collection("supportMessages").aggregate(pipeline).toArray();

  return results.map((r) => ({
    userId: String(r.userId || r._id),
    userName: r.userName || "User",
    userEmail: r.userEmail || "",
    userAvatar: r.userAvatar || "/images/avatar.jpg",
    lastMessage: r.lastMessage || "",
    lastMessageAt: r.lastMessageAt || "",
    unreadForAdminCount: Number(r.unreadForAdminCount || 0),
  }));
}

/**
 * Mark all messages in a conversation as read by the given role
 */
export async function markConversationRead(
  conversationId: string,
  role: "user" | "admin"
): Promise<void> {
  const { db } = await connectToDatabase();
  if (role === "admin") {
    await db
      .collection("supportMessages")
      .updateMany({ conversationId, readByAdmin: false }, { $set: { readByAdmin: true } });
  } else {
    await db
      .collection("supportMessages")
      .updateMany({ conversationId, readByUser: false }, { $set: { readByUser: true } });
  }
}
