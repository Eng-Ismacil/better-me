"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/home", icon: "grid_view" },
    { label: "Habits", href: "/habits", icon: "check_circle" },
    { label: "Calendar", href: "/calendar", icon: "calendar_today" },
    { label: "Insights", href: "/insights", icon: "insert_chart" },
    { label: "Profile", href: "/profile", icon: "account_circle" },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#FCF9F8]/90 backdrop-blur-xl pb-safe border-t border-[#E5E7EB]/80 md:hidden">
      <div className="h-16 px-2 max-w-lg mx-auto grid grid-cols-5 items-center">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/home" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center h-full gap-0.5 transition-all select-none ${
                isActive
                  ? "text-[#007AFF] font-semibold"
                  : "text-[#667085] hover:text-[#101010]"
              }`}
            >
              {isActive ? (
                <div className="flex flex-col items-center justify-center py-1 px-3.5 rounded-full bg-[#EFF6FF] transition-all">
                  <Icon name={item.icon} size={22} className="text-[#007AFF]" />
                  <span className="text-[11px] tracking-tight leading-none mt-0.5 text-[#007AFF]">
                    {item.label}
                  </span>
                </div>
              ) : (
                <>
                  <Icon name={item.icon} size={24} className="text-[#667085]" />
                  <span className="text-[11px] tracking-tight leading-none text-[#667085]">
                    {item.label}
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </div>
      <div className="w-full flex justify-center pb-1 pointer-events-none">
        <div className="w-32 h-1 bg-[#101010]/20 rounded-full" />
      </div>
    </nav>
  );
}
