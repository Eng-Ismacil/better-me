"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useTranslation, Language } from "@/lib/i18n";

interface SettingsClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    timezone?: string;
  };
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const router = useRouter();
  const { language, setLanguage, t } = useTranslation();

  const [name, setName] = useState(user.name);
  const [timezone, setTimezone] = useState(user.timezone || "UTC");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Notification toggles
  const [habitAlerts, setHabitAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  // Password reset state
  const [sendingReset, setSendingReset] = useState(false);
  const [resetSentMessage, setResetSentMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Cloudinary image upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setProfileMessage({
        type: "error",
        text: language === "so" ? "Sawirku waa inuu ka yaraadaa 5MB" : "Image size must be under 5MB",
      });
      return;
    }

    setUploadingImage(true);
    setProfileMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setAvatarUrl(data.url);
      setProfileMessage({
        type: "success",
        text: language === "so" ? "Sawirka astaanta si guul leh ayaa loo bedelay! ✨" : "Avatar updated via Cloudinary! ✨",
      });
      router.refresh();
    } catch (err: unknown) {
      const error = err as Error;
      setProfileMessage({
        type: "error",
        text: error.message || (language === "so" ? "Khalad ayaa dhacay xilligii sawirka la dirayay" : "Failed to upload image"),
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle Profile Details Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, timezone, avatarUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      setProfileMessage({
        type: "success",
        text: language === "so" ? "Xogta astaanta si guul leh ayaa loo keydiyay! ✅" : "Profile changes saved successfully! ✅",
      });
      router.refresh();
    } catch (err: unknown) {
      const error = err as Error;
      setProfileMessage({
        type: "error",
        text: error.message || "Failed to update profile",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // Trigger Password Reset via Resend
  const handleSendResetEmail = async () => {
    setSendingReset(true);
    setResetSentMessage(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send reset email");

      setResetSentMessage(
        language === "so"
          ? `Koodhka dib u dejinta waxaa loo diray ${user.email} adoo adeegsanaya Resend! 📩`
          : `Password reset verification email sent to ${user.email} via Resend! 📩`
      );
    } catch (err: unknown) {
      const error = err as Error;
      setResetSentMessage(error.message || "Failed to send reset code");
    } finally {
      setSendingReset(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/welcome");
      router.refresh();
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none max-w-2xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h2 className="text-[24px] font-extrabold text-[#101010] tracking-tight">
          {t("settings_title")}
        </h2>
        <p className="text-[13px] text-[#667085] mt-1">
          {t("settings_subtitle")}
        </p>
      </div>

      {profileMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-[13px] font-medium ${
            profileMessage.type === "success"
              ? "bg-[#ECFDF3] text-[#15803D] border border-[#BBF7D0]"
              : "bg-[#FFF1F0] text-[#B91C1C] border border-[#FECDD3]"
          }`}
        >
          <Icon
            name={profileMessage.type === "success" ? "check_circle" : "error"}
            size={18}
          />
          <span>{profileMessage.text}</span>
        </div>
      )}

      {/* Language Section */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#007AFF] flex items-center justify-center">
            <Icon name="translate" size={22} />
          </div>
          <div>
            <h3 className="font-bold text-[15px] text-[#101010]">
              {t("section_appearance")}
            </h3>
            <p className="text-[12px] text-[#667085]">
              {t("language_desc")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`p-3.5 rounded-xl border flex items-center justify-between text-left transition-all ${
              language === "en"
                ? "border-[#007AFF] bg-[#EFF6FF] text-[#007AFF] shadow-xs font-semibold"
                : "border-[#E5E7EB] bg-white text-[#667085] hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🇬🇧</span>
              <div>
                <span className="text-[14px] font-bold block text-[#101010]">English</span>
                <span className="text-[11px] text-[#667085]">Default Language</span>
              </div>
            </div>
            {language === "en" && <Icon name="check_circle" size={18} className="text-[#007AFF]" />}
          </button>

          <button
            type="button"
            onClick={() => setLanguage("so")}
            className={`p-3.5 rounded-xl border flex items-center justify-between text-left transition-all ${
              language === "so"
                ? "border-[#007AFF] bg-[#EFF6FF] text-[#007AFF] shadow-xs font-semibold"
                : "border-[#E5E7EB] bg-white text-[#667085] hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🇸🇴</span>
              <div>
                <span className="text-[14px] font-bold block text-[#101010]">Af-Soomaali</span>
                <span className="text-[11px] text-[#667085]">Luuqadda Soomaaliga</span>
              </div>
            </div>
            {language === "so" && <Icon name="check_circle" size={18} className="text-[#007AFF]" />}
          </button>
        </div>
      </section>

      {/* Cloudinary Profile Photo & Information */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#007AFF] flex items-center justify-center">
            <Icon name="badge" size={22} />
          </div>
          <div>
            <h3 className="font-bold text-[15px] text-[#101010]">
              {t("section_account")}
            </h3>
            <p className="text-[12px] text-[#667085]">
              {language === "so"
                ? "Kala maamul sawirkaaga astaanta iyo xogta shakhsiga"
                : "Manage your profile details and Cloudinary avatar"}
            </p>
          </div>
        </div>

        {/* Avatar Upload Banner */}
        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#007AFF] shadow-md shrink-0">
            <Image
              src={avatarUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="80px"
            />
            {uploadingImage && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                <Icon name="refresh" size={24} className="animate-spin" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h4 className="font-bold text-[14px] text-[#101010]">
              {language === "so" ? "Sawirka Astaanta (Cloudinary CDN)" : "Profile Avatar (Cloudinary CDN)"}
            </h4>
            <p className="text-[11px] text-[#667085] mt-0.5">
              JPG, PNG, WebP (Max 5MB). Folder: <code className="text-[#007AFF]">salama-hub</code>
            </p>
            <div className="mt-3 flex items-center justify-center sm:justify-start gap-2.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="px-4 py-2 rounded-xl bg-[#007AFF] text-white text-[12px] font-semibold hover:bg-[#0069db] active:scale-95 transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <Icon name="cloud_upload" size={16} />
                <span>
                  {uploadingImage
                    ? language === "so"
                      ? "Waa la gelinayaa..."
                      : "Uploading..."
                    : language === "so"
                    ? "Soo Geli Sawir Cusub"
                    : "Upload New Photo"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Inputs */}
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
          <div>
            <label className="text-[12px] font-semibold text-[#667085] block mb-1">
              {language === "so" ? "Magaca Buuxa" : "Full Name"}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] text-[14px] text-[#101010] focus:border-[#007AFF] outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="text-[12px] font-semibold text-[#667085] block mb-1">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] text-[14px] text-[#667085] bg-[#F9FAFB] cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-[12px] font-semibold text-[#667085] block mb-1">
              {language === "so" ? "Aagga Waqtiga (Timezone)" : "Timezone"}
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] text-[14px] text-[#101010] bg-white focus:border-[#007AFF] outline-none transition-all"
            >
              <option value="UTC">UTC (Universal Time)</option>
              <option value="Africa/Mogadishu">Africa/Mogadishu (UTC+3)</option>
              <option value="Africa/Nairobi">Africa/Nairobi (UTC+3)</option>
              <option value="Asia/Dubai">Asia/Dubai (UTC+4)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="America/New_York">America/New_York (EST)</option>
            </select>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 rounded-xl bg-[#007AFF] text-white text-[13px] font-semibold hover:bg-[#0069db] active:scale-95 transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              {savingProfile && <Icon name="refresh" size={16} className="animate-spin" />}
              <span>{savingProfile ? t("btn_saving") : t("btn_save")}</span>
            </button>
          </div>
        </form>
      </section>

      {/* Security & Password Reset via Resend */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF1F0] text-[#EF4444] flex items-center justify-center">
            <Icon name="lock" size={22} />
          </div>
          <div>
            <h3 className="font-bold text-[15px] text-[#101010]">
              {t("section_security")}
            </h3>
            <p className="text-[12px] text-[#667085]">
              {language === "so"
                ? "Dib u deji furahaaga sirta adoo adeegsanaya Resend Email"
                : "Reset your password securely via Resend Email service"}
            </p>
          </div>
        </div>

        {resetSentMessage && (
          <div className="p-3.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-[13px]">
            {resetSentMessage}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div>
            <span className="font-semibold text-[13px] text-[#101010] block">
              {t("change_password")}
            </span>
            <span className="text-[12px] text-[#667085]">
              {language === "so"
                ? `Waxa koodhka laguugu diri doonaa: ${user.email}`
                : `A reset code will be delivered to: ${user.email}`}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSendResetEmail}
            disabled={sendingReset}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#007AFF] text-[#007AFF] hover:bg-[#EFF6FF] font-semibold text-[13px] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {sendingReset ? (
              <>
                <Icon name="refresh" size={16} className="animate-spin" />
                <span>{language === "so" ? "Waa la dirayaa..." : "Sending..."}</span>
              </>
            ) : (
              <>
                <Icon name="mail" size={16} />
                <span>{t("reset_password_btn")}</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Notifications Preferences */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF3] text-[#22C55E] flex items-center justify-center">
            <Icon name="notifications" size={22} />
          </div>
          <div>
            <h3 className="font-bold text-[15px] text-[#101010]">
              {t("section_notifications")}
            </h3>
            <p className="text-[12px] text-[#667085]">
              {language === "so"
                ? "Dookhyada wargelinta iyo xusuusinta caadooyinka"
                : "Manage your reminder and notification preferences"}
            </p>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-[#F3F4F6]">
          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-medium text-[13px] text-[#101010] block">
                {t("push_notifications")}
              </span>
              <span className="text-[11px] text-[#667085]">
                {language === "so"
                  ? "Hel digniinta xilliyada la cayimay ee caadooyinka"
                  : "Receive scheduled reminders for morning and evening routines"}
              </span>
            </div>
            <input
              type="checkbox"
              checked={habitAlerts}
              onChange={(e) => setHabitAlerts(e.target.checked)}
              className="w-5 h-5 accent-[#007AFF] rounded cursor-pointer"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-medium text-[13px] text-[#101010] block">
                {t("email_summary")}
              </span>
              <span className="text-[11px] text-[#667085]">
                {language === "so"
                  ? "Warbixin kooban oo todobaadle ah oo streak-gaaga ku saabsan"
                  : "Summary of weekly streak and completed habits sent to your email"}
              </span>
            </div>
            <input
              type="checkbox"
              checked={weeklyDigest}
              onChange={(e) => setWeeklyDigest(e.target.checked)}
              className="w-5 h-5 accent-[#007AFF] rounded cursor-pointer"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-medium text-[13px] text-[#101010] block">
                {language === "so" ? "Dabaaldegga & Dhawaqa" : "Celebration & Sounds"}
              </span>
              <span className="text-[11px] text-[#667085]">
                {language === "so"
                  ? "Daar buufinta (confetti) marka caado la dhameeyo"
                  : "Confetti burst and sound on habit completion"}
              </span>
            </div>
            <input
              type="checkbox"
              checked={soundEffects}
              onChange={(e) => setSoundEffects(e.target.checked)}
              className="w-5 h-5 accent-[#007AFF] rounded cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* Sign Out Button */}
      <button
        type="button"
        onClick={handleLogout}
        className="w-full py-4 rounded-2xl border border-[#FFD6D3] bg-[#FFF1F0] text-[#EF4444] font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-[#EF4444] hover:text-white transition-all shadow-xs"
      >
        <Icon name="logout" size={18} />
        <span>{t("btn_signout")}</span>
      </button>
    </div>
  );
}
