"use client";

import { useQuery } from "@tanstack/react-query";
import { Habit } from "@/types";

export const CALENDAR_QUERY_KEY = ["user-calendar"] as const;

export interface CalendarData {
  calendarData: Record<string, { count: number; rate: number }>;
  totalHabits: number;
  todayCompletedIds: string[];
  habits: Habit[];
}

export async function fetchUserCalendar(): Promise<CalendarData> {
  const res = await fetch("/api/calendar");
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to load calendar");
  }
  return res.json();
}

export function useUserCalendar(initialData?: Partial<CalendarData>) {
  return useQuery<CalendarData>({
    queryKey: CALENDAR_QUERY_KEY,
    queryFn: fetchUserCalendar,
    initialData: initialData && initialData.calendarData ? (initialData as CalendarData) : undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}
