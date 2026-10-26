"use client";

import React, { useEffect } from "react";
import { CheckSquare, Download, X, Tag, TrendingUp } from "lucide-react";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";

export interface BatchStatusOption {
  label: string;
  value: string;
}

interface FloatingBatchToolbarProps {
  selectedCount: number;
  entityLabel: string;
  statusLabel?: string;
  statusOptions: BatchStatusOption[];
  onApplyStatus: (status: string) => void;
  onExportCSV: () => void;
  onClearSelection: () => void;
  onAdjustPrice?: (percentDelta: number) => void;
}

export function FloatingBatchToolbar({
  selectedCount,
  entityLabel,
  statusLabel = "Update Status",
  statusOptions,
  onApplyStatus,
  onExportCSV,
  onClearSelection,
  onAdjustPrice,
}: FloatingBatchToolbarProps) {
  const { language, compareIds, currentRole } = useShowroomStore();
  const t = translations[language];

  useEffect(() => {
    if (selectedCount === 0) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClearSelection();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCount, onClearSelection]);

  if (selectedCount === 0) return null;

  const hasCompareBar = compareIds.length > 0;

  return (
    <div
      role="region"
      aria-label={t.toolbarBatchActions
        .replace("{count}", String(selectedCount))
        .replace("{entity}", entityLabel)}
      className={`fixed ${
        hasCompareBar ? "bottom-24" : "bottom-5"
      } left-1/2 -translate-x-1/2 z-40 max-w-[95vw] overflow-x-auto bg-[#0F172A] dark:bg-[#1E293B] text-white px-4 py-2.5 rounded-xl shadow-2xl border border-[#334155] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-150 print:hidden`}
    >
      {/* Selected Count Badge */}
      <div className="flex items-center gap-2 pe-3 border-e border-slate-700 shrink-0">
        <span className="inline-flex items-center justify-center h-6 min-w-6 px-1.5 rounded-md bg-primary text-xs font-mono font-bold text-white shadow-xs tabular-nums">
          {selectedCount}
        </span>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-100 leading-tight flex items-center gap-1">
            <CheckSquare className="h-3 w-3 text-[#8AB4F8]" />
            {t.toolbarSelectedEntity.replace("{entity}", entityLabel)}
          </span>
          <span className="text-[10px] text-slate-400 font-mono leading-tight">
            {t.toolbarBatchActive}
          </span>
        </div>
      </div>

      {/* Bulk Status Updates */}
      <div className="flex items-center gap-1.5 pe-3 border-e border-slate-700 shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 me-1 flex items-center gap-1">
          <Tag className="h-3 w-3 text-[#8AB4F8]" />
          {statusLabel}:
        </span>
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onApplyStatus(opt.value)}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 hover:bg-primary text-slate-200 hover:text-white border border-slate-700 hover:border-primary transition-colors cursor-pointer whitespace-nowrap"
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Bulk Price Repricing (SuperAdmin only) */}
      {onAdjustPrice && currentRole === "SuperAdmin" && (
        <div className="flex items-center gap-1 pe-3 border-e border-slate-700 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 me-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-emerald-400" />
            {t.toolbarReprice}:
          </span>
          <button
            type="button"
            onClick={() => onAdjustPrice(-2)}
            className="px-2 py-1 rounded-md text-[11px] font-mono tabular-nums font-semibold bg-slate-800 hover:bg-amber-600/80 text-amber-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title={`${t.toolbarReprice}: -2%`}
          >
            -2%
          </button>
          <button
            type="button"
            onClick={() => onAdjustPrice(2)}
            className="px-2 py-1 rounded-md text-[11px] font-mono tabular-nums font-semibold bg-slate-800 hover:bg-emerald-600/80 text-emerald-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title={`${t.toolbarReprice}: +2%`}
          >
            +2%
          </button>
        </div>
      )}

      {/* Bulk CSV Export */}
      <button
        type="button"
        onClick={onExportCSV}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-primary hover:opacity-90 text-white shadow-xs transition-colors cursor-pointer shrink-0 tabular-nums"
      >
        <Download className="h-3.5 w-3.5" />
        {t.toolbarExportCsv} ({selectedCount})
      </button>

      {/* Clear Selection */}
      <button
        type="button"
        onClick={onClearSelection}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
        title={t.toolbarClearSelection}
        aria-label={t.toolbarClearSelection}
      >
        <X className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{t.toolbarDeselect}</span>
        <kbd className="hidden md:inline-block ms-1 px-1 py-0.5 text-[9px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
          Esc
        </kbd>
      </button>
    </div>
  );
}
