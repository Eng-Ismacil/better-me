"use client";

import React from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { HabitHealthMetric, WeeklyConsistencyDay } from "@/types";
import { useTranslation } from "@/lib/i18n";
import { UserGamificationProfile } from "@/lib/achievements";

const STATUS_STYLES = {
  Healthy:  { bg: "bg-[#ECFDF3]", text: "text-[#10B981]", bar: "bg-[#10B981]", dot: "bg-[#10B981]" },
  Stable:   { bg: "bg-[#EFF6FF]", text: "text-[#0B6EF3]", bar: "bg-[#0B6EF3]", dot: "bg-[#0B6EF3]" },
  "At Risk":{ bg: "bg-[#FFF7ED]", text: "text-[#F59E0B]", bar: "bg-[#F59E0B]", dot: "bg-[#F59E0B]" },
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
  const arcLength = 2 * Math.PI * 54 * 0.65;
  const strokeDash = (score / 100) * arcLength;
  const color = score >= 80 ? "#10B981" : score >= 60 ? "#0B6EF3" : "#F59E0B";
  return (
    <svg width="160" height="100" viewBox="0 0 160 100" className="overflow-visible">
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path d="M 23 90 A 57 57 0 1 1 137 90" fill="none" stroke="#E2E8F0" strokeWidth="10" strokeLinecap="round" />
      <path d="M 23 90 A 57 57 0 1 1 137 90" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={`${strokeDash} 300`} className="transition-all duration-1000 ease-out" filter="url(#glow)" />
      <text x="80" y="74" textAnchor="middle" fontSize="30" fontWeight="900" fill="#111827">{score}%</text>
      <text x="80" y="90" textAnchor="middle" fontSize="10" fontWeight="700" fill="#667085" letterSpacing="1.5">CONSISTENCY</text>
    </svg>
  );
}

export default function InsightsClient({
  metrics, weeklyDays, consistencyScore, totalStreak, bestStreak, totalCompletions, habitCount, gamification,
}: InsightsClientProps) {
  const { language } = useTranslation();
  const so = language === "so";

  const statusLabel = consistencyScore >= 85
    ? (so ? "Heer Sare" : "Elite Status")
    : consistencyScore >= 65
    ? (so ? "Wanaagsan" : "Active Flow")
    : (so ? "Bilow" : "Building");

  return (
    <div className="flex flex-col gap-5 select-none max-w-5xl mx-auto w-full pb-28 md:pb-12">

      {/* ── 1. HERO BANNER ── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#007AFF] via-[#0B6EF3] to-[#0047CC] p-6 sm:p-8 text-white shadow-[0_8px_32px_rgba(11,110,243,0.28)]">
        <div className="absolute -top-10 -right-10 w-52 h-52 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-14 -left-14 w-60 h-60 bg-[#22C55E]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
          <div className="flex flex-col items-center lg:items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
                <Icon name="insights" size={20} className="text-white" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/70">
                  {so ? "Falanqaynta Horumarkaaga" : "Performance Analytics"}
                </p>
                <h1 className="text-[20px] sm:text-[22px] font-black tracking-tight font-[family-name:var(--font-headline)]">
                  {so ? "Heerka Joogteyntaada" : "Habit Insights Hub"}
                </h1>
              </div>
            </div>
            <div className="my-1"><ScoreArc score={consistencyScore} /></div>
            <span className="px-3.5 py-1 rounded-full text-[11px] font-black bg-white/20 border border-white/25 uppercase tracking-wide">
              {statusLabel} {consistencyScore >= 85 ? "🎉" : consistencyScore >= 65 ? "📈" : "🌱"}
            </span>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <p className="text-[14px] text-white/90 leading-relaxed max-w-md">
              {consistencyScore >= 85
                ? so ? "Heer sare oo joogteyn ah! Waxaad ku jirtaa darajada ugu sarreysa ee xubnaha BetterMe."
                     : "Outstanding! Your habit momentum is in the top tier — keep the chain unbroken."
                : consistencyScore >= 65
                ? so ? "Dardar wanaagsan! Ku dadaal inaad streak-ga sii waddo maalin kasta."
                     : "Great momentum! Keep daily habits unbroken to enter peak automation."
                : so ? "Tallaabooyin yaryar maalinle ah ayaa dhisaya guul weyn. Bilow caado kooban."
                     : "Every small step compounds. Focus on 1–2 core habits daily."}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "local_fire_department", label: so ? "Streak Maanta" : "Current Streak", value: `${totalStreak}d`, color: "#FFD700" },
                { icon: "check_circle",          label: so ? "Guullo Guud"   : "Total Done",       value: totalCompletions.toLocaleString(), color: "#22C55E" },
                { icon: "stars",                  label: so ? "Streak Ugu Dheer" : "Best Streak",  value: `${bestStreak}d`, color: "#FDA4AF" },
              ].map((s) => (
                <div key={s.label} className="bg-black/20 rounded-2xl p-3.5 border border-white/15 flex flex-col items-center gap-1 text-center">
                  <Icon name={s.icon} size={20} style={{ color: s.color }} />
                  <p className="text-[18px] font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
                  <span className="text-[10px] font-bold text-white/70 leading-tight">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. WEEKLY BAR CHART ── */}
      <section className="bg-white rounded-3xl border border-[#E7ECF3] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[16px] font-black text-[#111827]">
              {so ? "Dhaqdhaqaaqa Usbuucan" : "This Week's Daily Rhythm"}
            </h2>
            <p className="text-[12px] text-[#667085] mt-0.5">
              {so ? "Boqolkiiba caadooyinka la qabtay maalin kasta." : "% of scheduled habits achieved per day."}
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold text-[#667085]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0B6EF3]" />{so ? "Maanta" : "Today"}</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#DBEAFE]" />{so ? "Hore" : "Past"}</span>
          </div>
        </div>
        <div className="flex items-end justify-between gap-2 h-32 pt-2">
          {weeklyDays.map((day) => (
            <div key={day.date} className="flex flex-col items-center gap-2 flex-1 group">
              <span className="text-[10px] font-black text-[#667085] opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">{day.completionRate}%</span>
              <div className="w-full flex items-end justify-center h-24">
                <div
                  className={`w-full max-w-[44px] rounded-xl transition-all duration-700 ${
                    day.isToday ? "bg-[#0B6EF3] shadow-[0_4px_12px_rgba(11,110,243,0.35)]"
                    : day.completionRate > 0 ? "bg-[#DBEAFE] hover:bg-[#BFDBFE]"
                    : "bg-slate-100"
                  }`}
                  style={{ height: `${Math.max(8, day.completionRate)}%` }}
                />
              </div>
              <span className={`text-[12px] font-bold ${day.isToday ? "text-[#0B6EF3] font-black" : "text-[#667085]"}`}>{day.dayName}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. KPI CARDS ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          { label: so ? "Guulaha Guud" : "Total Completions", value: totalCompletions, icon: "check_circle",
            iconBg: "bg-[#ECFDF3] text-[#10B981] border-emerald-500/20", valueCls: "text-[#10B981]",
            sub: so ? "Dhammaan caadooyinka la qabtay" : "Lifetime habit executions" },
          { label: so ? "Streak Ugu Dheer" : "Best Streak Record", value: `${bestStreak}d`, icon: "local_fire_department",
            iconBg: "bg-[#FFF1F0] text-[#EF4444] border-rose-500/20", valueCls: "text-[#EF4444]",
            sub: so ? "Xiriirka ugu dheer ee la gaaray" : "Longest unbroken sequence" },
          { label: so ? "Caadooyinka Firfircoon" : "Active Habits", value: habitCount, icon: "spa",
            iconBg: "bg-[#EFF6FF] text-[#0B6EF3] border-blue-500/20", valueCls: "text-[#0B6EF3]",
            sub: so ? "Caadooyinka aad hadda waddo" : "Currently tracked habits" },
          { label: so ? "Caadooyinka Badqaba" : "On Track", value: `${metrics.filter((m) => m.status !== "At Risk").length}/${habitCount || 1}`,
            icon: "trending_up", iconBg: "bg-purple-50 text-purple-600 border-purple-500/20", valueCls: "text-purple-600",
            sub: so ? "Caadooyinka heerka fiican" : "Healthy & stable consistency" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-3xl border border-[#E7ECF3] p-5 shadow-xs flex flex-col justify-between hover:border-[#CBD5E1] transition-all">
            <div className="flex items-start justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] leading-tight max-w-[120px]">{stat.label}</span>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${stat.iconBg}`}>
                <Icon name={stat.icon} size={20} />
              </div>
            </div>
            <p className={`text-[26px] font-black tabular-nums ${stat.valueCls}`}>{stat.value}</p>
            <p className="text-[11px] text-[#667085] mt-2 pt-2 border-t border-[#F2F4F7]">{stat.sub}</p>
          </div>
        ))}
      </section>

      {/* ── 4. ACHIEVEMENTS LINK CARD ── */}
      {gamification && (
        <Link href="/achievements"
          className="group bg-gradient-to-br from-[#0B6EF3]/8 via-white to-[#168A67]/5 border border-[#0B6EF3]/20 hover:border-[#0B6EF3]/50 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-500/10 border border-amber-400/30 flex items-center justify-center shrink-0">
              <Icon name="military_tech" size={30} className="text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-[17px] font-black text-[#111827] group-hover:text-[#0B6EF3] transition-colors">
                  {so ? "Guulaha & Billadaha Sharafta" : "Achievements & Mastery Badges"}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-700">LVL {gamification.level}</span>
              </div>
              <p className="text-[13px] text-[#667085] mt-0.5">
                {so
                  ? `${gamification.unlockedCount} / ${gamification.totalCount} billad la furtay · ${gamification.totalXp.toLocaleString()} XP`
                  : `${gamification.unlockedCount} of ${gamification.totalCount} badges unlocked · ${gamification.totalXp.toLocaleString()} XP`}
              </p>
              <div className="mt-2.5 flex items-center gap-2.5">
                <div className="w-36 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-[#0B6EF3] rounded-full transition-all duration-700"
                    style={{ width: `${gamification.levelProgressPct}%` }} />
                </div>
                <span className="text-[11px] font-black text-[#0B6EF3]">
                  {gamification.levelProgressPct}% {so ? "u dhow LVL" : "to LVL"} {gamification.level + 1}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl bg-[#EFF6FF] border border-[#0B6EF3]/15">
              <span className="text-[17px] font-black text-[#0B6EF3] tabular-nums">{gamification.unlockedCount}</span>
              <span className="text-[10px] font-bold text-[#667085] uppercase">{so ? "Furmay" : "Unlocked"}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl bg-[#EAF8F2] border border-[#168A67]/15">
              <span className="text-[17px] font-black text-[#168A67] tabular-nums">{gamification.totalXp.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-[#667085] uppercase">XP</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#0B6EF3] flex items-center justify-center text-white group-hover:translate-x-1 transition-transform shadow-xs">
              <Icon name="arrow_forward" size={18} />
            </div>
          </div>
        </Link>
      )}

      {/* ── 5. HABIT HEALTH REPORT ── */}
      <section className="bg-white rounded-3xl border border-[#E7ECF3] p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[16px] font-black text-[#111827]">
              {so ? "Warbixinta Caafimaadka Caadooyinka" : "Habit Health & Stability Report"}
            </h3>
            <p className="text-[12px] text-[#667085] mt-0.5">
              {so ? "Qiimeynta xoogga iyo joogteynta 30-kii maalmood." : "30-day consistency score per individual habit."}
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#667085] bg-slate-100 px-3 py-1 rounded-full">30 {so ? "Maalmood" : "Days"}</span>
        </div>

        {metrics.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-[#667085] border border-dashed border-[#E7ECF3] rounded-2xl">
            {so ? "Qabo caadooyin si aad u aragto qiimeynta caafimaadkooda!" : "Complete habit check-ins to generate health scores!"}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {metrics.map((metric) => {
              const style = STATUS_STYLES[metric.status] || STATUS_STYLES["Stable"];
              return (
                <div key={metric.habitId} className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E7ECF3] flex flex-col gap-3 hover:border-[#CBD5E1] transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#E7ECF3] flex items-center justify-center text-[#0B6EF3] shrink-0 shadow-2xs">
                        <Icon name={metric.icon || "check_circle"} size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-black text-[#111827] truncate">{metric.name}</p>
                        <p className="text-[11px] text-[#667085]">{metric.frequencyText}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${style.bg} ${style.text}`}>{metric.status}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#667085] mb-1.5">
                      <span>{so ? "Heerka Xoogga" : "Strength Score"}</span>
                      <span className="font-black text-[#111827] tabular-nums">{metric.score} / 100</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${style.bar}`} style={{ width: `${metric.score}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── 6. AI TIP ── */}
      <section className="bg-gradient-to-br from-[#EFF6FF] via-[#F4F8FF] to-transparent border border-[#0B6EF3]/20 rounded-3xl p-5 flex items-start gap-4">
        <div className="w-11 h-11 rounded-2xl bg-[#0B6EF3] text-white flex items-center justify-center shrink-0 shadow-md">
          <Icon name="psychology" size={23} />
        </div>
        <div>
          <p className="text-[13px] font-black text-[#0B6EF3] mb-0.5">
            {so ? "Falanqaynta & Talooyinka Caadada" : "Habit Optimization Insight"}
          </p>
          <p className="text-[13px] text-[#111827] leading-relaxed">
            {so
              ? "Caadooyinka subaxda la qabto waxay 45% uga dhow yihiin inay noqdaan kuwo joogto ah. Isku xir caadadaada cusub mid aad hore u haysatay si ay si fudud ugu dhexgelto nolol-maalmeedkaaga."
              : "Morning habits have a 45% higher completion probability. Try habit-stacking your newest routine right after an existing daily anchor like morning coffee or breakfast."}
          </p>
        </div>
      </section>
    </div>
  );
}
