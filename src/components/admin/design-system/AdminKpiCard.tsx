"use client";

import React from "react";
import Icon from "@/components/ui/Icon";

interface AdminKpiCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  subtext?: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  icon: string;
  iconColor?: string;
  iconBg?: string;
  variant?: "blue" | "success" | "warning" | "danger" | "neutral" | string;
  loading?: boolean;
}

export default function AdminKpiCard({
  label,
  value,
  sublabel,
  subtext,
  trend,
  trendDirection = "up",
  icon,
  iconColor,
  iconBg,
  variant,
  loading = false,
}: AdminKpiCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#E7ECF3] p-5 shadow-xs animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-3.5 w-24 bg-slate-200 rounded" />
          <div className="w-10 h-10 rounded-xl bg-slate-100" />
        </div>
        <div className="h-8 w-28 bg-slate-200 rounded mb-2" />
        <div className="h-3 w-36 bg-slate-100 rounded" />
      </div>
    );
  }

  // Derive colors from variant if not explicitly given
  let finalIconColor = iconColor || "#0B6EF3";
  let finalIconBg = iconBg || "#EFF6FF";

  if (variant) {
    switch (variant) {
      case "success":
        finalIconColor = "#10B981";
        finalIconBg = "#ECFDF3";
        break;
      case "warning":
        finalIconColor = "#F59E0B";
        finalIconBg = "#FFFBEB";
        break;
      case "danger":
        finalIconColor = "#EF4444";
        finalIconBg = "#FEF2F2";
        break;
      case "neutral":
        finalIconColor = "#64748B";
        finalIconBg = "#F1F5F9";
        break;
      case "blue":
      default:
        finalIconColor = "#0B6EF3";
        finalIconBg = "#EFF6FF";
        break;
    }
  }

  const secondaryText = subtext || sublabel;

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs hover:border-[#CBD5E1] transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider truncate">
            {label}
          </span>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
            style={{ backgroundColor: finalIconBg, color: finalIconColor }}
          >
            <Icon name={icon} size={18} />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-[24px] sm:text-[28px] font-extrabold text-[#0F172A] tracking-tight font-[family-name:var(--font-headline)] tabular-nums">
            {value}
          </span>

          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                trendDirection === "up"
                  ? "bg-[#ECFDF3] text-[#10B981]"
                  : trendDirection === "down"
                  ? "bg-[#FEF2F2] text-[#EF4444]"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <Icon
                name={
                  trendDirection === "up"
                    ? "trending_up"
                    : trendDirection === "down"
                    ? "trending_down"
                    : "trending_flat"
                }
                size={14}
              />
              {trend}
            </span>
          )}
        </div>
      </div>

      {secondaryText && (
        <p className="text-[11px] text-[#64748B] mt-1 font-medium truncate">
          {secondaryText}
        </p>
      )}
    </div>
  );
}
