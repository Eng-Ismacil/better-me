"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";
import AdminPageHeader from "@/components/admin/design-system/AdminPageHeader";
import AdminContextBar from "@/components/admin/design-system/AdminContextBar";
import AdminKpiCard from "@/components/admin/design-system/AdminKpiCard";
import AdminMemberDrawer, { DrawerMember } from "@/components/admin/design-system/AdminMemberDrawer";
import { useAdminUsers, ADMIN_USERS_QUERY_KEY } from "@/hooks/useAdminUsers";

export interface AdminUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  status?: "active" | "inactive" | "disabled";
  isAdmin?: boolean;
  role?: string;
  twoFactorEnabled?: boolean;
  timezone?: string;
  memberSince?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  phone?: string;
  notes?: string;
  currentStreak?: number;
  bestStreak?: number;
  totalCompletions?: number;
}

type StatusFilter = "all" | "active" | "inactive" | "disabled";
type RoleFilter = "all" | "admin" | "member";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  status: "active" as "active" | "inactive" | "disabled",
  isAdmin: false,
  twoFactorEnabled: false,
  timezone: "UTC",
  phone: "",
  notes: "",
  avatarUrl: "",
};

export default function AdminUsersClient() {
  const { language } = useTranslation();
  const so = language === "so";
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Slide-over Drawers
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [actionError, setActionError] = useState("");

  // Member 360 Drawer
  const [selectedMember, setSelectedMember] = useState<DrawerMember | null>(null);
  const [is360DrawerOpen, setIs360DrawerOpen] = useState(false);

  // TanStack Query Cache-First Hook
  const { data: users = [], isLoading, isFetching, refetch } = useAdminUsers(search, statusFilter);

  // Filtered dataset
  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (statusFilter !== "all" && (u.status || "active") !== statusFilter) {
        return false;
      }
      if (roleFilter === "admin" && !(u.isAdmin || u.role === "admin")) {
        return false;
      }
      if (roleFilter === "member" && (u.isAdmin || u.role === "admin")) {
        return false;
      }
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q)
      );
    });
  }, [users, search, statusFilter, roleFilter]);

  // Aggregate stats for KPIs
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => (u.status || "active") === "active").length;
    const admins = users.filter((u) => u.isAdmin || u.role === "admin").length;
    const disabled = users.filter((u) => u.status === "disabled").length;
    const twoFactorCount = users.filter((u) => u.twoFactorEnabled).length;
    const activeRate = total > 0 ? Math.round((active / total) * 100) : 100;
    return { total, active, admins, disabled, twoFactorCount, activeRate };
  }, [users]);

  // Selection
  const allSelected = filtered.length > 0 && filtered.every((u) => selected.has(u.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((u) => u.id)));
    }
  };

  const toggleOne = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Open 360 Profile Drawer
  const handleOpen360 = (user: AdminUser, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedMember({
      userId: user.id,
      name: user.name || "Member",
      email: user.email || "",
      avatarUrl: user.avatarUrl,
      currentStreak: user.currentStreak || 0,
      bestStreak: user.bestStreak || 0,
      totalCompletions: user.totalCompletions || 0,
      status: user.status || "active",
      joinedDate: user.createdAt,
    });
    setIs360DrawerOpen(true);
  };

  // Open Create Modal
  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setActionError("");
    setCreateDrawerOpen(true);
  };

  // Open Edit Modal
  const openEdit = (user: AdminUser, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingUser(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      status: user.status || "active",
      isAdmin: Boolean(user.isAdmin || user.role === "admin"),
      twoFactorEnabled: Boolean(user.twoFactorEnabled),
      timezone: user.timezone || "UTC",
      phone: user.phone || "",
      notes: user.notes || "",
      avatarUrl: user.avatarUrl || "",
    });
    setActionError("");
    setCreateDrawerOpen(true);
  };

  // Save User Mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = editingUser
        ? await fetch(`/api/admin/users/${editingUser.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      return data;
    },
    onSuccess: () => {
      setCreateDrawerOpen(false);
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
    onError: (err: Error) => {
      setActionError(err.message);
    },
  });

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError("");
    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      status: form.status,
      isAdmin: form.isAdmin,
      twoFactorEnabled: form.twoFactorEnabled,
      timezone: form.timezone,
      phone: form.phone,
      notes: form.notes,
      avatarUrl: form.avatarUrl || undefined,
    };
    if (form.password) payload.password = form.password;
    saveMutation.mutate(payload);
  };

  // Status Change Mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AdminUser["status"] }) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
    onError: (err: Error) => {
      setActionError(err.message);
    },
  });

  // Soft Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
    onError: (err: Error) => {
      setActionError(err.message);
    },
  });

  const handleSoftDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm(so ? "Ma hubtaa inaad soft-delete sameyso xubintan?" : "Soft-delete this member account?")) return;
    deleteMutation.mutate(id);
  };

  // Bulk Actions Mutation
  const bulkMutation = useMutation({
    mutationFn: async (action: string) => {
      if (selected.size === 0) return;
      const res = await fetch("/api/admin/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids: Array.from(selected) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bulk action failed");
      return data;
    },
    onSuccess: () => {
      setSelected(new Set());
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
    onError: (err: Error) => {
      setActionError(err.message);
    },
  });

  const statusBadge = (status?: string) => {
    const s = status || "active";
    if (s === "active") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF3] text-[#10B981] border border-[#10B981]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          {so ? "Firfircoon" : "Active"}
        </span>
      );
    }
    if (s === "disabled") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#EF4444] border border-[#EF4444]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
          {so ? "La Joojiyay" : "Disabled"}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        {so ? "Aan firfircoonayn" : "Inactive"}
      </span>
    );
  };

  const getInitials = (name: string) => {
    return (
      name
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "MB"
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Layer 1: Page Header */}
      <AdminPageHeader
        title={so ? "Hagaha Xubnaha & Akoonnada" : "Member & Profile Directory"}
        subtitle={
          so
            ? "Kormeeri xogta xubnaha, xaaladaha galaangalka, xuquuqaha maamulka iyo badbaadada."
            : "Review member identities, access rights, administrative privileges, and security health."
        }
        badges={[
          { label: so ? "Wadarta" : "Total", value: stats.total, variant: "neutral" },
          { label: so ? "Firfircoon" : "Active", value: `${stats.activeRate}%`, variant: "success" },
          { label: "Admins", value: stats.admins, variant: "blue" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-colors cursor-pointer"
              title={so ? "Dib u cusboonaysii" : "Refresh directory"}
            >
              <Icon name="refresh" size={18} className={isFetching ? "animate-spin text-[#0B6EF3]" : ""} />
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B6EF3] text-white text-[13px] font-bold hover:bg-[#0958c7] shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <Icon name="person_add" size={17} />
              <span>{so ? "Xubin Cusub" : "Add Member"}</span>
            </button>
          </div>
        }
      />

      {/* Layer 2: Summary Metrics (KPI Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminKpiCard
          label={so ? "Wadarta Xubnaha" : "Total Directory"}
          value={stats.total}
          icon="group"
          variant="blue"
          subtext={so ? "Xubnaha ka diiwaangashan nidaamka" : "Registered user accounts"}
        />
        <AdminKpiCard
          label={so ? "Xubnaha Firfircoon" : "Active Accounts"}
          value={stats.active}
          icon="verified"
          variant="success"
          subtext={`${stats.activeRate}% ${so ? "waxay ku jiraan xaalad wanaagsan" : "in good operational standing"}`}
        />
        <AdminKpiCard
          label={so ? "Maamulayaasha (Admins)" : "System Privileges"}
          value={stats.admins}
          icon="shield_person"
          variant="warning"
          subtext={`${stats.twoFactorCount} ${so ? "2FA u shidantahay" : "with 2FA protection"}`}
        />
        <AdminKpiCard
          label={so ? "La Joojiyay / Xayiran" : "Suspended Accounts"}
          value={stats.disabled}
          icon="block"
          variant="danger"
          subtext={so ? "Galaangalka waa laga joojiyay" : "Restricted or locked access"}
        />
      </div>

      {/* Action Error Notification */}
      {actionError && (
        <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#EF4444]/25 text-[#EF4444] text-[13px] font-medium flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Icon name="error" size={20} />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError("")}
            className="text-[#EF4444] hover:opacity-75 cursor-pointer"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
      )}

      {/* Layer 3: Context Toolbar & Filtering */}
      <AdminContextBar
        searchPlaceholder={so ? "Raadi magaca, email-ka ama lambarka..." : "Search name, email, or phone..."}
        searchValue={search}
        onSearchChange={setSearch}
        filterTabs={[
          { key: "all", label: so ? "Dhammaan" : "All Accounts", count: users.length },
          { key: "active", label: so ? "Firfircoon" : "Active", count: stats.active },
          { key: "disabled", label: so ? "La Joojiyay" : "Disabled", count: stats.disabled },
        ]}
        activeTab={statusFilter}
        onTabChange={(k: string) => setStatusFilter(k as StatusFilter)}
        actions={
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-white text-[12px] font-semibold text-[#0F172A]">
              <Icon name="filter_alt" size={15} className="text-[#64748B]" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                className="bg-transparent border-none outline-none font-bold text-[#0F172A] cursor-pointer"
              >
                <option value="all">{so ? "Doorka: Dhammaan" : "Role: All"}</option>
                <option value="admin">{so ? "Kaliya Admin" : "Admins Only"}</option>
                <option value="member">{so ? "Kaliya Xubnaha" : "Members Only"}</option>
              </select>
            </div>

            {selected.size > 0 && (
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-[#E2E8F0] animate-in fade-in">
                <span className="text-[12px] font-bold text-[#0B6EF3] px-2">
                  {selected.size} {so ? "doortay" : "sel"}
                </span>
                <button
                  type="button"
                  onClick={() => bulkMutation.mutate("enable")}
                  disabled={bulkMutation.isPending}
                  className="px-2.5 py-1 text-[11px] font-bold bg-white text-[#10B981] rounded-lg border border-slate-200 hover:bg-emerald-50 cursor-pointer transition-colors"
                >
                  {so ? "Fur" : "Enable"}
                </button>
                <button
                  type="button"
                  onClick={() => bulkMutation.mutate("disable")}
                  disabled={bulkMutation.isPending}
                  className="px-2.5 py-1 text-[11px] font-bold bg-white text-[#F59E0B] rounded-lg border border-slate-200 hover:bg-amber-50 cursor-pointer transition-colors"
                >
                  {so ? "Jooji" : "Disable"}
                </button>
                <button
                  type="button"
                  onClick={() => bulkMutation.mutate("delete")}
                  disabled={bulkMutation.isPending}
                  className="px-2.5 py-1 text-[11px] font-bold bg-[#FEF2F2] text-[#EF4444] rounded-lg border border-[#EF4444]/20 hover:bg-rose-100 cursor-pointer transition-colors"
                >
                  {so ? "Tirtir" : "Delete"}
                </button>
              </div>
            )}
          </div>
        }
      />

      {/* Layer 4: Main Workspace Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                <th className="py-3.5 pl-5 pr-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-slate-300 text-[#0B6EF3] focus:ring-[#0B6EF3] cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3.5">{so ? "Xubin / Identity" : "Member Identity"}</th>
                <th className="px-4 py-3.5">{so ? "Xaalad" : "Account Status"}</th>
                <th className="px-4 py-3.5">{so ? "Doorka & Amniga" : "Role & Security"}</th>
                <th className="px-4 py-3.5">{so ? "Diiwaangashan" : "Joined"}</th>
                <th className="py-3.5 pl-4 pr-5 text-right">{so ? "Ficillo" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[13px] text-[#64748B]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Icon name="sync" size={24} className="animate-spin text-[#0B6EF3]" />
                      <span className="font-semibold">{so ? "Xogta xubnaha ayaa la keenayaa..." : "Loading directory profiles..."}</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center gap-2 text-[#64748B]">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                        <Icon name="person_search" size={26} />
                      </div>
                      <p className="text-[14px] font-bold text-[#0F172A]">
                        {so ? "Xubin lama helin" : "No matching members"}
                      </p>
                      <p className="text-[12px] text-[#64748B]">
                        {so
                          ? "Isku day inaad beddesho shuruudaha raadinta ama filter-ka."
                          : "Try adjusting your search criteria, clear status filters, or create a new user profile."}
                      </p>
                      <button
                        type="button"
                        onClick={openCreate}
                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B6EF3] text-white text-[12px] font-bold hover:bg-[#0958c7] cursor-pointer"
                      >
                        <Icon name="add" size={15} />
                        {so ? "Abuur Xubin" : "Add Profile"}
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((user) => {
                  const isChecked = selected.has(user.id);
                  const isUserAdmin = Boolean(user.isAdmin || user.role === "admin");

                  return (
                    <tr
                      key={user.id}
                      onClick={() => handleOpen360(user)}
                      className={`group hover:bg-[#F8FAFC]/80 transition-colors cursor-pointer ${
                        isChecked ? "bg-blue-50/40" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 pl-5 pr-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleOne(user.id)}
                          className="w-4 h-4 rounded border-slate-300 text-[#0B6EF3] focus:ring-[#0B6EF3] cursor-pointer"
                        />
                      </td>

                      {/* Identity & Avatar */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gradient-to-tr from-[#0B6EF3] to-[#20C773] text-white font-bold text-[12px] flex items-center justify-center shadow-xs shrink-0">
                            {user.avatarUrl ? (
                              <Image
                                src={user.avatarUrl}
                                alt={user.name}
                                fill
                                className="object-cover"
                                sizes="36px"
                              />
                            ) : (
                              getInitials(user.name)
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-bold text-[#0F172A] group-hover:text-[#0B6EF3] transition-colors truncate">
                                {user.name}
                              </span>
                              {isUserAdmin && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#0B6EF3]/10 text-[#0B6EF3] tracking-wide">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-[#64748B] truncate">
                              <span>{user.email}</span>
                              {user.phone && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span>{user.phone}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {statusBadge(user.status)}
                      </td>

                      {/* Role & 2FA */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[12px] font-bold ${
                              isUserAdmin ? "text-[#0B6EF3]" : "text-slate-700"
                            }`}
                          >
                            {isUserAdmin ? "Administrator" : "Member"}
                          </span>
                          {user.twoFactorEnabled && (
                            <span
                              className="inline-flex items-center text-[#10B981]"
                              title={so ? "2FA waa u shidan tahay" : "2FA Enabled"}
                            >
                              <Icon name="verified_user" size={14} />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-[12px] text-[#64748B]">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pl-4 pr-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {/* 360 View */}
                          <button
                            type="button"
                            onClick={(e) => handleOpen360(user, e)}
                            className="w-8 h-8 rounded-lg text-[#64748B] hover:text-[#0B6EF3] hover:bg-blue-50 flex items-center justify-center transition-colors cursor-pointer"
                            title={so ? "Arag Profile-ka 360" : "View 360 Profile"}
                          >
                            <Icon name="visibility" size={16} />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={(e) => openEdit(user, e)}
                            className="w-8 h-8 rounded-lg text-[#64748B] hover:text-[#0B6EF3] hover:bg-blue-50 flex items-center justify-center transition-colors cursor-pointer"
                            title={so ? "Wax ka beddel" : "Edit details"}
                          >
                            <Icon name="edit" size={16} />
                          </button>

                          {/* Hard Direct Route Link */}
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="w-8 h-8 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 flex items-center justify-center transition-colors"
                            title={so ? "Fur Bogga Xubinta" : "Open standalone page"}
                          >
                            <Icon name="open_in_new" size={16} />
                          </Link>

                          {/* Quick Toggle Status */}
                          {user.status === "disabled" ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                statusMutation.mutate({ id: user.id, status: "active" });
                              }}
                              className="w-8 h-8 rounded-lg text-[#10B981] hover:bg-emerald-50 flex items-center justify-center transition-colors cursor-pointer"
                              title={so ? "Dib u hawlgeli" : "Re-activate account"}
                            >
                              <Icon name="lock_open" size={16} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                statusMutation.mutate({ id: user.id, status: "disabled" });
                              }}
                              className="w-8 h-8 rounded-lg text-[#F59E0B] hover:bg-amber-50 flex items-center justify-center transition-colors cursor-pointer"
                              title={so ? "Jooji xubintan" : "Suspend account"}
                            >
                              <Icon name="lock" size={16} />
                            </button>
                          )}

                          {/* Soft Delete */}
                          <button
                            type="button"
                            onClick={(e) => handleSoftDelete(user.id, e)}
                            className="w-8 h-8 rounded-lg text-slate-400 hover:text-[#EF4444] hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                            title={so ? "Soft Delete" : "Soft delete member"}
                          >
                            <Icon name="delete" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Layer 5A: 360-Degree Member Drawer */}
      <AdminMemberDrawer
        member={selectedMember}
        isOpen={is360DrawerOpen}
        onClose={() => setIs360DrawerOpen(false)}
      />

      {/* Layer 5B: Edit / Create Member Slide-over Drawer */}
      {createDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setCreateDrawerOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl border-l border-[#E2E8F0] flex flex-col animate-in slide-in-from-right duration-250">
              {/* Header */}
              <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0B6EF3]/10 text-[#0B6EF3] flex items-center justify-center font-bold">
                    <Icon name={editingUser ? "edit" : "person_add"} size={18} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#0F172A]">
                      {editingUser
                        ? so
                          ? "Wax ka beddel Xubinta"
                          : "Modify Member Profile"
                        : so
                        ? "Diiwaangeli Xubin Cusub"
                        : "Create Member Account"}
                    </h3>
                    <p className="text-[11px] text-[#64748B]">
                      {editingUser
                        ? so
                          ? "Cusboonaysii xogta iyo xuquuqaha"
                          : "Update identity, status, and role"
                        : so
                        ? "Geli xogta akoonka cusub"
                        : "Enter user details and credentials"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateDrawerOpen(false)}
                  className="w-8 h-8 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveUser} className="flex-1 overflow-y-auto p-6 space-y-4">
                {actionError && (
                  <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#EF4444]/25 text-[#EF4444] text-[12px] font-medium flex items-center gap-2">
                    <Icon name="error" size={16} />
                    <span>{actionError}</span>
                  </div>
                )}

                {/* Identity Section */}
                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                    {so ? "Xogta Guud" : "General Information"}
                  </span>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-bold text-[#0F172A]">
                      {so ? "Magaca Buuxa" : "Full Name"} *
                    </span>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Maxamed Cali"
                      className="px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] font-medium text-[#0F172A] outline-none focus:border-[#0B6EF3] focus:bg-white transition-all"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-bold text-[#0F172A]">Email *</span>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="e.g. member@betterme.app"
                      className="px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] font-medium text-[#0F172A] outline-none focus:border-[#0B6EF3] focus:bg-white transition-all"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-bold text-[#0F172A]">
                      {editingUser
                        ? so
                          ? "Furaha Cusub (Kaliya haddii aad beddelayso)"
                          : "New Password (Leave blank to keep current)"
                        : so
                        ? "Furaha Sirta *"
                        : "Initial Password *"}
                    </span>
                    <input
                      type="password"
                      required={!editingUser}
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="••••••••"
                      className="px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] font-medium text-[#0F172A] outline-none focus:border-[#0B6EF3] focus:bg-white transition-all"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[12px] font-bold text-[#0F172A]">
                        {so ? "Telefoon" : "Phone"}
                      </span>
                      <input
                        type="text"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="+252..."
                        className="px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] outline-none focus:border-[#0B6EF3] focus:bg-white"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[12px] font-bold text-[#0F172A]">Timezone</span>
                      <input
                        type="text"
                        value={form.timezone}
                        onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
                        placeholder="Africa/Mogadishu"
                        className="px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] outline-none focus:border-[#0B6EF3] focus:bg-white"
                      />
                    </label>
                  </div>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-bold text-[#0F172A]">Avatar URL</span>
                    <input
                      type="url"
                      value={form.avatarUrl}
                      onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
                      placeholder="https://..."
                      className="px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] outline-none focus:border-[#0B6EF3] focus:bg-white"
                    />
                  </label>
                </div>

                {/* Status & Privileges */}
                <div className="pt-2 space-y-3">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                    {so ? "Xaaladda & Xuquuqaha" : "Status & Privileges"}
                  </span>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-bold text-[#0F172A]">
                      {so ? "Xaaladda Akoonka" : "Account Status"}
                    </span>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          status: (e.target.value as "active" | "inactive" | "disabled"),
                        }))
                      }
                      className="px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[13px] font-bold text-[#0F172A] outline-none focus:border-[#0B6EF3]"
                    >
                      <option value="active">{so ? "Firfircoon (Active)" : "Active"}</option>
                      <option value="inactive">{so ? "Aan Firfircoonayn (Inactive)" : "Inactive"}</option>
                      <option value="disabled">{so ? "La Joojiyay (Disabled)" : "Disabled / Locked"}</option>
                    </select>
                  </label>

                  {/* Toggle Admin */}
                  <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
                    <div>
                      <span className="text-[13px] font-bold text-[#0F172A] block">
                        {so ? "Xuquuqda Maamulaha (Admin)" : "Administrator Access"}
                      </span>
                      <span className="text-[11px] text-[#64748B]">
                        {so ? "Wuxuu geli karaa dashboard-ka maamulka" : "Grants full privileges across the Admin Panel"}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.isAdmin}
                      onChange={(e) => setForm((f) => ({ ...f, isAdmin: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300 text-[#0B6EF3] focus:ring-[#0B6EF3] cursor-pointer"
                    />
                  </div>

                  {/* Toggle 2FA */}
                  <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
                    <div>
                      <span className="text-[13px] font-bold text-[#0F172A] block">
                        {so ? "Amniga 2FA" : "Two-Factor Auth (2FA)"}
                      </span>
                      <span className="text-[11px] text-[#64748B]">
                        {so ? "Hubinta laba-tallaabo ah" : "Two-step verification status"}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.twoFactorEnabled}
                      onChange={(e) => setForm((f) => ({ ...f, twoFactorEnabled: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300 text-[#0B6EF3] focus:ring-[#0B6EF3] cursor-pointer"
                    />
                  </div>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-bold text-[#0F172A]">
                      {so ? "Faallooyin / Qoraallo (Notes)" : "Internal Notes"}
                    </span>
                    <textarea
                      rows={2}
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      placeholder={so ? "Qoraal gaar ah oo ku saabsan xubintan..." : "Optional admin notes regarding this member..."}
                      className="px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] outline-none focus:border-[#0B6EF3] focus:bg-white resize-none"
                    />
                  </label>
                </div>

                {/* Footer Save Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="w-full py-3 rounded-xl bg-[#0B6EF3] text-white text-[13px] font-bold hover:bg-[#0958c7] shadow-sm disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {saveMutation.isPending ? (
                      <>
                        <Icon name="sync" size={16} className="animate-spin" />
                        <span>{so ? "Waa la keydinayaa..." : "Saving Profile..."}</span>
                      </>
                    ) : (
                      <>
                        <Icon name="check" size={16} />
                        <span>
                          {editingUser
                            ? so
                              ? "Cusboonaysii Xubinta"
                              : "Update Member"
                            : so
                            ? "Abuur Xubin Cusub"
                            : "Create Member"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
