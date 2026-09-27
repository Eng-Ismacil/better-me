import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import AppShell from "@/components/ui/AppShell";
import ProfileClient from "@/components/profile/ProfileClient";
import { getUserHabits } from "@/lib/habits";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    redirect("/welcome");
  }

  const { db } = await connectToDatabase();
  const habits = await getUserHabits(session.id);

  // Get total completions count
  const completionCount = await db
    .collection("habitCompletions")
    .countDocuments({ userId: session.id });

  // Get achievements count
  const achievementsCount = await db
    .collection("userAchievements")
    .countDocuments({ userId: session.id });

  const totalStreak = habits.reduce((s, h) => s + (h.currentStreak || 0), 0);
  const bestStreak = Math.max(...habits.map((h) => h.bestStreak || 0), 0);

  return (
    <AppShell
      title="Profile"
      userName={session.name}
      userEmail={session.email}
      avatarUrl={session.avatarUrl}
    >
      <ProfileClient
        user={{
          name: session.name,
          email: session.email,
          avatarUrl: session.avatarUrl || "/images/avatar.jpg",
          memberSince: session.memberSince || "6 Months",
        }}
        stats={{
          habits: habits.length,
          completions: completionCount,
          achievements: achievementsCount,
          streak: bestStreak,
          totalStreak,
        }}
      />
    </AppShell>
  );
}
