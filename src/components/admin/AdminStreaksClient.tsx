"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";

interface StreakUser {
  userId: string;
  name: string;
  email: string;
  currentStreak: number;
  bestStreak: number;
  habitName: string;
  avatarUrl?: string;
}

export default function AdminStreaksClient() {
  const { language } = useTranslation();
  const so = language === "so";
  const [users, setUsers] = useState<StreakUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load streaks");
      setUsers(data.stats?.topStreaks || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const longest = Math.max(...users.map((user) => user.currentStreak), 0);
  const consistentUsers = users.filter((user) => user.currentStreak >= 7).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-[12px] font-bold text-[#B45309]">
            <Icon name="local_fire_department" size={17} />
            {so ? "Joogteynta isticmaalayaasha" : "Member consistency"}
          </div>
          <h1 className="text-[22px] font-extrabold text-[#111827] font-[family-name:var(--font-headline)]">
            {so ? "Top Streaks" : "Top Streaks"}
          </h1>
          <p className="mt-1 text-[13px] text-[#667085]">
            {so
              ? "La soco caadooyinka iyo joogteynta isticmaalayaasha."
              : "Track the habits and consistency behind each member streak."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#E7ECF3] bg-white px-3 text-[12px] font-bold text-[#344054] disabled:opacity-50"
        >
          <Icon name="refresh" size={16} />
          {so ? "Cusboonaysii" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-[#EF4444]/20 bg-[#FEF2F2] p-3 text-[13px] font-semibold text-[#B42318]">
          <Icon name="error" size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E7ECF3] bg-white p-4">
          <p className="text-[11px] font-bold uppercase text-[#667085]">
            {so ? "Ugu dheer" : "Longest streak"}
          </p>
          <p className="mt-1 text-[26px] font-extrabold tabular-nums text-[#B45309]">
            {longest} <span className="text-[12px] font-semibold">{so ? "maalmood" : "days"}</span>
          </p>
        </div>
        <div className="rounded-xl border border-[#E7ECF3] bg-white p-4">
          <p className="text-[11px] font-bold uppercase text-[#667085]">
            {so ? "7+ maalmood" : "7+ day streaks"}
          </p>
          <p className="mt-1 text-[26px] font-extrabold tabular-nums text-[#168A67]">
            {consistentUsers}
          </p>
        </div>
        <div className="col-span-2 rounded-xl border border-[#E7ECF3] bg-white p-4 sm:col-span-1">
          <p className="text-[11px] font-bold uppercase text-[#667085]">
            {so ? "La soo bandhigay" : "Ranked members"}
          </p>
          <p className="mt-1 text-[26px] font-extrabold tabular-nums text-[#0B6EF3]">
            {users.length}
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-[#E7ECF3] bg-white">
        <div className="flex items-center justify-between border-b border-[#E7ECF3] px-4 py-3 sm:px-5">
          <div>
            <h2 className="text-[14px] font-bold text-[#111827]">
              {so ? "Hoggaanka streaks-ka" : "Streak leaderboard"}
            </h2>
            <p className="mt-0.5 text-[11px] text-[#667085]">
              {so ? "U kala horreeya streak-ga hadda socda" : "Ranked by current streak"}
            </p>
          </div>
          <Icon name="leaderboard" size={20} className="text-[#B45309]" />
        </div>
        {loading ? (
          <div className="p-8 text-center text-[13px] text-[#667085]">
            {so ? "Waa la soo rarayaa..." : "Loading streaks..."}
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-[#667085]">
            {so ? "Weli xog streak lama hayo." : "No streak activity yet."}
          </div>
        ) : (
          <ol className="divide-y divide-[#F0F2F5]">
            {users.map((user, index) => (
              <li key={user.userId} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                <span className="w-7 shrink-0 text-center text-[12px] font-extrabold tabular-nums text-[#98A2B3]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[12px] font-bold text-[#0B6EF3]">
                  {user.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/users/${user.userId}`}
                    className="block truncate text-[13px] font-bold text-[#111827] hover:text-[#0B6EF3]"
                  >
                    {user.name}
                  </Link>
                  <p className="truncate text-[11px] text-[#667085]">
                    {user.habitName} · {user.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="inline-flex items-center gap-1 text-[14px] font-extrabold tabular-nums text-[#B45309]">
                    <Icon name="local_fire_department" size={16} />
                    {user.currentStreak}
                  </p>
                  <p className="text-[10px] text-[#667085]">
                    {so ? "ugu fiican" : `best ${user.bestStreak}`}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}