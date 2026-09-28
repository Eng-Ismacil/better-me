import { connectToDatabase } from "./db";
import { ObjectId } from "mongodb";
import {
  Habit,
  HabitCompletion,
  WeeklyConsistencyDay,
  HabitHealthMetric,
} from "@/types";

export function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

export async function getUserHabits(userId: string): Promise<Habit[]> {
  const { db } = await connectToDatabase();
  const rawHabits = await db
    .collection<Habit>("habits")
    .find({ userId, status: { $ne: "archived" } })
    .sort({ createdAt: 1 })
    .toArray();

  return rawHabits.map((h) => ({
    ...h,
    _id: h._id?.toString(),
  }));
}

export async function getUserCompletionsForDate(
  userId: string,
  date: string
): Promise<string[]> {
  const { db } = await connectToDatabase();
  const completions = await db
    .collection<HabitCompletion>("habitCompletions")
    .find({ userId, date })
    .toArray();

  return completions.map((c) => c.habitId);
}

export async function toggleHabitCompletion(
  userId: string,
  habitId: string,
  date: string
): Promise<{ completed: boolean; currentStreak: number }> {
  const { db } = await connectToDatabase();

  const existing = await db
    .collection<HabitCompletion>("habitCompletions")
    .findOne({ userId, habitId, date });

  const habit = await db
    .collection<Habit>("habits")
    .findOne({ _id: new ObjectId(habitId) as unknown as string, userId });

  if (!habit) {
    throw new Error("Habit not found");
  }

  if (existing) {
    // Uncomplete
    await db
      .collection("habitCompletions")
      .deleteOne({ _id: existing._id as unknown as ObjectId });

    const newStreak = Math.max(0, (habit.currentStreak || 1) - 1);
    const newTotal = Math.max(0, (habit.totalCompletions || 1) - 1);

    await db.collection("habits").updateOne(
      { _id: new ObjectId(habitId) },
      {
        $set: {
          currentStreak: newStreak,
          totalCompletions: newTotal,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    return { completed: false, currentStreak: newStreak };
  } else {
    // Mark Complete
    await db.collection("habitCompletions").insertOne({
      userId,
      habitId,
      date,
      completedAt: new Date().toISOString(),
    });

    const newStreak = (habit.currentStreak || 0) + 1;
    const newBest = Math.max(habit.bestStreak || 0, newStreak);
    const newTotal = (habit.totalCompletions || 0) + 1;

    await db.collection("habits").updateOne(
      { _id: new ObjectId(habitId) },
      {
        $set: {
          currentStreak: newStreak,
          bestStreak: newBest,
          totalCompletions: newTotal,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    return { completed: true, currentStreak: newStreak };
  }
}

export async function getWeeklyConsistency(
  userId: string
): Promise<WeeklyConsistencyDay[]> {
  const { db } = await connectToDatabase();
  const habits = await getUserHabits(userId);
  const totalActiveHabits = habits.length || 1;

  const days: WeeklyConsistencyDay[] = [];
  const today = new Date();

  // Find Monday of current week (assuming Monday start like Stitch)
  const currentDayOfWeek = today.getDay(); // 0 is Sun, 1 is Mon...
  const distanceToMonday = (currentDayOfWeek + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - distanceToMonday);

  const dayLetters = ["M", "T", "W", "T", "F", "S", "S"];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const isToday = dateStr === getTodayDateString();

    const count = await db
      .collection("habitCompletions")
      .countDocuments({ userId, date: dateStr });

    const completionRate = Math.min(
      100,
      Math.round((count / totalActiveHabits) * 100)
    );

    days.push({
      dayName: dayLetters[i],
      date: dateStr,
      isToday,
      completionRate: count > 0 ? completionRate : isToday ? 0 : 0,
      completedCount: count,
      totalHabits: totalActiveHabits,
    });
  }

  return days;
}

export async function getHabitHealthMetrics(
  userId: string
): Promise<HabitHealthMetric[]> {
  const habits = await getUserHabits(userId);
  const { db } = await connectToDatabase();

  // Look at completions across last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysStr = thirtyDaysAgo.toISOString().split("T")[0];

  const metrics: HabitHealthMetric[] = [];

  for (const habit of habits) {
    const completionsCount = await db
      .collection("habitCompletions")
      .countDocuments({
        userId,
        habitId: habit._id,
        date: { $gte: thirtyDaysStr },
      });

    // Score out of 30 days or based on streak
    const rawRate = Math.round((completionsCount / 30) * 100);
    const streakBonus = Math.min(20, (habit.currentStreak || 0) * 2);
    const score = Math.min(99, Math.max(45, rawRate + streakBonus));

    let status: "Healthy" | "Stable" | "At Risk" = "Stable";
    if (score >= 85) status = "Healthy";
    else if (score < 65) status = "At Risk";

    metrics.push({
      habitId: habit._id || "",
      name: habit.name,
      category: habit.category,
      icon: habit.icon,
      score,
      status,
      frequencyText: `${habit.frequency === "daily" ? "Daily" : "Weekdays"} • ${habit.preferredTime || "Anytime"}`,
    });
  }

  return metrics;
}
