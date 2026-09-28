"use client";

import { useEffect } from "react";
import { App } from "@capacitor/app";
import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import { useRouter } from "next/navigation";

export default function NativeBackButton() {
  const router = useRouter();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let listener: PluginListenerHandle | undefined;
    let disposed = false;

    void App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) router.back();
      else void App.exitApp();
    }).then((handle) => {
      if (disposed) void handle.remove();
      else listener = handle;
    });

    return () => {
      disposed = true;
      void listener?.remove();
    };
  }, [router]);

  return null;
}