"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import PrimaryButton from "@/components/auth/PrimaryButton";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";

export default function SignUpPage() {
  const router = useRouter();
  const { language } = useTranslation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError(
        language === "so"
          ? "Furaha sirta ah waa inuu ka koobnaadaa ugu yaraan 6 xaraf"
          : "Password must be at least 6 characters long"
      );
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Sign up failed");
      }

      router.push("/home");
      router.refresh();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Failed to create account");
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
        body: JSON.stringify({
          email: "ismacil.dahir@example.com",
          password: "password123",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Demo login failed");

      router.push("/home");
      router.refresh();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Failed to log in as demo user");
    } finally {
      setDemoLoading(false);
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
            {language === "so"
              ? "Abuur Akoonkaaga"
              : "Create your account"}
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[#667085] leading-relaxed">
            {language === "so"
              ? "Ku bilow dhisidda caadooyin fiican, maalin kasta."
              : "Start building better habits, one day at a time."}
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#EF4444]/25 text-[#EF4444] text-[13px] font-semibold flex items-center gap-2.5 animate-in fade-in">
            <Icon name="error" size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-[#E7ECF3] p-5 sm:p-6 shadow-2xs flex flex-col gap-4">
            {/* Name Field */}
            <AuthInput
              label={language === "so" ? "Magacaaga Oo Buuxa" : "Full Name"}
              iconName="person"
              type="text"
              required
              autoComplete="name"
              placeholder="e.g. Ismacil Dahir"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

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

            {/* Password Field with Live 6+ Requirements */}
            <AuthInput
              label={language === "so" ? "Furaha Sirta ah" : "Password"}
              iconName="lock"
              isPassword={true}
              showRequirements={true}
              required
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Primary Submit Button */}
          <PrimaryButton type="submit" loading={loading}>
            {language === "so" ? "Abuur Akoon (Create Account)" : "Create Account"}
          </PrimaryButton>

          {/* Subtle Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-[#E7ECF3]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              {language === "so" ? "ama" : "or"}
            </span>
            <div className="flex-1 h-px bg-[#E7ECF3]" />
          </div>

          {/* Secondary Action: Demo Account */}
          <PrimaryButton
            type="button"
            variant="secondary"
            loading={demoLoading}
            onClick={handleDemoLogin}
          >
            <Icon name="bolt" size={17} className="text-[#0B6EF3]" />
            <span>
              {language === "so"
                ? "Ku tijaabi Akoonka Demo-ga"
                : "Explore with Demo Account"}
            </span>
          </PrimaryButton>
        </form>

        {/* Footer Link */}
        <p className="text-[13px] text-center text-[#667085] mt-1">
          {language === "so" ? "Miyaad leedahay akoon hore? " : "Already have an account? "}
          <Link
            href="/login"
            className="text-[#0B6EF3] font-bold hover:underline"
          >
            {language === "so" ? "Gal Akoonka" : "Sign in"}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
