"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import PrimaryButton from "@/components/auth/PrimaryButton";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const { language } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 2FA state
  const [needs2FA, setNeeds2FA] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed. Please check your credentials.");
      }

      if (data.requiresTwoFactor) {
        setTwoFactorToken(data.twoFactorToken);
        setNeeds2FA(true);
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => otpRefs.current[0]?.focus(), 150);
        return;
      }

      router.push(data.redirect || "/home");
      router.refresh();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length < 6) {
      setError(
        language === "so"
          ? "Fadlan geli dhammaan 6-da lambar ee koodhka"
          : "Please enter the complete 6-digit code"
      );
      return;
    }

    setError("");
    setVerifying(true);
    try {
      const res = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: twoFactorToken, otp: fullOtp }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid 2FA code");
      }

      router.push(data.redirect || "/home");
      router.refresh();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Failed to verify 2FA code");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <AuthLayout
      showLanguageToggle={true}
      showBackLink={true}
      backHref="/welcome"
      maxWidth="sm"
    >
      <div className="flex flex-col gap-6 animate-in fade-in duration-300">
        {/* Title & Subtitle Header */}
        <div className="flex flex-col gap-1.5 text-center sm:text-left">
          <h1 className="text-[26px] sm:text-[28px] font-extrabold text-[#111827] tracking-tight font-[family-name:var(--font-headline)]">
            {needs2FA
              ? language === "so"
                ? "Xaqiijinta Amniga (2FA)"
                : "Two-Factor Authentication"
              : language === "so"
              ? "Ku soo dhawoow"
              : "Welcome back"}
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[#667085] leading-relaxed">
            {needs2FA
              ? language === "so"
                ? "Koodh 6-lambar ah ayaa loo diray email-kaaga."
                : "Enter the 6-digit verification code sent to your email."
              : language === "so"
              ? "Sii wad horumarkaaga caadooyinka BetterMe."
              : "Continue your mindful momentum with BetterMe."}
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#EF4444]/25 text-[#EF4444] text-[13px] font-semibold flex items-center gap-2.5 animate-in fade-in">
            <Icon name="error" size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 2FA OTP SCREEN */}
        {needs2FA ? (
          <form onSubmit={handleVerify2FA} className="flex flex-col gap-5">
            <div className="bg-white rounded-2xl border border-[#E7ECF3] p-5 shadow-2xs flex flex-col gap-4">
              <label className="text-[13px] font-bold text-[#111827] text-center block">
                {language === "so" ? "Koodhka Xaqiijinta" : "Verification Code"}
              </label>

              {/* 6 Digit OTP Inputs */}
              <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-13 text-center text-[22px] font-black bg-[#FAFBFD] border border-[#E7ECF3] rounded-xl focus:border-[#0B6EF3] focus:bg-white focus:ring-3 focus:ring-[#0B6EF3]/15 outline-none transition-all"
                  />
                ))}
              </div>
            </div>

            <PrimaryButton type="submit" loading={verifying}>
              {language === "so" ? "Xaqiiji & Gal" : "Verify & Continue"}
            </PrimaryButton>

            <button
              type="button"
              onClick={() => setNeeds2FA(false)}
              className="text-[13px] text-[#667085] hover:text-[#111827] text-center font-semibold transition-colors"
            >
              {language === "so" ? "← Ku noqo gelitaanka" : "← Back to Login"}
            </button>
          </form>
        ) : (
          /* STANDARD PRODUCTION LOGIN FORM */
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Integrated Card Container */}
            <div className="bg-white rounded-2xl border border-[#E7ECF3] p-5 sm:p-6 shadow-2xs flex flex-col gap-4">
              {/* Email Field */}
              <AuthInput
                label={language === "so" ? "Cinwaanka Email-ka" : "Email Address"}
                iconName="mail"
                type="email"
                required
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* Password Field */}
              <AuthInput
                label={language === "so" ? "Furaha Sirta ah" : "Password"}
                iconName="lock"
                isPassword={true}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                rightElement={
                  <Link
                    href="/forgot-password"
                    className="text-[12px] text-[#0B6EF3] hover:underline font-bold"
                  >
                    {language === "so" ? "Ma ilowday?" : "Forgot?"}
                  </Link>
                }
              />
            </div>

            {/* Primary Action Button */}
            <PrimaryButton type="submit" loading={loading}>
              {language === "so" ? "Gal Akoonka (Sign In)" : "Sign In"}
            </PrimaryButton>
          </form>
        )}

        {/* Footer Link */}
        {!needs2FA && (
          <p className="text-[13px] text-center text-[#667085] mt-1">
            {language === "so" ? "Miyaadan lahayn akoon? " : "Don't have an account? "}
            <Link
              href="/signup"
              className="text-[#0B6EF3] font-bold hover:underline"
            >
              {language === "so" ? "Abuur Hadda" : "Create one now"}
            </Link>
          </p>
        )}
      </div>
    </AuthLayout>
  );
}
