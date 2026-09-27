"use client";

import React, { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import ProgressRing from "@/components/ui/ProgressRing";
import ConsistencyStrip from "@/components/ui/ConsistencyStrip";
import HabitRow from "@/components/ui/HabitRow";
import { Habit, WeeklyConsistencyDay } from "@/types";

interface HomeDashboardProps {
  userName: string;
  habits: Habit[];
  initialCompletedHabitIds: string[];
  weeklyDays: WeeklyConsistencyDay[];
}

export default function HomeDashboard({
  userName,
  habits,
  initialCompletedHabitIds,
  weeklyDays,
}: HomeDashboardProps) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    new Set(initialCompletedHabitIds)
  );
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  const totalHabits = habits.length;
  const completedCount = habits.filter((h) => completedIds.has(h._id || "")).length;
  const percentage = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;
  const remaining = totalHabits - completedCount;

  const handleToggleHabit = async (habitId: string) => {
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

      if (!res.ok) {
        throw new Error("Failed to toggle completion");
      }
    } catch {
      // Rollback on error
      setCompletedIds(completedIds);
    }
  };

  // Focus Timer controls
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && focusSeconds > 0) {
      interval = setInterval(() => {
        setFocusSeconds((prev) => prev - 1);
      }, 1000);
    } else if (focusSeconds === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, focusSeconds]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col w-full gap-5 select-none">
      {/* Top Greeting & Notification */}
      <section className="flex items-center justify-between pt-1">
        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-[14px] text-[#667085]">Good morning,</span>
            <span className="text-[20px] tracking-tight text-[#101010] font-bold font-[family-name:var(--font-headline)]">
              {userName}
            </span>
          </div>
          <p className="text-[13px] text-[#667085] flex items-center gap-1.5 mt-0.5">
            <span>Keep going, you&apos;re doing great!</span>
          </p>
        </div>

        <Link
          href="/reminders"
          aria-label="View notifications"
          className="relative w-10 h-10 rounded-full bg-[#f0edec] flex items-center justify-center text-[#667085] hover:text-[#007AFF] transition-colors shadow-xs"
        >
          <Icon name="notifications" size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#007AFF]" />
        </Link>
      </section>

      {/* Today's Progress Card */}
      <section className="w-full bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(16,24,40,0.04)] border border-[#E5E7EB] relative overflow-hidden">
        <div className="flex items-center justify-between gap-4 relative z-10">
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Icon name="verified" size={16} className="text-[#007AFF]" />
              <span className="text-[12px] text-[#667085] font-semibold uppercase tracking-wider">
                Today&apos;s Progress
              </span>
            </div>
            <h2 className="text-[18px] text-[#101010] font-bold tracking-tight">
              {completedCount} of {totalHabits} completed
            </h2>
            <p className="text-[13px] text-[#667085] leading-relaxed">
              {remaining === 0
                ? "Spectacular! You've achieved a 100% perfect day."
                : remaining === 1
                ? "You're on a great roll! Only 1 habit left for a perfect day."
                : `${remaining} habits remaining to achieve your daily target.`}
            </p>
          </div>

          <ProgressRing percentage={percentage} size={76} strokeWidth={6.5} />
        </div>

        {/* Ambient Blur Glow */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-[#EFF6FF]/70 blur-2xl pointer-events-none" />
      </section>

      {/* Weekly Consistency Rhythm Strip */}
      <ConsistencyStrip days={weeklyDays} streakPercent={94} />

      {/* Quick Actions Grid */}
      <section className="grid grid-cols-3 gap-2.5">
        <Link
          href="/habits/new"
          className="flex flex-col items-center justify-center p-3.5 bg-white rounded-2xl shadow-xs border border-[#E5E7EB] hover:bg-[#f6f3f2] transition-all text-center group active:scale-95"
        >
          <div className="w-11 h-11 rounded-full bg-[#EFF6FF] text-[#007AFF] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Icon name="add" size={22} className="text-[#007AFF]" />
          </div>
          <span className="text-[13px] text-[#101010] font-semibold">
            Add Habit
          </span>
          <span className="text-[11px] text-[#667085]">Track new goal</span>
        </Link>

        <Link
          href="/routines"
          className="flex flex-col items-center justify-center p-3.5 bg-white rounded-2xl shadow-xs border border-[#E5E7EB] hover:bg-[#f6f3f2] transition-all text-center group active:scale-95"
        >
          <div className="w-11 h-11 rounded-full bg-[#ECFDF3] text-[#22C55E] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Icon name="auto_stories" size={22} className="text-[#22C55E]" />
          </div>
          <span className="text-[13px] text-[#101010] font-semibold">
            Build Routine
          </span>
          <span className="text-[11px] text-[#667085]">Morning flow</span>
        </Link>

        <button
          type="button"
          onClick={() => setShowFocusTimer(true)}
          className="flex flex-col items-center justify-center p-3.5 bg-white rounded-2xl shadow-xs border border-[#E5E7EB] hover:bg-[#f6f3f2] transition-all text-center group active:scale-95"
        >
          <div className="w-11 h-11 rounded-full bg-[#f0edec] text-[#555d64] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Icon name="timer" size={22} className="text-[#555d64]" />
          </div>
          <span className="text-[13px] text-[#101010] font-semibold">
            Focus Session
          </span>
          <span className="text-[11px] text-[#667085]">25m timer</span>
        </button>
      </section>

      {/* Smart Insight Notification Banner */}
      <section className="w-full bg-[#EFF6FF] rounded-2xl p-4 border border-[#d8e2ff] flex items-start gap-3 relative overflow-hidden">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 text-[#007AFF] shadow-xs">
          <Icon name="lightbulb" size={18} className="text-[#007AFF]" />
        </div>
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[13px] text-[#007AFF] font-bold">
              Smart Insight
            </span>
            <span className="w-1 h-1 rounded-full bg-[#007AFF]" />
            <span className="text-[11px] text-[#667085]">
              Algorithm Pattern
            </span>
          </div>
          <p className="text-[13px] text-[#101010] leading-snug">
            You complete morning habits{" "}
            <span className="font-semibold text-[#007AFF]">
              40% more consistently
            </span>{" "}
            when started before 9:00 AM.
          </p>
        </div>
      </section>

      {/* Today's Habits Stack */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-[18px] text-[#101010] font-bold tracking-tight font-[family-name:var(--font-headline)]">
              Today&apos;s Habits
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                remaining === 0
                  ? "bg-[#ECFDF3] text-[#22C55E]"
                  : "bg-[#f0edec] text-[#667085]"
              }`}
            >
              {remaining === 0 ? "All Done" : `${remaining} pending`}
            </span>
          </div>
          <Link
            href="/habits"
            className="text-[13px] text-[#007AFF] hover:underline flex items-center gap-0.5 font-medium"
          >
            <span>See all</span>
            <Icon name="arrow_forward" size={15} />
          </Link>
        </div>

        {/* Habit Cards Container */}
        <div className="flex flex-col gap-2.5">
          {habits.map((habit) => (
            <HabitRow
              key={habit._id}
              habit={habit}
              isCompleted={completedIds.has(habit._id || "")}
              onToggle={handleToggleHabit}
            />
          ))}

          {habits.length === 0 && (
            <div className="p-8 bg-white rounded-2xl border border-[#E5E7EB] text-center flex flex-col items-center">
              <Icon name="spa" size={32} className="text-[#22C55E] mb-2" />
              <h4 className="font-semibold text-[15px] text-[#101010]">
                No habits yet
              </h4>
              <p className="text-[13px] text-[#667085] mt-1 max-w-xs">
                Start your journey with a simple habit like morning hydration.
              </p>
              <Link
                href="/habits/new"
                className="mt-4 px-4 py-2 bg-[#007AFF] text-white rounded-full text-[13px] font-semibold"
              >
                Create your first habit
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Motivational Quote Micro-Card */}
      <section className="w-full bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-xs flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#f6f3f2] flex items-center justify-center text-[#007AFF] shrink-0">
          <Icon name="format_quote" size={18} className="text-[#007AFF]" />
        </div>
        <div className="flex flex-col">
          <p className="text-[13px] text-[#101010] italic font-medium leading-snug">
            &quot;Small disciplines repeated with consistency every day lead to
            great achievements.&quot;
          </p>
          <span className="text-[11px] text-[#667085] mt-0.5">
            Atomic Habit Principle
          </span>
        </div>
      </section>

      {/* Focus Session Modal */}
      {showFocusTimer && (
        <div className="fixed inset-0 z-50 bg-[#101010]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl flex flex-col items-center text-center border border-[#E5E7EB]">
            <div className="w-12 h-12 rounded-full bg-[#EFF6FF] text-[#007AFF] flex items-center justify-center mb-3">
              <Icon name="timer" size={24} className="text-[#007AFF]" />
            </div>
            <h3 className="text-[18px] font-bold text-[#101010]">
              Focus Session
            </h3>
            <p className="text-[13px] text-[#667085] mt-0.5 mb-5">
              Deep work or mindful habit practice
            </p>

            <div className="text-[44px] font-bold font-mono tracking-tight text-[#101010] mb-6">
              {formatTimer(focusSeconds)}
            </div>

            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={() => setTimerRunning(!timerRunning)}
                className={`flex-1 h-11 rounded-full font-semibold text-[14px] flex items-center justify-center gap-1.5 transition-all ${
                  timerRunning
                    ? "bg-[#F59E0B] text-white hover:bg-[#d97706]"
                    : "bg-[#007AFF] text-white hover:bg-[#0070eb]"
                }`}
              >
                <Icon name={timerRunning ? "pause" : "play_arrow"} size={18} />
                <span>{timerRunning ? "Pause" : "Start"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTimerRunning(false);
                  setFocusSeconds(25 * 60);
                }}
                className="w-11 h-11 rounded-full bg-[#f6f3f2] flex items-center justify-center text-[#667085] hover:text-[#101010]"
              >
                <Icon name="refresh" size={18} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setTimerRunning(false);
                setShowFocusTimer(false);
              }}
              className="mt-4 text-[13px] text-[#667085] hover:text-[#101010]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
