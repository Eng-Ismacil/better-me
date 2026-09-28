"use client";

import React from "react";
import { LanguageProvider } from "@/lib/i18n";
import PageProgressBar from "@/components/ui/PageProgressBar";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      {/* Ultra-thin top progress bar on every navigation */}
      <PageProgressBar />
      {children}
    </LanguageProvider>
  );
}
