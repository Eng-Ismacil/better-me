"use client";

import React from "react";
import BetterMeLogo from "@/components/brand/BetterMeLogo";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";

const androidApkUrl =
  "https://github.com/Eng-Ismacil/better-me/releases/latest/download/BetterMe.apk";

export default function AndroidAppDownloadCard() {
  const { language } = useTranslation();
  const so = language === "so";

  return (
    <a
      href={androidApkUrl}
      aria-label={so ? "Soo degso BetterMe Android app" : "Download the BetterMe Android app"}
      className="flex items-center gap-3 rounded-xl border border-[#CDE6DC] bg-[#F0FAF6] p-3.5 transition-colors hover:bg-[#E8F6F0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#168A67] md:hidden"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
        <BetterMeLogo variant="symbol" size={30} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-extrabold text-[#145C46]">
          {so ? "Soo degso BetterMe app" : "Download BetterMe app"}
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-[#527568]">
          {so ? "App Android ah oo icon leh" : "Native Android app · APK"}
        </span>
      </span>
      <Icon name="download" size={19} className="shrink-0 text-[#168A67]" />
    </a>
  );
}