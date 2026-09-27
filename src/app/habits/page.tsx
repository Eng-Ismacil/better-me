import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getUserHabits, getUserCompletionsForDate, getTodayDateString } from "@/lib/habits";
import AppShell from "@/components/ui/AppShell";
import HabitsClient from "@/components/habits/HabitsClient";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    redirect("/welcome");
  }

  const today = getTodayDateString();
  const [habits, completedIds] = await Promise.all([
    getUserHabits(session.id),
    getUserCompletionsForDate(session.id, today),
  ]);

  return (
    <AppShell
      title="My Habits"
      userName={session.name}
      userEmail={session.email}
      avatarUrl={session.avatarUrl}
    >
      <HabitsClient habits={habits} completedIds={completedIds} />
    </AppShell>
  );
}
