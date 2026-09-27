import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getUserHabits } from "@/lib/habits";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const habits = await getUserHabits(session.id);
    const totalCompletions = await db
      .collection("habitCompletions")
      .countDocuments({ userId: session.id });

    const maxStreak = habits.reduce(
      (acc, h) => Math.max(acc, h.bestStreak || 0, h.currentStreak || 0),
      0
    );

    const achievementsList = [
      {
        code: "first_habit",
        title: "First Step",
        description: "Created your very first habit in BetterMe",
        icon: "flag",
        unlocked: habits.length >= 1,
        progress: Math.min(100, habits.length * 100),
        targetText: "1 habit created",
      },
      {
        code: "streak_7",
        title: "7-Day Momentum",
        description: "Maintained an unbroken 7-day habit streak",
        icon: "local_fire_department",
        unlocked: maxStreak >= 7,
        progress: Math.min(100, Math.round((maxStreak / 7) * 100)),
        targetText: `${Math.min(7, maxStreak)}/7 days`,
      },
      {
        code: "streak_14",
        title: "Fortnight Focus",
        description: "Reached a 14-day consistency streak",
        icon: "verified",
        unlocked: maxStreak >= 14,
        progress: Math.min(100, Math.round((maxStreak / 14) * 100)),
        targetText: `${Math.min(14, maxStreak)}/14 days`,
      },
      {
        code: "streak_30",
        title: "Monthly Mastery",
        description: "Sustained a full 30-day streak of personal growth",
        icon: "military_tech",
        unlocked: maxStreak >= 30,
        progress: Math.min(100, Math.round((maxStreak / 30) * 100)),
        targetText: `${Math.min(30, maxStreak)}/30 days`,
      },
      {
        code: "completions_100",
        title: "Centurion Ritual",
        description: "Recorded 100 total habit completions",
        icon: "workspace_premium",
        unlocked: totalCompletions >= 100,
        progress: Math.min(100, Math.round((totalCompletions / 100) * 100)),
        targetText: `${Math.min(100, totalCompletions)}/100 completions`,
      },
      {
        code: "routine_builder",
        title: "Architect of Routines",
        description: "Grouped habits into a cohesive daily flow",
        icon: "auto_stories",
        unlocked: true,
        progress: 100,
        targetText: "Morning Flow active",
      },
    ];

    return NextResponse.json({ achievements: achievementsList });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
