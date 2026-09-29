"use client";

import React, { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";

interface SavingsGoal {
  _id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  currency: string;
  targetDate?: string;
}

const blankGoal = {
  title: "",
  targetAmount: "",
  currency: "USD",
  targetDate: "",
};

function money(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export default function SavingsGoalsPanel() {
  const { language } = useTranslation();
  const so = language === "so";
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [editing, setEditing] = useState<SavingsGoal | null>(null);
  const [goalForm, setGoalForm] = useState(blankGoal);
  const [contributionGoal, setContributionGoal] = useState<SavingsGoal | null>(null);
  const [contribution, setContribution] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const response = await fetch("/api/finance/savings");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load savings goals");
      setGoals(data.goals || []);
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

  const openNew = () => {
    setEditing(null);
    setGoalForm(blankGoal);
    setGoalFormOpen(true);
  };

  const openEdit = (goal: SavingsGoal) => {
    setEditing(goal);
    setGoalForm({
      title: goal.title,
      targetAmount: String(goal.targetAmount),
      currency: goal.currency,
      targetDate: goal.targetDate || "",
    });
    setGoalFormOpen(true);
  };

  const saveGoal = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        editing ? `/api/finance/savings/${editing._id}` : "/api/finance/savings",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...goalForm, targetAmount: Number(goalForm.targetAmount) }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save savings goal");
      setGoalFormOpen(false);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const addContribution = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!contributionGoal) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/finance/savings/${contributionGoal._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountToAdd: Number(contribution) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not add savings");
      setContributionGoal(null);
      setContribution("");
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (goal: SavingsGoal) => {
    if (!confirm(so ? `Ma tirtiraysaa yoolka "${goal.title}"?` : `Delete "${goal.title}"?`)) return;
    try {
      const response = await fetch(`/api/finance/savings/${goal._id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete goal");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const totals = new Map<string, number>();
  goals.forEach((goal) => totals.set(goal.currency, (totals.get(goal.currency) || 0) + goal.savedAmount));
  const savedSummary = Array.from(totals, ([currency, amount]) => money(amount, currency)).join(" · ");
  const achieved = goals.filter((goal) => goal.savedAmount >= goal.targetAmount).length;

  return (
    <section className="flex flex-col gap-4">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-[#EF4444]/20 bg-[#FEF2F2] p-3 text-[13px] font-semibold text-[#B42318]">
          <Icon name="error" size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-[#E7ECF3] dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] dark:text-slate-400">
              {so ? "Kaydka Hadda Guud" : "Total Saved So Far"}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <Icon name="savings" size={20} />
            </div>
          </div>
          <p className="mt-2 truncate text-[24px] font-black tabular-nums text-emerald-600 dark:text-emerald-400">
            {savedSummary || money(0, "USD")}
          </p>
          <p className="text-[11px] text-[#667085] dark:text-slate-400 mt-1">
            {so ? "Lacagta ku jirta yoolalka" : "Accumulated across all goals"}
          </p>
        </div>

        <div className="rounded-3xl border border-[#E7ECF3] dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] dark:text-slate-400">
              {so ? "Yoolalka Firfircoon" : "Active Goals"}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0B6EF3] flex items-center justify-center">
              <Icon name="flag" size={20} />
            </div>
          </div>
          <p className="mt-2 text-[24px] font-black tabular-nums text-[#111827] dark:text-white">
            {goals.length}
          </p>
          <p className="text-[11px] text-[#667085] dark:text-slate-400 mt-1">
            {so ? "Yoolalka la dejiyay" : "Targets being tracked"}
          </p>
        </div>

        <div className="rounded-3xl border border-[#E7ECF3] dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] dark:text-slate-400">
              {so ? "La Gaaray (100%)" : "Completed Goals"}
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
              <Icon name="verified" size={20} />
            </div>
          </div>
          <p className="mt-2 text-[24px] font-black tabular-nums text-[#0B6EF3]">
            {achieved}
          </p>
          <p className="text-[11px] text-[#667085] dark:text-slate-400 mt-1">
            {so ? "Yoolalka buuxsamay" : "Successfully completed"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <div>
          <h2 className="text-[17px] font-black text-[#111827] dark:text-white">
            {so ? "Yoolalka Kaydkaaga" : "Your Savings Goals"}
          </h2>
          <p className="mt-0.5 text-[12px] text-[#667085] dark:text-slate-400">
            {so ? "Samee qorshe cad oo kordhi kaydkaaga tallaabo kasta." : "Set a target, save progressively, and watch your wealth grow."}
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 text-[12px] font-bold text-white shadow-xs cursor-pointer transition-all"
        >
          <Icon name="add" size={17} />
          {so ? "Yool Cusub" : "New Goal"}
        </button>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-[#E7ECF3] dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center text-[13px] text-[#667085]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-3"></div>
          <p>{so ? "Waa la soo rarayaa yoolalka..." : "Loading savings goals..."}</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#C9D8D1] dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 mb-3">
            <Icon name="savings" size={28} />
          </span>
          <p className="text-[15px] font-black text-[#111827] dark:text-white">
            {so ? "Weli yool kayd ma lihid" : "No savings goals set yet"}
          </p>
          <p className="mt-1 text-[13px] text-[#667085] dark:text-slate-400 max-w-sm mx-auto mb-4">
            {so ? "Samee yoolkaaga koowaad (sida Sanduuqa Degdegga, Guri, ama Baabuur) si aad ula socoto." : "Create your first goal (such as Emergency Fund, New Asset, or Education) to stay disciplined."}
          </p>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 text-white px-4 py-2 text-[12px] font-bold cursor-pointer hover:bg-emerald-700"
          >
            <Icon name="add" size={16} />
            {so ? "Deji Yool Cusub" : "Create Goal"}
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((goal) => {
            const progress = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
            const isCompleted = progress >= 100;
            return (
              <article
                key={goal._id}
                className="rounded-3xl border border-[#E7ECF3] dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-[#CBD5E1] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3.5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-500/20">
                      <Icon name="savings" size={22} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-[15px] font-black text-[#111827] dark:text-white">
                          {goal.title}
                        </h3>
                        {isCompleted && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {so ? "LA GAARAY" : "COMPLETED"}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-[#667085] dark:text-slate-400">
                        {goal.targetDate
                          ? `${so ? "Bartilmaameed" : "Target Date"}: ${goal.targetDate}`
                          : so ? "Taariikh go'an ma leh" : "Open-ended target"}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(goal)}
                        aria-label={so ? "Tafatir yoolka" : "Edit goal"}
                        className="rounded-lg p-1.5 text-[#667085] hover:bg-[#F4F8FF] hover:text-[#0B6EF3] cursor-pointer"
                      >
                        <Icon name="edit" size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(goal)}
                        aria-label={so ? "Tirtir yoolka" : "Delete goal"}
                        className="rounded-lg p-1.5 text-[#B42318] hover:bg-[#FEF2F2] cursor-pointer"
                      >
                        <Icon name="delete" size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between gap-2">
                    <p className="truncate text-[20px] font-black tabular-nums text-emerald-600 dark:text-emerald-400">
                      {money(goal.savedAmount, goal.currency)}
                    </p>
                    <p className="shrink-0 text-[11px] font-bold text-[#667085] dark:text-slate-400">
                      {so ? "ka mid ah" : "of"} {money(goal.targetAmount, goal.currency)}
                    </p>
                  </div>

                  <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? "bg-[#10B981]" : "bg-emerald-500"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F2F4F7] dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[12px] font-black text-emerald-600 dark:text-emerald-400">
                    {progress}% {so ? "La keydsaday" : "Saved"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setContributionGoal(goal);
                      setContribution("");
                    }}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 px-3.5 text-[11px] font-black text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
                  >
                    <Icon name="add" size={15} />
                    {so ? "Ku dar kayd" : "Add Savings"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {(goalFormOpen || contributionGoal) && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center">
          {goalFormOpen ? (
            <form onSubmit={saveGoal} className="flex max-h-[92dvh] w-full max-w-md flex-col gap-3 overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
              <h3 className="text-[16px] font-bold text-[#111827]">{editing ? (so ? "Tafatir yoolka" : "Edit savings goal") : (so ? "Yool kayd cusub" : "New savings goal")}</h3>
              <input required maxLength={80} placeholder={so ? "Magaca yoolka" : "Goal name"} value={goalForm.title} onChange={(event) => setGoalForm((form) => ({ ...form, title: event.target.value }))} className="rounded-lg border border-[#D0D5DD] px-3 py-2.5 text-[13px] outline-none focus:border-[#168A67]" />
              <input required type="number" min="0.01" step="0.01" placeholder={so ? "Qadarka bartilmaameedka" : "Target amount"} value={goalForm.targetAmount} onChange={(event) => setGoalForm((form) => ({ ...form, targetAmount: event.target.value }))} className="rounded-lg border border-[#D0D5DD] px-3 py-2.5 text-[13px] outline-none focus:border-[#168A67]" />
              <div className="grid grid-cols-2 gap-2">
                <select value={goalForm.currency} onChange={(event) => setGoalForm((form) => ({ ...form, currency: event.target.value }))} className="min-w-0 rounded-lg border border-[#D0D5DD] bg-white px-3 py-2.5 text-[13px]">
                  <option value="USD">USD</option><option value="SOS">SOS</option><option value="EUR">EUR</option>
                </select>
                <input type="date" value={goalForm.targetDate} onChange={(event) => setGoalForm((form) => ({ ...form, targetDate: event.target.value }))} className="min-w-0 rounded-lg border border-[#D0D5DD] px-2 py-2.5 text-[12px]" />
              </div>
              <div className="mt-1 flex gap-2">
                <button type="button" onClick={() => setGoalFormOpen(false)} className="min-h-11 flex-1 rounded-lg border border-[#D0D5DD] text-[13px] font-bold">{so ? "Jooji" : "Cancel"}</button>
                <button type="submit" disabled={saving} className="min-h-11 flex-1 rounded-lg bg-[#168A67] text-[13px] font-bold text-white disabled:opacity-50">{saving ? "..." : so ? "Keydi yoolka" : "Save goal"}</button>
              </div>
            </form>
          ) : (
            <form onSubmit={addContribution} className="flex w-full max-w-md flex-col gap-3 rounded-2xl bg-white p-5 shadow-2xl">
              <h3 className="text-[16px] font-bold text-[#111827]">{so ? "Ku dar kayd" : "Add savings"}</h3>
              <p className="text-[12px] text-[#667085]">{contributionGoal?.title}</p>
              <input autoFocus required type="number" min="0.01" step="0.01" placeholder={so ? "Qadarka" : "Amount"} value={contribution} onChange={(event) => setContribution(event.target.value)} className="rounded-lg border border-[#D0D5DD] px-3 py-2.5 text-[13px] outline-none focus:border-[#168A67]" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setContributionGoal(null)} className="min-h-11 flex-1 rounded-lg border border-[#D0D5DD] text-[13px] font-bold">{so ? "Jooji" : "Cancel"}</button>
                <button type="submit" disabled={saving} className="min-h-11 flex-1 rounded-lg bg-[#168A67] text-[13px] font-bold text-white disabled:opacity-50">{saving ? "..." : so ? "Ku dar" : "Add"}</button>
              </div>
            </form>
          )}
        </div>
      )}
    </section>
  );
}