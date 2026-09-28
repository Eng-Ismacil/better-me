"use client";

import React, { useId } from "react";

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showPercentText?: boolean;
  color?: string;
  useGradient?: boolean;
}

export default function ProgressRing({
  percentage,
  size = 80,
  strokeWidth = 7,
  className = "",
  showPercentText = true,
  color = "#0B6EF3",
  useGradient = true,
}: ProgressRingProps) {
  const gradientId = useId();
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
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B6EF3" />
            <stop offset="100%" stopColor="#20C773" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F4F8FF"
          strokeWidth={strokeWidth}
        />
        {/* Animated Progress track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={
            clampedPercent === 100
              ? "#20C773"
              : useGradient
              ? `url(#${gradientId})`
              : color
          }
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {showPercentText && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          <span className="font-bold text-[19px] text-[#111827] leading-none tracking-tight">
            {clampedPercent}
            <span className="text-[12px] font-semibold text-[#0B6EF3]">%</span>
          </span>
        </div>
      )}
    </div>
  );
}

