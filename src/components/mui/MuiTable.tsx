"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function MuiTableContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`w-full overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121824] shadow-mui-1 ${className}`}
    >
      {children}
    </div>
  );
}

export function MuiTable({
  children,
  dense = true,
  className = "",
}: {
  children: React.ReactNode;
  dense?: boolean;
  className?: string;
}) {
  return (
    <table
      className={`w-full border-collapse text-left ${
        dense ? "text-xs" : "text-sm"
      } ${className}`}
    >
      {children}
    </table>
  );
}

export function MuiTableHead({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <thead
      className={`bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-300 ${className}`}
    >
      {children}
    </thead>
  );
}

export function MuiTableBody({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tbody
      className={`divide-y divide-slate-100 dark:divide-slate-800/80 font-normal ${className}`}
    >
      {children}
    </tbody>
  );
}

export function MuiTableRow({
  children,
  hover = true,
  selected = false,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & {
  hover?: boolean;
  selected?: boolean;
}) {
  return (
    <tr
      className={`transition-colors ${
        selected
          ? "bg-[#1976D2]/8 dark:bg-[#1976D2]/15"
          : hover
          ? "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export function MuiTableCell({
  children,
  align = "left",
  header = false,
  className = "",
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement> & {
  align?: "left" | "center" | "right";
  header?: boolean;
}) {
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const Component = header ? "th" : "td";

  return (
    <Component
      className={`p-3.5 ${alignClasses[align]} ${
        header
          ? "text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
          : "text-slate-800 dark:text-slate-200"
      } ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export function MuiTablePagination({
  count,
  page,
  rowsPerPage,
  onPageChange,
  className = "",
}: {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  className?: string;
}) {
  const start = count === 0 ? 0 : page * rowsPerPage + 1;
  const end = Math.min((page + 1) * rowsPerPage, count);
  const totalPages = Math.ceil(count / rowsPerPage);

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-[#121824] ${className}`}
    >
      <div className="flex items-center gap-2">
        <span>Rows per page: {rowsPerPage}</span>
      </div>

      <div className="flex items-center gap-4">
        <span>
          {start}–{end} of {count}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
