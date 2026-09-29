"use client";

import React, { useState, useMemo } from "react";
import Icon from "@/components/ui/Icon";
import confetti from "canvas-confetti";
import { useTranslation } from "@/lib/i18n";
import {
  AchievementItem,
  UserGamificationProfile,
  BadgeCategory,
} from "@/lib/achievements";

interface AchievementsClientProps {
  initialProfile: UserGamificationProfile;
}

export default function AchievementsClient({ initialProfile }: AchievementsClientProps) {
  const { language } = useTranslation();
  const so = language === "so";

  const [categoryFilter, setCategoryFilter] = useState<BadgeCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "unlocked" | "locked">("all");
  const [selectedBadge, setSelectedBadge] = useState<AchievementItem | null>(null);

  const {
    totalXp,
    level,
    levelTitle,
    levelTitleSo,
    nextLevelXp,
    levelProgressPct,
    unlockedCount,
    totalCount,
    achievements,
    stats,
  } = initialProfile;

  const filteredAchievements = useMemo(() => {
    return achievements.filter((item) => {
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      if (statusFilter === "unlocked" && !item.unlocked) return false;
      if (statusFilter === "locked" && item.unlocked) return false;
      return true;
    });
  }, [achievements, categoryFilter, statusFilter]);

  const handleBadgeClick = (badge: AchievementItem) => {
    setSelectedBadge(badge);
    if (badge.unlocked) {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.65 },
        colors: ["#007AFF", "#22C55E", "#FFD700", "#0B6EF3"],
      });
    }
  };

  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="flex flex-col gap-6 select-none pb-24 md:pb-12 max-w-7xl mx-auto w-full">
      {/* ── 1. SIGNATURE BETTERME HERO LEVEL BANNER ── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#007AFF] via-[#0B6EF3] to-[#0055D6] p-6 sm:p-8 text-white shadow-[0_8px_30px_rgba(0,122,255,0.22)]">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Level Emblem & Title */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-inner">
                <Icon name="military_tech" size={40} className="text-[#FFD700] drop-shadow-sm" />
              </div>
              <span className="absolute -bottom-1.5 -right-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#22C55E] text-white shadow-xs">
                LVL {level}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold tracking-wide uppercase">
                  {so ? `Heerka ${level}` : `Level ${level}`}
                </span>
                <span className="text-[12px] text-white/90 font-semibold">
                  {so ? levelTitleSo : levelTitle}
                </span>
              </div>
              <h1 className="text-[22px] sm:text-[26px] font-black tracking-tight mt-1 font-[family-name:var(--font-headline)]">
                {so ? "Guulaha & Billadaha Sharafta" : "Achievements & Mastery"}
              </h1>
              <p className="text-[13px] text-white/85 max-w-md mt-0.5">
                {so
                  ? "Dhis caadooyinkaaga, kordhi kaydkaaga, oo fur guulo heer caalami ah."
                  : "Complete habits, grow your savings vault, and unlock milestones along your growth journey."}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/15">
            <div>
              <span className="text-[10px] uppercase font-bold text-white/70 block">
                {so ? "Dhibcaha XP" : "Mastery XP"}
              </span>
              <p className="text-[20px] font-black text-[#FFD700] tabular-nums mt-0.5">
                {totalXp.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-white/70 block">
                {so ? "Billadaha" : "Badges"}
              </span>
              <p className="text-[20px] font-black text-white tabular-nums mt-0.5">
                {unlockedCount} <span className="text-[14px] text-white/60 font-semibold">/ {totalCount}</span>
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-white/70 block">
                {so ? "Dardar Sare" : "Peak Streak"}
              </span>
              <p className="text-[20px] font-black text-white tabular-nums mt-0.5">
                {stats.maxStreak}d
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-white/70 block">
                {so ? "Kaydka Hadda" : "Savings"}
              </span>
              <p className="text-[20px] font-black text-[#22C55E] tabular-nums mt-0.5">
                {fmtCurrency(stats.totalSavedAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="mt-6 pt-5 border-t border-white/15 relative z-10">
          <div className="flex justify-between items-center text-[12px] font-bold text-white/90 mb-2">
            <span>
              {so
                ? `Horumarka Heerka ${level + 1} (${totalXp} / ${nextLevelXp} XP)`
                : `Progress to Level ${level + 1} (${totalXp} / ${nextLevelXp} XP)`}
            </span>
            <span className="text-[#FFD700] font-black">{levelProgressPct}%</span>
          </div>
          <div className="w-full h-2.5 bg-black/25 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#FFD700] to-[#22C55E] rounded-full transition-all duration-700"
              style={{ width: `${levelProgressPct}%` }}
            />
          </div>
        </div>

        {/* BetterMe ambient background curves */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-[#22C55E]/20 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* ── 2. FILTER & CATEGORY NAVIGATION ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E7ECF3] p-3 rounded-2xl shadow-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", labelEn: "All", labelSo: "Dhammaan", icon: "military_tech" },
            { id: "streaks", labelEn: "Streaks", labelSo: "Dardar", icon: "local_fire_department" },
            { id: "completions", labelEn: "Completions", labelSo: "Dhammaystir", icon: "check_circle" },
            { id: "finance", labelEn: "Wealth & Savings", labelSo: "Kayd & Maaliyad", icon: "savings" },
            { id: "routines", labelEn: "Routines", labelSo: "Rutiinada", icon: "auto_stories" },
            { id: "wellness", labelEn: "Mind & Reflection", labelSo: "Xasillooni", icon: "ecg_heart" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id as BadgeCategory | "all")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === cat.id
                  ? "bg-[#0B6EF3] text-white shadow-xs"
                  : "bg-[#F8FAFC] text-[#667085] hover:text-[#111827]"
              }`}
            >
              <Icon name={cat.icon} size={15} />
              <span>{so ? cat.labelSo : cat.labelEn}</span>
            </button>
          ))}
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1 shrink-0 bg-slate-100 p-1 rounded-xl">
          {[
            { id: "all", labelEn: "All", labelSo: "Dhammaan" },
            { id: "unlocked", labelEn: "Unlocked", labelSo: "La Furtay" },
            { id: "locked", labelEn: "Locked", labelSo: "Qufulan" },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setStatusFilter(st.id as "all" | "unlocked" | "locked")}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                statusFilter === st.id
                  ? "bg-white text-[#0B6EF3] shadow-xs"
                  : "text-[#667085]"
              }`}
            >
              {so ? st.labelSo : st.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. BETTERME BRANDED BADGES GRID ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAchievements.map((item) => {
          return (
            <div
              key={item.code}
              onClick={() => handleBadgeClick(item)}
              className={`group cursor-pointer rounded-2xl p-5 border transition-all duration-200 relative flex flex-col justify-between ${
                item.unlocked
                  ? "bg-white border-[#E7ECF3] hover:border-[#0B6EF3]/50 hover:shadow-[0_8px_24px_rgba(11,110,243,0.08)] hover:-translate-y-1"
                  : "bg-[#F9FAFB] border-[#E7ECF3]/80 opacity-70 hover:opacity-90"
              }`}
            >
              <div>
                {/* Badge Top Header */}
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                      item.unlocked
                        ? item.category === "finance"
                          ? "bg-[#EAF8F2] text-[#168A67] shadow-xs"
                          : item.category === "completions"
                          ? "bg-[#ECFDF3] text-[#20C773] shadow-xs"
                          : item.category === "wellness"
                          ? "bg-[#F5F3FF] text-[#8B5CF6] shadow-xs"
                          : "bg-gradient-to-tr from-[#EFF6FF] to-[#DBEAFE] text-[#007AFF] shadow-xs"
                        : "bg-[#E5E7EB] text-[#9CA3AF]"
                    }`}
                  >
                    <Icon name={item.icon} size={26} />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#0B6EF3]">
                      +{item.xp} XP
                    </span>
                    {item.unlocked ? (
                      <span className="w-6 h-6 rounded-full bg-[#ECFDF3] text-[#22C55E] flex items-center justify-center">
                        <Icon name="check" size={14} />
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-[#F3F4F6] text-[#9CA3AF] flex items-center justify-center">
                        <Icon name="lock" size={13} />
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-[15px] text-[#111827] group-hover:text-[#0B6EF3] transition-colors leading-snug">
                  {so ? item.titleSo : item.title}
                </h3>
                <p className="text-[12px] text-[#667085] mt-1 leading-relaxed">
                  {so ? item.descriptionSo : item.description}
                </p>
              </div>

              {/* Progress Bar Footer */}
              <div className="mt-4 pt-3 border-t border-[#F2F4F7]">
                <div className="flex items-center justify-between text-[11px] font-medium text-[#667085] mb-1.5">
                  <span className="truncate max-w-[170px]">
                    {so ? item.targetTextSo : item.targetText}
                  </span>
                  <span className="font-bold text-[#111827] tabular-nums">
                    {item.unlocked ? "100%" : `${item.progress}%`}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.unlocked ? "bg-[#22C55E]" : "bg-[#0B6EF3]"
                    }`}
                    style={{ width: `${item.unlocked ? 100 : item.progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ── 4. DETAILED BADGE MODAL ── */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#E7ECF3] w-full max-w-md p-6 shadow-2xl relative flex flex-col items-center text-center">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
            >
              <Icon name="close" size={18} />
            </button>

            {/* Glowing Icon */}
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-3.5 shadow-md ${
                selectedBadge.unlocked
                  ? "bg-[#EFF6FF] text-[#007AFF] border border-[#007AFF]/20"
                  : "bg-slate-100 text-slate-400 border border-slate-200"
              }`}
            >
              <Icon name={selectedBadge.icon} size={42} />
            </div>

            {/* Status Pill */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  selectedBadge.unlocked
                    ? "bg-[#ECFDF3] text-[#22C55E]"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {selectedBadge.unlocked
                  ? so ? "🏆 LA GUULEYSTAY" : "🏆 UNLOCKED"
                  : so ? "🔒 WAA QUFULAN YAHAY" : "🔒 IN PROGRESS"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EFF6FF] text-[#0B6EF3]">
                +{selectedBadge.xp} XP
              </span>
            </div>

            <h3 className="text-[19px] font-black text-[#111827]">
              {so ? selectedBadge.titleSo : selectedBadge.title}
            </h3>
            <p className="text-[13px] text-[#667085] mt-1 max-w-sm">
              {so ? selectedBadge.descriptionSo : selectedBadge.description}
            </p>

            {/* Progress */}
            <div className="w-full bg-[#F8FAFC] p-4 rounded-2xl border border-[#E7ECF3] my-4 text-left">
              <div className="flex justify-between items-center text-[12px] font-bold text-[#111827] mb-2">
                <span>{so ? "Heerka Horumarka" : "Milestone Progress"}</span>
                <span className="text-[#0B6EF3] font-bold">
                  {selectedBadge.unlocked ? "100%" : `${selectedBadge.progress}%`}
                </span>
              </div>
              <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    selectedBadge.unlocked ? "bg-[#22C55E]" : "bg-[#0B6EF3]"
                  }`}
                  style={{ width: `${selectedBadge.unlocked ? 100 : selectedBadge.progress}%` }}
                />
              </div>
              <p className="text-[11px] font-bold text-[#667085] mt-1.5 text-right">
                {so ? selectedBadge.targetTextSo : selectedBadge.targetText}
              </p>
            </div>

            {/* Pro Tip */}
            <div className="w-full p-3.5 bg-[#EFF6FF] rounded-2xl border border-[#0B6EF3]/15 text-left flex items-start gap-2.5 mb-5">
              <Icon name="lightbulb" size={18} className="text-[#0B6EF3] shrink-0 mt-0.5" />
              <p className="text-[12px] text-[#0B6EF3] font-medium leading-relaxed">
                {so ? selectedBadge.tipSo : selectedBadge.tip}
              </p>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedBadge(null)}
              className="w-full py-3 rounded-xl bg-[#0B6EF3] hover:bg-[#0958c7] text-white text-[13px] font-bold transition-all cursor-pointer shadow-xs"
            >
              {so ? "Fahmay, Mahadsanid" : "Got It"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
