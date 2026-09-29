"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ProfileDropdown from "./ProfileDropdown";
import { useTranslation } from "@/lib/i18n";
import { subscribeToNotifications } from "@/lib/notificationStore";
import Icon from "./Icon";

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

  const isHome = title === "Home";

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-[#FCF9F8]/90 backdrop-blur-xl pt-safe border-b border-slate-100 transition-all">
      <div className="h-14 px-4 max-w-lg mx-auto flex items-center justify-between gap-2">

        {/* Left: App icon + name (home) OR just page title */}
        {isHome ? (
          <Link
            href="/home"
            className="flex items-center gap-2 select-none active:opacity-70 transition-opacity"
          >
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm border border-slate-200/60 shrink-0">
              <Image
                src="/icon-192.png"
                alt="BetterMe"
                width={32}
                height={32}
                className="object-cover"
                priority
              />
            </div>
            <span className="font-extrabold text-[16px] tracking-tight text-[#0F172A]">
              BetterMe
            </span>
          </Link>
        ) : (
          <h1 className="font-extrabold text-[17px] tracking-tight text-[#0F172A] truncate">
            {title}
          </h1>
        )}

        {/* Right: minimal actions */}
        <div className="flex items-center gap-1.5">
          {/* Language toggle — compact pill */}
          <button
            type="button"
            onClick={() => setLanguage(language === "en" ? "so" : "en")}
            className="px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-600 active:scale-95 transition-all cursor-pointer"
            title="Switch Language"
          >
            {language === "en" ? "SO" : "EN"}
          </button>

          {/* Optional filter */}
          {showFilter && onFilterClick && (
            <button
              type="button"
              aria-label="Filter"
              onClick={onFilterClick}
              className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Icon name="tune" size={18} />
            </button>
          )}

          {/* Notifications */}
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="relative w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:scale-95 transition-all"
          >
            <Icon name="notifications" size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-[#FCF9F8]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {/* Avatar / Profile */}
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
