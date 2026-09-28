"use client";

import React, { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";

interface FinanceRow {
  _id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
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

  const [rows, setRows] = useState<FinanceRow[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"" | "income" | "expense">("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filter) params.set("type", filter);
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
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setFormOpen(false);
      setForm(emptyForm);
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
      const res = await fetch(`/api/admin/finance/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

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
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B6EF3] text-white text-[13px] font-bold cursor-pointer"
        >
          <Icon name="add" size={16} />
          {so ? "Ku dar" : "Add Entry"}
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#EF4444]/25 text-[#EF4444] text-[13px] font-semibold flex items-center gap-2">
          <Icon name="error" size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
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

      <div className="flex gap-2">
        {(["", "income", "expense"] as const).map((t) => (
          <button
            key={t || "all"}
            type="button"
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-bold cursor-pointer ${
              filter === t
                ? "bg-[#0B6EF3] text-white"
                : "bg-[#F4F8FF] text-[#667085] hover:text-[#0B6EF3]"
            }`}
          >
            {t === "" ? (so ? "Dhammaan" : "All") : t}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E7ECF3] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[13px] text-[#667085] animate-pulse">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-[#667085]">
            {so ? "Weli ma jiraan xog" : "No transactions yet"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] min-w-[720px]">
              <thead className="bg-[#FAFBFD] border-b border-[#E7ECF3]">
                <tr>
                  <th className="p-3 font-bold text-[#667085]">{so ? "Taariikh" : "Date"}</th>
                  <th className="p-3 font-bold text-[#667085]">{so ? "Isticmaale" : "User"}</th>
                  <th className="p-3 font-bold text-[#667085]">{so ? "Cinwaan" : "Title"}</th>
                  <th className="p-3 font-bold text-[#667085]">{so ? "Nooca" : "Type"}</th>
                  <th className="p-3 font-bold text-[#667085] text-right">{so ? "Qadarka" : "Amount"}</th>
                  <th className="p-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id} className="border-b border-[#E7ECF3] last:border-0 hover:bg-[#FAFBFD]">
                    <td className="p-3 text-[#667085]">{r.date}</td>
                    <td className="p-3">
                      <p className="font-semibold text-[#111827]">{r.userName || "—"}</p>
                      <p className="text-[11px] text-[#667085]">{r.userEmail}</p>
                    </td>
                    <td className="p-3 font-medium text-[#111827]">{r.title}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          r.type === "income"
                            ? "bg-[#ECFDF3] text-[#20C773]"
                            : "bg-[#FEF2F2] text-[#EF4444]"
                        }`}
                      >
                        {r.type}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold tabular-nums">
                      {r.type === "income" ? "+" : "-"}
                      {fmt(r.amount)}
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => remove(r._id)}
                        className="p-1.5 rounded-lg text-[#EF4444] hover:bg-[#FEF2F2] cursor-pointer"
                      >
                        <Icon name="delete" size={16} />
                      </button>
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
              {so ? "Geli Xog Maaliyadeed" : "Add Finance Entry"}
            </h3>
            <input
              required
              placeholder="User ID (MongoDB ObjectId)"
              value={form.userId}
              onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
              className="px-3 py-2.5 rounded-xl border border-[#E7ECF3] text-[13px] outline-none focus:border-[#0B6EF3]"
            />
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
