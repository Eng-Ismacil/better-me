"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import WelcomeIllustration from "@/components/auth/WelcomeIllustration";
import BenefitItem from "@/components/auth/BenefitItem";
import PrimaryButton from "@/components/auth/PrimaryButton";
import PwaInstallCard from "@/components/pwa/PwaInstallCard";
import { useTranslation } from "@/lib/i18n";

export default function WelcomeClient() {
  const { language } = useTranslation();
  const router = useRouter();

  // Client-side fallback check: if cookie session exists, redirect to home
  useEffect(() => {
    if (typeof document !== "undefined") {
      const hasCookie = document.cookie.includes("betterme_session=");
      if (hasCookie) {
        router.replace("/home");
      }
    }
  }, [router]);

  const benefits = [
    {
      title: language === "so" ? "Falanqayn Caqli leh" : "Smart habit insights",
      subtitle: language === "so" ? "Xogta horumarka" : "Health score & trends",
      icon: "auto_graph",
      color: "#0B6EF3",
    },
    {
      title: language === "so" ? "Habayn Deggan" : "Calm routine planning",
      subtitle: language === "so" ? "Subax & habeen" : "Morning & evening stacks",
      icon: "spa",
      color: "#20C773",
    },
    {
      title: language === "so" ? "Dardarta Streak-ka" : "Streak recovery",
      subtitle: language === "so" ? "Ha jabin guusha" : "Never miss twice",
      icon: "cached",
      color: "#8B5CF6",
    },
  ];

  return (
    <AuthLayout showLanguageToggle={true} showBackLink={false} maxWidth="sm">
      <div className="flex flex-col items-center text-center animate-in fade-in duration-300">
        {/* Small Eyebrow Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#0B6EF3]/20 text-[#0B6EF3] text-[11px] font-extrabold uppercase tracking-wider mb-1 select-none">
          <span className="w-2 h-2 rounded-full bg-[#0B6EF3] animate-pulse" />
          <span>
            {language === "so"
              ? "HORUMAR CAADO WALBA"
              : "PROGRESS IN EVERY HABIT"}
          </span>
        </div>

        {/* Hero Purpose-Built Habit Growth Illustration */}
        <WelcomeIllustration />

        {/* Strong Headline */}
        <h1 className="text-[28px] sm:text-[32px] font-extrabold text-[#111827] tracking-tight leading-[1.15] font-[family-name:var(--font-headline)] mt-2">
          {language === "so" ? (
            <>
              Dhis caadooyin <br />
              <span className="text-[#0B6EF3]">dhab ahaan waara.</span>
            </>
          ) : (
            <>
              Build habits that <br />
              <span className="text-[#0B6EF3]">actually stick.</span>
            </>
          )}
        </h1>

        {/* Supporting Copy */}
        <p className="text-[13px] sm:text-[14px] text-[#667085] mt-2 max-w-[320px] leading-relaxed">
          {language === "so"
            ? "Tallaabooyin yaryar oo joogto ah waxay keenaan isbeddel macno leh. Dhis jadwalkaaga oo si cad ula soco guushaada."
            : "Small consistent actions create meaningful change. Build healthy routines and track your daily progress with clarity."}
        </p>

        {/* 3 Compact Benefit Cards */}
        <div className="grid grid-cols-3 gap-2 w-full mt-4 mb-6">
          {benefits.map((b, idx) => (
            <BenefitItem
              key={idx}
              icon={b.icon}
              title={b.title}
              subtitle={b.subtitle}
              highlightColor={b.color}
            />
          ))}
        </div>

        {/* Primary CTA and Secondary Link */}
        <div className="flex flex-col w-full gap-2.5">
          <Link href="/signup" className="w-full">
            <PrimaryButton iconName="arrow_forward">
              {language === "so" ? "Bilow Hadda (Get Started)" : "Get Started"}
            </PrimaryButton>
          </Link>

          <Link
            href="/login"
            className="text-[13px] text-[#667085] hover:text-[#111827] font-medium py-1.5 transition-colors"
          >
            {language === "so" ? "Miyaad akoon leedahay? " : "Already have an account? "}
            <span className="text-[#0B6EF3] font-bold hover:underline">
              {language === "so" ? "Gal Akoonka" : "Sign in"}
            </span>
          </Link>
        </div>

        {/* Active PWA Install Banner */}
        <div className="mt-4 w-full">
          <PwaInstallCard variant="welcome" />
        </div>
      </div>
    </AuthLayout>
  );
}
