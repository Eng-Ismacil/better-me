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
  // Compute real average consistency if streakPercent is not explicitly passed
  const calculatedStreak =
    typeof streakPercent === "number"
      ? streakPercent
      : days.length > 0
      ? Math.round(
          days.reduce((acc, d) => acc + (d.completionRate || 0), 0) / days.length
        )
      : 0;

  return (
    <section className="w-full bg-white rounded-[18px] p-4 sm:p-5 shadow-[0_2px_10px_-3px_rgba(17,24,39,0.05)] border border-[#E7ECF3]">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#20C773]/10 flex items-center justify-center text-[#20C773]">
            <Icon name="insert_chart" size={18} />
          </div>
          <span className="text-[14px] sm:text-[15px] text-[#111827] font-bold">
            Weekly Consistency
          </span>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ECFDF3] text-[#20C773] text-[11px] font-bold tracking-wider uppercase border border-[#20C773]/20">
          <Icon name="trending_up" size={13} />
          <span>{calculatedStreak}% Streak</span>
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1">
        {days.map((day, idx) => {
          const isFull = day.completionRate >= 100;
          const hasProgress = day.completionRate > 0;
          return (
            <div key={idx} className="flex flex-col items-center gap-2 select-none">
              <span
                className={`text-[11px] font-semibold tracking-tight ${
                  day.isToday ? "text-[#0B6EF3] font-bold" : "text-[#667085]"
                }`}
              >
                {day.isToday ? "Today" : day.dayName}
              </span>

              {/* Bar track */}
              <div
                className={`w-full h-16 sm:h-20 rounded-xl relative flex flex-col justify-end p-1 transition-all ${
                  day.isToday
                    ? "bg-[#F4F8FF] border border-[#0B6EF3]/30"
                    : "bg-[#F8FAFC] border border-[#E7ECF3]/70"
                }`}
              >
                <div
                  className={`w-full rounded-lg transition-all duration-700 ease-out ${
                    day.isToday
                      ? isFull
                        ? "bg-[#20C773]"
                        : "bg-gradient-to-t from-[#0B6EF3] to-[#3B82F6]"
                      : hasProgress
                      ? isFull
                        ? "bg-[#20C773]"
                        : "bg-[#20C773]/80"
                      : "bg-transparent"
                  }`}
                  style={{
                    height: `${Math.max(hasProgress ? 16 : 0, Math.min(100, day.completionRate))}%`,
                  }}
                />
              </div>

              {/* Status indicator bottom */}
              <div className="h-4 flex items-center justify-center">
                {day.isToday ? (
                  isFull ? (
                    <span className="w-4 h-4 rounded-full bg-[#20C773] flex items-center justify-center text-white shadow-2xs">
                      <Icon name="check" size={11} />
                    </span>
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full bg-[#0B6EF3] flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>
                  )
                ) : isFull ? (
                  <span className="w-4 h-4 rounded-full bg-[#ECFDF3] text-[#20C773] flex items-center justify-center">
                    <Icon name="check" size={12} />
                  </span>
                ) : hasProgress ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#20C773]" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E7ECF3]" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

