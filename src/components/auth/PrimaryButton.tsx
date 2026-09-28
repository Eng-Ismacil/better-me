"use client";

import React from "react";
import Icon from "@/components/ui/Icon";

interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
  iconName?: string;
  variant?: "primary" | "secondary" | "danger";
}

export default function PrimaryButton({
  children,
  loading = false,
  iconName,
  variant = "primary",
  disabled,
  className = "",
  ...props
}: PrimaryButtonProps) {
  const baseStyles =
    "w-full h-12 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all duration-200 select-none cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-2xs";

  const variantStyles = {
    primary:
      "bg-[#0B6EF3] text-white hover:bg-[#0958C7] shadow-[0_4px_16px_rgba(11,110,243,0.22)]",
    secondary:
      "bg-white border border-[#E7ECF3] text-[#374151] hover:bg-[#F9FAFB] hover:border-[#CBD5E1] shadow-2xs",
    danger:
      "bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-[0_4px_16px_rgba(239,68,68,0.2)]",
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Please wait...</span>
        </div>
      ) : (
        <>
          <span>{children}</span>
          {iconName && (
            <Icon
              name={iconName}
              size={18}
              className="transition-transform group-hover:translate-x-0.5"
            />
          )}
        </>
      )}
    </button>
  );
}
