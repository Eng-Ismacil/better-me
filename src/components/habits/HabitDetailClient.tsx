"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { Habit, HabitCategory, HabitDifficulty } from "@/types";
import { useTranslation } from "@/lib/i18n";

const CATEGORIES: HabitCategory[] = [
  "health",
  "productivity",
  "fitness",
  "mindfulness",
  "learning",
];

const DIFFICULTIES: HabitDifficulty[] = ["easy", "medium", "hard"];
const TIMES = ["Morning", "Afternoon", "Evening", "Anytime"];

interface HabitDetailClientProps {
  habit: Habit;
}

export default function HabitDetailClient({ habit: initialHabit }: HabitDetailClientProps) {
  const router = useRouter();
  const { language, t } = useTranslation();

  const [habit, setHabit] = useState<Habit>(initialHabit);
  const [isEditing, setIsEditing] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit form state
  const [name, setName] = useState(habit.name);
  const [description, setDescription] = useState(habit.description || "");
  const [category, setCategory] = useState<HabitCategory>(habit.category);
  const [difficulty, setDifficulty] = useState<HabitDifficulty>(habit.difficulty);
  const [preferredTime, setPreferredTime] = useState(habit.preferredTime || "Morning");
  const [target, setTarget] = useState(habit.target || 1);

  // Save changes via PUT /api/habits/[id]
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setAlertMsg(null);

    try {
      const res = await fetch(`/api/habits/${habit._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          category,
          difficulty,
          preferredTime,
          target,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update habit");
      }

      setHabit((prev) => ({
        ...prev,
        name: name.trim(),
        description: description.trim(),
        category,
        difficulty,
        preferredTime,
        target,
      }));

      setIsEditing(false);
      setAlertMsg({
        type: "success",
        text: language === "so" ? "Caadada si guul leh ayaa loo cusboonaysiiyay! ✅" : "Habit updated successfully! ✅",
      });
      router.refresh();
    } catch (err: unknown) {
      const error = err as Error;
      setAlertMsg({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  };

  // Archive habit (set status to archived) via PUT /api/habits/[id]
  const handleArchive = async () => {
    setArchiving(true);
    try {
      const res = await fetch(`/api/habits/${habit._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to archive habit");
      }

      router.push("/habits");
      router.refresh();
    } catch (err: unknown) {
      const error = err as Error;
      setAlertMsg({ type: "error", text: error.message });
      setArchiving(false);
      setShowArchiveModal(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none max-w-xl mx-auto pb-16">
      {/* Top Navigation & Action Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/habits"
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#0B6EF3] hover:underline"
        >
          <Icon name="arrow_back" size={18} />
          <span>{language === "so" ? "Ku noqo Caadooyinka" : "Back to Habits"}</span>
        </Link>

        <div className="flex items-center gap-2">
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-3.5 py-1.5 rounded-full bg-[#F4F8FF] border border-[#0B6EF3]/30 text-[#0B6EF3] text-[12px] font-bold flex items-center gap-1 hover:bg-[#0B6EF3] hover:text-white transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <Icon name="edit" size={15} />
              <span>{language === "so" ? "Wax ka bedel" : "Edit"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowArchiveModal(true)}
            className="px-3.5 py-1.5 rounded-full bg-[#FFF7ED] border border-[#FDE68A] text-[#D97706] text-[12px] font-bold flex items-center gap-1 hover:bg-[#D97706] hover:text-white transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <Icon name="archive" size={15} />
            <span>{language === "so" ? "Kaydso" : "Archive"}</span>
          </button>
        </div>
      </div>

      {/* Alert Notification Banner */}
      {alertMsg && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-2.5 text-[13px] font-semibold ${
            alertMsg.type === "success"
              ? "bg-[#ECFDF3] border border-[#A7F3D0] text-[#15803D]"
              : "bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626]"
          }`}
        >
          <Icon name={alertMsg.type === "success" ? "check_circle" : "error"} size={18} />
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* Main Habit View or Edit Form */}
      {isEditing ? (
        /* ================= EDIT MODE FORM ================= */
        <form onSubmit={handleUpdate} className="bg-white rounded-[22px] border border-[#E7ECF3] p-5 sm:p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6]">
            <h3 className="font-bold text-[18px] text-[#111827]">
              {language === "so" ? "Wax ka bedel Caadada" : "Edit Habit Details"}
            </h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="w-8 h-8 rounded-full bg-[#F3F4F6] text-[#667085] flex items-center justify-center hover:bg-[#E5E7EB]"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          <div>
            <label className="text-[12px] font-bold text-[#667085] block mb-1">
              {language === "so" ? "Magaca Caadada" : "Habit Name"}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7ECF3] text-[14px] text-[#111827] focus:border-[#0B6EF3] outline-none"
            />
          </div>

          <div>
            <label className="text-[12px] font-bold text-[#667085] block mb-1">
              {language === "so" ? "Faahfaahin" : "Description"}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7ECF3] text-[14px] text-[#111827] focus:border-[#0B6EF3] outline-none resize-none"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="text-[12px] font-bold text-[#667085] block mb-1.5">
              {language === "so" ? "Qeybta" : "Category"}
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-bold capitalize transition-all ${
                    category === cat
                      ? "bg-[#0B6EF3] text-white shadow-2xs"
                      : "bg-[#F8FAFC] border border-[#E7ECF3] text-[#667085] hover:border-[#0B6EF3]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-bold text-[#667085] block mb-1.5">
                {language === "so" ? "Heerka Adkaanta" : "Difficulty"}
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as HabitDifficulty)}
                className="w-full px-3 py-2 rounded-xl border border-[#E7ECF3] text-[13px] text-[#111827] bg-white capitalize outline-none"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[12px] font-bold text-[#667085] block mb-1.5">
                {language === "so" ? "Waqtiga La Doorbiday" : "Preferred Time"}
              </label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E7ECF3] text-[13px] text-[#111827] bg-white outline-none"
              >
                {TIMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target */}
          <div>
            <label className="text-[12px] font-bold text-[#667085] block mb-1">
              {language === "so" ? "Yoolka Maalinlaha (Tiro ahaan)" : "Daily Target Count"}
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-[#E7ECF3] text-[14px] text-[#111827] focus:border-[#0B6EF3] outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#F3F4F6]">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl bg-[#F3F4F6] text-[#667085] text-[13px] font-bold hover:bg-[#E5E7EB]"
            >
              {t("btn_cancel")}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#0B6EF3] hover:bg-[#0958c7] text-white text-[13px] font-bold flex items-center gap-1.5 shadow-xs active:scale-95 disabled:opacity-50"
            >
              {saving && <Icon name="refresh" size={16} className="animate-spin" />}
              <span>{t("btn_save")}</span>
            </button>
          </div>
        </form>
      ) : (
        /* ================= VIEW MODE ================= */
        <div className="flex flex-col gap-5">
          {/* Main Card */}
          <div className="bg-white rounded-[22px] border border-[#E7ECF3] p-5 sm:p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0B6EF3]/10 text-[#0B6EF3] border border-[#0B6EF3]/20 flex items-center justify-center shrink-0">
                <Icon name={habit.icon || "check_circle"} size={32} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[22px] font-bold text-[#111827] tracking-tight">
                  {habit.name}
                </h2>
                {habit.description && (
                  <p className="text-[13px] text-[#667085] mt-1 leading-relaxed">
                    {habit.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="px-2.5 py-1 rounded-full bg-[#ECFDF3] text-[#20C773] text-[11px] font-bold capitalize border border-[#20C773]/20">
                    {habit.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#F4F8FF] text-[#0B6EF3] text-[11px] font-bold capitalize border border-[#0B6EF3]/20">
                    {habit.difficulty}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#FFFBEB] text-[#D97706] text-[11px] font-bold border border-[#FDE68A]/60">
                    {habit.preferredTime || "Anytime"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl border border-[#E7ECF3] p-4 text-center shadow-xs">
              <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block">
                {language === "so" ? "Xiriirka Hada" : "Current Streak"}
              </span>
              <div className="text-[24px] font-extrabold text-[#D97706] flex items-center justify-center gap-1 mt-1">
                <Icon name="bolt" size={20} />
                <span>{habit.currentStreak || 0}d</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E7ECF3] p-4 text-center shadow-xs">
              <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block">
                {language === "so" ? "Heerkii Ugu Fiicnaa" : "Best Streak"}
              </span>
              <div className="text-[24px] font-extrabold text-[#0B6EF3] flex items-center justify-center gap-1 mt-1">
                <Icon name="military_tech" size={20} />
                <span>{habit.bestStreak || 0}d</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E7ECF3] p-4 text-center shadow-xs">
              <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block">
                {language === "so" ? "Guud ahaan" : "Completions"}
              </span>
              <div className="text-[24px] font-extrabold text-[#20C773] flex items-center justify-center gap-1 mt-1">
                <Icon name="check_circle" size={20} />
                <span>{habit.totalCompletions || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 z-50 bg-[#111827]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] border border-[#E7ECF3] p-6 max-w-sm w-full shadow-2xl animate-check-pop flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-[#FFF7ED] text-[#D97706] flex items-center justify-center mb-3 border border-[#FDE68A]">
              <Icon name="archive" size={26} />
            </div>
            <h3 className="font-bold text-[18px] text-[#111827]">
              {language === "so" ? "Ma doonaysaa inaad kaydso?" : "Archive this habit?"}
            </h3>
            <p className="text-[13px] text-[#667085] mt-1 mb-5">
              {language === "so"
                ? `"${habit.name}" waxaa la kaydsan doonaa. Xogta streaks-ka waxay sii jiri doontaa.`
                : `"${habit.name}" will be archived. All streak & completion data is preserved. You can reactivate it later.`}
            </p>
            <div className="flex items-center gap-2.5 w-full">
              <button
                type="button"
                onClick={() => setShowArchiveModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#F3F4F6] text-[#667085] text-[13px] font-bold hover:bg-[#E5E7EB]"
              >
                {t("btn_cancel")}
              </button>
              <button
                type="button"
                onClick={handleArchive}
                disabled={archiving}
                className="flex-1 py-2.5 rounded-xl bg-[#D97706] text-white text-[13px] font-bold hover:bg-[#b45309] flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {archiving && <Icon name="refresh" size={16} className="animate-spin" />}
                <span>{language === "so" ? "Haa, Kaydi" : "Yes, Archive"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
