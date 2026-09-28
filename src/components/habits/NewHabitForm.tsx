"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import Link from "next/link";

const CATEGORIES = [
  { id: "health", label: "Health", icon: "favorite", color: "#22C55E", bg: "#ECFDF3" },
  { id: "fitness", label: "Fitness", icon: "fitness_center", color: "#007AFF", bg: "#EFF6FF" },
  { id: "learning", label: "Learning", icon: "menu_book", color: "#F59E0B", bg: "#FFF7ED" },
  { id: "mindfulness", label: "Mindfulness", icon: "self_improvement", color: "#8B5CF6", bg: "#F5F3FF" },
  { id: "productivity", label: "Productivity", icon: "edit_note", color: "#A855F7", bg: "#FDF4FF" },
];

// Categorized icons per category
const ICONS_BY_CATEGORY: Record<string, { icon: string; label: string }[]> = {
  health: [
    { icon: "water_drop", label: "Water" },
    { icon: "favorite", label: "Heart" },
    { icon: "bedtime", label: "Sleep" },
    { icon: "restaurant", label: "Food" },
    { icon: "local_dining", label: "Meal" },
    { icon: "nutrition", label: "Nutrition" },
    { icon: "vaccines", label: "Medicine" },
    { icon: "monitor_heart", label: "Heartbeat" },
    { icon: "health_and_safety", label: "Safety" },
    { icon: "air", label: "Breathing" },
    { icon: "no_food", label: "Fast" },
    { icon: "emoji_food_beverage", label: "Tea" },
    { icon: "local_cafe", label: "Coffee" },
    { icon: "spa", label: "Spa" },
    { icon: "mood", label: "Mood" },
  ],
  fitness: [
    { icon: "fitness_center", label: "Gym" },
    { icon: "directions_run", label: "Run" },
    { icon: "directions_walk", label: "Walk" },
    { icon: "directions_bike", label: "Cycling" },
    { icon: "sports_basketball", label: "Basketball" },
    { icon: "sports_soccer", label: "Football" },
    { icon: "sports_tennis", label: "Tennis" },
    { icon: "pool", label: "Swimming" },
    { icon: "sports_gymnastics", label: "Gymnastics" },
    { icon: "accessibility_new", label: "Stretch" },
    { icon: "downhill_skiing", label: "Skiing" },
    { icon: "hiking", label: "Hiking" },
    { icon: "kayaking", label: "Kayaking" },
    { icon: "sports_martial_arts", label: "Martial Arts" },
    { icon: "timer", label: "Interval" },
  ],
  learning: [
    { icon: "menu_book", label: "Reading" },
    { icon: "school", label: "Study" },
    { icon: "edit_note", label: "Notes" },
    { icon: "psychology", label: "Think" },
    { icon: "calculate", label: "Math" },
    { icon: "science", label: "Science" },
    { icon: "language", label: "Language" },
    { icon: "code", label: "Coding" },
    { icon: "palette", label: "Art" },
    { icon: "music_note", label: "Music" },
    { icon: "mic", label: "Speaking" },
    { icon: "history_edu", label: "History" },
    { icon: "biotech", label: "Research" },
    { icon: "lightbulb", label: "Idea" },
    { icon: "quiz", label: "Quiz" },
  ],
  mindfulness: [
    { icon: "self_improvement", label: "Meditation" },
    { icon: "spa", label: "Relaxation" },
    { icon: "mood", label: "Gratitude" },
    { icon: "air", label: "Breathe" },
    { icon: "nightlight_round", label: "Night" },
    { icon: "wb_sunny", label: "Morning" },
    { icon: "nature", label: "Nature" },
    { icon: "forest", label: "Forest" },
    { icon: "water", label: "Peace" },
    { icon: "waves", label: "Flow" },
    { icon: "flare", label: "Energy" },
    { icon: "local_florist", label: "Garden" },
    { icon: "church", label: "Prayer" },
    { icon: "volunteer_activism", label: "Kindness" },
    { icon: "diversity_3", label: "Social" },
  ],
  productivity: [
    { icon: "edit_note", label: "Journal" },
    { icon: "task_alt", label: "Tasks" },
    { icon: "calendar_today", label: "Planning" },
    { icon: "alarm", label: "Alarm" },
    { icon: "schedule", label: "Schedule" },
    { icon: "workspace_premium", label: "Goals" },
    { icon: "trending_up", label: "Growth" },
    { icon: "savings", label: "Finance" },
    { icon: "mail", label: "Inbox" },
    { icon: "inbox", label: "Organize" },
    { icon: "laptop_chromebook", label: "Work" },
    { icon: "star", label: "Priority" },
    { icon: "flag", label: "Milestone" },
    { icon: "bolt", label: "Focus" },
    { icon: "checklist", label: "Checklist" },
  ],
};

const TIMES = ["Morning", "Afternoon", "Evening", "Anytime"];
const DIFFICULTIES = ["easy", "medium", "hard"] as const;

export default function NewHabitForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "health",
    icon: "favorite",
    frequency: "daily",
    difficulty: "easy" as "easy" | "medium" | "hard",
    preferredTime: "Morning",
    target: 1,
    targetUnit: "times",
    reminderTime: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Please enter a habit name");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create habit");
      } else {
        router.push("/habits");
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const selectedCategory = CATEGORIES.find((c) => c.id === form.category);
  const categoryIcons = ICONS_BY_CATEGORY[form.category] || [];

  // When category changes, auto-set icon to first icon of that category
  const handleCategoryChange = (catId: string) => {
    const firstIcon = (ICONS_BY_CATEGORY[catId] || [])[0]?.icon || "check_circle";
    setForm({ ...form, category: catId, icon: firstIcon });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-10 select-none">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/habits"
          className="w-9 h-9 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#667085] hover:text-[#101010] transition-colors"
        >
          <Icon name="arrow_back" size={18} />
        </Link>
        <div>
          <h1 className="text-[20px] font-bold text-[#101010]">New Habit</h1>
          <p className="text-[12px] text-[#667085]">Step {step} of 3</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex gap-1.5">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-all ${
              s <= step ? "bg-[#007AFF]" : "bg-[#E5E7EB]"
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="p-3 bg-[#FFF1F0] border border-[#FFD6D3] rounded-xl text-[13px] text-[#EF4444] flex items-center gap-2">
          <Icon name="error" size={16} />
          {error}
        </div>
      )}

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#101010]">Habit Name *</label>
              <input
                type="text"
                placeholder="e.g., Drink 8 glasses of water"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 text-[15px] bg-[#f6f3f2] rounded-xl border border-transparent focus:border-[#007AFF] focus:bg-white outline-none transition-all"
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#101010]">Description <span className="text-[#667085] font-normal">(optional)</span></label>
              <textarea
                placeholder="Why does this habit matter to you?"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 text-[14px] bg-[#f6f3f2] rounded-xl border border-transparent focus:border-[#007AFF] focus:bg-white outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Category selector */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col gap-3">
            <label className="text-[13px] font-semibold text-[#101010]">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                    form.category === cat.id
                      ? "border-[#007AFF] bg-[#EFF6FF]"
                      : "border-[#E5E7EB] bg-white hover:border-[#007AFF]/40"
                  }`}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: cat.bg }}
                  >
                    <Icon name={cat.icon} size={18} style={{ color: cat.color }} />
                  </div>
                  <span className="text-[11px] font-semibold text-[#101010]">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!form.name.trim()) { setError("Please enter a habit name"); return; }
              setError("");
              setStep(2);
            }}
            className="w-full h-14 bg-[#007AFF] text-white rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-[#0070eb] active:scale-[0.98] transition-all"
          >
            <span>Next: Choose Icon</span>
            <Icon name="arrow_forward" size={18} />
          </button>
        </div>
      )}

      {/* Step 2: Icon & Difficulty — Categorized Icons */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          {/* Icon Preview */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col items-center gap-3">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center shadow-md"
              style={{ background: selectedCategory?.bg || "#EFF6FF" }}
            >
              <Icon name={form.icon || "check_circle"} size={36} style={{ color: selectedCategory?.color || "#007AFF" }} />
            </div>
            <p className="text-[13px] text-[#667085]">
              Selected: <span className="font-semibold text-[#101010]">{categoryIcons.find(i => i.icon === form.icon)?.label || form.icon}</span>
            </p>
          </div>

          {/* Categorized icon grid */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-semibold text-[#101010]">
                Choose Icon
              </label>
              <span className="text-[11px] text-[#667085] px-2.5 py-0.5 rounded-full capitalize"
                style={{ background: selectedCategory?.bg, color: selectedCategory?.color }}
              >
                {selectedCategory?.label}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {categoryIcons.map(({ icon: ic, label }) => (
                <button
                  key={ic}
                  type="button"
                  title={label}
                  onClick={() => setForm({ ...form, icon: ic })}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border-2 transition-all ${
                    form.icon === ic
                      ? "border-[#007AFF] bg-[#EFF6FF]"
                      : "border-[#E5E7EB] bg-[#f6f3f2] hover:border-[#007AFF]/40"
                  }`}
                >
                  <Icon name={ic} size={22} className={form.icon === ic ? "text-[#007AFF]" : "text-[#667085]"} />
                  <span className="text-[9px] text-[#667085] truncate w-full text-center leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col gap-3">
            <label className="text-[13px] font-semibold text-[#101010]">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setForm({ ...form, difficulty: d })}
                  className={`py-2.5 rounded-xl border-2 text-[13px] font-semibold capitalize transition-all ${
                    form.difficulty === d
                      ? d === "easy" ? "border-[#22C55E] bg-[#ECFDF3] text-[#22C55E]"
                        : d === "medium" ? "border-[#F59E0B] bg-[#FFF7ED] text-[#F59E0B]"
                        : "border-[#EF4444] bg-[#FFF1F0] text-[#EF4444]"
                      : "border-[#E5E7EB] text-[#667085] hover:border-[#667085]"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 h-14 border border-[#E5E7EB] bg-white text-[#667085] rounded-full font-semibold text-[14px] flex items-center justify-center gap-1.5 hover:text-[#101010] transition-all"
            >
              <Icon name="arrow_back" size={16} />
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex-2 h-14 px-8 bg-[#007AFF] text-white rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-[#0070eb] active:scale-[0.98] transition-all"
            >
              Next: Schedule
              <Icon name="arrow_forward" size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Schedule */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-[#101010]">Preferred Time</label>
              <div className="grid grid-cols-2 gap-2">
                {TIMES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, preferredTime: t })}
                    className={`py-3 rounded-xl border-2 text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      form.preferredTime === t
                        ? "border-[#007AFF] bg-[#EFF6FF] text-[#007AFF]"
                        : "border-[#E5E7EB] text-[#667085] hover:border-[#007AFF]/40"
                    }`}
                  >
                    <Icon
                      name={t === "Morning" ? "wb_sunny" : t === "Evening" ? "nightlight_round" : t === "Afternoon" ? "wb_cloudy" : "schedule"}
                      size={16}
                    />
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#101010]">
                Reminder Time <span className="text-[#667085] font-normal">(optional)</span>
              </label>
              <input
                type="time"
                value={form.reminderTime}
                onChange={(e) => setForm({ ...form, reminderTime: e.target.value })}
                className="w-full px-4 py-3 text-[14px] bg-[#f6f3f2] rounded-xl border border-transparent focus:border-[#007AFF] focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-[#EFF6FF] border border-[#d8e2ff] rounded-2xl p-4 flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
              style={{ background: selectedCategory?.bg || "#EFF6FF" }}
            >
              <Icon name={form.icon || "check_circle"} size={24} style={{ color: selectedCategory?.color || "#007AFF" }} />
            </div>
            <div>
              <p className="text-[15px] font-bold text-[#101010]">{form.name || "Your habit"}</p>
              <p className="text-[12px] text-[#667085] mt-0.5">
                {selectedCategory?.label} · {form.preferredTime} · {form.difficulty}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 h-14 border border-[#E5E7EB] bg-white text-[#667085] rounded-full font-semibold text-[14px] flex items-center justify-center gap-1.5 hover:text-[#101010] transition-all"
            >
              <Icon name="arrow_back" size={16} />
              Back
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-2 h-14 px-8 bg-[#007AFF] text-white rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-[#0070eb] active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Icon name="refresh" size={18} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Icon name="check" size={18} />
                  <span>Create Habit</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
