"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * NativeBackButton
 * Handles the Android hardware back button when running inside a Capacitor
 * WebView. If Capacitor is not available (e.g. plain PWA in browser) the
 * component is a no-op, so it is safe to render everywhere.
 *
 * The /* webpackIgnore: true *\/ magic comment tells both webpack and
 * Turbopack to skip bundling these imports — they only resolve at runtime
 * inside a Capacitor native shell.
 */
export default function NativeBackButton() {
  const router = useRouter();

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    void (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore – capacitor packages only present in native build
        const [{ Capacitor }, { App }] = await Promise.all([
          import(/* webpackIgnore: true */ "@capacitor/core" as string),
          import(/* webpackIgnore: true */ "@capacitor/app" as string),
        ]);

        if (!Capacitor.isNativePlatform()) return;

        let disposed = false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handle = await App.addListener("backButton", ({ canGoBack }: { canGoBack: boolean }) => {
          if (canGoBack) router.back();
          else void App.exitApp();
        });

        if (disposed) void handle.remove();

        cleanup = () => {
          disposed = true;
          void handle.remove();
        };
      } catch {
        // Capacitor not installed — silently ignore (expected in plain PWA / browser)
      }
    })();

    return () => cleanup?.();
  }, [router]);

  return null;
}