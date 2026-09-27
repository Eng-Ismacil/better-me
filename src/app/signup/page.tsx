"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BetterMeLogo from "@/components/brand/BetterMeLogo";
import Icon from "@/components/ui/Icon";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Sign up failed");
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

  return (
    <main className="flex-1 w-full bg-[#FCF9F8] pt-safe pb-safe max-w-lg mx-auto flex flex-col justify-between min-h-screen px-6 py-8">
      {/* Header */}
      <div className="flex flex-col items-center pt-4">
        <BetterMeLogo size={36} />
        <h1 className="text-[24px] font-bold text-[#101010] mt-6 tracking-tight font-[family-name:var(--font-headline)]">
          Join BetterMe
        </h1>
        <p className="text-[14px] text-[#667085] mt-1 text-center">
          Build habits that actually stick with calm consistency
        </p>
      </div>

      {/* Signup Card */}
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
              Full Name
            </label>
            <div className="relative flex items-center">
              <Icon
                name="person"
                size={18}
                className="absolute left-3.5 text-[#717786]"
              />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ismacil Dahir"
                className="w-full h-11 pl-10 pr-3.5 bg-[#f6f3f2] rounded-xl text-[14px] text-[#101010] placeholder:text-[#717786] border border-transparent focus:border-[#007AFF] focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

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
            <label className="text-[13px] font-semibold text-[#101010]">
              Password
            </label>
            <div className="relative flex items-center">
              <Icon
                name="lock"
                size={18}
                className="absolute left-3.5 text-[#717786]"
              />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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
              <span>Create Account</span>
            )}
          </button>
        </form>
      </div>

      {/* Footer Switch to Sign In */}
      <div className="text-center pt-4">
        <p className="text-[13px] text-[#667085]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#007AFF] font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
