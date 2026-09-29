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
  const [isStandalone, setIsStandalone] = useState(true); // hidden by default — shown only after env check
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [installing, setInstalling] = useState(false);
  // promptReady: true = we have a real install prompt OR on iOS; false = browser can't install
  const [promptReady, setPromptReady] = useState(false);

  useEffect(() => {
    // Already running as installed PWA / WebView standalone — hide permanently
    const standaloneMedia = window.matchMedia("(display-mode: standalone)").matches;
    const iosSA = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standaloneMedia || iosSA) {
      setIsStandalone(true);
      return;
    }
    setIsStandalone(false);

    // Previously dismissed this session
    if (sessionStorage.getItem("bm_pwa_dismissed") === "1") {
      setIsDismissed(true);
      return;
    }

    // Detect iOS Safari (no beforeinstallprompt — use manual guide instead)
    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua) && !/(chrome|android)/.test(ua);
    setIsIos(ios);
    if (ios) {
      // On iOS we can always show the guide
      setPromptReady(true);
    }

    // Capture the browser's native install prompt (Chrome / Edge / Samsung)
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setPromptReady(true); // now we have a real prompt — show card
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (installing) return;

    if (installPrompt) {
      // Native browser install dialog — no alert, direct prompt
      setInstalling(true);
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      setInstalling(false);
      if (outcome === "accepted") {
        setInstallPrompt(null);
        setIsStandalone(true); // hide card — app is installed
      }
    } else if (isIos) {
      // iOS Safari: show step-by-step modal
      setShowIosGuide(true);
    }
    // No alert fallback — if neither condition is met, button shouldn't be visible
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    sessionStorage.setItem("bm_pwa_dismissed", "1");
  };

  // Hide if already installed (standalone) or dismissed or no install mechanism available
  if (isStandalone || isDismissed || !promptReady) return null;

  return (
    <>
      {/* Install Banner */}
      <div className="w-full bg-gradient-to-r from-[#0B6EF3]/[0.06] to-transparent border border-[#0B6EF3]/20 rounded-2xl p-3.5 flex items-center gap-3 shadow-[0_2px_12px_-4px_rgba(11,110,243,0.12)] transition-all">
        {/* App Icon */}
        <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm shrink-0 bg-white">
          <Image
            src="/icon-192.png"
            alt="BetterMe"
            width={48}
            height={48}
            className="object-cover w-full h-full"
            priority
          />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-extrabold text-[#0F172A] tracking-tight">BetterMe</p>
          <p className="text-[12px] text-[#64748B] mt-0.5 truncate">
            {so ? "Ku rakib taleefankaaga · Bilaash" : "Install on your phone · Free"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstall}
            disabled={installing}
            className="px-4 py-1.5 rounded-full bg-[#0B6EF3] hover:bg-[#0957C3] active:scale-95 disabled:opacity-70 text-white text-[12px] font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            {installing ? (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Icon name="download" size={14} />
            )}
            <span>{so ? "Rakib" : "Install"}</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      </div>

      {/* iOS Guide Modal */}
      {showIosGuide && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowIosGuide(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                  <Image src="/icon-192.png" alt="BetterMe" width={44} height={44} />
                </div>
                <div>
                  <h4 className="text-[15px] font-extrabold text-slate-900">
                    {so ? "Ku rakib iPhone-kaaga" : "Add to iPhone"}
                  </h4>
                  <p className="text-[11px] text-slate-500">BetterMe</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {/* Steps */}
            <div className="flex flex-col gap-3">
              {[
                so
                  ? "Taabo badhanka «Share» (sanduuq + fallaar kor) ee hoose Safari"
                  : "Tap the Share button (box + arrow up) at the bottom of Safari",
                so
                  ? "Dooro «Add to Home Screen» oo taabo «Add»"
                  : "Select «Add to Home Screen», then tap «Add»",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl">
                  <span className="w-6 h-6 rounded-full bg-[#0B6EF3] text-white text-[11px] font-extrabold flex items-center justify-center shrink-0 mt-px">
                    {i + 1}
                  </span>
                  <p className="text-[13px] text-slate-700 leading-snug">{step}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full py-3 rounded-full bg-[#0F172A] text-white text-[13px] font-bold hover:bg-[#1E293B] transition-colors cursor-pointer"
            >
              {so ? "Waan fahmay ✓" : "Got it ✓"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
