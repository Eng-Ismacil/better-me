"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";
import type { AdminUser } from "@/components/admin/AdminUsersClient";

export default function AdminUserDetailClient() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id || "");
  const { language } = useTranslation();
  const so = language === "so";

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    status: "active",
    isAdmin: false,
    twoFactorEnabled: false,
    timezone: "UTC",
    phone: "",
    notes: "",
    avatarUrl: "",
    memberSince: "",
  });

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "User not found");
      const u: AdminUser = data.user || data;
      const normalized = { ...u, id: u.id || u._id || id };
      setUser(normalized);
      setForm({
        name: normalized.name || "",
        email: normalized.email || "",
        password: "",
        status: normalized.status || "active",
        isAdmin: Boolean(normalized.isAdmin || normalized.role === "admin"),
        twoFactorEnabled: Boolean(normalized.twoFactorEnabled),
        timezone: normalized.timezone || "UTC",
        phone: normalized.phone || "",
        notes: normalized.notes || "",
        avatarUrl: normalized.avatarUrl || "",
        memberSince: normalized.memberSince || "",
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
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
        memberSince: form.memberSince,
      };
      if (form.password) payload.password = form.password;

      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSuccess(so ? "Waa la keydiyay" : "User saved successfully");
      setForm((f) => ({ ...f, password: "" }));
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const softDelete = async () => {
    if (!confirm(so ? "Soft-delete isticmaalahan?" : "Soft-delete this user?"))
      return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Delete failed");
      return;
    }
    router.push("/admin/users");
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-[13px] text-[#667085]">
        {so ? "Waa la rarayaa..." : "Loading user..."}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-16 text-center">
        <p className="text-[14px] text-[#667085] mb-4">
          {error || (so ? "Isticmaale lama helin" : "User not found")}
        </p>
        <Link href="/admin/users" className="text-[#0B6EF3] font-bold text-[13px]">
          ← {so ? "Ku noqo" : "Back to users"}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/users"
          className="w-9 h-9 rounded-xl border border-[#E7ECF3] bg-white flex items-center justify-center text-[#667085] hover:text-[#0B6EF3]"
        >
          <Icon name="arrow_back" size={18} />
        </Link>
        <div>
          <h1 className="text-[22px] font-extrabold text-[#111827] font-[family-name:var(--font-headline)]">
            {so ? "Tafatir Isticmaale" : "Edit User"}
          </h1>
          <p className="text-[12px] text-[#667085]">{user.email}</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#EF4444]/25 text-[#EF4444] text-[13px] font-semibold">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-xl bg-[#ECFDF3] border border-[#20C773]/25 text-[#20C773] text-[13px] font-semibold">
          {success}
        </div>
      )}

      <form
        onSubmit={save}
        className="bg-white rounded-2xl border border-[#E7ECF3] p-5 sm:p-6 flex flex-col gap-4"
      >
        {(
          [
            ["name", so ? "Magaca buuxa" : "Full name", "text"],
            ["email", "Email", "email"],
            [
              "password",
              so ? "Furaha cusub (ikhtiyaar)" : "New password (optional)",
              "password",
            ],
            ["phone", so ? "Telefoon" : "Phone", "text"],
            ["timezone", "Timezone", "text"],
            ["memberSince", so ? "Xubin tan iyo" : "Member since", "text"],
            ["avatarUrl", "Avatar URL", "url"],
          ] as const
        ).map(([key, label, type]) => (
          <label key={key} className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold text-[#111827]">{label}</span>
            <input
              type={type}
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              required={key === "name" || key === "email"}
              className="px-3 py-2.5 rounded-xl border border-[#E7ECF3] bg-[#FAFBFD] text-[13px] outline-none focus:border-[#0B6EF3] focus:bg-white"
            />
          </label>
        ))}

        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-bold text-[#111827]">
            {so ? "Qoraal / Notes" : "Notes"}
          </span>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={4}
            className="px-3 py-2.5 rounded-xl border border-[#E7ECF3] bg-[#FAFBFD] text-[13px] outline-none focus:border-[#0B6EF3] focus:bg-white resize-none"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-bold text-[#111827]">
            {so ? "Xaalad" : "Status"}
          </span>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            className="px-3 py-2.5 rounded-xl border border-[#E7ECF3] bg-white text-[13px] font-semibold outline-none focus:border-[#0B6EF3]"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="disabled">Disabled</option>
          </select>
        </label>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="flex items-center justify-between p-3 rounded-xl border border-[#E7ECF3]">
            <span className="text-[13px] font-bold">Admin</span>
            <input
              type="checkbox"
              checked={form.isAdmin}
              onChange={(e) =>
                setForm((f) => ({ ...f, isAdmin: e.target.checked }))
              }
            />
          </label>
          <label className="flex items-center justify-between p-3 rounded-xl border border-[#E7ECF3]">
            <span className="text-[13px] font-bold">2FA Enabled</span>
            <input
              type="checkbox"
              checked={form.twoFactorEnabled}
              onChange={(e) =>
                setForm((f) => ({ ...f, twoFactorEnabled: e.target.checked }))
              }
            />
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-[#0B6EF3] text-white text-[14px] font-bold hover:bg-[#0958c7] disabled:opacity-50 cursor-pointer"
          >
            {saving
              ? so
                ? "Waa la keydinayaa..."
                : "Saving..."
              : so
              ? "Keydi Isbedelada"
              : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={softDelete}
            className="px-4 py-3 rounded-xl bg-[#FEF2F2] text-[#EF4444] border border-[#EF4444]/20 text-[13px] font-bold cursor-pointer"
          >
            {so ? "Soft Delete" : "Soft Delete"}
          </button>
        </div>
      </form>
    </div>
  );
}
