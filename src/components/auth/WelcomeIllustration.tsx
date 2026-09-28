"use client";

import React from "react";
import Image from "next/image";
import Icon from "@/components/ui/Icon";

export default function WelcomeIllustration() {
  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[360px] mx-auto my-3 flex items-center justify-center select-none">
      {/* Soft ambient gradient backdrop glow */}
      <div className="absolute -inset-2 bg-gradient-to-tr from-[#0B6EF3]/10 via-[#20C773]/12 to-[#0B6EF3]/8 rounded-[32px] blur-2xl -z-10" />

      {/* Main Glassmorphic Hero Canvas Card */}
      <div className="w-full bg-white/95 backdrop-blur-xl rounded-[26px] border border-[#E7ECF3] shadow-[0_16px_40px_-8px_rgba(11,110,243,0.14),0_4px_16px_-2px_rgba(0,0,0,0.04)] p-4 sm:p-5 relative flex flex-col items-center justify-between overflow-hidden">
        {/* Subtle decorative dot-grid background */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(#0B6EF3 1.2px, transparent 1.2px)",
            backgroundSize: "16px 16px",
          }}
        />

        {/* Floating Top Badge Row */}
        <div className="w-full flex items-center justify-between z-10 mb-1">
          {/* Streak pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF7ED] border border-[#FDBA74]/40 text-[#EA580C] shadow-2xs">
            <Icon name="local_fire_department" size={15} />
            <span className="text-[11px] font-extrabold tracking-wide">
              7-Day Streak
            </span>
          </div>

          {/* Active status */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF3] border border-[#20C773]/30 text-[#20C773] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#20C773] animate-pulse" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">
              Goal Active
            </span>
          </div>
        </div>

        {/* Central Illustration Area with Subtle Floating Elements */}
        <div className="relative w-full h-44 sm:h-48 flex items-center justify-center my-1">
          {/* Main Habit Steps Image Illustration */}
          <div className="relative w-40 h-40 sm:w-44 sm:h-44 transition-transform duration-500 hover:scale-105">
            <Image
              src="/images/welcome-hero.png"
              alt="Building habits step by step"
              fill
              className="object-contain drop-shadow-sm"
              sizes="(max-width: 640px) 180px, 200px"
              priority
              unoptimized
            />
          </div>

          {/* Floating Micro Habit Badge (Top Left) */}
          <div className="absolute -left-1 top-6 bg-white/95 backdrop-blur-md border border-[#E7ECF3] rounded-xl px-2.5 py-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.06)] flex items-center gap-2 animate-bounce-subtle pointer-events-none">
            <div className="w-5 h-5 rounded-lg bg-[#ECFDF3] text-[#20C773] flex items-center justify-center">
              <Icon name="check" size={13} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#111827]">
                Mindfulness
              </span>
              <span className="text-[8px] text-[#20C773] font-semibold">
                Done 100%
              </span>
            </div>
          </div>

          {/* Floating Progress Micro Ring (Bottom Right) */}
          <div className="absolute -right-1 bottom-4 bg-white/95 backdrop-blur-md border border-[#E7ECF3] rounded-xl px-2.5 py-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.06)] flex items-center gap-2 pointer-events-none">
            <div className="w-5 h-5 rounded-lg bg-[#EFF6FF] text-[#0B6EF3] flex items-center justify-center">
              <Icon name="trending_up" size={13} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#111827]">
                Compound Win
              </span>
              <span className="text-[8px] text-[#0B6EF3] font-semibold">
                +1% Everyday
              </span>
            </div>
          </div>
        </div>

        {/* Footer Milestone Row */}
        <div className="w-full flex items-center justify-between text-[11px] font-bold text-[#667085] pt-2.5 border-t border-[#F0F2F5] z-10">
          <div className="flex items-center gap-1.5 text-[#0B6EF3]">
            <Icon name="spa" size={14} className="text-[#20C773]" />
            <span>Consistency Journey</span>
          </div>
          <span className="text-[#0B6EF3] bg-[#EFF6FF] px-2 py-0.5 rounded-full text-[10px] font-extrabold border border-[#0B6EF3]/20">
            Step-by-Step
          </span>
        </div>
      </div>
    </div>
  );
}
