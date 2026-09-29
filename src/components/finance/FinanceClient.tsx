"use client";

import React, { useState, useMemo } from "react";
import Icon from "@/components/ui/Icon";
import SavingsGoalsPanel from "@/components/finance/SavingsGoalsPanel";
import { useTranslation } from "@/lib/i18n";
import { useUserFinance, Transaction } from "@/hooks/useUserFinance";

const INCOME_CATEGORIES = [
  { id: "salary", labelEn: "Salary", labelSo: "Mushaar", icon: "payments" },
  { id: "business", labelEn: "Business", labelSo: "Ganacsi", icon: "store" },
  { id: "freelance", labelEn: "Freelance", labelSo: "Shaqo Madaxbanaan", icon: "laptop" },
  { id: "investment", labelEn: "Investment Inflow", labelSo: "Faa'iido Maalgashi", icon: "trending_up" },
  { id: "gift", labelEn: "Gift / Support", labelSo: "Hadiyad / Kaalmo", icon: "featured_seasonal_and_gifts" },
  { id: "other", labelEn: "Other", labelSo: "Kale", icon: "more_horiz" },
];

const EXPENSE_CATEGORIES = [
  { id: "housing", labelEn: "Rent & Housing", labelSo: "Kiro & Guri", icon: "home" },
  { id: "food", labelEn: "Food & Groceries", labelSo: "Cunto & Suuq", icon: "restaurant" },
  { id: "transport", labelEn: "Transportation", labelSo: "Gaadiid", icon: "directions_car" },
  { id: "bills", labelEn: "Bills & Utilities", labelSo: "Biilal & Adeegyo", icon: "receipt" },
  { id: "health", labelEn: "Health & Medical", labelSo: "Caafimaad", icon: "medical_services" },
  { id: "shopping", labelEn: "Shopping", labelSo: "Dukaameysi", icon: "shopping_bag" },
  { id: "entertainment", labelEn: "Entertainment", labelSo: "Madadaalo", icon: "sports_esports" },
  { id: "other", labelEn: "Other", labelSo: "Kale", icon: "more_horiz" },
];

const SAVING_CATEGORIES = [
  { id: "emergency", labelEn: "Emergency Fund", labelSo: "Sanduuqa Degdegga", icon: "shield" },
  { id: "investment_savings", labelEn: "Investment Vault", labelSo: "Kaydka Maalgashiga", icon: "candlestick_chart" },
  { id: "bank_deposit", labelEn: "Bank Deposit", labelSo: "Dhigasho Bank", icon: "account_balance" },
  { id: "asset_purchase", labelEn: "Asset / Real Estate", labelSo: "Guri / Hanti Iibsi", icon: "apartment" },
  { id: "education", labelEn: "Education / Training", labelSo: "Waxbarasho & Tababar", icon: "school" },
  { id: "future_travel", labelEn: "Hajj / Travel", labelSo: "Xaj / Socdaal", icon: "flight_takeoff" },
  { id: "personal_vault", labelEn: "Personal Vault", labelSo: "Kayd Gaar ah", icon: "savings" },
  { id: "other", labelEn: "Other", labelSo: "Kale", icon: "more_horiz" },
];

interface FormState {
  type: "income" | "expense" | "saving";
  amount: string;
  currency: string;
  category: string;
  title: string;
  notes: string;
  date: string;
}

const emptyForm: FormState = {
  type: "expense",
  amount: "",
  currency: "USD",
  category: "food",
  title: "",
  notes: "",
  date: new Date().toISOString().slice(0, 10),
};

export default function FinanceClient() {
  const { language } = useTranslation();
  const so = language === "so";
  const [view, setView] = useState<"transactions" | "savings">("transactions");
  const [activeTab, setActiveTab] = useState<"all" | "income" | "expense" | "saving">("all");
  const [search, setSearch] = useState("");

  const {
    transactions,
    summary,
    isLoading,
    isFetching,
    saveTransaction,
    isSaving,
    deleteTransaction,
  } = useUserFinance();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState("");

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const openCreate = (initialType: "income" | "expense" | "saving" = "expense") => {
    setEditing(null);
    setForm({
      ...emptyForm,
      type: initialType,
      category:
        initialType === "income"
          ? "salary"
          : initialType === "saving"
          ? "emergency"
          : "food",
    });
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (t: Transaction) => {
    setEditing(t);
    setForm({
      type: t.type,
      amount: String(t.amount),
      currency: t.currency || "USD",
      category: t.category,
      title: t.title,
      notes: t.notes || "",
      date: t.date,
    });
    setFormError("");
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setFormError(so ? "Fadlan geli cinwaanka" : "Title is required");
      return;
    }
    const numAmount = Number(form.amount);
    if (!numAmount || numAmount <= 0) {
      setFormError(so ? "Fadlan geli qadar sax ah" : "Please enter a valid amount");
      return;
    }

    setFormError("");
    try {
      await saveTransaction({
        id: editing?._id,
        payload: {
          ...form,
          amount: numAmount,
        },
      });
      setFormOpen(false);
    } catch (err: unknown) {
      setFormError((err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(so ? "Ma hubtaa inaad tirtirto dhaqdhaqaaqan?" : "Are you sure you want to delete this transaction?")) {
      return;
    }
    try {
      await deleteTransaction(id);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  // Filtered rows
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (activeTab !== "all" && t.type !== activeTab) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchCategory = t.category.toLowerCase().includes(q);
        const matchNotes = t.notes?.toLowerCase().includes(q);
        if (!matchTitle && !matchCategory && !matchNotes) return false;
      }
      return true;
    });
  }, [transactions, activeTab, search]);

  // Financial percentages for visual distribution bar
  const totalInflow = Math.max(summary.income, summary.expense + summary.saving + Math.max(0, summary.balance));
  const expensePct = totalInflow > 0 ? Math.min(100, Math.round((summary.expense / totalInflow) * 100)) : 0;
  const savingPct = totalInflow > 0 ? Math.min(100, Math.round((summary.saving / totalInflow) * 100)) : 0;
  const balancePct = Math.max(0, 100 - expensePct - savingPct);

  // Savings rate: (Saving / Income) * 100%
  const savingsRate = summary.income > 0 ? Math.round((summary.saving / summary.income) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 pb-28 md:pb-12 max-w-7xl mx-auto w-full">
      {/* ── BETTERME BRANDED PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-[#E7ECF3] p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] border border-[#0B6EF3]/15 flex items-center justify-center text-[#0B6EF3] shrink-0">
            <Icon name="account_balance_wallet" size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[22px] font-black tracking-tight text-[#111827] font-[family-name:var(--font-headline)]">
                {view === "savings"
                  ? so ? "Kaydkayga & Yoolalka" : "Savings & Wealth Goals"
                  : so ? "Maaliyaddayda" : "Personal Finance Hub"}
              </h1>
              {isFetching && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0B6EF3] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0B6EF3]"></span>
                </span>
              )}
            </div>
            <p className="text-[13px] text-[#667085] mt-0.5">
              {view === "savings"
                ? so
                  ? "Deji yoolal cadcad, kobci kaydkaaga, oo dhis madaxbannaanidaada dhaqaale."
                  : "Set savings goals, build emergency reserves, and grow your wealth."
                : so
                  ? "La soco dakhligaaga, kharashka, kaydka iyo haraagaaga si fudud."
                  : "Track your income, expenses, savings vault, and net balance with calm clarity."}
            </p>
          </div>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <div className="flex rounded-xl border border-[#E7ECF3] bg-[#F8FAFC] p-1">
            <button
              type="button"
              onClick={() => setView("transactions")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                view === "transactions"
                  ? "bg-white text-[#0B6EF3] shadow-xs"
                  : "text-[#667085] hover:text-[#111827]"
              }`}
            >
              <Icon name="receipt_long" size={16} />
              <span>{so ? "Dhaqdhaqaaqyo" : "Transactions"}</span>
            </button>
            <button
              type="button"
              onClick={() => setView("savings")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                view === "savings"
                  ? "bg-white text-[#168A67] shadow-xs"
                  : "text-[#667085] hover:text-[#111827]"
              }`}
            >
              <Icon name="savings" size={16} />
              <span>{so ? "Yoolalka Kaydka" : "Savings Goals"}</span>
            </button>
          </div>

          {view === "transactions" && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openCreate("saving")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#168A67]/25 bg-[#EAF8F2] hover:bg-[#d6f2e4] text-[#168A67] px-3.5 py-2 text-[12px] font-bold transition-all cursor-pointer shadow-xs"
              >
                <Icon name="savings" size={17} />
                <span>{so ? "Dhig Kayd" : "Add Saving"}</span>
              </button>
              <button
                type="button"
                onClick={() => openCreate("expense")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B6EF3] hover:bg-[#0958c7] px-4 py-2 text-[12px] font-bold text-white shadow-xs transition-all cursor-pointer"
              >
                <Icon name="add" size={17} />
                <span>{so ? "Diiwaangeli" : "New Entry"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {view === "savings" ? (
        <SavingsGoalsPanel />
      ) : (
        <>
          {/* ── 4 PILLARS WITH BETTERME BRANDING ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. INCOME (Growth Green) */}
            <div className="bg-white rounded-3xl border border-[#E7ECF3] p-5 shadow-xs hover:border-[#10B981]/40 transition-all flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                    {so ? "Dakhliga Guud" : "Total Income"}
                  </span>
                  <p className="text-[24px] font-black text-[#111827] mt-1 tabular-nums">
                    {fmt(summary.income)}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-[#ECFDF3] text-[#10B981] flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <Icon name="trending_up" size={22} />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#F2F4F7] flex items-center justify-between text-[11px] text-[#667085]">
                <span className="flex items-center gap-1 text-[#10B981] font-bold">
                  <Icon name="south_west" size={13} /> {so ? "Soo galay" : "Inflow"}
                </span>
                <span>{so ? "Dakhliga diiwaangashan" : "Earned inflows"}</span>
              </div>
            </div>

            {/* 2. EXPENSE (Outflow Rose) */}
            <div className="bg-white rounded-3xl border border-[#E7ECF3] p-5 shadow-xs hover:border-[#EF4444]/40 transition-all flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                    {so ? "Kharashka Guud" : "Total Expense"}
                  </span>
                  <p className="text-[24px] font-black text-[#111827] mt-1 tabular-nums">
                    {fmt(summary.expense)}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-[#FFF1F0] text-[#EF4444] flex items-center justify-center shrink-0 border border-rose-500/20">
                  <Icon name="trending_down" size={22} />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#F2F4F7] flex items-center justify-between text-[11px] text-[#667085]">
                <span className="flex items-center gap-1 text-[#EF4444] font-bold">
                  <Icon name="north_east" size={13} /> {so ? "Baxay" : "Outflow"}
                </span>
                <span>{so ? "Kharashka baxay" : "Spent outflows"}</span>
              </div>
            </div>

            {/* 3. SAVING (BetterMe Growth Vault Green) */}
            <div className="bg-white rounded-3xl border border-[#C9D8D1] p-5 shadow-xs hover:border-[#168A67] transition-all flex flex-col justify-between bg-gradient-to-br from-[#EAF8F2]/40 to-transparent">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#168A67]">
                      {so ? "Kaydka La Dhigay" : "Total Saved"}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#EAF8F2] text-[#168A67] border border-[#168A67]/20">
                      {so ? "Kayd" : "Vault"}
                    </span>
                  </div>
                  <p className="text-[24px] font-black text-[#168A67] mt-1 tabular-nums">
                    {fmt(summary.saving)}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-[#EAF8F2] text-[#168A67] flex items-center justify-center shrink-0 border border-[#168A67]/25 shadow-2xs">
                  <Icon name="savings" size={22} />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#EAF0EC] flex items-center justify-between text-[11px] text-[#667085]">
                <span className="flex items-center gap-1 text-[#168A67] font-bold">
                  <Icon name="lock" size={13} /> {so ? "La Keydsaday" : "Preserved"}
                </span>
                <span className="text-[#168A67] font-semibold">
                  {so ? "Sanduuqa Kaydkaaga" : "Growth Reserve"}
                </span>
              </div>
            </div>

            {/* 4. NET BALANCE (Signature BetterMe Blue) */}
            <div className="bg-white rounded-3xl border border-[#0B6EF3]/30 p-5 shadow-xs hover:border-[#0B6EF3] transition-all flex flex-col justify-between bg-gradient-to-br from-[#EFF6FF]/60 to-transparent">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B6EF3]">
                      {so ? "Haraaga Kaa Hada" : "Net Balance"}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#EFF6FF] text-[#0B6EF3] border border-[#0B6EF3]/20">
                      {so ? "Kuu Hada" : "Liquid"}
                    </span>
                  </div>
                  <p
                    className={`text-[24px] font-black mt-1 tabular-nums ${
                      summary.balance >= 0 ? "text-[#0B6EF3]" : "text-[#EF4444]"
                    }`}
                  >
                    {fmt(summary.balance)}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-[#EFF6FF] text-[#0B6EF3] flex items-center justify-center shrink-0 border border-[#0B6EF3]/25 shadow-2xs">
                  <Icon name="account_balance_wallet" size={22} />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#0B6EF3]/15 flex items-center justify-between text-[11px] text-[#667085]">
                <span className="flex items-center gap-1 text-[#0B6EF3] font-bold">
                  <Icon name="balance" size={13} /> Dakhli - Kharash - Kayd
                </span>
                <span>{so ? "Lacagta xorta ah" : "Available cash"}</span>
              </div>
            </div>
          </div>

          {/* ── FINANCIAL ALLOCATION & SAVINGS RATE ── */}
          <div className="bg-white border border-[#E7ECF3] rounded-3xl p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-[15px] font-black text-[#111827] flex items-center gap-2">
                  <Icon name="pie_chart" size={19} className="text-[#0B6EF3]" />
                  <span>{so ? "Qaybsanka Dhaqaalaha & Heerka Kaydka" : "Cash Flow Allocation & Savings Rate"}</span>
                </h3>
                <p className="text-[12px] text-[#667085] mt-0.5">
                  {so
                    ? `Heerkaaga kaydka waa ${savingsRate}%. Qorshaha ugu wanaagsan waa in ugu yaraan 20% dakhliga la keydiyo.`
                    : `Your current savings rate is ${savingsRate}%. Recommended benchmark is keeping savings above 20%.`}
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-black bg-[#EAF8F2] text-[#168A67] border border-[#168A67]/20">
                  <Icon name="savings" size={15} />
                  <span>{savingsRate}% {so ? "Heerka Kaydka" : "Savings Rate"}</span>
                </span>
              </div>
            </div>

            {/* Visual stacked distribution bar */}
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex p-0.5 gap-1">
              <div
                style={{ width: `${expensePct}%` }}
                className="h-full bg-[#EF4444] rounded-full transition-all duration-500"
                title={`Kharash: ${expensePct}%`}
              />
              <div
                style={{ width: `${savingPct}%` }}
                className="h-full bg-[#168A67] rounded-full transition-all duration-500"
                title={`Kayd: ${savingPct}%`}
              />
              <div
                style={{ width: `${balancePct}%` }}
                className="h-full bg-[#0B6EF3] rounded-full transition-all duration-500"
                title={`Haraaga: ${balancePct}%`}
              />
            </div>

            {/* Legend pills */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-[12px] font-semibold text-[#667085]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                <span>{so ? "Kharash" : "Expenses"} ({expensePct}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#168A67]" />
                <span className="text-[#168A67] font-bold">
                  {so ? "Kayd" : "Savings"} ({savingPct}%)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0B6EF3]" />
                <span className="text-[#0B6EF3] font-bold">
                  {so ? "Haraaga Kaa Hada" : "Liquid Balance"} ({balancePct}%)
                </span>
              </div>
            </div>
          </div>

          {/* ── FILTER AND SEARCH CONTROLS ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "all"
                    ? "bg-[#0B6EF3] text-white shadow-xs"
                    : "bg-white border border-[#E7ECF3] text-[#667085] hover:text-[#111827]"
                }`}
              >
                {so ? "Dhammaan" : "All"} ({transactions.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("income")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "income"
                    ? "bg-[#10B981] text-white shadow-xs"
                    : "bg-white border border-[#E7ECF3] text-[#667085] hover:text-[#10B981]"
                }`}
              >
                <Icon name="trending_up" size={15} />
                <span>{so ? "Dakhli" : "Income"}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("expense")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "expense"
                    ? "bg-[#EF4444] text-white shadow-xs"
                    : "bg-white border border-[#E7ECF3] text-[#667085] hover:text-[#EF4444]"
                }`}
              >
                <Icon name="trending_down" size={15} />
                <span>{so ? "Kharash" : "Expense"}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("saving")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "saving"
                    ? "bg-[#168A67] text-white shadow-xs"
                    : "bg-white border border-[#C9D8D1] text-[#168A67] hover:bg-[#EAF8F2]"
                }`}
              >
                <Icon name="savings" size={15} />
                <span>{so ? "Kayd" : "Saving"}</span>
              </button>
            </div>

            {/* Search Box */}
            <div className="relative min-w-[220px]">
              <Icon
                name="search"
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3]"
              />
              <input
                type="text"
                placeholder={so ? "Raadi dhaqdhaqaaq..." : "Search transactions..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#E7ECF3] bg-white text-[13px] text-[#111827] placeholder-[#98A2B3] focus:border-[#0B6EF3] outline-none shadow-2xs"
              />
            </div>
          </div>

          {/* ── TRANSACTIONS LIST ── */}
          <div className="flex flex-col gap-2.5">
            {isLoading ? (
              <div className="bg-white rounded-3xl border border-[#E7ECF3] p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B6EF3] mb-3"></div>
                <p className="text-[13px] text-[#667085]">
                  {so ? "Xogta maaliyadda waa la soo rarayaa..." : "Loading financial transactions..."}
                </p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-[#E7ECF3] p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#0B6EF3] flex items-center justify-center mx-auto mb-3">
                  <Icon name="receipt_long" size={28} />
                </div>
                <h4 className="text-[16px] font-black text-[#111827]">
                  {so ? "Wax dhaqdhaqaaq ah laguma helin" : "No transactions found"}
                </h4>
                <p className="text-[13px] text-[#667085] max-w-sm mx-auto mt-1 mb-5">
                  {so
                    ? "Diiwaangeli dakhligaaga, kharashkaaga ama lacagta aad kaydsatay si aad u maamusho dhaqaalahaaga."
                    : "Add your income, expense, or savings transaction to start monitoring your cash flow."}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => openCreate("saving")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold bg-[#EAF8F2] text-[#168A67] border border-[#168A67]/20 cursor-pointer hover:bg-[#d5f3e4]"
                  >
                    <Icon name="savings" size={16} />
                    <span>{so ? "Dhig Kayd" : "Add Saving"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openCreate("expense")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold bg-[#0B6EF3] text-white cursor-pointer hover:bg-[#0958c7]"
                  >
                    <Icon name="add" size={16} />
                    <span>{so ? "Diiwaangeli Kharash" : "Add Expense"}</span>
                  </button>
                </div>
              </div>
            ) : (
              filteredTransactions.map((t) => {
                const isIncome = t.type === "income";
                const isSaving = t.type === "saving";
                return (
                  <div
                    key={t._id}
                    className="group bg-white rounded-2xl border border-[#E7ECF3] p-4 flex items-center justify-between gap-4 shadow-xs hover:border-[#CBD5E1] hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                          isIncome
                            ? "bg-[#ECFDF3] text-[#10B981] border-emerald-500/20"
                            : isSaving
                            ? "bg-[#EAF8F2] text-[#168A67] border-[#168A67]/25"
                            : "bg-[#FFF1F0] text-[#EF4444] border-rose-500/20"
                        }`}
                      >
                        <Icon
                          name={
                            isIncome
                              ? "arrow_downward"
                              : isSaving
                              ? "savings"
                              : "arrow_upward"
                          }
                          size={20}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[14px] font-bold text-[#111827] truncate">
                            {t.title}
                          </p>
                          {isSaving && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#EAF8F2] text-[#168A67] border border-[#168A67]/20">
                              {so ? "KAYD" : "SAVED"}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#667085]">
                          <span className="font-semibold text-slate-700 capitalize">
                            {t.category}
                          </span>
                          <span>•</span>
                          <span>{t.date}</span>
                          {t.notes && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[200px] italic">{t.notes}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-[16px] font-black tabular-nums tracking-tight ${
                          isIncome
                            ? "text-[#10B981]"
                            : isSaving
                            ? "text-[#168A67]"
                            : "text-[#EF4444]"
                        }`}
                      >
                        {isIncome ? "+" : isSaving ? "🪙 " : "-"}
                        {fmt(t.amount)}
                      </span>
                      <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => openEdit(t)}
                          className="p-1.5 rounded-lg text-[#667085] hover:text-[#0B6EF3] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                          title={so ? "Wax ka beddel" : "Edit"}
                        >
                          <Icon name="edit" size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(t._id)}
                          className="p-1.5 rounded-lg text-[#667085] hover:text-[#EF4444] hover:bg-[#FFF1F0] transition-colors cursor-pointer"
                          title={so ? "Tirtir" : "Delete"}
                        >
                          <Icon name="delete" size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* ── CREATE / EDIT MODAL ── */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-3xl border border-[#E7ECF3] w-full max-w-lg p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#F2F4F7]">
              <h3 className="text-[18px] font-black text-[#111827]">
                {editing
                  ? so ? "Wax ka beddel Dhaqdhaqaaqa" : "Edit Transaction"
                  : so ? "Diiwaangeli Dhaqdhaqaaq Cusub" : "Record New Transaction"}
              </h3>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-[#FFF1F0] border border-[#EF4444]/20 text-[#EF4444] text-[13px] font-semibold flex items-center gap-2">
                <Icon name="error" size={17} />
                <span>{formError}</span>
              </div>
            )}

            {/* Type selector: Income vs Expense vs Saving */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#667085] mb-2">
                {so ? "Nooca Dhaqdhaqaaqa" : "Transaction Type"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      type: "expense",
                      category: EXPENSE_CATEGORIES[0].id,
                    }))
                  }
                  className={`py-2.5 px-3 rounded-2xl border text-[13px] font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    form.type === "expense"
                      ? "border-[#EF4444] bg-[#FFF1F0] text-[#EF4444] shadow-xs"
                      : "border-[#E7ECF3] bg-white text-[#667085] hover:bg-slate-50"
                  }`}
                >
                  <Icon name="trending_down" size={18} />
                  <span>{so ? "Kharash" : "Expense"}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      type: "income",
                      category: INCOME_CATEGORIES[0].id,
                    }))
                  }
                  className={`py-2.5 px-3 rounded-2xl border text-[13px] font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    form.type === "income"
                      ? "border-[#10B981] bg-[#ECFDF3] text-[#10B981] shadow-xs"
                      : "border-[#E7ECF3] bg-white text-[#667085] hover:bg-slate-50"
                  }`}
                >
                  <Icon name="trending_up" size={18} />
                  <span>{so ? "Dakhli" : "Income"}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      type: "saving",
                      category: SAVING_CATEGORIES[0].id,
                    }))
                  }
                  className={`py-2.5 px-3 rounded-2xl border text-[13px] font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    form.type === "saving"
                      ? "border-[#168A67] bg-[#EAF8F2] text-[#168A67] shadow-xs"
                      : "border-[#E7ECF3] bg-white text-[#667085] hover:bg-slate-50"
                  }`}
                >
                  <Icon name="savings" size={18} />
                  <span>{so ? "Kayd" : "Saving"}</span>
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#667085] mb-1.5">
                {so ? "Cinwaanka" : "Title / Description"}
              </label>
              <input
                required
                type="text"
                placeholder={
                  form.type === "income"
                    ? so ? "Tusaale: Mushaarka bishan" : "e.g. Monthly Salary"
                    : form.type === "saving"
                    ? so ? "Tusaale: Sanduuqa Kaydka Degdegga" : "e.g. Emergency Fund Deposit"
                    : so ? "Tusaale: Cuntada guriga & suuqa" : "e.g. Grocery store run"
                }
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7ECF3] bg-white text-[14px] text-[#111827] outline-none focus:border-[#0B6EF3]"
              />
            </div>

            {/* Amount and Currency */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#667085] mb-1.5">
                  {so ? "Qadarka" : "Amount ($ USD)"}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-[#E7ECF3] bg-white text-[15px] font-black tabular-nums text-[#111827] outline-none focus:border-[#0B6EF3]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#667085] mb-1.5">
                  {so ? "Lacagta" : "Currency"}
                </label>
                <select
                  value={form.currency}
                  onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E7ECF3] bg-white text-[13px] text-[#111827] outline-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="SOS">SOS (Sh)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>

            {/* Dynamic Category based on type */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#667085] mb-1.5">
                {so ? "Qaybta" : "Category"}
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7ECF3] bg-white text-[13px] text-[#111827] outline-none focus:border-[#0B6EF3]"
              >
                {(form.type === "income"
                  ? INCOME_CATEGORIES
                  : form.type === "saving"
                  ? SAVING_CATEGORIES
                  : EXPENSE_CATEGORIES
                ).map((c) => (
                  <option key={c.id} value={c.id}>
                    {so ? c.labelSo : c.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#667085] mb-1.5">
                {so ? "Taariikhda" : "Transaction Date"}
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7ECF3] bg-white text-[13px] text-[#111827] outline-none focus:border-[#0B6EF3]"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#667085] mb-1.5">
                {so ? "Qoraal kooban (Ikhtiyaari)" : "Notes (Optional)"}
              </label>
              <input
                type="text"
                placeholder={so ? "Faahfaahin dheeri ah..." : "Optional memo or receipt details..."}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7ECF3] bg-white text-[13px] text-[#111827] outline-none focus:border-[#0B6EF3]"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="flex-1 py-3 rounded-xl border border-[#E7ECF3] text-[13px] font-bold text-[#667085] hover:bg-slate-50 cursor-pointer transition-colors"
              >
                {so ? "Jooji" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white bg-[#0B6EF3] hover:bg-[#0958c7] shadow-md disabled:opacity-50 cursor-pointer transition-all"
              >
                {isSaving
                  ? so ? "Waa la keydinayaa..." : "Saving..."
                  : editing
                  ? so ? "Cusboonaysii" : "Update Transaction"
                  : so ? "Keydi Dhaqdhaqaaqa" : "Save Transaction"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
