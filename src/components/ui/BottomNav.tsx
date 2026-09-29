"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import { useTranslation } from "@/lib/i18n";
import PrefetchLink from "@/components/navigation/PrefetchLink";

interface NavTab {
  label: string;
  href: string;
  icon: string;
  isMatch?: (p: string) => boolean;
}

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const tabs: NavTab[] = [
    { label: t("nav_home"), href: "/home", icon: "grid_view" },
    { label: t("nav_habits"), href: "/habits", icon: "check_circle" },
    // Insights placed in the center tab
    { label: t("nav_insights"), href: "/insights", icon: "insert_chart" },
    { label: t("nav_calendar"), href: "/calendar", icon: "calendar_today" },
    {
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
        {tabs.map((tab) => {
          const isActive = tab.isMatch
            ? tab.isMatch(pathname || "")
            : pathname === tab.href || (tab.href !== "/home" && pathname?.startsWith(tab.href));

          const isMoreTab = tab.href === "/more";

          return (
            <div key={tab.href} className="flex-1 relative h-full flex items-center justify-center">
              {/* Plus (+) Action Button: Positioned slightly right above More with a tight, natural gap */}
              {isMoreTab && !isNewHabitPage && (
                <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 z-40">
                  <Link
                    href="/habits/new"
                    aria-label={t("btn_new_habit")}
                    title={t("btn_new_habit")}
                    className="w-10 h-10 rounded-full bg-[#0B6EF3] hover:bg-[#0957C3] active:scale-90 text-white flex items-center justify-center shadow-[0_4px_14px_rgba(11,110,243,0.4)] border-2 border-white transition-all group cursor-pointer"
                  >
                    <Icon
                      name="add"
                      size={22}
                      className="text-white transition-transform duration-200 group-hover:rotate-90"
                    />
                  </Link>
                </div>
              )}

              {/* Tab Navigation Link */}
              <PrefetchLink
                href={tab.href}
                className={`w-full h-full flex flex-col items-center justify-center gap-0.5 select-none transition-all ${
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
              </PrefetchLink>
            </div>
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
