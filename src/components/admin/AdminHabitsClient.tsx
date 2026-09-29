"use client";

import React, { useState, useMemo } from "react";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";
import { useAdminHabits, AdminHabitItem } from "@/hooks/useAdminHabits";
import AdminPageHeader from "./design-system/AdminPageHeader";
import AdminContextBar from "./design-system/AdminContextBar";
import AdminKpiCard from "./design-system/AdminKpiCard";

export default function AdminHabitsClient() {
  const { language } = useTranslation();
  const so = language === "so";

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // React Query SWR Cache-First Data
  const { data: habits = [], isLoading, isFetching, refetch } = useAdminHabits(search);

  // Drawer & Action states
  const [selectedHabit, setSelectedHabit] = useState<AdminHabitItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<AdminHabitItem | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "health",
    status: "active",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filtered habits
  const filteredHabits = useMemo(() => {
    return habits.filter((h) => {
      const matchCategory =
        categoryFilter === "all" ||
        (h.category || "").toLowerCase() === categoryFilter.toLowerCase();
      const matchStatus =
        statusFilter === "all" ||
        (h.status || "active").toLowerCase() === statusFilter.toLowerCase();
      return matchCategory && matchStatus;
    });
  }, [habits, categoryFilter, statusFilter]);

  // KPI calculations
  const totalHabits = habits.length;
  const activeHabits = habits.filter((h) => (h.status || "active") === "active").length;
  const totalCompletions = habits.reduce((acc, h) => acc + (h.totalCompletions || 0), 0);
  const avgStreak = totalHabits > 0
    ? (habits.reduce((acc, h) => acc + (h.currentStreak || 0), 0) / totalHabits).toFixed(1)
    : "0";

  // Actions
  const handleOpenDrawer = (habit: AdminHabitItem) => {
    setSelectedHabit(habit);
    setDrawerOpen(true);
    setActiveMenuId(null);
  };

  const handleEditClick = (habit: AdminHabitItem) => {
    setEditingHabit(habit);
    setForm({
      name: habit.name || "",
      description: habit.description || "",
      category: habit.category || "health",
      status: habit.status || "active",
    });
    setActiveMenuId(null);
  };

  const handleToggleStatus = async (habit: AdminHabitItem) => {
    const nextStatus = habit.status === "paused" ? "active" : "paused";
    try {
      await fetch(`/api/admin/habits/${habit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      refetch();
    } catch (err) {
      console.error(err);
    }
    setActiveMenuId(null);
  };

  const handleResetStreak = async (habit: AdminHabitItem) => {
    if (!confirm(so ? "Ma hubtaa inaad xiriirka u eberayso caadadan?" : "Reset current streak to 0 for this habit?")) return;
    try {
      await fetch(`/api/admin/habits/${habit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentStreak: 0 }),
      });
      refetch();
    } catch (err) {
      console.error(err);
    }
    setActiveMenuId(null);
  };

  const handleDelete = async (habit: AdminHabitItem) => {
    if (!confirm(so ? "Ma hubtaa inaad qashinka u wareejiso?" : "Move this habit to the recycle bin?")) return;
    try {
      await fetch(`/api/admin/habits/${habit.id}`, { method: "DELETE" });
      refetch();
      setDrawerOpen(false);
    } catch (err) {
      console.error(err);
    }
    setActiveMenuId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHabit) return;
    setIsSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/admin/habits/${editingHabit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Update failed");
      setStatusMsg({ type: "success", text: so ? "Si guul leh ayaa loo keydiyay" : "Saved successfully" });
      setTimeout(() => {
        setEditingHabit(null);
        refetch();
      }, 500);
    } catch (err) {
      setStatusMsg({ type: "error", text: (err as Error).message });
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryColor = (cat = "health") => {
    switch (cat.toLowerCase()) {
      case "health":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "learning":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "fitness":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "mindfulness":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* ── Layer 1: Page Header ── */}
      <AdminPageHeader
        badge={so ? "Dhaqanka & Hawlaha" : "Habit Operations"}
        badgeIcon="task_alt"
        title={so ? "Caadooyinka & Hawlaha (Habits & Tasks)" : "Habits & Tasks Management"}
        description={
          so
            ? "Maamul caadooyinka, xiriirrada firfircoon, iyo jadwalka maalinlaha ah ee dhammaan xubnaha bulshada BetterMe."
            : "Manage habits, consistency streaks, and daily performance metrics across the entire BetterMe community."
        }
      >
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#0B6EF3] hover:bg-[#0958C7] text-white text-[13px] font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Icon name="add" size={17} />
          <span>{so ? "Samee Caado Cusub" : "Create Habit"}</span>
        </button>
      </AdminPageHeader>

      {/* ── Layer 3: Summary KPI Metrics ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <AdminKpiCard
          label={so ? "Wadarta Caadooyinka" : "All Habits"}
          value={totalHabits}
          sublabel={so ? "Caadooyinka nidaamka ku jira" : "Total registered habits"}
          trend="9.2%"
          trendDirection="up"
          icon="view_agenda"
          iconColor="#0B6EF3"
          iconBg="#EFF6FF"
          loading={isLoading && !habits.length}
        />
        <AdminKpiCard
          label={so ? "Kuwa Firfircoon" : "Active Habits"}
          value={activeHabits}
          sublabel={so ? "Kuwa xubnuhu wadaan" : "Currently tracked by users"}
          trend="6.4%"
          trendDirection="up"
          icon="check_circle"
          iconColor="#10B981"
          iconBg="#ECFDF5"
          loading={isLoading && !habits.length}
        />
        <AdminKpiCard
          label={so ? "Wadarta Dhameystirka" : "Total Completed"}
          value={totalCompletions.toLocaleString()}
          sublabel={so ? "Isku darka jeerka la qabtay" : "Cumulative successful checks"}
          trend="18.1%"
          trendDirection="up"
          icon="task_alt"
          iconColor="#059669"
          iconBg="#ECFDF5"
          loading={isLoading && !habits.length}
        />
        <AdminKpiCard
          label={so ? "Celcelis Streak" : "Average Streak"}
          value={`${avgStreak} ${so ? "bari" : "days"}`}
          sublabel={so ? "Heerka joogteynta guud" : "Community consistency mean"}
          trend="4.5%"
          trendDirection="up"
          icon="local_fire_department"
          iconColor="#F59E0B"
          iconBg="#FFFBEB"
          loading={isLoading && !habits.length}
        />
      </div>

      {/* ── Layer 2: Context Bar (Search + Category + Status Filters) ── */}
      <AdminContextBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={so ? "Raadi caado ama milkiile..." : "Search habits or owner..."}
        totalCount={filteredHabits.length}
        countLabel={so ? "caadooyin" : "habits"}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
      >
        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label={so ? "Qeybta caadada" : "Habit Category"}
          className="px-3 py-2 text-[12px] font-bold bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#334155] focus:outline-none focus:border-[#0B6EF3] cursor-pointer"
        >
          <option value="all">{so ? "Dhammaan Qeybaha" : "All Categories"}</option>
          <option value="health">{so ? "Caafimaad (Health)" : "Health"}</option>
          <option value="learning">{so ? "Waxbarasho (Learning)" : "Learning"}</option>
          <option value="fitness">{so ? "Jimicsi (Fitness)" : "Fitness"}</option>
          <option value="mindfulness">{so ? "Degganaansho (Mindfulness)" : "Mindfulness"}</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label={so ? "Xaaladda caadada" : "Habit Status"}
          className="px-3 py-2 text-[12px] font-bold bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#334155] focus:outline-none focus:border-[#0B6EF3] cursor-pointer"
        >
          <option value="all">{so ? "Dhammaan Xaaladaha" : "All Statuses"}</option>
          <option value="active">{so ? "Firfircoon" : "Active"}</option>
          <option value="paused">{so ? "Joogsaday" : "Paused"}</option>
        </select>
      </AdminContextBar>

      {/* ── Layer 4: Main Workspace Table ── */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-4">{so ? "Caadada" : "Habit"}</th>
                <th className="py-3 px-4">{so ? "Milkiilaha" : "Owner"}</th>
                <th className="py-3 px-4">{so ? "Qeybta" : "Category"}</th>
                <th className="py-3 px-4">{so ? "Xaaladda" : "Status"}</th>
                <th className="py-3 px-4">{so ? "Xiriirka" : "Streak"}</th>
                <th className="py-3 px-4 text-right w-16">{so ? "Action" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-[13px]">
              {filteredHabits.map((habit) => {
                const isActive = (habit.status || "active") === "active";
                return (
                  <tr
                    key={habit.id}
                    className="hover:bg-[#F8FAFC] transition-colors group cursor-pointer"
                  >
                    {/* Habit Info */}
                    <td className="py-3.5 px-4" onClick={() => handleOpenDrawer(habit)}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#0B6EF3] flex items-center justify-center text-[18px] shrink-0 font-bold">
                          {habit.icon ? (
                            <Icon name={habit.icon} size={20} />
                          ) : (
                            habit.name[0]?.toUpperCase() || "H"
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#0F172A] truncate group-hover:text-[#0B6EF3] transition-colors">
                            {habit.name}
                          </p>
                          <p className="text-[11px] text-[#64748B] truncate max-w-xs">
                            {habit.description || (habit.frequency ? `Frequency: ${habit.frequency}` : "Daily habit")}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="py-3.5 px-4" onClick={() => handleOpenDrawer(habit)}>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#0F172A] truncate">
                          {habit.userName || "Member"}
                        </p>
                        <p className="text-[11px] text-[#64748B] truncate">
                          {habit.userEmail || "—"}
                        </p>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4" onClick={() => handleOpenDrawer(habit)}>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold border capitalize ${getCategoryColor(
                          habit.category
                        )}`}
                      >
                        {habit.category || "General"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4" onClick={() => handleOpenDrawer(habit)}>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide ${
                          isActive
                            ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                            : "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? "bg-[#10B981]" : "bg-[#EF4444]"
                          }`}
                        />
                        {isActive ? (so ? "Firfircoon" : "Active") : (so ? "Joogsaday" : "Paused")}
                      </span>
                    </td>

                    {/* Streak */}
                    <td className="py-3.5 px-4" onClick={() => handleOpenDrawer(habit)}>
                      <span className="inline-flex items-center gap-1 font-extrabold text-[#D97706] tabular-nums">
                        <Icon name="local_fire_department" size={16} />
                        {habit.currentStreak || 0} {so ? "bari" : "days"}
                      </span>
                    </td>

                    {/* Actions dropdown */}
                    <td className="py-3.5 px-4 text-right relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === habit.id ? null : habit.id);
                        }}
                        aria-label={so ? "Ficillada" : "Actions menu"}
                        className="w-8 h-8 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Icon name="more_vert" size={18} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === habit.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-4 top-12 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-[#E2E8F0] p-1.5 z-30 text-left animate-in fade-in zoom-in-95 duration-150"
                        >
                          <button
                            type="button"
                            onClick={() => handleOpenDrawer(habit)}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold text-[#334155] hover:bg-[#F8FAFC] hover:text-[#0B6EF3]"
                          >
                            <Icon name="visibility" size={16} />
                            <span>{so ? "Faahfaahinta" : "View habit"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditClick(habit)}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold text-[#334155] hover:bg-[#F8FAFC] hover:text-[#0B6EF3]"
                          >
                            <Icon name="edit" size={16} />
                            <span>{so ? "Wax ka badal" : "Edit habit"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(habit)}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold text-[#334155] hover:bg-[#F8FAFC]"
                          >
                            <Icon name={isActive ? "pause" : "play_arrow"} size={16} />
                            <span>{isActive ? (so ? "Jooji (Pause)" : "Pause habit") : (so ? "Fur (Resume)" : "Resume habit")}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResetStreak(habit)}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold text-amber-600 hover:bg-amber-50"
                          >
                            <Icon name="restart_alt" size={16} />
                            <span>{so ? "Eberyeel streak-ga" : "Reset streak"}</span>
                          </button>
                          <div className="border-t border-[#F1F5F9] my-1" />
                          <button
                            type="button"
                            onClick={() => handleDelete(habit)}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-bold text-[#DC2626] hover:bg-[#FEF2F2]"
                          >
                            <Icon name="delete" size={16} />
                            <span>{so ? "U dir Qashinka" : "Move to recycle bin"}</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredHabits.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#94A3B8]">
                    <Icon name="search_off" size={32} className="mx-auto mb-2 text-[#CBD5E1]" />
                    <p className="font-bold text-[14px] text-[#64748B]">
                      {so ? "Wax caadooyin ah laguma helin shaandhadaada" : "No habits match your filters"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Layer 5: Habit Details Side Drawer ── */}
      {drawerOpen && selectedHabit && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl border-l border-[#E2E8F0] flex flex-col animate-in slide-in-from-right duration-250">
              {/* Drawer Header */}
              <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
                <h3 className="text-[14px] font-bold text-[#0F172A] uppercase tracking-wider">
                  {so ? "Faahfaahinta Caadada" : "Habit Details"}
                </h3>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/60 flex items-center justify-center transition-colors"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Hero Title */}
                <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] text-[#0B6EF3] flex items-center justify-center text-[28px] font-bold shadow-xs mb-3">
                    {selectedHabit.name[0]?.toUpperCase() || "H"}
                  </div>
                  <h4 className="text-[18px] font-extrabold text-[#0F172A]">
                    {selectedHabit.name}
                  </h4>
                  <span
                    className={`mt-2 inline-block px-3 py-1 rounded-md text-[11px] font-bold border capitalize ${getCategoryColor(
                      selectedHabit.category
                    )}`}
                  >
                    {selectedHabit.category || "Health"}
                  </span>
                  {selectedHabit.description && (
                    <p className="text-[12px] text-[#64748B] mt-2 max-w-xs">
                      {selectedHabit.description}
                    </p>
                  )}
                </div>

                {/* 3 Metric Pills */}
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-3 rounded-xl border border-[#E2E8F0] bg-white">
                    <p className="text-[20px] font-extrabold text-[#0F172A] tabular-nums">
                      {selectedHabit.totalCompletions || 0}
                    </p>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase">
                      {so ? "Dhameystir" : "Done Days"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-[#E2E8F0] bg-white">
                    <p className="text-[20px] font-extrabold text-[#10B981] tabular-nums">
                      87%
                    </p>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase">
                      {so ? "Heerka" : "Rate"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-[#E2E8F0] bg-white">
                    <p className="text-[20px] font-extrabold text-[#D97706] tabular-nums">
                      {selectedHabit.currentStreak || 0}
                    </p>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase">
                      {so ? "Streak" : "Streak"}
                    </span>
                  </div>
                </div>

                {/* Weekly Completion Squares */}
                <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white space-y-2">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                    {so ? "Diiwaanka Toddobaadka" : "Weekly Consistency"}
                  </span>
                  <div className="grid grid-cols-7 gap-1.5 text-center">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                      <div key={day} className="flex flex-col items-center gap-1">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                            i < 5
                              ? "bg-[#10B981] text-white"
                              : "bg-[#F1F5F9] text-[#94A3B8]"
                          }`}
                        >
                          {i < 5 ? "✓" : "•"}
                        </div>
                        <span className="text-[9px] font-semibold text-[#64748B]">{day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Owner Card */}
                <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                      {so ? "Milkiilaha Caadada" : "Owner"}
                    </span>
                    <p className="text-[13px] font-bold text-[#0F172A] mt-0.5">
                      {selectedHabit.userName || "Member"}
                    </p>
                    <p className="text-[11px] text-[#64748B]">
                      {selectedHabit.userEmail || "—"}
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#EFF6FF] text-[#0B6EF3] flex items-center justify-center font-bold text-[13px]">
                    {selectedHabit.userName?.[0]?.toUpperCase() || "U"}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      handleEditClick(selectedHabit);
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#0B6EF3] hover:bg-[#0958C7] text-white text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Icon name="edit" size={17} />
                    <span>{so ? "Wax ka badal Caadada" : "Edit Habit"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(selectedHabit)}
                    className="w-full py-2.5 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#334155] text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Icon name={selectedHabit.status === "paused" ? "play_arrow" : "pause"} size={17} />
                    <span>
                      {selectedHabit.status === "paused"
                        ? so ? "Dib u hawlgeli" : "Resume Habit"
                        : so ? "Hakad gali (Pause)" : "Pause Habit"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editingHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl border border-[#E2E8F0] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <h3 className="text-[15px] font-bold text-[#0F172A]">
                {so ? "Wax ka badal Caadada" : "Edit Habit"}
              </h3>
              <button
                type="button"
                onClick={() => setEditingHabit(null)}
                className="w-8 h-8 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/60 flex items-center justify-center"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {statusMsg && (
                <div
                  className={`p-3 rounded-xl text-[12px] font-semibold flex items-center gap-2 ${
                    statusMsg.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  <Icon name={statusMsg.type === "success" ? "check_circle" : "error"} size={16} />
                  <span>{statusMsg.text}</span>
                </div>
              )}

              <div>
                <label className="block text-[12px] font-bold text-[#334155] mb-1">
                  {so ? "Magaca Caadada" : "Habit Name"}
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-[13px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#0B6EF3] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#334155] mb-1">
                  {so ? "Qeybta (Category)" : "Category"}
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3.5 py-2 text-[13px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#0B6EF3] focus:bg-white"
                >
                  <option value="health">Health</option>
                  <option value="learning">Learning</option>
                  <option value="fitness">Fitness</option>
                  <option value="mindfulness">Mindfulness</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#334155] mb-1">
                  {so ? "Xaaladda (Status)" : "Status"}
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3.5 py-2 text-[13px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#0B6EF3] focus:bg-white"
                >
                  <option value="active">{so ? "Firfircoon" : "Active"}</option>
                  <option value="paused">{so ? "Joogsaday" : "Paused"}</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#334155] mb-1">
                  {so ? "Faahfaahin" : "Description"}
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-[13px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#0B6EF3] focus:bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingHabit(null)}
                  className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-[#64748B] text-[13px] font-bold hover:bg-[#F8FAFC]"
                >
                  {so ? "Ka noqo" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#0B6EF3] hover:bg-[#0958C7] text-white text-[13px] font-bold shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSaving ? (so ? "Waa la keydinayaa..." : "Saving...") : (so ? "Keydi" : "Save Changes")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
