"use client";

import React, { useState } from "react";
import Icon from "@/components/ui/Icon";
import confetti from "canvas-confetti";
import { useTranslation } from "@/lib/i18n";
import { DailyCheckIn } from "@/types";

interface CheckInClientProps {
  initialCheckIn: DailyCheckIn | null;
  todayDate: string;
}

const MOODS = [
  { id: "energized", labelEn: "Energized", labelSo: "Firfircoon", icon: "bolt", bg: "bg-[#FFFBEB]", color: "text-[#D97706]", border: "border-[#FDE68A]" },
  { id: "calm_focused", labelEn: "Calm & Focused", labelSo: "Deggan", icon: "self_improvement", bg: "bg-[#F4F8FF]", color: "text-[#0B6EF3]", border: "border-[#D0E2FF]" },
  { id: "neutral", labelEn: "Steady", labelSo: "Dhexdhexaad", icon: "spa", bg: "bg-[#ECFDF3]", color: "text-[#20C773]", border: "border-[#A7F3D0]" },
  { id: "tired", labelEn: "Tired", labelSo: "Daallan", icon: "bedtime", bg: "bg-[#F5F3FF]", color: "text-[#8B5CF6]", border: "border-[#DDD6FE]" },
  { id: "stressed", labelEn: "Stressed", labelSo: "Walwalsan", icon: "cloud", bg: "bg-[#FFF1F0]", color: "text-[#EF4444]", border: "border-[#FFD6D3]" },
];

export default function CheckInClient({
  initialCheckIn,
  todayDate,
}: CheckInClientProps) {
  const { language, t } = useTranslation();

  const [mood, setMood] = useState<DailyCheckIn["mood"]>(
    initialCheckIn?.mood || "calm_focused"
  );
  const [energy, setEnergy] = useState<number>(initialCheckIn?.energy || 8);
  const [notes, setNotes] = useState<string>(initialCheckIn?.notes || "");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: todayDate,
          mood,
          energy,
          notes,
        }),
      });

      if (!res.ok) throw new Error("Failed to save check-in");

      setSavedSuccess(true);
      confetti({
        particleCount: 40,
        spread: 55,
        origin: { y: 0.7 },
        colors: ["#0B6EF3", "#20C773", "#F59E0B"],
      });
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 select-none max-w-xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-[#0B6EF3] font-bold text-[12px] uppercase tracking-wider mb-1">
          <Icon name="today" size={16} />
          <span>{todayDate}</span>
        </div>
        <h2 className="text-[24px] font-extrabold text-[#111827] tracking-tight">
          {t("checkin_title")}
        </h2>
        <p className="text-[13px] text-[#667085] mt-0.5">
          {t("checkin_subtitle")}
        </p>
      </div>

      {/* Purpose of Daily Check-in Card */}
      <section className="bg-[#F4F8FF] rounded-[18px] p-4 border border-[#D0E2FF] flex items-start gap-3 shadow-2xs">
        <div className="w-9 h-9 rounded-full bg-white text-[#0B6EF3] flex items-center justify-center shrink-0 border border-[#D0E2FF] shadow-2xs">
          <Icon name="psychology" size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[13px] font-bold text-[#0B6EF3]">
            {language === "so" ? "Ujeeddada Jeeg-gareynta Maalinlaha ah" : "Purpose of Daily Check-in"}
          </h4>
          <p className="text-[12px] text-[#111827] mt-0.5 leading-relaxed">
            {language === "so"
              ? "Qeybtan waxaa loogu talagalay inaad maalin kasta kula socoto dareenkaaga (mood), heerka tamartaada (energy level), iyo xusuus-qor yar (journal). Waxay kaa caawinaysaa inaad fahamto sida caadooyinkaagu u saameeyaan caafimaadkaaga maskaxeed iyo wax-soo-saarkaaga."
              : "Track your emotional state, physical energy, and daily reflections. This helps BetterMe analyze the direct link between habit completion and your personal well-being."}
          </p>
        </div>
      </section>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-[#ECFDF3] border border-[#BBF7D0] text-[#15803D] flex items-center gap-3 text-[14px] font-medium shadow-xs">
          <Icon name="check_circle" size={20} className="text-[#20C773]" />
          <span>{t("checkin_saved")}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Mood Selector (Pure Material Icons - No Emojis) */}
        <section className="bg-white rounded-[20px] border border-[#E7ECF3] p-5 shadow-xs flex flex-col gap-3">
          <label className="text-[14px] font-bold text-[#111827] block">
            {t("how_feeling")}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {MOODS.map((m) => {
              const isSelected = mood === m.id;
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMood(m.id as DailyCheckIn["mood"])}
                  className={`p-3 rounded-[16px] border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#0B6EF3] bg-[#F4F8FF] text-[#0B6EF3] shadow-xs scale-102 font-bold ring-2 ring-[#0B6EF3]/20"
                      : "border-[#E7ECF3] bg-white text-[#667085] hover:border-gray-300"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full ${m.bg} ${m.color} border ${m.border} flex items-center justify-center shrink-0`}>
                    <Icon name={m.icon} size={22} />
                  </div>
                  <span className="text-[12px] text-center leading-tight">
                    {language === "so" ? m.labelSo : m.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Energy Slider */}
        <section className="bg-white rounded-[20px] border border-[#E7ECF3] p-5 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-[14px] font-bold text-[#111827]">
              {t("energy_level")}
            </label>
            <span className="px-3 py-1 rounded-full bg-[#F4F8FF] text-[#0B6EF3] font-bold text-[13px] border border-[#D0E2FF]">
              {energy} / 10
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="10"
            value={energy}
            onChange={(e) => setEnergy(Number(e.target.value))}
            className="w-full h-2.5 bg-[#E7ECF3] rounded-lg appearance-none cursor-pointer accent-[#0B6EF3]"
          />

          <div className="flex justify-between text-[11px] text-[#667085] font-semibold px-1">
            <span>{language === "so" ? "Karti yar (1)" : "Low (1)"}</span>
            <span>{language === "so" ? "Dhexdhexaad (5)" : "Balanced (5)"}</span>
            <span>{language === "so" ? "Aad u sarreeya (10)" : "Unstoppable (10)"}</span>
          </div>
        </section>

        {/* Reflection Notes */}
        <section className="bg-white rounded-[20px] border border-[#E7ECF3] p-5 shadow-xs flex flex-col gap-3">
          <label className="text-[14px] font-bold text-[#111827] block">
            {t("journal_prompt")}
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              language === "so"
                ? "Qor waxyaabaha kuugu wacnaa maanta, casharadii aad baratay, ama dareenkaaga guud..."
                : "Record your wins, gratitude, or tomorrow's primary focus..."
            }
            className="w-full p-3.5 rounded-xl border border-[#E7ECF3] text-[14px] text-[#111827] focus:border-[#0B6EF3] outline-none transition-all placeholder:text-[#98A2B3] resize-none"
          />
        </section>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 rounded-[18px] bg-[#0B6EF3] text-white font-bold text-[15px] hover:bg-[#0958c7] active:scale-98 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <>
              <Icon name="refresh" size={18} className="animate-spin" />
              <span>{t("btn_saving")}</span>
            </>
          ) : (
            <>
              <Icon name="check" size={18} />
              <span>{t("save_checkin")}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
