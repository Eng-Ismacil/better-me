import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import AppShell from "@/components/ui/AppShell";
import SupportChatClient from "@/components/support/SupportChatClient";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    redirect("/welcome");
  }

  return (
    <AppShell
      title="Support & Help"
      userName={session.name}
      userEmail={session.email}
      avatarUrl={session.avatarUrl}
    >
      <SupportChatClient
        currentUser={{
          id: session.id,
          name: session.name,
          email: session.email,
          avatarUrl: session.avatarUrl,
        }}
      />
    </AppShell>
  );
}
