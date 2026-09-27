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
  streakPercent = 94,
}: ConsistencyStripProps) {
  return (
    <section className="w-full bg-[#ffffff] rounded-2xl p-4 shadow-[0_2px_8px_-2px_rgba(16,24,40,0.04)] border border-[#E5E7EB]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Icon name="bar_chart" size={18} className="text-[#22C55E]" />
          <span className="text-[14px] text-[#101010] font-semibold">
            Weekly Consistency
          </span>
        </div>
        <span className="text-[11px] text-[#22C55E] font-bold uppercase tracking-wider">
          {streakPercent}% Streak
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 pt-1">
        {days.map((day, idx) => {
          const isFull = day.completionRate >= 100;
          return (
            <div key={idx} className="flex flex-col items-center gap-1.5 select-none">
              <span
                className={`text-[11px] font-semibold ${
                  day.isToday ? "text-[#007AFF]" : "text-[#667085]"
                }`}
              >
                {day.isToday ? "Today" : day.dayName}
              </span>

              <div
                className={`w-full h-14 rounded-lg relative flex flex-col justify-end p-1 ${
                  day.isToday
                    ? "bg-[#EFF6FF] border border-[#d8e2ff]"
                    : "bg-[#f6f3f2]"
                }`}
              >
                <div
                  className={`w-full rounded transition-all duration-500 ${
                    day.isToday
                      ? isFull
                        ? "bg-[#22C55E]"
                        : "bg-[#007AFF]"
                      : day.completionRate > 0
                      ? "bg-[#22C55E]"
                      : "bg-transparent"
                  }`}
                  style={{
                    height: `${Math.max(day.completionRate > 0 ? 15 : 0, day.completionRate)}%`,
                  }}
                />
              </div>

              {day.isToday ? (
                isFull ? (
                  <span className="w-4 h-4 rounded-full bg-[#22C55E] flex items-center justify-center text-white">
                    <Icon name="check" size={11} />
                  </span>
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full bg-[#007AFF] flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </span>
                )
              ) : day.completionRate >= 80 ? (
                <Icon name="check" size={14} className="text-[#22C55E]" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5E7EB] mt-1" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
