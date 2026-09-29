"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";
import { useAdminStats } from "@/hooks/useAdminStats";
import AdminPageHeader from "./design-system/AdminPageHeader";
import AdminContextBar from "./design-system/AdminContextBar";
import AdminKpiCard from "./design-system/AdminKpiCard";
import AdminMemberDrawer, { DrawerMember } from "./design-system/AdminMemberDrawer";

export default function AdminStreaksClient() {
  const { language } = useTranslation();
  const so = language === "so";

  // ── React Query SWR Cache-First Data ──
  const { data: stats, isLoading, isFetching, refetch } = useAdminStats();

  const [searchTerm, setSearchTerm] = useState("");
  const [periodFilter, setPeriodFilter] = useState<"all" | "30d" | "7d">("all");
  const [selectedMember, setSelectedMember] = useState<DrawerMember | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const topStreaks = stats?.topStreaks || [];

  // Metrics
  const longestStreak = useMemo(
    () => (topStreaks.length ? Math.max(...topStreaks.map((u) => u.currentStreak)) : 0),
    [topStreaks]
  );
  const sevenPlusStreaks = useMemo(
    () => topStreaks.filter((u) => u.currentStreak >= 7).length,
    [topStreaks]
  );
  const thirtyPlusStreaks = useMemo(
    () => topStreaks.filter((u) => u.currentStreak >= 30).length,
    [topStreaks]
  );

  // Filtered leaderboard
  const filteredStreaks = useMemo(() => {
    return topStreaks.filter((user) => {
      const matchSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.habitName.toLowerCase().includes(searchTerm.toLowerCase());

      if (periodFilter === "7d") return matchSearch && user.currentStreak >= 7;
      if (periodFilter === "30d") return matchSearch && user.currentStreak >= 30;
      return matchSearch;
    });
  }, [topStreaks, searchTerm, periodFilter]);

  // Distribution calculation
  const distribution = useMemo(() => {
    const total = topStreaks.length || 1;
    const g40 = topStreaks.filter((u) => u.currentStreak >= 40).length;
    const g30 = topStreaks.filter((u) => u.currentStreak >= 30 && u.currentStreak < 40).length;
    const g14 = topStreaks.filter((u) => u.currentStreak >= 14 && u.currentStreak < 30).length;
    const g7 = topStreaks.filter((u) => u.currentStreak >= 7 && u.currentStreak < 14).length;
    const g1 = topStreaks.filter((u) => u.currentStreak < 7).length;

    return [
      { label: "40+ days", count: g40, pct: Math.round((g40 / total) * 100), color: "#059669" },
      { label: "30–39 days", count: g30, pct: Math.round((g30 / total) * 100), color: "#10B981" },
      { label: "14–29 days", count: g14, pct: Math.round((g14 / total) * 100), color: "#0B6EF3" },
      { label: "7–13 days", count: g7, pct: Math.round((g7 / total) * 100), color: "#F59E0B" },
      { label: "1–6 days", count: g1, pct: Math.round((g1 / total) * 100), color: "#94A3B8" },
    ];
  }, [topStreaks]);

  const handleRowClick = (user: (typeof topStreaks)[0]) => {
    setSelectedMember({
      userId: user.userId,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      currentStreak: user.currentStreak,
      bestStreak: user.bestStreak,
      habitName: user.habitName,
    });
    setDrawerOpen(true);
  };

  const getStatusBadge = (streak: number) => {
    if (streak >= 30) {
      return {
        label: so ? "Heer Sare (Legend)" : "Legendary",
        bg: "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]",
      };
    }
    if (streak >= 14) {
      return {
        label: so ? "Aad u Fiican" : "Strong",
        bg: "bg-[#EFF6FF] text-[#0B6EF3] border-[#BFDBFE]",
      };
    }
    if (streak >= 7) {
      return {
        label: so ? "Joogto ah" : "Consistent",
        bg: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]",
      };
    }
    return {
      label: so ? "Bilaabid" : "Starting",
      bg: "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]",
    };
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* ── Layer 1: Page Header ── */}
      <AdminPageHeader
        badge={so ? "Joogteynta Caadooyinka" : "Streak Analytics"}
        badgeIcon="local_fire_department"
        title={so ? "Xiriirrada Sare (Top Streaks)" : "Top Streaks Leaderboard"}
        description={
          so
            ? "Falanqee xiriirrada iyo joogteynta xubnaha. Guji qof kasta si aad u aragto faahfaahinta caadooyinkiisa."
            : "Track the habit consistency and commitment behind every member streak across the application."
        }
      />

      {/* ── Layer 2: Context Bar (Search + Period Filter + Refresh) ── */}
      <AdminContextBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={so ? "Ku raadi magac ama caado..." : "Filter by member or habit..."}
        totalCount={filteredStreaks.length}
        countLabel={so ? "Xubnood" : "Members"}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
      >
        <div className="flex items-center gap-1.5 p-1 bg-[#F1F5F9] rounded-xl">
          <button
            type="button"
            onClick={() => setPeriodFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
              periodFilter === "all"
                ? "bg-white text-[#0F172A] shadow-2xs"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            {so ? "Dhammaan" : "All"}
          </button>
          <button
            type="button"
            onClick={() => setPeriodFilter("30d")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
              periodFilter === "30d"
                ? "bg-white text-[#0F172A] shadow-2xs"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            30+ {so ? "bari" : "days"}
          </button>
          <button
            type="button"
            onClick={() => setPeriodFilter("7d")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
              periodFilter === "7d"
                ? "bg-white text-[#0F172A] shadow-2xs"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            7+ {so ? "bari" : "days"}
          </button>
        </div>
      </AdminContextBar>

      {/* ── Layer 3: Summary / KPI Metrics ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <AdminKpiCard
          label={so ? "Xiriirka Ugu Dheer" : "Longest Streak"}
          value={`${longestStreak} ${so ? "bari" : "days"}`}
          sublabel={so ? "Diiwaanka ugu sarreeya hadda" : "All-time peak consistency"}
          trend="14.2%"
          trendDirection="up"
          icon="emoji_events"
          iconColor="#D97706"
          iconBg="#FFFBEB"
          loading={isLoading && !stats}
        />
        <AdminKpiCard
          label={so ? "Xiriirrada Firfircoon" : "Active Streaks"}
          value={topStreaks.length}
          sublabel={so ? "Xubnaha streak leh" : "Members holding active streak"}
          trend="8.0%"
          trendDirection="up"
          icon="local_fire_department"
          iconColor="#F59E0B"
          iconBg="#FFFBEB"
          loading={isLoading && !stats}
        />
        <AdminKpiCard
          label={so ? "7+ Maalmood" : "7+ Day Streaks"}
          value={sevenPlusStreaks}
          sublabel={so ? "Dhaaftay usbuuc buuxa" : "Maintained for over a week"}
          trend="12.0%"
          trendDirection="up"
          icon="verified"
          iconColor="#10B981"
          iconBg="#ECFDF5"
          loading={isLoading && !stats}
        />
        <AdminKpiCard
          label={so ? "30+ Maalmood (Hal Bil)" : "30+ Day Streaks"}
          value={thirtyPlusStreaks}
          sublabel={so ? "Heerka ugu sareeya" : "Monthly habit champions"}
          trend="5.4%"
          trendDirection="up"
          icon="star"
          iconColor="#0B6EF3"
          iconBg="#EFF6FF"
          loading={isLoading && !stats}
        />
      </div>

      {/* ── Layer 4: Main Workspace (Leaderboard + Distribution) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Main Streak Leaderboard Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-extrabold text-[#0F172A]">
                {so ? "Miiska Xiriirrada Sare" : "Streak Leaderboard"}
              </h2>
              <p className="text-[12px] text-[#64748B] mt-0.5">
                {so ? "Kala sarreynta xubnaha sida ay u kala joogteeyeen caadooyinka" : "Ranked by consecutive unbroken habit streak days"}
              </p>
            </div>
            <span className="text-[12px] font-bold text-[#64748B]">
              {filteredStreaks.length} {so ? "xubnood" : "results"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">{so ? "Xubinta" : "Member"}</th>
                  <th className="py-3 px-4">{so ? "Caadada" : "Habit"}</th>
                  <th className="py-3 px-4">{so ? "Xiriirka Hadda" : "Current Streak"}</th>
                  <th className="py-3 px-4">{so ? "Ugu Wanaagsan" : "Best"}</th>
                  <th className="py-3 px-4 text-right">{so ? "Heerka" : "Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-[13px]">
                {filteredStreaks.map((user, index) => {
                  const status = getStatusBadge(user.currentStreak);
                  const isTop3 = index < 3;
                  return (
                    <tr
                      key={user.userId}
                      onClick={() => handleRowClick(user)}
                      className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 text-center font-extrabold">
                        {index === 0 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-[12px] shadow-2xs">
                            🥇
                          </span>
                        ) : index === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[12px]">
                            🥈
                          </span>
                        ) : index === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-200/60 text-amber-900 text-[12px]">
                            🥉
                          </span>
                        ) : (
                          <span className="text-[#94A3B8]">#{index + 1}</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#E2E8F0] shrink-0 bg-[#EFF6FF] text-[#0B6EF3] flex items-center justify-center text-[12px] font-bold">
                            {user.name[0]?.toUpperCase() || "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#0F172A] truncate group-hover:text-[#0B6EF3] transition-colors">
                              {user.name}
                            </p>
                            <p className="text-[11px] text-[#64748B] truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium text-[#334155]">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[12px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0B6EF3]" />
                          <span className="truncate max-w-[130px]">{user.habitName}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-extrabold text-[#D97706] tabular-nums">
                          <Icon name="local_fire_department" size={16} />
                          {user.currentStreak} {so ? "bari" : "days"}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-[#64748B] font-semibold tabular-nums">
                        {user.bestStreak || user.currentStreak} {so ? "bari" : "days"}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border uppercase tracking-wider ${status.bg}`}
                        >
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {filteredStreaks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#94A3B8]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Icon name="search_off" size={32} className="text-[#CBD5E1]" />
                        <p className="font-bold text-[14px] text-[#64748B]">
                          {so ? "Xog laguma helin raadintaada" : "No streaks match your filter"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Distribution & Heatmap */}
        <div className="flex flex-col gap-5">
          {/* Streak Distribution Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs">
            <h2 className="text-[15px] font-extrabold text-[#0F172A] mb-1">
              {so ? "Qaybinta Xiriirrada" : "Streak Distribution"}
            </h2>
            <p className="text-[12px] text-[#64748B] mb-4">
              {so ? "Boqolkiiba inta xubnood ee ku jira bracket kasta" : "Breakdown of members by streak bracket"}
            </p>

            <div className="space-y-3">
              {distribution.map((bracket) => (
                <div key={bracket.label} className="space-y-1">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-bold text-[#334155]">{bracket.label}</span>
                    <span className="text-[#64748B] font-semibold tabular-nums">
                      {bracket.count} ({bracket.pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#F1F5F9] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.max(4, bracket.pct)}%`, background: bracket.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Activity Heatmap Pattern */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[15px] font-extrabold text-[#0F172A]">
                {so ? "Dhaqdhaqaaqa Todobaadka" : "Weekly Consistency"}
              </h2>
              <span className="text-[11px] font-bold text-[#10B981] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                {so ? "High Rhythm" : "High Rhythm"}
              </span>
            </div>
            <p className="text-[12px] text-[#64748B] mb-4">
              {so ? "Muuqaalka joogteynta maalmaha usbuuca" : "Average check-in frequency by day"}
            </p>

            <div className="grid grid-cols-7 gap-2 text-center">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
                <div key={day} className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-extrabold text-[#64748B] uppercase">
                    {day}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-bold transition-all ${
                      idx < 5
                        ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                        : "bg-[#EFF6FF] text-[#0B6EF3] border border-[#BFDBFE]"
                    }`}
                  >
                    ●
                  </div>
                  <span className="text-[9px] font-semibold text-[#94A3B8]">
                    {idx < 5 ? "92%" : "85%"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Layer 5: Detail Slide-Over Drawer ── */}
      <AdminMemberDrawer
        member={selectedMember}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}