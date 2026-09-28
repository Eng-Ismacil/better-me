import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getUserHabits } from "@/lib/habits";
import AppShell from "@/components/ui/AppShell";
import AchievementsClient from "@/components/achievements/AchievementsClient";

export const dynamic = "force-dynamic";

export default async function AchievementsPage() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    redirect("/welcome");
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

  const initialAchievements = [
    {
      code: "first_habit",
      title: "First Step / Talaabadii Ugu Horreysay",
      description: "Created your very first habit in BetterMe to start your growth journey",
      icon: "flag",
      unlocked: habits.length >= 1,
      progress: Math.min(100, habits.length * 100),
      targetText: "1 habit created",
    },
    {
      code: "streak_7",
      title: "7-Day Momentum / Joogteyn 7-Maalmood ah",
      description: "Maintained an unbroken 7-day habit streak with deliberate focus",
      icon: "local_fire_department",
      unlocked: maxStreak >= 7,
      progress: Math.min(100, Math.round((maxStreak / 7) * 100)),
      targetText: `${Math.min(7, maxStreak)}/7 days`,
    },
    {
      code: "streak_14",
      title: "Fortnight Focus / Xoogga 14-ka Maalmood",
      description: "Reached a 14-day consistency streak and established true discipline",
      icon: "verified",
      unlocked: maxStreak >= 14,
      progress: Math.min(100, Math.round((maxStreak / 14) * 100)),
      targetText: `${Math.min(14, maxStreak)}/14 days`,
    },
    {
      code: "streak_30",
      title: "Monthly Mastery / Xirfadda Bishii",
      description: "Sustained a full 30-day streak of active personal development",
      icon: "military_tech",
      unlocked: maxStreak >= 30,
      progress: Math.min(100, Math.round((maxStreak / 30) * 100)),
      targetText: `${Math.min(30, maxStreak)}/30 days`,
    },
    {
      code: "completions_100",
      title: "Centurion Ritual / 100 Dhammaystir",
      description: "Successfully recorded 100 total habit completions across all rituals",
      icon: "workspace_premium",
      unlocked: totalCompletions >= 100,
      progress: Math.min(100, Math.round((totalCompletions / 100) * 100)),
      targetText: `${Math.min(100, totalCompletions)}/100 completions`,
    },
    {
      code: "routine_builder",
      title: "Architect of Routines / Dhisaha Nidaamka",
      description: "Grouped your daily habits into cohesive, mindful morning & evening flows",
      icon: "auto_stories",
      unlocked: true,
      progress: 100,
      targetText: "Daily Routines Active",
    },
  ];

  return (
    <AppShell
      title="Achievements"
      userName={session.name}
      userEmail={session.email}
      avatarUrl={session.avatarUrl}
    >
      <AchievementsClient
        initialAchievements={initialAchievements}
        userStats={{
          habitsCount: habits.length,
          completionsCount: totalCompletions,
          bestStreak: maxStreak,
        }}
      />
    </AppShell>
  );
}
