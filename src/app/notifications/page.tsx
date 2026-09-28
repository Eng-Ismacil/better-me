import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getUserNotifications } from "@/lib/notifications";
import AppShell from "@/components/ui/AppShell";
import NotificationsClient from "@/components/notifications/NotificationsClient";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    redirect("/welcome");
  }

  const notifications = await getUserNotifications(session.id);

  return (
    <AppShell
      title="Notifications"
      userName={session.name}
      userEmail={session.email}
      avatarUrl={session.avatarUrl}
    >
      <NotificationsClient initialNotifications={notifications} />
    </AppShell>
  );
}
