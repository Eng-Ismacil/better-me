"use client";

import React from "react";
import Icon from "@/components/ui/Icon";

interface BenefitItemProps {
  icon?: string;
  title: string;
  subtitle?: string;
  highlightColor?: string;
}

export default function BenefitItem({
  icon = "check_circle",
  title,
  subtitle,
  highlightColor = "#20C773",
}: BenefitItemProps) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white border border-[#E7ECF3] shadow-2xs hover:border-[#0B6EF3]/30 transition-all flex-1 min-w-[130px]">
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: `${highlightColor}18`,
          color: highlightColor,
        }}
      >
        <Icon name={icon} size={14} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[12px] font-bold text-[#111827] leading-tight truncate">
          {title}
        </span>
        {subtitle && (
          <span className="text-[10px] text-[#667085] leading-tight truncate">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
