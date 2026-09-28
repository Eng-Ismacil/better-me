"use client";

import React, { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";

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
          setMembers((data.users || []).map((user: { id?: string; _id?: string; name: string; email: string }) => ({
            id: user.id || user._id || "",
            name: user.name,
            email: user.email,
          })).filter((user: { id: string }) => user.id));
        })
        .catch((err: Error) => setError(err.message));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

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
    if (!confirm(so ? "Ma tirtiraysaa?" : "Delete this entry?")) return;
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
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#111827] font-[family-name:var(--font-headline)]">
            {so ? "Maamulka Maaliyadda" : "Finance Management"}
          </h1>
          <p className="text-[13px] text-[#667085] mt-1">
            {so
              ? "Arag dhammaan dhaqdhaqaaqyada maaliyadeed ee isticmaalayaasha."
              : "View and manage all user financial transactions."}
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B6EF3] text-white text-[13px] font-bold cursor-pointer"
        >
          <Icon name="add" size={16} />
          {so ? "Ku dar" : "Add Entry"}
        </button>
      </div>

      <div className="flex w-full gap-1 rounded-xl border border-[#E7ECF3] bg-white p-1 sm:w-fit">
        {([
          ["members", so ? "Maaliyadda users-ka" : "User finance", "group"],
          ["operations", so ? "Ledger-ka BetterMe" : "BetterMe ledger", "account_balance_wallet"],
        ] as const).map(([value, label, icon]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setScope(value);
              setUserFilter("");
              setEditingId("");
              setFormOpen(false);
            }}
            aria-pressed={scope === value}
            className={`flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-[11px] font-bold sm:flex-none sm:text-[12px] ${
              scope === value ? "bg-[#0B6EF3] text-white" : "text-[#667085] hover:bg-[#F4F8FF]"
            }`}
          >
            <Icon name={icon} size={16} />
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#EF4444]/25 text-[#EF4444] text-[13px] font-semibold flex items-center gap-2">
          <Icon name="error" size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="bg-white rounded-2xl border border-[#E7ECF3] p-4">
          <p className="text-[11px] font-bold uppercase text-[#667085]">{so ? "Dakhli" : "Income"}</p>
          <p className="text-[22px] font-extrabold text-[#20C773] mt-1">{fmt(summary.income)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E7ECF3] p-4">
          <p className="text-[11px] font-bold uppercase text-[#667085]">{so ? "Kharash" : "Expense"}</p>
          <p className="text-[22px] font-extrabold text-[#EF4444] mt-1">{fmt(summary.expense)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E7ECF3] p-4">
          <p className="text-[11px] font-bold uppercase text-[#667085]">{so ? "Haraaga" : "Balance"}</p>
          <p className="text-[22px] font-extrabold text-[#0B6EF3] mt-1">{fmt(summary.balance)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {scope === "members" && (
          <select
            value={userFilter}
            onChange={(event) => setUserFilter(event.target.value)}
            className="min-h-9 max-w-full rounded-lg border border-[#E7ECF3] bg-white px-3 text-[12px] font-semibold text-[#344054]"
          >
            <option value="">{so ? "Dhammaan users-ka" : "All members"}</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} · {member.email}
              </option>
            ))}
          </select>
        )}
        {(["", "income", "expense"] as const).map((type) => (
          <button
            key={type || "all"}
            type="button"
            onClick={() => setFilter(type)}
            aria-pressed={filter === type}
            className={`px-3 py-1.5 rounded-full text-[12px] font-bold cursor-pointer ${
              filter === type
                ? "bg-[#0B6EF3] text-white"
                : "bg-[#F4F8FF] text-[#667085] hover:text-[#0B6EF3]"
            }`}
          >
            {type === "" ? (so ? "Dhammaan" : "All") : type}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E7ECF3] bg-white">
        {loading ? (
          <div className="p-8 text-center text-[13px] text-[#667085] animate-pulse">
            {so ? "Waa la soo rarayaa..." : "Loading transactions..."}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-[#667085]">
            {so ? "Weli ma jiraan xog" : "No transactions yet"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-[13px]">
              <thead className="border-b border-[#E7ECF3] bg-[#FAFBFD]">
                <tr>
                  <th className="p-3 font-bold text-[#667085]">{so ? "Taariikh" : "Date"}</th>
                  {scope === "members" ? (
                    <th className="p-3 font-bold text-[#667085]">{so ? "Isticmaale" : "Member"}</th>
                  ) : (
                    <th className="p-3 font-bold text-[#667085]">{so ? "Qaybta" : "Category"}</th>
                  )}
                  <th className="p-3 font-bold text-[#667085]">{so ? "Cinwaan" : "Title"}</th>
                  <th className="p-3 font-bold text-[#667085]">{so ? "Nooca" : "Type"}</th>
                  <th className="p-3 text-right font-bold text-[#667085]">{so ? "Qadarka" : "Amount"}</th>
                  <th className="w-20 p-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row._id} className="border-b border-[#E7ECF3] last:border-0 hover:bg-[#FAFBFD]">
                    <td className="whitespace-nowrap p-3 text-[#667085]">{row.date}</td>
                    <td className="p-3">
                      {scope === "members" ? (
                        <>
                          <p className="font-semibold text-[#111827]">{row.userName || "—"}</p>
                          <p className="text-[11px] text-[#667085]">{row.userEmail}</p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold text-[#111827]">{row.category || "general"}</p>
                          <p className="text-[11px] text-[#667085]">{row.actorEmail}</p>
                        </>
                      )}
                    </td>
                    <td className="p-3 font-medium text-[#111827]">{row.title}</td>
                    <td className="p-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${row.type === "income" ? "bg-[#ECFDF3] text-[#168A67]" : "bg-[#FEF2F2] text-[#B42318]"}`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold tabular-nums">
                      {row.type === "income" ? "+" : "-"}{fmt(row.amount)}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          aria-label={so ? "Tafatir" : "Edit entry"}
                          className="rounded-lg p-1.5 text-[#0B6EF3] hover:bg-[#EFF6FF]"
                        >
                          <Icon name="edit" size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void remove(row._id)}
                          aria-label={so ? "Tirtir" : "Delete entry"}
                          className="rounded-lg p-1.5 text-[#B42318] hover:bg-[#FEF2F2]"
                        >
                          <Icon name="delete" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={save}
            className="bg-white rounded-2xl border border-[#E7ECF3] w-full max-w-md p-5 flex flex-col gap-3 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-[16px] font-bold text-[#111827]">
              {editingId
                ? so ? "Tafatir xogta maaliyadeed" : "Edit finance entry"
                : so ? "Geli Xog Maaliyadeed" : "Add Finance Entry"}
            </h3>
            {scope === "members" && (
              <label className="flex flex-col gap-1.5 text-[12px] font-bold text-[#344054]">
                {so ? "Isticmaale" : "Member"}
                <select
                  required
                  value={form.userId}
                  onChange={(event) => setForm((current) => ({ ...current, userId: event.target.value }))}
                  className="rounded-xl border border-[#E7ECF3] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#0B6EF3]"
                >
                  <option value="">{so ? "Dooro user" : "Choose a member"}</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>{member.name} · {member.email}</option>
                  ))}
                </select>
              </label>
            )}
            <select
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({ ...f, type: e.target.value as "income" | "expense" }))
              }
              className="px-3 py-2.5 rounded-xl border border-[#E7ECF3] text-[13px] outline-none"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <input
              required
              placeholder={so ? "Qaybta" : "Category"}
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="px-3 py-2.5 rounded-xl border border-[#E7ECF3] text-[13px] outline-none focus:border-[#0B6EF3]"
            />
            <input
              required
              placeholder={so ? "Cinwaan" : "Title"}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="px-3 py-2.5 rounded-xl border border-[#E7ECF3] text-[13px] outline-none focus:border-[#0B6EF3]"
            />
            <select
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
              className="px-3 py-2.5 rounded-xl border border-[#E7ECF3] bg-white text-[13px] outline-none"
            >
              <option value="USD">USD</option>
              <option value="SOS">SOS</option>
              <option value="EUR">EUR</option>
            </select>
            <input
              required
              type="number"
              step="0.01"
              min="0"
              placeholder={so ? "Qadarka" : "Amount"}
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className="px-3 py-2.5 rounded-xl border border-[#E7ECF3] text-[13px] outline-none focus:border-[#0B6EF3]"
            />
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="px-3 py-2.5 rounded-xl border border-[#E7ECF3] text-[13px] outline-none"
            />
            <textarea
              rows={3}
              placeholder={so ? "Faahfaahin (ikhtiyaar)" : "Notes (optional)"}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="resize-y rounded-xl border border-[#E7ECF3] px-3 py-2.5 text-[13px] outline-none focus:border-[#0B6EF3]"
            />
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setFormOpen(false);
                  setEditingId("");
                }}
                className="flex-1 py-2.5 rounded-xl border border-[#E7ECF3] text-[13px] font-bold cursor-pointer"
              >
                {so ? "Jooji" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#0B6EF3] text-white text-[13px] font-bold disabled:opacity-50 cursor-pointer"
              >
                {saving
                  ? "..."
                  : editingId
                    ? so ? "Keydi isbeddelada" : "Save changes"
                    : so ? "Keydi" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
