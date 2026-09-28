import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(session.id) });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || "/images/avatar.jpg",
        memberSince: user.memberSince || "6 Months",
        timezone: user.timezone || "UTC",
        isAdmin: Boolean(user.isAdmin),
      },
    });
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

    const body = await req.json();
    const { name, avatarUrl, timezone } = body;

    const updates: Record<string, string> = {
      updatedAt: new Date().toISOString(),
    };

    if (name && typeof name === "string") updates.name = name.trim();
    if (avatarUrl && typeof avatarUrl === "string") updates.avatarUrl = avatarUrl;
    if (timezone && typeof timezone === "string") updates.timezone = timezone;

    const { db } = await connectToDatabase();
    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(session.id) }, { $set: updates });

    return NextResponse.json({
      success: true,
      message: "Xogta astaantaada waa la keydiyay / Profile updated successfully",
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
