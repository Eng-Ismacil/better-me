import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getUserHabits, getUserCompletionsForDate, getTodayDateString } from "@/lib/habits";
import AppShell from "@/components/ui/AppShell";
import CalendarClient from "@/components/calendar/CalendarClient";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    redirect("/welcome");
  }

  // Get the last 60 days of completion data for the calendar
  const { db } = await connectToDatabase();
  const today = getTodayDateString();

  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const sixtyDaysAgoStr = sixtyDaysAgo.toISOString().split("T")[0];

  const habits = await getUserHabits(session.id);
  const totalHabits = habits.length || 1;

  // Get all completions in the last 60 days
  const completions = await db
    .collection("habitCompletions")
    .find({
      userId: session.id,
      date: { $gte: sixtyDaysAgoStr, $lte: today },
    })
    .toArray();

  // Aggregate by date
  const completionsByDate: Record<string, number> = {};
  for (const c of completions) {
    const d = c.date as string;
    completionsByDate[d] = (completionsByDate[d] || 0) + 1;
  }

  // Build calendar data map
  const calendarData: Record<string, { count: number; rate: number }> = {};
  for (const [date, count] of Object.entries(completionsByDate)) {
    calendarData[date] = {
      count,
      rate: Math.min(100, Math.round((count / totalHabits) * 100)),
    };
  }

  const todayCompletions = await getUserCompletionsForDate(session.id, today);

  return (
    <AppShell
      title="Calendar"
      userName={session.name}
      userEmail={session.email}
      avatarUrl={session.avatarUrl}
    >
      <CalendarClient
        calendarData={calendarData}
        totalHabits={totalHabits}
        todayCompletedIds={todayCompletions}
        habits={habits}
      />
    </AppShell>
  );
}
