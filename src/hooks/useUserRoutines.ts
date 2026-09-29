"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Routine } from "@/types";

export const ROUTINES_QUERY_KEY = ["user-routines"] as const;

export async function fetchUserRoutines(): Promise<{ routines: Routine[] }> {
  const res = await fetch("/api/routines");
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to load routines");
  }
  return res.json();
}

interface UseUserRoutinesOptions {
  initialRoutines?: Routine[];
}

export function useUserRoutines(options: UseUserRoutinesOptions = {}) {
  const queryClient = useQueryClient();

  const routinesQuery = useQuery<{ routines: Routine[] }>({
    queryKey: ROUTINES_QUERY_KEY,
    queryFn: fetchUserRoutines,
    initialData: options.initialRoutines ? { routines: options.initialRoutines } : undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const routines = routinesQuery.data?.routines || [];

  // Optimistic Create Mutation (0ms UI feedback)
  const createMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      description?: string;
      icon: string;
      timeOfDay: string;
      habitIds: string[];
    }) => {
      const res = await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create routine");
      }
      return res.json();
    },
    onMutate: async (newRoutinePayload) => {
      await queryClient.cancelQueries({ queryKey: ROUTINES_QUERY_KEY });
      const previousData = queryClient.getQueryData<{ routines: Routine[] }>(ROUTINES_QUERY_KEY);

      const optimisticRoutine: Routine = {
        _id: `temp_${Date.now()}`,
        userId: "current",
        name: newRoutinePayload.name,
        description: newRoutinePayload.description || "",
        icon: newRoutinePayload.icon,
        timeOfDay: newRoutinePayload.timeOfDay,
        habits: newRoutinePayload.habitIds.map((hId, idx) => ({ habitId: hId, order: idx })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<{ routines: Routine[] }>(ROUTINES_QUERY_KEY, (old) => ({
        routines: [optimisticRoutine, ...(old?.routines || [])],
      }));

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(ROUTINES_QUERY_KEY, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ROUTINES_QUERY_KEY });
    },
  });

  // Optimistic Update Mutation (0ms UI feedback)
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        name: string;
        description?: string;
        icon: string;
        timeOfDay: string;
        habitIds: string[];
      };
    }) => {
      const res = await fetch(`/api/routines/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update routine");
      }
      return res.json();
    },
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ROUTINES_QUERY_KEY });
      const previousData = queryClient.getQueryData<{ routines: Routine[] }>(ROUTINES_QUERY_KEY);

      queryClient.setQueryData<{ routines: Routine[] }>(ROUTINES_QUERY_KEY, (old) => {
        if (!old) return old;
        return {
          routines: old.routines.map((r) =>
            r._id === id
              ? {
                  ...r,
                  name: payload.name,
                  description: payload.description || "",
                  icon: payload.icon,
                  timeOfDay: payload.timeOfDay,
                  habits: payload.habitIds.map((hId, idx) => ({ habitId: hId, order: idx })),
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        };
      });

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(ROUTINES_QUERY_KEY, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ROUTINES_QUERY_KEY });
    },
  });

  // Optimistic Delete Mutation (0ms UI feedback)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/routines/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete routine");
      }
      return res.json();
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ROUTINES_QUERY_KEY });
      const previousData = queryClient.getQueryData<{ routines: Routine[] }>(ROUTINES_QUERY_KEY);

      queryClient.setQueryData<{ routines: Routine[] }>(ROUTINES_QUERY_KEY, (old) => {
        if (!old) return old;
        return {
          routines: old.routines.filter((r) => r._id !== id),
        };
      });

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(ROUTINES_QUERY_KEY, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ROUTINES_QUERY_KEY });
    },
  });

  return {
    routines,
    isLoading: routinesQuery.isLoading,
    isFetching: routinesQuery.isFetching,
    createRoutine: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateRoutine: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteRoutine: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
