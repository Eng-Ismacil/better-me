import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import AppShell from "@/components/ui/AppShell";
import NewHabitForm from "@/components/habits/NewHabitForm";

export default async function NewHabitPage() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    redirect("/welcome");
  }

  return (
    <AppShell
      title="New Habit"
      userName={session.name}
      userEmail={session.email}
      avatarUrl={session.avatarUrl}
    >
      <NewHabitForm />
    </AppShell>
  );
}
