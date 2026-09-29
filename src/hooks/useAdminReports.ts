"use client";

import { useQuery } from "@tanstack/react-query";

export interface ActivityReport {
  from: string;
  to: string;
  summary: {
    newUsers: number;
    activeMembers: number;
    newHabits: number;
    completions: number;
    adminActions: number;
    financeIncome: number;
    financeExpense: number;
    financeEntries: number;
  };
  daily: Array<{ date: string; count: number }>;
  topUsers: Array<{ userId: string; name: string; email: string; completions: number }>;
  topHabits: Array<{ habitId: string; name: string; completions: number }>;
  adminActionsByType: Array<{ action: string; count: number }>;
}

export const ADMIN_REPORTS_QUERY_KEY = ["admin-reports"] as const;

export async function fetchAdminReport(from: string, to: string): Promise<ActivityReport> {
  const params = new URLSearchParams({ from, to });
  const res = await fetch(`/api/admin/reports?${params.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Could not generate report");
  }
  const data = await res.json();
  return data.report as ActivityReport;
}

export function useAdminReport(from: string, to: string) {
  return useQuery({
    queryKey: [...ADMIN_REPORTS_QUERY_KEY, from, to],
    queryFn: () => fetchAdminReport(from, to),
    staleTime: 10 * 60 * 1000, // reports are expensive — cache for 10m
    gcTime: 30 * 60 * 1000,
    enabled: Boolean(from && to),
  });
}
