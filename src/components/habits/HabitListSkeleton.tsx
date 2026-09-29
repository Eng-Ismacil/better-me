"use client";

import React from "react";

export default function HabitListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 bg-white rounded-2xl border border-slate-200/70 flex items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-3.5 flex-1">
            <div className="w-10 h-10 rounded-xl bg-slate-100" />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 w-1/3 bg-slate-200 rounded" />
              <div className="h-3 w-1/4 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-100 shrink-0" />
        </div>
      ))}
    </div>
  );
}
