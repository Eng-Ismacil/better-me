"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import BetterMeLogo from "@/components/brand/BetterMeLogo";
import Icon from "./Icon";
import ProfileDropdown from "./ProfileDropdown";
import { useTranslation } from "@/lib/i18n";
import { subscribeToNotifications } from "@/lib/notificationStore";

interface TopBarProps {
  title?: string;
  avatarUrl?: string;
  userName?: string;
  userEmail?: string;
  isAdmin?: boolean;
  onFilterClick?: () => void;
  showFilter?: boolean;
}

export default function TopBar({
  title = "Home",
  avatarUrl = "/images/avatar.jpg",
  userName = "Ismacil Dahir",
  userEmail = "ismacildahir46@gmail.com",
  isAdmin = false,
  onFilterClick,
  showFilter = false,
}: TopBarProps) {
  const { language, setLanguage } = useTranslation();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    return subscribeToNotifications(setUnreadCount);
  }, []);

  const displayTitle = title === "Home" ? "BetterMe" : title;

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white/85 backdrop-blur-xl pt-safe border-b border-slate-200/60 transition-all">
      <div className="h-14 px-4 max-w-lg mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand / Title */}
        <Link
          href="/home"
          className="flex items-center gap-2.5 select-none active:opacity-80 transition-opacity"
        >
          <BetterMeLogo size={28} />
          <span className="font-extrabold text-[16px] tracking-tight text-[#0F172A]">
            {displayTitle}
          </span>
        </Link>

        {/* Right: Clean, un-crowded action group */}
        <div className="flex items-center gap-2">
          {/* Quick Language Toggle */}
          <button
            type="button"
            onClick={() => setLanguage(language === "en" ? "so" : "en")}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 text-[11px] font-bold text-slate-700 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
            title="Switch Language / Bedel Luuqadda"
          >
            <Icon name="translate" size={13} className="text-[#0B6EF3]" />
            <span>{language === "en" ? "SO" : "EN"}</span>
          </button>

          {/* Notifications Bell */}
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="relative w-8 h-8 flex items-center justify-center rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all"
          >
            <Icon name="notifications" size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {/* Optional filter button only if supplied and active */}
          {showFilter && onFilterClick && (
            <button
              type="button"
              aria-label="Filter options"
              onClick={onFilterClick}
              className="w-8 h-8 flex items-center justify-center rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Icon name="tune" size={18} />
            </button>
          )}

          {/* Profile Dropdown */}
          <ProfileDropdown
            userName={userName}
            userEmail={userEmail}
            avatarUrl={avatarUrl}
            isAdmin={isAdmin}
            align="right"
          />
        </div>
      </div>
    </header>
  );
}
