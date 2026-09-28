"use client";

import React from "react";
import { LanguageProvider } from "@/lib/i18n";
import PageProgressBar from "@/components/ui/PageProgressBar";
import NativeBackButton from "@/components/ui/NativeBackButton";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <PageProgressBar />
      <NativeBackButton />
      {children}
    </LanguageProvider>
  );
}
