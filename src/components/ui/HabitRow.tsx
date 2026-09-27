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

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isUpdating) return;

    const nextState = !completed;
    setCompleted(nextState);
    setStreak((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    if (nextState) {
      // Subtle Apple-style confetti burst
      try {
        confetti({
          particleCount: 28,
          spread: 45,
          origin: {
            x: e.clientX / window.innerWidth,
            y: e.clientY / window.innerHeight,
          },
          colors: ["#22C55E", "#007AFF", "#6bff8f"],
          ticks: 120,
          gravity: 1.2,
          scalar: 0.7,
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

  // Category tinted pill style
  const getCategoryStyles = () => {
    switch (habit.category) {
      case "health":
        return { bg: "bg-[#EFF6FF]", text: "text-[#007AFF]" };
      case "learning":
        return { bg: "bg-[#ECFDF3]", text: "text-[#22C55E]" };
      case "fitness":
        return { bg: "bg-[#f0edec]", text: "text-[#101010]" };
      case "mindfulness":
        return { bg: "bg-[#EFF6FF]", text: "text-[#007AFF]" };
      case "productivity":
      default:
        return { bg: "bg-[#ECFDF3]", text: "text-[#22C55E]" };
    }
  };

  const catStyle = getCategoryStyles();
  const difficultyLabel =
    habit.difficulty.charAt(0).toUpperCase() + habit.difficulty.slice(1);
  const categoryLabel =
    habit.category.charAt(0).toUpperCase() + habit.category.slice(1);

  return (
    <div
      className={`group w-full min-h-[58px] bg-white rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-[0_2px_8px_-2px_rgba(16,24,40,0.04)] border border-[#E5E7EB] transition-all duration-200 hover:shadow-md ${
        completed ? "bg-white/90" : "bg-white"
      }`}
    >
      <Link
        href={`/habits/${habit._id}`}
        className="flex items-center gap-3 min-w-0 flex-1 select-none"
      >
        <div
          className={`w-9 h-9 rounded-xl ${catStyle.bg} ${catStyle.text} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}
        >
          <Icon name={habit.icon || "check_circle"} size={20} />
        </div>

        <div className="flex flex-col min-w-0">
          <h4
            className={`text-[14px] font-semibold text-[#101010] truncate transition-colors ${
              completed ? "text-[#101010]/80" : "text-[#101010]"
            }`}
          >
            {habit.name}
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[12px] text-[#667085]">
              {categoryLabel} • {difficultyLabel}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[#667085] text-[11px] font-medium">
              <Icon name="bolt" size={13} className="text-[#F59E0B]" />
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
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 active:scale-85 cursor-pointer shadow-xs ${
          completed
            ? "bg-[#22C55E] text-white animate-check-pop"
            : "bg-[#f6f3f2] text-transparent hover:border-[#007AFF] hover:text-[#007AFF]/40 border-2 border-[#E5E7EB]"
        }`}
      >
        <Icon name="check" size={16} className={completed ? "text-white" : ""} />
      </button>
    </div>
  );
}
