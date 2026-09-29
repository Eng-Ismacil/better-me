"use client";

import React, { useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import { Habit } from "@/types";
import confetti from "canvas-confetti";

interface HabitRowProps {
  habit: Habit;
  isCompleted: boolean;
  onToggle: (habitId: string) => Promise<void>;
  showCategoryTag?: boolean;
}

export default function HabitRow({
  habit,
  isCompleted: initialCompleted,
  onToggle,
}: HabitRowProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [streak, setStreak] = useState(habit.currentStreak || 0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync if prop changes without calling setState in an effect
  const [prevInitial, setPrevInitial] = useState(initialCompleted);
  if (prevInitial !== initialCompleted) {
    setPrevInitial(initialCompleted);
    setCompleted(initialCompleted);
  }

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isUpdating) return;

    const nextState = !completed;
    setCompleted(nextState);
    setStreak((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    if (nextState) {
      try {
        confetti({
          particleCount: 25,
          spread: 45,
          origin: {
            x: e.clientX / window.innerWidth,
            y: e.clientY / window.innerHeight,
          },
          colors: ["#10B981", "#0B6EF3", "#38BDF8"],
          ticks: 100,
          gravity: 1.2,
          scalar: 0.75,
        });
      } catch {
        // Fallback gracefully if canvas confetti fails
      }
    }

    try {
      setIsUpdating(true);
      await onToggle(habit._id || "");
    } catch {
      // Rollback on failure
      setCompleted(!nextState);
      setStreak((prev) => (nextState ? Math.max(0, prev - 1) : prev + 1));
    } finally {
      setIsUpdating(false);
    }
  };

  const getCategoryStyles = () => {
    switch (habit.category?.toLowerCase()) {
      case "health":
        return { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" };
      case "mindfulness":
        return { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" };
      case "fitness":
        return { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100" };
      case "learning":
        return { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" };
      case "productivity":
      default:
        return { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" };
    }
  };

  const catStyle = getCategoryStyles();
  const difficultyLabel =
    habit.difficulty ? habit.difficulty.charAt(0).toUpperCase() + habit.difficulty.slice(1) : "Easy";
  const categoryLabel =
    habit.category ? habit.category.charAt(0).toUpperCase() + habit.category.slice(1) : "General";

  return (
    <div
      className={`group w-full min-h-[64px] bg-white rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3.5 transition-all duration-200 border ${
        completed
          ? "border-emerald-200/60 bg-emerald-50/[0.15]"
          : "border-slate-200/70 hover:border-slate-300 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)]"
      }`}
    >
      <Link
        href={`/habits/${habit._id}`}
        className="flex items-center gap-3.5 min-w-0 flex-1 select-none"
      >
        {/* Category Squircle Icon */}
        <div
          className={`w-11 h-11 rounded-xl ${catStyle.bg} ${catStyle.text} border ${catStyle.border} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs`}
        >
          <Icon name={habit.icon || "check_circle"} size={22} />
        </div>

        {/* Content */}
        <div className="flex flex-col min-w-0">
          <h4
            className={`text-[15px] font-bold tracking-tight truncate transition-colors ${
              completed ? "line-through text-slate-400" : "text-[#0F172A]"
            }`}
          >
            {habit.name}
          </h4>

          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[12px] text-slate-500 font-medium">
              {categoryLabel} • {difficultyLabel}
            </span>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200/60">
              <Icon name="bolt" size={13} className="text-amber-600" />
              <span>
                {streak} {streak === 1 ? "day" : "days"}
              </span>
            </span>
          </div>
        </div>
      </Link>

      {/* Completion Toggle Button */}
      <button
        type="button"
        aria-label={`Mark ${habit.name} as ${completed ? "incomplete" : "complete"}`}
        onClick={handleToggle}
        disabled={isUpdating}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 active:scale-85 cursor-pointer ${
          completed
            ? "bg-[#10B981] text-white shadow-[0_2px_10px_rgba(16,185,129,0.35)]"
            : "bg-white hover:bg-slate-50 border-2 border-slate-300 text-transparent"
        }`}
      >
        <Icon
          name="check"
          size={18}
          className={completed ? "text-white" : "opacity-0"}
        />
      </button>
    </div>
  );
}
