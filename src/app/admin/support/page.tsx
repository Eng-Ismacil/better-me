import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";
import AdminSupportClient from "@/components/admin/AdminSupportClient";

export const dynamic = "force-dynamic";

export default async function AdminSupportPage() {
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
    <AdminSupportClient
      adminUser={{
        id: session.id,
        name: session.name,
        email: session.email,
      }}
    />
  );
}
