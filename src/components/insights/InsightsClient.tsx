"use client";

import React from "react";
import Icon from "@/components/ui/Icon";
import { HabitHealthMetric, WeeklyConsistencyDay } from "@/types";

const STATUS_STYLES = {
  Healthy: { bg: "bg-[#ECFDF3]", text: "text-[#22C55E]", bar: "bg-[#22C55E]" },
  Stable: { bg: "bg-[#EFF6FF]", text: "text-[#007AFF]", bar: "bg-[#007AFF]" },
  "At Risk": { bg: "bg-[#FFF7ED]", text: "text-[#F59E0B]", bar: "bg-[#F59E0B]" },
};

interface InsightsClientProps {
  metrics: HabitHealthMetric[];
  weeklyDays: WeeklyConsistencyDay[];
  consistencyScore: number;
  totalStreak: number;
  bestStreak: number;
  totalCompletions: number;
  habitCount: number;
}

function ScoreArc({ score }: { score: number }) {
  // SVG arc for consistency score gauge
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.65; // 65% of circle = 234 degrees
  const filled = (score / 100) * arcLength;

  return (
    <svg width="140" height="90" viewBox="0 0 140 90">
      {/* Track */}
      <path
        d="M 15 80 A 55 55 0 1 1 125 80"
        fill="none"
        stroke="#E5E7EB"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Filled */}
      <path
        d="M 15 80 A 55 55 0 1 1 125 80"
        fill="none"
        stroke={score >= 80 ? "#22C55E" : score >= 60 ? "#007AFF" : "#F59E0B"}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${(score / 100) * 218} 218`}
      />
      {/* Score text */}
      <text x="70" y="66" textAnchor="middle" fontSize="24" fontWeight="700" fill="#101010">
        {score}%
      </text>
      <text x="70" y="82" textAnchor="middle" fontSize="10" fill="#667085">
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
}: InsightsClientProps) {
  return (
    <div className="flex flex-col gap-5 select-none">
      {/* Consistency Score Hero Card */}
      <section className="w-full bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-[0_2px_12px_rgba(16,24,40,0.04)] relative overflow-hidden flex flex-col items-center">
        <div className="flex items-center gap-1.5 self-start mb-3">
          <Icon name="insert_chart" size={16} className="text-[#007AFF]" />
          <span className="text-[12px] font-semibold uppercase tracking-wider text-[#667085]">
            Weekly Consistency Score
          </span>
        </div>

        <ScoreArc score={consistencyScore} />

        <p className="text-[13px] text-[#667085] mt-2 text-center">
          {consistencyScore >= 85
            ? "Outstanding consistency! You're in the top tier."
            : consistencyScore >= 65
            ? "Great momentum. Keep the streak alive!"
            : "Room to grow. Small steps count."}
        </p>

        {/* Ambient glow */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-[#EFF6FF]/60 blur-2xl pointer-events-none" />
      </section>

      {/* Weekly Rhythm Bar Chart */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
        <h3 className="text-[15px] font-bold text-[#101010] mb-4">This Week&apos;s Rhythm</h3>
        <div className="flex items-end justify-between gap-2 h-24">
          {weeklyDays.map((day) => {
            const barHeight = `${Math.max(8, day.completionRate)}%`;
            const isToday = day.isToday;
            return (
              <div key={day.date} className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full flex items-end justify-center" style={{ height: "80px" }}>
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      isToday ? "bg-[#007AFF]" : day.completionRate > 0 ? "bg-[#007AFF]/40" : "bg-[#f0edec]"
                    }`}
                    style={{ height: barHeight, minHeight: "6px" }}
                  />
                </div>
                <span className={`text-[11px] font-semibold ${isToday ? "text-[#007AFF]" : "text-[#667085]"}`}>
                  {day.dayName}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-4 text-[12px] text-[#667085]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#007AFF]" />
            Today
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#007AFF]/40" />
            Past days
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-3">
        {[
          { label: "Total Completions", value: totalCompletions, icon: "check_circle", color: "#22C55E", bg: "#ECFDF3" },
          { label: "Best Streak", value: `${bestStreak}d`, icon: "local_fire_department", color: "#EF4444", bg: "#FFF1F0" },
          { label: "Active Habits", value: habitCount, icon: "spa", color: "#007AFF", bg: "#EFF6FF" },
          { label: "Habits on Track", value: `${metrics.filter(m => m.status !== "At Risk").length}/${habitCount}`, icon: "trending_up", color: "#A855F7", bg: "#FDF4FF" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-[#E5E7EB] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: stat.bg }}>
              <Icon name={stat.icon} size={20} style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-[20px] font-bold text-[#101010] leading-tight">{stat.value}</p>
              <p className="text-[11px] text-[#667085] leading-tight">{stat.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Habit Health Metrics */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-[#101010]">Habit Health Report</h3>
          <span className="text-[12px] text-[#667085]">Last 30 days</span>
        </div>

        {metrics.length === 0 ? (
          <p className="text-[13px] text-[#667085] text-center py-6">
            Complete some habits to see your health metrics!
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {metrics.map((metric) => {
              const style = STATUS_STYLES[metric.status] || STATUS_STYLES["Stable"];
              return (
                <div key={metric.habitId} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                        <Icon name={metric.icon} size={16} className="text-[#007AFF]" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#101010]">{metric.name}</p>
                        <p className="text-[11px] text-[#667085]">{metric.frequencyText}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${style.bg} ${style.text}`}>
                      {metric.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[#f0edec] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
                        style={{ width: `${metric.score}%` }}
                      />
                    </div>
                    <span className="text-[12px] font-bold text-[#667085] w-8 text-right">{metric.score}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Smart Tip */}
      <section className="bg-[#EFF6FF] border border-[#d8e2ff] rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 text-[#007AFF] shadow-xs">
          <Icon name="psychology" size={18} className="text-[#007AFF]" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-[#007AFF]">AI Pattern Insight</p>
          <p className="text-[13px] text-[#101010] mt-0.5 leading-snug">
            Your morning habits have a{" "}
            <span className="font-semibold">40% higher</span> completion rate when
            started before 9:00 AM. Try scheduling evening habits right after dinner
            for best results.
          </p>
        </div>
      </section>
    </div>
  );
}
