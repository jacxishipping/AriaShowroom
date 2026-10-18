"use client";

import React from "react";

export interface MuiTabItem {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

interface MuiTabsProps {
  value: string;
  onChange: (value: string) => void;
  tabs: MuiTabItem[];
  color?: "primary" | "gold";
  className?: string;
}

export function MuiTabs({
  value,
  onChange,
  tabs,
  color = "gold",
  className = "",
}: MuiTabsProps) {
  const activeColorClasses =
    color === "gold" ? "text-[#D97706]" : "text-[#1976D2]";

  const indicatorClasses =
    color === "gold" ? "bg-[#D97706]" : "bg-[#1976D2]";

  return (
    <div
      className={`relative flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`relative flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-[0.02857em] transition-colors whitespace-nowrap cursor-pointer select-none ${
              isActive
                ? `${activeColorClasses} font-bold`
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="ml-1 rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.2 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                {tab.badge}
              </span>
            )}
            {/* Material bottom sliding indicator line */}
            {isActive && (
              <span
                className={`absolute bottom-0 inset-x-0 h-[2.5px] rounded-t-full ${indicatorClasses}`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
