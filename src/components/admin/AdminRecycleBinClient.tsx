"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";
import AdminPageHeader from "@/components/admin/design-system/AdminPageHeader";
import AdminKpiCard from "@/components/admin/design-system/AdminKpiCard";
import AdminContextBar from "@/components/admin/design-system/AdminContextBar";

interface DeletedUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  deletedAt?: string;
  status?: string;
}

export default function AdminRecycleBinClient() {
  const { language } = useTranslation();
  const so = language === "so";

  const [users, setUsers] = useState<DeletedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [purgeConfirmId, setPurgeConfirmId] = useState<string | null>(null);

  const normalize = (u: DeletedUser) => ({
    ...u,
    id: u.id || u._id || "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      const res = await fetch(`/api/admin/recycle-bin?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load recycle bin");
      setUsers((data.users || []).map(normalize));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [users, search]);

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

  const restore = async (ids: string[]) => {
    if (!ids.length) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/recycle-bin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Restore failed");
      setSelected(new Set());
      setSuccess(
        so
          ? `${data.restored || ids.length} akoon ayaa si buuxda dib loogu soo celiyay!`
          : `Successfully restored ${data.restored || ids.length} member accounts with full streak history!`
      );
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const permanentDelete = async (ids: string[]) => {
    if (!ids.length) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/recycle-bin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setSelected(new Set());
      setPurgeConfirmId(null);
      setSuccess(
        so
          ? `${data.deleted || ids.length} akoon ayaa si joogto ah loo masaxay.`
          : `Permanently purged ${data.deleted || ids.length} accounts from database.`
      );
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
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
        title={so ? "Sanduuqa Dib-u-soo-celinta & Masaxaadda" : "Data Recovery Vault & Recycle Bin"}
        subtitle={
          so
            ? "Akoonnada soft-delete-ka lagu sameeyay si ammaan ah ayaad dib ugu soo celin kartaa ama joogto ugu masaxi kartaa."
            : "Safe staging vault for soft-deleted member profiles. Restore accounts with preserved streaks or execute permanent purges."
        }
        badges={[
          { label: so ? "Ku Jira Sanduuqa" : "In Vault", value: users.length, variant: "neutral" },
          { label: so ? "Dib loo heli karaa" : "Recoverable", value: "100%", variant: "success" },
          { label: "Policy", value: "30-Day Stage", variant: "blue" },
        ]}
        actions={
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="p-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-colors cursor-pointer"
            title={so ? "Dib u cusboonaysii" : "Refresh vault"}
          >
            <Icon name="refresh" size={18} className={loading ? "animate-spin text-[#0B6EF3]" : ""} />
          </button>
        }
      />

      {/* Layer 2: Summary Metrics (KPI Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminKpiCard
          label={so ? "Ku Jira Sanduuqa" : "Staged in Vault"}
          value={users.length}
          icon="auto_delete"
          variant="danger"
          subtext={so ? "Akoonno sugaya dib-u-soo-celin" : "Soft-deleted accounts pending action"}
        />
        <AdminKpiCard
          label={so ? "Badbaadada Xogta" : "Data Integrity"}
          value="Preserved"
          icon="verified"
          variant="success"
          subtext={so ? "Caadooyinka & streaks-ku waa badbaado" : "Streaks & habits fully intact"}
        />
        <AdminKpiCard
          label={so ? "Xeerka Haysashada" : "Retention Period"}
          value="30 Days"
          icon="schedule"
          variant="blue"
          subtext={so ? "Muddada dib-u-soo-celinta" : "Grace window before final purge"}
        />
        <AdminKpiCard
          label={so ? "Amniga Masaxaadda" : "Purge Protocol"}
          value="Audit-Logged"
          icon="security"
          variant="neutral"
          subtext={so ? "Ficil kasta diiwaan baa laga hayaa" : "Cryptographically logged in audit trail"}
        />
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#EF4444]/25 text-[#EF4444] text-[13px] font-medium flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Icon name="error" size={20} />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError("")} className="cursor-pointer text-[#EF4444]">
            <Icon name="close" size={18} />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-[#ECFDF3] border border-[#10B981]/25 text-[#059669] text-[13px] font-medium flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Icon name="check_circle" size={20} />
            <span>{success}</span>
          </div>
          <button type="button" onClick={() => setSuccess("")} className="cursor-pointer text-[#059669]">
            <Icon name="close" size={18} />
          </button>
        </div>
      )}

      {/* Layer 3: Context Toolbar */}
      <AdminContextBar
        searchPlaceholder={so ? "Ka raadi sanduuqa magac ama email..." : "Search soft-deleted accounts by name or email..."}
        searchValue={search}
        onSearchChange={setSearch}
        actions={
          selected.size > 0 ? (
            <div className="flex items-center gap-2 animate-in fade-in">
              <span className="text-[12px] font-bold text-[#0B6EF3] px-2">
                {selected.size} {so ? "la doortay" : "selected"}
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => restore(Array.from(selected))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ECFDF3] hover:bg-emerald-100 text-[#059669] text-[12px] font-bold border border-[#10B981]/20 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Icon name="restore_from_trash" size={16} />
                <span>{so ? "Soo Celi Kuwa Doortay" : "Restore Selected"}</span>
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (confirm(so ? "Ma hubtaa inaad joogto u masaxdo kuwaan la doortay?" : "Permanently purge selected accounts?")) {
                    permanentDelete(Array.from(selected));
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FEF2F2] hover:bg-rose-100 text-[#EF4444] text-[12px] font-bold border border-[#EF4444]/20 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Icon name="delete_forever" size={16} />
                <span>{so ? "Joogto u Masax" : "Purge Permanently"}</span>
              </button>
            </div>
          ) : undefined
        }
      />

      {/* Layer 4: Main Workspace Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left border-collapse">
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
                <th className="px-4 py-3.5">{so ? "Xubin / Akoon" : "Member Profile"}</th>
                <th className="px-4 py-3.5">{so ? "Taariikhda La Tirtiray" : "Deleted Date"}</th>
                <th className="px-4 py-3.5">{so ? "Xaaladda Sanduuqa" : "Vault State"}</th>
                <th className="py-3.5 pl-4 pr-5 text-right">{so ? "Ficillo" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-[13px] text-[#64748B]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Icon name="sync" size={24} className="animate-spin text-[#0B6EF3]" />
                      <span className="font-semibold">{so ? "Sanduuqa ayaa la baarayaa..." : "Scanning recycle vault..."}</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center gap-2 text-[#64748B]">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#10B981] flex items-center justify-center mb-1">
                        <Icon name="check_circle" size={28} />
                      </div>
                      <p className="text-[14px] font-bold text-[#0F172A]">
                        {so ? "Sanduuqu waa madhan yahay" : "Recycle Vault Is Clean"}
                      </p>
                      <p className="text-[12px] text-[#64748B]">
                        {so
                          ? "Wax akoonno soft-delete ah laguma hayo sanduuqa hadda."
                          : "No accounts currently staged for deletion. Deleted user accounts will appear here for recovery."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((user) => {
                  const isChecked = selected.has(user.id);

                  return (
                    <tr
                      key={user.id}
                      className={`group hover:bg-[#F8FAFC]/80 transition-colors ${
                        isChecked ? "bg-blue-50/40" : ""
                      }`}
                    >
                      <td className="py-3.5 pl-5 pr-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleOne(user.id)}
                          className="w-4 h-4 rounded border-slate-300 text-[#0B6EF3] focus:ring-[#0B6EF3] cursor-pointer"
                        />
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 font-bold text-[12px] flex items-center justify-center shrink-0 border border-slate-200">
                            {getInitials(user.name)}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[13px] font-bold text-[#0F172A] block truncate">
                              {user.name}
                            </span>
                            <span className="text-[11px] text-[#64748B] block truncate">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-[12px] text-[#64748B]">
                        {user.deletedAt ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#0F172A]">
                              {new Date(user.deletedAt).toLocaleDateString()}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(user.deletedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-[#D97706] border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                          {so ? "Soft-Deleted (Sugaya)" : "Soft-Deleted (Recoverable)"}
                        </span>
                      </td>

                      <td className="py-3.5 pl-4 pr-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Restore */}
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => restore([user.id])}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#ECFDF3] hover:bg-emerald-100 text-[#059669] text-[12px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                            title={so ? "Dib u soo celi akoonka" : "Restore member"}
                          >
                            <Icon name="restore_from_trash" size={15} />
                            <span>{so ? "Soo Celi" : "Restore"}</span>
                          </button>

                          {/* Purge */}
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => setPurgeConfirmId(user.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-[#EF4444] hover:bg-rose-50 text-[12px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                            title={so ? "Joogto u masax" : "Purge permanently"}
                          >
                            <Icon name="delete_forever" size={16} />
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

      {/* Permanent Purge Safety Modal */}
      {purgeConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setPurgeConfirmId(null)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] p-6 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#EF4444] flex items-center justify-center mb-4">
              <Icon name="warning" size={26} />
            </div>

            <h3 className="text-[16px] font-bold text-[#0F172A]">
              {so ? "Ma hubtaa inaad joogto u masaxdo?" : "Permanent Deletion Warning"}
            </h3>
            <p className="text-[13px] text-[#64748B] mt-2 leading-relaxed">
              {so
                ? "Ficilkan lagama noqon karo. Dhammaan xogta streak-yada, hawlaha iyo taariikhda xubintan si buuxda ayaa looga masaxi doonaa database-ka."
                : "This action cannot be undone. Habit progress, streak milestones, and account records will be permanently erased from the database."}
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPurgeConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-[#0F172A] text-[13px] font-bold hover:bg-slate-50 cursor-pointer"
              >
                {so ? "Ka noqo" : "Cancel"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => permanentDelete([purgeConfirmId])}
                className="px-4 py-2 rounded-xl bg-[#EF4444] hover:bg-[#dc2626] text-white text-[13px] font-bold cursor-pointer disabled:opacity-50"
              >
                {busy ? (so ? "Waa la masaxayaa..." : "Purging...") : so ? "Haa, Masax Joogto" : "Confirm Permanent Purge"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
