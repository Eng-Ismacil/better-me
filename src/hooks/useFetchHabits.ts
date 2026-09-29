"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Habit } from "@/types";

export const HABITS_LIST_KEY = ["habits-list"] as const;
export const COMPLETED_IDS_KEY = ["completed-habit-ids"] as const;

/**
 * Fetch habits list from API
 */
export async function fetchHabits(): Promise<Habit[]> {
  const res = await fetch("/api/habits");
  if (!res.ok) throw new Error("Failed to fetch habits");
  const data = await res.json();
  return (data.habits || []) as Habit[];
}

/**
 * Fetch today's completed habit IDs
 */
export async function fetchCompletedHabitIds(): Promise<string[]> {
  const res = await fetch("/api/habits/completed");
  if (!res.ok) return [];
  const data = await res.json();
  return (data.completedIds || []) as string[];
}

interface UseFetchHabitsOptions {
  initialHabits?: Habit[];
  initialCompletedIds?: string[];
}

/**
 * SWR Cache-First Data Hook for User Habits
 * Provides 0ms instant cached navigation with silent background revalidation.
 */
export function useFetchHabits({
  initialHabits,
  initialCompletedIds,
}: UseFetchHabitsOptions = {}) {
  const queryClient = useQueryClient();

  // 1. Query habits list (Cache-First, 5 min staleTime)
  const habitsQuery = useQuery({
    queryKey: HABITS_LIST_KEY,
    queryFn: fetchHabits,
    initialData: initialHabits && initialHabits.length > 0 ? initialHabits : undefined,
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 15 * 60 * 1000,
  });

  // 2. Query today's completed IDs
  const completedIdsQuery = useQuery({
    queryKey: COMPLETED_IDS_KEY,
    queryFn: fetchCompletedHabitIds,
    initialData: initialCompletedIds,
    staleTime: 60 * 1000, // 1 min
    gcTime: 15 * 60 * 1000,
  });

  // 3. Optimistic Habit Toggle Mutation (0ms UI latency with automatic rollback)
  const toggleMutation = useMutation({
    mutationFn: async (habitId: string) => {
      const res = await fetch(`/api/habits/${habitId}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to toggle habit");
      return res.json();
    },
    onMutate: async (habitId: string) => {
      await queryClient.cancelQueries({ queryKey: COMPLETED_IDS_KEY });

      const prevCompletedIds =
        queryClient.getQueryData<string[]>(COMPLETED_IDS_KEY) || [];

      const isCompleted = prevCompletedIds.includes(habitId);
      const nextCompletedIds = isCompleted
        ? prevCompletedIds.filter((id) => id !== habitId)
        : [...prevCompletedIds, habitId];

      // Instant 0ms Cache Update
      queryClient.setQueryData<string[]>(COMPLETED_IDS_KEY, nextCompletedIds);

      return { prevCompletedIds };
    },
    onError: (_error, _habitId, context) => {
      if (context?.prevCompletedIds) {
        queryClient.setQueryData(COMPLETED_IDS_KEY, context.prevCompletedIds);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: COMPLETED_IDS_KEY });
    },
  });

  const habits = habitsQuery.data || initialHabits || [];
  const completedIds = new Set(completedIdsQuery.data || initialCompletedIds || []);

  const isInitialLoading = habitsQuery.isLoading && !habitsQuery.data;

  return {
    habits,
    completedIds,
    isLoading: isInitialLoading,
    isRefetching: habitsQuery.isFetching,
    toggleHabit: toggleMutation.mutate,
    refetch: habitsQuery.refetch,
  };
}
