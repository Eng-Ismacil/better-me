"use client";

import React, { useEffect, useState } from "react";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import DesktopSidebar from "./DesktopSidebar";
import Icon from "./Icon";
import Link from "next/link";
import ProfileDropdown from "./ProfileDropdown";
import { useTranslation } from "@/lib/i18n";
import { subscribeToNotifications } from "@/lib/notificationStore";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  userName?: string;
  userEmail?: string;
  avatarUrl?: string;
  showMobileHeader?: boolean;
}

export default function AppShell({
  children,
  title = "Home",
  userName = "Ismacil Dahir",
  userEmail = "ismacildahir46@gmail.com",
  avatarUrl = "/images/avatar.jpg",
  showMobileHeader = true,
}: AppShellProps) {
  const { language, setLanguage, t } = useTranslation();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Single shared poll — no per-component duplicate fetches
    return subscribeToNotifications(setUnreadCount);
  }, []);

  useEffect(() => {
    let active = true;
    void fetch("/api/profile")
      .then((response) => response.json())
      .then((data) => {
        if (active) setIsAdmin(Boolean(data.user?.isAdmin));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFBFD] flex">
      {/* Desktop Persistent Sidebar */}
      <DesktopSidebar
        userName={userName}
        userEmail={userEmail}
        avatarUrl={avatarUrl}
        isAdmin={isAdmin}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0 min-h-screen">
        {/* Mobile Header */}
        {showMobileHeader && (
          <div className="md:hidden">
            <TopBar
              title={title}
              avatarUrl={avatarUrl}
              userName={userName}
              userEmail={userEmail}
              isAdmin={isAdmin}
            />
          </div>
        )}

        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex h-16 border-b border-[#E7ECF3] bg-white/90 backdrop-blur-md px-8 items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <h1 className="text-[20px] font-bold text-[#101010]">{title}</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Search */}
            <div className="relative">
              <Icon
                name="search"
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717786]"
              />
              <input
                type="text"
                placeholder={t("search_placeholder")}
                className="pl-9 pr-4 py-1.5 text-[13px] bg-[#f6f3f2] rounded-full border border-transparent focus:border-[#007AFF] focus:bg-white outline-none transition-all w-60"
              />
            </div>

            {/* Language Switcher on Desktop */}
            <button
              type="button"
              onClick={() => setLanguage(language === "en" ? "so" : "en")}
              className="px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-[12px] font-bold text-[#101010] hover:bg-[#F3F4F6] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Switch Language / Bedel Luuqadda"
            >
              <Icon name="translate" size={15} className="text-[#0B6EF3]" />
              <span>{language === "en" ? "Af-Soomaali" : "English"}</span>
            </button>

            {/* Notifications Bell */}
            <Link
              href="/notifications"
              className="relative w-9 h-9 rounded-full bg-[#f6f3f2] hover:bg-[#E5E7EB] flex items-center justify-center text-[#667085] hover:text-[#101010] transition-colors"
            >
              <Icon name="notifications" size={19} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* New Habit Button */}
            <Link
              href="/habits/new"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0B6EF3] text-white text-[13px] font-semibold hover:bg-[#0958c7] active:scale-95 transition-all shadow-xs"
            >
              <Icon name="add" size={16} />
              <span>{t("btn_new_habit")}</span>
            </Link>

            {/* Desktop Profile Dropdown (Profile, Settings, Logout) */}
            <ProfileDropdown
              userName={userName}
              userEmail={userEmail}
              avatarUrl={avatarUrl}
              isAdmin={isAdmin}
              align="right"
            />
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 w-full max-w-lg md:max-w-4xl mx-auto pt-16 md:pt-6 pb-24 md:pb-12 px-4 md:px-8">
          {children}
        </main>

        {/* Mobile Fixed Bottom Nav */}
        <BottomNav />
      </div>
    </div>
  );
}
