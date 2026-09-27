import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import AppShell from "@/components/ui/AppShell";
import RemindersClient from "@/components/reminders/RemindersClient";
import { Reminder } from "@/types";

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    redirect("/welcome");
  }

  const { db } = await connectToDatabase();
  const rawReminders = await db
    .collection<Reminder>("reminders")
    .find({ userId: session.id })
    .toArray();

  const reminders: Reminder[] = rawReminders.map((r) => ({
    ...r,
    _id: r._id?.toString(),
  }));

  return (
    <AppShell
      title="Reminders"
      userName={session.name}
      userEmail={session.email}
      avatarUrl={session.avatarUrl}
    >
      <RemindersClient reminders={reminders} />
    </AppShell>
  );
}
