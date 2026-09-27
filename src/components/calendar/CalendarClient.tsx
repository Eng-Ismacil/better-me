"use client";

import React, { useState } from "react";
import Icon from "@/components/ui/Icon";
import { Habit } from "@/types";

interface CalendarClientProps {
  calendarData: Record<string, { count: number; rate: number }>;
  totalHabits: number;
  todayCompletedIds: string[];
  habits: Habit[];
}

const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getRateColor(rate: number): string {
  if (rate === 0) return "bg-[#f0edec]";
  if (rate < 40) return "bg-[#adc6ff]/60";
  if (rate < 70) return "bg-[#007AFF]/50";
  if (rate < 90) return "bg-[#007AFF]/80";
  return "bg-[#007AFF]";
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  // Returns 0=Mon, 1=Tue, ... 6=Sun (Monday-first)
  const d = new Date(year, month, 1).getDay();
  return (d + 6) % 7;
}

export default function CalendarClient({ calendarData, totalHabits, habits }: CalendarClientProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const todayStr = today.toISOString().split("T")[0];
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentYear(y => y - 1); setCurrentMonth(11); }
    else setCurrentMonth(m => m - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentYear(y => y + 1); setCurrentMonth(0); }
    else setCurrentMonth(m => m + 1);
    setSelectedDate(null);
  };

  const calendarCells: Array<{ date: string | null; day: number | null }> = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push({ date: null, day: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(currentMonth + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    calendarCells.push({ date: `${currentYear}-${mm}-${dd}`, day: d });
  }

  // Monthly stats
  const monthCompletions = Object.entries(calendarData).filter(([date]) => {
    const [y, m] = date.split("-");
    return Number(y) === currentYear && Number(m) === currentMonth + 1;
  });
  const perfectDays = monthCompletions.filter(([, v]) => v.rate === 100).length;
  const activeDays = monthCompletions.filter(([, v]) => v.count > 0).length;
  const avgRate = activeDays > 0 ? Math.round(monthCompletions.reduce((s, [, v]) => s + v.rate, 0) / monthCompletions.length) : 0;

  const selectedDayData = selectedDate ? calendarData[selectedDate] : null;

  return (
    <div className="flex flex-col gap-5 select-none">
      {/* Month Selector */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-[0_2px_12px_rgba(16,24,40,0.04)]">
        <div className="flex items-center justify-between mb-5">
          <button
            type="button"
            onClick={prevMonth}
            className="w-9 h-9 rounded-full bg-[#f6f3f2] flex items-center justify-center text-[#667085] hover:text-[#101010] active:scale-95 transition-all"
          >
            <Icon name="chevron_left" size={20} />
          </button>
          <h2 className="text-[17px] font-bold text-[#101010]">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          <button
            type="button"
            onClick={nextMonth}
            disabled={currentYear === today.getFullYear() && currentMonth === today.getMonth()}
            className="w-9 h-9 rounded-full bg-[#f6f3f2] flex items-center justify-center text-[#667085] hover:text-[#101010] active:scale-95 transition-all disabled:opacity-30"
          >
            <Icon name="chevron_right" size={20} />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-center text-[11px] font-semibold text-[#667085] py-1">{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((cell, i) => {
            if (!cell.date || !cell.day) {
              return <div key={`empty-${i}`} />;
            }
            const data = calendarData[cell.date];
            const isToday = cell.date === todayStr;
            const isSelected = cell.date === selectedDate;
            const isFuture = cell.date > todayStr;

            return (
              <button
                key={cell.date}
                type="button"
                onClick={() => setSelectedDate(isSelected ? null : cell.date)}
                disabled={isFuture}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all text-center ${
                  isSelected
                    ? "ring-2 ring-[#007AFF] scale-110"
                    : isToday
                    ? "ring-2 ring-[#007AFF]/50"
                    : ""
                } ${
                  isFuture
                    ? "opacity-30 cursor-default"
                    : "cursor-pointer hover:scale-105 active:scale-95"
                } ${data ? getRateColor(data.rate) : "bg-[#f6f3f2]"}`}
              >
                <span className={`text-[11px] font-semibold leading-none ${
                  isToday ? "text-[#007AFF]" : data && data.rate > 50 ? "text-white" : "text-[#101010]"
                }`}>
                  {cell.day}
                </span>
                {data && data.count > 0 && (
                  <span className={`text-[8px] leading-none ${data.rate > 50 ? "text-white/80" : "text-[#667085]"}`}>
                    {data.rate}%
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <span className="text-[11px] text-[#667085]">Less</span>
          {[0, 40, 70, 90, 100].map((r) => (
            <div key={r} className={`w-4 h-4 rounded-sm ${getRateColor(r)}`} />
          ))}
          <span className="text-[11px] text-[#667085]">More</span>
        </div>
      </section>

      {/* Selected Day Detail */}
      {selectedDate && (
        <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-[#101010]">
              {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric"
              })}
            </h3>
            <button type="button" onClick={() => setSelectedDate(null)} className="text-[#667085]">
              <Icon name="close" size={18} />
            </button>
          </div>
          {selectedDayData ? (
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-[#EFF6FF] rounded-xl p-3 text-center">
                <p className="text-[22px] font-bold text-[#007AFF]">{selectedDayData.rate}%</p>
                <p className="text-[11px] text-[#667085]">Completion</p>
              </div>
              <div className="flex-1 bg-[#ECFDF3] rounded-xl p-3 text-center">
                <p className="text-[22px] font-bold text-[#22C55E]">{selectedDayData.count}</p>
                <p className="text-[11px] text-[#667085]">Habits Done</p>
              </div>
              <div className="flex-1 bg-[#f6f3f2] rounded-xl p-3 text-center">
                <p className="text-[22px] font-bold text-[#667085]">{totalHabits - selectedDayData.count}</p>
                <p className="text-[11px] text-[#667085]">Missed</p>
              </div>
            </div>
          ) : (
            <p className="text-[13px] text-[#667085]">No habits tracked on this day.</p>
          )}
        </section>
      )}

      {/* Monthly Stats */}
      <section className="grid grid-cols-3 gap-3">
        {[
          { label: "Perfect Days", value: perfectDays, icon: "star", color: "#F59E0B", bg: "#FFF7ED" },
          { label: "Active Days", value: activeDays, icon: "local_fire_department", color: "#EF4444", bg: "#FFF1F0" },
          { label: "Avg. Rate", value: `${avgRate}%`, icon: "insert_chart", color: "#007AFF", bg: "#EFF6FF" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-[#E5E7EB] p-4 flex flex-col items-center text-center gap-1.5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: stat.bg }}>
              <Icon name={stat.icon} size={18} style={{ color: stat.color }} />
            </div>
            <p className="text-[20px] font-bold text-[#101010]">{stat.value}</p>
            <p className="text-[11px] text-[#667085]">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Habit Legend */}
      {habits.length > 0 && (
        <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col gap-3">
          <h3 className="text-[15px] font-bold text-[#101010]">Tracked Habits</h3>
          <div className="flex flex-col gap-2">
            {habits.slice(0, 6).map((h) => (
              <div key={h._id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                  <Icon name={h.icon} size={16} className="text-[#007AFF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#101010] truncate">{h.name}</p>
                  <p className="text-[11px] text-[#667085]">{h.currentStreak} day streak</p>
                </div>
                <div className="flex items-center gap-1 text-[#22C55E]">
                  <Icon name="local_fire_department" size={14} />
                  <span className="text-[12px] font-bold">{h.currentStreak}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
