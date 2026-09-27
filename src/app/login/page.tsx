"use client";

import React, { useState } from "react";
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

      router.push("/home");
      router.refresh();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
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
