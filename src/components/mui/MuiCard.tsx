"use client";

import React from "react";
import { MuiPaper, MuiPaperProps } from "./MuiPaper";

export function MuiCard({
  children,
  elevation = 1,
  variant = "elevation",
  className = "",
  ...props
}: MuiPaperProps) {
  return (
    <MuiPaper
      elevation={elevation}
      variant={variant}
      className={`overflow-hidden transition-all hover:shadow-mui-2 ${className}`}
      {...props}
    >
      {children}
    </MuiPaper>
  );
}

export function MuiCardHeader({
  avatar,
  action,
  title,
  subheader,
  className = "",
}: {
  avatar?: React.ReactNode;
  action?: React.ReactNode;
  title: React.ReactNode;
  subheader?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between p-4 pb-2 ${className}`}>
      <div className="flex items-center gap-3">
        {avatar && <div className="shrink-0">{avatar}</div>}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
            {title}
          </h4>
          {subheader && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {subheader}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function MuiCardContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`p-4 pt-2 ${className}`}>{children}</div>;
}

export function MuiCardActions({
  children,
  disableSpacing = false,
  className = "",
}: {
  children: React.ReactNode;
  disableSpacing?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center p-3 pt-0 border-t border-slate-100 dark:border-slate-800/80 ${
        disableSpacing ? "" : "gap-2"
      } ${className}`}
    >
      {children}
    </div>
  );
}
