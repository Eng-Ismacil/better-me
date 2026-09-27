"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";

interface ProfileClientProps {
  user: {
    name: string;
    email: string;
    avatarUrl: string;
    memberSince: string;
  };
  stats: {
    habits: number;
    completions: number;
    achievements: number;
    streak: number;
    totalStreak: number;
  };
}

const ACHIEVEMENTS = [
  { code: "first_habit", title: "First Step", icon: "emoji_events", description: "Created your first habit", color: "#F59E0B", bg: "#FFF7ED" },
  { code: "week_streak", title: "7-Day Warrior", icon: "local_fire_department", description: "7-day streak maintained", color: "#EF4444", bg: "#FFF1F0" },
  { code: "consistent", title: "Consistency King", icon: "verified", description: "80%+ for 30 days", color: "#007AFF", bg: "#EFF6FF" },
  { code: "100_completions", title: "Century Club", icon: "star", description: "100 total completions", color: "#A855F7", bg: "#FDF4FF" },
  { code: "zen_master", title: "Zen Master", icon: "self_improvement", description: "30 days of mindfulness", color: "#22C55E", bg: "#ECFDF3" },
  { code: "early_bird", title: "Early Bird", icon: "wb_sunny", description: "Morning routine for 14 days", color: "#F59E0B", bg: "#FFF7ED" },
];

const SETTINGS_ITEMS = [
  { label: "Edit Profile", icon: "edit", href: "#" },
  { label: "Notifications", icon: "notifications", href: "/reminders" },
  { label: "Routines", icon: "auto_stories", href: "/routines" },
  { label: "Privacy & Data", icon: "lock", href: "#" },
  { label: "Help & Support", icon: "help", href: "#" },
  { label: "About BetterMe", icon: "info", href: "#" },
];

export default function ProfileClient({ user, stats }: ProfileClientProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/welcome");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 select-none">
      {/* Profile Hero Card */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-[0_2px_12px_rgba(16,24,40,0.04)] relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#007AFF]/30 shadow-md shrink-0">
            <Image
              src={user.avatarUrl}
              alt={user.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[22px] font-bold text-[#101010] truncate">{user.name}</h2>
            <p className="text-[13px] text-[#667085] truncate">{user.email}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <Icon name="calendar_today" size={14} className="text-[#007AFF]" />
              <span className="text-[12px] text-[#667085]">Member for {user.memberSince}</span>
            </div>
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-[#EFF6FF]/60 blur-2xl pointer-events-none" />
      </section>

      {/* Stats Row */}
      <section className="grid grid-cols-4 gap-2">
        {[
          { label: "Habits", value: stats.habits, icon: "spa", color: "#22C55E" },
          { label: "Done", value: stats.completions, icon: "check_circle", color: "#007AFF" },
          { label: "Best Streak", value: `${stats.streak}d`, icon: "local_fire_department", color: "#EF4444" },
          { label: "Badges", value: stats.achievements, icon: "emoji_events", color: "#F59E0B" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-[#E5E7EB] p-3 flex flex-col items-center text-center gap-0.5">
            <Icon name={stat.icon} size={18} style={{ color: stat.color }} />
            <p className="text-[18px] font-bold text-[#101010]">{stat.value}</p>
            <p className="text-[10px] text-[#667085]">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Achievements */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-[#101010]">Achievements</h3>
          <span className="text-[12px] text-[#667085]">{stats.achievements}/{ACHIEVEMENTS.length} unlocked</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {ACHIEVEMENTS.map((a, idx) => {
            const unlocked = idx < Math.min(stats.achievements + 1, ACHIEVEMENTS.length);
            return (
              <div
                key={a.code}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                  unlocked
                    ? "border-transparent shadow-sm"
                    : "border-[#E5E7EB] opacity-40 grayscale"
                }`}
                style={unlocked ? { background: a.bg } : {}}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    unlocked ? "" : "bg-[#f0edec]"
                  }`}
                  style={unlocked ? { background: `${a.color}20` } : {}}
                >
                  <Icon name={a.icon} size={20} style={{ color: unlocked ? a.color : "#667085" }} />
                </div>
                <p className="text-[10px] font-semibold text-center text-[#101010] leading-tight">{a.title}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Settings List */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        {SETTINGS_ITEMS.map((item, i) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3.5 px-5 py-3.5 hover:bg-[#f6f3f2] transition-colors ${
              i < SETTINGS_ITEMS.length - 1 ? "border-b border-[#F3F4F6]" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-[#f6f3f2] flex items-center justify-center">
              <Icon name={item.icon} size={18} className="text-[#667085]" />
            </div>
            <span className="flex-1 text-[14px] font-medium text-[#101010]">{item.label}</span>
            <Icon name="chevron_right" size={18} className="text-[#667085]" />
          </Link>
        ))}
      </section>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="w-full h-14 border border-[#FFD6D3] bg-[#FFF1F0] text-[#EF4444] rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-[#EF4444] hover:text-white transition-all disabled:opacity-60"
      >
        {loggingOut ? (
          <>
            <Icon name="refresh" size={18} className="animate-spin" />
            <span>Signing out...</span>
          </>
        ) : (
          <>
            <Icon name="logout" size={18} />
            <span>Sign Out</span>
          </>
        )}
      </button>

      {/* Version */}
      <p className="text-center text-[11px] text-[#667085] pb-2">BetterMe v1.0.0 · Made with 💙</p>
    </div>
  );
}
