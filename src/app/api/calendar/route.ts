import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getUserHabits, getUserCompletionsForDate, getTodayDateString } from "@/lib/habits";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const today = getTodayDateString();

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const sixtyDaysAgoStr = sixtyDaysAgo.toISOString().split("T")[0];

    const habits = await getUserHabits(session.id);
    const totalHabits = habits.length || 1;

    const completions = await db
      .collection("habitCompletions")
      .find({
        userId: session.id,
        date: { $gte: sixtyDaysAgoStr, $lte: today },
      })
      .toArray();

    const completionsByDate: Record<string, number> = {};
    for (const c of completions) {
      const d = c.date as string;
      completionsByDate[d] = (completionsByDate[d] || 0) + 1;
    }

    const calendarData: Record<string, { count: number; rate: number }> = {};
    for (const [date, count] of Object.entries(completionsByDate)) {
      calendarData[date] = {
        count,
        rate: Math.min(100, Math.round((count / totalHabits) * 100)),
      };
    }

    const todayCompletedIds = await getUserCompletionsForDate(session.id, today);

    return NextResponse.json({
      calendarData,
      totalHabits,
      todayCompletedIds,
      habits,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
