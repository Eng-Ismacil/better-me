"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import BetterMeLogo from "@/components/brand/BetterMeLogo";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";
import { clearAdminStatus } from "@/lib/adminStatus";
import { useUserProfile } from "@/hooks/useUserProfile";
import PrefetchLink from "@/components/navigation/PrefetchLink";

interface AdminShellProps {
  children: React.ReactNode;
  adminName?: string;
  adminEmail?: string;
  adminAvatarUrl?: string;
}

export interface NavItem {
  href: string;
  icon: string;
  en: string;
  so: string;
  exact?: boolean;
}

export interface NavGroup {
  category: { en: string; so: string };
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    category: { en: "WORKSPACE", so: "WORKSPACE" },
    items: [
      { href: "/admin", icon: "dashboard", en: "Dashboard", so: "Dashboard", exact: true },
      { href: "/admin/users", icon: "group", en: "Profiles", so: "Profile-yada" },
      { href: "/admin/habits", icon: "task_alt", en: "Habits & Tasks", so: "Caadooyinka & Hawlaha" },
      { href: "/admin/streaks", icon: "local_fire_department", en: "Top Streaks", so: "Xiriirrada Sare" },
    ],
  },
  {
    category: { en: "COMMUNICATION", so: "XIRIIRKA" },
    items: [
      { href: "/admin/broadcast", icon: "campaign", en: "Broadcast", so: "Faafinta" },
      { href: "/admin/support", icon: "support_agent", en: "Support & Chat", so: "Taageerada & Chat" },
    ],
  },
  {
    category: { en: "SYSTEM", so: "NIDAAMKA" },
    items: [
      { href: "/admin/recycle-bin", icon: "delete", en: "Recycle Bin", so: "Qashinka" },
      { href: "/admin/audit", icon: "history", en: "Audit Log", so: "Diiwaanka" },
    ],
  },
  {
    category: { en: "BUSINESS", so: "GANACSI" },
    items: [
      { href: "/admin/finance", icon: "account_balance_wallet", en: "Finance", so: "Maaliyadda" },
      { href: "/admin/reports", icon: "summarize", en: "Reports", so: "Warbixinno" },
      { href: "/admin/settings", icon: "settings", en: "Operations", so: "Hawlgalka" },
    ],
  },
];

// Flattened for mobile
const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

// Curated avatar presets for fast 1-click selection
const AVATAR_PRESETS = [
  "/images/avatar.jpg",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
];

export default function AdminShell({
  children,
  adminName = "Admin",
  adminEmail = "",
  adminAvatarUrl,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useTranslation();
  const so = language === "so";

  // ── React Query Live User Profile with Optimistic UI ──
  const {
    profile,
    updateProfile,
    isUpdatingProfile,
    uploadAvatar,
    isUploadingAvatar,
  } = useUserProfile({
    id: "admin-user",
    name: adminName,
    email: adminEmail,
    avatarUrl: adminAvatarUrl || "/images/avatar.jpg",
  });

  const currentAvatar = profile?.avatarUrl || adminAvatarUrl || "/images/avatar.jpg";
  const currentName = profile?.name || adminName || "Admin";
  const currentEmail = profile?.email || adminEmail || "";

  // Compute initials for avatar fallback
  const initials = currentName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "AD";

  // Dropdown & Modal state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Edit Modal form state
  const [editName, setEditName] = useState(currentName);
  const [editAvatarUrl, setEditAvatarUrl] = useState(currentAvatar);
  const [modalStatusMsg, setModalStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize modal fields when modal opens
  useEffect(() => {
    if (editModalOpen) {
      setEditName(currentName);
      setEditAvatarUrl(currentAvatar);
      setModalStatusMsg(null);
    }
  }, [editModalOpen, currentName, currentAvatar]);

  // Click outside to close profile dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dropdownOpen]);

  // Logout Handler
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      clearAdminStatus();
      setDropdownOpen(false);
      router.push("/welcome");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      setIsLoggingOut(false);
    }
  };

  // Instant optimistic file upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setModalStatusMsg({
        type: "error",
        text: so ? "Sawirku waa inuu ka yaraadaa 5MB" : "Image size must be under 5MB",
      });
      return;
    }

    try {
      setModalStatusMsg({
        type: "success",
        text: so ? "Sawirka si dhakhso ah ayaa loo cusbooneysiiyay! ⚡" : "Avatar updated instantly with Optimistic UI! ⚡",
      });
      const res = await uploadAvatar(file);
      setEditAvatarUrl(res.url);
    } catch (err) {
      setModalStatusMsg({
        type: "error",
        text: so ? "Sawirka lama badali karin, fadlan isku day markale" : "Could not upload image, please try again",
      });
    }
  };

  // Instant optimistic preset select
  const handleSelectPreset = async (url: string) => {
    setEditAvatarUrl(url);
    try {
      await updateProfile({ avatarUrl: url });
      setModalStatusMsg({
        type: "success",
        text: so ? "Astaanta sawirka waa la doortay! ✨" : "Avatar preset applied instantly! ✨",
      });
    } catch {
      setModalStatusMsg({
        type: "error",
        text: so ? "Khalad ayaa dhacay markii la badalayay" : "Failed to set preset avatar",
      });
    }
  };

  // Save Modal Profile changes (name + avatar)
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    try {
      await updateProfile({
        name: editName.trim(),
        avatarUrl: editAvatarUrl.trim() || currentAvatar,
      });
      setModalStatusMsg({
        type: "success",
        text: so ? "Xogta astaantaada si guul leh ayaa loo keydiyay! ✅" : "Profile successfully saved! ✅",
      });
      setTimeout(() => {
        setEditModalOpen(false);
      }, 700);
    } catch (err) {
      setModalStatusMsg({
        type: "error",
        text: so ? "Keydintu ma suurtagelin" : "Failed to save profile changes",
      });
    }
  };

  const isActive = (href: string, exact?: boolean) => {
    const [path, hash] = href.split("#");
    if (hash) return false;
    if (exact) return pathname === path;
    if (path === "/admin") return pathname === "/admin";
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  const mobileItems = [
    { href: "/admin", icon: "dashboard", en: "Dashboard", so: "Dashboard", exact: true },
    { href: "/admin/users", icon: "group", en: "Profiles", so: "Profiles" },
    { href: "/admin/habits", icon: "task_alt", en: "Habits", so: "Caadooyin" },
  ] as const;

  return (
    <div className="min-h-screen bg-[#FAFBFD] flex">
      {/* ── Left Sidebar (Desktop) ── */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[#E7ECF3] bg-white h-screen fixed left-0 top-0 z-30 p-5">
        <div className="pb-4 pt-1 flex items-center gap-2.5 border-b border-[#E7ECF3]">
          <BetterMeLogo size={32} />
          <div className="flex flex-col min-w-0">
            <span className="text-[14px] font-extrabold text-[#111827] font-[family-name:var(--font-headline)] truncate">
              BetterMe Admin
            </span>
            <span className="text-[10px] text-[#0B6EF3] font-bold tracking-wide uppercase">
              {so ? "Qeybta Maamulka" : "Control Hub"}
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto no-scrollbar py-3 flex flex-col gap-4">
          {NAV_GROUPS.map((group) => {
            const catLabel = so ? group.category.so : group.category.en;
            return (
              <div key={group.category.en} className="flex flex-col gap-1">
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#94A3B8] px-3 mb-0.5">
                  {catLabel}
                </span>
                {group.items.map((item) => {
                  const active = isActive(item.href, "exact" in item ? item.exact : false);
                  const label = so ? item.so : item.en;
                  return (
                    <PrefetchLink
                      key={item.href}
                      href={item.href}
                      className={`relative flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all group ${
                        active
                          ? "bg-[#EFF6FF] text-[#0B6EF3] font-bold shadow-xs before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-[#0B6EF3] before:rounded-r"
                          : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      <Icon
                        name={item.icon}
                        size={19}
                        className={`transition-colors shrink-0 ${
                          active ? "text-[#0B6EF3]" : "text-[#94A3B8] group-hover:text-[#64748B]"
                        }`}
                      />
                      <span className="flex-1 truncate">{label}</span>
                      {active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />
                      )}
                    </PrefetchLink>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer: Quick Admin Badge */}
        <div className="pt-3 border-t border-[#E7ECF3] flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[11px] font-semibold text-[#667085]">
              {so ? "System Online" : "System Online"}
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#0B6EF3] font-bold">
            v2.4
          </span>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 min-h-screen">
        {/* ── Top Header ── */}
        <header className="h-16 sm:h-[70px] border-b border-[#E7ECF3] bg-white/95 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/admin" className="lg:hidden shrink-0">
              <BetterMeLogo size={30} />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[15px] sm:text-[18px] font-bold text-[#111827] truncate font-[family-name:var(--font-headline)]">
                  {so ? "Maamulka BetterMe" : "Admin Panel"}
                </p>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#0B6EF3] text-[10px] font-extrabold uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-[#667085] truncate hidden sm:block">
                {so ? "Xarunta xakamaynta iyo kormeerka guud" : "Live control and operations hub"}
              </p>
            </div>
          </div>

          {/* ── Profile Dropdown Container ── */}
          <div className="relative" ref={dropdownRef}>
            {/* Interactive Dropdown Trigger */}
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              aria-label={so ? "Daawo liiska maamulaha" : "Admin profile menu"}
              className={`flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-2xl border transition-all cursor-pointer select-none ${
                dropdownOpen
                  ? "bg-[#F4F8FF] border-[#0B6EF3] shadow-sm ring-2 ring-[#0B6EF3]/20"
                  : "bg-white hover:bg-[#F8FAFC] border-[#E7ECF3] hover:border-[#D1D5DB] shadow-xs active:scale-[0.98]"
              }`}
            >
              {/* Avatar with Live Indicator */}
              <div className="relative shrink-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-[#0B6EF3]/40 relative shadow-xs">
                  {currentAvatar ? (
                    <Image
                      src={currentAvatar}
                      alt={currentName}
                      fill
                      className="object-cover"
                      sizes="40px"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0B6EF3] to-[#6366F1] text-white flex items-center justify-center text-[13px] font-bold">
                      {initials}
                    </div>
                  )}
                </div>
                {/* Active Green Dot */}
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#10B981] border-2 border-white" />
              </div>

              {/* Admin Info (Desktop) */}
              <div className="hidden sm:flex flex-col items-start text-left min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-bold text-[#111827] truncate max-w-[130px]">
                    {currentName}
                  </span>
                </div>
                <span className="text-[11px] text-[#0B6EF3] font-semibold truncate max-w-[130px]">
                  {so ? "Maamule Sare" : "Super Admin"}
                </span>
              </div>

              {/* Animated Caret Icon */}
              <Icon
                name="keyboard_arrow_down"
                size={18}
                className={`text-[#667085] transition-transform duration-200 shrink-0 ${
                  dropdownOpen ? "rotate-180 text-[#0B6EF3]" : ""
                }`}
              />
            </button>

            {/* ── Dropdown Popover ── */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-72 sm:w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_16px_40px_-6px_rgba(15,23,42,0.18),0_4px_16px_-2px_rgba(11,110,243,0.1)] border border-[#E7ECF3] p-2 z-50 animate-in fade-in zoom-in-95 duration-150 transform origin-top-right">
                {/* User Preview Card */}
                <div className="p-3.5 bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] rounded-xl border border-[#E2E8F0] mb-2 flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#0B6EF3]/50 shrink-0 shadow-sm">
                    {currentAvatar ? (
                      <Image
                        src={currentAvatar}
                        alt={currentName}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#0B6EF3] to-[#6366F1] text-white flex items-center justify-center text-[15px] font-bold">
                        {initials}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[14px] font-bold text-[#111827] truncate">
                        {currentName}
                      </p>
                      <span className="px-1.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] text-[9px] font-extrabold uppercase tracking-wider shrink-0">
                        Admin
                      </span>
                    </div>
                    {currentEmail && (
                      <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                        {currentEmail}
                      </p>
                    )}
                  </div>
                </div>

                {/* Primary Action: Change Avatar & Profile directly inside admin panel */}
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    setEditModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#0B6EF3] font-bold text-[13px] transition-colors mb-1.5 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white text-[#0B6EF3] shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Icon name="add_a_photo" size={17} />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="truncate">
                      {so ? "Beddel Sawirka & Profile-ka" : "Change Avatar & Profile"}
                    </span>
                    <span className="text-[10px] text-[#2563EB] font-medium truncate">
                      {so ? "Toos uga badal admin panel dhexdiisa" : "Instant 0ms Optimistic UI update"}
                    </span>
                  </div>
                  <Icon name="chevron_right" size={16} className="text-[#0B6EF3] opacity-60 group-hover:opacity-100" />
                </button>

                {/* Navigation Links */}
                <div className="flex flex-col gap-0.5 py-1 border-t border-[#F1F5F9]">
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#334155] hover:text-[#0B6EF3] hover:bg-[#F8FAFC] transition-colors group text-[13px] font-semibold"
                  >
                    <Icon name="person" size={18} className="text-[#64748B] group-hover:text-[#0B6EF3]" />
                    <span>{so ? "Bogga Astaanta Guud" : "Full User Profile"}</span>
                  </Link>

                  <Link
                    href="/admin/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#334155] hover:text-[#0B6EF3] hover:bg-[#F8FAFC] transition-colors group text-[13px] font-semibold"
                  >
                    <Icon name="tune" size={18} className="text-[#64748B] group-hover:text-[#0B6EF3]" />
                    <span>{so ? "Hawlgalka & Nidaamka" : "Operations & System"}</span>
                  </Link>
                </div>

                {/* Divider & Logout */}
                <div className="pt-1 mt-1 border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    disabled={isLoggingOut}
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[#EF4444] hover:bg-[#FEF2F2] transition-colors text-[13px] font-bold group cursor-pointer disabled:opacity-50"
                  >
                    <Icon
                      name={isLoggingOut ? "sync" : "logout"}
                      size={18}
                      className={`text-[#EF4444] ${isLoggingOut ? "animate-spin" : ""}`}
                    />
                    <span>
                      {isLoggingOut
                        ? so ? "Waa laga baxayaa..." : "Logging out..."
                        : so ? "Ka bax (Logout)" : "Log out"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ── Mobile Navigation Drawer ── */}
        {moreOpen && (
          <div className="fixed inset-0 z-30 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/20"
              onClick={() => setMoreOpen(false)}
              aria-label={so ? "Xir menu-ga" : "Close menu"}
            />
            <section className="absolute bottom-[calc(4rem+env(safe-area-inset-bottom))] left-3 right-3 mx-auto max-w-lg rounded-2xl border border-[#E7ECF3] bg-white p-4 shadow-xl">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[14px] font-bold text-[#111827]">
                  {so ? "Qaybaha kale ee Maamulka" : "More Admin Sections"}
                </h2>
                <button
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#667085] hover:bg-[#F3F4F6]"
                  aria-label={so ? "Xir" : "Close"}
                >
                  <Icon name="close" size={18} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {NAV_ITEMS.slice(3).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex min-h-11 items-center gap-2 rounded-xl px-3 text-[12px] font-semibold ${
                      isActive(item.href, "exact" in item ? item.exact : false)
                        ? "bg-[#EFF6FF] text-[#0B6EF3]"
                        : "bg-[#F8FAFC] text-[#475467]"
                    }`}
                  >
                    <Icon name={item.icon} size={17} />
                    <span className="truncate">{so ? item.so : item.en}</span>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ── Mobile Bottom Navigation Bar ── */}
        <nav
          aria-label={so ? "Qaybaha maamulka" : "Admin sections"}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E7ECF3] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
        >
          <div className="mx-auto grid min-h-16 max-w-lg grid-cols-4">
            {mobileItems.map((item) => {
              const active = isActive(item.href, "exact" in item ? item.exact : false);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-w-0 flex-col items-center justify-center gap-1 px-1 text-[10px] font-bold transition-colors ${
                    active ? "text-[#0B6EF3]" : "text-[#667085]"
                  }`}
                >
                  <Icon name={item.icon} size={20} />
                  <span className="max-w-full truncate">{so ? item.so : item.en}</span>
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => setMoreOpen((open) => !open)}
              aria-expanded={moreOpen}
              aria-haspopup="true"
              className={`flex min-w-0 flex-col items-center justify-center gap-1 px-1 text-[10px] font-bold transition-colors ${
                moreOpen ? "text-[#0B6EF3]" : "text-[#667085]"
              }`}
            >
              <Icon name="more_horiz" size={20} />
              <span>{so ? "Kale" : "More"}</span>
            </button>
          </div>
        </nav>

        {/* ── Main Viewport Content ── */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 pb-28 lg:pb-16">
          {children}
        </main>
      </div>

      {/* ── Admin Profile & Avatar Modal (Directly Inside Admin Panel) ── */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#E7ECF3] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E7ECF3] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] text-[#0B6EF3] flex items-center justify-center">
                  <Icon name="account_circle" size={20} />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#111827]">
                    {so ? "Beddel Astaanta & Sawirka" : "Edit Profile & Avatar"}
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    {so ? "Wax ka badal xogta maamulaha adoo jooga admin panel" : "Live Optimistic UI updates right inside Admin Panel"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="w-8 h-8 rounded-full text-[#64748B] hover:text-[#111827] hover:bg-white flex items-center justify-center transition-colors"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveModal} className="p-6 space-y-5">
              {/* Alert Feedback */}
              {modalStatusMsg && (
                <div
                  className={`p-3 rounded-xl text-[12px] font-semibold flex items-center gap-2 ${
                    modalStatusMsg.type === "success"
                      ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                      : "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"
                  }`}
                >
                  <Icon
                    name={modalStatusMsg.type === "success" ? "check_circle" : "error"}
                    size={16}
                  />
                  <span>{modalStatusMsg.text}</span>
                </div>
              )}

              {/* Avatar Live Preview & Upload Action */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#0B6EF3]/30 shadow-md relative">
                    {editAvatarUrl ? (
                      <Image
                        src={editAvatarUrl}
                        alt="Avatar Preview"
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#0B6EF3] to-[#6366F1] text-white flex items-center justify-center text-[28px] font-bold">
                        {initials}
                      </div>
                    )}
                  </div>

                  {/* Upload overlay trigger */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:opacity-50"
                  >
                    <Icon name={isUploadingAvatar ? "sync" : "photo_camera"} size={22} className={isUploadingAvatar ? "animate-spin" : ""} />
                    <span className="text-[10px] font-semibold mt-0.5">
                      {so ? "Soo geli" : "Upload"}
                    </span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="px-3.5 py-1.5 rounded-xl bg-[#EFF6FF] text-[#0B6EF3] hover:bg-[#DBEAFE] text-[12px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Icon name={isUploadingAvatar ? "sync" : "upload"} size={16} className={isUploadingAvatar ? "animate-spin" : ""} />
                    <span>{isUploadingAvatar ? (so ? "Waa la soo gelinayaa..." : "Uploading...") : (so ? "Dooro Sawir Cusub" : "Choose New Photo")}</span>
                  </button>
                </div>
              </div>

              {/* Fast Preset Avatars */}
              <div>
                <label className="block text-[12px] font-bold text-[#374151] mb-2">
                  {so ? "Dooro Astaamo Diyaar ah (1-Click)" : "Choose a Preset Avatar (1-Click)"}
                </label>
                <div className="flex items-center justify-center gap-2.5 overflow-x-auto py-1">
                  {AVATAR_PRESETS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectPreset(url)}
                      className={`relative w-11 h-11 rounded-full overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        editAvatarUrl === url
                          ? "border-[#0B6EF3] ring-3 ring-[#0B6EF3]/30 scale-105"
                          : "border-gray-200 hover:border-[#0B6EF3]/50"
                      }`}
                    >
                      <Image src={url} alt={`Preset ${i}`} fill className="object-cover" sizes="44px" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Field */}
              <div>
                <label className="block text-[12px] font-bold text-[#374151] mb-1.5">
                  {so ? "Magaca Maamulaha" : "Admin Full Name"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder={so ? "Gali magacaaga" : "Enter your name"}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[13px] font-semibold text-[#111827] focus:outline-none focus:border-[#0B6EF3] focus:bg-white transition-all pl-9"
                  />
                  <Icon
                    name="badge"
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                  />
                </div>
              </div>

              {/* Custom Image URL Field */}
              <div>
                <label className="block text-[12px] font-bold text-[#374151] mb-1.5">
                  {so ? "Ama Link-ga Sawirka (URL)" : "Or Direct Image URL"}
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={editAvatarUrl}
                    onChange={(e) => setEditAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[13px] text-[#111827] focus:outline-none focus:border-[#0B6EF3] focus:bg-white transition-all pl-9"
                  />
                  <Icon
                    name="link"
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] text-[13px] font-bold transition-colors cursor-pointer"
                >
                  {so ? "Ka noqo" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingProfile || !editName.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#0B6EF3] hover:bg-[#0958C7] text-white text-[13px] font-bold shadow-md shadow-[#0B6EF3]/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingProfile ? (
                    <>
                      <Icon name="sync" size={16} className="animate-spin" />
                      <span>{so ? "Waa la keydinayaa..." : "Saving..."}</span>
                    </>
                  ) : (
                    <>
                      <Icon name="check" size={16} />
                      <span>{so ? "Keydi Xogta (Save)" : "Save Changes"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
