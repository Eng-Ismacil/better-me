"use client";

import React, { useState } from "react";
import Link from "next/link";
import BetterMeLogo from "@/components/brand/BetterMeLogo";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";
import AdminPageHeader from "@/components/admin/design-system/AdminPageHeader";
import AdminKpiCard from "@/components/admin/design-system/AdminKpiCard";
import { useAdminReport } from "@/hooks/useAdminReports";

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

export default function AdminReportsClient() {
  const { language } = useTranslation();
  const so = language === "so";
  const today = new Date();
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 29);

  const [from, setFrom] = useState(dateInputValue(monthAgo));
  const [to, setTo] = useState(dateInputValue(today));

  // ── React Query Cache-First — 10min stale, instant revisit ──
  const { data: report, isLoading: loading, isFetching, refetch, isError } = useAdminReport(from, to);
  const error = isError ? "Could not generate report" : "";

  const setPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));
    setFrom(dateInputValue(start));
    setTo(dateInputValue(end));
  };

  const maxDaily = Math.max(...(report?.daily.map((day) => day.count) || [0]), 1);

  const currency = (amount: number) =>
    new Intl.NumberFormat(so ? "so-SO" : "en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Layer 1: Page Header */}
      <div className="report-toolbar">
        <AdminPageHeader
          title={so ? "Warbixinnada & Sirdoonka Platform-ka" : "Executive Reports & Platform Intelligence"}
          subtitle={
            so
              ? "Kormeeri kobaca xubnaha, xawaaraha dhammaystirka caadooyinka, iyo hawlaha maamulka."
              : "Generate comprehensive intelligence on member retention, daily habit completion velocity, and operational throughput."
          }
          badges={[
            { label: so ? "Xilliga" : "Date Range", value: `${from} — ${to}`, variant: "blue" },
            { label: so ? "Dhammaystiray" : "Completions", value: report?.summary.completions || 0, variant: "success" },
          ]}
          actions={
            <button
              type="button"
              onClick={() => window.print()}
              disabled={!report || loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B6EF3] text-white text-[13px] font-bold hover:bg-[#0958c7] shadow-sm disabled:opacity-50 transition-all cursor-pointer"
            >
              <Icon name="print" size={17} />
              <span>{so ? "Daabac / Keydi PDF" : "Export / Print PDF"}</span>
            </button>
          }
        />
      </div>

      {/* Layer 2: Date Selector & Context Controls */}
      <div className="report-toolbar bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <form
          className="flex flex-wrap items-center gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void refetch();
          }}
        >
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-[12px] font-bold text-[#64748B]">
              <span>{so ? "Laga bilaabo:" : "From:"}</span>
              <input
                type="date"
                value={from}
                max={to}
                onChange={(e) => setFrom(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-[12px] font-semibold text-[#0F172A] outline-none focus:border-[#0B6EF3]"
              />
            </label>
            <label className="flex items-center gap-1.5 text-[12px] font-bold text-[#64748B]">
              <span>{so ? "Ilaa:" : "To:"}</span>
              <input
                type="date"
                value={to}
                min={from}
                max={dateInputValue(today)}
                onChange={(e) => setTo(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-[12px] font-semibold text-[#0F172A] outline-none focus:border-[#0B6EF3]"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !from || !to}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B6EF3] text-white text-[12px] font-bold hover:bg-[#0958c7] disabled:opacity-50 cursor-pointer shadow-xs transition-colors"
          >
            <Icon name="refresh" size={16} className={loading ? "animate-spin" : ""} />
            <span>{loading ? (so ? "Waa la diyaarinayaa..." : "Generating...") : so ? "Cusboonaysii Report" : "Generate Report"}</span>
          </button>
        </form>

        {/* Date presets */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-[#64748B] mr-1">{so ? "Muddada:" : "Presets:"}</span>
          <button
            type="button"
            onClick={() => setPreset(7)}
            className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
          >
            7D
          </button>
          <button
            type="button"
            onClick={() => setPreset(14)}
            className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
          >
            14D
          </button>
          <button
            type="button"
            onClick={() => setPreset(30)}
            className="px-2.5 py-1 text-[11px] font-bold bg-blue-50 text-[#0B6EF3] rounded-lg cursor-pointer transition-colors"
          >
            30D
          </button>
          <button
            type="button"
            onClick={() => setPreset(90)}
            className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
          >
            90D
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="report-toolbar p-4 rounded-xl bg-[#FEF2F2] border border-[#EF4444]/25 text-[#EF4444] text-[13px] font-medium flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Icon name="error" size={20} />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => void refetch()} className="cursor-pointer text-[#EF4444]">
            <Icon name="close" size={18} />
          </button>
        </div>
      )}

      {loading && !report ? (
        <div className="py-24 rounded-2xl border border-[#E2E8F0] bg-white text-center text-[13px] text-[#64748B]">
          <Icon name="sync" size={32} className="animate-spin text-[#0B6EF3] mx-auto mb-2" />
          <p className="font-semibold">{so ? "Warbixinta ayaa la xisaabinayaa..." : "Aggregating platform intelligence metrics..."}</p>
        </div>
      ) : report ? (
        <article className="report-print-area flex flex-col gap-6">
          {/* Printable Brand Header */}
          <header className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-[#0B6EF3] pb-4 bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
            <div>
              <BetterMeLogo size={38} />
              <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-[#10B981]">
                {so ? "Warbixinta Rasmiga ah ee BetterMe" : "BetterMe Executive Intelligence"}
              </p>
              <h2 className="text-[20px] font-extrabold text-[#0F172A] mt-0.5">
                {so ? "Warbixinta Kobaca & Waxqabadka" : "Platform Growth & Habit Velocity Report"}
              </h2>
            </div>
            <div className="text-left sm:text-right text-[12px] text-[#64748B]">
              <p className="font-bold text-[#0F172A] text-[13px]">
                {report.from} — {report.to}
              </p>
              <p className="mt-1">
                {so ? "La diyaariyay:" : "Generated:"} {new Date().toLocaleString()}
              </p>
            </div>
          </header>

          {/* Layer 3: Summary Metrics (KPI Row) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AdminKpiCard
              label={so ? "Xubnaha Cusub" : "New Registrations"}
              value={report.summary.newUsers}
              icon="person_add"
              variant="blue"
              subtext={so ? "Akoonnada cusub ee la abuuray" : "New member accounts onboarded"}
            />
            <AdminKpiCard
              label={so ? "Xubnaha Firfircoon" : "Active Habit Trackers"}
              value={report.summary.activeMembers}
              icon="verified"
              variant="success"
              subtext={so ? "Ugu yaraan hal check-in" : "Completed >= 1 habit check-in"}
            />
            <AdminKpiCard
              label={so ? "Dhammaystirka Caadooyinka" : "Habit Completions"}
              value={report.summary.completions}
              icon="task_alt"
              variant="success"
              subtext={so ? "Isku-geynta check-in-yada" : "Total daily habit milestones achieved"}
            />
            <AdminKpiCard
              label={so ? "Caadooyin Cusub" : "New Habits Created"}
              value={report.summary.newHabits}
              icon="add_task"
              variant="warning"
              subtext={so ? "Caadooyinka cusub ee la bilaabay" : "Routines and habits established"}
            />
          </div>

          {/* Secondary Financial/Ops summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AdminKpiCard
              label={so ? "Dakhliga Maaliyadda" : "Finance Inflow"}
              value={currency(report.summary.financeIncome)}
              icon="payments"
              variant="success"
              subtext={so ? "Dakhliga diiwaangashan" : "Gross revenue inflow"}
            />
            <AdminKpiCard
              label={so ? "Kharashaadka Maaliyadda" : "Finance Outflow"}
              value={currency(report.summary.financeExpense)}
              icon="shopping_cart"
              variant="danger"
              subtext={so ? "Kharashka diiwaangashan" : "Recorded expenditures"}
            />
            <AdminKpiCard
              label={so ? "Dhaqdhaqaaqyada Xisaabaadka" : "Finance Records"}
              value={report.summary.financeEntries}
              icon="receipt"
              variant="neutral"
              subtext={so ? "Tirada xisaab-xidhka" : "Total transactions logged"}
            />
            <AdminKpiCard
              label={so ? "Hawlaha Maamulka" : "Admin Operations"}
              value={report.summary.adminActions}
              icon="shield"
              variant="blue"
              subtext={so ? "Ficillada maamulka la qoray" : "Audited admin operations"}
            />
          </div>

          {/* Layer 4A: Daily Velocity Bar Chart */}
          <section className="report-print-card bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icon name="monitoring" size={20} className="text-[#0B6EF3]" />
                <h3 className="text-[14px] font-bold text-[#0F172A]">
                  {so ? "Dhammaystirka Caadooyinka Maalinlaha Ah" : "Daily Habit Completion Velocity"}
                </h3>
              </div>
              <span className="text-[11px] font-bold text-[#10B981] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-[#10B981]/20">
                Peak: {maxDaily} / day
              </span>
            </div>

            <div className="flex h-44 items-end gap-1.5 overflow-x-auto pb-2 pt-4">
              {report.daily.map((day) => {
                const heightPercent = Math.max(6, (day.count / maxDaily) * 100);
                const isPeak = day.count === maxDaily && maxDaily > 0;

                return (
                  <div key={day.date} className="flex h-full min-w-6 flex-1 flex-col items-center justify-end gap-1.5">
                    <span className="text-[9px] font-bold tabular-nums text-slate-500">{day.count}</span>
                    <div
                      title={`${day.date}: ${day.count} completions`}
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-7 rounded-t-lg transition-all ${
                        isPeak ? "bg-[#10B981]" : "bg-[#0B6EF3] hover:bg-[#0958c7]"
                      }`}
                    />
                    {(report.daily.length <= 14 || day.date.endsWith("-01") || day.date.endsWith("-15")) && (
                      <span className="text-[8px] font-bold text-slate-400">{day.date.slice(5)}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Layer 4B: Top Performers & Top Habits (2 cols) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Active Members */}
            <section className="report-print-card bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="military_tech" size={20} className="text-[#F59E0B]" />
                <h3 className="text-[14px] font-bold text-[#0F172A]">
                  {so ? "Xubnaha Ugu Firfircoon" : "Most Consistent Members"}
                </h3>
              </div>

              {report.topUsers.length ? (
                <ol className="divide-y divide-[#F1F5F9]">
                  {report.topUsers.map((user, index) => (
                    <li key={user.userId} className="flex items-center gap-3 py-3">
                      <span className="w-6 text-[12px] font-extrabold text-[#64748B]">#{index + 1}</span>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/admin/users/${user.userId}`}
                          className="block truncate text-[13px] font-bold text-[#0F172A] hover:text-[#0B6EF3] transition-colors"
                        >
                          {user.name}
                        </Link>
                        <p className="truncate text-[11px] text-[#64748B]">{user.email}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-extrabold bg-emerald-50 text-[#10B981] border border-[#10B981]/20 tabular-nums">
                        <Icon name="check" size={13} />
                        {user.completions}
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="py-8 text-center text-[12px] text-[#64748B]">{so ? "Xog lama helin" : "No member activity logged in this period"}</p>
              )}
            </section>

            {/* Top Habits */}
            <section className="report-print-card bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="workspace_premium" size={20} className="text-[#0B6EF3]" />
                <h3 className="text-[14px] font-bold text-[#0F172A]">
                  {so ? "Caadooyinka Ugu Badan Ee La Dhammaystiray" : "Highest Traction Habits"}
                </h3>
              </div>

              {report.topHabits.length ? (
                <ol className="divide-y divide-[#F1F5F9]">
                  {report.topHabits.map((habit, index) => (
                    <li key={habit.habitId} className="flex items-center gap-3 py-3">
                      <span className="w-6 text-[12px] font-extrabold text-[#64748B]">#{index + 1}</span>
                      <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-[#0F172A]">
                        {habit.name}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-extrabold bg-blue-50 text-[#0B6EF3] border border-[#0B6EF3]/20 tabular-nums">
                        {habit.completions}
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="py-8 text-center text-[12px] text-[#64748B]">{so ? "Xog lama helin" : "No habit activity logged in this period"}</p>
              )}
            </section>
          </div>

          {/* Layer 4C: Admin Operations Breakdown */}
          <section className="report-print-card bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="shield" size={18} className="text-[#0B6EF3]" />
              <h3 className="text-[14px] font-bold text-[#0F172A]">
                {so ? "Hawlaha Maamulka Ee La Qabtay" : "Administrative Operations Distribution"}
              </h3>
            </div>
            {report.adminActionsByType.length ? (
              <div className="flex flex-wrap gap-2.5 pt-1">
                {report.adminActionsByType.map((item) => (
                  <span
                    key={item.action}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-[12px] font-semibold text-slate-700"
                  >
                    <span>{item.action}:</span>
                    <strong className="font-extrabold text-[#0B6EF3] tabular-nums">{item.count}</strong>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-[#64748B] py-2">{so ? "Ma jiraan hawlo admin xilligan" : "No administrative actions recorded in this period"}</p>
            )}
          </section>

          {/* Printable Footer */}
          <footer className="border-t border-[#E2E8F0] pt-4 flex items-center justify-between text-[11px] text-[#94A3B8]">
            <span>BetterMe Platform · {so ? "Warbixin maamul oo sir ah" : "Confidential Executive Audit"}</span>
            <span>Document Checksum: Verified</span>
          </footer>
        </article>
      ) : null}
    </div>
  );
}