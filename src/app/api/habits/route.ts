import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getUserHabits } from "@/lib/habits";
import { Habit } from "@/types";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const habits = await getUserHabits(session.id);
    return NextResponse.json({ habits });
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
    const { name, category, icon, frequency, difficulty, target, targetUnit, preferredTime, description, reminderTime } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Habit name is required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const now = new Date().toISOString();

    const newHabit: Omit<Habit, "_id"> = {
      userId: session.id,
      name: name.trim(),
      description: description?.trim() || "",
      category: category || "health",
      icon: icon || "check_circle",
      frequency: frequency || "daily",
      target: Number(target) || 1,
      targetUnit: targetUnit || "times",
      difficulty: difficulty || "easy",
      preferredTime: preferredTime || "Morning",
      reminderTime: reminderTime || undefined,
      reminderEnabled: !!reminderTime,
      status: "active",
      currentStreak: 0,
      bestStreak: 0,
      totalCompletions: 0,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("habits").insertOne(newHabit);

    return NextResponse.json({
      success: true,
      habit: { ...newHabit, _id: result.insertedId.toString() },
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
