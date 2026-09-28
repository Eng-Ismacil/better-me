import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import BetterMeLogo from "@/components/brand/BetterMeLogo";
import "./globals.css";
import { getSession } from "@/lib/auth";
import { getMaintenanceSettings } from "@/lib/maintenance";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BetterMe — Habit & Growth Companion",
  applicationName: "BetterMe",
  description:
    "Small consistent actions create meaningful progress. Design healthy routines and track your daily momentum with calm precision.",
  icons: {
    icon: "/favicon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    title: "BetterMe",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#FCF9F8",
};

export const dynamic = "force-dynamic";

import AppProviders from "@/components/providers/AppProviders";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return await getRootContent(children);
}

async function getRootContent(children: React.ReactNode) {
  const pathname = (await headers()).get("x-betterme-pathname") || "/";
  const isAdminOrAuthRoute =
    pathname.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  let page = children;
  if (!isAdminOrAuthRoute) {
    const maintenance = await getMaintenanceSettings();
    if (maintenance.enabled) {
      const session = await getSession();
      if (!session?.isAdmin) {
        page = (
          <main className="flex min-h-screen items-center justify-center bg-[#F5F8FC] px-5 py-12">
            <section className="w-full max-w-xl rounded-2xl border border-[#E0E7EF] bg-white p-7 text-center shadow-[0_18px_60px_rgba(16,24,40,0.08)] sm:p-10">
              <BetterMeLogo size={42} className="mx-auto" />
              <span className="mx-auto mt-8 flex h-14 w-14 items-center justify-center rounded-xl bg-[#FFF7E8] text-[#B45309]">
                <span className="material-symbols-outlined">construction</span>
              </span>
              <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-[#B45309]">
                BetterMe · Maintenance
              </p>
              <h1 className="mt-2 text-[24px] font-extrabold text-[#111827] font-[family-name:var(--font-headline)]">
                We&apos;ll be back soon
              </h1>
              <p className="mx-auto mt-3 max-w-md text-[14px] leading-6 text-[#667085]">
                {maintenance.message}
              </p>
              {maintenance.endsAt && Date.parse(maintenance.endsAt) > Date.now() && (
                <p className="mt-5 border-t border-[#E7ECF3] pt-4 text-[12px] font-semibold text-[#475467]">
                  Expected return: {new Date(maintenance.endsAt).toLocaleString()}
                </p>
              )}
            </section>
          </main>
        );
      }
    }
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#FCF9F8] text-[#101010] antialiased selection:bg-[#EFF6FF]"
      >
        <AppProviders>{page}</AppProviders>
      </body>
    </html>
  );
}
