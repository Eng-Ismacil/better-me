"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import BetterMeLogo from "@/components/brand/BetterMeLogo";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";
import { usePwaInstall } from "@/components/ui/PwaInstallProvider";

export default function FirstInstallPrompt() {
  const pathname = usePathname();
  const { language } = useTranslation();
  const so = language === "so";
  const { canInstall, installed, install, dismissFirstPrompt } = usePwaInstall();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const dismissed = window.localStorage.getItem("betterme-install-prompt-dismissed");
      setVisible(pathname === "/home" && !dismissed && !installed);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname, installed]);

  if (!visible || installed) return null;

  const handleInstall = async () => {
    const accepted = await install();
    if (accepted) setVisible(false);
  };

  const dismiss = () => {
    dismissFirstPrompt();
    setVisible(false);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#111827]/45 p-4 backdrop-blur-[2px]">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-betterme-title"
        className="w-full max-w-sm rounded-2xl border border-[#E3EAF2] bg-white p-6 shadow-[0_24px_72px_rgba(16,24,40,0.24)]"
      >
        <div className="flex items-start justify-between gap-3">
          <BetterMeLogo size={38} />
          <button
            type="button"
            onClick={dismiss}
            aria-label={so ? "Xir" : "Close"}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#667085] hover:bg-[#F3F4F6]"
          >
            <Icon name="close" size={19} />
          </button>
        </div>
        <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF8F2] text-[#168A67]">
          <Icon name="install_mobile" size={25} />
        </div>
        <h2 id="install-betterme-title" className="mt-4 text-[20px] font-extrabold text-[#111827]">
          {so ? "Ku rakib BetterMe" : "Install BetterMe"}
        </h2>
        <p className="mt-2 text-[13px] leading-5 text-[#667085]">
          {so
            ? "BetterMe ku dar shaashaddaada si aad dhaqso ugu furato."
            : "Add BetterMe to your home screen for a faster, app-like launch."}
        </p>
        {!canInstall && (
          <p className="mt-3 text-[11px] text-[#98A2B3]">
            {so ? "Install-ku wuxuu u baahan yahay browser taageera." : "Install is not available in this browser."}
          </p>
        )}
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={dismiss}
            className="min-h-11 flex-1 rounded-lg border border-[#D0D5DD] text-[12px] font-bold text-[#475467]"
          >
            {so ? "Hadda maya" : "Not now"}
          </button>
          <button
            type="button"
            onClick={() => void handleInstall()}
            disabled={!canInstall}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#168A67] text-[12px] font-bold text-white disabled:cursor-not-allowed disabled:bg-[#98A2B3]"
          >
            <Icon name="download" size={16} />
            {so ? "Rakib" : "Install"}
          </button>
        </div>
      </section>
    </div>
  );
}