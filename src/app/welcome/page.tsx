import React from "react";
import Link from "next/link";
import Image from "next/image";
import BetterMeLogo from "@/components/brand/BetterMeLogo";
import Icon from "@/components/ui/Icon";

export default function WelcomePage() {
  return (
    <main className="flex-1 w-full bg-[#FCF9F8] pt-safe pb-safe max-w-lg mx-auto flex flex-col justify-between min-h-screen px-6 py-6 select-none">
      {/* Top Branding: Logo & Tagline */}
      <div className="flex flex-col items-center justify-center pt-4 pb-1 text-center">
        <div className="h-12 w-auto mb-1 flex items-center justify-center">
          <BetterMeLogo size={36} />
        </div>
        <p className="text-[11px] font-semibold tracking-wider uppercase text-[#717786] mt-0.5">
          PROGRESS IN EVERY HABIT.
        </p>
      </div>

      {/* Hero Visual: Growth Step Vector Illustration */}
      <div className="w-full my-2 flex items-center justify-center">
        <div className="relative w-full max-w-[280px] aspect-square rounded-2xl bg-white shadow-sm flex items-center justify-center overflow-hidden border border-[#E5E7EB]">
          <div className="absolute -inset-4 bg-[#EFF6FF] rounded-full blur-2xl pointer-events-none" />
          <Image
            src="/images/welcome-hero.png"
            alt="Mindful habit growth illustration"
            width={260}
            height={260}
            priority
            className="relative z-10 w-full h-full object-contain p-3 transition-transform duration-700 hover:scale-105"
          />
        </div>
      </div>

      {/* Narrative & Core Value Proposition */}
      <div className="flex flex-col items-center text-center mt-1 mb-4">
        <h1 className="font-bold text-[28px] text-[#101010] tracking-tight max-w-[280px] leading-tight font-[family-name:var(--font-headline)]">
          Build habits that actually stick.
        </h1>
        <p className="text-[14px] text-[#717786] mt-2 max-w-xs leading-relaxed">
          Small consistent actions create meaningful change. Design healthy
          routines and track your daily momentum with calm precision.
        </p>

        {/* Value Proposition Micro-chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-sm">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f6f3f2] shadow-xs">
            <Icon name="auto_graph" size={16} className="text-[#007AFF]" />
            <span className="text-[12px] text-[#414755] font-medium">
              Intelligent Insights
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f6f3f2] shadow-xs">
            <Icon name="spa" size={16} className="text-[#22C55E]" />
            <span className="text-[12px] text-[#414755] font-medium">
              Calm Routine Builder
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f6f3f2] shadow-xs">
            <Icon name="cached" size={16} className="text-[#007AFF]" />
            <span className="text-[12px] text-[#414755] font-medium">
              Smart Streak Recovery
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Call-to-Actions */}
      <div className="flex flex-col w-full gap-2 mt-auto pt-2">
        <Link
          href="/signup"
          id="getStartedBtn"
          className="group relative w-full h-[52px] bg-[#007AFF] text-white rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 shadow-sm transition-all duration-200 active:scale-[0.98] hover:bg-[#0070eb]"
        >
          <span>Get Started</span>
          <Icon
            name="arrow_forward"
            size={18}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>

        <Link
          href="/login"
          id="signInBtn"
          className="w-full h-11 bg-transparent text-[#717786] font-medium text-[13px] flex items-center justify-center transition-colors duration-150 hover:text-[#101010]"
        >
          Already have an account?&nbsp;
          <span className="text-[#101010] font-semibold underline decoration-[#E5E7EB] underline-offset-4">
            Sign in
          </span>
        </Link>
      </div>

      {/* iOS Home Indicator */}
      <div className="fixed bottom-0 inset-x-0 pb-safe flex justify-center pointer-events-none z-50">
        <div className="w-32 h-1 mb-2 bg-[#101010]/20 rounded-full" />
      </div>
    </main>
  );
}
