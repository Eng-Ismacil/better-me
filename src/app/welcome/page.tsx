import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import WelcomeClient from "@/components/auth/WelcomeClient";

export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  const session = await getSession();
  if (session) {
    redirect("/home");
  }

  return <WelcomeClient />;
}
