"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PwaInstallCard() {
  const { language } = useTranslation();
  const so = language === "so";

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Check if already running in standalone webview/PWA mode
    const standaloneMatch = window.matchMedia("(display-mode: standalone)").matches;
    const navigatorStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone;
    if (standaloneMatch || navigatorStandalone) {
      setIsStandalone(true);
      return;
    }

    // Check if dismissed previously in session
    if (sessionStorage.getItem("betterme_pwa_dismissed") === "true") {
      setIsDismissed(true);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isAppleDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstallPrompt(null);
      }
    } else if (isIos) {
      setShowIosGuide(true);
    } else {
      // Direct Chrome / Android fallback instruction
      alert(
        so
          ? "Si aad appka u rakibto: Taabo saddexda dhibcood ee browserka (⋮) kaddibna dooro 'Install app' ama 'Add to Home screen'."
          : "To install: Tap the browser menu (⋮) and select 'Install app' or 'Add to Home screen'."
      );
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    sessionStorage.setItem("betterme_pwa_dismissed", "true");
  };

  // Do not show if already in standalone app mode or dismissed
  if (isStandalone || isDismissed) {
    return null;
  }

  return (
    <>
      <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] flex items-center justify-between gap-3 transition-all">
        {/* App Icon */}
        <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-2xs border border-slate-100 bg-[#FCF9F8] flex items-center justify-center">
          <Image
            src="/icon-192.png"
            alt="BetterMe Icon"
            width={44}
            height={44}
            className="object-cover"
            priority
          />
        </div>

        {/* Content */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="text-[14px] font-bold text-[#0F172A] tracking-tight">
              BetterMe App
            </h4>
            <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-[#0B6EF3] text-[10px] font-extrabold uppercase tracking-wide">
              PWA
            </span>
          </div>
          <p className="text-[12px] text-[#64748B] truncate mt-0.5">
            {so
              ? "Ku shub shaashadda · Standalone Webview"
              : "Install to phone · Fullscreen app mode"}
          </p>
        </div>

        {/* Action Button & Dismiss */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] active:scale-95 text-white text-[12px] font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
          >
            <Icon name="download" size={15} />
            <span>{so ? "Ku shub" : "Install"}</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      </div>

      {/* iOS Safari Instruction Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-6 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100 shadow-2xs">
                  <Image
                    src="/icon-192.png"
                    alt="BetterMe Icon"
                    width={40}
                    height={40}
                  />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-slate-900">
                    {so ? "Ku shub iPhone-kaaga" : "Install on iPhone"}
                  </h4>
                  <p className="text-[11px] text-slate-500">BetterMe Web App</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3 py-1 text-[13px] text-slate-700">
              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl">
                <span className="w-6 h-6 rounded-full bg-[#0B6EF3] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <p>
                  {so
                    ? "Taabo badhanka 'Share' ee biraawsarka Safari (calaamadda sanduuqa leh falaarta kor u socota ⎋)."
                    : "Tap the 'Share' icon at the bottom of Safari (box with upward arrow ⎋)."}
                </p>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl">
                <span className="w-6 h-6 rounded-full bg-[#0B6EF3] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <p>
                  {so
                    ? "Hoos u rog liiska, kaddibna dooro 'Add to Home Screen' (Ku dar Shaashadda Guriga ⊕)."
                    : "Scroll down the share sheet and tap 'Add to Home Screen' ⊕."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full py-3 rounded-full bg-[#0F172A] text-white text-[13px] font-bold hover:bg-[#1E293B] transition-colors"
            >
              {so ? "Waan fahmay" : "Got it"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
