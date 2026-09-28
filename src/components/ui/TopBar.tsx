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
  showFilter = true,
}: TopBarProps) {
  const { language, setLanguage } = useTranslation();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    return subscribeToNotifications(setUnreadCount);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-[#FAFBFD]/92 backdrop-blur-xl pt-safe border-b border-[#E7ECF3]">
      {/* Main Header Bar */}
      <div className="h-14 px-3 sm:px-4 max-w-lg mx-auto flex items-center justify-between gap-2">
        <Link href="/home" className="flex items-center gap-2 select-none group">
          <BetterMeLogo size={26} />
          <span className="font-extrabold text-[15px] tracking-tight text-[#101010] ml-0.5">
            {title}
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          {/* Always accessible + Add Habit button */}
          <Link
            href="/habits/new"
            aria-label="Add new habit"
            className="hidden min-[380px]:flex w-8 h-8 rounded-full bg-[#0B6EF3] text-white items-center justify-center hover:bg-[#0958c7] active:scale-90 transition-all shadow-xs shrink-0"
            title="Add Habit / Ku dar Caado"
          >
            <Icon name="add" size={19} />
          </Link>

          {/* Quick Language Toggle */}
          <button
            type="button"
            onClick={() => setLanguage(language === "en" ? "so" : "en")}
            className="px-2.5 py-1 rounded-full bg-white border border-[#E7ECF3] text-[11px] font-extrabold text-[#111827] hover:bg-[#F3F4F6] transition-all flex items-center gap-1 shadow-2xs"
            title="Switch Language / Bedel Luuqadda"
          >
            <Icon name="translate" size={13} className="text-[#0B6EF3]" />
            <span>{language === "en" ? "SO" : "EN"}</span>
          </button>

          {/* Notifications Bell with Live Badge */}
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="relative w-9 h-9 flex items-center justify-center rounded-full text-[#667085] hover:text-[#101010] hover:bg-white transition-colors"
          >
            <Icon name="notifications" size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-[#FCF9F8]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {/* Filter button if active */}
          {showFilter && onFilterClick && (
            <button
              type="button"
              aria-label="Filter options"
              onClick={onFilterClick}
              className="w-9 h-9 flex items-center justify-center rounded-full text-[#667085] hover:text-[#101010] hover:bg-[#f0edec] transition-colors"
            >
              <Icon name="tune" size={19} />
            </button>
          )}

          {/* Interactive Profile Dropdown (Profile, Settings, Logout) */}
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
