"use client";

import { useQueryClient, useMutation, type UseMutationOptions } from "@tanstack/react-query";

// ─────────────────────────────────────────────────────────────
// useOptimisticMutation
//
// A universal hook that wires up the Optimistic UI pattern:
//   1. Snapshot current cache → 2. Instantly update cache (0ms)
//   3. API call in background → 4. Rollback on error, notify user
//
// Usage example:
//
//   const toggleHabit = useOptimisticMutation<Habit[], { id: string }>({
//     queryKey: ["habits"],
//     mutationFn: ({ id }) => fetch(`/api/habits/${id}/toggle`, { method: "PATCH" }).then(r => r.json()),
//     onOptimisticUpdate: (old, vars) =>
//       old?.map(h => h.id === vars.id ? { ...h, completed: !h.completed } : h),
//     onRollback: () => toast.error("Failed to update habit"),
//   });
//
//   toggleHabit.mutate({ id: "abc123" });
// ─────────────────────────────────────────────────────────────

interface UseOptimisticMutationOptions<TData, TVariables, TSnapshot = TData> {
  /** The React Query cache key to optimistically update */
  queryKey: unknown[];
  /** The actual API call */
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Return the NEW optimistic cache value based on old data + mutation variables */
  onOptimisticUpdate: (old: TSnapshot | undefined, variables: TVariables) => TSnapshot;
  /** Called when the API fails — show a toast, etc. */
  onRollback?: (error: Error, variables: TVariables) => void;
  /** Called after API succeeds — you can invalidate related queries here */
  onSuccess?: (data: TData, variables: TVariables) => void;
  /** Extra useMutation options */
  mutationOptions?: Partial<UseMutationOptions<TData, Error, TVariables, { snapshot: TSnapshot | undefined }>>;
}

export function useOptimisticMutation<TData, TVariables, TSnapshot = TData>({
  queryKey,
  mutationFn,
  onOptimisticUpdate,
  onRollback,
  onSuccess,
  mutationOptions,
}: UseOptimisticMutationOptions<TData, TVariables, TSnapshot>) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables, { snapshot: TSnapshot | undefined }>({
    mutationFn,

    // ── Step 1: Cancel outgoing fetches, snapshot, and apply optimistic update ──
    onMutate: async (variables) => {
      // Cancel any in-flight queries so they don't overwrite our optimistic data
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value for rollback
      const snapshot = queryClient.getQueryData<TSnapshot>(queryKey);

      // Optimistically update the cache INSTANTLY (0ms)
      queryClient.setQueryData<TSnapshot>(queryKey, (old) =>
        onOptimisticUpdate(old, variables)
      );

      return { snapshot };
    },

    // ── Step 2: On error → rollback to snapshot ──
    onError: (error, variables, context) => {
      if (context?.snapshot !== undefined) {
        queryClient.setQueryData(queryKey, context.snapshot);
      }
      onRollback?.(error, variables);
    },

    // ── Step 3: On success → optionally refetch to sync with server ──
    onSuccess: (data, variables) => {
      onSuccess?.(data, variables);
    },

    // ── Step 4: Always invalidate query after settle so cache stays fresh ──
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },

    ...mutationOptions,
  });
}

// ─────────────────────────────────────────────────────────────
// Helper: wrap a simple fetch into a mutation function
// ─────────────────────────────────────────────────────────────
export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || `API error ${res.status}`);
  }
  return data as T;
}
