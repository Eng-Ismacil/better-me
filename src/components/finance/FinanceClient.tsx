"use client";

import React, { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import SavingsGoalsPanel from "@/components/finance/SavingsGoalsPanel";
import { useTranslation } from "@/lib/i18n";

interface Transaction {
  _id: string;
  type: "income" | "expense";
  amount: number;
  currency: string;
  category: string;
  title: string;
  notes?: string;
  date: string;
}

const emptyForm = {
  type: "expense" as "income" | "expense",
  amount: "",
  currency: "USD",
  category: "general",
  title: "",
  notes: "",
  date: new Date().toISOString().slice(0, 10),
};

export default function FinanceClient() {
  const { language } = useTranslation();
  const so = language === "so";
  const [view, setView] = useState<"transactions" | "savings">("transactions");

  const [rows, setRows] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/finance");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setRows(data.transactions || []);
      setSummary(data.summary || { income: 0, expense: 0, balance: 0 });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (t: Transaction) => {
    setEditing(t);
    setForm({
      type: t.type,
      amount: String(t.amount),
      currency: t.currency,
      category: t.category,
      title: t.title,
      notes: t.notes || "",
      date: t.date,
    });
    setFormOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, amount: Number(form.amount) };
      const res = editing
        ? await fetch(`/api/finance/${editing._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/finance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setFormOpen(false);
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
      const res = await fetch(`/api/finance/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  return (
    <div className="flex flex-col gap-5 pb-24 md:pb-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#111827] font-[family-name:var(--font-headline)]">
            {view === "savings"
              ? so ? "Kaydkayga" : "My Savings"
              : so ? "Maaliyaddayda" : "My Finance"}
          </h1>
          <p className="text-[13px] text-[#667085] mt-1">
            {view === "savings"
              ? so
                ? "Deji yoolal oo la soco horumarka kaydkaaga."
                : "Set goals and track your savings progress."
              : so
                ? "La soco dakhligaaga iyo kharashkaaga maalinlaha ah."
                : "Track your daily income and expenses."}
          </p>
        </div>
        {view === "transactions" && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-[#0B6EF3] px-4 text-[12px] font-bold text-white"
          >
            <Icon name="add" size={16} />
            {so ? "Ku dar" : "Add transaction"}
          </button>
        )}
      </div>

      <div className="flex w-full gap-1 rounded-xl border border-[#E7ECF3] bg-white p-1 sm:w-fit">
        {([
          ["transactions", so ? "Dhaqdhaqaaqyo" : "Transactions", "receipt_long"],
          ["savings", so ? "Kayd" : "Savings", "savings"],
        ] as const).map(([value, label, icon]) => (
          <button
            key={value}
            type="button"
            onClick={() => setView(value)}
            aria-pressed={view === value}
            className={`flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-[12px] font-bold sm:flex-none ${
              view === value ? "bg-[#0B6EF3] text-white" : "text-[#667085] hover:bg-[#F4F8FF]"
            }`}
          >
            <Icon name={icon} size={17} />
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

      {view === "savings" ? (
        <SavingsGoalsPanel />
      ) : (
        <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="bg-white rounded-2xl border border-[#E7ECF3] p-4 shadow-[0_2px_12px_rgba(16,24,40,0.04)]">
          <div className="flex items-center gap-2 text-[#20C773] mb-1">
            <Icon name="trending_up" size={18} />
            <span className="text-[11px] font-bold uppercase">{so ? "Dakhli" : "Income"}</span>
          </div>
          <p className="text-[20px] font-extrabold text-[#111827]">{fmt(summary.income)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E7ECF3] p-4 shadow-[0_2px_12px_rgba(16,24,40,0.04)]">
          <div className="flex items-center gap-2 text-[#EF4444] mb-1">
            <Icon name="trending_down" size={18} />
            <span className="text-[11px] font-bold uppercase">{so ? "Kharash" : "Expense"}</span>
          </div>
          <p className="text-[20px] font-extrabold text-[#111827]">{fmt(summary.expense)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E7ECF3] p-4 shadow-[0_2px_12px_rgba(16,24,40,0.04)]">
          <div className="flex items-center gap-2 text-[#0B6EF3] mb-1">
            <Icon name="account_balance_wallet" size={18} />
            <span className="text-[11px] font-bold uppercase">{so ? "Haraaga" : "Balance"}</span>
          </div>
          <p className="text-[20px] font-extrabold text-[#111827]">{fmt(summary.balance)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {loading ? (
          <div className="p-8 text-center text-[13px] text-[#667085] animate-pulse">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E7ECF3] p-8 text-center text-[13px] text-[#667085]">
            {so ? "Weli ma jiraan xog maaliyadeed" : "No transactions yet. Add your first entry!"}
          </div>
        ) : (
          rows.map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-2xl border border-[#E7ECF3] p-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    r.type === "income" ? "bg-[#ECFDF3] text-[#20C773]" : "bg-[#FEF2F2] text-[#EF4444]"
                  }`}
                >
                  <Icon name={r.type === "income" ? "arrow_downward" : "arrow_upward"} size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-[#111827] truncate">{r.title}</p>
                  <p className="text-[11px] text-[#667085]">
                    {r.date} · {r.category}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[15px] font-extrabold tabular-nums ${
                    r.type === "income" ? "text-[#20C773]" : "text-[#EF4444]"
                  }`}
                >
                  {r.type === "income" ? "+" : "-"}
                  {fmt(r.amount)}
                </span>
                <button
                  type="button"
                  onClick={() => openEdit(r)}
                  className="p-1.5 rounded-lg text-[#667085] hover:bg-[#F4F8FF] cursor-pointer"
                >
                  <Icon name="edit" size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(r._id)}
                  className="p-1.5 rounded-lg text-[#EF4444] hover:bg-[#FEF2F2] cursor-pointer"
                >
                  <Icon name="delete" size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
        </>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={save}
            className="bg-white rounded-2xl border border-[#E7ECF3] w-full max-w-md p-5 flex flex-col gap-3"
          >
            <h3 className="text-[16px] font-bold text-[#111827]">
              {editing ? (so ? "Wax ka beddel" : "Edit Entry") : so ? "Geli Xog Cusub" : "New Entry"}
            </h3>
            <select
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({ ...f, type: e.target.value as "income" | "expense" }))
              }
              className="px-3 py-2.5 rounded-xl border border-[#E7ECF3] text-[13px] outline-none"
            >
              <option value="income">{so ? "Dakhli" : "Income"}</option>
              <option value="expense">{so ? "Kharash" : "Expense"}</option>
            </select>
            <input
              required
              placeholder={so ? "Cinwaan" : "Title"}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="px-3 py-2.5 rounded-xl border border-[#E7ECF3] text-[13px] outline-none focus:border-[#0B6EF3]"
            />
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
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#E7ECF3] text-[13px] font-bold cursor-pointer"
              >
                {so ? "Jooji" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#0B6EF3] text-white text-[13px] font-bold disabled:opacity-50 cursor-pointer"
              >
                {saving ? "..." : so ? "Keydi" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
