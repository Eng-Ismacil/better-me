"use client";

import React from "react";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";

export interface ContextFilterTab {
  key: string;
  label: string;
  count?: number;
}

interface AdminContextBarProps {
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  totalCount?: number;
  countLabel?: string;
  filterTabs?: ContextFilterTab[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export default function AdminContextBar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  onRefresh,
  isRefreshing,
  totalCount,
  countLabel,
  filterTabs,
  activeTab,
  onTabChange,
  actions,
  children,
}: AdminContextBarProps) {
  const { language } = useTranslation();
  const so = language === "so";

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
      <div className="flex items-center gap-2.5 flex-1 min-w-0 flex-wrap">
        {/* Search Input */}
        {onSearchChange !== undefined && (
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <input
              type="text"
              value={searchValue || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder || (so ? "Raadi..." : "Search...")}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-[12px] font-medium text-[#0F172A] outline-none focus:border-[#0B6EF3] focus:bg-white transition-all"
            />
            <Icon
              name="search"
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </div>
        )}

        {/* Filter Tabs if provided */}
        {filterTabs && filterTabs.length > 0 && (
          <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80 overflow-x-auto">
            {filterTabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onTabChange?.(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-[#0B6EF3] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        isActive
                          ? "bg-blue-50 text-[#0B6EF3]"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Total Count Chip */}
        {totalCount !== undefined && (
          <span className="text-[12px] text-[#64748B] font-semibold whitespace-nowrap pl-1">
            <strong className="text-[#0F172A] font-bold">{totalCount}</strong>{" "}
            {countLabel || (so ? "la helay" : "records")}
          </span>
        )}
      </div>

      {/* Actions and Children */}
      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        {actions}
        {children}

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-[#CBD5E1] bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-colors cursor-pointer"
            title={so ? "Dib u cusboonaysii" : "Refresh"}
          >
            <Icon
              name="refresh"
              size={16}
              className={isRefreshing ? "animate-spin text-[#0B6EF3]" : ""}
            />
          </button>
        )}
      </div>
    </div>
  );
}
