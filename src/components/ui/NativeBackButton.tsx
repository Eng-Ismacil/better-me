"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * NativeBackButton
 * Handles the Android hardware back button when running inside a Capacitor
 * WebView. If Capacitor is not available (e.g. plain PWA in browser) the
 * component is a no-op, so it is safe to render everywhere.
 */
export default function NativeBackButton() {
  const router = useRouter();

  useEffect(() => {
    // Dynamically import Capacitor so the bundle is not broken when the
    // @capacitor/* packages are absent (plain PWA / desktop browser).
    let cleanup: (() => void) | undefined;

    void (async () => {
      try {
        const [{ Capacitor }, { App }] = await Promise.all([
          import("@capacitor/core"),
          import("@capacitor/app"),
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
        // Capacitor not installed — silently ignore
      }
    })();

    return () => cleanup?.();
  }, [router]);

  return null;
}