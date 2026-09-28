"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface InstallContextValue {
  canInstall: boolean;
  installed: boolean;
  install: () => Promise<boolean>;
  dismissFirstPrompt: () => void;
}

const InstallContext = createContext<InstallContextValue | null>(null);
const dismissedKey = "betterme-install-prompt-dismissed";

export function usePwaInstall() {
  const context = useContext(InstallContext);
  if (!context) throw new Error("usePwaInstall must be used within PwaInstallProvider");
  return context;
}

export default function PwaInstallProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && Boolean(navigator.standalone));
    if (standalone) window.setTimeout(() => setInstalled(true), 0);

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!installPrompt) return false;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    if (choice.outcome === "accepted") setInstalled(true);
    return choice.outcome === "accepted";
  }, [installPrompt]);

  const dismissFirstPrompt = useCallback(() => {
    window.localStorage.setItem(dismissedKey, "true");
  }, []);

  return (
    <InstallContext.Provider
      value={{
        canInstall: Boolean(installPrompt),
        installed,
        install,
        dismissFirstPrompt,
      }}
    >
      {children}
    </InstallContext.Provider>
  );
}