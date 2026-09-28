import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import AppShell from "@/components/ui/AppShell";
import SettingsClient from "@/components/settings/SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    redirect("/welcome");
  }

  return (
    <AppShell
      title="Settings"
      userName={session.name}
      userEmail={session.email}
      avatarUrl={session.avatarUrl}
    >
      <SettingsClient
        user={{
          id: session.id,
          name: session.name,
          email: session.email,
          avatarUrl: session.avatarUrl || "/images/avatar.jpg",
        }}
      />
    </AppShell>
  );
}
