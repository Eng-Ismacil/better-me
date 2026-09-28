import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Reminder } from "@/types";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const reminders = await db
      .collection<Reminder>("reminders")
      .find({ userId: session.id })
      .toArray();

    return NextResponse.json({
      reminders: reminders.map((r) => ({ ...r, _id: r._id?.toString() })),
    });
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

    const body = await req.json();
    const { habitId, habitTitle, time, days, smartTiming } = body;

    const { db } = await connectToDatabase();
    const newReminder: Omit<Reminder, "_id"> = {
      userId: session.id,
      habitId: habitId || "",
      habitTitle: habitTitle || "Daily Habit",
      time: time || "08:00 AM",
      days: days || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      enabled: true,
      smartTiming: !!smartTiming,
      createdAt: new Date().toISOString(),
    };

    const result = await db.collection("reminders").insertOne(newReminder);
    return NextResponse.json({
      success: true,
      reminder: { ...newReminder, _id: result.insertedId.toString() },
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
