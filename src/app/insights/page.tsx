import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getHabitHealthMetrics, getWeeklyConsistency, getUserHabits } from "@/lib/habits";
import AppShell from "@/components/ui/AppShell";
import InsightsClient from "@/components/insights/InsightsClient";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    redirect("/welcome");
  }

  const [habits, metrics, weeklyDays] = await Promise.all([
    getUserHabits(session.id),
    getHabitHealthMetrics(session.id),
    getWeeklyConsistency(session.id),
  ]);

  // Compute a global consistency score based on weekly days
  const avgWeekly = weeklyDays.length > 0
    ? Math.round(weeklyDays.reduce((s, d) => s + d.completionRate, 0) / weeklyDays.length)
    : 0;

  // Streak stats
  const totalStreak = habits.reduce((s, h) => s + (h.currentStreak || 0), 0);
  const bestStreak = Math.max(...habits.map((h) => h.bestStreak || 0), 0);
  const totalCompletions = habits.reduce((s, h) => s + (h.totalCompletions || 0), 0);

  return (
    <AppShell
      title="Insights"
      userName={session.name}
      userEmail={session.email}
      avatarUrl={session.avatarUrl}
    >
      <InsightsClient
        metrics={metrics}
        weeklyDays={weeklyDays}
        consistencyScore={avgWeekly}
        totalStreak={totalStreak}
        bestStreak={bestStreak}
        totalCompletions={totalCompletions}
        habitCount={habits.length}
      />
    </AppShell>
  );
}
