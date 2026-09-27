"use client";

import React, { useState } from "react";
import Icon from "@/components/ui/Icon";
import { Reminder } from "@/types";

interface RemindersClientProps {
  reminders: Reminder[];
}

const DAYS_ALL = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function RemindersClient({ reminders: initialReminders }: RemindersClientProps) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);

  const toggleReminder = async (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r._id === id ? { ...r, enabled: !r.enabled } : r))
    );
    // Optimistic — in production, patch to API
  };

  return (
    <div className="flex flex-col gap-5 select-none">
      {/* Header Card */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-[0_2px_12px_rgba(16,24,40,0.04)] relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-[#667085]">Smart Reminders</p>
            <h2 className="text-[22px] font-bold text-[#101010] mt-0.5">{reminders.filter(r => r.enabled).length} Active</h2>
            <p className="text-[13px] text-[#667085] mt-0.5">Nudge yourself at the right moments</p>
          </div>
          <div className="w-14 h-14 rounded-full bg-[#EFF6FF] flex items-center justify-center">
            <Icon name="notifications" size={28} className="text-[#007AFF]" />
          </div>
        </div>
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-[#EFF6FF]/60 blur-2xl pointer-events-none" />
      </section>

      {/* Reminders List */}
      {reminders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 flex flex-col items-center text-center">
          <Icon name="notifications_off" size={40} className="text-[#667085] mb-3" />
          <h3 className="text-[16px] font-bold text-[#101010]">No reminders yet</h3>
          <p className="text-[13px] text-[#667085] mt-1 max-w-xs">
            Add reminders when creating or editing your habits to stay on track.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reminders.map((reminder) => (
            <div
              key={reminder._id}
              className={`bg-white rounded-2xl border p-4 transition-all ${
                reminder.enabled ? "border-[#007AFF]/30 shadow-[0_2px_8px_rgba(0,122,255,0.06)]" : "border-[#E5E7EB] opacity-70"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${reminder.enabled ? "bg-[#EFF6FF]" : "bg-[#f6f3f2]"}`}>
                  <Icon name="alarm" size={20} className={reminder.enabled ? "text-[#007AFF]" : "text-[#667085]"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-[#101010]">{reminder.habitTitle}</p>
                  <p className="text-[20px] font-bold text-[#007AFF] mt-1">{reminder.time}</p>
                  {/* Days strip */}
                  <div className="flex gap-1.5 mt-2">
                    {DAYS_ALL.map((d) => {
                      const active = reminder.days.includes(d);
                      return (
                        <span
                          key={d}
                          className={`text-[10px] font-semibold w-6 h-6 rounded-full flex items-center justify-center ${
                            active ? "bg-[#007AFF] text-white" : "bg-[#f0edec] text-[#667085]"
                          }`}
                        >
                          {d[0]}
                        </span>
                      );
                    })}
                  </div>
                  {reminder.smartTiming && (
                    <div className="flex items-center gap-1 mt-2">
                      <Icon name="psychology" size={12} className="text-[#22C55E]" />
                      <span className="text-[11px] text-[#22C55E] font-semibold">Smart timing enabled</span>
                    </div>
                  )}
                </div>
                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => toggleReminder(reminder._id || "")}
                  className={`relative w-12 h-6 rounded-full transition-all duration-200 shrink-0 mt-1 ${
                    reminder.enabled ? "bg-[#007AFF]" : "bg-[#E5E7EB]"
                  }`}
                  aria-label={reminder.enabled ? "Disable reminder" : "Enable reminder"}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
                    reminder.enabled ? "left-[26px]" : "left-0.5"
                  }`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Smart Timing Explanation */}
      <section className="bg-[#ECFDF3] border border-[#d1fae5] rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs">
          <Icon name="psychology" size={18} className="text-[#22C55E]" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-[#22C55E]">Smart Timing</p>
          <p className="text-[13px] text-[#101010] mt-0.5 leading-snug">
            When enabled, BetterMe adjusts your reminder times based on your
            historical completion patterns for better nudges.
          </p>
        </div>
      </section>

      {/* Add Reminder CTA */}
      <button
        type="button"
        className="w-full h-14 border-2 border-dashed border-[#d8e2ff] rounded-2xl flex items-center justify-center gap-2 text-[#007AFF] text-[14px] font-semibold hover:bg-[#EFF6FF] transition-all"
      >
        <Icon name="add_circle" size={20} />
        <span>Add New Reminder</span>
      </button>
    </div>
  );
}
