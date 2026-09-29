"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";

export interface DrawerMember {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  currentStreak?: number;
  bestStreak?: number;
  totalCompletions?: number;
  habitCount?: number;
  status?: string;
  habitName?: string;
  joinedDate?: string;
}

interface AdminMemberDrawerProps {
  member: DrawerMember | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminMemberDrawer({
  member,
  isOpen,
  onClose,
}: AdminMemberDrawerProps) {
  const { language } = useTranslation();
  const so = language === "so";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !member) return null;

  const initials = member.name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "MB";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-[#E2E8F0] flex flex-col animate-in slide-in-from-right duration-250">
          {/* Header */}
          <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <h3 className="text-[14px] font-bold text-[#0F172A] uppercase tracking-wider">
                {so ? "Faahfaahinta Xubinta" : "Member Details"}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Identity Card */}
            <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-gradient-to-b from-[#F8FAFC] to-white border border-[#E2E8F0]">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-3 border-[#0B6EF3]/30 shadow-md mb-3">
                {member.avatarUrl ? (
                  <Image
                    src={member.avatarUrl}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#0B6EF3] to-[#6366F1] text-white flex items-center justify-center text-[22px] font-bold">
                    {initials}
                  </div>
                )}
              </div>
              <h4 className="text-[18px] font-extrabold text-[#0F172A]">
                {member.name}
              </h4>
              <p className="text-[12px] text-[#64748B] font-medium mt-0.5">
                {member.email}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#059669] text-[11px] font-extrabold uppercase tracking-wide border border-[#A7F3D0]">
                  {so ? "Firfircoon" : "Active Member"}
                </span>
                <span className="text-[11px] text-[#94A3B8]">
                  ID: {member.userId.slice(-6)}
                </span>
              </div>
            </div>

            {/* Performance Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#FAFBFD]">
                <div className="flex items-center gap-1.5 text-[#F59E0B] text-[11px] font-bold uppercase">
                  <Icon name="local_fire_department" size={16} />
                  <span>{so ? "Current Streak" : "Current Streak"}</span>
                </div>
                <p className="text-[24px] font-extrabold text-[#0F172A] mt-1 tabular-nums">
                  {member.currentStreak ?? 0}{" "}
                  <span className="text-[12px] font-semibold text-[#64748B]">
                    {so ? "maalmood" : "days"}
                  </span>
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#FAFBFD]">
                <div className="flex items-center gap-1.5 text-[#0B6EF3] text-[11px] font-bold uppercase">
                  <Icon name="emoji_events" size={16} />
                  <span>{so ? "Best Streak" : "Best Streak"}</span>
                </div>
                <p className="text-[24px] font-extrabold text-[#0F172A] mt-1 tabular-nums">
                  {member.bestStreak ?? 0}{" "}
                  <span className="text-[12px] font-semibold text-[#64748B]">
                    {so ? "maalmood" : "days"}
                  </span>
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#FAFBFD]">
                <div className="flex items-center gap-1.5 text-[#10B981] text-[11px] font-bold uppercase">
                  <Icon name="task_alt" size={16} />
                  <span>{so ? "Completions" : "Total Completed"}</span>
                </div>
                <p className="text-[24px] font-extrabold text-[#0F172A] mt-1 tabular-nums">
                  {member.totalCompletions ?? 0}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#FAFBFD]">
                <div className="flex items-center gap-1.5 text-[#8B5CF6] text-[11px] font-bold uppercase">
                  <Icon name="view_agenda" size={16} />
                  <span>{so ? "Habits" : "Active Habits"}</span>
                </div>
                <p className="text-[24px] font-extrabold text-[#0F172A] mt-1 tabular-nums">
                  {member.habitCount ?? 1}
                </p>
              </div>
            </div>

            {/* Context Info */}
            {member.habitName && (
              <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                  {so ? "Caadada ugu weyn" : "Top Featured Habit"}
                </span>
                <p className="text-[14px] font-bold text-[#0F172A] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0B6EF3]" />
                  {member.habitName}
                </p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-2 pt-2">
              <Link
                href={`/admin/users/${member.userId}`}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0B6EF3] hover:bg-[#0958C7] text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Icon name="person" size={18} />
                <span>{so ? "Eeg Profile-ka oo Dhameystiran" : "View Full Member Profile"}</span>
              </Link>

              <Link
                href={`/admin/support?user=${member.userId}`}
                className="w-full py-2.5 px-4 rounded-xl border border-[#E2E8F0] text-[#334155] hover:bg-[#F8FAFC] text-[13px] font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Icon name="chat" size={18} />
                <span>{so ? "Fariin Toos ah u Dir (Chat)" : "Send Direct Message"}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
