"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Icon from "./Icon";
import { useTranslation } from "@/lib/i18n";
import { clearAdminStatus } from "@/lib/adminStatus";
import { useUserProfile } from "@/hooks/useUserProfile";

interface ProfileDropdownProps {
  userName?: string;
  userEmail?: string;
  avatarUrl?: string;
  isAdmin?: boolean;
  align?: "left" | "right";
  size?: "sm" | "md";
}

export default function ProfileDropdown({
  userName = "Ismacil Dahir",
  userEmail = "ismacil.dahir@example.com",
  avatarUrl = "/images/avatar.jpg",
  isAdmin = false,
  align = "right",
  size = "md",
}: ProfileDropdownProps) {
  const { profile } = useUserProfile({
    id: "active-user",
    name: userName,
    email: userEmail,
    avatarUrl,
  });

  const effectiveAvatar = profile?.avatarUrl || avatarUrl || "/images/avatar.jpg";
  const effectiveName = profile?.name || userName;
  const effectiveEmail = profile?.email || userEmail;

  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { language } = useTranslation();

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      clearAdminStatus();
      setIsOpen(false);
      router.push("/welcome");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      setIsLoggingOut(false);
    }
  };

  const avatarDimensions = size === "sm" ? "w-8 h-8" : "w-8 h-8 sm:w-9 sm:h-9";

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User account menu"
        className={`relative ${avatarDimensions} rounded-full overflow-hidden border-2 transition-all cursor-pointer select-none shrink-0 ${
          isOpen
            ? "border-[#0B6EF3] ring-3 ring-[#0B6EF3]/20 scale-105"
            : "border-white hover:border-[#0B6EF3]/50 shadow-[0_2px_8px_rgba(11,110,243,0.18)] active:scale-95"
        }`}
      >
        <Image
          src={effectiveAvatar}
          alt={effectiveName}
          fill
          className="object-cover"
          sizes="36px"
        />
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } mt-2.5 w-64 sm:w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_12px_36px_-6px_rgba(17,24,39,0.18),0_4px_12px_-2px_rgba(11,110,243,0.08)] border border-[#E7ECF3] py-2 z-50 animate-in fade-in zoom-in-95 duration-150 transform origin-top-right`}
        >
          {/* User Preview Header */}
          <div className="px-4 py-3 border-b border-[#F0F2F5] flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#0B6EF3]/30 shrink-0">
              <Image
                src={effectiveAvatar}
                alt={effectiveName}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <p className="text-[14px] font-bold text-[#111827] truncate">
                  {effectiveName}
                </p>
                <span className="inline-block px-1.5 py-0.5 rounded-full bg-[#ECFDF3] text-[#20C773] text-[9px] font-extrabold uppercase tracking-wide">
                  {language === "so" ? "Firfircoon" : "Active"}
                </span>
              </div>
              <p className="text-[11px] text-[#667085] truncate mt-0.5">
                {effectiveEmail}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-2 py-1.5 flex flex-col gap-0.5">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#374151] hover:text-[#0B6EF3] hover:bg-[#F4F8FF] transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#0B6EF3] flex items-center justify-center group-hover:bg-[#0B6EF3] group-hover:text-white transition-colors">
                  <Icon name="admin_panel_settings" size={18} />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[13px] font-bold text-[#111827] group-hover:text-[#0B6EF3]">
                    {language === "so" ? "Ku noqo Admin Panel" : "Return to Admin Panel"}
                  </span>
                  <span className="text-[11px] text-[#8692A6] truncate">
                    {language === "so" ? "Maamulka BetterMe" : "BetterMe administration"}
                  </span>
                </div>
              </Link>
            )}

            {/* Profile Link */}
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#374151] hover:text-[#0B6EF3] hover:bg-[#F4F8FF] transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#F4F8FF] text-[#0B6EF3] flex items-center justify-center group-hover:bg-[#0B6EF3] group-hover:text-white transition-colors">
                <Icon name="account_circle" size={18} />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[13px] font-bold text-[#111827] group-hover:text-[#0B6EF3] transition-colors">
                  {language === "so" ? "Xogta Profile-ka" : "Profile"}
                </span>
                <span className="text-[11px] text-[#8692A6] truncate">
                  {language === "so"
                    ? "Maamul magacaaga & sawirka"
                    : "Manage your name & avatar"}
                </span>
              </div>
            </Link>

            {/* Settings Link */}
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#374151] hover:text-[#0B6EF3] hover:bg-[#F4F8FF] transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#F3F4F6] text-[#667085] flex items-center justify-center group-hover:bg-[#0B6EF3] group-hover:text-white transition-colors">
                <Icon name="settings" size={18} />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[13px] font-bold text-[#111827] group-hover:text-[#0B6EF3] transition-colors">
                  {language === "so" ? "Dejimaha App-ka" : "Settings"}
                </span>
                <span className="text-[11px] text-[#8692A6] truncate">
                  {language === "so"
                    ? "Luuqadda, amniga & furaha"
                    : "Security, preferences & 2FA"}
                </span>
              </div>
            </Link>

            {/* Achievements Link */}
            <Link
              href="/achievements"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#374151] hover:text-[#EC4899] hover:bg-[#FDF2F8] transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#FDF2F8] text-[#EC4899] flex items-center justify-center group-hover:bg-[#EC4899] group-hover:text-white transition-colors">
                <Icon name="military_tech" size={18} />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[13px] font-bold text-[#111827] group-hover:text-[#EC4899] transition-colors">
                  {language === "so" ? "Guulaha & Billadaha" : "Achievements"}
                </span>
                <span className="text-[11px] text-[#8692A6] truncate">
                  {language === "so"
                    ? "Heerarka & billadaha la furtay"
                    : "Badges, streaks & level XP"}
                </span>
              </div>
            </Link>
          </div>

          {/* Divider */}
          <div className="my-1 border-t border-[#F0F2F5]" />

          {/* Logout Action */}
          <div className="px-2 pt-1 pb-0.5">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[#EF4444] hover:bg-[#FEF2F2] transition-colors group cursor-pointer text-left disabled:opacity-50"
            >
              <div className="w-8 h-8 rounded-lg bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center group-hover:bg-[#EF4444] group-hover:text-white transition-colors">
                <Icon name="logout" size={18} />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[13px] font-bold text-[#EF4444]">
                  {isLoggingOut
                    ? language === "so"
                      ? "Waa la ka baxayaa..."
                      : "Logging out..."
                    : language === "so"
                    ? "Ka Bax (Logout)"
                    : "Log Out"}
                </span>
                <span className="text-[11px] text-[#EF4444]/70 truncate">
                  {language === "so"
                    ? "Ka bax akoonkaaga hadda"
                    : "Sign out of your session"}
                </span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
