"use client";

import React from "react";
import Link from "next/link";
import BetterMeLogo from "@/components/brand/BetterMeLogo";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";

interface AuthLayoutProps {
  children: React.ReactNode;
  showLanguageToggle?: boolean;
  showBackLink?: boolean;
  backHref?: string;
  maxWidth?: "sm" | "md";
}

export default function AuthLayout({
  children,
  showLanguageToggle = true,
  showBackLink = false,
  backHref = "/welcome",
  maxWidth = "sm",
}: AuthLayoutProps) {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="min-h-screen w-full bg-[#FAFBFD] text-[#111827] flex flex-col justify-between selection:bg-[#0B6EF3]/15 selection:text-[#0B6EF3] relative overflow-x-hidden">
      {/* Subtle ambient lighting for depth */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-72 bg-gradient-to-b from-[#0B6EF3]/6 via-[#20C773]/4 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Top Header Bar */}
      <header className="w-full max-w-md mx-auto px-5 pt-safe pt-5 pb-2 flex items-center justify-between z-10 select-none">
        {showBackLink ? (
          <Link
            href={backHref}
            className="w-9 h-9 rounded-full bg-white border border-[#E7ECF3] flex items-center justify-center text-[#667085] hover:text-[#111827] hover:border-[#0B6EF3]/40 transition-colors shadow-2xs active:scale-95"
            aria-label="Go back"
          >
            <Icon name="arrow_back" size={18} />
          </Link>
        ) : (
          <div className="w-9 h-9" />
        )}

        {/* Center Logo */}
        <Link
          href="/welcome"
          className="flex items-center gap-2 group transition-transform active:scale-95"
          aria-label="BetterMe Home"
        >
          <BetterMeLogo size={28} />
          <span className="font-extrabold text-[17px] tracking-tight text-[#111827]">
            BetterMe
          </span>
        </Link>

        {/* Language Switcher */}
        {showLanguageToggle ? (
          <button
            type="button"
            onClick={() => setLanguage(language === "en" ? "so" : "en")}
            className="px-2.5 py-1 rounded-full bg-white border border-[#E7ECF3] hover:border-[#0B6EF3]/40 text-[11px] font-extrabold text-[#111827] shadow-2xs hover:bg-[#F9FAFB] transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
            title="Switch Language / Bedel Luuqadda"
          >
            <Icon name="translate" size={13} className="text-[#0B6EF3]" />
            <span>{language === "en" ? "SO" : "EN"}</span>
          </button>
        ) : (
          <div className="w-9 h-9" />
        )}
      </header>

      {/* Main Content Area */}
      <main
        className={`w-full ${
          maxWidth === "sm" ? "max-w-[420px]" : "max-w-[460px]"
        } mx-auto px-5 sm:px-6 py-4 flex-1 flex flex-col justify-center z-10`}
      >
        {children}
      </main>

      {/* Subtle Footer indicator */}
      <footer className="w-full max-w-md mx-auto px-5 pb-safe pb-4 pt-2 text-center text-[#9CA3AF] text-[11px] select-none">
        <p>© {new Date().getFullYear()} BetterMe • Mindful Habit System</p>
      </footer>
    </div>
  );
}
