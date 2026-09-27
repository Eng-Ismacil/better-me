import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Routine, Habit } from "@/types";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const rawRoutines = await db
      .collection<Routine>("routines")
      .find({ userId: session.id })
      .toArray();

    // Populate habit titles
    const habits = await db
      .collection<Habit>("habits")
      .find({ userId: session.id })
      .toArray();
    const habitMap = new Map(habits.map((h) => [h._id?.toString(), h]));

    const routines = rawRoutines.map((r) => ({
      ...r,
      _id: r._id?.toString(),
      habitsList: (r.habits || [])
        .map((item) => habitMap.get(item.habitId))
        .filter(Boolean),
    }));

    return NextResponse.json({ routines });
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
    const { name, description, icon, timeOfDay, habitIds } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Routine name is required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const now = new Date().toISOString();

    const newRoutine: Omit<Routine, "_id"> = {
      userId: session.id,
      name: name.trim(),
      description: description?.trim() || "",
      icon: icon || "auto_stories",
      timeOfDay: timeOfDay || "Morning",
      habits: (habitIds || []).map((id: string, idx: number) => ({
        habitId: id,
        order: idx,
      })),
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("routines").insertOne(newRoutine);

    return NextResponse.json({
      success: true,
      routine: { ...newRoutine, _id: result.insertedId.toString() },
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
