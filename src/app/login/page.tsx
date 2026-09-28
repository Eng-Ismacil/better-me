"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BetterMeLogo from "@/components/brand/BetterMeLogo";
import Icon from "@/components/ui/Icon";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  // 2FA state
  const [needs2FA, setNeeds2FA] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [devOtp, setDevOtp] = useState<string | undefined>(undefined);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.requiresTwoFactor) {
        // Admin 2FA required
        setTwoFactorToken(data.twoFactorToken);
        setDevOtp(data.devOtp);
        setNeeds2FA(true);
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
        return;
      }

      router.push(data.redirect || "/home");
      router.refresh();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Something went wrong");
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
    e.preventDefault();
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { setError("Please enter the complete 6-digit code"); return; }
    setVerifying(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: twoFactorToken, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      router.push(data.redirect || "/home");
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setVerifying(false);
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setDemoLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDemo: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Demo login failed");
      }

      router.push("/home");
      router.refresh();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Failed to start demo session");
    } finally {
      setDemoLoading(false);
    }
  };

  // ====== 2FA Screen ======
  if (needs2FA) {
    return (
      <main className="flex-1 w-full bg-[#FCF9F8] pt-safe pb-safe max-w-lg mx-auto flex flex-col justify-between min-h-screen px-6 py-8">
        <div className="flex flex-col items-center pt-4">
          <BetterMeLogo size={36} />
          <div className="mt-6 w-14 h-14 rounded-full bg-[#0B6EF3]/10 border border-[#0B6EF3]/20 flex items-center justify-center">
            <Icon name="shield_lock" size={28} className="text-[#0B6EF3]" />
          </div>
          <h1 className="text-[22px] font-bold text-[#101010] mt-4 tracking-tight">
            Admin Verification
          </h1>
          <p className="text-[14px] text-[#667085] mt-1 text-center max-w-xs">
            A 6-digit code was sent to <span className="font-semibold text-[#101010]">{email}</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7EB] my-auto">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-[#ffdad6]/50 border border-[#ffdad6] text-[#EF4444] text-[13px] flex items-center gap-2">
              <Icon name="error" size={18} />
              <span>{error}</span>
            </div>
          )}

          {devOtp && (
            <div className="mb-4 p-3 rounded-xl bg-[#FFF7ED] border border-[#FDE68A] text-[#D97706] text-[13px] flex items-center gap-2">
              <Icon name="developer_mode" size={18} />
              <span>Dev mode OTP: <strong className="font-mono text-[16px] tracking-widest">{devOtp}</strong></span>
            </div>
          )}

          <form onSubmit={handleVerify2FA} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <p className="text-[13px] font-semibold text-[#101010] text-center">Enter verification code</p>
              <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={`w-11 h-14 text-center text-[22px] font-bold rounded-xl border-2 bg-[#f6f3f2] outline-none transition-all ${
                      digit ? "border-[#0B6EF3] bg-[#EFF6FF] text-[#0B6EF3]" : "border-[#E5E7EB] text-[#101010]"
                    } focus:border-[#0B6EF3] focus:bg-[#EFF6FF]`}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={verifying || otp.join("").length < 6}
              className="w-full h-[48px] bg-[#0B6EF3] text-white rounded-full font-semibold text-[14px] flex items-center justify-center gap-2 hover:bg-[#0958c7] active:scale-[0.98] transition-all shadow-xs disabled:opacity-60"
            >
              {verifying ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Icon name="verified_user" size={18} />
                  <span>Verify & Sign In</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setNeeds2FA(false); setError(""); }}
              className="text-center text-[13px] text-[#667085] hover:text-[#101010] transition-colors"
            >
              ← Back to login
            </button>
          </form>
        </div>

        <div className="text-center pt-4">
          <p className="text-[12px] text-[#667085]">
            Didn&apos;t receive the code? Check your spam folder or{" "}
            <button
              type="button"
              onClick={handleSubmit.bind(null, { preventDefault: () => {} } as React.FormEvent)}
              className="text-[#007AFF] font-semibold hover:underline"
            >
              resend
            </button>
          </p>
        </div>
      </main>
    );
  }

  // ====== Normal Login Screen ======
  return (
    <main className="flex-1 w-full bg-[#FCF9F8] pt-safe pb-safe max-w-lg mx-auto flex flex-col justify-between min-h-screen px-6 py-8">
      {/* Header */}
      <div className="flex flex-col items-center pt-4">
        <BetterMeLogo size={36} />
        <h1 className="text-[24px] font-bold text-[#101010] mt-6 tracking-tight font-[family-name:var(--font-headline)]">
          Welcome back
        </h1>
        <p className="text-[14px] text-[#667085] mt-1 text-center">
          Continue your mindful momentum with BetterMe
        </p>
      </div>

      {/* Login Card Form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7EB] my-auto">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#ffdad6]/50 border border-[#ffdad6] text-[#EF4444] text-[13px] flex items-center gap-2">
            <Icon name="error" size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#101010]">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Icon
                name="mail"
                size={18}
                className="absolute left-3.5 text-[#717786]"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-11 pl-10 pr-3.5 bg-[#f6f3f2] rounded-xl text-[14px] text-[#101010] placeholder:text-[#717786] border border-transparent focus:border-[#007AFF] focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-semibold text-[#101010]">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[12px] text-[#007AFF] hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative flex items-center">
              <Icon
                name="lock"
                size={18}
                className="absolute left-3.5 text-[#717786]"
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-3.5 bg-[#f6f3f2] rounded-xl text-[14px] text-[#101010] placeholder:text-[#717786] border border-transparent focus:border-[#007AFF] focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[48px] mt-2 bg-[#007AFF] text-white rounded-full font-semibold text-[14px] flex items-center justify-center gap-2 hover:bg-[#0070eb] active:scale-[0.98] transition-all shadow-xs"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="relative my-5 flex items-center justify-center">
          <div className="w-full border-t border-[#E5E7EB]" />
          <span className="absolute bg-white px-3 text-[12px] text-[#717786]">
            or explore
          </span>
        </div>

        {/* 1-Click Demo Login with Stitch Persona */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={demoLoading}
          className="w-full h-[46px] bg-[#EFF6FF] border border-[#d8e2ff] text-[#007AFF] rounded-full font-semibold text-[13px] flex items-center justify-center gap-2 hover:bg-[#d8e2ff]/50 active:scale-[0.98] transition-all"
        >
          <Icon name="verified" size={17} className="text-[#007AFF]" />
          {demoLoading ? (
            <span>Preparing Persona...</span>
          ) : (
            <span>Sign In as Demo User (Ismacil Dahir)</span>
          )}
        </button>
      </div>

      {/* Footer Switch to Sign Up */}
      <div className="text-center pt-4">
        <p className="text-[13px] text-[#667085]">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-[#007AFF] font-semibold hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
