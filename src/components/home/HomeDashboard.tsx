"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Icon from "@/components/ui/Icon";
import ProgressRing from "@/components/ui/ProgressRing";
import ConsistencyStrip from "@/components/ui/ConsistencyStrip";
import HabitRow from "@/components/ui/HabitRow";
import PwaInstallCard from "@/components/pwa/PwaInstallCard";
import { Habit, WeeklyConsistencyDay } from "@/types";
import { useTranslation } from "@/lib/i18n";

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
  const { language } = useTranslation();
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    () => new Set(initialCompletedHabitIds)
  );
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  // Sync state if initialCompletedHabitIds changes without calling setState inside useEffect unconditionally
  const [prevInitial, setPrevInitial] = useState(initialCompletedHabitIds);
  if (prevInitial !== initialCompletedHabitIds) {
    setPrevInitial(initialCompletedHabitIds);
    setCompletedIds(new Set(initialCompletedHabitIds));
  }

  const totalHabits = habits.length;
  const completedCount = habits.filter((h) => completedIds.has(h._id || "")).length;
  const percentage = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;
  const remaining = totalHabits - completedCount;

  // Toggle habit completion handler with optimistic update
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
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && focusSeconds > 0) {
      interval = setInterval(() => {
        setFocusSeconds((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, focusSeconds]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Dynamic motivational hero copy
  const getMotivationalMessage = () => {
    if (totalHabits === 0) {
      return language === "so"
        ? "Ku dar caadadaada koowaad si aad u bilowdo maanta!"
        : "Add your first daily habit to start your journey!";
    }
    if (remaining === 0) {
      return language === "so"
        ? "Waa heer sare! Dhammaan caadooyinkii maanta waad dhammeysay."
        : "Incredible discipline! You've accomplished every goal today.";
    }
    if (remaining === 1) {
      return language === "so"
        ? "Kaliya 1 caado ayaa kuu hadhay maanta. Guushu way dhowdahay!"
        : "Almost there! Just 1 habit remaining for a perfect day.";
    }
    if (percentage >= 50) {
      return language === "so"
        ? "In ka badan kala bar waad dhammaysay. Horay u soco!"
        : "You're more than halfway done! Keep this strong momentum.";
    }
    return language === "so"
      ? "Tallaabo walba oo yari waxay kuu horseedaysaa isbeddel weyn."
      : "Small disciplines repeated with consistency create great results.";
  };

  return (
    <div className="flex flex-col w-full gap-5 sm:gap-6 select-none pb-8">
      {/* =========================================================================
          SECTION 1: CLEAN HEADER & GREETING (No duplicate bells!)
          ========================================================================= */}
      <section className="flex items-center justify-between pt-1">
        <div className="flex flex-col min-w-0">
          <span className="text-[13px] font-medium text-slate-500">
            {language === "so" ? "Subax wanaagsan," : "Good morning,"}
          </span>
          <h1 className="text-[26px] tracking-tight text-[#0F172A] font-extrabold leading-tight">
            {userName}
          </h1>
          <p className="text-[13px] text-slate-500 flex items-center gap-1.5 mt-0.5">
            <span>
              {language === "so"
                ? "Halkan ka eeg horumarkaaga maanta ✨"
                : "Here is your habit momentum for today ✨"}
            </span>
          </p>
        </div>

        {/* Clean Date Pill */}
        <div className="hidden min-[380px]:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-2xs text-[12px] font-bold text-slate-700">
          <Icon name="event" size={15} className="text-[#0B6EF3]" />
          <span>
            {new Date().toLocaleDateString(language === "so" ? "so-SO" : "en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: CLEAN PWA INSTALL CARD (Replaces broken APK download)
          ========================================================================= */}
      <PwaInstallCard />

      {/* =========================================================================
          SECTION 3: DAILY PROGRESS HERO CARD (Modern Torin/Apple Clean Aesthetic)
          ========================================================================= */}
      <section className="w-full bg-white rounded-3xl p-5 sm:p-6 shadow-[0_4px_24px_-4px_rgba(11,110,243,0.06)] border border-slate-200/70 relative overflow-hidden">
        <div className="flex items-center justify-between gap-3 sm:gap-4 relative z-10">
          {/* Left Data & Progress Column */}
          <div className="flex flex-col gap-1.5 min-w-0 flex-1 z-10">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-extrabold border border-emerald-200/60 uppercase tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>
                {language === "so"
                  ? remaining === 0
                    ? "Waa heer sare!"
                    : "Si fiican baad u socotaa!"
                  : remaining === 0
                  ? "Outstanding achievement!"
                  : "You're doing great!"}
              </span>
            </div>

            <h2 className="text-[22px] sm:text-[25px] text-[#0F172A] font-extrabold tracking-tight leading-tight mt-0.5">
              {completedCount} of {totalHabits} completed
            </h2>

            <div className="text-[13px] sm:text-[14px] font-bold text-[#0B6EF3]">
              {percentage}% of your daily goal
            </div>

            <p className="text-[12px] sm:text-[13px] text-slate-500 leading-snug max-w-[230px] sm:max-w-xs mt-0.5">
              {getMotivationalMessage()}
            </p>

            {/* Micro Progress Ring Row */}
            <div className="flex items-center gap-3 mt-2.5">
              <ProgressRing percentage={percentage} size={50} strokeWidth={5} />
              <div className="flex flex-col text-[12px]">
                <span className="font-bold text-[#0F172A]">
                  {remaining === 0 ? "Target Reached" : `${remaining} habits left`}
                </span>
                <span className="text-slate-500">
                  {percentage === 100 ? "Goal 100% finished" : `${percentage}% accomplished`}
                </span>
              </div>
            </div>
          </div>

          {/* Right Hero Illustration */}
          <div className="relative w-36 h-40 sm:w-44 sm:h-48 -mr-5 -my-5 sm:-mr-6 sm:-my-6 shrink-0 flex items-end justify-end overflow-hidden rounded-r-3xl pointer-events-none">
            <Image
              src="/images/student-hero.png"
              alt="Person celebrating habit consistency"
              fill
              className="object-cover object-center"
              sizes="(max-width: 640px) 150px, 180px"
              priority
              unoptimized
            />
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
      </section>

      {/* =========================================================================
          SECTION 4: TODAY'S HABITS (Primary Content Section)
          ========================================================================= */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-[18px] text-[#0F172A] font-extrabold tracking-tight">
              {language === "so" ? "Caadooyinka Maanta" : "Today's Habits"}
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                remaining === 0
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200/60"
                  : "bg-blue-50 text-[#0B6EF3] border border-blue-200/60"
              }`}
            >
              {remaining === 0
                ? language === "so" ? "Dhammaan waa diyaar" : "All Done"
                : `${remaining} pending`}
            </span>
          </div>

          <Link
            href="/habits"
            className="text-[13px] text-[#0B6EF3] hover:underline flex items-center gap-0.5 font-bold"
          >
            <span>{language === "so" ? "Dhammaan arag" : "See all"}</span>
            <Icon name="arrow_forward" size={15} />
          </Link>
        </div>

        {/* Habit Cards List */}
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
            <div className="p-8 bg-white rounded-3xl border border-slate-200/70 text-center flex flex-col items-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
                <Icon name="spa" size={26} />
              </div>
              <h4 className="font-bold text-[16px] text-[#0F172A]">
                {language === "so" ? "Wali ma jiraan caadooyin" : "No habits added yet"}
              </h4>
              <p className="text-[13px] text-slate-500 mt-1 max-w-xs leading-relaxed">
                {language === "so"
                  ? "Ku bilow caado fudud sida biyo cabbitaanka aroortii ama akhris 10 daqiiqo ah."
                  : "Start your journey with a simple habit like morning hydration or 10 min reading."}
              </p>
              <Link
                href="/habits/new"
                className="mt-4 px-5 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-full text-[13px] font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Icon name="add" size={16} />
                <span>{language === "so" ? "Sameyso caado cusub" : "Create first habit"}</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: WEEKLY CONSISTENCY (Capsule Bar Chart)
          ========================================================================= */}
      <ConsistencyStrip days={weeklyDays} />

      {/* =========================================================================
          SECTION 6: QUICK ACTIONS (Torin-style Grouped Pill Cards)
          ========================================================================= */}
      <section className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <Link
          href="/habits/new"
          className="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/70 shadow-xs hover:border-[#0B6EF3]/40 hover:shadow-sm transition-all text-center group active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B6EF3] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Icon name="add" size={22} className="text-[#0B6EF3]" />
          </div>
          <span className="text-[13px] text-[#0F172A] font-bold">
            {language === "so" ? "Ku dar Caado" : "Add Habit"}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5">
            {language === "so" ? "Yool cusub" : "Track new"}
          </span>
        </Link>

        <Link
          href="/routines"
          className="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/70 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all text-center group active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Icon name="auto_stories" size={22} className="text-emerald-600" />
          </div>
          <span className="text-[13px] text-[#0F172A] font-bold">
            {language === "so" ? "Dhis Nidaam" : "Build Routine"}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5">
            {language === "so" ? "Qulqulka subaxda" : "Morning flow"}
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setShowFocusTimer(true)}
          className="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/70 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all text-center group active:scale-95 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Icon name="timer" size={22} className="text-purple-600" />
          </div>
          <span className="text-[13px] text-[#0F172A] font-bold">
            {language === "so" ? "Diiradda" : "Focus Session"}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5">
            {language === "so" ? "25d saacad" : "25m timer"}
          </span>
        </button>
      </section>

      {/* =========================================================================
          SECTION 7: SMART INSIGHT (Algorithm Pattern Card)
          ========================================================================= */}
      <section className="w-full bg-white rounded-3xl p-4 sm:p-4.5 border border-slate-200/70 flex items-start gap-3.5 relative overflow-hidden shadow-xs">
        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 text-[#0B6EF3]">
          <Icon name="lightbulb" size={19} className="text-[#0B6EF3]" />
        </div>
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[11px] text-[#0B6EF3] font-extrabold uppercase tracking-wider">
              Smart Insight
            </span>
            <span className="w-1 h-1 rounded-full bg-[#0B6EF3]" />
            <span className="text-[11px] text-slate-400 font-medium">
              Momentum Pattern
            </span>
          </div>
          <p className="text-[13px] text-[#0F172A] leading-relaxed">
            {language === "so" ? (
              <>
                Waxaad caadooyinka subaxda u fulisaa{" "}
                <span className="font-bold text-[#0B6EF3]">40% si ka joogto badan</span>{" "}
                markaad bilowdo ka hor 9:00 AM.
              </>
            ) : (
              <>
                You complete morning habits{" "}
                <span className="font-bold text-[#0B6EF3]">40% more consistently</span>{" "}
                when started before 9:00 AM.
              </>
            )}
          </p>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: MOTIVATIONAL CARD (Refined Discipline & Consistency Quote)
          ========================================================================= */}
      <section className="w-full bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/70 shadow-xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
          <Icon name="format_quote" size={22} className="text-emerald-600" />
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-[13px] text-[#0F172A] italic font-medium leading-snug">
            {language === "so"
              ? '"Anshaxa yar ee lagu celceliyo si joogto ah maalin kasta wuxuu abuuraa natiijooyin la yaab leh."'
              : '"Small disciplines repeated with consistency create remarkable results."'}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">
            Atomic Habit Principle
          </span>
        </div>
      </section>

      {/* =========================================================================
          FOCUS SESSION MODAL
          ========================================================================= */}
      {showFocusTimer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B6EF3] flex items-center justify-center mb-3">
              <Icon name="timer" size={24} className="text-[#0B6EF3]" />
            </div>
            <h3 className="text-[18px] font-bold text-[#0F172A]">
              {language === "so" ? "Fadhiga Diiradda" : "Focus Session"}
            </h3>
            <p className="text-[13px] text-slate-500 mt-0.5 mb-5">
              {language === "so" ? "Shaqo qoto dheer ama caado barasho" : "Deep work or mindful habit practice"}
            </p>

            <div className="text-[44px] font-extrabold font-mono tracking-tight text-[#0F172A] mb-6">
              {formatTimer(focusSeconds)}
            </div>

            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={() => setTimerRunning(!timerRunning)}
                className={`flex-1 h-12 rounded-full font-bold text-[14px] flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer ${
                  timerRunning
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : "bg-[#0F172A] text-white hover:bg-[#1E293B]"
                }`}
              >
                <Icon name={timerRunning ? "pause" : "play_arrow"} size={18} />
                <span>
                  {timerRunning
                    ? language === "so" ? "Jooji" : "Pause"
                    : language === "so" ? "Bilow" : "Start"}
                </span>
              </button>

              <button
                type="button"
                aria-label="Reset timer"
                onClick={() => {
                  setTimerRunning(false);
                  setFocusSeconds(25 * 60);
                }}
                className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/80 flex items-center justify-center text-slate-700 active:scale-95 transition-all cursor-pointer"
              >
                <Icon name="refresh" size={19} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setTimerRunning(false);
                setShowFocusTimer(false);
              }}
              className="mt-4 text-[13px] text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
            >
              {language === "so" ? "Xir daaqadda" : "Close"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
