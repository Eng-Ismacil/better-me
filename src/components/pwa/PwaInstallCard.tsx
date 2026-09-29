"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface PwaInstallCardProps {
  /** If true, shows on page even if browser install event is still pending */
  variant?: "default" | "welcome";
}

export default function PwaInstallCard({ variant = "default" }: PwaInstallCardProps) {
  const { language } = useTranslation();
  const so = language === "so";

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(true); // hidden by default until client check
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [promptReady, setPromptReady] = useState(false);

  useEffect(() => {
    // 1. Detect if already running as installed PWA / standalone
    const standaloneMedia = window.matchMedia("(display-mode: standalone)").matches;
    const iosSA = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standaloneMedia || iosSA) {
      setIsStandalone(true);
      return;
    }
    setIsStandalone(false);

    // 2. Check dismissal state
    if (sessionStorage.getItem("bm_pwa_dismissed") === "1") {
      setIsDismissed(true);
    }

    // 3. Detect iOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua) && !/(chrome|android)/.test(ua);
    setIsIos(ios);
    if (ios) {
      setPromptReady(true);
    }

    // 4. Check globally captured prompt from PwaRegister
    const globalPrompt = (window as unknown as { deferredPrompt?: BeforeInstallPromptEvent }).deferredPrompt;
    if (globalPrompt) {
      setInstallPrompt(globalPrompt);
      setPromptReady(true);
    }

    // 5. Listen for prompt events
    const onPromptReady = () => {
      const p = (window as unknown as { deferredPrompt?: BeforeInstallPromptEvent }).deferredPrompt;
      if (p) {
        setInstallPrompt(p);
        setPromptReady(true);
      }
    };

    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      (window as unknown as { deferredPrompt?: BeforeInstallPromptEvent }).deferredPrompt = promptEvent;
      setInstallPrompt(promptEvent);
      setPromptReady(true);
    };

    const onInstalled = () => {
      setIsStandalone(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("pwa-prompt-ready", onPromptReady);
    window.addEventListener("pwa-installed", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("pwa-prompt-ready", onPromptReady);
      window.removeEventListener("pwa-installed", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (installing) return;

    let activePrompt = installPrompt || (window as unknown as { deferredPrompt?: BeforeInstallPromptEvent }).deferredPrompt;

    if (!activePrompt && !isIos) {
      // Brief grace period to see if deferredPrompt just arrived
      setInstalling(true);
      await new Promise((r) => setTimeout(r, 400));
      activePrompt = (window as unknown as { deferredPrompt?: BeforeInstallPromptEvent }).deferredPrompt;
      setInstalling(false);
    }

    if (activePrompt) {
      setInstalling(true);
      try {
        await activePrompt.prompt();
        const { outcome } = await activePrompt.userChoice;
        if (outcome === "accepted") {
          setInstallPrompt(null);
          (window as unknown as { deferredPrompt?: null }).deferredPrompt = null;
          setIsStandalone(true);
        }
      } catch {
        // Ignored
      } finally {
        setInstalling(false);
      }
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    sessionStorage.setItem("bm_pwa_dismissed", "1");
  };

  // If already standalone (installed app) or dismissed, hide
  if (isStandalone || isDismissed) return null;

  // For default variant, require prompt to be ready; for welcome page, always show to replace old APK button
  if (variant !== "welcome" && !promptReady) return null;

  return (
    <>
      {/* Install Banner */}
      <div className="w-full bg-gradient-to-r from-[#0B6EF3]/[0.08] to-[#EFF6FF] border border-[#0B6EF3]/25 rounded-2xl p-3.5 flex items-center gap-3 shadow-[0_2px_14px_-3px_rgba(11,110,243,0.15)] transition-all">
        {/* App Icon */}
        <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm shrink-0 bg-white p-0.5">
          <Image
            src="/icon-192.png"
            alt="BetterMe"
            width={48}
            height={48}
            className="object-cover w-full h-full rounded-[14px]"
            priority
          />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5">
            <p className="text-[14px] font-extrabold text-[#0F172A] tracking-tight">BetterMe</p>
            <span className="text-[10px] font-bold bg-[#0B6EF3]/10 text-[#0B6EF3] px-1.5 py-0.5 rounded-full">
              PWA App
            </span>
          </div>
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
            className="px-4 py-2 rounded-full bg-[#0B6EF3] hover:bg-[#0957C3] active:scale-95 disabled:opacity-70 text-white text-[12px] font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            {installing ? (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Icon name="download" size={15} />
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
            className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl overflow-hidden border border-slate-100 shadow-sm p-0.5">
                  <Image src="/icon-192.png" alt="BetterMe" width={44} height={44} className="rounded-xl" />
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
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors"
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
