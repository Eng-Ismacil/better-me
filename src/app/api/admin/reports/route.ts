import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/db";
import { AdminAuthError, requireAdmin } from "@/lib/admin";

function adminError(err: unknown) {
  if (err instanceof AdminAuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  return NextResponse.json({ error: (err as Error).message }, { status: 500 });
}

function isDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const params = new URL(req.url).searchParams;
    const today = new Date().toISOString().slice(0, 10);
    const monthAgo = new Date();
    monthAgo.setUTCDate(monthAgo.getUTCDate() - 29);
    const from = params.get("from") || monthAgo.toISOString().slice(0, 10);
    const to = params.get("to") || today;

    if (!isDate(from) || !isDate(to) || from > to) {
      return NextResponse.json({ error: "Choose a valid report date range" }, { status: 400 });
    }

    const rangeLength =
      (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
        (24 * 60 * 60 * 1000) +
      1;
    if (rangeLength > 366) {
      return NextResponse.json({ error: "Report range cannot exceed one year" }, { status: 400 });
    }

    const startAt = `${from}T00:00:00.000Z`;
    const endDate = new Date(`${to}T00:00:00.000Z`);
    endDate.setUTCDate(endDate.getUTCDate() + 1);
    const endAt = endDate.toISOString();
    const { db } = await connectToDatabase();
    const completionFilter = { date: { $gte: from, $lte: to } };
    const [
      totalCompletions,
      activeMemberCount,
      newUsers,
      newHabits,
      adminActions,
      dailyRows,
      memberRows,
      habitRows,
      financeRows,
      actionRows,
    ] = await Promise.all([
      db.collection("habitCompletions").countDocuments(completionFilter),
      db.collection("habitCompletions").aggregate([
        { $match: completionFilter },
        { $group: { _id: "$userId" } },
        { $count: "count" },
      ]).toArray(),
      db.collection("users").countDocuments({
        createdAt: { $gte: startAt, $lt: endAt },
        deletedAt: { $in: [null, undefined] },
      }),
      db.collection("habits").countDocuments({ createdAt: { $gte: startAt, $lt: endAt } }),
      db.collection("auditLogs").countDocuments({ createdAt: { $gte: startAt, $lt: endAt } }),
      db.collection("habitCompletions").aggregate([
        { $match: completionFilter },
        { $group: { _id: "$date", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]).toArray(),
      db.collection("habitCompletions").aggregate([
        { $match: completionFilter },
        { $group: { _id: "$userId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]).toArray(),
      db.collection("habitCompletions").aggregate([
        { $match: completionFilter },
        { $group: { _id: "$habitId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]).toArray(),
      db.collection("financeTransactions").aggregate([
        {
          $match: {
            date: { $gte: from, $lte: to },
            deletedAt: { $in: [null, undefined] },
          },
        },
        { $group: { _id: "$type", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]).toArray(),
      db.collection("auditLogs").aggregate([
        { $match: { createdAt: { $gte: startAt, $lt: endAt } } },
        { $group: { _id: "$action", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]).toArray(),
    ]);

    const userIds = memberRows
      .map((row) => String(row._id))
      .filter((id) => ObjectId.isValid(id));
    const habitIds = habitRows
      .map((row) => String(row._id))
      .filter((id) => ObjectId.isValid(id));
    const [users, habits] = await Promise.all([
      userIds.length
        ? db.collection("users").find({ _id: { $in: userIds.map((id) => new ObjectId(id)) } })
            .project({ name: 1, email: 1 }).toArray()
        : [],
      habitIds.length
        ? db.collection("habits").find({ _id: { $in: habitIds.map((id) => new ObjectId(id)) } })
            .project({ name: 1 }).toArray()
        : [],
    ]);
    const userMap = new Map(users.map((user) => [String(user._id), user]));
    const habitMap = new Map(habits.map((habit) => [String(habit._id), habit.name]));
    const financeIncome = financeRows.find((row) => row._id === "income");
    const financeExpense = financeRows.find((row) => row._id === "expense");
    const dailyMap = new Map(dailyRows.map((row) => [String(row._id), Number(row.count)]));
    const daily = Array.from({ length: rangeLength }, (_, index) => {
      const date = new Date(`${from}T00:00:00Z`);
      date.setUTCDate(date.getUTCDate() + index);
      const key = date.toISOString().slice(0, 10);
      return { date: key, count: dailyMap.get(key) || 0 };
    });

    return NextResponse.json({
      success: true,
      report: {
        from,
        to,
        summary: {
          newUsers,
          activeMembers: Number(activeMemberCount[0]?.count || 0),
          newHabits,
          completions: totalCompletions,
          adminActions,
          financeIncome: Number(financeIncome?.total || 0),
          financeExpense: Number(financeExpense?.total || 0),
          financeEntries: Number(financeIncome?.count || 0) + Number(financeExpense?.count || 0),
        },
        daily,
        topUsers: memberRows.map((row) => {
          const user = userMap.get(String(row._id));
          return {
            userId: String(row._id),
            name: user?.name || "Unknown",
            email: user?.email || "",
            completions: Number(row.count || 0),
          };
        }),
        topHabits: habitRows.map((row) => ({
          habitId: String(row._id),
          name: habitMap.get(String(row._id)) || "Deleted habit",
          completions: Number(row.count || 0),
        })),
        adminActionsByType: actionRows.map((row) => ({
          action: String(row._id || "Other"),
          count: Number(row.count || 0),
        })),
      },
    });
  } catch (err) {
    return adminError(err);
  }
}