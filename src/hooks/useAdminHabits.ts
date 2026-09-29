"use client";

import { useQuery } from "@tanstack/react-query";

export interface AdminHabitItem {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  category?: string;
  status?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  currentStreak?: number;
  totalCompletions?: number;
  frequency?: string;
  icon?: string;
}

export const ADMIN_HABITS_QUERY_KEY = ["admin-habits"] as const;

export async function fetchAdminHabits(search = ""): Promise<AdminHabitItem[]> {
  const params = new URLSearchParams();
  if (search.trim()) params.set("q", search.trim());

  const res = await fetch(`/api/admin/habits?${params.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to load habits");
  }
  const data = await res.json();
  const list = (data.habits || data || []) as AdminHabitItem[];
  return list.map((h) => ({
    ...h,
    id: h.id || h._id || "",
  }));
}

/**
 * Cache-First hook with background revalidation for Admin Habits
 */
export function useAdminHabits(search = "") {
  return useQuery<AdminHabitItem[]>({
    queryKey: [...ADMIN_HABITS_QUERY_KEY, search],
    queryFn: () => fetchAdminHabits(search),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}
