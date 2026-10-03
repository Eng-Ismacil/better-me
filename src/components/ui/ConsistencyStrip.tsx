"use client";

import React from "react";
import Icon from "./Icon";
import { WeeklyConsistencyDay } from "@/types";

interface ConsistencyStripProps {
  days: WeeklyConsistencyDay[];
  streakPercent?: number;
}

export default function ConsistencyStrip({
  days,
  streakPercent,
}: ConsistencyStripProps) {
  const calculatedStreak =
    typeof streakPercent === "number"
      ? streakPercent
      : days.length > 0
      ? Math.round(
          days.reduce((acc, d) => acc + (d.completionRate || 0), 0) / days.length
        )
      : 0;

  return (
    <section className="w-full bg-white rounded-3xl p-5 border border-slate-200/70 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0B6EF3] flex items-center justify-center">
            <Icon name="bar_chart" size={19} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#0F172A] leading-tight">
              Weekly Consistency
            </h3>
            <p className="text-[11px] text-[#64748B]">Last 7 days performance</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-extrabold uppercase tracking-wide border border-emerald-200/60">
          <Icon name="trending_up" size={13} />
          <span>{calculatedStreak}%</span>
        </span>
      </div>

      {/* Capsule Bar Chart — fully responsive */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1 pb-1">
        {days.map((day, idx) => {
          const isFull = day.completionRate >= 100;
          const hasProgress = day.completionRate > 0;
          const heightPercent = Math.max(hasProgress ? 20 : 8, Math.min(100, day.completionRate));

          return (
            <div key={idx} className="flex flex-col items-center gap-1.5 sm:gap-2 select-none group min-w-0">
              {/* Capsule track */}
              <div
                className={`w-full h-16 sm:h-20 rounded-full relative flex flex-col justify-end p-1 transition-all ${
                  day.isToday
                    ? "bg-slate-100 ring-2 ring-[#0B6EF3]/30"
                    : "bg-slate-100/80 hover:bg-slate-100"
                }`}
              >
                {/* Filled pill */}
                <div
                  className={`w-full rounded-full transition-all duration-700 ease-out ${
                    day.isToday
                      ? isFull
                        ? "bg-[#10B981] shadow-xs"
                        : "bg-gradient-to-t from-[#0B6EF3] to-[#3B82F6] shadow-xs"
                      : isFull
                      ? "bg-[#10B981]"
                      : hasProgress
                      ? "bg-[#10B981]/70"
                      : "bg-slate-200/60"
                  }`}
                  style={{
                    height: `${heightPercent}%`,
                  }}
                />
              </div>

              {/* Day label */}
              <span
                className={`text-[9px] sm:text-[11px] tracking-tight transition-colors text-center leading-none ${
                  day.isToday
                    ? "text-[#0B6EF3] font-extrabold"
                    : "text-[#64748B] font-semibold"
                }`}
              >
                {day.isToday ? "Now" : day.dayName.slice(0, 3)}
              </span>

              {/* Micro dot */}
              <div className="h-2 flex items-center justify-center -mt-1">
                {day.isToday ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B6EF3]" />
                ) : isFull ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                ) : (
                  <span className="w-1 h-1 rounded-full bg-transparent" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
