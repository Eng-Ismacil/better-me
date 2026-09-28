"use client";

import React, { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function InstallAppButton() {
  const { language } = useTranslation();
  const so = language === "so";
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setInstructionsOpen(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) {
      setInstructionsOpen((open) => !open);
      return;
    }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setInstallPrompt(null);
  };

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
          disabled={installed}
          className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#168A67] px-3 text-[11px] font-bold text-white disabled:bg-[#EAF8F2] disabled:text-[#168A67]"
        >
          <Icon name={installed ? "check" : "download"} size={15} />
          {installed ? (so ? "La rakibay" : "Installed") : so ? "Rakib" : "Install"}
        </button>
      </div>
      {instructionsOpen && !installed && (
        <div className="mt-3 rounded-lg border border-[#E7ECF3] bg-[#FAFBFD] p-3 text-[11px] leading-5 text-[#475467]">
          <p className="font-bold text-[#111827]">
            {so ? "Ku rakib browser-kaaga" : "Install from your browser"}
          </p>
          <p className="mt-1">
            {so
              ? "Android: fur menu-ga browser-ka oo dooro Install app ama Add to Home screen. iPhone: Share → Add to Home Screen."
              : "Android: open your browser menu and choose Install app or Add to Home screen. iPhone: Share → Add to Home Screen."}
          </p>
        </div>
      )}
    </div>
  );
}