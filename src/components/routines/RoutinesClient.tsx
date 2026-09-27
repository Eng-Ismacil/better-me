"use client";

import React, { useState } from "react";
import Icon from "@/components/ui/Icon";
import Link from "next/link";
import { Routine, Habit } from "@/types";

interface RoutinesClientProps {
  routines: Routine[];
  habits: Habit[];
}

const TIME_ICONS: Record<string, string> = {
  Morning: "wb_sunny",
  Afternoon: "wb_cloudy",
  Evening: "nightlight_round",
  Night: "dark_mode",
};

export default function RoutinesClient({ routines, habits }: RoutinesClientProps) {
  const [expanded, setExpanded] = useState<string | null>(routines[0]?._id || null);

  const habitMap = new Map(habits.map((h) => [h._id, h]));

  return (
    <div className="flex flex-col gap-5 select-none">
      {/* Header */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-[0_2px_12px_rgba(16,24,40,0.04)] relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-[#667085]">Your Routines</p>
            <h2 className="text-[22px] font-bold text-[#101010] mt-0.5">{routines.length} Active</h2>
            <p className="text-[13px] text-[#667085] mt-0.5">Structured sequences for daily flow</p>
          </div>
          <div className="w-14 h-14 rounded-full bg-[#ECFDF3] flex items-center justify-center">
            <Icon name="auto_stories" size={28} className="text-[#22C55E]" />
          </div>
        </div>
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-[#ECFDF3]/60 blur-2xl pointer-events-none" />
      </section>

      {/* Routines List */}
      {routines.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 flex flex-col items-center text-center">
          <Icon name="auto_stories" size={40} className="text-[#22C55E] mb-3" />
          <h3 className="text-[16px] font-bold text-[#101010]">No routines yet</h3>
          <p className="text-[13px] text-[#667085] mt-1 max-w-xs">
            Group your habits into structured routines for powerful daily momentum.
          </p>
          <button
            type="button"
            className="mt-5 px-5 py-2.5 bg-[#22C55E] text-white rounded-full text-[13px] font-semibold"
          >
            Create Morning Routine
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {routines.map((routine) => {
            const isExpanded = expanded === routine._id;
            const routineHabits = (routine.habits || [])
              .sort((a, b) => a.order - b.order)
              .map((rh) => habitMap.get(rh.habitId))
              .filter(Boolean) as Habit[];

            // Determine time of day label from timeOfDay string
            const timeLabel = routine.timeOfDay?.toLowerCase().includes("am") ? "Morning" :
              routine.timeOfDay?.toLowerCase().includes("pm") ? "Evening" : "Morning";

            return (
              <div
                key={routine._id}
                className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-[0_2px_8px_rgba(16,24,40,0.03)]"
              >
                {/* Routine Header */}
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : routine._id || null)}
                  className="w-full flex items-center gap-4 p-5 hover:bg-[#f6f3f2] transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0">
                    <Icon name={routine.icon || "auto_stories"} size={24} className="text-[#007AFF]" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-[15px] font-bold text-[#101010] truncate">{routine.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Icon name={TIME_ICONS[timeLabel] || "schedule"} size={12} className="text-[#667085]" />
                      <span className="text-[12px] text-[#667085]">{routine.timeOfDay} · {routineHabits.length} habits</span>
                    </div>
                  </div>
                  <Icon name={isExpanded ? "expand_less" : "expand_more"} size={20} className="text-[#667085] shrink-0" />
                </button>

                {/* Expanded Habits */}
                {isExpanded && (
                  <div className="px-5 pb-5 flex flex-col gap-2 border-t border-[#f0edec]">
                    <p className="text-[12px] text-[#667085] pt-3 pb-1">{routine.description}</p>
                    {routineHabits.length === 0 ? (
                      <p className="text-[13px] text-[#667085] text-center py-4">No habits in this routine</p>
                    ) : (
                      routineHabits.map((habit, index) => (
                        <div key={habit._id} className="flex items-center gap-3 p-3 bg-[#f6f3f2] rounded-xl">
                          <div className="w-6 h-6 rounded-full bg-[#007AFF] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                            {index + 1}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                            <Icon name={habit.icon} size={16} className="text-[#007AFF]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[#101010] truncate">{habit.name}</p>
                            <p className="text-[11px] text-[#667085]">{habit.difficulty} · {habit.preferredTime}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Icon name="local_fire_department" size={13} className="text-[#EF4444]" />
                            <span className="text-[12px] font-bold text-[#667085]">{habit.currentStreak}d</span>
                          </div>
                        </div>
                      ))
                    )}

                    <Link
                      href="/home"
                      className="mt-2 w-full h-11 bg-[#007AFF] text-white rounded-full text-[13px] font-semibold flex items-center justify-center gap-1.5 hover:bg-[#0070eb] transition-all"
                    >
                      <Icon name="play_circle" size={16} />
                      Start Routine
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Suggested Routines */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col gap-3">
        <h3 className="text-[15px] font-bold text-[#101010]">Suggested Routines</h3>
        {[
          { name: "Power Morning", icon: "wb_sunny", desc: "Hydration, meditation, exercise", color: "#F59E0B", bg: "#FFF7ED" },
          { name: "Evening Wind Down", icon: "nightlight_round", desc: "Journal, reading, sleep prep", color: "#007AFF", bg: "#EFF6FF" },
          { name: "Deep Work Block", icon: "laptop_chromebook", desc: "Focus timer + review session", color: "#A855F7", bg: "#FDF4FF" },
        ].map((s) => (
          <div key={s.name} className="flex items-center gap-3 p-3 bg-[#f6f3f2] rounded-xl">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: s.bg }}>
              <Icon name={s.icon} size={20} style={{ color: s.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#101010]">{s.name}</p>
              <p className="text-[11px] text-[#667085]">{s.desc}</p>
            </div>
            <button type="button" className="text-[12px] font-semibold text-[#007AFF] shrink-0">
              Add
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
