"use client";

import React from "react";

interface PageSkeletonProps {
  rows?: number;
  cards?: number;
  showHeader?: boolean;
}

/**
 * Fast skeleton shown instantly while server data loads.
 * Gives the React Router DOM "instant tab switch" feeling.
 */
export default function PageSkeleton({ rows = 4, cards = 2, showHeader = true }: PageSkeletonProps) {
  return (
    <div className="animate-pulse space-y-5 pt-2">
      {showHeader && (
        <div className="space-y-2">
          <div className="h-7 w-48 bg-[#E5E7EB] rounded-xl" />
          <div className="h-4 w-72 bg-[#F0EDEC] rounded-lg" />
        </div>
      )}

      {/* Stat cards row */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="h-24 bg-[#F0EDEC] rounded-2xl" />
        ))}
      </div>

      {/* List rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E5E7EB] flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 bg-[#E5E7EB] rounded-full w-3/5" />
              <div className="h-3 bg-[#F0EDEC] rounded-full w-2/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
