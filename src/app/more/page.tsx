import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getUserHabits, getUserCompletionsForDate, getTodayDateString } from "@/lib/habits";
import AppShell from "@/components/ui/AppShell";
import MoreMenuClient from "@/components/more/MoreMenuClient";

export const dynamic = "force-dynamic";

export default async function MorePage() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    redirect("/welcome");
  }

  const today = getTodayDateString();
  const { db } = await connectToDatabase();

  // Fetch real user data for rich stats
  const [habits, completedToday, totalCheckins, totalRoutines] = await Promise.all([
    getUserHabits(session.id),
    getUserCompletionsForDate(session.id, today),
    db.collection("checkins").countDocuments({ userId: session.id }).catch(() => 0),
    db.collection("routines").countDocuments({ userId: session.id }).catch(() => 0),
  ]);

  // Calculate maximum streak across all user habits
  const maxStreak = habits.length > 0
    ? Math.max(...habits.map((h) => h.currentStreak || 0), 0)
    : 0;

  return (
    <AppShell
      title="Menu"
      userName={session.name}
      userEmail={session.email}
      avatarUrl={session.avatarUrl}
    >
      <MoreMenuClient
        user={{
          name: session.name,
          email: session.email,
          avatarUrl: session.avatarUrl || "/images/avatar.jpg",
          role: session.email === "ismacildahir46@gmail.com" ? "admin" : "user",
        }}
        stats={{
          totalHabits: habits.length,
          completedTodayCount: completedToday.length,
          maxStreak,
          totalCheckins,
          totalRoutines,
        }}
        habits={habits.map((h) => ({
          id: h._id || "",
          title: h.name,
          category: h.category,
          frequency: h.frequency,
          streak: h.currentStreak || 0,
        }))}
      />
    </AppShell>
  );
}
