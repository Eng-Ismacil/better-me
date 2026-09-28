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

  // Sync state if props change
  React.useEffect(() => {
    setCompleted(initialCompleted);
  }, [initialCompleted]);

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
          particleCount: 30,
          spread: 50,
          origin: {
            x: e.clientX / window.innerWidth,
            y: e.clientY / window.innerHeight,
          },
          colors: ["#20C773", "#0B6EF3", "#86EFAC"],
          ticks: 120,
          gravity: 1.2,
          scalar: 0.75,
        });
      } catch {
        // Fallback gracefully if confetti fails
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

  // Category styling
  const getCategoryStyles = () => {
    switch (habit.category?.toLowerCase()) {
      case "health":
        return { bg: "bg-[#F4F8FF]", text: "text-[#0B6EF3]", border: "border-[#D0E2FF]" };
      case "mindfulness":
        return { bg: "bg-[#F5F3FF]", text: "text-[#8B5CF6]", border: "border-[#DDD6FE]" };
      case "fitness":
        return { bg: "bg-[#FFF7ED]", text: "text-[#EA580C]", border: "border-[#FED7AA]" };
      case "learning":
        return { bg: "bg-[#FEF3C7]", text: "text-[#D97706]", border: "border-[#FDE68A]" };
      case "productivity":
      default:
        return { bg: "bg-[#ECFDF3]", text: "text-[#20C773]", border: "border-[#A7F3D0]" };
    }
  };

  const catStyle = getCategoryStyles();
  const difficultyLabel =
    habit.difficulty ? habit.difficulty.charAt(0).toUpperCase() + habit.difficulty.slice(1) : "Easy";
  const categoryLabel =
    habit.category ? habit.category.charAt(0).toUpperCase() + habit.category.slice(1) : "General";

  return (
    <div
      className={`group w-full min-h-[64px] bg-white rounded-[16px] p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-all duration-200 shadow-[0_2px_8px_-2px_rgba(17,24,39,0.04)] hover:shadow-md ${
        completed
          ? "border-l-[4px] border-l-[#20C773] border-t border-r border-b border-[#E7ECF3] bg-[#FCFDFD]"
          : "border border-[#E7ECF3]"
      }`}
    >
      <Link
        href={`/habits/${habit._id}`}
        className="flex items-center gap-3.5 min-w-0 flex-1 select-none"
      >
        <div
          className={`w-11 h-11 rounded-[12px] ${catStyle.bg} ${catStyle.text} border ${catStyle.border} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs`}
        >
          <Icon name={habit.icon || "check_circle"} size={22} />
        </div>

        <div className="flex flex-col min-w-0">
          <h4
            className={`text-[15px] font-bold text-[#111827] truncate transition-colors ${
              completed ? "line-through text-[#667085]/90" : "text-[#111827]"
            }`}
          >
            {habit.name}
          </h4>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[12px] text-[#667085] font-medium">
              {categoryLabel} • {difficultyLabel}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#D97706] text-[11px] font-bold border border-[#FDE68A]/70">
              <Icon name="bolt" size={13} className="text-[#D97706]" />
              <span>
                {streak} {streak === 1 ? "day" : "days"}
              </span>
            </span>
          </div>
        </div>
      </Link>

      <button
        type="button"
        aria-label={`Mark ${habit.name} as ${completed ? "incomplete" : "complete"}`}
        onClick={handleToggle}
        disabled={isUpdating}
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 active:scale-85 cursor-pointer ${
          completed
            ? "bg-[#20C773] text-white border-2 border-[#20C773] shadow-[0_2px_8px_rgba(32,199,115,0.35)] animate-check-pop"
            : "bg-white text-transparent hover:border-[#0B6EF3] hover:bg-[#0B6EF3]/5 border-2 border-[#D1D5DB]"
        }`}
      >
        <Icon name="check" size={17} className={completed ? "text-white" : "opacity-0"} />
      </button>
    </div>
  );
}

