"use client";

import React from "react";
import Icon from "@/components/ui/Icon";

export default function WelcomeIllustration() {
  return (
    <div className="relative w-full max-w-[340px] h-[220px] sm:h-[240px] mx-auto my-3 flex items-center justify-center select-none">
      {/* Soft ambient background gradient glow */}
      <div className="absolute inset-2 bg-gradient-to-tr from-[#0B6EF3]/8 via-[#20C773]/10 to-[#0B6EF3]/5 rounded-3xl blur-xl -z-10" />

      {/* Main Base Card (Floating Canvas) */}
      <div className="w-full h-full bg-white/90 backdrop-blur-md rounded-[24px] border border-[#E7ECF3] shadow-[0_12px_36px_-6px_rgba(11,110,243,0.12),0_4px_16px_-2px_rgba(0,0,0,0.04)] p-4 relative flex flex-col justify-between overflow-hidden">
        {/* Subtle grid pattern in card background */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(#0B6EF3 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />

        {/* Card Header Row: Streak Pill & Micro Badges */}
        <div className="flex items-center justify-between z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF7ED] border border-[#FDBA74]/30 text-[#EA580C] shadow-2xs">
            <Icon name="local_fire_department" size={15} />
            <span className="text-[11px] font-extrabold tracking-wide">
              7-Day Momentum
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#20C773] animate-pulse" />
            <span className="text-[11px] font-bold text-[#20C773] uppercase tracking-wider">
              Consistent
            </span>
          </div>
        </div>

        {/* Center Row: Habit Floating Micro Cards & Progress Circle */}
        <div className="flex items-center justify-between gap-3 z-10 my-auto">
          {/* Left Stack of Micro Habit Rows */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {/* Habit 1 */}
            <div className="bg-[#FAFBFD] border border-[#E7ECF3] rounded-xl p-2 flex items-center gap-2.5 shadow-2xs hover:border-[#0B6EF3]/30 transition-all">
              <div className="w-6 h-6 rounded-lg bg-[#ECFDF3] text-[#20C773] flex items-center justify-center shrink-0">
                <Icon name="check" size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-[#111827] truncate">
                  Morning Mindfulness
                </p>
                <p className="text-[9px] text-[#667085] truncate">10 mins • Completed</p>
              </div>
            </div>

            {/* Habit 2 */}
            <div className="bg-[#FAFBFD] border border-[#E7ECF3] rounded-xl p-2 flex items-center gap-2.5 shadow-2xs hover:border-[#0B6EF3]/30 transition-all">
              <div className="w-6 h-6 rounded-lg bg-[#EFF6FF] text-[#0B6EF3] flex items-center justify-center shrink-0">
                <Icon name="edit_note" size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-[#111827] truncate">
                  Daily Review & Reading
                </p>
                <p className="text-[9px] text-[#0B6EF3] font-semibold truncate">Target reached ✨</p>
              </div>
            </div>
          </div>

          {/* Right Progress Ring Metric Widget */}
          <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-[#F4F8FF] to-[#ECFDF3] border border-[#D7E4F9] flex flex-col items-center justify-center shadow-2xs shrink-0">
            <svg className="w-18 h-18 -rotate-90 transform" viewBox="0 0 36 36">
              <path
                className="text-[#E2E8F0]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#20C773]"
                strokeDasharray="86, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[15px] font-black text-[#111827] leading-none">
                86%
              </span>
              <span className="text-[8px] font-extrabold text-[#667085] uppercase tracking-wider mt-0.5">
                Daily Goal
              </span>
            </div>
          </div>
        </div>

        {/* Card Footer: Growth Milestone Bar */}
        <div className="flex items-center justify-between text-[11px] font-bold text-[#667085] pt-2 border-t border-[#F0F2F5] z-10">
          <div className="flex items-center gap-1.5 text-[#0B6EF3]">
            <Icon name="spa" size={14} className="text-[#20C773]" />
            <span>Habit Compound Effect</span>
          </div>
          <span className="text-[#20C773] bg-[#ECFDF3] px-2 py-0.5 rounded-full text-[10px] font-extrabold">
            +1% Every Day
          </span>
        </div>
      </div>
    </div>
  );
}
