"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";
import { clearAdminStatus } from "@/lib/adminStatus";

interface MoreMenuClientProps {
  user: {
    name: string;
    email: string;
    avatarUrl: string;
    role?: string;
    twoFactorEnabled?: boolean;
  };
  stats?: {
    totalHabits: number;
    completedTodayCount: number;
    maxStreak: number;
    totalCheckins: number;
    totalRoutines: number;
  };
  habits?: Array<{
    id: string;
    title: string;
    category: string;
    frequency: string;
    streak: number;
  }>;
}

type MoreCategory = "all" | "growth" | "insights" | "account";

export default function MoreMenuClient({
  user,
  stats = {
    totalHabits: 6,
    completedTodayCount: 5,
    maxStreak: 6,
    totalCheckins: 8,
    totalRoutines: 4,
  },
  habits = [],
}: MoreMenuClientProps) {
  const { language, setLanguage, t } = useTranslation();
  const router = useRouter();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [category, setCategory] = useState<MoreCategory>("growth");
  const [navigationSearch, setNavigationSearch] = useState("");

  // Core navigation feature items categorized into logical groups
  const dailyGrowthTools = [
    {
      label: language === "so" ? "Diiwaangelinta Maalinlaha ah" : "Daily Mindful Check-In",
      desc: language === "so" ? "Qiimee dareenkaaga, tamarta & waxyaabaha aad ku mahadsantahay" : "Log your daily mood, energy level & gratitude reflection",
      href: "/check-in",
      icon: "ecg_heart",
      color: "#0B6EF3",
      bg: "#EFF6FF",
      badge: language === "so" ? "Maalinle" : "Daily",
    },
    {
      label: language === "so" ? "Habaynta Caadooyinka (Routines)" : "Habit Routines & Stacks",
      desc: language === "so" ? "Habayso jadwalka subaxa & habeenka si aad u dhisato dardar" : "Morning & evening sequence flows to automate your day",
      href: "/routines",
      icon: "auto_stories",
      color: "#8B5CF6",
      bg: "#F5F3FF",
      badge: `${stats.totalRoutines} ${language === "so" ? "habaysan" : "flows"}`,
    },
    {
      label: language === "so" ? "Kalandarka & Taariikhda" : "Calendar & Activity History",
      desc: language === "so" ? "Kala soco dhammaystirka caadooyinka bil kasta iyo xogtooda" : "Interactive monthly heatmaps and habit completion logs",
      href: "/calendar",
      icon: "calendar_today",
      color: "#10B981",
      bg: "#ECFDF5",
      badge: null,
    },
    {
      label: language === "so" ? "Dhammaan Caadooyinka" : "All Habits Directory",
      desc: language === "so" ? "Maamul, tafatir ama ku dar caadooyin cusub oo horumarsan" : "Create, customize, edit, archive or view all your active habits",
      href: "/habits",
      icon: "check_circle",
      color: "#20C773",
      bg: "#ECFDF3",
      badge: `${stats.totalHabits} ${language === "so" ? "caado" : "total"}`,
    },
  ];

  const insightsAndMastery = [
    {
      label: language === "so" ? "Falanqaynta & Qiimeynta (Insights)" : "Deep Insights & Analytics",
      desc: language === "so" ? "Heerka caafimaadka caadooyinkaaga iyo garaafyada horumarka" : "Habit health score, category breakdown & weekly consistency",
      href: "/insights",
      icon: "insert_chart",
      color: "#F59E0B",
      bg: "#FFFBEB",
      badge: "Health 88%",
    },
    {
      label: language === "so" ? "Guulaha & Billadaha (Achievements)" : "Achievements & Badges",
      desc: language === "so" ? "Fur billado cusub marka aad gaarto xiriirro iyo heerar sare" : "Unlock milestone badges, mastery streaks & earn XP points",
      href: "/achievements",
      icon: "military_tech",
      color: "#EC4899",
      bg: "#FDF2F8",
      badge: "XP Level 4",
    },
    {
      label: language === "so" ? "Xusuusiyeyaasha & Ogeysiisyada" : "Smart Reminders & Schedule",
      desc: language === "so" ? "Deji waqtiyada kugu habboon si aadan u iloobin caadooyinkaaga" : "Personalize scheduled reminder alerts & nudge frequencies",
      href: "/reminders",
      icon: "alarm",
      color: "#6366F1",
      bg: "#EEF2FF",
      badge: null,
    },
    {
      label: language === "so" ? "Xarunta Digniinaha (Notifications)" : "Live Notification Center",
      desc: language === "so" ? "Eeg ogeysiisyadii ugu dambeeyay, digniinaha streak-ka iyo updates" : "Real-time alerts, streak protection nudges & community updates",
      href: "/notifications",
      icon: "notifications",
      color: "#0B6EF3",
      bg: "#EFF6FF",
      badge: null,
    },
    {
      label: language === "so" ? "Maaliyaddayda (Finance)" : "Personal Finance Tracker",
      desc: language === "so" ? "La soco dakhligaaga, kharashkaaga iyo haraagaaga maalinlaha ah" : "Track daily income, expenses & balance with calm clarity",
      href: "/finance",
      icon: "account_balance_wallet",
      color: "#059669",
      bg: "#ECFDF5",
      badge: null,
    },
  ];

  const accountAndSecurity = [
    {
      label: language === "so" ? "Xogta Akoonka (Profile)" : "Profile & Identity",
      desc: language === "so" ? "Sawirka Cloudinary, magacaaga & taariikh-nololeedkaaga" : "Cloudinary avatar upload, name, email & personalized bio",
      href: "/profile",
      icon: "account_circle",
      color: "#0B6EF3",
      bg: "#EFF6FF",
    },
    {
      label: language === "so" ? "Dejimaha & Amniga (Settings)" : "Settings & Security",
      desc: language === "so" ? "Bedelka furaha, 2-Factor Auth (OTP) & dookhyada nidaamka" : "Password change, Resend 2FA security & app preferences",
      href: "/settings",
      icon: "settings",
      color: "#6B7280",
      bg: "#F3F4F6",
    },
    {
      label: language === "so" ? "Taageerada & Chat (Live Support)" : "Help & Live Support",
      desc: language === "so" ? "La hadal adminka toos, weydii su'aalo ama soo lifaaq sawir" : "Chat directly with admin, ask questions or attach screenshots",
      href: "/support",
      icon: "support_agent",
      color: "#8B5CF6",
      bg: "#F5F3FF",
    },
    ...(user.role === "admin"
      ? [
          {
            label: language === "so" ? "Maamulka Admin-ka" : "Admin Control Panel",
            desc: language === "so"
              ? "Maamul isticmaalayaasha, caadooyinka, faafinta, audit & maaliyadda"
              : "Manage users, habits, broadcasts, audit logs & platform finance",
            href: "/admin",
            icon: "admin_panel_settings",
            color: "#0B6EF3",
            bg: "#EFF6FF",
          },
        ]
      : []),
  ];

  const allNavigationItems = [
    ...dailyGrowthTools,
    ...insightsAndMastery,
    ...accountAndSecurity,
  ];
  const searchTerm = navigationSearch.trim().toLowerCase();
  const searchResults = searchTerm
    ? allNavigationItems.filter((item) =>
        `${item.label} ${item.desc}`.toLowerCase().includes(searchTerm)
      )
    : [];

  const faqs = [
    {
      q: language === "so" ? "Sidee u dhisi karaa caado waarta?" : "How do I build habits that stick long term?",
      a: language === "so"
        ? "Ku bilow tallaabooyin yaryar (The 2-Minute Rule). Isku xir caadada cusub iyo caado aad horey u lahayd (Habit Stacking), kuna dadaal inaad maalin walba diiwaangeliso."
        : "Start with micro-habits (the 2-minute rule). Stack new habits on top of existing daily behaviors, and track your streaks consistently every single day.",
    },
    {
      q: language === "so" ? "Maxaa dhacaya haddii aan maalin seego?" : "What happens if I miss a single day?",
      a: language === "so"
        ? "Ha niyad jabin! Xeerka dahabiga ah waa 'Weligaa ha seegin laba jeer oo isku xigta'. Maalinta ku xigta si degdeg ah ugu soo noqo jadwalkaaga."
        : "Never miss twice! Missing one day is an accident; missing two is the start of a new bad habit. Jump straight back into momentum tomorrow.",
    },
    {
      q: language === "so" ? "Sidee u shaqeeyaa 2-Factor Authentication (2FA)?" : "How does Two-Factor Authentication (2FA) work?",
      a: language === "so"
        ? "Marka aad gasho akoonkaaga, lambar sir ah (6-digit OTP code) ayaa laguugu soo dirayaa email-kaaga (Resend) si loo xaqiijiyo amniga akoonkaaga."
        : "When signing into an admin account, a secure 6-digit one-time code is delivered directly to your email via Resend for military-grade protection.",
    },
  ];

  const handleExportData = () => {
    try {
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        user: {
          name: user.name,
          email: user.email,
        },
        stats,
        habits,
      };

      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute(
        "download",
        `betterme-backup-${new Date().toISOString().slice(0, 10)}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setShowExportSuccess(true);
      setTimeout(() => setShowExportSuccess(false), 4000);
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      clearAdminStatus();
      router.push("/welcome");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none max-w-xl mx-auto pb-20 animate-in fade-in duration-300">
      {/* =========================================================================
          SECTION 1: HERO PROFILE CARD
          ========================================================================= */}
      <section className="bg-gradient-to-br from-white via-[#FAFBFD] to-[#F4F8FF] rounded-[24px] border border-[#E7ECF3] p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
        {/* Background decorative blob */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#0B6EF3]/8 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4 sm:gap-5 relative z-10">
          {/* Avatar with Status Pulse */}
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden border-3 border-white shadow-[0_4px_14px_rgba(11,110,243,0.25)] shrink-0">
            <Image
              src={user.avatarUrl || "/images/avatar.jpg"}
              alt={user.name}
              fill
              className="object-cover"
              sizes="72px"
              priority
            />
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-[#20C773] ring-2 ring-white" />
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[19px] sm:text-[21px] font-extrabold text-[#111827] tracking-tight truncate font-[family-name:var(--font-headline)]">
                {user.name}
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#0B6EF3] text-[10px] font-extrabold border border-[#0B6EF3]/20 uppercase tracking-wide">
                <Icon name="verified" size={12} />
                <span>{user.role === "admin" ? "Admin" : "Pro"}</span>
              </span>
            </div>

            <p className="text-[12px] text-[#667085] truncate mt-0.5">
              {user.email}
            </p>

            {/* Quick Action Badges */}
            <div className="flex items-center gap-2 mt-3">
              <Link
                href="/profile"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#E7ECF3] hover:border-[#0B6EF3] text-[11px] font-bold text-[#111827] shadow-2xs hover:text-[#0B6EF3] transition-all"
              >
                <Icon name="edit" size={13} />
                <span>{language === "so" ? "Wax ka bedel" : "Edit Profile"}</span>
              </Link>
              <Link
                href="/settings"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#E7ECF3] hover:border-[#0B6EF3] text-[11px] font-bold text-[#111827] shadow-2xs hover:text-[#0B6EF3] transition-all"
              >
                <Icon name="settings" size={13} />
                <span>{language === "so" ? "Dejimaha" : "Settings"}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: MOMENTUM STATS RIBBON (4 Interactive Metrics)
          ========================================================================= */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Streak */}
        <div className="bg-white rounded-2xl border border-[#E7ECF3] p-3.5 flex flex-col items-center justify-center text-center shadow-2xs hover:shadow-xs transition-shadow">
          <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center mb-1.5">
            <Icon name="local_fire_department" size={19} />
          </div>
          <span className="text-[17px] font-extrabold text-[#111827] tracking-tight">
            {stats.maxStreak} {language === "so" ? "Maalmood" : "Days"}
          </span>
          <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider mt-0.5">
            {language === "so" ? "Xiriirka Ugu Sareeya" : "Max Streak"}
          </span>
        </div>

        {/* Completed Today */}
        <div className="bg-white rounded-2xl border border-[#E7ECF3] p-3.5 flex flex-col items-center justify-center text-center shadow-2xs hover:shadow-xs transition-shadow">
          <div className="w-8 h-8 rounded-xl bg-[#ECFDF3] text-[#20C773] flex items-center justify-center mb-1.5">
            <Icon name="task_alt" size={19} />
          </div>
          <span className="text-[17px] font-extrabold text-[#111827] tracking-tight">
            {stats.completedTodayCount}/{stats.totalHabits}
          </span>
          <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider mt-0.5">
            {language === "so" ? "Maanta Diyaar" : "Today Done"}
          </span>
        </div>

        {/* Check-ins */}
        <div className="bg-white rounded-2xl border border-[#E7ECF3] p-3.5 flex flex-col items-center justify-center text-center shadow-2xs hover:shadow-xs transition-shadow">
          <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] text-[#0B6EF3] flex items-center justify-center mb-1.5">
            <Icon name="ecg_heart" size={19} />
          </div>
          <span className="text-[17px] font-extrabold text-[#111827] tracking-tight">
            {stats.totalCheckins}
          </span>
          <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider mt-0.5">
            {language === "so" ? "Diiwaangalin" : "Check-ins"}
          </span>
        </div>

        {/* Routines */}
        <div className="bg-white rounded-2xl border border-[#E7ECF3] p-3.5 flex flex-col items-center justify-center text-center shadow-2xs hover:shadow-xs transition-shadow">
          <div className="w-8 h-8 rounded-xl bg-[#F5F3FF] text-[#8B5CF6] flex items-center justify-center mb-1.5">
            <Icon name="auto_stories" size={19} />
          </div>
          <span className="text-[17px] font-extrabold text-[#111827] tracking-tight">
            {stats.totalRoutines}
          </span>
          <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider mt-0.5">
            {language === "so" ? "Habayn" : "Routines"}
          </span>
        </div>
      </section>

      <section className="sticky top-[4.5rem] z-20 flex flex-col gap-3 rounded-xl border border-[#E7ECF3] bg-[#FAFBFD]/95 p-3 backdrop-blur-md">
        <label className="relative block">
          <Icon
            name="search"
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]"
          />
          <input
            type="search"
            value={navigationSearch}
            onChange={(event) => setNavigationSearch(event.target.value)}
            placeholder={language === "so" ? "Raadi bog ama adeeg..." : "Find a page or tool..."}
            className="min-h-11 w-full rounded-lg border border-[#D0D5DD] bg-white pl-10 pr-3 text-[13px] outline-none focus:border-[#0B6EF3]"
          />
        </label>
        <div role="tablist" aria-label={language === "so" ? "Qaybaha menu-ga" : "Menu categories"} className="grid grid-cols-4 gap-1 rounded-lg bg-[#EEF1F5] p-1">
          {([
            ["growth", language === "so" ? "Horumar" : "Growth", "trending_up"],
            ["insights", language === "so" ? "Falanqayn" : "Insights", "monitoring"],
            ["account", language === "so" ? "Akoon" : "Account", "account_circle"],
            ["all", language === "so" ? "Dhammaan" : "All", "apps"],
          ] as const).map(([value, label, icon]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={category === value}
              onClick={() => {
                setCategory(value);
                setNavigationSearch("");
              }}
              className={`flex min-h-10 min-w-0 flex-col items-center justify-center gap-0.5 rounded-md px-1 text-[10px] font-bold transition-colors sm:flex-row sm:gap-1.5 sm:text-[11px] ${
                category === value
                  ? "bg-white text-[#0B6EF3] shadow-sm"
                  : "text-[#667085] hover:text-[#344054]"
              }`}
            >
              <Icon name={icon} size={15} />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {searchTerm ? (
        <section className="flex flex-col gap-2.5" aria-live="polite">
          <h3 className="px-1 text-[12px] font-extrabold uppercase text-[#667085]">
            {language === "so" ? `Natiijooyinka (${searchResults.length})` : `Results (${searchResults.length})`}
          </h3>
          {searchResults.length ? searchResults.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl border border-[#E7ECF3] bg-white p-3.5 transition-colors hover:border-[#0B6EF3]/40 hover:bg-[#FAFCFF]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: item.bg, color: item.color }}>
                <Icon name={item.icon} size={19} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-bold text-[#111827]">{item.label}</span>
                <span className="block truncate text-[11px] text-[#667085]">{item.desc}</span>
              </span>
              <Icon name="chevron_right" size={17} className="shrink-0 text-[#98A2B3]" />
            </Link>
          )) : (
            <p className="rounded-xl border border-dashed border-[#D0D5DD] bg-white p-6 text-center text-[12px] text-[#667085]">
              {language === "so" ? "Boggan lama helin." : "No matching page found."}
            </p>
          )}
        </section>
      ) : (
        <>

      {/* =========================================================================
          SECTION 3: DAILY GROWTH & HABIT TOOLS
          ========================================================================= */}
      {(category === "all" || category === "growth") && (
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[12px] font-extrabold uppercase tracking-wider text-[#667085]">
            {language === "so" ? "Qalabka Horumarka & Caadooyinka" : "Habit & Growth Tools"}
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {dailyGrowthTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="bg-white rounded-2xl border border-[#E7ECF3] p-3.5 sm:p-4 flex items-center gap-3.5 hover:border-[#0B6EF3]/50 hover:bg-[#FAFBFD] transition-all shadow-2xs group"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs"
                style={{ background: tool.bg, color: tool.color }}
              >
                <Icon name={tool.icon} size={22} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-[14px] font-bold text-[#111827] group-hover:text-[#0B6EF3] transition-colors truncate">
                    {tool.label}
                  </h4>
                  {tool.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-[#F4F8FF] text-[#0B6EF3] text-[10px] font-bold border border-[#0B6EF3]/20">
                      {tool.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#667085] truncate mt-0.5">
                  {tool.desc}
                </p>
              </div>

              <Icon
                name="chevron_right"
                size={18}
                className="text-[#9CA3AF] group-hover:text-[#0B6EF3] group-hover:translate-x-0.5 transition-all"
              />
            </Link>
          ))}
        </div>
      </section>
        )}

      {/* =========================================================================
          SECTION 4: INSIGHTS, ACHIEVEMENTS & ALERTS
          ========================================================================= */}
        {(category === "all" || category === "insights") && (
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[12px] font-extrabold uppercase tracking-wider text-[#667085]">
            {language === "so" ? "Falanqaynta & Guulaha" : "Analytics & Mastery"}
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {insightsAndMastery.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white rounded-2xl border border-[#E7ECF3] p-3.5 sm:p-4 flex items-center gap-3.5 hover:border-[#0B6EF3]/50 hover:bg-[#FAFBFD] transition-all shadow-2xs group"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs"
                style={{ background: item.bg, color: item.color }}
              >
                <Icon name={item.icon} size={22} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-[14px] font-bold text-[#111827] group-hover:text-[#0B6EF3] transition-colors truncate">
                    {item.label}
                  </h4>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-[#ECFDF3] text-[#20C773] text-[10px] font-bold border border-[#20C773]/20">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#667085] truncate mt-0.5">
                  {item.desc}
                </p>
              </div>

              <Icon
                name="chevron_right"
                size={18}
                className="text-[#9CA3AF] group-hover:text-[#0B6EF3] group-hover:translate-x-0.5 transition-all"
              />
            </Link>
          ))}
        </div>
      </section>
        )}

      {/* =========================================================================
          SECTION 5: APP PREFERENCES & TOGGLES
          ========================================================================= */}
        {(category === "all" || category === "account") && (
      <section className="bg-white rounded-2xl border border-[#E7ECF3] p-4 flex flex-col gap-4 shadow-2xs">
        <span className="text-[12px] font-extrabold uppercase tracking-wider text-[#667085]">
          {language === "so" ? "Dookhyada App-ka" : "App Preferences"}
        </span>

        {/* Language Selection Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#0B6EF3] flex items-center justify-center">
              <Icon name="translate" size={18} />
            </div>
            <div>
              <span className="text-[13px] font-bold text-[#111827] block">
                {t("language_label")}
              </span>
              <span className="text-[11px] text-[#667085]">
                {language === "so" ? "Af-Soomaali (Dhaqan)" : "English (Default)"}
              </span>
            </div>
          </div>

          <div className="flex items-center bg-[#F3F4F6] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-3 py-1 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                language === "en"
                  ? "bg-white text-[#0B6EF3] shadow-xs"
                  : "text-[#667085]"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage("so")}
              className={`px-3 py-1 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                language === "so"
                  ? "bg-white text-[#0B6EF3] shadow-xs"
                  : "text-[#667085]"
              }`}
            >
              SO
            </button>
          </div>
        </div>

        {/* Haptic / Sound Feedback Toggle */}
        <div className="flex items-center justify-between border-t border-[#F0F2F5] pt-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ECFDF3] text-[#20C773] flex items-center justify-center">
              <Icon name="volume_up" size={18} />
            </div>
            <div>
              <span className="text-[13px] font-bold text-[#111827] block">
                {language === "so" ? "Dhawaaqa Guusha" : "Completion Sounds"}
              </span>
              <span className="text-[11px] text-[#667085]">
                {language === "so" ? "Dhawaaq marka caado la calaamadeeyo" : "Play audio chime on habit completion"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSoundEffects((prev) => !prev)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              soundEffects ? "bg-[#20C773]" : "bg-[#D1D5DB]"
            }`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform absolute top-1 ${
                soundEffects ? "right-1" : "left-1"
              }`}
            />
          </button>
        </div>
      </section>
        )}

      {/* =========================================================================
          SECTION 6: DATA EXPORT & FREQUENTLY ASKED QUESTIONS
          ========================================================================= */}
        {(category === "all" || category === "account") && (
      <section className="bg-white rounded-2xl border border-[#E7ECF3] p-4 flex flex-col gap-3.5 shadow-2xs">
        <span className="text-[12px] font-extrabold uppercase tracking-wider text-[#667085]">
          {language === "so" ? "Kaydka & Xogtaada" : "Data & Knowledge"}
        </span>

        {/* Export Data Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F4F8FF] text-[#0B6EF3] flex items-center justify-center">
              <Icon name="download" size={18} />
            </div>
            <div>
              <span className="text-[13px] font-bold text-[#111827] block">
                {language === "so" ? "Daji Xogtaada (Backup JSON)" : "Export Habits Backup"}
              </span>
              <span className="text-[11px] text-[#667085]">
                {language === "so"
                  ? "Daji dhamaan caadooyinkaaga iyo taariikhdaada"
                  : "Download all habits & tracking history as JSON"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportData}
            className="px-3.5 py-1.5 rounded-xl bg-[#0B6EF3] text-white text-[12px] font-bold hover:bg-[#0958c7] active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            {language === "so" ? "Daji" : "Export"}
          </button>
        </div>

        {showExportSuccess && (
          <div className="p-3 rounded-xl bg-[#ECFDF3] border border-[#20C773]/30 text-[#20C773] text-[12px] font-bold flex items-center gap-2 animate-in fade-in">
            <Icon name="check_circle" size={16} />
            <span>
              {language === "so"
                ? "Kaydka JSON si guul leh ayaa loo soo dajiyay!"
                : "Backup file downloaded successfully!"}
            </span>
          </div>
        )}

        {/* Habit Wisdom FAQ Accordion */}
        <div className="border-t border-[#F0F2F5] pt-3 flex flex-col gap-2">
          <span className="text-[12px] font-bold text-[#111827]">
            {language === "so" ? "Talooyinka Caadooyinka Waara" : "Habit Mastery FAQ"}
          </span>

          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-[#E7ECF3] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full px-3.5 py-2.5 bg-[#FAFBFD] hover:bg-[#F4F8FF] flex items-center justify-between text-left transition-colors cursor-pointer"
              >
                <span className="text-[12px] font-bold text-[#111827]">
                  {faq.q}
                </span>
                <Icon
                  name={expandedFaq === idx ? "expand_less" : "expand_more"}
                  size={18}
                  className="text-[#667085]"
                />
              </button>
              {expandedFaq === idx && (
                <div className="px-3.5 py-2.5 text-[12px] text-[#4B5563] leading-relaxed bg-white border-t border-[#E7ECF3]">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
        )}

      {/* =========================================================================
          SECTION 7: ACCOUNT & LOGOUT ACTIONS
          ========================================================================= */}
        {(category === "all" || category === "account") && (
      <section className="bg-white rounded-2xl border border-[#E7ECF3] p-4 flex flex-col gap-2.5 shadow-2xs">
        <span className="text-[12px] font-extrabold uppercase tracking-wider text-[#667085]">
          {language === "so" ? "Akoonka & Ka Bixitaanka" : "Account Session"}
        </span>

        {accountAndSecurity.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F9FAFB] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: item.bg, color: item.color }}
              >
                <Icon name={item.icon} size={18} />
              </div>
              <div>
                <span className="text-[13px] font-bold text-[#111827] group-hover:text-[#0B6EF3] transition-colors block">
                  {item.label}
                </span>
                <span className="text-[11px] text-[#667085] block">
                  {item.desc}
                </span>
              </div>
            </div>
            <Icon name="chevron_right" size={16} className="text-[#9CA3AF]" />
          </Link>
        ))}

        {/* Log Out Button */}
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#EF4444] border border-[#EF4444]/20 text-[13px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-98"
        >
          <Icon name="logout" size={18} />
          <span>{language === "so" ? "Ka Bax Akoonka (Log Out)" : "Sign Out"}</span>
        </button>
      </section>
      )}
        </>
      )}

      {/* =========================================================================
          SECTION 8: BRAND FOOTER & SYSTEM STATUS
          ========================================================================= */}
      <footer className="flex flex-col items-center justify-center text-center gap-1 text-[#9CA3AF] text-[11px] pt-2 pb-6">
        <div className="flex items-center gap-1.5 text-[#20C773] font-bold text-[11px]">
          <span className="w-2 h-2 rounded-full bg-[#20C773] animate-pulse" />
          <span>{language === "so" ? "Nidaamka waa diyaar oo shaqeynaya" : "All services operational & encrypted"}</span>
        </div>
        <p className="mt-1 font-medium">BetterMe • Built with Passion</p>
        <p className="text-[10px] text-[#9CA3AF]">Version 2.4.0 (Production Stable)</p>
      </footer>

      {/* =========================================================================
          LOGOUT CONFIRMATION MODAL
          ========================================================================= */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#E7ECF3] flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center mb-3">
              <Icon name="logout" size={28} />
            </div>

            <h3 className="text-[18px] font-bold text-[#111827]">
              {language === "so" ? "Ma hubtaa inaad ka baxayso?" : "Confirm Sign Out"}
            </h3>

            <p className="text-[13px] text-[#667085] mt-1.5 leading-relaxed">
              {language === "so"
                ? "Waxaad mar walba dib ugu soo geli kartaa email-kaaga iyo furahaaga sirta ah."
                : "You can sign back in anytime with your registered credentials."}
            </p>

            <div className="grid grid-cols-2 gap-3 w-full mt-6">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="py-2.5 px-4 rounded-xl border border-[#E7ECF3] text-[13px] font-bold text-[#374151] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
              >
                {language === "so" ? "Jooji" : "Cancel"}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="py-2.5 px-4 rounded-xl bg-[#EF4444] text-white text-[13px] font-bold hover:bg-[#DC2626] transition-colors cursor-pointer disabled:opacity-50"
              >
                {isLoggingOut
                  ? language === "so"
                    ? "Waa la baxayaa..."
                    : "Signing out..."
                  : language === "so"
                  ? "Haa, Ka Bax"
                  : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
