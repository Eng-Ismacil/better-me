"use client";

import { useEffect } from "react";

// Global listener for beforeinstallprompt so we never miss the event if components mount later
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    (window as unknown as { deferredPrompt?: Event }).deferredPrompt = e;
    window.dispatchEvent(new CustomEvent("pwa-prompt-ready"));
  });

  window.addEventListener("appinstalled", () => {
    (window as unknown as { deferredPrompt?: Event | null }).deferredPrompt = null;
    window.dispatchEvent(new CustomEvent("pwa-installed"));
  });
}

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Register in both dev and prod so PWA install prompt fires
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        if (reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                newWorker.postMessage({ type: "SKIP_WAITING" });
              }
            });
          }
        });
      })
      .catch(() => {
        // Fail silently
      });
  }, []);

  return null;
}
