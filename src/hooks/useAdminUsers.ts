"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminUser } from "@/components/admin/AdminUsersClient";

export const ADMIN_USERS_QUERY_KEY = ["admin-users"] as const;

export async function fetchAdminUsers(search = "", status = "all"): Promise<AdminUser[]> {
  const params = new URLSearchParams();
  if (search.trim()) params.set("q", search.trim());
  if (status !== "all") params.set("status", status);

  const res = await fetch(`/api/admin/users?${params.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to load users");
  }
  const data = await res.json();
  const list = (data.users || data || []) as AdminUser[];
  return list.map((u) => ({
    ...u,
    id: u.id || u._id || "",
    status: u.status || "active",
  }));
}

/**
 * Cache-First hook with silent background revalidation for Admin Member Profiles
 */
export function useAdminUsers(search = "", status = "all") {
  return useQuery<AdminUser[]>({
    queryKey: [...ADMIN_USERS_QUERY_KEY, search, status],
    queryFn: () => fetchAdminUsers(search, status),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}
