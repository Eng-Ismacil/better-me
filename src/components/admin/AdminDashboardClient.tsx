"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";

interface AdminStats {
  totalUsers?: number;
  activeUsers?: number;
  disabledUsers?: number;
  totalHabits?: number;
  totalCompletionsToday?: number;
  totalFinanceEntries?: number;
  usage14Days?: Array<{ date: string; count: number }>;
  topStreaks?: Array<{
    id: string;
    name: string;
    email: string;
    streak: number;
    avatarUrl?: string;
  }>;
  topCompleters?: Array<{
    id: string;
    name: string;
    email: string;
    completions: number;
  }>;
}

function KpiCard({
  label,
  value,
  icon,
  color,
  bg,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E7ECF3] p-4 sm:p-5 shadow-[0_2px_12px_rgba(16,24,40,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-wider text-[#667085]">
            {label}
          </p>
          <p className="text-[26px] sm:text-[28px] font-extrabold text-[#111827] mt-1 font-[family-name:var(--font-headline)] tracking-tight">
            {value}
          </p>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: bg, color }}
        >
          <Icon name={icon} size={22} />
        </div>
      </div>
    </div>
  );
}

function UsageChart({
  data,
}: {
  data: Array<{ date: string; count: number }>;
}) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end justify-between gap-1.5 sm:gap-2 h-36">
      {data.map((day) => {
        const height = Math.max(6, (day.count / max) * 100);
        const label = day.date.slice(5); // MM-DD
        return (
          <div
            key={day.date}
            className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
          >
            <span className="text-[9px] font-bold text-[#667085] tabular-nums">
              {day.count}
            </span>
            <div
              className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-[#0B6EF3] to-[#60A5FA] transition-all"
              style={{ height: `${height}%` }}
              title={`${day.date}: ${day.count}`}
            />
            <span className="text-[9px] text-[#9CA3AF] font-medium">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminDashboardClient() {
  const { language } = useTranslation();
  const so = language === "so";
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load stats");
      const raw = data.stats || data;
      setStats({
        totalUsers: raw.users?.total ?? raw.totalUsers ?? 0,
        activeUsers: raw.users?.active ?? raw.activeUsers ?? 0,
        disabledUsers: raw.users?.disabled ?? raw.disabledUsers ?? 0,
        totalHabits: raw.habits ?? raw.totalHabits ?? 0,
        totalCompletionsToday: raw.completionsToday ?? raw.totalCompletionsToday ?? 0,
        usage14Days: raw.usageGraph ?? raw.usage14Days ?? [],
        topStreaks: (raw.topStreaks || []).map(
          (u: {
            userId: string;
            name: string;
            email: string;
            currentStreak: number;
            avatarUrl?: string;
          }) => ({
            id: u.userId,
            name: u.name,
            email: u.email,
            streak: u.currentStreak,
            avatarUrl: u.avatarUrl,
          })
        ),
        topCompleters: (raw.topCompleters || []).map(
          (u: {
            userId: string;
            name: string;
            email: string;
            totalCompletions: number;
          }) => ({
            id: u.userId,
            name: u.name,
            email: u.email,
            completions: u.totalCompletions,
          })
        ),
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const usage =
    stats?.usage14Days ||
    Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return { date: d.toISOString().slice(0, 10), count: 0 };
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[22px] sm:text-[24px] font-extrabold text-[#111827] font-[family-name:var(--font-headline)] tracking-tight">
            {so ? "Dashboard-ka Maamulka" : "Admin Dashboard"}
          </h1>
          <p className="text-[13px] text-[#667085] mt-1">
            {so
              ? "Aragtida guud ee isticmaalayaasha, caadooyinka iyo firfircoonida."
              : "Overview of users, habits, and platform activity."}
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E7ECF3] bg-white text-[12px] font-bold text-[#111827] hover:bg-[#F4F8FF] transition-colors cursor-pointer"
        >
          <Icon name="refresh" size={16} />
          {so ? "Cusboonaysii" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#EF4444]/25 text-[#EF4444] text-[13px] font-semibold flex items-center gap-2">
          <Icon name="error" size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading && !stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-white border border-[#E7ECF3] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard
              label={so ? "Isticmaalayaasha" : "Total Users"}
              value={stats?.totalUsers ?? 0}
              icon="group"
              color="#0B6EF3"
              bg="#EFF6FF"
            />
            <KpiCard
              label={so ? "Firfircoon" : "Active Users"}
              value={stats?.activeUsers ?? 0}
              icon="person_check"
              color="#20C773"
              bg="#ECFDF3"
            />
            <KpiCard
              label={so ? "Caadooyinka" : "Total Habits"}
              value={stats?.totalHabits ?? 0}
              icon="task_alt"
              color="#8B5CF6"
              bg="#F5F3FF"
            />
            <KpiCard
              label={so ? "Maanta Dhammeeyay" : "Today Completions"}
              value={stats?.totalCompletionsToday ?? 0}
              icon="done_all"
              color="#F59E0B"
              bg="#FFFBEB"
            />
          </div>

          <section className="bg-white rounded-2xl border border-[#E7ECF3] p-5 shadow-[0_2px_12px_rgba(16,24,40,0.04)]">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="monitoring" size={18} className="text-[#0B6EF3]" />
              <h2 className="text-[15px] font-bold text-[#111827]">
                {so ? "Isticmaalka 14-ka Maalmood" : "14-Day Usage"}
              </h2>
            </div>
            <UsageChart data={usage} />
          </section>

          <div className="grid md:grid-cols-2 gap-4" id="streaks">
            <section className="bg-white rounded-2xl border border-[#E7ECF3] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon
                    name="local_fire_department"
                    size={18}
                    className="text-[#EA580C]"
                  />
                  <h2 className="text-[15px] font-bold text-[#111827]">
                    {so ? "Xiriirrada Ugu Sarreeya" : "Top Streak Users"}
                  </h2>
                </div>
              </div>
              <ul className="flex flex-col gap-2.5">
                {(stats?.topStreaks || []).length === 0 ? (
                  <li className="text-[13px] text-[#667085] py-4 text-center">
                    {so ? "Xog lama helin" : "No streak data yet"}
                  </li>
                ) : (
                  (stats?.topStreaks || []).slice(0, 8).map((u, idx) => (
                    <li
                      key={u.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-[#FAFBFD]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 text-[12px] font-bold text-[#9CA3AF]">
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/users/${u.id}`}
                            className="text-[13px] font-bold text-[#111827] hover:text-[#0B6EF3] truncate block"
                          >
                            {u.name}
                          </Link>
                          <p className="text-[11px] text-[#667085] truncate">
                            {u.email}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF7ED] text-[#EA580C] text-[12px] font-bold shrink-0">
                        <Icon name="local_fire_department" size={14} />
                        {u.streak}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </section>

            <section className="bg-white rounded-2xl border border-[#E7ECF3] p-5">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="emoji_events" size={18} className="text-[#F59E0B]" />
                <h2 className="text-[15px] font-bold text-[#111827]">
                  {so ? "Dhammaystirayaasha Ugu Sarreeya" : "Top Task Completers"}
                </h2>
              </div>
              <ul className="flex flex-col gap-2.5">
                {(stats?.topCompleters || []).length === 0 ? (
                  <li className="text-[13px] text-[#667085] py-4 text-center">
                    {so ? "Xog lama helin" : "No completion data yet"}
                  </li>
                ) : (
                  (stats?.topCompleters || []).slice(0, 8).map((u, idx) => (
                    <li
                      key={u.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-[#FAFBFD]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 text-[12px] font-bold text-[#9CA3AF]">
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/users/${u.id}`}
                            className="text-[13px] font-bold text-[#111827] hover:text-[#0B6EF3] truncate block"
                          >
                            {u.name}
                          </Link>
                          <p className="text-[11px] text-[#667085] truncate">
                            {u.email}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ECFDF3] text-[#20C773] text-[12px] font-bold shrink-0">
                        <Icon name="check_circle" size={14} />
                        {u.completions}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
