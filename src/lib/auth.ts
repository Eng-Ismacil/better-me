import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { connectToDatabase, ensureIndexes } from "./db";
import { getMaintenanceSettings } from "./maintenance";
import { ObjectId } from "mongodb";
import { User, Habit } from "@/types";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "betterme-super-secret-jwt-key-minimum-32-chars!!"
);
const SESSION_COOKIE_NAME = "betterme_session";
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  memberSince?: string;
  isAdmin?: boolean;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<string> {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return token;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.sub;
    if (!userId || typeof userId !== "string") return null;

    await ensureIndexes();
    const { db } = await connectToDatabase();
    const user = await db
      .collection<User>("users")
      .findOne({ _id: new ObjectId(userId) as unknown as string });

    if (!user) return null;
    if (user.deletedAt) return null;
    if (user.status === "disabled") return null;

    const sessionUser: SessionUser = {
      id: user._id?.toString() || userId,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl || "/images/avatar.jpg",
      memberSince: user.memberSince || "6 Months",
      isAdmin: !!user.isAdmin,
    };
    if (!sessionUser.isAdmin && (await getMaintenanceSettings()).enabled) return null;
    return sessionUser;
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

// Seed the default Stitch demo persona if not present
export async function seedDemoUserIfNeeded(): Promise<string> {
  await ensureIndexes();
  const { db } = await connectToDatabase();
  const demoEmail = "ismacil.dahir@example.com";

  let demoUser = await db.collection<User>("users").findOne({ email: demoEmail });

  if (!demoUser) {
    const hashedPassword = await hashPassword("BetterMe2026!");
    const now = new Date().toISOString();

    const insertResult = await db.collection("users").insertOne({
      name: "Ismacil Dahir",
      email: demoEmail,
      passwordHash: hashedPassword,
      avatarUrl: "/images/avatar.jpg",
      memberSince: "6 Months",
      timezone: "UTC",
      createdAt: now,
      updatedAt: now,
    });

    const userId = insertResult.insertedId.toString();

    // Seed default Stitch habits
    const initialHabits: Omit<Habit, "_id">[] = [
      {
        userId,
        name: "Drink Water",
        description: "Maintain optimal hydration with 2.5L throughout the day",
        category: "health",
        icon: "water_drop",
        frequency: "daily",
        target: 1,
        targetUnit: "times",
        difficulty: "easy",
        preferredTime: "Morning",
        status: "active",
        currentStreak: 7,
        bestStreak: 14,
        totalCompletions: 34,
        createdAt: now,
        updatedAt: now,
      },
      {
        userId,
        name: "Read 10 Minutes",
        description: "Non-fiction or personal development reading",
        category: "learning",
        icon: "menu_book",
        frequency: "daily",
        target: 1,
        targetUnit: "times",
        difficulty: "easy",
        preferredTime: "Evening",
        status: "active",
        currentStreak: 4,
        bestStreak: 21,
        totalCompletions: 28,
        createdAt: now,
        updatedAt: now,
      },
      {
        userId,
        name: "Exercise",
        description: "HIIT or resistance strength training workout",
        category: "fitness",
        icon: "fitness_center",
        frequency: "daily",
        target: 1,
        targetUnit: "times",
        difficulty: "medium",
        preferredTime: "Morning",
        status: "active",
        currentStreak: 2,
        bestStreak: 12,
        totalCompletions: 24,
        createdAt: now,
        updatedAt: now,
      },
      {
        userId,
        name: "Meditate",
        description: "Mindful breathing and stillness meditation",
        category: "mindfulness",
        icon: "self_improvement",
        frequency: "daily",
        target: 1,
        targetUnit: "times",
        difficulty: "easy",
        preferredTime: "Morning",
        status: "active",
        currentStreak: 1,
        bestStreak: 9,
        totalCompletions: 19,
        createdAt: now,
        updatedAt: now,
      },
      {
        userId,
        name: "Sleep on Time",
        description: "In bed with screens off before 11:00 PM",
        category: "health",
        icon: "bedtime",
        frequency: "daily",
        target: 1,
        targetUnit: "times",
        difficulty: "easy",
        preferredTime: "Evening",
        status: "active",
        currentStreak: 6,
        bestStreak: 10,
        totalCompletions: 25,
        createdAt: now,
        updatedAt: now,
      },
      {
        userId,
        name: "Write Daily Review",
        description: "Reflect on wins, learnings, and next day intentions",
        category: "productivity",
        icon: "edit_note",
        frequency: "daily",
        target: 1,
        targetUnit: "times",
        difficulty: "easy",
        preferredTime: "Evening",
        status: "active",
        currentStreak: 3,
        bestStreak: 15,
        totalCompletions: 22,
        createdAt: now,
        updatedAt: now,
      },
    ];

    const habitInserts = await db.collection("habits").insertMany(initialHabits);
    const habitIds = Object.values(habitInserts.insertedIds).map((id) =>
      id.toString()
    );

    // Seed today's completions for first 5 habits (as in Stitch screenshot: 5 of 6 completed)
    const todayStr = new Date().toISOString().split("T")[0];
    const completionDocs = habitIds.slice(0, 5).map((hId) => ({
      userId,
      habitId: hId,
      date: todayStr,
      completedAt: now,
    }));

    if (completionDocs.length > 0) {
      await db.collection("habitCompletions").insertMany(completionDocs);
    }

    // Seed past 7 days completions to show the weekly consistency strip from Stitch
    const pastCompletions = [];
    for (let i = 1; i <= 6; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split("T")[0];
      // 5 of 6 habits completed on past days
      for (let j = 0; j < 5; j++) {
        pastCompletions.push({
          userId,
          habitId: habitIds[j],
          date: dStr,
          completedAt: d.toISOString(),
        });
      }
    }
    if (pastCompletions.length > 0) {
      await db.collection("habitCompletions").insertMany(pastCompletions);
    }

    // Seed a daily check-in for today
    await db.collection("dailyCheckIns").insertOne({
      userId,
      date: todayStr,
      mood: "calm_focused",
      moodLabel: "Calm & Focused",
      energy: 9,
      notes: "Feeling energized after morning hydration and meditation session.",
      loggedAt: now,
    });

    // Seed default Morning Routine
    await db.collection("routines").insertOne({
      userId,
      name: "Morning Flow",
      description: "Start the day with mindful momentum and clarity",
      icon: "wb_sunny",
      timeOfDay: "07:00 AM",
      habits: [
        { habitId: habitIds[0], order: 0 },
        { habitId: habitIds[3], order: 1 },
        { habitId: habitIds[2], order: 2 },
      ],
      createdAt: now,
      updatedAt: now,
    });

    // Seed reminders
    await db.collection("reminders").insertOne({
      userId,
      habitId: habitIds[0],
      habitTitle: "Drink Water",
      time: "07:30 AM",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      enabled: true,
      smartTiming: true,
      createdAt: now,
    });

    return userId;
  }

  return demoUser._id?.toString() || "";
}
