"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";
import type { AdminUser } from "@/components/admin/AdminUsersClient";
import AdminPageHeader from "@/components/admin/design-system/AdminPageHeader";

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
      setSuccess(so ? "Isbeddellada waa la keydiyay!" : "Member profile updated successfully!");
      setForm((f) => ({ ...f, password: "" }));
      await load();
      setTimeout(() => setSuccess(""), 3500);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const softDelete = async () => {
    if (!confirm(so ? "Ma hubtaa inaad soft-delete ku sameyso xubintan?" : "Soft-delete this member account?"))
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
      <div className="py-24 text-center text-[13px] text-[#64748B]">
        <Icon name="sync" size={32} className="animate-spin text-[#0B6EF3] mx-auto mb-2" />
        <span className="font-semibold">{so ? "Xogta xubinta ayaa la soo rarayaa..." : "Loading member profile..."}</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-20 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-2">
          <Icon name="person_off" size={26} />
        </div>
        <p className="text-[15px] font-bold text-[#0F172A] mb-1">
          {error || (so ? "Xubin lama helin" : "Member not found")}
        </p>
        <p className="text-[12px] text-[#64748B] mb-4">
          {so ? "Akoonkan lagama yaabo inuu ka jiro database-ka." : "This account might have been purged or does not exist."}
        </p>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B6EF3] text-white font-bold text-[13px]"
        >
          <Icon name="arrow_back" size={16} />
          <span>{so ? "Ku noqo Xubnaha" : "Back to Directory"}</span>
        </Link>
      </div>
    );
  }

  const initials =
    user.name
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "MB";

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Header */}
      <AdminPageHeader
        title={user.name || "Member Profile"}
        subtitle={`Member ID: ${user.id} · Registered: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}`}
        badges={[
          { label: "Status", value: user.status || "active", variant: user.status === "active" ? "success" : "danger" },
          { label: "Role", value: user.isAdmin || user.role === "admin" ? "Administrator" : "Member", variant: "blue" },
        ]}
        actions={
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-white text-[#0F172A] text-[13px] font-bold hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Icon name="arrow_back" size={16} />
            <span>{so ? "Ku Noqo Liiska" : "Back to Directory"}</span>
          </Link>
        }
      />

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#EF4444]/25 text-[#EF4444] text-[13px] font-medium flex items-center justify-between shadow-xs">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} className="cursor-pointer text-[#EF4444]">
            <Icon name="close" size={18} />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-[#ECFDF3] border border-[#10B981]/25 text-[#059669] text-[13px] font-medium flex items-center justify-between shadow-xs animate-in fade-in">
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess("")} className="cursor-pointer text-[#059669]">
            <Icon name="close" size={18} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Avatar Profile Card (4 cols) */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col items-center text-center">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-tr from-[#0B6EF3] to-[#20C773] text-white font-bold text-[22px] flex items-center justify-center shadow-md mb-3 border-4 border-white">
              {form.avatarUrl ? (
                <Image
                  src={form.avatarUrl}
                  alt={user.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                initials
              )}
            </div>

            <h3 className="text-[17px] font-extrabold text-[#0F172A]">{user.name}</h3>
            <p className="text-[12px] text-[#64748B] mt-0.5">{user.email}</p>

            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF3] text-[#10B981] border border-[#10B981]/20 uppercase">
                {user.status || "active"}
              </span>
              {(user.isAdmin || user.role === "admin") && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#0B6EF3] border border-[#0B6EF3]/20">
                  ADMIN
                </span>
              )}
            </div>

            {user.notes && (
              <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-left w-full">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Bio / Notes
                </span>
                <p className="text-[12px] text-slate-700 mt-1 leading-relaxed">{user.notes}</p>
              </div>
            )}

            <button
              type="button"
              onClick={softDelete}
              className="mt-6 w-full py-2.5 rounded-xl bg-[#FEF2F2] hover:bg-rose-100 text-[#EF4444] border border-[#EF4444]/20 text-[12px] font-bold transition-colors cursor-pointer"
            >
              <Icon name="delete" size={16} className="inline mr-1 -mt-0.5" />
              <span>{so ? "Soft Delete Akoonka" : "Soft-Delete Account"}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Edit Profile Form (8 cols) */}
        <div className="md:col-span-8 flex flex-col gap-4">
          <form
            onSubmit={save}
            className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col gap-4"
          >
            <div className="border-b border-[#F1F5F9] pb-3 mb-1">
              <h3 className="text-[15px] font-bold text-[#0F172A]">
                {so ? "Xogta Guud & Amniga" : "Account Credentials & Profile Details"}
              </h3>
              <p className="text-[12px] text-[#64748B]">
                {so ? "Tafatir macluumaadka akoonka iyo heerarka oggolaanshaha." : "Modify identity parameters and access entitlements."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-bold text-[#0F172A]">{so ? "Magaca Buuxa" : "Full Name"} *</span>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] outline-none focus:border-[#0B6EF3] focus:bg-white"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-bold text-[#0F172A]">Email *</span>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] outline-none focus:border-[#0B6EF3] focus:bg-white"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-bold text-[#0F172A]">
                  {so ? "Furaha Cusub (Kaliya haddii aad beddelayso)" : "New Password (Leave blank to keep)"}
                </span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] outline-none focus:border-[#0B6EF3] focus:bg-white"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-bold text-[#0F172A]">{so ? "Telefoon" : "Phone"}</span>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] outline-none focus:border-[#0B6EF3] focus:bg-white"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-bold text-[#0F172A]">Timezone</span>
                <input
                  type="text"
                  value={form.timezone}
                  onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
                  className="px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] outline-none focus:border-[#0B6EF3] focus:bg-white"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-bold text-[#0F172A]">{so ? "Xaalad" : "Status"}</span>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[13px] font-bold text-[#0F172A] outline-none focus:border-[#0B6EF3]"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="disabled">Disabled</option>
                </select>
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-bold text-[#0F172A]">Avatar URL</span>
              <input
                type="url"
                value={form.avatarUrl}
                onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
                className="px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] outline-none focus:border-[#0B6EF3] focus:bg-white"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-bold text-[#0F172A]">{so ? "Faallo / Notes" : "Internal Notes"}</span>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] outline-none focus:border-[#0B6EF3] focus:bg-white resize-none"
              />
            </label>

            {/* Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
                <div>
                  <span className="text-[13px] font-bold text-[#0F172A] block">Admin Privileges</span>
                  <span className="text-[11px] text-[#64748B]">Full panel access</span>
                </div>
                <input
                  type="checkbox"
                  checked={form.isAdmin}
                  onChange={(e) => setForm((f) => ({ ...f, isAdmin: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-[#0B6EF3] focus:ring-[#0B6EF3] cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
                <div>
                  <span className="text-[13px] font-bold text-[#0F172A] block">Two-Factor Auth</span>
                  <span className="text-[11px] text-[#64748B]">2FA protection</span>
                </div>
                <input
                  type="checkbox"
                  checked={form.twoFactorEnabled}
                  onChange={(e) => setForm((f) => ({ ...f, twoFactorEnabled: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-[#0B6EF3] focus:ring-[#0B6EF3] cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-[#0B6EF3] text-white text-[13px] font-bold hover:bg-[#0958c7] shadow-sm disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Icon name="sync" size={16} className="animate-spin" />
                    <span>{so ? "Waa la keydinayaa..." : "Saving Changes..."}</span>
                  </>
                ) : (
                  <>
                    <Icon name="check" size={16} />
                    <span>{so ? "Keydi Isbeddelada" : "Save Changes"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
