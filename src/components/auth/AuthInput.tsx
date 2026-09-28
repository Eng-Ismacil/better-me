"use client";

import React, { useState } from "react";
import Icon from "@/components/ui/Icon";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  iconName: string;
  error?: string;
  isPassword?: boolean;
  showRequirements?: boolean;
  rightElement?: React.ReactNode;
}

export default function AuthInput({
  label,
  iconName,
  error,
  isPassword = false,
  showRequirements = false,
  rightElement,
  value,
  id,
  ...props
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || `auth-input-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const strVal = String(value || "");

  // Password requirements check (at least 6 characters)
  const hasMinLength = strVal.length >= 6;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {/* Label and optional right element (e.g. Forgot Password) */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="text-[13px] font-bold text-[#111827] select-none"
        >
          {label}
        </label>
        {rightElement}
      </div>

      {/* Input Field Container */}
      <div className="relative flex items-center group">
        <div className="absolute left-3.5 flex items-center justify-center text-[#8692A6] group-focus-within:text-[#0B6EF3] transition-colors pointer-events-none">
          <Icon name={iconName} size={19} />
        </div>

        <input
          id={inputId}
          value={value}
          type={isPassword ? (showPassword ? "text" : "password") : props.type || "text"}
          aria-invalid={Boolean(error)}
          className={`w-full h-12 pl-10 pr-11 bg-white rounded-xl border text-[14px] text-[#111827] placeholder:text-[#9CA3AF] transition-all outline-none font-medium shadow-2xs ${
            error
              ? "border-[#EF4444] focus:ring-3 focus:ring-[#EF4444]/20 focus:border-[#EF4444]"
              : "border-[#E7ECF3] focus:border-[#0B6EF3] focus:ring-3 focus:ring-[#0B6EF3]/15 hover:border-[#CBD5E1]"
          } disabled:bg-[#F3F4F6] disabled:cursor-not-allowed`}
          {...props}
        />

        {/* Password toggle icon */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3.5 p-1 text-[#8692A6] hover:text-[#111827] transition-colors cursor-pointer select-none"
          >
            <Icon
              name={showPassword ? "visibility_off" : "visibility"}
              size={18}
            />
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-[12px] text-[#EF4444] font-semibold flex items-center gap-1 mt-0.5 animate-in fade-in">
          <Icon name="error" size={14} />
          <span>{error}</span>
        </p>
      )}

      {/* Live Password Requirement Indicator (for Sign Up) */}
      {showRequirements && strVal.length > 0 && (
        <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold">
          <span
            className={`w-4 h-4 rounded-full flex items-center justify-center ${
              hasMinLength
                ? "bg-[#ECFDF3] text-[#20C773]"
                : "bg-[#F3F4F6] text-[#9CA3AF]"
            }`}
          >
            <Icon name={hasMinLength ? "check" : "circle"} size={10} />
          </span>
          <span className={hasMinLength ? "text-[#20C773]" : "text-[#667085]"}>
            {hasMinLength
              ? "Strong password (6+ characters)"
              : "At least 6 characters required"}
          </span>
        </div>
      )}
    </div>
  );
}
