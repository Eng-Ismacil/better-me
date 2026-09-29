import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const { db } = await connectToDatabase();
  const user = await db.collection("users").findOne({
    _id: new ObjectId(session.id),
  });

  if (!user || user.deletedAt || user.status === "disabled" || !user.isAdmin) {
    redirect("/home");
  }

  return (
    <AdminShell
      adminName={user.name || session.name || "Admin"}
      adminEmail={user.email || session.email}
      adminAvatarUrl={user.avatarUrl || session.avatarUrl}
    >
      {children}
    </AdminShell>
  );
}
