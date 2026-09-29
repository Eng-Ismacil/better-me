"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import { useTranslation } from "@/lib/i18n";

// Tab definition — 5 tabs with the + in center (index 2)
type NavTab =
  | { type: "link"; label: string; href: string; icon: string; isMatch?: (p: string) => boolean }
  | { type: "add" };

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const tabs: NavTab[] = [
    { type: "link", label: t("nav_home"), href: "/home", icon: "grid_view" },
    { type: "link", label: t("nav_habits"), href: "/habits", icon: "check_circle" },
    // Center CTA — add new habit
    { type: "add" },
    { type: "link", label: t("nav_calendar"), href: "/calendar", icon: "calendar_today" },
    {
      type: "link",
      label: t("nav_more"),
      href: "/more",
      icon: "menu",
      isMatch: (p: string) =>
        ["/more", "/check-in", "/routines", "/achievements", "/reminders", "/profile", "/settings", "/notifications", "/finance"].some(
          (prefix) => p.startsWith(prefix)
        ),
    },
  ];

  const isNewHabitPage = pathname === "/habits/new";

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/92 backdrop-blur-xl pb-safe border-t border-slate-200/60 md:hidden">
      <div className="h-16 px-1 max-w-lg mx-auto flex items-center">
        {tabs.map((tab, idx) => {
          if (tab.type === "add") {
            // Center + button
            return (
              <div key="add" className="flex-1 flex items-center justify-center">
                {!isNewHabitPage ? (
                  <Link
                    href="/habits/new"
                    aria-label="Add new habit"
                    className="w-[52px] h-[52px] rounded-full bg-[#0B6EF3] hover:bg-[#0957C3] text-white flex items-center justify-center shadow-[0_6px_20px_-2px_rgba(11,110,243,0.45)] active:scale-90 transition-all -mt-4 group cursor-pointer"
                    title="Add Habit"
                  >
                    <Icon
                      name="add"
                      size={26}
                      className="text-white transition-transform duration-200 group-hover:rotate-90"
                    />
                  </Link>
                ) : (
                  <div className="w-[52px] h-[52px] rounded-full bg-slate-100 flex items-center justify-center -mt-4 opacity-40 cursor-not-allowed">
                    <Icon name="add" size={26} className="text-slate-400" />
                  </div>
                )}
              </div>
            );
          }

          // Regular link tab
          const isActive = tab.isMatch
            ? tab.isMatch(pathname || "")
            : pathname === tab.href || (tab.href !== "/home" && pathname?.startsWith(tab.href));

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center h-full gap-0.5 select-none transition-all ${
                isActive ? "text-[#0B6EF3]" : "text-[#94A3B8] hover:text-[#64748B]"
              }`}
            >
              {isActive ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-[#EFF6FF] flex items-center justify-center transition-all">
                    <Icon name={tab.icon} size={19} className="text-[#0B6EF3]" />
                  </div>
                  <span className="text-[10px] font-bold tracking-tight text-[#0B6EF3]">
                    {tab.label}
                  </span>
                </>
              ) : (
                <>
                  <Icon name={tab.icon} size={22} className="text-[#94A3B8]" />
                  <span className="text-[10px] font-medium tracking-tight text-[#94A3B8]">
                    {tab.label}
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </div>

      {/* iOS home indicator bar */}
      <div className="w-full flex justify-center pb-1 pointer-events-none">
        <div className="w-28 h-[4px] bg-[#0F172A]/10 rounded-full" />
      </div>
    </nav>
  );
}
