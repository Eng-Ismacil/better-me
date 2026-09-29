import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getHabitHealthMetrics, getWeeklyConsistency, getUserHabits } from "@/lib/habits";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [habits, metrics, weeklyDays] = await Promise.all([
      getUserHabits(session.id),
      getHabitHealthMetrics(session.id),
      getWeeklyConsistency(session.id),
    ]);

    const avgWeekly =
      weeklyDays.length > 0
        ? Math.round(weeklyDays.reduce((s, d) => s + d.completionRate, 0) / weeklyDays.length)
        : 0;

    const totalStreak = habits.reduce((s, h) => s + (h.currentStreak || 0), 0);
    const bestStreak = Math.max(...habits.map((h) => h.bestStreak || 0), 0);
    const totalCompletions = habits.reduce((s, h) => s + (h.totalCompletions || 0), 0);

    return NextResponse.json({
      metrics,
      weeklyDays,
      consistencyScore: avgWeekly,
      totalStreak,
      bestStreak,
      totalCompletions,
      habitCount: habits.length,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
