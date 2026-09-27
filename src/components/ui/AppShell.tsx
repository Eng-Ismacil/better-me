"use client";

import React from "react";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import DesktopSidebar from "./DesktopSidebar";
import Icon from "./Icon";
import Link from "next/link";
import Image from "next/image";

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
  userEmail = "ismacil.dahir@example.com",
  avatarUrl = "/images/avatar.jpg",
  showMobileHeader = true,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#FCF9F8] flex">
      {/* Desktop Persistent Sidebar */}
      <DesktopSidebar
        userName={userName}
        userEmail={userEmail}
        avatarUrl={avatarUrl}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0 min-h-screen">
        {/* Mobile Header */}
        {showMobileHeader && (
          <div className="md:hidden">
            <TopBar title={title} avatarUrl={avatarUrl} />
          </div>
        )}

        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex h-16 border-b border-[#E5E7EB] bg-white/80 backdrop-blur-md px-8 items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <h1 className="text-[20px] font-bold text-[#101010]">{title}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Icon
                name="search"
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717786]"
              />
              <input
                type="text"
                placeholder="Search habits, routines..."
                className="pl-9 pr-4 py-1.5 text-[13px] bg-[#f6f3f2] rounded-full border border-transparent focus:border-[#007AFF] focus:bg-white outline-none transition-all w-60"
              />
            </div>

            <Link
              href="/habits/new"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#007AFF] text-white text-[13px] font-semibold hover:bg-[#0070eb] active:scale-95 transition-all shadow-xs"
            >
              <Icon name="add" size={16} />
              <span>New Habit</span>
            </Link>

            <Link
              href="/profile"
              className="relative w-8 h-8 rounded-full overflow-hidden border border-[#E5E7EB]"
            >
              <Image
                src={avatarUrl}
                alt={userName}
                fill
                className="object-cover"
                sizes="32px"
              />
            </Link>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 w-full max-w-lg md:max-w-4xl mx-auto pt-20 md:pt-6 pb-24 md:pb-12 px-4 md:px-8">
          {children}
        </main>

        {/* Mobile Fixed Bottom Nav */}
        <BottomNav />
      </div>
    </div>
  );
}
