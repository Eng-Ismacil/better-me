"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import BetterMeLogo from "@/components/brand/BetterMeLogo";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";

interface ActivityReport {
  from: string;
  to: string;
  summary: {
    newUsers: number;
    activeMembers: number;
    newHabits: number;
    completions: number;
    adminActions: number;
    financeIncome: number;
    financeExpense: number;
    financeEntries: number;
  };
  daily: Array<{ date: string; count: number }>;
  topUsers: Array<{ userId: string; name: string; email: string; completions: number }>;
  topHabits: Array<{ habitId: string; name: string; completions: number }>;
  adminActionsByType: Array<{ action: string; count: number }>;
}

function dateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function SummaryItem({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="report-print-card rounded-xl border border-[#E7ECF3] bg-white p-4">
      <p className="text-[11px] font-bold uppercase text-[#667085]">{label}</p>
      <p className="mt-1 text-[24px] font-extrabold tabular-nums text-[#111827]">{value}</p>
      {detail && <p className="mt-1 text-[11px] text-[#667085]">{detail}</p>}
    </div>
  );
}

export default function AdminReportsClient() {
  const { language } = useTranslation();
  const so = language === "so";
  const today = new Date();
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 29);
  const [from, setFrom] = useState(dateInputValue(monthAgo));
  const [to, setTo] = useState(dateInputValue(today));
  const [report, setReport] = useState<ActivityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const generate = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ from, to });
      const response = await fetch(`/api/admin/reports?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not generate report");
      setReport(data.report);
    } catch (err) {
      setReport(null);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    const timer = window.setTimeout(() => void generate(), 0);
    return () => window.clearTimeout(timer);
  }, [generate]);

  const maxDaily = Math.max(...(report?.daily.map((day) => day.count) || [0]), 1);
  const currency = (amount: number) =>
    new Intl.NumberFormat(so ? "so-SO" : "en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="flex flex-col gap-5">
      <div className="report-toolbar flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-[12px] font-bold uppercase text-[#168A67]">
            {so ? "Waxqabadka BetterMe" : "BetterMe platform activity"}
          </p>
          <h1 className="text-[22px] font-extrabold text-[#111827] font-[family-name:var(--font-headline)]">
            {so ? "Warbixinnada" : "Reports"}
          </h1>
          <p className="mt-1 text-[13px] text-[#667085]">
            {so
              ? "La soco isticmaalka, horumarka users-ka iyo hawlaha maamulka."
              : "Review member activity, platform growth, and admin operations."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          disabled={!report || loading}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#0B6EF3] px-4 text-[12px] font-bold text-white disabled:opacity-50"
        >
          <Icon name="print" size={17} />
          {so ? "Daabac / Save PDF" : "Print / Save PDF"}
        </button>
      </div>

      <form
        className="report-toolbar flex flex-wrap items-end gap-3 rounded-xl border border-[#E7ECF3] bg-white p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void generate();
        }}
      >
        <label className="flex flex-col gap-1.5 text-[11px] font-bold text-[#475467]">
          {so ? "Laga bilaabo" : "From"}
          <input
            type="date"
            value={from}
            max={to}
            onChange={(event) => setFrom(event.target.value)}
            className="min-h-10 rounded-lg border border-[#D0D5DD] px-3 text-[12px] outline-none focus:border-[#0B6EF3]"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[11px] font-bold text-[#475467]">
          {so ? "Ila" : "To"}
          <input
            type="date"
            value={to}
            min={from}
            max={dateInputValue(today)}
            onChange={(event) => setTo(event.target.value)}
            className="min-h-10 rounded-lg border border-[#D0D5DD] px-3 text-[12px] outline-none focus:border-[#0B6EF3]"
          />
        </label>
        <button
          type="submit"
          disabled={loading || !from || !to}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#0B6EF3] px-4 text-[12px] font-bold text-[#0B6EF3] disabled:opacity-50"
        >
          <Icon name="summarize" size={17} />
          {loading ? (so ? "Waa la diyaarinayaa..." : "Generating...") : so ? "Samee report" : "Generate report"}
        </button>
      </form>

      {error && (
        <div className="report-toolbar flex items-center gap-2 rounded-xl border border-[#EF4444]/20 bg-[#FEF2F2] p-3 text-[13px] font-semibold text-[#B42318]">
          <Icon name="error" size={18} />
          {error}
        </div>
      )}

      {loading && !report ? (
        <div className="rounded-xl border border-[#E7ECF3] bg-white p-10 text-center text-[13px] text-[#667085]">
          {so ? "Warbixinta waa la diyaarinayaa..." : "Preparing report..."}
        </div>
      ) : report ? (
        <article className="report-print-area flex flex-col gap-5">
          <header className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-[#0B6EF3] pb-4">
            <div>
              <BetterMeLogo size={38} />
              <p className="mt-3 text-[11px] font-bold uppercase text-[#168A67]">
                {so ? "Warbixinta waxqabadka platform-ka" : "Platform activity report"}
              </p>
              <h2 className="mt-1 text-[20px] font-extrabold text-[#111827]">
                {so ? "Horumarka iyo isticmaalka" : "Growth and engagement"}
              </h2>
            </div>
            <div className="text-left text-[12px] text-[#475467] sm:text-right">
              <p className="font-bold">{report.from} — {report.to}</p>
              <p className="mt-1">{so ? "La sameeyay" : "Generated"}: {new Date().toLocaleString()}</p>
            </div>
          </header>

          <section aria-label={so ? "Koobid" : "Report summary"} className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <SummaryItem label={so ? "Users cusub" : "New members"} value={report.summary.newUsers} />
            <SummaryItem label={so ? "Users firfircoon" : "Active members"} value={report.summary.activeMembers} detail={so ? "Ugu yaraan hal completion" : "At least one completion"} />
            <SummaryItem label={so ? "Completions" : "Habit completions"} value={report.summary.completions} />
            <SummaryItem label={so ? "Caadooyin cusub" : "Habits created"} value={report.summary.newHabits} />
            <SummaryItem label={so ? "Hawlaha admin-ka" : "Admin actions"} value={report.summary.adminActions} />
            <SummaryItem label={so ? "Dakhli finance" : "User finance income"} value={currency(report.summary.financeIncome)} />
            <SummaryItem label={so ? "Kharash finance" : "User finance expense"} value={currency(report.summary.financeExpense)} />
            <SummaryItem label={so ? "Finance entries" : "Finance records"} value={report.summary.financeEntries} />
          </section>

          <section className="report-print-card rounded-xl border border-[#E7ECF3] bg-white p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <Icon name="monitoring" size={18} className="text-[#0B6EF3]" />
              <h3 className="text-[14px] font-bold text-[#111827]">
                {so ? "Completions maalinle ah" : "Daily habit completions"}
              </h3>
            </div>
            <div className="flex h-40 items-end gap-1 overflow-x-auto pb-1">
              {report.daily.map((day) => (
                <div key={day.date} className="flex h-full min-w-5 flex-1 flex-col items-center justify-end gap-1">
                  <span className="text-[9px] tabular-nums text-[#667085]">{day.count}</span>
                  <span
                    title={`${day.date}: ${day.count}`}
                    className="w-full max-w-8 rounded-t bg-[#0B6EF3] print:bg-[#0B6EF3]"
                    style={{ height: `${Math.max(4, (day.count / maxDaily) * 100)}%` }}
                  />
                  {(report.daily.length <= 14 || day.date.endsWith("-01")) && (
                    <span className="text-[8px] text-[#667085]">{day.date.slice(5)}</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="report-print-card rounded-xl border border-[#E7ECF3] bg-white p-4 sm:p-5">
              <h3 className="mb-3 text-[14px] font-bold text-[#111827]">
                {so ? "Users-ka ugu firfircoon" : "Most active members"}
              </h3>
              {report.topUsers.length ? (
                <ol className="flex flex-col divide-y divide-[#F0F2F5]">
                  {report.topUsers.map((user, index) => (
                    <li key={user.userId} className="flex items-center gap-3 py-2.5">
                      <span className="w-6 text-[11px] font-bold text-[#98A2B3]">{index + 1}</span>
                      <div className="min-w-0 flex-1">
                        <Link href={`/admin/users/${user.userId}`} className="block truncate text-[12px] font-bold text-[#111827] report-user-link">{user.name}</Link>
                        <p className="truncate text-[10px] text-[#667085]">{user.email}</p>
                      </div>
                      <span className="text-[12px] font-extrabold tabular-nums text-[#168A67]">{user.completions}</span>
                    </li>
                  ))}
                </ol>
              ) : <p className="py-4 text-[12px] text-[#667085]">{so ? "Xog lama helin" : "No member activity"}</p>}
            </section>

            <section className="report-print-card rounded-xl border border-[#E7ECF3] bg-white p-4 sm:p-5">
              <h3 className="mb-3 text-[14px] font-bold text-[#111827]">
                {so ? "Caadooyinka ugu badan" : "Most completed habits"}
              </h3>
              {report.topHabits.length ? (
                <ol className="flex flex-col divide-y divide-[#F0F2F5]">
                  {report.topHabits.map((habit, index) => (
                    <li key={habit.habitId} className="flex items-center gap-3 py-2.5">
                      <span className="w-6 text-[11px] font-bold text-[#98A2B3]">{index + 1}</span>
                      <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-[#344054]">{habit.name}</span>
                      <span className="text-[12px] font-extrabold tabular-nums text-[#0B6EF3]">{habit.completions}</span>
                    </li>
                  ))}
                </ol>
              ) : <p className="py-4 text-[12px] text-[#667085]">{so ? "Xog lama helin" : "No habit activity"}</p>}
            </section>
          </div>

          <section className="report-print-card rounded-xl border border-[#E7ECF3] bg-white p-4 sm:p-5">
            <h3 className="mb-3 text-[14px] font-bold text-[#111827]">
              {so ? "Noocyada hawlaha maamulka" : "Admin activity by action"}
            </h3>
            {report.adminActionsByType.length ? (
              <div className="flex flex-wrap gap-2">
                {report.adminActionsByType.map((item) => (
                  <span key={item.action} className="inline-flex items-center gap-2 rounded-lg bg-[#F2F4F7] px-3 py-2 text-[11px] font-semibold text-[#475467]">
                    {item.action}<b className="tabular-nums text-[#111827]">{item.count}</b>
                  </span>
                ))}
              </div>
            ) : <p className="text-[12px] text-[#667085]">{so ? "Ma jiraan hawlo admin" : "No admin activity in this period"}</p>}
          </section>
          <footer className="border-t border-[#E7ECF3] pt-3 text-[10px] text-[#98A2B3]">
            BetterMe · {so ? "Warbixin maamul oo qarsoodi ah" : "Confidential admin report"}
          </footer>
        </article>
      ) : null}
    </div>
  );
}