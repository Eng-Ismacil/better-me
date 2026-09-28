import { connectToDatabase } from "./db";
import { ObjectId } from "mongodb";
import { AppNotification } from "@/types";

export async function getUserNotifications(userId: string): Promise<AppNotification[]> {
  const { db } = await connectToDatabase();
  const notifs = await db
    .collection<AppNotification>("notifications")
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(30)
    .toArray();

  if (notifs.length === 0) {
    // Seed initial welcome & progress notifications
    const now = new Date();
    const seeded: Omit<AppNotification, "_id">[] = [
      {
        userId,
        title: "Kusoo dhowaw BetterMe! 👋",
        message: "Ku bilow dhisida caadooyinkaaga maalinlaha ah si aad u gaarto guul joogto ah.",
        type: "system",
        link: "/habits",
        read: false,
        createdAt: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
      },
      {
        userId,
        title: "Dabaaldegga Streak-ga 7-da Maalmood 🔥",
        message: "Hambalyo! Waxaad si xiriir ah u dhamaystirtay caadooyinkaaga 7 maalmood oo xiriir ah.",
        type: "streak",
        link: "/achievements",
        read: false,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 4).toISOString(),
      },
      {
        userId,
        title: "Ogeysiiska Jeeg-gareynta Maalinlaha 📝",
        message: "Waa xilligii aad diiwaangelin lahayd xaaladdaada iyo dareenkaaga maanta.",
        type: "reminder",
        link: "/check-in",
        read: true,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(),
      },
      {
        userId,
        title: "Guul Cusub Ayaad Furtay! 🏆",
        message: "Waxaad furtay billadda 'First Step' kadib markii aad caadadaadii ugu horreysay bilowday.",
        type: "achievement",
        link: "/achievements",
        read: true,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
      },
    ];

    await db.collection("notifications").insertMany(seeded);

    const seededNotifs = await db
      .collection<AppNotification>("notifications")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return seededNotifs.map((n) => ({
      ...n,
      _id: n._id?.toString(),
    }));
  }

  return notifs.map((n) => ({
    ...n,
    _id: n._id?.toString(),
  }));
}

export async function createNotification(
  userId: string,
  data: {
    title: string;
    message: string;
    type?: AppNotification["type"];
    link?: string;
  }
): Promise<void> {
  const { db } = await connectToDatabase();
  await db.collection("notifications").insertOne({
    userId,
    title: data.title,
    message: data.message,
    type: data.type || "system",
    link: data.link || "/home",
    read: false,
    createdAt: new Date().toISOString(),
  });
}

export async function markNotificationAsRead(
  userId: string,
  notificationId?: string
): Promise<void> {
  const { db } = await connectToDatabase();
  if (notificationId && notificationId !== "all") {
    await db.collection("notifications").updateOne(
      { _id: new ObjectId(notificationId), userId },
      { $set: { read: true } }
    );
  } else {
    // Mark all as read
    await db
      .collection("notifications")
      .updateMany({ userId, read: false }, { $set: { read: true } });
  }
}
