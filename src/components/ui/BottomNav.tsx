"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import { useTranslation } from "@/lib/i18n";

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  // Exactly 5 tabs - Strictly meets requirement "tabs kana wa ineysan 5 ka abdan"
  const navItems = [
    { label: t("nav_home"), href: "/home", icon: "grid_view" },
    { label: t("nav_habits"), href: "/habits", icon: "check_circle" },
    { label: t("nav_calendar"), href: "/calendar", icon: "calendar_today" },
    { label: t("nav_insights"), href: "/insights", icon: "insights" },
    {
      label: t("nav_more"),
      href: "/more",
      icon: "menu",
      isMatch: (path: string) =>
        [
          "/more",
          "/check-in",
          "/routines",
          "/achievements",
          "/reminders",
          "/profile",
          "/settings",
          "/notifications",
          "/finance",
        ].some((prefix) => path.startsWith(prefix)),
    },
  ];

  const isNewHabitPage = pathname === "/habits/new";

  return (
    <>
      {/* Floating Action Button (+ Icon) above the bottom tabs */}
      {!isNewHabitPage && (
        <div className="fixed bottom-[76px] right-4 sm:right-6 z-40 md:hidden pointer-events-auto">
          <Link
            href="/habits/new"
            aria-label="Add new habit"
            className="w-13 h-13 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white flex items-center justify-center shadow-[0_10px_25px_-4px_rgba(15,23,42,0.4)] active:scale-90 transition-all border border-slate-700/40 group cursor-pointer"
            title="Add Habit / Ku dar Caado"
          >
            <Icon
              name="add"
              size={26}
              className="text-white transition-transform duration-200 group-hover:rotate-90"
            />
          </Link>
        </div>
      )}

      {/* Modern iOS Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/90 backdrop-blur-xl pb-safe border-t border-slate-200/70 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="h-16 px-2 max-w-lg mx-auto grid grid-cols-5 items-center">
          {navItems.map((item) => {
            const isActive = item.isMatch
              ? item.isMatch(pathname || "")
              : pathname === item.href ||
                (item.href !== "/home" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center h-full gap-0.5 transition-all select-none ${
                  isActive
                    ? "text-[#0B6EF3] font-bold"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                {isActive ? (
                  <div className="flex flex-col items-center justify-center py-1 px-3 rounded-full bg-[#F4F8FF] transition-all">
                    <Icon name={item.icon} size={20} className="text-[#0B6EF3]" />
                    <span className="text-[10px] tracking-tight leading-none mt-0.5 text-[#0B6EF3] font-bold">
                      {item.label}
                    </span>
                  </div>
                ) : (
                  <>
                    <Icon name={item.icon} size={21} className="text-[#64748B]" />
                    <span className="text-[10px] tracking-tight leading-none text-[#64748B]">
                      {item.label}
                    </span>
                  </>
                )}
              </Link>
            );
          })}
        </div>
        <div className="w-full flex justify-center pb-1 pointer-events-none">
          <div className="w-28 h-1 bg-[#0F172A]/15 rounded-full" />
        </div>
      </nav>
    </>
  );
}
