"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";

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

export default function ProfileClient({ user, stats }: ProfileClientProps) {
  const router = useRouter();
  const { language, t } = useTranslation();

  const [currentAvatar, setCurrentAvatar] = useState(user.avatarUrl);
  const [userName, setUserName] = useState(user.name);
  const [loggingOut, setLoggingOut] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Open modal handler
  const handleOpenEditModal = () => {
    setEditName(userName);
    setSelectedFile(null);
    setPreviewAvatar(null);
    setEditModalOpen(true);
  };

  // Image selection handler (local preview only, uploads on Save)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setAlertMsg({
        type: "error",
        text: language === "so" ? "Sawirku waa inuu ka yaraadaa 5MB" : "Image size must be under 5MB",
      });
      return;
    }

    setSelectedFile(file);
    setPreviewAvatar(URL.createObjectURL(file));
  };

  // Unified Save Profile handler (uploads photo to Cloudinary + updates name)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    setIsSavingProfile(true);
    setAlertMsg(null);

    try {
      let newAvatarUrl = currentAvatar;

      // 1. Upload photo to Cloudinary if new file selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || "Image upload failed");
        }
        newAvatarUrl = uploadData.url;
        setCurrentAvatar(newAvatarUrl);
      }

      // 2. Update user name
      if (editName.trim() !== userName) {
        const nameRes = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: editName.trim() }),
        });
        if (!nameRes.ok) throw new Error("Failed to update name");
        setUserName(editName.trim());
      }

      setEditModalOpen(false);
      setAlertMsg({
        type: "success",
        text: language === "so" ? "Xogta boggaaga si guul leh ayaa loo keydiyay! ✨" : "Profile successfully updated via Cloudinary! ✨",
      });
      router.refresh();
    } catch (err: unknown) {
      const error = err as Error;
      setAlertMsg({
        type: "error",
        text: error.message || "Failed to update profile",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

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

  const SETTINGS_ITEMS = [
    {
      label: language === "so" ? "Wax ka bedel Boggaaga" : "Edit Profile Details",
      icon: "edit",
      action: handleOpenEditModal,
    },
    {
      label: language === "so" ? "Habaynta & Luuqadda" : "Settings & Preferences",
      icon: "settings",
      href: "/settings",
    },
    {
      label: language === "so" ? "Wargelinta & Ogeysiisyada" : "Notifications & Alerts",
      icon: "notifications",
      href: "/notifications",
    },
    {
      label: language === "so" ? "Guulaha & Billadaha" : "Achievements & Badges",
      icon: "military_tech",
      href: "/achievements",
    },
    {
      label: language === "so" ? "Jeeg-gareynta Maalinlaha" : "Daily Check-in",
      icon: "ecg_heart",
      href: "/check-in",
    },
    {
      label: language === "so" ? "Nidaamyada Maalinlaha ah" : "Routines",
      icon: "auto_stories",
      href: "/routines",
    },
  ];

  return (
    <div className="flex flex-col gap-5 select-none pb-12">
      {/* Alert Banner */}
      {alertMsg && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-2.5 text-[13px] font-medium ${
            alertMsg.type === "success"
              ? "bg-[#ECFDF3] text-[#15803D] border border-[#BBF7D0]"
              : "bg-[#FFF1F0] text-[#B91C1C] border border-[#FECDD3]"
          }`}
        >
          <Icon name={alertMsg.type === "success" ? "check_circle" : "error"} size={18} />
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* Profile Hero Card with Cloudinary Upload */}
      <section className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-[0_2px_12px_rgba(16,24,40,0.04)] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative group shrink-0">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-3 border-[#0B6EF3] shadow-lg">
              <Image
                src={currentAvatar}
                alt={userName}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>

            <button
              type="button"
              onClick={handleOpenEditModal}
              title="Edit Profile & Photo"
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#0B6EF3] text-white flex items-center justify-center shadow-md hover:bg-[#0958c7] transition-transform active:scale-95 cursor-pointer"
            >
              <Icon name="photo_camera" size={16} />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-[22px] font-extrabold text-[#111827] truncate">
                  {userName}
                </h2>
                <p className="text-[13px] text-[#667085] truncate">{user.email}</p>
              </div>

              <button
                type="button"
                onClick={handleOpenEditModal}
                className="px-4 py-2 rounded-full bg-[#F4F8FF] border border-[#0B6EF3]/30 text-[#0B6EF3] text-[12px] font-bold hover:bg-[#0B6EF3] hover:text-white transition-all self-center sm:self-start flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
              >
                <Icon name="edit" size={14} />
                <span>{language === "so" ? "Wax ka bedel Boggaaga" : "Edit Profile"}</span>
              </button>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-[12px] text-[#667085]">
                <Icon name="calendar_today" size={14} className="text-[#007AFF]" />
                <span>
                  {t("member_duration")} {user.memberSince}
                </span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#ECFDF3] text-[#15803D] font-bold">
                Cloudinary CDN Active
              </span>
            </div>
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-[#EFF6FF]/70 blur-2xl pointer-events-none" />
      </section>

      {/* Stats Row */}
      <section className="grid grid-cols-4 gap-2.5">
        {[
          { label: t("nav_habits"), value: stats.habits, icon: "spa", color: "#22C55E" },
          { label: t("total_completions"), value: stats.completions, icon: "check_circle", color: "#007AFF" },
          { label: t("best_streak"), value: `${stats.streak}d`, icon: "local_fire_department", color: "#EF4444" },
          { label: language === "so" ? "Billado" : "Badges", value: stats.achievements, icon: "military_tech", color: "#F59E0B" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-[#E5E7EB] p-3.5 flex flex-col items-center text-center gap-1 shadow-2xs"
          >
            <Icon name={stat.icon} size={20} style={{ color: stat.color }} />
            <p className="text-[18px] font-extrabold text-[#101010]">{stat.value}</p>
            <p className="text-[10px] text-[#667085] font-medium leading-tight">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Achievements Preview */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col gap-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-bold text-[#101010]">
              {t("nav_achievements")}
            </h3>
            <span className="text-[11px] text-[#667085]">
              {stats.achievements} / {ACHIEVEMENTS.length} {language === "so" ? "la furtay" : "unlocked"}
            </span>
          </div>
          <Link
            href="/achievements"
            className="text-[12px] font-bold text-[#007AFF] hover:underline flex items-center gap-0.5"
          >
            <span>{language === "so" ? "Dhammaan Fiiri" : "View All"}</span>
            <Icon name="chevron_right" size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {ACHIEVEMENTS.map((a, idx) => {
            const unlocked = idx < Math.min(stats.achievements + 1, ACHIEVEMENTS.length);
            return (
              <div
                key={a.code}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${
                  unlocked ? "border-transparent shadow-xs" : "border-[#E5E7EB] opacity-40 grayscale"
                }`}
                style={unlocked ? { background: a.bg } : {}}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={unlocked ? { background: `${a.color}25` } : { background: "#f0edec" }}
                >
                  <Icon name={a.icon} size={20} style={{ color: unlocked ? a.color : "#667085" }} />
                </div>
                <p className="text-[11px] font-bold text-center text-[#101010] leading-tight">
                  {a.title}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Settings Navigation List */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-2xs">
        {SETTINGS_ITEMS.map((item, i) => {
          if (item.href) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3.5 px-5 py-3.5 hover:bg-[#F9FAFB] transition-colors ${
                  i < SETTINGS_ITEMS.length - 1 ? "border-b border-[#F3F4F6]" : ""
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#007AFF] flex items-center justify-center">
                  <Icon name={item.icon} size={18} />
                </div>
                <span className="flex-1 text-[14px] font-medium text-[#101010]">{item.label}</span>
                <Icon name="chevron_right" size={18} className="text-[#9CA3AF]" />
              </Link>
            );
          }

          return (
            <button
              key={item.label}
              type="button"
              onClick={item.action}
              className={`w-full flex items-center gap-3.5 px-5 py-3.5 hover:bg-[#F9FAFB] transition-colors text-left ${
                i < SETTINGS_ITEMS.length - 1 ? "border-b border-[#F3F4F6]" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#007AFF] flex items-center justify-center">
                <Icon name={item.icon} size={18} />
              </div>
              <span className="flex-1 text-[14px] font-medium text-[#101010]">{item.label}</span>
              <Icon name="chevron_right" size={18} className="text-[#9CA3AF]" />
            </button>
          );
        })}
      </section>

      {/* Sign Out Button */}
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="w-full h-14 border border-[#FFD6D3] bg-[#FFF1F0] text-[#EF4444] rounded-2xl font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-[#EF4444] hover:text-white transition-all disabled:opacity-60 shadow-xs"
      >
        {loggingOut ? (
          <>
            <Icon name="refresh" size={18} className="animate-spin" />
            <span>Signing out...</span>
          </>
        ) : (
          <>
            <Icon name="logout" size={18} />
            <span>{t("btn_signout")}</span>
          </>
        )}
      </button>

      {/* Edit Profile Modal (Photo + Name) */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] border border-[#E7ECF3] p-6 max-w-md w-full shadow-2xl animate-check-pop">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#F3F4F6]">
              <h3 className="font-bold text-[18px] text-[#111827]">
                {language === "so" ? "Wax ka bedel Boggaaga" : "Edit Profile"}
              </h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F3F4F6] text-[#667085] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-5 mt-4">
              {/* Photo Selector Area */}
              <div className="flex flex-col items-center justify-center gap-2.5 py-2">
                <div className="relative group">
                  <div className="relative w-22 h-22 rounded-full overflow-hidden border-3 border-[#0B6EF3] shadow-md bg-[#F4F8FF]">
                    <Image
                      src={previewAvatar || currentAvatar}
                      alt={editName}
                      fill
                      className="object-cover"
                      sizes="88px"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#0B6EF3] text-white flex items-center justify-center shadow-md hover:bg-[#0958c7] transition-all cursor-pointer active:scale-95"
                    title="Change Photo"
                  >
                    <Icon name="photo_camera" size={16} />
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[12px] font-bold text-[#0B6EF3] hover:underline"
                >
                  {language === "so" ? "Dooro Sawir Cusub" : "Choose New Photo"}
                </button>
                {selectedFile && (
                  <span className="text-[11px] text-[#20C773] font-semibold">
                    ✓ {selectedFile.name.slice(0, 20)}... (Ready to save)
                  </span>
                )}
              </div>

              {/* Name Input Field */}
              <div>
                <label className="text-[12px] font-bold text-[#667085] block mb-1">
                  {language === "so" ? "Magaca Buuxa" : "Full Name"}
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7ECF3] text-[14px] text-[#111827] focus:border-[#0B6EF3] outline-none"
                  placeholder="Your Name"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#F3F4F6]">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F3F4F6] text-[#667085] text-[13px] font-bold hover:bg-[#E5E7EB]"
                >
                  {t("btn_cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2 rounded-xl bg-[#0B6EF3] hover:bg-[#0958c7] text-white text-[13px] font-bold flex items-center gap-1.5 shadow-xs active:scale-95 disabled:opacity-50"
                >
                  {isSavingProfile && <Icon name="refresh" size={16} className="animate-spin" />}
                  <span>{isSavingProfile ? (language === "so" ? "Waa la keydinayaa..." : "Saving...") : t("btn_save")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
