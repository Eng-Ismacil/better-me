"use client";

import { useQuery } from "@tanstack/react-query";

export interface AdminStatsData {
  users: {
    total: number;
    active: number;
    inactive: number;
    disabled: number;
    deleted: number;
  };
  habits: {
    total: number;
  };
  completions: {
    today: number;
    week: number;
  };
  usageGraph: Array<{ date: string; count: number }>;
  topStreaks: Array<{
    userId: string;
    name: string;
    email: string;
    avatarUrl?: string;
    currentStreak: number;
    bestStreak: number;
    habitName: string;
  }>;
  topCompleters: Array<{
    userId: string;
    name: string;
    email: string;
    avatarUrl?: string;
    totalCompletions: number;
    bestStreak: number;
    currentStreak: number;
    habitCount: number;
  }>;
}

export const ADMIN_STATS_QUERY_KEY = ["admin-stats"] as const;

export async function fetchAdminStats(): Promise<AdminStatsData> {
  const res = await fetch("/api/admin/stats");
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to load admin statistics");
  }
  const data = await res.json();
  return data.stats as AdminStatsData;
}

/**
 * Cache-First hook with silent background revalidation for Admin Overview & Streaks
 */
export function useAdminStats(initialData?: AdminStatsData) {
  return useQuery<AdminStatsData>({
    queryKey: ADMIN_STATS_QUERY_KEY,
    queryFn: fetchAdminStats,
    initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes fresh
    gcTime: 15 * 60 * 1000,
  });
}
