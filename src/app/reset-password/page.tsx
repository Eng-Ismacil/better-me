"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BetterMeLogo from "@/components/brand/BetterMeLogo";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, setLanguage, t } = useTranslation();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const codeParam = searchParams.get("code");
    if (emailParam) setEmail(emailParam);
    if (codeParam) setCode(codeParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({
        type: "error",
        text:
          language === "so"
            ? "Labada fure isma leha, fadlan hubi!"
            : "Passwords do not match, please verify!",
      });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text:
          language === "so"
            ? "Furaha sirta waa inuu ka yaraan 6 xaraf"
            : "Password must be at least 6 characters",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");

      setMessage({
        type: "success",
        text: t("reset_success"),
      });

      setTimeout(() => {
        router.push("/login?reset=success");
      }, 2000);
    } catch (err: unknown) {
      const error = err as Error;
      setMessage({
        type: "error",
        text: error.message || "Failed to reset password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCF9F8] flex flex-col justify-between p-6 select-none">
      {/* Top language selector */}
      <div className="flex items-center justify-between max-w-md mx-auto w-full pt-4">
        <Link href="/welcome" className="flex items-center gap-2">
          <BetterMeLogo size={32} />
        </Link>
        <button
          type="button"
          onClick={() => setLanguage(language === "en" ? "so" : "en")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-[12px] font-bold text-[#101010] shadow-xs"
        >
          <Icon name="translate" size={16} className="text-[#007AFF]" />
          <span>{language === "en" ? "SO" : "EN"}</span>
        </button>
      </div>

      {/* Main Reset Form */}
      <div className="max-w-md mx-auto w-full my-auto py-8">
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-7 shadow-[0_8px_30px_rgba(16,24,40,0.06)] flex flex-col gap-6">
          <div className="text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#007AFF] flex items-center justify-center mb-3">
              <Icon name="lock" size={30} />
            </div>
            <h1 className="text-[22px] font-bold text-[#101010] tracking-tight">
              {language === "so" ? "Daji Furaha Sirta Cusub" : "Set New Password"}
            </h1>
            <p className="text-[13px] text-[#667085] mt-1">
              {language === "so"
                ? "Geli koodhka 6-da god ah ee Resend kuugu soo dirtay iyo furahaaga cusub."
                : "Enter the 6-digit code received via Resend and your new secure password."}
            </p>
          </div>

          {message && (
            <div
              className={`p-4 rounded-2xl text-[13px] font-medium flex items-center gap-2.5 ${
                message.type === "success"
                  ? "bg-[#ECFDF3] text-[#15803D] border border-[#BBF7D0]"
                  : "bg-[#FFF1F0] text-[#B91C1C] border border-[#FECDD3]"
              }`}
            >
              <Icon
                name={message.type === "success" ? "check_circle" : "error"}
                size={20}
              />
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-[12px] font-semibold text-[#667085] block mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 rounded-2xl border border-[#E5E7EB] text-[14px] text-[#101010] focus:border-[#007AFF] outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#667085] block mb-1">
                {t("enter_code")}
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. 849201"
                className="w-full px-4 py-3 rounded-2xl border border-[#E5E7EB] text-[16px] font-mono tracking-widest text-[#101010] text-center focus:border-[#007AFF] outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#667085] block mb-1">
                {t("new_password")}
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-2xl border border-[#E5E7EB] text-[14px] text-[#101010] focus:border-[#007AFF] outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#667085] block mb-1">
                {t("confirm_password")}
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-2xl border border-[#E5E7EB] text-[14px] text-[#101010] focus:border-[#007AFF] outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#007AFF] text-white font-bold text-[14px] hover:bg-[#0069db] active:scale-98 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Icon name="refresh" size={18} className="animate-spin" />
                  <span>{t("btn_saving")}</span>
                </>
              ) : (
                <>
                  <Icon name="verified_user" size={18} />
                  <span>{language === "so" ? "Cusbooneysii Furaha" : "Reset Password"}</span>
                </>
              )}
            </button>
          </form>

          <div className="flex flex-col items-center gap-2 pt-2 border-t border-[#F3F4F6] text-[13px]">
            <Link
              href="/login"
              className="font-semibold text-[#007AFF] hover:underline flex items-center gap-1"
            >
              <Icon name="arrow_back" size={16} />
              <span>{t("back_to_login")}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="text-center text-[12px] text-[#667085]">
        BetterMe &bull; Salama Hub Security
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FCF9F8] flex items-center justify-center text-sm text-gray-500">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
