"use client";

import React, { useState } from "react";
import Icon from "@/components/ui/Icon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Routine, Habit } from "@/types";
import { useTranslation } from "@/lib/i18n";

import { useUserRoutines } from "@/hooks/useUserRoutines";

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

export default function RoutinesClient({ routines: initialRoutines, habits }: RoutinesClientProps) {
  const { language } = useTranslation();

  // TanStack React Query 0ms Optimistic Hook
  const {
    routines,
    createRoutine,
    updateRoutine,
    deleteRoutine: removeRoutine,
    isCreating,
    isUpdating,
    isDeleting,
  } = useUserRoutines({ initialRoutines });

  const [expanded, setExpanded] = useState<string | null>(initialRoutines[0]?._id || null);
  const [addingRoutineName, setAddingRoutineName] = useState<string | null>(null);

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<RoutineFormData>(emptyForm);
  const [createError, setCreateError] = useState("");

  // Edit modal state
  const [editRoutine, setEditRoutine] = useState<Routine | null>(null);
  const [editForm, setEditForm] = useState<RoutineFormData>(emptyForm);
  const [editError, setEditError] = useState("");

  // Delete modal state
  const [deleteRoutine, setDeleteRoutine] = useState<Routine | null>(null);

  const habitMap = new Map(habits.map((h) => [h._id, h]));

  const handleAddSuggestedRoutine = async (s: {
    name: string;
    icon: string;
    desc: string;
    timeOfDay: string;
  }) => {
    setAddingRoutineName(s.name);
    try {
      await createRoutine({
        name: s.name,
        description: s.desc,
        icon: s.icon,
        timeOfDay: s.timeOfDay,
        habitIds: habits.slice(0, 3).map((h) => h._id || "").filter(Boolean),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setAddingRoutineName(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) { setCreateError("Routine name is required"); return; }
    setCreateError("");
    try {
      await createRoutine({
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        icon: createForm.icon,
        timeOfDay: createForm.timeOfDay,
        habitIds: createForm.habitIds,
      });
      setShowCreateModal(false);
      setCreateForm(emptyForm);
    } catch (err: unknown) {
      setCreateError((err as Error).message);
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
    setEditError("");
    try {
      await updateRoutine({
        id: editRoutine._id || "",
        payload: {
          name: editForm.name.trim(),
          description: editForm.description.trim(),
          icon: editForm.icon,
          timeOfDay: editForm.timeOfDay,
          habitIds: editForm.habitIds,
        },
      });
      setEditRoutine(null);
    } catch (err: unknown) {
      setEditError((err as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!deleteRoutine || !deleteRoutine._id) return;
    try {
      await removeRoutine(deleteRoutine._id);
      setDeleteRoutine(null);
    } catch (err) {
      console.error(err);
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
    <div className="flex flex-col gap-6 select-none max-w-5xl mx-auto w-full pb-24 md:pb-12">
      {/* Modern Executive Header */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E7ECF3] dark:border-slate-800 p-6 shadow-xs relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0B6EF3]/15 to-[#0B6EF3]/5 border border-[#0B6EF3]/20 flex items-center justify-center text-[#0B6EF3] shrink-0">
            <Icon name="auto_stories" size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] dark:text-slate-400">
                {language === "so" ? "Hab-socodkaaga Maalinlaha" : "Daily Flow Systems"}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#0B6EF3]/10 text-[#0B6EF3]">
                {routines.length} {language === "so" ? "Firfircoon" : "Active"}
              </span>
            </div>
            <h2 className="text-[22px] font-black text-[#111827] dark:text-white mt-0.5 font-[family-name:var(--font-headline)]">
              {language === "so" ? "Hab-socodyada & Rutiinada" : "Structured Routines"}
            </h2>
            <p className="text-[13px] text-[#667085] dark:text-slate-400 mt-0.5">
              {language === "so"
                ? "Isku xir caadooyinkaaga si aad u hesho tamar iyo nidaam maalinle ah oo joogto ah."
                : "Chain complementary habits together to build effortless, compounding momentum."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowCreateModal(true);
            setCreateForm(emptyForm);
            setCreateError("");
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#0B6EF3] hover:bg-[#095cd4] text-white text-[13px] font-bold shadow-xs hover:shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Icon name="add" size={18} />
          <span>{language === "so" ? "Samee Rutiin Cusub" : "Create Routine"}</span>
        </button>
      </section>

      {/* Routines List */}
      {routines.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-[#E7ECF3] dark:border-slate-800 p-12 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#0B6EF3]/10 text-[#0B6EF3] flex items-center justify-center mb-3">
            <Icon name="auto_stories" size={28} />
          </div>
          <h3 className="text-[17px] font-black text-[#111827] dark:text-white">
            {language === "so" ? "Weli rutiin ma haysatid" : "No routines configured yet"}
          </h3>
          <p className="text-[13px] text-[#667085] dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {language === "so"
              ? "Isku gee caadooyinkaaga (sida Subax, Galab, ama Habeen) si aad si sahlan ugu qabato."
              : "Group your habits into structured sequences to master your morning and evening flow."}
          </p>
          <button
            type="button"
            onClick={() => {
              setShowCreateModal(true);
              setCreateForm(emptyForm);
              setCreateError("");
            }}
            className="mt-5 px-5 py-2.5 bg-[#0B6EF3] text-white rounded-xl text-[13px] font-bold flex items-center gap-2 hover:bg-[#095cd4] cursor-pointer shadow-xs"
          >
            <Icon name="add" size={16} />
            {language === "so" ? "Abuur Rutiinkaaga Koowaad" : "Build Your First Routine"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {routines.map((routine) => {
            const isExpanded = expanded === routine._id;
            const routineHabits = (routine.habits || [])
              .sort((a, b) => a.order - b.order)
              .map((rh) => habitMap.get(rh.habitId))
              .filter(Boolean) as Habit[];

            const timeLabel = routine.timeOfDay?.toLowerCase().includes("am")
              ? "Morning"
              : routine.timeOfDay?.toLowerCase().includes("pm")
              ? "Evening"
              : routine.timeOfDay || "Morning";

            return (
              <div
                key={routine._id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E7ECF3] dark:border-slate-800 overflow-hidden shadow-xs hover:border-[#CBD5E1] transition-all"
              >
                {/* Routine Header */}
                <div className="flex items-center gap-3 p-4 sm:p-5">
                  <button
                    type="button"
                    onClick={() => setExpanded(isExpanded ? null : routine._id || null)}
                    className="flex-1 flex items-center gap-4 text-left cursor-pointer min-w-0"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0B6EF3]/15 to-[#0B6EF3]/5 border border-[#0B6EF3]/20 flex items-center justify-center text-[#0B6EF3] shrink-0">
                      <Icon name={routine.icon || "auto_stories"} size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[16px] font-black text-[#111827] dark:text-white truncate">
                          {routine.name}
                        </p>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {routineHabits.length} {language === "so" ? "tallaabo" : "steps"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[#667085] dark:text-slate-400">
                          <Icon name={TIME_ICONS[timeLabel] || "schedule"} size={14} className="text-[#0B6EF3]" />
                          {routine.timeOfDay}
                        </span>
                        {routine.description && (
                          <>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-[12px] text-[#667085] dark:text-slate-400 truncate max-w-xs">
                              {routine.description}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      <Icon name={isExpanded ? "expand_less" : "expand_more"} size={20} />
                    </div>
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-[#F2F4F7] dark:border-slate-800">
                    <button
                      type="button"
                      title="Edit routine"
                      onClick={() => openEdit(routine)}
                      className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-[#F4F8FF] hover:text-[#0B6EF3] text-[#667085] flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Icon name="edit" size={16} />
                    </button>
                    <button
                      type="button"
                      title="Delete routine"
                      onClick={() => setDeleteRoutine(routine)}
                      className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-[#FEF2F2] hover:text-[#EF4444] text-[#667085] flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Icon name="delete" size={16} />
                    </button>
                  </div>
                </div>

                {/* Expanded Habits Flow */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-[#F2F4F7] dark:border-slate-800 flex flex-col gap-2.5 bg-slate-50/50 dark:bg-slate-900/50">
                    {routineHabits.length === 0 ? (
                      <div className="p-6 text-center text-[13px] text-[#667085] dark:text-slate-400">
                        {language === "so"
                          ? "Rutiinkan weli wax caadooyin ah kuma jiraan. Riix 'Tafatir' si aad caadooyin ugu darto."
                          : "No habits linked to this routine yet. Click 'Edit' to attach habits."}
                      </div>
                    ) : (
                      routineHabits.map((habit, index) => (
                        <div
                          key={habit._id}
                          className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800/80 rounded-2xl border border-[#E7ECF3] dark:border-slate-700/60 shadow-2xs"
                        >
                          <div className="w-7 h-7 rounded-xl bg-[#0B6EF3]/10 text-[#0B6EF3] text-[12px] font-black flex items-center justify-center shrink-0">
                            {index + 1}
                          </div>
                          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[#111827] dark:text-white shrink-0">
                            <Icon name={habit.icon || "check_circle"} size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-[#111827] dark:text-white truncate">
                              {habit.name}
                            </p>
                            <p className="text-[11px] text-[#667085] dark:text-slate-400 capitalize">
                              {habit.category} · {habit.target} {habit.targetUnit || "times"}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-[#EF4444] text-[11px] font-bold">
                            <Icon name="local_fire_department" size={14} />
                            <span>{habit.currentStreak || 0}d</span>
                          </div>
                        </div>
                      ))
                    )}

                    <Link
                      href="/home"
                      className="mt-2 w-full h-11 bg-[#0B6EF3] hover:bg-[#095cd4] text-white rounded-2xl text-[13px] font-black flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                    >
                      <Icon name="play_circle" size={18} />
                      <span>{language === "so" ? "Bilow Rutiinka Hadda" : "Start Routine Now"}</span>
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Suggested Blueprint Routines */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E7ECF3] dark:border-slate-800 p-6 shadow-xs flex flex-col gap-4">
        <div>
          <h3 className="text-[16px] font-black text-[#111827] dark:text-white">
            {language === "so" ? "Tusaalooyin & Rutiino Diyaar ah" : "Recommended Routine Blueprints"}
          </h3>
          <p className="text-[12px] text-[#667085] dark:text-slate-400 mt-0.5">
            {language === "so"
              ? "Ku dar rutiinadan hal gujin si aad si degdeg ah ugu bilowdo."
              : "Pre-configured science-backed sequences ready to add with one tap."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              name: "Power Morning",
              icon: "wb_sunny",
              desc: "Hydration, mindfulness & early movement",
              timeOfDay: "Morning",
              color: "#F59E0B",
              bg: "#FFFBEB",
            },
            {
              name: "Evening Wind Down",
              icon: "nightlight_round",
              desc: "Journaling, reflection & sleep preparation",
              timeOfDay: "Evening",
              color: "#0B6EF3",
              bg: "#EFF6FF",
            },
            {
              name: "Deep Work Sprint",
              icon: "laptop_chromebook",
              desc: "Focused block & distraction-free review",
              timeOfDay: "Afternoon",
              color: "#10B981",
              bg: "#ECFDF3",
            },
          ].map((s) => (
            <div
              key={s.name}
              className="flex flex-col justify-between p-4 bg-[#FAFBFD] dark:bg-slate-800/60 rounded-2xl border border-[#E7ECF3] dark:border-slate-700/60 shadow-2xs gap-3"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                  style={{ background: s.bg }}
                >
                  <Icon name={s.icon} size={20} style={{ color: s.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-[#111827] dark:text-white">{s.name}</p>
                  <p className="text-[11px] text-[#667085] dark:text-slate-400 mt-0.5">{s.desc}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleAddSuggestedRoutine(s)}
                disabled={addingRoutineName === s.name}
                className="w-full py-2 rounded-xl bg-white dark:bg-slate-700 border border-[#E7ECF3] dark:border-slate-600 text-[#111827] dark:text-white text-[12px] font-black hover:bg-[#0B6EF3] hover:text-white hover:border-[#0B6EF3] transition-all shadow-2xs active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {addingRoutineName === s.name ? (
                  <>
                    <Icon name="refresh" size={14} className="animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Icon name="add" size={14} />
                    <span>{language === "so" ? "Ku dar" : "Use Blueprint"}</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
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
              <button type="submit" disabled={isCreating}
                className="w-full h-12 bg-[#0B6EF3] text-white rounded-full font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#0958c7] active:scale-[0.98] transition-all disabled:opacity-60">
                {isCreating ? <><Icon name="refresh" size={18} className="animate-spin" /><span>Creating...</span></> : <><Icon name="check" size={18} /><span>Create Routine</span></>}
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
              <button type="submit" disabled={isUpdating}
                className="w-full h-12 bg-[#0B6EF3] text-white rounded-full font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#0958c7] active:scale-[0.98] transition-all disabled:opacity-60">
                {isUpdating ? <><Icon name="refresh" size={18} className="animate-spin" /><span>Saving...</span></> : <><Icon name="check" size={18} /><span>Save Changes</span></>}
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
              <button type="button" onClick={handleDelete} disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-[#EF4444] text-white text-[13px] font-bold hover:bg-[#dc2626] flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50">
                {isDeleting && <Icon name="refresh" size={16} className="animate-spin" />}
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
