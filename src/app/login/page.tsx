import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginClient from "@/components/auth/LoginClient";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/home");
  }

  return <LoginClient />;
}
