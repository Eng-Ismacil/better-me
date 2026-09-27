import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getUserHabits } from "@/lib/habits";
import AppShell from "@/components/ui/AppShell";
import RoutinesClient from "@/components/routines/RoutinesClient";
import { Routine } from "@/types";

export const dynamic = "force-dynamic";

export default async function RoutinesPage() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    redirect("/welcome");
  }

  const { db } = await connectToDatabase();
  const [habits, rawRoutines] = await Promise.all([
    getUserHabits(session.id),
    db.collection<Routine>("routines").find({ userId: session.id }).toArray(),
  ]);

  const routines: Routine[] = rawRoutines.map((r) => ({
    ...r,
    _id: r._id?.toString(),
  }));

  return (
    <AppShell
      title="Routines"
      userName={session.name}
      userEmail={session.email}
      avatarUrl={session.avatarUrl}
    >
      <RoutinesClient routines={routines} habits={habits} />
    </AppShell>
  );
}
