"use client";

import React from "react";
import { X } from "lucide-react";

export interface MuiChipProps {
  label: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "filled" | "outlined";
  color?: "default" | "primary" | "gold" | "success" | "warning" | "error" | "info";
  size?: "small" | "medium";
  onDelete?: () => void;
  className?: string;
  onClick?: () => void;
}

export function MuiChip({
  label,
  icon,
  variant = "filled",
  color = "default",
  size = "small",
  onDelete,
  className = "",
  onClick,
}: MuiChipProps) {
  const isSmall = size === "small";

  const sizeClasses = isSmall
    ? "h-6 px-2 text-[11px] gap-1"
    : "h-8 px-3 text-xs gap-1.5";

  let colorClasses = "";

  if (variant === "filled") {
    switch (color) {
      case "primary":
        colorClasses = "bg-[#1976D2] text-white";
        break;
      case "gold":
        colorClasses = "bg-[#D97706] text-white";
        break;
      case "success":
        colorClasses = "bg-[#2E7D32]/12 text-[#2E7D32] dark:bg-[#2E7D32]/25 dark:text-emerald-300 font-semibold";
        break;
      case "warning":
        colorClasses = "bg-[#ED6C02]/12 text-[#ED6C02] dark:bg-[#ED6C02]/25 dark:text-amber-300 font-semibold";
        break;
      case "error":
        colorClasses = "bg-[#D32F2F]/12 text-[#D32F2F] dark:bg-[#D32F2F]/25 dark:text-red-300 font-semibold";
        break;
      case "info":
        colorClasses = "bg-[#0288D1]/12 text-[#0288D1] dark:bg-[#0288D1]/25 dark:text-sky-300 font-semibold";
        break;
      default:
        colorClasses = "bg-slate-200/80 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
    }
  } else {
    // Outlined
    switch (color) {
      case "primary":
        colorClasses = "border border-[#1976D2] text-[#1976D2] bg-transparent";
        break;
      case "gold":
        colorClasses = "border border-[#D97706] text-[#D97706] bg-transparent";
        break;
      case "success":
        colorClasses = "border border-[#2E7D32] text-[#2E7D32] bg-transparent";
        break;
      case "warning":
        colorClasses = "border border-[#ED6C02] text-[#ED6C02] bg-transparent";
        break;
      case "error":
        colorClasses = "border border-[#D32F2F] text-[#D32F2F] bg-transparent";
        break;
      default:
        colorClasses = "border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300 bg-transparent";
    }
  }

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full font-medium select-none whitespace-nowrap transition-colors ${
        onClick ? "cursor-pointer hover:brightness-95" : "cursor-default"
      } ${sizeClasses} ${colorClasses} ${className}`}
    >
      {icon && <span className="shrink-0 -ml-0.5">{icon}</span>}
      <span className="truncate">{label}</span>
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="ml-0.5 -mr-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
