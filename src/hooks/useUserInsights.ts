"use client";

import { useQuery } from "@tanstack/react-query";
import { HabitHealthMetric, WeeklyConsistencyDay } from "@/types";

export const INSIGHTS_QUERY_KEY = ["user-insights"] as const;

export interface InsightsData {
  metrics: HabitHealthMetric[];
  weeklyDays: WeeklyConsistencyDay[];
  consistencyScore: number;
  totalStreak: number;
  bestStreak: number;
  totalCompletions: number;
  habitCount: number;
}

export async function fetchUserInsights(): Promise<InsightsData> {
  const res = await fetch("/api/insights");
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to load insights");
  }
  return res.json();
}

export function useUserInsights(initialData?: Partial<InsightsData>) {
  return useQuery<InsightsData>({
    queryKey: INSIGHTS_QUERY_KEY,
    queryFn: fetchUserInsights,
    initialData: initialData && initialData.metrics ? (initialData as InsightsData) : undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}
