import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import {
  getUserHabits,
  getUserCompletionsForDate,
  getWeeklyConsistency,
  getTodayDateString,
} from "@/lib/habits";
import AppShell from "@/components/ui/AppShell";
import HomeDashboard from "@/components/home/HomeDashboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    redirect("/welcome");
  }

  const today = getTodayDateString();
  const [habits, completedHabitIds, weeklyDays] = await Promise.all([
    getUserHabits(session.id),
    getUserCompletionsForDate(session.id, today),
    getWeeklyConsistency(session.id),
  ]);

  return (
    <AppShell
      title="Home"
      userName={session.name}
      userEmail={session.email}
      avatarUrl={session.avatarUrl}
    >
      <HomeDashboard
        userName={session.name.split(" ")[0]}
        habits={habits}
        initialCompletedHabitIds={completedHabitIds}
        weeklyDays={weeklyDays}
      />
    </AppShell>
  );
}
