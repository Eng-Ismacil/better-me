"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { ROUTINES_QUERY_KEY, fetchUserRoutines } from "./useUserRoutines";
import { FINANCE_QUERY_KEY, fetchUserFinance } from "./useUserFinance";
import { INSIGHTS_QUERY_KEY, fetchUserInsights } from "./useUserInsights";
import { CALENDAR_QUERY_KEY, fetchUserCalendar } from "./useUserCalendar";

/**
 * Universal Registry of page routes to their TanStack Query prefetch loaders.
 * Fetches data into memory on hover/focus before click, delivering 0ms instant page loads.
 */
export function prefetchRouteData(queryClient: ReturnType<typeof useQueryClient>, href: string) {
  const path = href.split("?")[0].split("#")[0];

  switch (path) {
    // ── ADMIN ROUTES ──
    case "/admin":
    case "/admin/streaks":
      queryClient.prefetchQuery({
        queryKey: ["admin-stats"],
        queryFn: async () => {
          const res = await fetch("/api/admin/stats");
          if (!res.ok) throw new Error("Failed to prefetch admin stats");
          return res.json();
        },
        staleTime: 5 * 60 * 1000,
      });
      break;

    case "/admin/users":
      queryClient.prefetchQuery({
        queryKey: ["admin-users", "", "all"],
        queryFn: async () => {
          const res = await fetch("/api/admin/users");
          if (!res.ok) throw new Error("Failed to prefetch admin users");
          return res.json();
        },
        staleTime: 5 * 60 * 1000,
      });
      break;

    case "/admin/habits":
      queryClient.prefetchQuery({
        queryKey: ["admin-habits"],
        queryFn: async () => {
          const res = await fetch("/api/admin/habits");
          if (!res.ok) throw new Error("Failed to prefetch admin habits");
          return res.json();
        },
        staleTime: 5 * 60 * 1000,
      });
      break;

    case "/admin/broadcast":
      queryClient.prefetchQuery({
        queryKey: ["admin-broadcast"],
        queryFn: async () => {
          const res = await fetch("/api/admin/broadcast");
          if (!res.ok) throw new Error("Failed to prefetch admin broadcast");
          return res.json();
        },
        staleTime: 5 * 60 * 1000,
      });
      break;

    case "/admin/support":
      queryClient.prefetchQuery({
        queryKey: ["admin-support"],
        queryFn: async () => {
          const res = await fetch("/api/support?summary=true");
          if (!res.ok) throw new Error("Failed to prefetch admin support");
          return res.json();
        },
        staleTime: 5 * 60 * 1000,
      });
      break;

    case "/admin/recycle-bin":
      queryClient.prefetchQuery({
        queryKey: ["admin-recycle-bin"],
        queryFn: async () => {
          const res = await fetch("/api/admin/recycle-bin");
          if (!res.ok) throw new Error("Failed to prefetch recycle bin");
          return res.json();
        },
        staleTime: 5 * 60 * 1000,
      });
      break;

    case "/admin/audit":
      queryClient.prefetchQuery({
        queryKey: ["admin-audit", "", "all", 1],
        queryFn: async () => {
          const res = await fetch("/api/admin/audit?limit=50");
          if (!res.ok) throw new Error("Failed to prefetch audit log");
          return res.json();
        },
        staleTime: 2 * 60 * 1000,
      });
      break;

    case "/admin/finance":
      queryClient.prefetchQuery({
        queryKey: ["admin-finance", "members", "", ""],
        queryFn: async () => {
          const res = await fetch("/api/admin/finance?scope=members");
          if (!res.ok) throw new Error("Failed to prefetch finance");
          return res.json();
        },
        staleTime: 5 * 60 * 1000,
      });
      break;

    case "/admin/reports":
      queryClient.prefetchQuery({
        queryKey: ["admin-reports"],
        queryFn: async () => {
          const res = await fetch("/api/admin/reports");
          if (!res.ok) throw new Error("Failed to prefetch reports");
          return res.json();
        },
        staleTime: 5 * 60 * 1000,
      });
      break;

    case "/admin/settings":
      queryClient.prefetchQuery({
        queryKey: ["admin-settings"],
        queryFn: async () => {
          const res = await fetch("/api/admin/settings");
          if (!res.ok) throw new Error("Failed to prefetch settings");
          return res.json();
        },
        staleTime: 5 * 60 * 1000,
      });
      break;

    // ── USER APP ROUTES (0ms Latency) ──
    case "/home":
      queryClient.prefetchQuery({
        queryKey: ["habits-list"],
        queryFn: async () => {
          const res = await fetch("/api/habits");
          return res.json();
        },
        staleTime: 5 * 60 * 1000,
      });
      queryClient.prefetchQuery({
        queryKey: ["completed-habit-ids"],
        queryFn: async () => {
          const res = await fetch("/api/habits/completed");
          return res.json();
        },
        staleTime: 5 * 60 * 1000,
      });
      break;

    case "/habits":
      queryClient.prefetchQuery({
        queryKey: ["habits-list"],
        queryFn: async () => {
          const res = await fetch("/api/habits");
          return res.json();
        },
        staleTime: 5 * 60 * 1000,
      });
      break;

    case "/routines":
      queryClient.prefetchQuery({
        queryKey: ROUTINES_QUERY_KEY,
        queryFn: fetchUserRoutines,
        staleTime: 5 * 60 * 1000,
      });
      break;

    case "/insights":
      queryClient.prefetchQuery({
        queryKey: INSIGHTS_QUERY_KEY,
        queryFn: fetchUserInsights,
        staleTime: 5 * 60 * 1000,
      });
      break;

    case "/calendar":
      queryClient.prefetchQuery({
        queryKey: CALENDAR_QUERY_KEY,
        queryFn: fetchUserCalendar,
        staleTime: 5 * 60 * 1000,
      });
      break;

    case "/finance":
      queryClient.prefetchQuery({
        queryKey: FINANCE_QUERY_KEY,
        queryFn: fetchUserFinance,
        staleTime: 5 * 60 * 1000,
      });
      break;

    case "/profile":
      queryClient.prefetchQuery({
        queryKey: ["user-profile"],
        queryFn: async () => {
          const res = await fetch("/api/profile");
          return res.json();
        },
        staleTime: 5 * 60 * 1000,
      });
      break;

    case "/notifications":
      queryClient.prefetchQuery({
        queryKey: ["user-notifications"],
        queryFn: async () => {
          const res = await fetch("/api/notifications");
          return res.json();
        },
        staleTime: 5 * 60 * 1000,
      });
      break;

    case "/support":
      queryClient.prefetchQuery({
        queryKey: ["support-chats"],
        queryFn: async () => {
          const res = await fetch("/api/support");
          return res.json();
        },
        staleTime: 5 * 60 * 1000,
      });
      break;

    case "/check-in":
      queryClient.prefetchQuery({
        queryKey: ["user-checkin"],
        queryFn: async () => {
          const res = await fetch("/api/check-in");
          return res.json();
        },
        staleTime: 5 * 60 * 1000,
      });
      break;

    case "/achievements":
      queryClient.prefetchQuery({
        queryKey: ["user-achievements"],
        queryFn: async () => {
          const res = await fetch("/api/achievements");
          return res.json();
        },
        staleTime: 5 * 60 * 1000,
      });
      break;

    case "/reminders":
      queryClient.prefetchQuery({
        queryKey: ["user-reminders"],
        queryFn: async () => {
          const res = await fetch("/api/reminders");
          return res.json();
        },
        staleTime: 5 * 60 * 1000,
      });
      break;

    default:
      break;
  }
}

/**
 * Custom hook returning a prefetch trigger for any route
 */
export function usePrefetchPage() {
  const queryClient = useQueryClient();

  const prefetch = useCallback(
    (href: string) => {
      prefetchRouteData(queryClient, href);
    },
    [queryClient]
  );

  return prefetch;
}
