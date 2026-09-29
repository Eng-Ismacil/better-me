"use client";

import { useQuery } from "@tanstack/react-query";

export interface AuditLogEntry {
  _id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export const ADMIN_AUDIT_QUERY_KEY = ["admin-audit"] as const;

export async function fetchAdminAudit(
  query: string,
  action: string,
  page: number,
  limit = 50
): Promise<{ logs: AuditLogEntry[]; total: number; pages: number }> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (query.trim()) params.set("query", query.trim());
  if (action && action !== "all") params.set("action", action);
  const res = await fetch(`/api/admin/audit?${params.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to load audit log");
  }
  const data = await res.json();
  return {
    logs: data.logs || [],
    total: data.total || 0,
    pages: data.pages || 1,
  };
}

export function useAdminAudit(query: string, action: string, page: number) {
  return useQuery({
    queryKey: [...ADMIN_AUDIT_QUERY_KEY, query, action, page],
    queryFn: () => fetchAdminAudit(query, action, page),
    staleTime: 2 * 60 * 1000, // audit logs are more volatile
    gcTime: 10 * 60 * 1000,
    placeholderData: (prev) => prev, // keep previous page visible during navigation
  });
}
