import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase, ensureIndexes } from "@/lib/db";
import { requireAdmin, AdminAuthError } from "@/lib/admin";

function adminError(err: unknown) {
  if (err instanceof AdminAuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  const error = err as Error;
  return NextResponse.json({ error: error.message }, { status: 500 });
}

export async function GET() {
  try {
    await requireAdmin();
    await ensureIndexes();
    const { db } = await connectToDatabase();

    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().slice(0, 10);

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      disabledUsers,
      deletedUsers,
      totalHabits,
      completionsToday,
      completionsWeek,
      topStreakHabits,
      completionRanking,
    ] = await Promise.all([
      db.collection("users").countDocuments({ deletedAt: { $in: [null, undefined] } }),
      db.collection("users").countDocuments({
        deletedAt: { $in: [null, undefined] },
        $or: [{ status: "active" }, { status: { $exists: false } }, { status: null }],
      }),
      db.collection("users").countDocuments({
        deletedAt: { $in: [null, undefined] },
        status: "inactive",
      }),
      db.collection("users").countDocuments({
        deletedAt: { $in: [null, undefined] },
        status: "disabled",
      }),
      db.collection("users").countDocuments({ deletedAt: { $ne: null } }),
      db.collection("habits").countDocuments({}),
      db.collection("habitCompletions").countDocuments({ date: today }),
      db.collection("habitCompletions").countDocuments({ date: { $gte: weekAgoStr } }),
      db
        .collection("habits")
        .find({})
        .sort({ currentStreak: -1 })
        .limit(30)
        .toArray(),
      db
        .collection("habits")
        .aggregate([
          {
            $group: {
              _id: "$userId",
              totalCompletions: { $sum: "$totalCompletions" },
              bestStreak: { $max: "$bestStreak" },
              currentStreak: { $max: "$currentStreak" },
              habitCount: { $sum: 1 },
            },
          },
          { $sort: { totalCompletions: -1 } },
          { $limit: 10 },
        ])
        .toArray(),
    ]);

    // Usage graph — last 14 days (single aggregation, not 14 sequential queries)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    const fourteenDaysAgoStr = fourteenDaysAgo.toISOString().slice(0, 10);

    const usageGraphRaw = await db
      .collection("habitCompletions")
      .aggregate([
        { $match: { date: { $gte: fourteenDaysAgoStr } } },
        { $group: { _id: "$date", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    const usageMap = new Map(usageGraphRaw.map((r) => [r._id, r.count]));
    const usageGraph: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const date = d.toISOString().slice(0, 10);
      usageGraph.push({ date, count: usageMap.get(date) ?? 0 });
    }

    // Resolve user names for top streaks
    const streakUserIds = [
      ...new Set(topStreakHabits.map((h) => String(h.userId)).filter(Boolean)),
    ];
    const rankingUserIds = completionRanking.map((r) => String(r._id));
    const allIds = [...new Set([...streakUserIds, ...rankingUserIds])].filter((id) =>
      ObjectId.isValid(id)
    );

    const users = allIds.length
      ? await db
          .collection("users")
          .find({ _id: { $in: allIds.map((id) => new ObjectId(id)) } })
          .project({ name: 1, email: 1, avatarUrl: 1 })
          .toArray()
      : [];

    const userMap = new Map(
      users.map((u) => [
        String(u._id),
        { name: u.name, email: u.email, avatarUrl: u.avatarUrl },
      ])
    );

    // Best streak per user (top 10)
    const streakByUser = new Map<
      string,
      { userId: string; name: string; email: string; avatarUrl?: string; currentStreak: number; bestStreak: number; habitName: string }
    >();

    for (const h of topStreakHabits) {
      const uid = String(h.userId);
      const existing = streakByUser.get(uid);
      const current = Number(h.currentStreak || 0);
      const best = Number(h.bestStreak || 0);
      if (!existing || current > existing.currentStreak) {
        const u = userMap.get(uid);
        streakByUser.set(uid, {
          userId: uid,
          name: u?.name || "Unknown",
          email: u?.email || "",
          avatarUrl: u?.avatarUrl,
          currentStreak: current,
          bestStreak: best,
          habitName: String(h.name || "Habit"),
        });
      }
    }

    const topStreaks = Array.from(streakByUser.values())
      .sort((a, b) => b.currentStreak - a.currentStreak)
      .slice(0, 10);

    const topCompleters = completionRanking.map((r) => {
      const uid = String(r._id);
      const u = userMap.get(uid);
      return {
        userId: uid,
        name: u?.name || "Unknown",
        email: u?.email || "",
        avatarUrl: u?.avatarUrl,
        totalCompletions: r.totalCompletions || 0,
        bestStreak: r.bestStreak || 0,
        currentStreak: r.currentStreak || 0,
        habitCount: r.habitCount || 0,
      };
    });

    const responseData = {
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
          disabled: disabledUsers,
          deleted: deletedUsers,
        },
        habits: totalHabits,
        completionsToday,
        completionsWeek,
        usageGraph,
        topStreaks,
        topCompleters,
      },
    };
    return NextResponse.json(responseData, {
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    return adminError(err);
  }
}

