import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import AppShell from "@/components/ui/AppShell";
import FinanceClient from "@/components/finance/FinanceClient";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    redirect("/welcome");
  }

  return (
    <AppShell
      title={session.name}
      userName={session.name}
      userEmail={session.email}
      avatarUrl={session.avatarUrl}
    >
      <FinanceClient />
    </AppShell>
  );
}
