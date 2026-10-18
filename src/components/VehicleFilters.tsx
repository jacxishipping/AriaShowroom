"use client";

import React from "react";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { Search, RotateCcw, Filter, X } from "lucide-react";

export function VehicleFilters() {
  const { filters, setFilter, resetFilters, language } = useShowroomStore();
  const t = translations[language];

  const hasActiveFilters =
    filters.search ||
    filters.make !== "ALL" ||
    filters.bodyType !== "ALL" ||
    filters.status !== "ALL" ||
    filters.originCountry !== "ALL";

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-3 shadow-2xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => setFilter("search", "")}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Compact Filter Dropdowns Row */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Make */}
          <select
            value={filters.make}
            onChange={(e) => setFilter("make", e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none text-xs font-medium cursor-pointer"
          >
            <option value="ALL">All Makes</option>
            <option value="Toyota">Toyota</option>
            <option value="Lexus">Lexus</option>
          </select>

          {/* Body Type */}
          <select
            value={filters.bodyType}
            onChange={(e) => setFilter("bodyType", e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none text-xs font-medium cursor-pointer"
          >
            <option value="ALL">All Body Types</option>
            <option value="SUV">SUV</option>
            <option value="Sedan">Sedan</option>
            <option value="Pickup">Pickup</option>
            <option value="Crossover">Crossover</option>
          </select>

          {/* Origin */}
          <select
            value={filters.originCountry}
            onChange={(e) => setFilter("originCountry", e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none text-xs font-medium cursor-pointer"
          >
            <option value="ALL">All Origins</option>
            <option value="UAE">UAE (Dubai)</option>
            <option value="USA">USA Import</option>
            <option value="Canada">Canada Import</option>
            <option value="Japan">Japan Import</option>
          </select>

          {/* Status */}
          <select
            value={filters.status}
            onChange={(e) => setFilter("status", e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none text-xs font-medium cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Available on Lot">{t.availableTag}</option>
            <option value="In Transit">{t.inTransitTag}</option>
            <option value="Reserved/Deposit Paid">{t.reservedTag}</option>
            <option value="Sold">{t.soldTag}</option>
          </select>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
