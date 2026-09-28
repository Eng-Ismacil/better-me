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
      // Active if on more, check-in, routines, achievements, reminders, profile, settings, notifications
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
        ].some((prefix) => path.startsWith(prefix)),
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#FAFBFD]/95 backdrop-blur-xl pb-safe border-t border-[#E7ECF3] md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
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
              prefetch={true}
              className={`flex flex-col items-center justify-center h-full gap-0.5 transition-all select-none ${
                isActive
                  ? "text-[#0B6EF3] font-bold"
                  : "text-[#667085] hover:text-[#111827]"
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
                  <Icon name={item.icon} size={22} className="text-[#667085]" />
                  <span className="text-[10px] tracking-tight leading-none text-[#667085]">
                    {item.label}
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </div>
      <div className="w-full flex justify-center pb-1 pointer-events-none">
        <div className="w-28 h-1 bg-[#111827]/15 rounded-full" />
      </div>
    </nav>
  );
}
