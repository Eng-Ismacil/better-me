"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BetterMeLogo from "@/components/brand/BetterMeLogo";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useTranslation();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send reset email");

      const demoCode = typeof data.demoCode === "string" ? data.demoCode : null;
      setMessage({
        type: "success",
        text: demoCode && !data.emailSent
          ? language === "so"
            ? `Email-ka lama dirin; koodhka deegaanka waa ${demoCode}.`
            : `Email could not be sent; your local reset code is ${demoCode}.`
          : language === "so"
            ? "Koodhka dib u dejinta waxaa lagugu soo diray email-kaaga adoo adeegsanaya Resend! Fadlan hubi sanduuqaaga."
            : "Password reset code sent via Resend! Please check your email inbox.",
      });

      setTimeout(() => {
        const params = new URLSearchParams({ email: email.trim() });
        if (demoCode) params.set("code", demoCode);
        router.push(`/reset-password?${params.toString()}`);
      }, 1500);
    } catch (err: unknown) {
      const error = err as Error;
      setMessage({
        type: "error",
        text: error.message || "Failed to send password reset code",
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

      {/* Main Form Box */}
      <div className="max-w-md mx-auto w-full my-auto py-8">
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-7 shadow-[0_8px_30px_rgba(16,24,40,0.06)] flex flex-col gap-6">
          <div className="text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#007AFF] flex items-center justify-center mb-3">
              <Icon name="lock_reset" size={32} />
            </div>
            <h1 className="text-[22px] font-bold text-[#101010] tracking-tight">
              {t("forgot_pw_title")}
            </h1>
            <p className="text-[13px] text-[#667085] mt-1.5 max-w-xs leading-relaxed">
              {t("forgot_pw_desc")}
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
                name={message.type === "success" ? "mark_email_read" : "error"}
                size={20}
              />
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-[12px] font-semibold text-[#667085] block mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. ismacil.dahir@example.com"
                className="w-full px-4 py-3 rounded-2xl border border-[#E5E7EB] text-[14px] text-[#101010] focus:border-[#007AFF] focus:bg-[#FAFCFF] outline-none transition-all placeholder:text-[#9CA3AF]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#007AFF] text-white font-bold text-[14px] hover:bg-[#0069db] active:scale-98 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
            >
              {loading ? (
                <>
                  <Icon name="refresh" size={18} className="animate-spin" />
                  <span>{language === "so" ? "Waa la dirayaa..." : "Sending..."}</span>
                </>
              ) : (
                <>
                  <Icon name="send" size={18} />
                  <span>{t("send_reset_code")}</span>
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

      {/* Footer */}
      <div className="text-center text-[12px] text-[#667085]">
        Powered by Resend &bull; Salama Hub
      </div>
    </div>
  );
}
