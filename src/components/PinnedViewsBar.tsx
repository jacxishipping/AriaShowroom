"use client";

import React, { useState } from "react";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { Bookmark, Plus, X, Check, RotateCcw } from "lucide-react";

export function PinnedViewsBar() {
  const {
    pinnedViews,
    activePinnedViewId,
    applyPinnedView,
    savePinnedView,
    deletePinnedView,
    resetFilters,
    language,
  } = useShowroomStore();
  const t = translations[language];

  const [isSaving, setIsSaving] = useState(false);
  const [viewName, setViewName] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewName.trim()) return;
    savePinnedView(viewName);
    setViewName("");
    setIsSaving(false);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] px-3 py-2">
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none max-w-full">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 pe-1 shrink-0">
          <Bookmark className="h-3.5 w-3.5 text-[#1A73E8] dark:text-[#8AB4F8]" />
          <span>{t.pinnedViewsLabel}:</span>
        </span>

        {pinnedViews.map((view) => {
          const isActive = activePinnedViewId === view.id;
          const label =
            language === "fa" && view.nameFa
              ? view.nameFa
              : language === "ps" && view.namePs
              ? view.namePs
              : view.name;

          return (
            <div key={view.id} className="inline-flex items-center shrink-0">
              <button
                type="button"
                onClick={() => applyPinnedView(view.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[#1A73E8] text-white font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                }`}
              >
                {label}
              </button>
              {!view.isSystem && (
                <button
                  type="button"
                  onClick={() => deletePinnedView(view.id)}
                  className="ms-0.5 p-1 text-slate-400 hover:text-rose-600 rounded"
                  title={t.pinnedRemoveCustom}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Save Current Filter as Pinned View */}
      <div className="flex items-center gap-2 shrink-0">
        {isSaving ? (
          <form onSubmit={handleSave} className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder={t.pinnedViewPlaceholder}
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              className="h-7 w-48 rounded border border-[#1A73E8] bg-slate-50 dark:bg-[#0F141C] px-2 text-xs text-slate-900 dark:text-white outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="h-7 px-2 rounded bg-[#1A73E8] text-white text-xs font-semibold flex items-center gap-1"
            >
              <Check className="h-3 w-3" /> {t.pinnedSave}
            </button>
            <button
              type="button"
              onClick={() => setIsSaving(false)}
              className="h-7 px-1.5 rounded text-slate-400 hover:text-slate-700"
              title={t.pinnedCancelSave}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </form>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setIsSaving(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-[#262F40] text-xs font-semibold text-[#1A73E8] dark:text-[#8AB4F8] hover:bg-[#1A73E8]/[0.05] whitespace-nowrap cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              <span>{t.pinnedCurrentFilter}</span>
            </button>
            {activePinnedViewId !== "all-fleet" && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white whitespace-nowrap cursor-pointer"
                title={t.pinnedResetTitle}
              >
                <RotateCcw className="h-3 w-3" />
                <span>{t.pinnedReset}</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
