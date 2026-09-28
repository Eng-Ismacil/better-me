import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";
import { Habit } from "@/types";
import AppShell from "@/components/ui/AppShell";
import HabitDetailClient from "@/components/habits/HabitDetailClient";

export const dynamic = "force-dynamic";

export default async function HabitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  let session;
  try {
    session = await requireAuth();
  } catch {
    redirect("/welcome");
  }

  const { id } = await params;
  const { db } = await connectToDatabase();

  let habit = null;
  try {
    const raw = await db.collection<Habit>("habits").findOne({
      _id: new ObjectId(id) as unknown as string,
      userId: session.id,
    });
    if (raw) {
      habit = { ...raw, _id: raw._id?.toString() };
    }
  } catch {
    habit = null;
  }

  if (!habit) {
    redirect("/habits");
  }

  return (
    <AppShell
      title="Habit Details"
      userName={session.name}
      userEmail={session.email}
      avatarUrl={session.avatarUrl}
    >
      <HabitDetailClient habit={habit} />
    </AppShell>
  );
}
