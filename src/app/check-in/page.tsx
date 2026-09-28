import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getTodayDateString } from "@/lib/habits";
import AppShell from "@/components/ui/AppShell";
import CheckInClient from "@/components/checkin/CheckInClient";
import { DailyCheckIn } from "@/types";

export const dynamic = "force-dynamic";

export default async function CheckInPage() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    redirect("/welcome");
  }

  const { db } = await connectToDatabase();
  const today = getTodayDateString();
  const rawCheckIn = await db
    .collection<DailyCheckIn>("dailyCheckIns")
    .findOne({ userId: session.id, date: today });

  const initialCheckIn = rawCheckIn
    ? {
        ...rawCheckIn,
        _id: rawCheckIn._id?.toString(),
      }
    : null;

  return (
    <AppShell
      title="Daily Check-in"
      userName={session.name}
      userEmail={session.email}
      avatarUrl={session.avatarUrl}
    >
      <CheckInClient initialCheckIn={initialCheckIn} todayDate={today} />
    </AppShell>
  );
}
