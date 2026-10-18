"use client";

import React from "react";

export interface MuiTextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  sizeVariant?: "small" | "medium";
}

export function MuiTextField({
  label,
  helperText,
  error = false,
  startAdornment,
  endAdornment,
  sizeVariant = "small",
  className = "",
  id,
  ...props
}: MuiTextFieldProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`text-[11px] font-semibold uppercase tracking-wider ${
            error
              ? "text-[#D32F2F]"
              : "text-slate-600 dark:text-slate-300"
          }`}
        >
          {label}
        </label>
      )}

      <div
        className={`relative flex items-center rounded-md border transition-colors ${
          error
            ? "border-[#D32F2F] focus-within:border-[#D32F2F] focus-within:ring-1 focus-within:ring-[#D32F2F]"
            : "border-slate-300 dark:border-slate-700 focus-within:border-[#1976D2] focus-within:ring-1 focus-within:ring-[#1976D2]"
        } bg-white dark:bg-[#121824]`}
      >
        {startAdornment && (
          <span className="pl-3 text-slate-400 shrink-0">{startAdornment}</span>
        )}

        <input
          id={inputId}
          className={`w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-none ${
            sizeVariant === "small" ? "py-1.5 px-3 text-xs" : "py-2.5 px-3.5 text-sm"
          }`}
          {...props}
        />

        {endAdornment && (
          <span className="pr-3 text-slate-400 shrink-0">{endAdornment}</span>
        )}
      </div>

      {helperText && (
        <span
          className={`text-[10px] ${
            error ? "text-[#D32F2F]" : "text-slate-400"
          }`}
        >
          {helperText}
        </span>
      )}
    </div>
  );
}
