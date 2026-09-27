import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getTodayDateString } from "@/lib/habits";
import { DailyCheckIn } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || getTodayDateString();

    const { db } = await connectToDatabase();
    const checkIn = await db
      .collection<DailyCheckIn>("dailyCheckIns")
      .findOne({ userId: session.id, date });

    return NextResponse.json({ checkIn });
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
    const { date, mood, energy, notes } = body;
    const checkInDate = date || getTodayDateString();

    const { db } = await connectToDatabase();
    const now = new Date().toISOString();

    const moodLabels: Record<string, string> = {
      calm_focused: "Calm & Focused",
      energized: "Energized & Motivated",
      neutral: "Balanced & Steady",
      tired: "Low Energy / Rest Needed",
      stressed: "Stressed / Re-centering",
    };

    const doc: DailyCheckIn = {
      userId: session.id,
      date: checkInDate,
      mood: mood || "calm_focused",
      moodLabel: moodLabels[mood] || "Calm & Focused",
      energy: Number(energy) || 8,
      notes: notes?.trim() || "",
      loggedAt: now,
    };

    await db.collection("dailyCheckIns").updateOne(
      { userId: session.id, date: checkInDate },
      { $set: doc },
      { upsert: true }
    );

    return NextResponse.json({ success: true, checkIn: doc });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
