"use client";

import React from "react";

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showPercentText?: boolean;
  color?: string;
}

export default function ProgressRing({
  percentage,
  size = 80,
  strokeWidth = 6.5,
  className = "",
  showPercentText = true,
  color = "#0070eb",
}: ProgressRingProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercent = Math.min(100, Math.max(0, percentage));
  const offset = circumference - (clampedPercent / 100) * circumference;

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        className="w-full h-full -rotate-90 transform"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#EFF6FF"
          strokeWidth={strokeWidth}
        />
        {/* Animated Progress track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={clampedPercent === 100 ? "#22C55E" : color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {showPercentText && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          <span className="font-bold text-[18px] text-[#101010] leading-none">
            {clampedPercent}
            <span className="text-[12px] font-semibold text-[#007AFF]">%</span>
          </span>
        </div>
      )}
    </div>
  );
}
