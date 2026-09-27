"use client";

import React, { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import HabitRow from "@/components/ui/HabitRow";
import { Habit } from "@/types";

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  health: { bg: "bg-[#ECFDF3]", text: "text-[#22C55E]", dot: "bg-[#22C55E]" },
  fitness: { bg: "bg-[#EFF6FF]", text: "text-[#007AFF]", dot: "bg-[#007AFF]" },
  learning: { bg: "bg-[#FFF7ED]", text: "text-[#F59E0B]", dot: "bg-[#F59E0B]" },
  mindfulness: { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]", dot: "bg-[#6B7280]" },
  productivity: { bg: "bg-[#FDF4FF]", text: "text-[#A855F7]", dot: "bg-[#A855F7]" },
};

const FILTERS = ["All", "Morning", "Evening", "Anytime"] as const;

interface HabitsClientProps {
  habits: Habit[];
  completedIds: string[];
}

export default function HabitsClient({ habits, completedIds: initialCompletedIds }: HabitsClientProps) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set(initialCompletedIds));
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const handleToggle = async (habitId: string) => {
    const isCurrentlyDone = completedIds.has(habitId);
    const nextSet = new Set(completedIds);
    if (isCurrentlyDone) {
      nextSet.delete(habitId);
    } else {
      nextSet.add(habitId);
    }
    setCompletedIds(nextSet);
    try {
      const res = await fetch(`/api/habits/${habitId}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed");
    } catch {
      setCompletedIds(new Set(initialCompletedIds));
    }
  };

  const filtered = habits.filter((h) => {
    const matchesFilter =
      activeFilter === "All" ||
      (h.preferredTime && h.preferredTime === activeFilter);
    const matchesSearch =
      searchQuery === "" ||
      h.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const completedCount = habits.filter((h) => completedIds.has(h._id || "")).length;
  const totalCount = habits.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col gap-5 select-none">
      {/* Header Summary */}
      <section className="w-full bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-[0_2px_12px_rgba(16,24,40,0.04)] relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-[#667085]">Today&apos;s Habits</p>
            <h2 className="text-[22px] font-bold text-[#101010] mt-0.5">
              {completedCount} <span className="text-[#667085] font-medium">/ {totalCount}</span>
            </h2>
            <p className="text-[13px] text-[#667085] mt-0.5">
              {percentage === 100 ? "Perfect day! All habits done 🎉" : `${percentage}% complete today`}
            </p>
          </div>
          <Link
            href="/habits/new"
            className="w-11 h-11 rounded-full bg-[#007AFF] flex items-center justify-center text-white shadow-sm hover:bg-[#0070eb] active:scale-95 transition-all"
          >
            <Icon name="add" size={22} />
          </Link>
        </div>
        {/* Progress bar */}
        <div className="mt-4 h-1.5 w-full bg-[#f0edec] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#007AFF] rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-[#EFF6FF]/60 blur-2xl pointer-events-none" />
      </section>

      {/* Search */}
      <div className="relative">
        <Icon name="search" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#667085]" />
        <input
          type="text"
          placeholder="Search habits..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-[14px] bg-white rounded-xl border border-[#E5E7EB] focus:border-[#007AFF] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-all"
        />
      </div>

      {/* Time of Day Filter Pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setActiveFilter(f)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
              activeFilter === f
                ? "bg-[#007AFF] text-white shadow-sm"
                : "bg-white text-[#667085] border border-[#E5E7EB] hover:border-[#007AFF]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Habits by Category */}
      {filtered.length === 0 ? (
        <div className="p-10 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col items-center text-center">
          <Icon name="manage_search" size={36} className="text-[#667085] mb-3" />
          <p className="text-[15px] font-semibold text-[#101010]">No habits found</p>
          <p className="text-[13px] text-[#667085] mt-1">Try a different filter or search term</p>
          <Link
            href="/habits/new"
            className="mt-5 px-5 py-2.5 bg-[#007AFF] text-white rounded-full text-[13px] font-semibold"
          >
            + Add a new habit
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((habit) => (
            <div key={habit._id} className="relative group">
              <HabitRow
                habit={habit}
                isCompleted={completedIds.has(habit._id || "")}
                onToggle={handleToggle}
              />
              {/* Category badge */}
              <div className={`absolute top-3 right-14 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${CATEGORY_COLORS[habit.category]?.bg || "bg-[#f6f3f2]"} ${CATEGORY_COLORS[habit.category]?.text || "text-[#667085]"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_COLORS[habit.category]?.dot || "bg-[#667085]"}`} />
                {habit.category}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Habit CTA at bottom */}
      <Link
        href="/habits/new"
        className="w-full h-14 border-2 border-dashed border-[#d8e2ff] rounded-2xl flex items-center justify-center gap-2 text-[#007AFF] text-[14px] font-semibold hover:bg-[#EFF6FF] transition-all"
      >
        <Icon name="add_circle" size={20} />
        <span>Add New Habit</span>
      </Link>
    </div>
  );
}
