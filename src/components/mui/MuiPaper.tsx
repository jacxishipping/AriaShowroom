"use client";

import React from "react";

export interface MuiPaperProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 0 | 1 | 2 | 3 | 4 | 8 | 16 | 24;
  variant?: "elevation" | "outlined";
  square?: boolean;
}

export function MuiPaper({
  children,
  elevation = 1,
  variant = "elevation",
  square = false,
  className = "",
  ...props
}: MuiPaperProps) {
  const elevationClasses = {
    0: "shadow-none",
    1: "shadow-mui-1",
    2: "shadow-mui-2",
    3: "shadow-mui-3",
    4: "shadow-mui-4",
    8: "shadow-mui-8",
    16: "shadow-mui-16",
    24: "shadow-mui-24",
  };

  const isOutlined = variant === "outlined";

  return (
    <div
      className={`bg-white dark:bg-[#121824] text-slate-900 dark:text-slate-100 transition-shadow ${
        square ? "rounded-none" : "rounded-lg"
      } ${
        isOutlined
          ? "border border-slate-200 dark:border-slate-800 shadow-none"
          : `${elevationClasses[elevation]} border border-slate-200/60 dark:border-slate-800/80`
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
