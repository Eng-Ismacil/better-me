"use client";

import React, { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import HabitRow from "@/components/ui/HabitRow";
import { Habit } from "@/types";
import { useFetchHabits } from "@/hooks/useFetchHabits";
import HabitListSkeleton from "./HabitListSkeleton";

const FILTERS = ["All", "Morning", "Evening", "Anytime"] as const;

interface HabitsClientProps {
  habits: Habit[];
  completedIds: string[];
}

export default function HabitsClient({ habits: initialHabits, completedIds: initialCompletedIds }: HabitsClientProps) {
  const {
    habits: rawHabits,
    completedIds,
    isLoading,
    toggleHabit,
  } = useFetchHabits({
    initialHabits,
    initialCompletedIds,
  });

  // Safety guard: ensure habits is always an array
  const habits = Array.isArray(rawHabits) ? rawHabits : [];

  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const handleToggle = async (habitId: string) => {
    toggleHabit(habitId);
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
    <div className="flex flex-col gap-5 select-none pb-8">
      {/* Header Summary Card */}
      <section className="w-full bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/70 shadow-[0_4px_20px_-4px_rgba(11,110,243,0.05)] relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#0B6EF3]">
              Daily Habit Tracker
            </p>
            <h2 className="text-[24px] font-extrabold text-[#0F172A] tracking-tight mt-0.5">
              {completedCount}{" "}
              <span className="text-slate-400 font-semibold text-[18px]">
                / {totalCount}
              </span>
            </h2>
            <p className="text-[13px] text-slate-500 mt-0.5">
              {percentage === 100
                ? "Perfect day! All habits done 🎉"
                : `${percentage}% completed today`}
            </p>
          </div>
          <Link
            href="/habits/new"
            aria-label="Add habit"
            className="w-12 h-12 rounded-full bg-[#0B6EF3] hover:bg-[#0958c7] flex items-center justify-center text-white shadow-md shadow-[#0B6EF3]/25 active:scale-95 transition-all"
          >
            <Icon name="add" size={22} />
          </Link>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0B6EF3] rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </section>

      {/* Search Input */}
      <div className="relative">
        <Icon
          name="search"
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search your habits..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-[14px] bg-white rounded-2xl border border-slate-200/80 focus:border-[#0B6EF3] focus:outline-none focus:ring-2 focus:ring-[#0B6EF3]/15 transition-all shadow-2xs"
        />
      </div>

      {/* Segmented Filter Control (Torin iOS Style) */}
      <div className="bg-slate-200/60 p-1 rounded-2xl flex gap-1 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setActiveFilter(f)}
            className={`flex-1 min-w-[70px] py-1.5 px-3 rounded-xl text-[12px] font-bold transition-all text-center cursor-pointer ${
              activeFilter === f
                ? "bg-white text-[#0F172A] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Habits List */}
      {isLoading ? (
        <HabitListSkeleton count={4} />
      ) : filtered.length === 0 ? (
        <div className="p-10 bg-white rounded-3xl border border-slate-200/70 flex flex-col items-center text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B6EF3] flex items-center justify-center mb-3">
            <Icon name="manage_search" size={26} />
          </div>
          <p className="text-[16px] font-bold text-[#0F172A]">No habits found</p>
          <p className="text-[13px] text-slate-500 mt-1">Try a different filter or search term</p>
          <Link
            href="/habits/new"
            className="mt-5 px-5 py-2.5 bg-[#0B6EF3] text-white hover:bg-[#0958c7] rounded-full text-[13px] font-bold shadow-md shadow-[#0B6EF3]/20 active:scale-95 transition-all"
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
            </div>
          ))}
        </div>
      )}

      {/* Add Habit CTA button */}
      <Link
        href="/habits/new"
        className="w-full h-13 border-2 border-dashed border-slate-300 hover:border-[#0B6EF3] rounded-2xl flex items-center justify-center gap-2 text-slate-700 hover:text-[#0B6EF3] text-[14px] font-bold bg-white/50 hover:bg-blue-50/40 transition-all cursor-pointer"
      >
        <Icon name="add_circle" size={20} />
        <span>Add New Habit</span>
      </Link>
    </div>
  );
}
