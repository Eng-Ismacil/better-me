"use client";

import React from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { HabitHealthMetric, WeeklyConsistencyDay } from "@/types";
import { useTranslation } from "@/lib/i18n";
import { UserGamificationProfile, BadgeTier } from "@/lib/achievements";

const STATUS_STYLES = {
  Healthy: { bg: "bg-[#ECFDF3] dark:bg-emerald-950/40", text: "text-[#10B981]", bar: "bg-[#10B981]" },
  Stable: { bg: "bg-[#EFF6FF] dark:bg-blue-950/40", text: "text-[#0B6EF3]", bar: "bg-[#0B6EF3]" },
  "At Risk": { bg: "bg-[#FFF7ED] dark:bg-amber-950/40", text: "text-[#F59E0B]", bar: "bg-[#F59E0B]" },
};

const TIER_STYLES: Record<BadgeTier, { bg: string; text: string; border: string }> = {
  bronze: { bg: "bg-amber-900/10", text: "text-amber-800 dark:text-amber-300", border: "border-amber-700/30" },
  silver: { bg: "bg-slate-500/10", text: "text-slate-700 dark:text-slate-200", border: "border-slate-400/40" },
  gold: { bg: "bg-amber-400/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-400/60" },
  platinum: { bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-300", border: "border-cyan-400/60" },
  diamond: { bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-300", border: "border-indigo-500/60" },
  mythic: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-300", border: "border-rose-500/70" },
};

interface InsightsClientProps {
  metrics: HabitHealthMetric[];
  weeklyDays: WeeklyConsistencyDay[];
  consistencyScore: number;
  totalStreak: number;
  bestStreak: number;
  totalCompletions: number;
  habitCount: number;
  gamification?: UserGamificationProfile;
}

function ScoreArc({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.65;
  const strokeDash = (score / 100) * arcLength;

  return (
    <svg width="150" height="96" viewBox="0 0 150 96">
      {/* Background Track */}
      <path
        d="M 18 86 A 57 57 0 1 1 132 86"
        fill="none"
        stroke="#E2E8F0"
        strokeWidth="11"
        strokeLinecap="round"
        className="dark:stroke-slate-800"
      />
      {/* Progress Arc */}
      <path
        d="M 18 86 A 57 57 0 1 1 132 86"
        fill="none"
        stroke={score >= 80 ? "#10B981" : score >= 60 ? "#0B6EF3" : "#F59E0B"}
        strokeWidth="11"
        strokeLinecap="round"
        strokeDasharray={`${strokeDash} 300`}
        className="transition-all duration-1000 ease-out"
      />
      {/* Score Text */}
      <text
        x="75"
        y="70"
        textAnchor="middle"
        fontSize="28"
        fontWeight="900"
        fill="currentColor"
        className="text-[#111827] dark:text-white"
      >
        {score}%
      </text>
      <text
        x="75"
        y="86"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="#667085"
        className="dark:text-slate-400 uppercase tracking-wider"
      >
        Consistency
      </text>
    </svg>
  );
}

export default function InsightsClient({
  metrics,
  weeklyDays,
  consistencyScore,
  totalStreak,
  bestStreak,
  totalCompletions,
  habitCount,
  gamification,
}: InsightsClientProps) {
  const { language } = useTranslation();
  const so = language === "so";

  // Pick top showcase badges (unlocked and near-completion)
  const allAchievements = gamification?.achievements || [];
  const unlockedBadges = allAchievements.filter((a) => a.unlocked);
  const nextTargetBadges = allAchievements.filter((a) => !a.unlocked).slice(0, 3);
  const showcaseBadges = [
    ...unlockedBadges.slice(0, 3),
    ...nextTargetBadges,
  ].slice(0, 6);

  return (
    <div className="flex flex-col gap-6 select-none max-w-6xl mx-auto w-full pb-28 md:pb-12">
      {/* ── 1. CONSISTENCY & ANALYTICS HERO CARD ── */}
      <section className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-[#E7ECF3] dark:border-slate-800 p-6 sm:p-7 shadow-xs relative overflow-hidden flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#0B6EF3]/10 text-[#0B6EF3] flex items-center justify-center">
              <Icon name="insights" size={20} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] dark:text-slate-400 block">
                {so ? "Dhibcaha Guud ee Usbuuca" : "Overall Habit Performance"}
              </span>
              <h2 className="text-[18px] font-black text-[#111827] dark:text-white">
                {so ? "Heerka Joogteyntaada" : "Weekly Consistency Metric"}
              </h2>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-black bg-blue-50 dark:bg-blue-950/60 text-[#0B6EF3]">
            {consistencyScore >= 80 ? (so ? "Heersare 🎉" : "Elite Status") : (so ? "Wanaagsan 📈" : "Active Flow")}
          </span>
        </div>

        <div className="my-2">
          <ScoreArc score={consistencyScore} />
        </div>

        <p className="text-[13px] text-[#667085] dark:text-slate-400 max-w-md text-center mt-1">
          {consistencyScore >= 85
            ? so
              ? "Heer sare oo joogteyn ah! Waxaad ku jirtaa darajada ugu sarreysa ee xubnaha."
              : "Outstanding consistency! Your habit momentum is performing in the top tier."
            : consistencyScore >= 65
            ? so
              ? "Dardar wanaagsan ayaa kuu socota. Ku dadaal inaad streak-ga sii waddo!"
              : "Great momentum! Keep your daily streak unbroken to reach peak automation."
            : so
              ? "Tallaabooyin yaryar oo maalinle ah ayaa dhisaya guul weyn. Sii wad dadaalka!"
              : "Every small step counts. Focus on 1 or 2 core habits to build momentum."}
        </p>

        {/* Ambient glow */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-[#0B6EF3]/10 blur-3xl pointer-events-none" />
      </section>

      {/* ── 2. NEW DEDICATED ACHIEVEMENTS & TROPHIES SHOWCASE ── */}
      {gamification && (
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E7ECF3] dark:border-slate-800 p-6 shadow-xs relative overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center border border-amber-500/20 shadow-xs shrink-0">
                <Icon name="military_tech" size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[17px] font-black text-[#111827] dark:text-white">
                    {so ? "Guulaha & Billadaha Sharafta" : "Achievements & Mastery Badges"}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FFD700]/20 text-amber-800 dark:text-amber-300">
                    LVL {gamification.level}
                  </span>
                </div>
                <p className="text-[12px] text-[#667085] dark:text-slate-400 mt-0.5">
                  {so
                    ? `${gamification.unlockedCount} / ${gamification.totalCount} billadood ayaa la furtay · ${gamification.totalXp} Total XP`
                    : `${gamification.unlockedCount} of ${gamification.totalCount} badges unlocked · ${gamification.totalXp.toLocaleString()} Total XP`}
                </p>
              </div>
            </div>

            <Link
              href="/achievements"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B6EF3] hover:bg-[#095cd4] text-white text-[12px] font-black shadow-xs transition-all cursor-pointer self-start sm:self-auto"
            >
              <span>{so ? "Eeg Dhammaan Billadaha" : "Explore All Badges"}</span>
              <Icon name="arrow_forward" size={16} />
            </Link>
          </div>

          {/* XP Progress Bar */}
          <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E7ECF3] dark:border-slate-700/60 mb-5">
            <div className="flex justify-between items-center text-[12px] font-bold text-[#111827] dark:text-white mb-2">
              <span className="flex items-center gap-1.5">
                <Icon name="bolt" size={16} className="text-amber-500" />
                <span>
                  {so
                    ? `Heerka ${gamification.level}: ${gamification.levelTitleSo}`
                    : `Rank: ${gamification.levelTitle} (Level ${gamification.level})`}
                </span>
              </span>
              <span className="text-[#0B6EF3] font-black">
                {gamification.totalXp} / {gamification.nextLevelXp} XP ({gamification.levelProgressPct}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-emerald-500 to-[#0B6EF3] rounded-full transition-all duration-700"
                style={{ width: `${gamification.levelProgressPct}%` }}
              />
            </div>
          </div>

          {/* Badges Carousel Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {showcaseBadges.map((badge) => {
              const tier = TIER_STYLES[badge.tier];
              return (
                <Link
                  key={badge.code}
                  href="/achievements"
                  className={`p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 hover:shadow-md hover:-translate-y-0.5 ${
                    badge.unlocked
                      ? `bg-white dark:bg-slate-900 ${tier.border} hover:border-[#0B6EF3]`
                      : "bg-[#F9FAFB] dark:bg-slate-900/50 border-[#E5E7EB] dark:border-slate-800 opacity-80"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                      badge.unlocked
                        ? `${tier.bg} ${tier.text} ${tier.border}`
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent"
                    }`}
                  >
                    <Icon name={badge.icon} size={24} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-[13px] font-black text-[#111827] dark:text-white truncate">
                        {so ? badge.titleSo : badge.title}
                      </h4>
                      <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 shrink-0">
                        +{badge.xp} XP
                      </span>
                    </div>
                    <p className="text-[11px] text-[#667085] dark:text-slate-400 mt-0.5 line-clamp-1">
                      {so ? badge.descriptionSo : badge.description}
                    </p>

                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${badge.unlocked ? "bg-emerald-500" : "bg-[#0B6EF3]"}`}
                          style={{ width: `${badge.unlocked ? 100 : badge.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-[#111827] dark:text-white tabular-nums">
                        {badge.unlocked ? "✓" : `${badge.progress}%`}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── 3. WEEKLY RHYTHM BAR CHART ── */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E7ECF3] dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[16px] font-black text-[#111827] dark:text-white">
              {so ? "Dhaqdhaqaaqa Usbuucan" : "This Week's Daily Rhythm"}
            </h3>
            <p className="text-[12px] text-[#667085] dark:text-slate-400 mt-0.5">
              {so ? "Boqolkiiba caadooyinka la qabtay maalin kasta." : "Percentage of scheduled habits achieved per day."}
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold text-[#667085] dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0B6EF3]" />
              {so ? "Maanta" : "Today"}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0B6EF3]/30" />
              {so ? "Hore" : "Past"}
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between gap-2.5 h-28 pt-4">
          {weeklyDays.map((day) => {
            const barHeight = `${Math.max(10, day.completionRate)}%`;
            const isToday = day.isToday;
            return (
              <div key={day.date} className="flex flex-col items-center gap-2 flex-1 group">
                <span className="text-[10px] font-black text-[#667085] opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                  {day.completionRate}%
                </span>
                <div className="w-full flex items-end justify-center h-20">
                  <div
                    className={`w-full max-w-[42px] rounded-xl transition-all duration-500 ${
                      isToday
                        ? "bg-[#0B6EF3] shadow-xs"
                        : day.completionRate > 0
                        ? "bg-[#0B6EF3]/40 hover:bg-[#0B6EF3]/60"
                        : "bg-slate-100 dark:bg-slate-800"
                    }`}
                    style={{ height: barHeight }}
                  />
                </div>
                <span
                  className={`text-[12px] font-bold ${
                    isToday ? "text-[#0B6EF3] font-black" : "text-[#667085] dark:text-slate-400"
                  }`}
                >
                  {day.dayName}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 4. FOUR KEY EXECUTIVE METRIC CARDS ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: so ? "Guulaha Guud" : "Total Completions",
            value: totalCompletions,
            icon: "check_circle",
            color: "#10B981",
            bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-500/20",
            sub: so ? "Dhammaan caadooyinka la qabtay" : "Lifetime habit executions",
          },
          {
            label: so ? "Streak-ga Ugu Dheer" : "Best Streak Record",
            value: `${bestStreak}d`,
            icon: "local_fire_department",
            color: "#EF4444",
            bg: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 border-rose-500/20",
            sub: so ? "Xiriirka ugu dheer ee la gaaray" : "Longest unbroken sequence",
          },
          {
            label: so ? "Caadooyinka Firfircoon" : "Active Habits",
            value: habitCount,
            icon: "spa",
            color: "#0B6EF3",
            bg: "bg-blue-50 dark:bg-blue-950/40 text-[#0B6EF3] border-blue-500/20",
            sub: so ? "Caadooyinka aad hadda waddo" : "Currently tracked habits",
          },
          {
            label: so ? "Caadooyinka Badqaba" : "Habits on Track",
            value: `${metrics.filter((m) => m.status !== "At Risk").length}/${habitCount || 1}`,
            icon: "trending_up",
            color: "#8B5CF6",
            bg: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 border-purple-500/20",
            sub: so ? "Caadooyinka heerka fiican ku socda" : "Healthy & stable consistency",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E7ECF3] dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] dark:text-slate-400">
                  {stat.label}
                </span>
                <p className="text-[24px] font-black text-[#111827] dark:text-white mt-1 tabular-nums">
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${stat.bg}`}
              >
                <Icon name={stat.icon} size={22} />
              </div>
            </div>
            <p className="text-[11px] text-[#667085] dark:text-slate-400 mt-3 pt-2.5 border-t border-[#F2F4F7] dark:border-slate-800">
              {stat.sub}
            </p>
          </div>
        ))}
      </section>

      {/* ── 5. HABIT HEALTH REPORT ── */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E7ECF3] dark:border-slate-800 p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[16px] font-black text-[#111827] dark:text-white">
              {so ? "Warbixinta Caafimaadka Caadooyinka" : "Habit Health & Stability Report"}
            </h3>
            <p className="text-[12px] text-[#667085] dark:text-slate-400 mt-0.5">
              {so ? "Qiimeynta xoogga iyo joogteynta 30-kii maalmood ee la soo dhaafay." : "30-day consistency score calculated per individual habit."}
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#667085] dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            30 Days
          </span>
        </div>

        {metrics.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-[#667085] dark:text-slate-400 border border-dashed border-[#E7ECF3] dark:border-slate-800 rounded-2xl">
            {so ? "Qabo caadooyin si aad u aragto qiimeynta caafimaadkooda!" : "Complete habit check-ins to generate health scores!"}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {metrics.map((metric) => {
              const style = STATUS_STYLES[metric.status] || STATUS_STYLES["Stable"];
              return (
                <div
                  key={metric.habitId}
                  className="p-4 bg-[#F8FAFC] dark:bg-slate-800/60 rounded-2xl border border-[#E7ECF3] dark:border-slate-700/60 flex flex-col justify-between gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-[#0B6EF3] shrink-0 shadow-2xs">
                        <Icon name={metric.icon || "check_circle"} size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-black text-[#111827] dark:text-white truncate">
                          {metric.name}
                        </p>
                        <p className="text-[11px] text-[#667085] dark:text-slate-400">
                          {metric.frequencyText}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${style.bg} ${style.text}`}
                    >
                      {metric.status}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#667085] dark:text-slate-400 mb-1.5">
                      <span>{so ? "Heerka Xoogga" : "Strength Score"}</span>
                      <span className="font-black text-[#111827] dark:text-white tabular-nums">
                        {metric.score} / 100
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
                        style={{ width: `${metric.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── 6. SMART AI PATTERN TIP ── */}
      <section className="bg-gradient-to-br from-[#0B6EF3]/10 to-transparent border border-[#0B6EF3]/20 rounded-3xl p-5 flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-[#0B6EF3] text-white flex items-center justify-center shrink-0 shadow-xs">
          <Icon name="psychology" size={22} />
        </div>
        <div>
          <p className="text-[13px] font-black text-[#0B6EF3]">
            {so ? "Falanqaynta & Talooyinka Caadada" : "AI Habit Optimization Tip"}
          </p>
          <p className="text-[13px] text-[#111827] dark:text-slate-300 mt-0.5 leading-relaxed">
            {so
              ? "Caadooyinka subaxda la qabto waxay 45% uga dhow yihiin inay noqdaan kuwo joogto ah marka loo eego kuwa habeenka. Isku xir caadadaada cusub mid aad hore u haysatay."
              : "Morning habits have a 45% higher completion probability than unanchored evening habits. Try habit-stacking your newest routine right after an existing daily anchor (like morning coffee)."}
          </p>
        </div>
      </section>
    </div>
  );
}
