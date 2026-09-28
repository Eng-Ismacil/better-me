"use client";

import React from "react";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";
import { usePwaInstall } from "@/components/ui/PwaInstallProvider";

export default function InstallAppButton() {
  const { language } = useTranslation();
  const so = language === "so";
  const { canInstall, installed, install } = usePwaInstall();

  return (
    <div className="border-t border-[#F0F2F5] pt-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF8F2] text-[#168A67]">
            <Icon name="install_mobile" size={19} />
          </div>
          <div className="min-w-0">
            <span className="block text-[13px] font-bold text-[#111827]">
              {so ? "Ku rakib BetterMe" : "Install BetterMe"}
            </span>
            <span className="block truncate text-[11px] text-[#667085]">
              {so ? "Ku dar shaashadda telefoonkaaga" : "Add the branded app to your device"}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void install()}
          disabled={installed || !canInstall}
          className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#168A67] px-3 text-[11px] font-bold text-white disabled:bg-[#EAF8F2] disabled:text-[#168A67]"
        >
          <Icon name={installed ? "check" : "download"} size={15} />
          {installed ? (so ? "La rakibay" : "Installed") : so ? "Rakib" : "Install"}
        </button>
      </div>
    </div>
  );
}