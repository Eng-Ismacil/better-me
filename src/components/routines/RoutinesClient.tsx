"use client";

import React, { useState } from "react";
import Icon from "@/components/ui/Icon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Routine, Habit } from "@/types";
import { useTranslation } from "@/lib/i18n";

interface RoutinesClientProps {
  routines: Routine[];
  habits: Habit[];
}

const TIME_ICONS: Record<string, string> = {
  Morning: "wb_sunny",
  Afternoon: "wb_cloudy",
  Evening: "nightlight_round",
  Night: "dark_mode",
};

const ROUTINE_ICONS = [
  { icon: "wb_sunny", label: "Morning" },
  { icon: "nightlight_round", label: "Evening" },
  { icon: "fitness_center", label: "Workout" },
  { icon: "menu_book", label: "Study" },
  { icon: "self_improvement", label: "Meditate" },
  { icon: "laptop_chromebook", label: "Work" },
  { icon: "local_cafe", label: "Coffee" },
  { icon: "directions_run", label: "Run" },
  { icon: "auto_stories", label: "Read" },
  { icon: "edit_note", label: "Journal" },
  { icon: "spa", label: "Relax" },
  { icon: "school", label: "Learn" },
];

const TIMES = ["Morning", "Afternoon", "Evening", "Night"];

interface RoutineFormData {
  name: string;
  description: string;
  icon: string;
  timeOfDay: string;
  habitIds: string[];
}

const emptyForm: RoutineFormData = {
  name: "",
  description: "",
  icon: "wb_sunny",
  timeOfDay: "Morning",
  habitIds: [],
};

export default function RoutinesClient({ routines, habits }: RoutinesClientProps) {
  const router = useRouter();
  const { language } = useTranslation();
  const [expanded, setExpanded] = useState<string | null>(routines[0]?._id || null);
  const [addingRoutineName, setAddingRoutineName] = useState<string | null>(null);

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<RoutineFormData>(emptyForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Edit modal state
  const [editRoutine, setEditRoutine] = useState<Routine | null>(null);
  const [editForm, setEditForm] = useState<RoutineFormData>(emptyForm);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete modal state
  const [deleteRoutine, setDeleteRoutine] = useState<Routine | null>(null);
  const [deleting, setDeleting] = useState(false);

  const habitMap = new Map(habits.map((h) => [h._id, h]));

  const handleAddSuggestedRoutine = async (s: {
    name: string;
    icon: string;
    desc: string;
    timeOfDay: string;
  }) => {
    setAddingRoutineName(s.name);
    try {
      const res = await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: s.name,
          description: s.desc,
          icon: s.icon,
          timeOfDay: s.timeOfDay,
          habitIds: habits.slice(0, 3).map((h) => h._id),
        }),
      });
      if (!res.ok) throw new Error("Failed to add routine");
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setAddingRoutineName(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) { setCreateError("Routine name is required"); return; }
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createForm.name.trim(),
          description: createForm.description.trim(),
          icon: createForm.icon,
          timeOfDay: createForm.timeOfDay,
          habitIds: createForm.habitIds,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create routine");
      }
      setShowCreateModal(false);
      setCreateForm(emptyForm);
      router.refresh();
    } catch (err: unknown) {
      setCreateError((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (routine: Routine) => {
    setEditRoutine(routine);
    setEditForm({
      name: routine.name,
      description: routine.description || "",
      icon: routine.icon,
      timeOfDay: routine.timeOfDay || "Morning",
      habitIds: (routine.habits || []).map((rh) => rh.habitId),
    });
    setEditError("");
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoutine || !editForm.name.trim()) { setEditError("Routine name is required"); return; }
    setEditing(true);
    setEditError("");
    try {
      const res = await fetch(`/api/routines/${editRoutine._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          description: editForm.description.trim(),
          icon: editForm.icon,
          timeOfDay: editForm.timeOfDay,
          habitIds: editForm.habitIds,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update routine");
      }
      setEditRoutine(null);
      router.refresh();
    } catch (err: unknown) {
      setEditError((err as Error).message);
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteRoutine) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/routines/${deleteRoutine._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete routine");
      setDeleteRoutine(null);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const toggleHabitInForm = (
    habitId: string,
    form: RoutineFormData,
    setForm: React.Dispatch<React.SetStateAction<RoutineFormData>>
  ) => {
    setForm((prev) => ({
      ...prev,
      habitIds: prev.habitIds.includes(habitId)
        ? prev.habitIds.filter((id) => id !== habitId)
        : [...prev.habitIds, habitId],
    }));
  };

  return (
    <div className="flex flex-col gap-5 select-none">
      {/* Header */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-[0_2px_12px_rgba(16,24,40,0.04)] relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-[#667085]">Your Routines</p>
            <h2 className="text-[22px] font-bold text-[#101010] mt-0.5">{routines.length} Active</h2>
            <p className="text-[13px] text-[#667085] mt-0.5">Structured sequences for daily flow</p>
          </div>
          <button
            type="button"
            onClick={() => { setShowCreateModal(true); setCreateForm(emptyForm); setCreateError(""); }}
            className="w-12 h-12 rounded-full bg-[#0B6EF3] flex items-center justify-center shadow-md hover:bg-[#0958c7] active:scale-95 transition-all"
          >
            <Icon name="add" size={24} className="text-white" />
          </button>
        </div>
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-[#ECFDF3]/60 blur-2xl pointer-events-none" />
      </section>

      {/* Routines List */}
      {routines.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 flex flex-col items-center text-center">
          <Icon name="auto_stories" size={40} className="text-[#22C55E] mb-3" />
          <h3 className="text-[16px] font-bold text-[#101010]">No routines yet</h3>
          <p className="text-[13px] text-[#667085] mt-1 max-w-xs">
            Group your habits into structured routines for powerful daily momentum.
          </p>
          <button
            type="button"
            onClick={() => { setShowCreateModal(true); setCreateForm(emptyForm); setCreateError(""); }}
            className="mt-5 px-5 py-2.5 bg-[#22C55E] text-white rounded-full text-[13px] font-semibold flex items-center gap-1.5"
          >
            <Icon name="add" size={16} />
            Create First Routine
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {routines.map((routine) => {
            const isExpanded = expanded === routine._id;
            const routineHabits = (routine.habits || [])
              .sort((a, b) => a.order - b.order)
              .map((rh) => habitMap.get(rh.habitId))
              .filter(Boolean) as Habit[];

            const timeLabel = routine.timeOfDay?.toLowerCase().includes("am") ? "Morning" :
              routine.timeOfDay?.toLowerCase().includes("pm") ? "Evening" : "Morning";

            return (
              <div
                key={routine._id}
                className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-[0_2px_8px_rgba(16,24,40,0.03)]"
              >
                {/* Routine Header */}
                <div className="flex items-center gap-2 px-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setExpanded(isExpanded ? null : routine._id || null)}
                    className="flex-1 flex items-center gap-4 p-2 hover:bg-[#f6f3f2] rounded-xl transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0">
                      <Icon name={routine.icon || "auto_stories"} size={24} className="text-[#007AFF]" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-[15px] font-bold text-[#101010] truncate">{routine.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Icon name={TIME_ICONS[timeLabel] || "schedule"} size={12} className="text-[#667085]" />
                        <span className="text-[12px] text-[#667085]">{routine.timeOfDay} · {routineHabits.length} habits</span>
                      </div>
                    </div>
                    <Icon name={isExpanded ? "expand_less" : "expand_more"} size={20} className="text-[#667085] shrink-0" />
                  </button>
                  {/* Edit / Delete action buttons */}
                  <button
                    type="button"
                    title="Edit routine"
                    onClick={() => openEdit(routine)}
                    className="w-8 h-8 rounded-full bg-[#F4F8FF] border border-[#0B6EF3]/20 text-[#0B6EF3] flex items-center justify-center hover:bg-[#0B6EF3] hover:text-white transition-all"
                  >
                    <Icon name="edit" size={15} />
                  </button>
                  <button
                    type="button"
                    title="Delete routine"
                    onClick={() => setDeleteRoutine(routine)}
                    className="w-8 h-8 rounded-full bg-[#FFF1F0] border border-[#FFD6D3] text-[#EF4444] flex items-center justify-center hover:bg-[#EF4444] hover:text-white transition-all"
                  >
                    <Icon name="delete" size={15} />
                  </button>
                </div>

                {/* Expanded Habits */}
                {isExpanded && (
                  <div className="px-5 pb-5 flex flex-col gap-2 border-t border-[#f0edec] mt-3">
                    <p className="text-[12px] text-[#667085] pt-3 pb-1">{routine.description}</p>
                    {routineHabits.length === 0 ? (
                      <p className="text-[13px] text-[#667085] text-center py-4">No habits in this routine</p>
                    ) : (
                      routineHabits.map((habit, index) => (
                        <div key={habit._id} className="flex items-center gap-3 p-3 bg-[#f6f3f2] rounded-xl">
                          <div className="w-6 h-6 rounded-full bg-[#007AFF] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                            {index + 1}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                            <Icon name={habit.icon} size={16} className="text-[#007AFF]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[#101010] truncate">{habit.name}</p>
                            <p className="text-[11px] text-[#667085]">{habit.difficulty} · {habit.preferredTime}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Icon name="local_fire_department" size={13} className="text-[#EF4444]" />
                            <span className="text-[12px] font-bold text-[#667085]">{habit.currentStreak}d</span>
                          </div>
                        </div>
                      ))
                    )}

                    <Link
                      href="/home"
                      className="mt-2 w-full h-11 bg-[#007AFF] text-white rounded-full text-[13px] font-semibold flex items-center justify-center gap-1.5 hover:bg-[#0070eb] transition-all"
                    >
                      <Icon name="play_circle" size={16} />
                      Start Routine
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Suggested Routines */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col gap-3">
        <h3 className="text-[15px] font-bold text-[#101010]">Suggested Routines</h3>
        {[
          { name: "Power Morning", icon: "wb_sunny", desc: "Hydration, meditation, exercise", timeOfDay: "Morning", color: "#F59E0B", bg: "#FFF7ED" },
          { name: "Evening Wind Down", icon: "nightlight_round", desc: "Journal, reading, sleep prep", timeOfDay: "Evening", color: "#0B6EF3", bg: "#F4F8FF" },
          { name: "Deep Work Block", icon: "laptop_chromebook", desc: "Focus timer + review session", timeOfDay: "Afternoon", color: "#20C773", bg: "#ECFDF3" },
        ].map((s) => (
          <div key={s.name} className="flex items-center gap-3 p-3.5 bg-[#FAFBFD] rounded-[14px] border border-[#E7ECF3]">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs" style={{ background: s.bg }}>
              <Icon name={s.icon} size={20} style={{ color: s.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-[#111827]">{s.name}</p>
              <p className="text-[11px] text-[#667085]">{s.desc}</p>
            </div>
            <button
              type="button"
              onClick={() => handleAddSuggestedRoutine(s)}
              disabled={addingRoutineName === s.name}
              className="px-3 py-1.5 rounded-full bg-[#0B6EF3] text-white text-[12px] font-bold hover:bg-[#0958c7] transition-all shadow-2xs active:scale-95 disabled:opacity-50 flex items-center gap-1 cursor-pointer shrink-0"
            >
              {addingRoutineName === s.name ? (
                <>
                  <Icon name="refresh" size={14} className="animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Icon name="add" size={14} />
                  <span>{language === "so" ? "Ku dar" : "Add"}</span>
                </>
              )}
            </button>
          </div>
        ))}
      </section>

      {/* ===== CREATE ROUTINE MODAL ===== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-[#111827]/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md sm:rounded-[22px] rounded-t-[22px] border border-[#E7ECF3] shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="p-5 border-b border-[#F3F4F6] flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-bold text-[18px] text-[#111827]">Create Routine</h3>
              <button type="button" onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-[#F3F4F6] text-[#667085] flex items-center justify-center hover:bg-[#E5E7EB]">
                <Icon name="close" size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 flex flex-col gap-4 pb-8">
              {createError && (
                <div className="p-3 bg-[#FFF1F0] border border-[#FFD6D3] rounded-xl text-[13px] text-[#EF4444] flex items-center gap-2">
                  <Icon name="error" size={16} />{createError}
                </div>
              )}
              <RoutineFormFields
                form={createForm}
                setForm={setCreateForm}
                habits={habits}
                toggleHabit={(id) => toggleHabitInForm(id, createForm, setCreateForm)}
              />
              <button type="submit" disabled={creating}
                className="w-full h-12 bg-[#0B6EF3] text-white rounded-full font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#0958c7] active:scale-[0.98] transition-all disabled:opacity-60">
                {creating ? <><Icon name="refresh" size={18} className="animate-spin" /><span>Creating...</span></> : <><Icon name="check" size={18} /><span>Create Routine</span></>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===== EDIT ROUTINE MODAL ===== */}
      {editRoutine && (
        <div className="fixed inset-0 z-50 bg-[#111827]/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md sm:rounded-[22px] rounded-t-[22px] border border-[#E7ECF3] shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="p-5 border-b border-[#F3F4F6] flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-bold text-[18px] text-[#111827]">Edit Routine</h3>
              <button type="button" onClick={() => setEditRoutine(null)}
                className="w-8 h-8 rounded-full bg-[#F3F4F6] text-[#667085] flex items-center justify-center hover:bg-[#E5E7EB]">
                <Icon name="close" size={18} />
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-5 flex flex-col gap-4 pb-8">
              {editError && (
                <div className="p-3 bg-[#FFF1F0] border border-[#FFD6D3] rounded-xl text-[13px] text-[#EF4444] flex items-center gap-2">
                  <Icon name="error" size={16} />{editError}
                </div>
              )}
              <RoutineFormFields
                form={editForm}
                setForm={setEditForm}
                habits={habits}
                toggleHabit={(id) => toggleHabitInForm(id, editForm, setEditForm)}
              />
              <button type="submit" disabled={editing}
                className="w-full h-12 bg-[#0B6EF3] text-white rounded-full font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#0958c7] active:scale-[0.98] transition-all disabled:opacity-60">
                {editing ? <><Icon name="refresh" size={18} className="animate-spin" /><span>Saving...</span></> : <><Icon name="check" size={18} /><span>Save Changes</span></>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===== DELETE ROUTINE MODAL ===== */}
      {deleteRoutine && (
        <div className="fixed inset-0 z-50 bg-[#111827]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] border border-[#E7ECF3] p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-[#FFF1F0] text-[#EF4444] flex items-center justify-center mb-3 border border-[#FFD6D3]">
              <Icon name="delete_forever" size={26} />
            </div>
            <h3 className="font-bold text-[18px] text-[#111827]">Delete Routine?</h3>
            <p className="text-[13px] text-[#667085] mt-1 mb-5">
              Are you sure you want to delete <span className="font-bold text-[#111827]">"{deleteRoutine.name}"</span>? This cannot be undone. Your habits will remain intact.
            </p>
            <div className="flex items-center gap-2.5 w-full">
              <button type="button" onClick={() => setDeleteRoutine(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#F3F4F6] text-[#667085] text-[13px] font-bold hover:bg-[#E5E7EB]">
                Cancel
              </button>
              <button type="button" onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-[#EF4444] text-white text-[13px] font-bold hover:bg-[#dc2626] flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50">
                {deleting && <Icon name="refresh" size={16} className="animate-spin" />}
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== Reusable Routine Form Fields Component ==========
function RoutineFormFields({
  form,
  setForm,
  habits,
  toggleHabit,
}: {
  form: RoutineFormData;
  setForm: React.Dispatch<React.SetStateAction<RoutineFormData>>;
  habits: Habit[];
  toggleHabit: (id: string) => void;
}) {
  const TIMES_LIST = ["Morning", "Afternoon", "Evening", "Night"];

  return (
    <>
      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-bold text-[#667085]">Routine Name *</label>
        <input
          type="text"
          required
          placeholder="e.g., Power Morning"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full px-4 py-3 text-[15px] bg-[#f6f3f2] rounded-xl border border-transparent focus:border-[#0B6EF3] focus:bg-white outline-none transition-all"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-bold text-[#667085]">Description <span className="font-normal">(optional)</span></label>
        <textarea
          rows={2}
          placeholder="What is this routine for?"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="w-full px-4 py-3 text-[14px] bg-[#f6f3f2] rounded-xl border border-transparent focus:border-[#0B6EF3] focus:bg-white outline-none transition-all resize-none"
        />
      </div>

      {/* Time of Day */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-bold text-[#667085]">Time of Day</label>
        <div className="grid grid-cols-4 gap-2">
          {TIMES_LIST.map((t) => (
            <button key={t} type="button"
              onClick={() => setForm((f) => ({ ...f, timeOfDay: t }))}
              className={`py-2 rounded-xl border-2 text-[11px] font-bold transition-all flex flex-col items-center gap-1 ${
                form.timeOfDay === t ? "border-[#0B6EF3] bg-[#EFF6FF] text-[#0B6EF3]" : "border-[#E5E7EB] text-[#667085]"
              }`}
            >
              <Icon name={t === "Morning" ? "wb_sunny" : t === "Afternoon" ? "wb_cloudy" : t === "Evening" ? "nightlight_round" : "dark_mode"} size={16} />
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Icon Picker */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-bold text-[#667085]">Icon</label>
        <div className="grid grid-cols-6 gap-2">
          {ROUTINE_ICONS.map(({ icon: ic, label }) => (
            <button key={ic} type="button" title={label}
              onClick={() => setForm((f) => ({ ...f, icon: ic }))}
              className={`aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${
                form.icon === ic ? "border-[#0B6EF3] bg-[#EFF6FF] text-[#0B6EF3]" : "border-[#E5E7EB] bg-[#f6f3f2] text-[#667085]"
              }`}
            >
              <Icon name={ic} size={20} />
            </button>
          ))}
        </div>
      </div>

      {/* Habit Selection */}
      {habits.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-bold text-[#667085]">Select Habits <span className="font-normal">(optional)</span></label>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
            {habits.map((habit) => {
              const selected = form.habitIds.includes(habit._id || "");
              return (
                <button
                  key={habit._id}
                  type="button"
                  onClick={() => toggleHabit(habit._id || "")}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    selected ? "border-[#0B6EF3] bg-[#EFF6FF]" : "border-[#E5E7EB] bg-white hover:border-[#0B6EF3]/40"
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${selected ? "bg-[#0B6EF3]" : "bg-[#F3F4F6]"}`}>
                    <Icon name={selected ? "check" : habit.icon} size={14} className={selected ? "text-white" : "text-[#667085]"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#111827] truncate">{habit.name}</p>
                    <p className="text-[11px] text-[#667085]">{habit.category} · {habit.preferredTime}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
