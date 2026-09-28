"use client";

import React, { useState } from "react";
import Icon from "@/components/ui/Icon";
import confetti from "canvas-confetti";
import { useTranslation } from "@/lib/i18n";

interface AchievementItem {
  code: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  targetText: string;
  category?: string;
  xp?: number;
}

interface AchievementsClientProps {
  initialAchievements: AchievementItem[];
  userStats: {
    habitsCount: number;
    completionsCount: number;
    bestStreak: number;
  };
}

export default function AchievementsClient({
  initialAchievements,
  userStats,
}: AchievementsClientProps) {
  const { language, t } = useTranslation();
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");
  const [selectedBadge, setSelectedBadge] = useState<AchievementItem | null>(null);

  const achievements: AchievementItem[] = initialAchievements.map((item, idx) => ({
    ...item,
    xp: [100, 250, 500, 1000, 750, 300][idx % 6] || 200,
    category: ["Consistency", "Streaks", "Milestones", "Rituals"][idx % 4],
  }));

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalXp = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + (a.xp || 100), 0);

  const filtered = achievements.filter((a) => {
    if (filter === "unlocked") return a.unlocked;
    if (filter === "locked") return !a.unlocked;
    return true;
  });

  const triggerConfetti = (item: AchievementItem) => {
    setSelectedBadge(item);
    if (item.unlocked) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.65 },
        colors: ["#007AFF", "#22C55E", "#F59E0B", "#A855F7"],
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none pb-10">
      {/* Header Level & XP Banner */}
      <section className="bg-gradient-to-br from-[#007AFF] via-[#0062cc] to-[#0A2540] rounded-3xl p-6 text-white shadow-[0_8px_30px_rgba(0,122,255,0.22)] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-inner">
              <Icon name="military_tech" size={36} className="text-[#FFD700]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-semibold tracking-wide uppercase">
                  {language === "so" ? "Heerka 4" : "Level 4"}
                </span>
                <span className="text-[12px] text-white/80 font-medium">
                  {language === "so" ? "Sayidka Joogtaynta" : "Master of Consistency"}
                </span>
              </div>
              <h2 className="text-[22px] font-extrabold tracking-tight mt-1">
                {t("achievements_title")}
              </h2>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-6">
            <div>
              <span className="text-[11px] text-white/70 block uppercase font-medium">
                {language === "so" ? "Billadaha" : "Badges"}
              </span>
              <span className="text-[20px] font-bold">
                {unlockedCount} / {achievements.length}
              </span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <span className="text-[11px] text-white/70 block uppercase font-medium">
                {language === "so" ? "Dhibcaha XP" : "Mastery XP"}
              </span>
              <span className="text-[20px] font-bold text-[#FFD700]">
                {totalXp} XP
              </span>
            </div>
          </div>
        </div>

        {/* Level Progress bar */}
        <div className="mt-5 relative z-10">
          <div className="flex justify-between text-[12px] font-medium text-white/85 mb-1.5">
            <span>
              {language === "so"
                ? `Horumarka Heerka Xiga (Heerka 5)`
                : `Next Rank Progress (Level 5)`}
            </span>
            <span>{Math.round((unlockedCount / achievements.length) * 100)}%</span>
          </div>
          <div className="w-full h-2.5 bg-black/25 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#FFD700] to-[#22C55E] rounded-full transition-all duration-700"
              style={{
                width: `${Math.round((unlockedCount / achievements.length) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Ambient background blur circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-[#22C55E]/20 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
        <div className="flex items-center gap-2">
          {(["all", "unlocked", "locked"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                filter === tab
                  ? "bg-[#007AFF] text-white shadow-xs"
                  : "bg-white text-[#667085] hover:text-[#101010] border border-[#E5E7EB]"
              }`}
            >
              {tab === "all"
                ? language === "so"
                  ? "Dhammaan"
                  : "All Badges"
                : tab === "unlocked"
                ? language === "so"
                  ? "La Furtay"
                  : "Unlocked"
                : language === "so"
                ? "Qufulan"
                : "Locked"}
            </button>
          ))}
        </div>

        <span className="text-[12px] text-[#667085] font-medium hidden sm:block">
          {filtered.length} {language === "so" ? "billadood" : "milestones"}
        </span>
      </div>

      {/* Badges Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.code}
            onClick={() => triggerConfetti(item)}
            className={`group cursor-pointer rounded-2xl p-5 border transition-all duration-300 relative flex flex-col justify-between ${
              item.unlocked
                ? "bg-white border-[#E5E7EB] hover:border-[#007AFF]/50 hover:shadow-[0_8px_24px_rgba(0,122,255,0.08)] hover:-translate-y-1"
                : "bg-[#F9FAFB] border-[#E5E7EB]/80 opacity-70 hover:opacity-90"
            }`}
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                    item.unlocked
                      ? "bg-gradient-to-tr from-[#EFF6FF] to-[#DBEAFE] text-[#007AFF] shadow-xs"
                      : "bg-[#E5E7EB] text-[#9CA3AF]"
                  }`}
                >
                  <Icon name={item.icon} size={26} />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#007AFF]">
                    +{item.xp} XP
                  </span>
                  {item.unlocked ? (
                    <span className="w-6 h-6 rounded-full bg-[#ECFDF3] text-[#22C55E] flex items-center justify-center">
                      <Icon name="check" size={14} />
                    </span>
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-[#F3F4F6] text-[#9CA3AF] flex items-center justify-center">
                      <Icon name="lock" size={14} />
                    </span>
                  )}
                </div>
              </div>

              <h3 className="font-bold text-[16px] text-[#101010] group-hover:text-[#007AFF] transition-colors">
                {item.title}
              </h3>
              <p className="text-[12px] text-[#667085] mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F3F4F6]">
              <div className="flex items-center justify-between text-[11px] font-medium text-[#667085] mb-1.5">
                <span>{item.targetText}</span>
                <span className="font-semibold text-[#101010]">
                  {item.unlocked ? "100%" : `${item.progress}%`}
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.unlocked ? "bg-[#22C55E]" : "bg-[#007AFF]"
                  }`}
                  style={{ width: `${item.unlocked ? 100 : item.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Stats Summary Card */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#007AFF] flex items-center justify-center">
            <Icon name="insights" size={22} />
          </div>
          <div>
            <h4 className="font-bold text-[14px] text-[#101010]">
              {language === "so" ? "Habdhaqanka Joogtada ah" : "Consistent Trajectory"}
            </h4>
            <p className="text-[12px] text-[#667085]">
              {language === "so"
                ? `Waxaad diiwaangelisay ${userStats.completionsCount} caado oo la dhammaystiray iyo streak gaaraya ${userStats.bestStreak} maalmood.`
                : `You've recorded ${userStats.completionsCount} habit completions with a peak streak of ${userStats.bestStreak} days.`}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
