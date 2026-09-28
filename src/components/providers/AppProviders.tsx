"use client";

import React from "react";
import { LanguageProvider } from "@/lib/i18n";
import PageProgressBar from "@/components/ui/PageProgressBar";
import PwaInstallProvider from "@/components/ui/PwaInstallProvider";
import FirstInstallPrompt from "@/components/ui/FirstInstallPrompt";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <PwaInstallProvider>
        <PageProgressBar />
        <FirstInstallPrompt />
        {children}
      </PwaInstallProvider>
    </LanguageProvider>
  );
}
