"use client";

import React from "react";
import {
  QueryClient,
  QueryClientProvider,
  MutationCache,
} from "@tanstack/react-query";

/**
 * Singleton QueryClient with aggressive caching for instant page transitions.
 * - staleTime: 60s  → data is fresh for 1 min, no background refetch spam
 * - gcTime: 5min    → cached data lives in memory for 5 minutes after unmount
 * - retry: 1        → retry once on failure before showing error
 * - MutationCache onError → global optimistic-rollback error toast handler
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,      // 5 minutes — instant 0ms cached page transitions
        gcTime: 15 * 60 * 1000,        // 15 minutes in memory
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnMount: true,          // Silent SWR background revalidation
      },
      mutations: {
        retry: 0,
      },
    },
    mutationCache: new MutationCache({
      onError: (error) => {
        // Global mutation error handler — UI components handle their own rollback
        console.error("[React Query] Mutation failed:", error);
      },
    }),
  });
}

// ── Singleton pattern for Next.js server/client boundary safety ──
let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new client
    return makeQueryClient();
  }
  // Browser: reuse the same client across re-renders
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // NOTE: do NOT useState — it would recreate the client on every render
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
