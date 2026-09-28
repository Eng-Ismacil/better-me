"use client";
import React, { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * Prefetches every nav route as soon as the shell mounts, so tab switches
 * load instantly from the router cache (no compile/network wait).
 */
const ALL_ROUTES = [
  "/home",
  "/habits",
  "/calendar",
  "/routines",
  "/check-in",
  "/insights",
  "/achievements",
  "/reminders",
  "/notifications",
  "/profile",
  "/settings",
  "/more",
];

export default function RoutePreloader() {
  const router = useRouter();
  const pathname = usePathname();
  const prefetchedRef = useRef(false);

  useEffect(() => {
    if (prefetchedRef.current) return;
    prefetchedRef.current = true;

    // Stagger prefetches 100ms apart so we don't spike the network
    ALL_ROUTES.filter((r) => r !== pathname).forEach((route, i) => {
      setTimeout(() => {
        try { router.prefetch(route); } catch {}
      }, 150 + i * 100);
    });
  }, []); // only once on mount

  return null;
}
