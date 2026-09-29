"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";
import AdminPageHeader from "@/components/admin/design-system/AdminPageHeader";
import AdminKpiCard from "@/components/admin/design-system/AdminKpiCard";
import AdminContextBar from "@/components/admin/design-system/AdminContextBar";

interface FinanceRow {
  _id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  actorEmail?: string;
  type: "income" | "expense";
  amount: number;
  currency: string;
  category: string;
  title: string;
  notes?: string;
  date: string;
}

const emptyForm = {
  userId: "",
  type: "expense" as "income" | "expense",
  amount: "",
  currency: "USD",
  category: "general",
  title: "",
  notes: "",
  date: new Date().toISOString().slice(0, 10),
};

export default function AdminFinanceClient() {
  const { language } = useTranslation();
  const so = language === "so";

  const [scope, setScope] = useState<"members" | "operations">("members");
  const [rows, setRows] = useState<FinanceRow[]>([]);
  const [members, setMembers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"" | "income" | "expense">("");
  const [userFilter, setUserFilter] = useState("");
  const [editingId, setEditingId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (scope === "operations") params.set("scope", "admin");
      if (filter) params.set("type", filter);
      if (scope === "members" && userFilter) params.set("userId", userFilter);
      const res = await fetch(`/api/admin/finance?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load finance");
      setRows(data.transactions || []);
      setSummary(data.summary || { income: 0, expense: 0, balance: 0 });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filter, scope, userFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetch("/api/admin/users?limit=100")
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Could not load users");
          setMembers(
            (data.users || [])
              .map((user: { id?: string; _id?: string; name: string; email: string }) => ({
                id: user.id || user._id || "",
                name: user.name,
                email: user.email,
              }))
              .filter((user: { id: string }) => user.id)
          );
        })
        .catch((err: Error) => setError(err.message));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        r.title?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        r.userName?.toLowerCase().includes(q) ||
        r.userEmail?.toLowerCase().includes(q) ||
        r.notes?.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const params = scope === "operations" ? "?scope=admin" : "";
      const url = editingId
        ? `/api/admin/finance/${editingId}${params}`
        : `/api/admin/finance${params}`;
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          userId: scope === "members" ? form.userId : undefined,
          amount: Number(form.amount),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setFormOpen(false);
      setForm(emptyForm);
      setEditingId("");
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm(so ? "Ma hubtaa inaad tirtirto diiwaankan maaliyadeed?" : "Delete this finance entry?")) return;
    try {
      const params = scope === "operations" ? "?scope=admin" : "";
      const res = await fetch(`/api/admin/finance/${id}${params}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const openNew = () => {
    setEditingId("");
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (row: FinanceRow) => {
    setEditingId(row._id);
    setForm({
      userId: row.userId || "",
      type: row.type,
      amount: String(row.amount),
      currency: row.currency || "USD",
      category: row.category || "general",
      title: row.title || "",
      notes: row.notes || "",
      date: row.date || new Date().toISOString().slice(0, 10),
    });
    setFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Layer 1: Page Header */}
      <AdminPageHeader
        title={so ? "Maamulka Maaliyadda & Xisaabaadka" : "Financial Operations & Ledger"}
        subtitle={
          so
            ? "Kormeeri dakhliga, kharashaadka nidaamka, xisaabaadka xubnaha iyo xisaab-xidhka guud."
            : "Audit dual-scope financial flows, member transaction records, operational expenditures, and platform balances."
        }
        badges={[
          { label: so ? "Haraaga" : "Net Balance", value: fmt(summary.balance), variant: summary.balance >= 0 ? "success" : "danger" },
          { label: so ? "Qaybta" : "Ledger Scope", value: scope === "members" ? "Member Accounts" : "BetterMe Operations", variant: "blue" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="p-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-colors cursor-pointer"
              title={so ? "Dib u cusboonaysii" : "Refresh ledger"}
            >
              <Icon name="refresh" size={18} className={loading ? "animate-spin text-[#0B6EF3]" : ""} />
            </button>
            <button
              type="button"
              onClick={openNew}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B6EF3] text-white text-[13px] font-bold hover:bg-[#0958c7] shadow-sm transition-all cursor-pointer"
            >
              <Icon name="add" size={17} />
              <span>{so ? "Geli Diiwaan Cusub" : "Record Transaction"}</span>
            </button>
          </div>
        }
      />

      {/* Layer 2: Summary Metrics (KPI Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminKpiCard
          label={so ? "Wadarta Dakhliga (Inflow)" : "Gross Inflow"}
          value={fmt(summary.income)}
          icon="trending_up"
          variant="success"
          subtext={so ? "Isku-geynta dakhliga soo galay" : "Total recorded inflows"}
        />
        <AdminKpiCard
          label={so ? "Wadarta Kharashka (Outflow)" : "Operational Outflow"}
          value={fmt(summary.expense)}
          icon="trending_down"
          variant="danger"
          subtext={so ? "Kharashaadka baxay" : "Expenditures and member expenses"}
        />
        <AdminKpiCard
          label={so ? "Haraaga Saxda Ah (Net Balance)" : "Net Operating Balance"}
          value={fmt(summary.balance)}
          icon="account_balance_wallet"
          variant="blue"
          subtext={so ? "Farqiga u dhexeeya dakhliga & kharashka" : "Calculated balance reserve"}
        />
        <AdminKpiCard
          label={so ? "Dhaqdhaqaaqyada" : "Transaction Count"}
          value={rows.length}
          icon="receipt_long"
          variant="neutral"
          subtext={so ? "Tirada guud ee diiwaanada" : "Active ledger transaction rows"}
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

      {/* Scope Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setScope("members");
              setUserFilter("");
              setEditingId("");
              setFormOpen(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
              scope === "members"
                ? "bg-white text-[#0B6EF3] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Icon name="groups" size={17} />
            <span>{so ? "Maaliyadda Xubnaha (Member Ledger)" : "Member Financials"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setScope("operations");
              setUserFilter("");
              setEditingId("");
              setFormOpen(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
              scope === "operations"
                ? "bg-white text-[#0B6EF3] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Icon name="account_balance" size={17} />
            <span>{so ? "Kharashka Nidaamka (Operations Ledger)" : "Platform Operations"}</span>
          </button>
        </div>

        {scope === "members" && (
          <div className="flex items-center gap-2 pr-1">
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-[12px] font-semibold text-slate-700 outline-none focus:border-[#0B6EF3] cursor-pointer"
            >
              <option value="">{so ? "Dhammaan Xubnaha" : "All Members"}</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Layer 3: Context Toolbar */}
      <AdminContextBar
        searchPlaceholder={so ? "Raadi cinwaan, qayb, ama email..." : "Filter transactions by title, category, or email..."}
        searchValue={search}
        onSearchChange={setSearch}
        filterTabs={[
          { key: "", label: so ? "Dhammaan" : "All Entries", count: rows.length },
          { key: "income", label: so ? "Dakhli (+)" : "Incomes (+)" },
          { key: "expense", label: so ? "Kharash (-)" : "Expenses (-)" },
        ]}
        activeTab={filter}
        onTabChange={(k) => setFilter(k as "" | "income" | "expense")}
      />

      {/* Layer 4: Main Workspace Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                <th className="py-3.5 pl-5 pr-3">{so ? "Taariikh" : "Date"}</th>
                <th className="px-4 py-3.5">
                  {scope === "members" ? (so ? "Xubin" : "Member") : so ? "Qaybta" : "Category"}
                </th>
                <th className="px-4 py-3.5">{so ? "Cinwaanka & Faahfaahinta" : "Title & Notes"}</th>
                <th className="px-4 py-3.5">{so ? "Nooca" : "Type"}</th>
                <th className="px-4 py-3.5 text-right">{so ? "Qadarka" : "Amount"}</th>
                <th className="py-3.5 pl-4 pr-5 text-right">{so ? "Ficillo" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[13px] text-[#64748B]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Icon name="sync" size={24} className="animate-spin text-[#0B6EF3]" />
                      <span className="font-semibold">{so ? "Xisaabaadka ayaa la soo rarayaa..." : "Syncing financial ledger..."}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center gap-2 text-[#64748B]">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                        <Icon name="receipt" size={26} />
                      </div>
                      <p className="text-[14px] font-bold text-[#0F172A]">
                        {so ? "Diiwaan ma jiro" : "No matching transactions"}
                      </p>
                      <p className="text-[12px] text-[#64748B]">
                        {so
                          ? "Geli xog maaliyadeed cusub adoo isticmaalaya badhanka kore."
                          : "Record an income or expense transaction to populate this ledger view."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const isIncome = row.type === "income";

                  return (
                    <tr key={row._id} className="group hover:bg-[#F8FAFC]/80 transition-colors">
                      {/* Date */}
                      <td className="py-3.5 pl-5 pr-3 whitespace-nowrap text-[12px] text-[#64748B] font-medium">
                        {row.date}
                      </td>

                      {/* Member or Category */}
                      <td className="px-4 py-3.5">
                        {scope === "members" ? (
                          <div className="min-w-0">
                            <span className="text-[13px] font-bold text-[#0F172A] block truncate">
                              {row.userName || "—"}
                            </span>
                            <span className="text-[11px] text-[#64748B] block truncate">
                              {row.userEmail}
                            </span>
                          </div>
                        ) : (
                          <div className="min-w-0">
                            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#0F172A] capitalize">
                              <span className="w-2 h-2 rounded-full bg-[#0B6EF3]" />
                              {row.category || "General"}
                            </span>
                            <span className="text-[11px] text-[#64748B] block truncate">
                              {row.actorEmail}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Title & Notes */}
                      <td className="px-4 py-3.5">
                        <div className="min-w-0 max-w-xs">
                          <span className="text-[13px] font-semibold text-[#0F172A] block truncate">
                            {row.title}
                          </span>
                          {row.notes && (
                            <span className="text-[11px] text-slate-400 block truncate">
                              {row.notes}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isIncome
                              ? "bg-[#ECFDF3] text-[#10B981] border border-[#10B981]/20"
                              : "bg-[#FEF2F2] text-[#EF4444] border border-[#EF4444]/20"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isIncome ? "bg-[#10B981]" : "bg-[#EF4444]"}`} />
                          <span className="uppercase">{row.type}</span>
                        </span>
                      </td>

                      {/* Amount */}
                      <td
                        className={`px-4 py-3.5 text-right font-extrabold tabular-nums whitespace-nowrap text-[13px] ${
                          isIncome ? "text-[#10B981]" : "text-[#EF4444]"
                        }`}
                      >
                        {isIncome ? "+" : "-"}
                        {fmt(row.amount)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pl-4 pr-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            className="w-8 h-8 rounded-lg text-[#64748B] hover:text-[#0B6EF3] hover:bg-blue-50 flex items-center justify-center transition-colors cursor-pointer"
                            title={so ? "Tafatir" : "Edit entry"}
                          >
                            <Icon name="edit" size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => void remove(row._id)}
                            className="w-8 h-8 rounded-lg text-slate-400 hover:text-[#EF4444] hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                            title={so ? "Tirtir" : "Delete entry"}
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

      {/* Layer 5: Add / Edit Transaction Drawer / Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => {
              setFormOpen(false);
              setEditingId("");
            }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl border-l border-[#E2E8F0] flex flex-col animate-in slide-in-from-right duration-250">
              <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0B6EF3]/10 text-[#0B6EF3] flex items-center justify-center font-bold">
                    <Icon name={editingId ? "edit" : "add_card"} size={18} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#0F172A]">
                      {editingId
                        ? so ? "Tafatir Diiwaanka Maaliyadeed" : "Edit Transaction"
                        : so ? "Geli Diiwaan Maaliyadeed" : "Record New Transaction"}
                    </h3>
                    <p className="text-[11px] text-[#64748B]">
                      {scope === "members" ? "Member Account Ledger" : "BetterMe Operations Ledger"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormOpen(false);
                    setEditingId("");
                  }}
                  className="w-8 h-8 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>

              <form onSubmit={save} className="flex-1 overflow-y-auto p-6 space-y-4">
                {scope === "members" && (
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-bold text-[#0F172A]">
                      {so ? "Xubinta (Member)" : "Member Account"} *
                    </span>
                    <select
                      required
                      value={form.userId}
                      onChange={(e) => setForm((c) => ({ ...c, userId: e.target.value }))}
                      className="px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[13px] font-semibold text-[#0F172A] outline-none focus:border-[#0B6EF3] cursor-pointer"
                    >
                      <option value="">{so ? "-- Dooro xubin --" : "-- Select member --"}</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.email})
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-bold text-[#0F172A]">{so ? "Nooca" : "Flow Type"}</span>
                    <select
                      value={form.type}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, type: e.target.value as "income" | "expense" }))
                      }
                      className="px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[13px] font-bold outline-none focus:border-[#0B6EF3]"
                    >
                      <option value="income">Income (+ Inflow)</option>
                      <option value="expense">Expense (- Outflow)</option>
                    </select>
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-bold text-[#0F172A]">Currency</span>
                    <select
                      value={form.currency}
                      onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                      className="px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[13px] font-semibold outline-none focus:border-[#0B6EF3]"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="SOS">SOS (Sh)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </label>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-bold text-[#0F172A]">{so ? "Qadarka" : "Amount"} *</span>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    className="px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[14px] font-bold text-[#0F172A] outline-none focus:border-[#0B6EF3] focus:bg-white"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-bold text-[#0F172A]">{so ? "Qaybta" : "Category"}</span>
                    <input
                      required
                      placeholder="e.g. subscription, server, reward"
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] outline-none focus:border-[#0B6EF3] focus:bg-white"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-bold text-[#0F172A]">{so ? "Taariikh" : "Date"}</span>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      className="px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] outline-none focus:border-[#0B6EF3] focus:bg-white"
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-bold text-[#0F172A]">{so ? "Cinwaanka Diiwaanka" : "Title / Description"} *</span>
                  <input
                    required
                    placeholder="e.g. Monthly Pro Plan or Vercel Infrastructure"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] font-medium text-[#0F172A] outline-none focus:border-[#0B6EF3] focus:bg-white"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-bold text-[#0F172A]">{so ? "Qoraal / Notes" : "Internal Notes"}</span>
                  <textarea
                    rows={3}
                    placeholder="Optional details or invoice reference..."
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    className="px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] outline-none focus:border-[#0B6EF3] focus:bg-white resize-none"
                  />
                </label>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3 rounded-xl bg-[#0B6EF3] text-white text-[13px] font-bold hover:bg-[#0958c7] shadow-sm disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Icon name="sync" size={16} className="animate-spin" />
                        <span>{so ? "Waa la keydinayaa..." : "Saving..."}</span>
                      </>
                    ) : (
                      <>
                        <Icon name="check" size={16} />
                        <span>{editingId ? (so ? "Keydi Isbeddelada" : "Update Transaction") : so ? "Keydi Diiwaanka" : "Record Transaction"}</span>
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
