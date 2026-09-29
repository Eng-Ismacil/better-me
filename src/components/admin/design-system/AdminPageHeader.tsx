"use client";

import React from "react";
import Icon from "@/components/ui/Icon";

export interface HeaderBadge {
  label: string;
  value: string | number;
  variant?: "blue" | "success" | "warning" | "danger" | "neutral" | string;
}

interface AdminPageHeaderProps {
  badge?: string;
  badgeIcon?: string;
  badges?: HeaderBadge[];
  title: string;
  description?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export default function AdminPageHeader({
  badge,
  badgeIcon,
  badges,
  title,
  description,
  subtitle,
  actions,
  children,
}: AdminPageHeaderProps) {
  const desc = description || subtitle;
  const actionContent = actions || children;

  const getBadgeStyle = (variant?: string) => {
    switch (variant) {
      case "success":
        return "bg-[#ECFDF3] text-[#10B981] border-[#10B981]/20";
      case "warning":
        return "bg-amber-50 text-[#F59E0B] border-[#F59E0B]/20";
      case "danger":
        return "bg-[#FEF2F2] text-[#EF4444] border-[#EF4444]/20";
      case "neutral":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "blue":
      default:
        return "bg-[#EFF6FF] text-[#0B6EF3] border-[#0B6EF3]/20";
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#E2E8F0]/80">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {badge && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#0B6EF3] text-[11px] font-extrabold uppercase tracking-wide border border-[#BFDBFE]/60">
              {badgeIcon && <Icon name={badgeIcon} size={14} />}
              <span>{badge}</span>
            </div>
          )}

          {badges &&
            badges.map((b, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getBadgeStyle(
                  b.variant
                )}`}
              >
                <span className="opacity-70">{b.label}:</span>
                <span className="font-extrabold">{b.value}</span>
              </span>
            ))}
        </div>

        <h1 className="text-[22px] sm:text-[26px] font-extrabold text-[#0F172A] tracking-tight font-[family-name:var(--font-headline)] truncate">
          {title}
        </h1>
        {desc && <p className="text-[13px] text-[#64748B] mt-0.5 max-w-2xl">{desc}</p>}
      </div>

      {actionContent && <div className="flex items-center gap-2.5 shrink-0">{actionContent}</div>}
    </div>
  );
}
