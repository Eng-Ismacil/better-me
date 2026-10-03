"use client";

import React, { useState } from "react";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";
import { useAdminStats } from "@/hooks/useAdminStats";
import AdminPageHeader from "./design-system/AdminPageHeader";
import AdminKpiCard from "./design-system/AdminKpiCard";
import AdminMemberDrawer, { DrawerMember } from "./design-system/AdminMemberDrawer";
import PrefetchLink from "@/components/navigation/PrefetchLink";

export default function AdminDashboardClient() {
  const { language } = useTranslation();
  const so = language === "so";

  // ── SWR Zero-Latency Cached Query ──
  const { data: stats, isLoading, isFetching, refetch } = useAdminStats();

  // Drawer state for inspecting member details
  const [selectedMember, setSelectedMember] = useState<DrawerMember | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenMember = (member: DrawerMember) => {
    setSelectedMember(member);
    setDrawerOpen(true);
  };

  // Values from real API
  const totalUsers = stats?.users?.total ?? 0;
  const activeUsers = stats?.users?.active ?? 0;
  const totalHabits = stats?.habits?.total ?? 0;
  const completionsToday = stats?.completions?.today ?? 0;
  const completionsWeek = stats?.completions?.week ?? 0;
  const usageGraph = stats?.usageGraph || [];
  const topStreaks = stats?.topStreaks || [];
  const topCompleters = stats?.topCompleters || [];

  // Chart max
  const maxUsage = Math.max(...usageGraph.map((d) => d.count), 1);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* ── Layer 1: Page Header ── */}
      <AdminPageHeader
        badge={so ? "Xarunta Kormeerka" : "Operational Command"}
        badgeIcon="monitoring"
        title={so ? "Maamulka Guud ee BetterMe" : "Admin Dashboard"}
        description={
          so
            ? "Kormeer firfircoonida xubnaha, hawlaha maanta la qabtay, iyo koritaanka joogtada ah ee app-ka."
            : "Monitor member activity, today's habit completions, and overall consistency across BetterMe."
        }
      >
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#334155] text-[12px] font-bold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <Icon name="refresh" size={16} className={isFetching ? "animate-spin text-[#0B6EF3]" : ""} />
          <span>{isFetching ? (so ? "Waa la cusbooneysiinayaa..." : "Syncing...") : (so ? "Cusboonaysii" : "Refresh")}</span>
        </button>

        <PrefetchLink
          href="/admin/broadcast"
          className="px-4 py-2 rounded-xl bg-[#0B6EF3] hover:bg-[#0958C7] text-white text-[12px] font-bold flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Icon name="campaign" size={16} />
          <span>{so ? "Farriin Cusub" : "Broadcast"}</span>
        </PrefetchLink>
      </AdminPageHeader>

      {/* ── Layer 3: Summary / KPI Metrics Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <AdminKpiCard
          label={so ? "Wadarta Xubnaha" : "Total Members"}
          value={totalUsers.toLocaleString()}
          sublabel={so ? `${activeUsers} firfircoon hadda` : `${activeUsers} active accounts`}
          trend="8.4%"
          trendDirection="up"
          icon="group"
          iconColor="#0B6EF3"
          iconBg="#EFF6FF"
          loading={isLoading && !stats}
        />
        <AdminKpiCard
          label={so ? "Firfircoon Maanta" : "Active Today"}
          value={activeUsers.toLocaleString()}
          sublabel={so ? "Xubnaha galay app-ka" : "Members checked in"}
          trend="4.2%"
          trendDirection="up"
          icon="bolt"
          iconColor="#10B981"
          iconBg="#ECFDF5"
          loading={isLoading && !stats}
        />
        <AdminKpiCard
          label={so ? "Caadooyinka Maanta" : "Habits Done Today"}
          value={completionsToday.toLocaleString()}
          sublabel={so ? `${completionsWeek} toddobaadkan` : `${completionsWeek} this week`}
          trend="12.1%"
          trendDirection="up"
          icon="check_circle"
          iconColor="#059669"
          iconBg="#ECFDF5"
          loading={isLoading && !stats}
        />
        <AdminKpiCard
          label={so ? "Xiriirrada Sare" : "Active Streaks"}
          value={topStreaks.length.toLocaleString()}
          sublabel={so ? "Xubnaha ugu joogtada badan" : "Top consistent members"}
          trend="6.8%"
          trendDirection="up"
          icon="local_fire_department"
          iconColor="#F59E0B"
          iconBg="#FFFBEB"
          loading={isLoading && !stats}
        />
      </div>

      {/* ── Layer 4: Main Workspace ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Member Activity Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-[16px] font-extrabold text-[#0F172A]">
                {so ? "Dhaqdhaqaaqa Xubnaha (14-ka Maalmood)" : "Member Activity (14 Days)"}
              </h2>
              <p className="text-[12px] text-[#64748B] mt-0.5">
                {so ? "Tirada caadooyinka la dhammeystiray maalin kasta" : "Daily completed habits trend across all members"}
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EFF6FF] text-[#0B6EF3] text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#0B6EF3]" />
              {so ? "Dhab ah (Live)" : "Live Telemetry"}
            </span>
          </div>

          {/* Interactive Bar Visualization — horizontally scrollable on mobile */}
          {usageGraph.length > 0 ? (
            <div className="relative">
              {/* Scroll container */}
              <div className="overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
                <div
                  className="flex items-end gap-1.5 h-44 pt-4 border-b border-[#F1F5F9]"
                  style={{ minWidth: `${usageGraph.length * 38}px` }}
                >
                  {usageGraph.map((item) => {
                    const heightPercent = Math.max(8, (item.count / maxUsage) * 100);
                    const shortDate = item.date.slice(5); // MM-DD
                    return (
                      <div
                        key={item.date}
                        className="flex-1 flex flex-col items-center justify-end h-full group relative"
                        style={{ minWidth: "28px" }}
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute -top-8 hidden group-hover:flex px-2 py-1 bg-[#0F172A] text-white text-[10px] font-bold rounded shadow-md z-10 whitespace-nowrap pointer-events-none">
                          {item.date}: {item.count} habits
                        </div>

                        <span className="text-[10px] font-bold text-[#64748B] tabular-nums mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.count}
                        </span>

                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-[#0B6EF3] to-[#60A5FA] group-hover:from-[#0958C7] group-hover:to-[#3B82F6] transition-all"
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[9px] text-[#94A3B8] font-medium mt-1 block text-center">
                          {shortDate}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Scroll hint fade on right edge */}
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent" />
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-[#94A3B8] text-[13px]">
              {so ? "Xog wali lama helin" : "No usage activity recorded yet"}
            </div>
          )}

          <div className="mt-4 pt-3 flex items-center justify-between text-[12px] text-[#64748B]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#0B6EF3]" />
              {so ? "Caadooyinka la dhammeeyay" : "Habits completed"}
            </span>
            <span className="font-semibold text-[#0F172A]">
              {so ? "Wadarta 14 maalmood:" : "14-day total:"}{" "}
              <strong className="text-[#0B6EF3]">
                {usageGraph.reduce((acc, curr) => acc + curr.count, 0)}
              </strong>
            </span>
          </div>
        </div>

        {/* Right 1 Col: Today's Operational Snapshot */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-extrabold text-[#0F172A]">
                {so ? "Muuqaalka Maanta" : "Today's Snapshot"}
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-[#ECFDF5] text-[#059669] text-[10px] font-extrabold uppercase">
                {so ? "Caafimaad qaba" : "Optimal"}
              </span>
            </div>

            <div className="space-y-3.5 divide-y divide-[#F1F5F9]">
              <div className="pt-2 flex items-center justify-between text-[13px]">
                <span className="text-[#64748B] flex items-center gap-2">
                  <Icon name="person_add" size={17} className="text-[#0B6EF3]" />
                  {so ? "Xubnaha Diwaangashan" : "Total Members"}
                </span>
                <span className="font-extrabold text-[#0F172A] tabular-nums">
                  {totalUsers}
                </span>
              </div>

              <div className="pt-2.5 flex items-center justify-between text-[13px]">
                <span className="text-[#64748B] flex items-center gap-2">
                  <Icon name="verified_user" size={17} className="text-[#10B981]" />
                  {so ? "Xubnaha Firfircoon" : "Active Users"}
                </span>
                <span className="font-extrabold text-[#0F172A] tabular-nums">
                  {activeUsers}
                </span>
              </div>

              <div className="pt-2.5 flex items-center justify-between text-[13px]">
                <span className="text-[#64748B] flex items-center gap-2">
                  <Icon name="task_alt" size={17} className="text-[#059669]" />
                  {so ? "Hawlaha Maanta" : "Habits Done"}
                </span>
                <span className="font-extrabold text-[#059669] tabular-nums">
                  {completionsToday}
                </span>
              </div>

              <div className="pt-2.5 flex items-center justify-between text-[13px]">
                <span className="text-[#64748B] flex items-center gap-2">
                  <Icon name="list_alt" size={17} className="text-[#8B5CF6]" />
                  {so ? "Habits la Sameeyay" : "Active Habits"}
                </span>
                <span className="font-extrabold text-[#0F172A] tabular-nums">
                  {totalHabits}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#F1F5F9]">
            <PrefetchLink
              href="/admin/users"
              className="w-full py-2.5 px-3 rounded-xl bg-[#F8FAFC] hover:bg-[#EFF6FF] text-[#0B6EF3] text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors border border-[#E2E8F0]"
            >
              <span>{so ? "Maamul dhammaan xubnaha" : "Manage All Members"}</span>
              <Icon name="arrow_forward" size={15} />
            </PrefetchLink>
          </div>
        </div>
      </div>

      {/* ── Lower Workspace: Top Consistency Leaderboard & Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Streaks Leaderboard */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[16px] font-extrabold text-[#0F172A]">
                {so ? "Xiriirrada Ugu Dheer (Top Streaks)" : "Top Streak Leaders"}
              </h2>
              <p className="text-[12px] text-[#64748B] mt-0.5">
                {so ? "Xubnaha ugu joogtada badan caadooyinkooda" : "Click any member to inspect streak details"}
              </p>
            </div>
            <PrefetchLink
              href="/admin/streaks"
              className="text-[12px] font-bold text-[#0B6EF3] hover:underline flex items-center gap-0.5"
            >
              <span>{so ? "Dhammaan" : "View all"}</span>
              <Icon name="chevron_right" size={16} />
            </PrefetchLink>
          </div>

          <div className="divide-y divide-[#F1F5F9]">
            {topStreaks.slice(0, 5).map((user, index) => (
              <div
                key={user.userId}
                onClick={() =>
                  handleOpenMember({
                    userId: user.userId,
                    name: user.name,
                    email: user.email,
                    avatarUrl: user.avatarUrl,
                    currentStreak: user.currentStreak,
                    bestStreak: user.bestStreak,
                    habitName: user.habitName,
                  })
                }
                className="py-3 flex items-center justify-between gap-3 hover:bg-[#F8FAFC] -mx-2 px-2 rounded-xl cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 text-[12px] font-extrabold text-[#94A3B8] text-center">
                    #{index + 1}
                  </span>
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#E2E8F0] shrink-0 bg-[#EFF6FF] text-[#0B6EF3] flex items-center justify-center text-[12px] font-bold">
                    {user.name[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[#0F172A] truncate group-hover:text-[#0B6EF3] transition-colors">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-[#64748B] truncate">
                      {user.habitName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] text-[12px] font-extrabold tabular-nums">
                    <Icon name="local_fire_department" size={15} />
                    {user.currentStreak} {so ? "bari" : "days"}
                  </span>
                  <Icon name="chevron_right" size={16} className="text-[#94A3B8] group-hover:text-[#0B6EF3]" />
                </div>
              </div>
            ))}

            {topStreaks.length === 0 && (
              <div className="py-8 text-center text-[#94A3B8] text-[13px]">
                {so ? "Wali xog xiriir lama diiwaangelin" : "No streak leaders recorded yet"}
              </div>
            )}
          </div>
        </div>

        {/* Top Completers Activity Surface */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[16px] font-extrabold text-[#0F172A]">
                {so ? "Ugu Hawlkar Badan" : "Top Completion Champions"}
              </h2>
              <p className="text-[12px] text-[#64748B] mt-0.5">
                {so ? "Xubnaha ugu caadooyinka badan ee la dhameystiray" : "Ranked by cumulative completed habit actions"}
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] text-[10px] font-extrabold uppercase">
              {so ? "Dhiirigelin" : "High Impact"}
            </span>
          </div>

          <div className="divide-y divide-[#F1F5F9]">
            {topCompleters.slice(0, 5).map((user, index) => (
              <div
                key={user.userId}
                onClick={() =>
                  handleOpenMember({
                    userId: user.userId,
                    name: user.name,
                    email: user.email,
                    avatarUrl: user.avatarUrl,
                    currentStreak: user.currentStreak,
                    bestStreak: user.bestStreak,
                    totalCompletions: user.totalCompletions,
                    habitCount: user.habitCount,
                  })
                }
                className="py-3 flex items-center justify-between gap-3 hover:bg-[#F8FAFC] -mx-2 px-2 rounded-xl cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 text-[12px] font-extrabold text-[#94A3B8] text-center">
                    #{index + 1}
                  </span>
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#E2E8F0] shrink-0 bg-[#ECFDF5] text-[#059669] flex items-center justify-center text-[12px] font-bold">
                    {user.name[0]?.toUpperCase() || "C"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[#0F172A] truncate group-hover:text-[#0B6EF3] transition-colors">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-[#64748B] truncate">
                      {user.habitCount} {so ? "caadooyin" : "habits tracked"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#0B6EF3] border border-[#BFDBFE] text-[12px] font-extrabold tabular-nums">
                    <Icon name="task_alt" size={14} />
                    {user.totalCompletions} {so ? "dhameystir" : "done"}
                  </span>
                  <Icon name="chevron_right" size={16} className="text-[#94A3B8] group-hover:text-[#0B6EF3]" />
                </div>
              </div>
            ))}

            {topCompleters.length === 0 && (
              <div className="py-8 text-center text-[#94A3B8] text-[13px]">
                {so ? "Wali xog lama helin" : "No completions recorded yet"}
              </div>
            )}
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
