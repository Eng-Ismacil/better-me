"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";

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
}

type StatusFilter = "all" | "active" | "inactive" | "disabled";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  status: "active" as AdminUser["status"],
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

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);

  const normalize = (u: AdminUser): AdminUser => ({
    ...u,
    id: u.id || u._id || "",
    status: u.status || "active",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load users");
      const list = (data.users || data || []).map(normalize);
      setUsers(list);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (statusFilter !== "all" && (u.status || "active") !== statusFilter) {
        return false;
      }
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    });
  }, [users, search, statusFilter]);

  const allSelected =
    filtered.length > 0 && filtered.every((u) => selected.has(u.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((u) => u.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDrawerOpen(true);
  };

  const openEdit = (user: AdminUser) => {
    setEditing(user);
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
    setDrawerOpen(true);
  };

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
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

      const res = editing
        ? await fetch(`/api/admin/users/${editing.id}`, {
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
      setDrawerOpen(false);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (id: string, status: AdminUser["status"]) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const softDelete = async (id: string) => {
    if (
      !confirm(
        so
          ? "Ma hubtaa inaad soft-delete sameyso isticmaalahan?"
          : "Soft-delete this user?"
      )
    )
      return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const bulkAction = async (action: string) => {
    if (selected.size === 0) return;
    setBulkBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids: Array.from(selected) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bulk action failed");
      setSelected(new Set());
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBulkBusy(false);
    }
  };

  const statusBadge = (status?: string) => {
    const s = status || "active";
    const styles: Record<string, string> = {
      active: "bg-[#ECFDF3] text-[#20C773] border-[#20C773]/20",
      inactive: "bg-[#F3F4F6] text-[#6B7280] border-[#D1D5DB]",
      disabled: "bg-[#FEF2F2] text-[#EF4444] border-[#EF4444]/20",
    };
    return (
      <span
        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${styles[s] || styles.active}`}
      >
        {s}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#111827] font-[family-name:var(--font-headline)]">
            {so ? "Maamulka Profile-yada" : "Profile Management"}
          </h1>
          <p className="text-[13px] text-[#667085] mt-1">
            {so
              ? "Maamul xogta profile-ka, xaaladda account-ka iyo gelitaanka."
              : "Manage profile details, account status, and access settings."}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B6EF3] text-white text-[13px] font-bold hover:bg-[#0958c7] transition-colors cursor-pointer"
        >
          <Icon name="person_add" size={16} />
          {so ? "Ku dar" : "Add User"}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#EF4444]/25 text-[#EF4444] text-[13px] font-semibold flex items-center gap-2">
          <Icon name="error" size={18} />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="ml-auto text-[#EF4444] cursor-pointer"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#E7ECF3] p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Icon
            name="search"
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={so ? "Raadi magac ama email..." : "Search name or email..."}
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#E7ECF3] bg-[#FAFBFD] text-[13px] outline-none focus:border-[#0B6EF3] focus:bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="px-3 py-2.5 rounded-xl border border-[#E7ECF3] bg-white text-[13px] font-semibold text-[#111827] outline-none focus:border-[#0B6EF3]"
        >
          <option value="all">{so ? "Dhammaan" : "All statuses"}</option>
          <option value="active">{so ? "Firfircoon" : "Active"}</option>
          <option value="inactive">{so ? "Aan firfircoonayn" : "Inactive"}</option>
          <option value="disabled">{so ? "La joojiyay" : "Disabled"}</option>
        </select>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-[#EFF6FF] border border-[#0B6EF3]/20">
          <span className="text-[12px] font-bold text-[#0B6EF3]">
            {selected.size} {so ? "la doortay" : "selected"}
          </span>
          <button
            type="button"
            disabled={bulkBusy}
            onClick={() => bulkAction("disable")}
            className="px-3 py-1.5 rounded-lg bg-white border border-[#E7ECF3] text-[12px] font-bold cursor-pointer disabled:opacity-50"
          >
            {so ? "Jooji" : "Disable"}
          </button>
          <button
            type="button"
            disabled={bulkBusy}
            onClick={() => bulkAction("enable")}
            className="px-3 py-1.5 rounded-lg bg-white border border-[#E7ECF3] text-[12px] font-bold cursor-pointer disabled:opacity-50"
          >
            {so ? "Fur" : "Enable"}
          </button>
          <button
            type="button"
            disabled={bulkBusy}
            onClick={() => bulkAction("delete")}
            className="px-3 py-1.5 rounded-lg bg-[#FEF2F2] border border-[#EF4444]/20 text-[#EF4444] text-[12px] font-bold cursor-pointer disabled:opacity-50"
          >
            {so ? "Soft Delete" : "Soft Delete"}
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#E7ECF3] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-[#FAFBFD] border-b border-[#E7ECF3]">
              <tr className="text-[11px] uppercase tracking-wider text-[#667085]">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="rounded border-[#D1D5DB]"
                  />
                </th>
                <th className="px-4 py-3 font-bold">{so ? "Isticmaale" : "User"}</th>
                <th className="px-4 py-3 font-bold">{so ? "Xaalad" : "Status"}</th>
                <th className="px-4 py-3 font-bold">Role</th>
                <th className="px-4 py-3 font-bold">{so ? "Abuuray" : "Created"}</th>
                <th className="px-4 py-3 font-bold text-right">
                  {so ? "Ficillo" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[13px] text-[#667085]">
                    {so ? "Waa la rarayaa..." : "Loading users..."}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[13px] text-[#667085]">
                    {so ? "Isticmaale lama helin" : "No users found"}
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[#F0F2F5] hover:bg-[#FAFBFD]/80"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(user.id)}
                        onChange={() => toggleOne(user.id)}
                        className="rounded border-[#D1D5DB]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="min-w-0">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="text-[13px] font-bold text-[#111827] hover:text-[#0B6EF3] block truncate"
                        >
                          {user.name}
                        </Link>
                        <p className="text-[11px] text-[#667085] truncate">
                          {user.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">{statusBadge(user.status)}</td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] font-semibold text-[#667085]">
                        {user.isAdmin || user.role === "admin" ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#667085]">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(user)}
                          className="w-8 h-8 rounded-lg hover:bg-[#EFF6FF] text-[#0B6EF3] flex items-center justify-center cursor-pointer"
                          title="Edit"
                        >
                          <Icon name="edit" size={16} />
                        </button>
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="w-8 h-8 rounded-lg hover:bg-[#F3F4F6] text-[#667085] flex items-center justify-center"
                          title="Open"
                        >
                          <Icon name="open_in_new" size={16} />
                        </Link>
                        {user.status === "disabled" ? (
                          <button
                            type="button"
                            onClick={() => setStatus(user.id, "active")}
                            className="w-8 h-8 rounded-lg hover:bg-[#ECFDF3] text-[#20C773] flex items-center justify-center cursor-pointer"
                            title="Enable"
                          >
                            <Icon name="lock_open" size={16} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setStatus(user.id, "disabled")}
                            className="w-8 h-8 rounded-lg hover:bg-[#FFF7ED] text-[#F59E0B] flex items-center justify-center cursor-pointer"
                            title="Disable"
                          >
                            <Icon name="lock" size={16} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => softDelete(user.id)}
                          className="w-8 h-8 rounded-lg hover:bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center cursor-pointer"
                          title="Soft delete"
                        >
                          <Icon name="delete" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close"
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-[#E7ECF3] overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="sticky top-0 bg-white border-b border-[#E7ECF3] px-5 py-4 flex items-center justify-between z-10">
              <h3 className="text-[16px] font-bold text-[#111827]">
                {editing
                  ? so
                    ? "Tafatir Isticmaale"
                    : "Edit User"
                  : so
                  ? "Isticmaale Cusub"
                  : "New User"}
              </h3>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-[#F3F4F6] flex items-center justify-center cursor-pointer"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={saveUser} className="p-5 flex flex-col gap-4">
              {(
                [
                  ["name", so ? "Magaca" : "Name", "text"],
                  ["email", "Email", "email"],
                  [
                    "password",
                    editing
                      ? so
                        ? "Furaha cusub (ikhtiyaar)"
                        : "New password (optional)"
                      : so
                      ? "Furaha sirta"
                      : "Password",
                    "password",
                  ],
                  ["phone", so ? "Telefoon" : "Phone", "text"],
                  ["timezone", so ? "Timezone" : "Timezone", "text"],
                  ["avatarUrl", "Avatar URL", "text"],
                ] as const
              ).map(([key, label, type]) => (
                <label key={key} className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-bold text-[#111827]">
                    {label}
                  </span>
                  <input
                    type={type}
                    value={form[key] as string}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                    required={key === "name" || key === "email" || (!editing && key === "password")}
                    className="px-3 py-2.5 rounded-xl border border-[#E7ECF3] bg-[#FAFBFD] text-[13px] outline-none focus:border-[#0B6EF3] focus:bg-white"
                  />
                </label>
              ))}

              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-bold text-[#111827]">
                  {so ? "Bio" : "Bio"}
                </span>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  className="px-3 py-2.5 rounded-xl border border-[#E7ECF3] bg-[#FAFBFD] text-[13px] outline-none focus:border-[#0B6EF3] focus:bg-white resize-none"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-bold text-[#111827]">
                  {so ? "Xaalad" : "Status"}
                </span>
                <select
                  value={form.status || "active"}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      status: e.target.value as AdminUser["status"],
                    }))
                  }
                  className="px-3 py-2.5 rounded-xl border border-[#E7ECF3] bg-white text-[13px] font-semibold outline-none focus:border-[#0B6EF3]"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="disabled">Disabled</option>
                </select>
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-[#E7ECF3]">
                <span className="text-[13px] font-bold text-[#111827]">Admin</span>
                <input
                  type="checkbox"
                  checked={form.isAdmin}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isAdmin: e.target.checked }))
                  }
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-[#E7ECF3]">
                <span className="text-[13px] font-bold text-[#111827]">2FA</span>
                <input
                  type="checkbox"
                  checked={form.twoFactorEnabled}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      twoFactorEnabled: e.target.checked,
                    }))
                  }
                />
              </label>

              <button
                type="submit"
                disabled={saving}
                className="mt-2 w-full py-3 rounded-xl bg-[#0B6EF3] text-white text-[14px] font-bold hover:bg-[#0958c7] disabled:opacity-50 cursor-pointer"
              >
                {saving
                  ? so
                    ? "Waa la keydinayaa..."
                    : "Saving..."
                  : so
                  ? "Keydi"
                  : "Save User"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
