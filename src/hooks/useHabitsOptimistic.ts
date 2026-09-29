"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Habit } from "@/types";

export const HABITS_QUERY_KEY = ["habits-list"] as const;
export const COMPLETED_HABITS_QUERY_KEY = ["completed-habit-ids"] as const;

interface UseHabitsOptimisticProps {
  initialHabits?: Habit[];
  initialCompletedIds?: string[];
}

export function useHabitsOptimistic({
  initialHabits = [],
  initialCompletedIds = [],
}: UseHabitsOptimisticProps = {}) {
  const queryClient = useQueryClient();

  // 1. Query: List of habits
  const habitsQuery = useQuery({
    queryKey: HABITS_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch("/api/habits");
      if (!res.ok) throw new Error("Failed to load habits");
      const data = await res.json();
      return (data.habits || []) as Habit[];
    },
    initialData: initialHabits.length > 0 ? initialHabits : undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // 2. Query: Completed habit IDs for today
  const completedIdsQuery = useQuery({
    queryKey: COMPLETED_HABITS_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch("/api/habits/completed");
      if (!res.ok) return initialCompletedIds;
      const data = await res.json();
      return (data.completedIds || []) as string[];
    },
    initialData: initialCompletedIds,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // 3. Optimistic Toggle Habit Mutation (0ms UI feedback)
  const toggleMutation = useMutation({
    mutationFn: async (habitId: string) => {
      const res = await fetch(`/api/habits/${habitId}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to toggle habit");
      }
      return res.json();
    },
    onMutate: async (habitId: string) => {
      // Step A: Cancel any outgoing queries to prevent cache overwrite
      await queryClient.cancelQueries({ queryKey: COMPLETED_HABITS_QUERY_KEY });

      // Step B: Snapshot the previous completed IDs for instant rollback on error
      const previousCompletedIds =
        queryClient.getQueryData<string[]>(COMPLETED_HABITS_QUERY_KEY) || [];

      const isCompleted = previousCompletedIds.includes(habitId);
      const nextCompletedIds = isCompleted
        ? previousCompletedIds.filter((id) => id !== habitId)
        : [...previousCompletedIds, habitId];

      // Step C: Instantly update the React Query cache (0ms Latency)
      queryClient.setQueryData<string[]>(COMPLETED_HABITS_QUERY_KEY, nextCompletedIds);

      return { previousCompletedIds };
    },
    onError: (_error, _habitId, context) => {
      // Step D: Rollback immediately if server request fails
      if (context?.previousCompletedIds) {
        queryClient.setQueryData(
          COMPLETED_HABITS_QUERY_KEY,
          context.previousCompletedIds
        );
      }
    },
    onSettled: () => {
      // Step E: Background refetch to ensure source-of-truth consistency
      queryClient.invalidateQueries({ queryKey: COMPLETED_HABITS_QUERY_KEY });
    },
  });

  // 4. Optimistic Delete Habit Mutation
  const deleteMutation = useMutation({
    mutationFn: async (habitId: string) => {
      const res = await fetch(`/api/habits/${habitId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete habit");
      return res.json();
    },
    onMutate: async (habitId: string) => {
      await queryClient.cancelQueries({ queryKey: HABITS_QUERY_KEY });

      const previousHabits = queryClient.getQueryData<Habit[]>(HABITS_QUERY_KEY) || [];

      // Instantly remove from cache
      queryClient.setQueryData<Habit[]>(
        HABITS_QUERY_KEY,
        previousHabits.filter(
          (h) => (h._id || (h as unknown as { id?: string }).id) !== habitId
        )
      );

      return { previousHabits };
    },
    onError: (_error, _habitId, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(HABITS_QUERY_KEY, context.previousHabits);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: HABITS_QUERY_KEY });
    },
  });

  const habits = habitsQuery.data || initialHabits;
  const completedIds = new Set(completedIdsQuery.data || initialCompletedIds);

  return {
    habits,
    completedIds,
    isLoading: habitsQuery.isLoading,
    toggleHabit: toggleMutation.mutate,
    isToggling: toggleMutation.isPending,
    deleteHabit: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
