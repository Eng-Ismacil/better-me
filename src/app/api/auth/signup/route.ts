import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, ensureIndexes } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { User, Habit } from "@/types";

export async function POST(req: NextRequest) {
  try {
    await ensureIndexes();
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await db
      .collection<User>("users")
      .findOne({ email: normalizedEmail });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    const userResult = await db.collection("users").insertOne({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      avatarUrl: "/images/avatar.jpg",
      memberSince: "New Member",
      createdAt: now,
      updatedAt: now,
    });

    const userId = userResult.insertedId.toString();

    // Seed 3 starter habits for new user
    const starterHabits: Omit<Habit, "_id">[] = [
      {
        userId,
        name: "Morning Hydration",
        description: "Drink 500ml water after waking up",
        category: "health",
        icon: "water_drop",
        frequency: "daily",
        target: 1,
        targetUnit: "times",
        difficulty: "easy",
        preferredTime: "Morning",
        status: "active",
        currentStreak: 0,
        bestStreak: 0,
        totalCompletions: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        userId,
        name: "Read 10 Pages",
        description: "Expand your mind daily",
        category: "learning",
        icon: "menu_book",
        frequency: "daily",
        target: 1,
        targetUnit: "times",
        difficulty: "easy",
        preferredTime: "Evening",
        status: "active",
        currentStreak: 0,
        bestStreak: 0,
        totalCompletions: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        userId,
        name: "Daily Reflection",
        description: "Note one win and one learning",
        category: "productivity",
        icon: "edit_note",
        frequency: "daily",
        target: 1,
        targetUnit: "times",
        difficulty: "easy",
        preferredTime: "Evening",
        status: "active",
        currentStreak: 0,
        bestStreak: 0,
        totalCompletions: 0,
        createdAt: now,
        updatedAt: now,
      },
    ];

    await db.collection("habits").insertMany(starterHabits);

    // Create session cookie
    await createSession(userId);

    return NextResponse.json({ success: true, redirect: "/home" });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
