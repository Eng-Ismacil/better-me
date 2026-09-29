import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import AppShell from "@/components/ui/AppShell";
import AchievementsClient from "@/components/achievements/AchievementsClient";
import { calculateUserAchievements } from "@/lib/achievements";

export const dynamic = "force-dynamic";

export default async function AchievementsPage() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    redirect("/welcome");
  }

  const rawProfile = await calculateUserAchievements(session.id);
  const profile = JSON.parse(JSON.stringify(rawProfile));

  return (
    <AppShell
      title="Achievements"
      userName={session.name}
      userEmail={session.email}
      avatarUrl={session.avatarUrl}
    >
      <AchievementsClient initialProfile={profile} />
    </AppShell>
  );
}
