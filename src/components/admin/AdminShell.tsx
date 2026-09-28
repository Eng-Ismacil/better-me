"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import BetterMeLogo from "@/components/brand/BetterMeLogo";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";

interface AdminShellProps {
  children: React.ReactNode;
  adminName?: string;
  adminEmail?: string;
}

const NAV_ITEMS = [
  { href: "/admin", icon: "dashboard", en: "Dashboard", so: "Dashboard", exact: true },
  { href: "/admin/users", icon: "group", en: "Users", so: "Isticmaalayaasha" },
  { href: "/admin/habits", icon: "task_alt", en: "Habits / Tasks", so: "Caadooyinka / Hawlaha" },
  { href: "/admin#streaks", icon: "local_fire_department", en: "Top Streaks", so: "Xiriirrada Sare", hash: "streaks" },
  { href: "/admin/broadcast", icon: "campaign", en: "Broadcast", so: "Faafinta" },
  { href: "/admin/recycle-bin", icon: "delete", en: "Recycle Bin", so: "Qashinka" },
  { href: "/admin/audit", icon: "history", en: "Audit Log", so: "Diiwaanka" },
  { href: "/admin/finance", icon: "account_balance_wallet", en: "Finance", so: "Maaliyadda" },
] as const;

export default function AdminShell({
  children,
  adminName = "Admin",
  adminEmail = "",
}: AdminShellProps) {
  const pathname = usePathname();
  const { language } = useTranslation();
  const so = language === "so";

  const isActive = (href: string, exact?: boolean) => {
    const path = href.split("#")[0];
    if (exact) return pathname === path;
    if (path === "/admin") return pathname === "/admin";
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  return (
    <div className="min-h-screen bg-[#FAFBFD] flex">
      <aside className="hidden lg:flex flex-col w-64 border-r border-[#E7ECF3] bg-white h-screen fixed left-0 top-0 z-30 p-5">
        <div className="pb-4 pt-1 flex items-center gap-2.5 border-b border-[#E7ECF3]">
          <BetterMeLogo size={30} />
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-extrabold text-[#111827] font-[family-name:var(--font-headline)] truncate">
              BetterMe Admin
            </span>
            <span className="text-[10px] text-[#667085] font-medium">
              {so ? "Maamulka" : "Control Panel"}
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto no-scrollbar py-4 flex flex-col gap-1">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#667085] px-3 mb-1">
            {so ? "Qeybaha" : "Manage"}
          </span>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href, "exact" in item ? item.exact : false);
            const label = so ? item.so : item.en;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all ${
                  active
                    ? "bg-[#EFF6FF] text-[#0B6EF3] font-semibold"
                    : "text-[#667085] hover:text-[#111827] hover:bg-[#F4F8FF]"
                }`}
              >
                <Icon
                  name={item.icon}
                  size={20}
                  className={active ? "text-[#0B6EF3]" : "text-[#717786]"}
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <Link
          href="/home"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold text-[#667085] hover:text-[#0B6EF3] hover:bg-[#EFF6FF] transition-all border-t border-[#E7ECF3] pt-4"
        >
          <Icon name="arrow_back" size={20} />
          <span>{so ? "Ku noqo App-ka" : "Back to App"}</span>
        </Link>
      </aside>

      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 min-h-screen">
        <header className="h-14 sm:h-16 border-b border-[#E7ECF3] bg-white/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/admin" className="lg:hidden shrink-0">
              <BetterMeLogo size={28} />
            </Link>
            <div className="min-w-0">
              <p className="text-[15px] sm:text-[17px] font-bold text-[#111827] truncate font-[family-name:var(--font-headline)]">
                {so ? "Maamulka BetterMe" : "Admin Panel"}
              </p>
              <p className="text-[11px] text-[#667085] truncate lg:hidden">
                {adminName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[13px] font-bold text-[#111827]">{adminName}</span>
              {adminEmail && (
                <span className="text-[11px] text-[#667085]">{adminEmail}</span>
              )}
            </div>
            <div className="w-9 h-9 rounded-full bg-[#EFF6FF] text-[#0B6EF3] flex items-center justify-center">
              <Icon name="admin_panel_settings" size={20} />
            </div>
          </div>
        </header>

        {/* Mobile nav strip */}
        <div className="lg:hidden border-b border-[#E7ECF3] bg-white px-3 py-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 min-w-max">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href, "exact" in item ? item.exact : false);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-colors ${
                    active
                      ? "bg-[#0B6EF3] text-white"
                      : "bg-[#F4F8FF] text-[#667085] hover:text-[#0B6EF3]"
                  }`}
                >
                  <Icon name={item.icon} size={14} />
                  <span>{so ? item.so : item.en}</span>
                </Link>
              );
            })}
            <Link
              href="/home"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold bg-[#F3F4F6] text-[#667085]"
            >
              <Icon name="arrow_back" size={14} />
              <span>{so ? "App" : "App"}</span>
            </Link>
          </div>
        </div>

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 pb-16">
          {children}
        </main>
      </div>
    </div>
  );
}
