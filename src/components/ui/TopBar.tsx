"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import BetterMeLogo from "@/components/brand/BetterMeLogo";
import Icon from "./Icon";

interface TopBarProps {
  title?: string;
  avatarUrl?: string;
  onFilterClick?: () => void;
  showFilter?: boolean;
}

export default function TopBar({
  title = "Home",
  avatarUrl = "/images/avatar.jpg",
  onFilterClick,
  showFilter = true,
}: TopBarProps) {
  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-[#FCF9F8]/85 backdrop-blur-xl pt-safe border-b border-[#E5E7EB]/60">
      {/* iOS style Simulated Status bar on mobile */}
      <div className="h-6 px-5 flex items-center justify-between text-[#101010] select-none pt-1 text-[11px] font-semibold tracking-tight">
        <span>9:41</span>
        <div className="flex items-center gap-1.5 text-[#101010]">
          <Icon name="signal_cellular_alt" size={15} />
          <Icon name="wifi" size={15} />
          <Icon name="battery_full" size={17} />
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="h-14 px-5 max-w-lg mx-auto flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-2 select-none group">
          <BetterMeLogo size={28} />
          <span className="font-bold text-[18px] tracking-tight text-[#101010] ml-1">
            {title}
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          {showFilter && (
            <button
              type="button"
              aria-label="Filter options"
              onClick={onFilterClick}
              className="w-10 h-10 flex items-center justify-center rounded-full text-[#667085] hover:text-[#101010] hover:bg-[#f0edec] transition-colors"
            >
              <Icon name="tune" size={20} />
            </button>
          )}

          <Link
            href="/profile"
            aria-label="Go to Profile"
            className="relative w-8 h-8 rounded-full overflow-hidden ml-1 border-2 border-white shadow-[0_2px_6px_rgba(0,122,255,0.2)] active:scale-95 transition-transform"
          >
            <Image
              src={avatarUrl}
              alt="User Profile"
              fill
              className="object-cover"
              sizes="32px"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
