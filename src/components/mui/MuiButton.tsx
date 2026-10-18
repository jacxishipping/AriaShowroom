"use client";

import React from "react";

export interface MuiButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "contained" | "outlined" | "text";
  color?: "primary" | "secondary" | "gold" | "success" | "error" | "inherit";
  size?: "small" | "medium" | "large";
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export function MuiButton({
  children,
  variant = "contained",
  color = "primary",
  size = "medium",
  startIcon,
  endIcon,
  fullWidth = false,
  className = "",
  disabled = false,
  ...props
}: MuiButtonProps) {
  // Size classes
  const sizeClasses = {
    small: "px-2.5 py-1 text-[11px]",
    medium: "px-4 py-1.5 text-xs",
    large: "px-5 py-2 text-sm",
  };

  // Base styling matching Material-UI Button
  const baseClasses =
    "inline-flex items-center justify-center font-medium uppercase tracking-[0.02857em] rounded-md transition-all duration-200 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]";

  // Variant & Color Mapping
  let colorClasses = "";

  if (variant === "contained") {
    switch (color) {
      case "primary":
        colorClasses =
          "bg-[#1976D2] text-white shadow-mui-1 hover:bg-[#115293] hover:shadow-mui-2";
        break;
      case "gold":
        colorClasses =
          "bg-[#D97706] text-white shadow-mui-1 hover:bg-[#B45309] hover:shadow-mui-2";
        break;
      case "secondary":
        colorClasses =
          "bg-[#9C27B0] text-white shadow-mui-1 hover:bg-[#7B1FA2] hover:shadow-mui-2";
        break;
      case "success":
        colorClasses =
          "bg-[#2E7D32] text-white shadow-mui-1 hover:bg-[#1B5E20] hover:shadow-mui-2";
        break;
      case "error":
        colorClasses =
          "bg-[#D32F2F] text-white shadow-mui-1 hover:bg-[#C62828] hover:shadow-mui-2";
        break;
      default:
        colorClasses =
          "bg-slate-800 text-white shadow-mui-1 hover:bg-slate-900 hover:shadow-mui-2 dark:bg-slate-200 dark:text-slate-900";
    }
  } else if (variant === "outlined") {
    switch (color) {
      case "primary":
        colorClasses =
          "border border-[#1976D2]/60 text-[#1976D2] hover:bg-[#1976D2]/8 hover:border-[#1976D2]";
        break;
      case "gold":
        colorClasses =
          "border border-[#D97706]/60 text-[#D97706] hover:bg-[#D97706]/8 hover:border-[#D97706]";
        break;
      case "success":
        colorClasses =
          "border border-[#2E7D32]/60 text-[#2E7D32] hover:bg-[#2E7D32]/8 hover:border-[#2E7D32]";
        break;
      case "error":
        colorClasses =
          "border border-[#D32F2F]/60 text-[#D32F2F] hover:bg-[#D32F2F]/8 hover:border-[#D32F2F]";
        break;
      default:
        colorClasses =
          "border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800";
    }
  } else {
    // Text variant
    switch (color) {
      case "primary":
        colorClasses = "text-[#1976D2] hover:bg-[#1976D2]/8";
        break;
      case "gold":
        colorClasses = "text-[#D97706] hover:bg-[#D97706]/8";
        break;
      case "success":
        colorClasses = "text-[#2E7D32] hover:bg-[#2E7D32]/8";
        break;
      default:
        colorClasses = "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800";
    }
  }

  return (
    <button
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${colorClasses} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      {...props}
    >
      {startIcon && <span className="mr-1.5 -ml-0.5 shrink-0">{startIcon}</span>}
      <span>{children}</span>
      {endIcon && <span className="ml-1.5 -mr-0.5 shrink-0">{endIcon}</span>}
    </button>
  );
}
