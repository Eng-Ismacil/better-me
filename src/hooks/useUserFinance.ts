"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const FINANCE_QUERY_KEY = ["user-finance"] as const;

export interface Transaction {
  _id: string;
  type: "income" | "expense" | "saving";
  amount: number;
  currency: string;
  category: string;
  title: string;
  notes?: string;
  date: string;
}

export interface FinanceSummary {
  income: number;
  expense: number;
  saving: number;
  balance: number;
}

export async function fetchUserFinance(): Promise<{
  transactions: Transaction[];
  summary: FinanceSummary;
}> {
  const res = await fetch("/api/finance");
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to load finance data");
  }
  return res.json();
}

export function useUserFinance() {
  const queryClient = useQueryClient();

  const financeQuery = useQuery({
    queryKey: FINANCE_QUERY_KEY,
    queryFn: fetchUserFinance,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const transactions = financeQuery.data?.transactions || [];
  const summary = financeQuery.data?.summary || { income: 0, expense: 0, saving: 0, balance: 0 };

  // Save Transaction Mutation
  const saveMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id?: string;
      payload: Record<string, unknown>;
    }) => {
      const url = id ? `/api/finance/${id}` : "/api/finance";
      const res = await fetch(url, {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save transaction");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FINANCE_QUERY_KEY });
    },
  });

  // Delete Transaction Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/finance/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete transaction");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FINANCE_QUERY_KEY });
    },
  });

  return {
    transactions,
    summary,
    isLoading: financeQuery.isLoading,
    isFetching: financeQuery.isFetching,
    saveTransaction: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    deleteTransaction: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    refetch: financeQuery.refetch,
  };
}
