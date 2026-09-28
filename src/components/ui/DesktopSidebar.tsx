"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import BetterMeLogo from "@/components/brand/BetterMeLogo";
import Icon from "./Icon";
import { useTranslation } from "@/lib/i18n";
import { subscribeToNotifications } from "@/lib/notificationStore";

interface DesktopSidebarProps {
  userName?: string;
  userEmail?: string;
  avatarUrl?: string;
}

export default function DesktopSidebar({
  userName = "Ismacil Dahir",
  userEmail = "ismacil.dahir@example.com",
  avatarUrl = "/images/avatar.jpg",
}: DesktopSidebarProps) {
  const pathname = usePathname();
  const { language, setLanguage, t } = useTranslation();
  const [unreadNotifs, setUnreadNotifs] = useState<number>(0);

  useEffect(() => {
    // Shared store — single poll for whole app, no duplicate intervals
    return subscribeToNotifications(setUnreadNotifs);
  }, []);

  const primaryNav = [
    { label: t("nav_home"), href: "/home", icon: "grid_view" },
    { label: t("nav_habits"), href: "/habits", icon: "check_circle" },
    { label: t("nav_routines"), href: "/routines", icon: "auto_stories" },
    { label: t("nav_calendar"), href: "/calendar", icon: "calendar_today" },
    { label: t("nav_checkin"), href: "/check-in", icon: "ecg_heart" },
    { label: t("nav_insights"), href: "/insights", icon: "insert_chart" },
    { label: t("nav_achievements"), href: "/achievements", icon: "military_tech" },
    { label: t("nav_reminders"), href: "/reminders", icon: "alarm" },
    {
      label: language === "so" ? "Maaliyadda" : "Finance",
      href: "/finance",
      icon: "account_balance_wallet",
    },
    {
      label: t("nav_notifications"),
      href: "/notifications",
      icon: "notifications",
      badge: unreadNotifs > 0 ? unreadNotifs : undefined,
    },
  ];

  const secondaryNav = [
    { label: t("nav_profile"), href: "/profile", icon: "account_circle" },
    { label: t("nav_settings"), href: "/settings", icon: "settings" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-[#E5E7EB] bg-white h-screen fixed left-0 top-0 z-30 p-5 select-none">
      {/* Brand Logo & Lang switcher */}
      <div className="pb-4 pt-1 flex items-center justify-between border-b border-[#E5E7EB]/60">
        <Link href="/home" className="flex items-center gap-2">
          <BetterMeLogo size={32} />
        </Link>

        {/* Quick Language Toggle */}
        <button
          type="button"
          onClick={() => setLanguage(language === "en" ? "so" : "en")}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[11px] font-bold text-[#101010] transition-colors"
          title="Toggle Language / Bedel Luuqadda"
        >
          <Icon name="translate" size={14} className="text-[#007AFF]" />
          <span>{language === "en" ? "SO" : "EN"}</span>
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-3 flex flex-col gap-1">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-[#717786] px-3 mb-1">
          {t("menu_title")}
        </span>
        {primaryNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/home" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-[14px] transition-all ${
                isActive
                  ? "bg-[#EFF6FF] text-[#007AFF] font-semibold"
                  : "text-[#667085] hover:text-[#101010] hover:bg-[#f6f3f2]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  name={item.icon}
                  size={20}
                  className={isActive ? "text-[#007AFF]" : "text-[#717786]"}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#EF4444] text-white text-[11px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <span className="text-[11px] font-semibold tracking-wider uppercase text-[#717786] px-3 mt-3 mb-1">
          {t("preferences_title")}
        </span>
        {secondaryNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-[14px] transition-all ${
                isActive
                  ? "bg-[#EFF6FF] text-[#007AFF] font-semibold"
                  : "text-[#667085] hover:text-[#101010] hover:bg-[#f6f3f2]"
              }`}
            >
              <Icon
                name={item.icon}
                size={20}
                className={isActive ? "text-[#007AFF]" : "text-[#717786]"}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Streak Callout Widget */}
      <div className="p-3 bg-[#EFF6FF] rounded-2xl border border-[#d8e2ff] flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#007AFF] shadow-xs">
            <Icon name="local_fire_department" size={18} className="text-[#007AFF]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-semibold text-[#101010]">
              {t("streak_text")}
            </span>
            <span className="text-[11px] text-[#22C55E] font-medium">
              {t("streak_sub")}
            </span>
          </div>
        </div>
      </div>

      {/* User Footer Profile */}
      <Link
        href="/profile"
        className="flex items-center gap-3 pt-3 border-t border-[#E5E7EB] hover:bg-[#f6f3f2] p-2 rounded-2xl transition-colors"
      >
        <div className="relative w-9 h-9 rounded-full overflow-hidden bg-[#E5E7EB] border border-[#007AFF]/20">
          <Image
            src={avatarUrl}
            alt={userName}
            fill
            className="object-cover"
            sizes="36px"
          />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[13px] font-semibold text-[#101010] truncate">
            {userName}
          </span>
          <span className="text-[11px] text-[#667085] truncate">
            {userEmail}
          </span>
        </div>
        <Icon name="chevron_right" size={16} className="text-[#717786]" />
      </Link>
    </aside>
  );
}
