"use client";

import React from "react";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { Search, RotateCcw, Filter, X, Check, SlidersHorizontal } from "lucide-react";

export function VehicleFilters() {
  const { filters, setFilter, resetFilters, language } = useShowroomStore();
  const t = translations[language];

  const hasActiveFilters =
    filters.search ||
    filters.make !== "ALL" ||
    filters.bodyType !== "ALL" ||
    filters.status !== "ALL" ||
    filters.originCountry !== "ALL" ||
    filters.minPrice !== null ||
    filters.maxPrice !== null;

  const pricePresets = [
    { label: "All Prices", min: null, max: null },
    { label: "Under $40k", min: null, max: 40000 },
    { label: "$40k - $70k", min: 40000, max: 70000 },
    { label: "$70k - $100k", min: 70000, max: 100000 },
    { label: "$100k+", min: 100000, max: null },
  ];

  const isCurrentPricePreset = (preset: (typeof pricePresets)[0]) =>
    filters.minPrice === preset.min && filters.maxPrice === preset.max;

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#111827] p-3 sm:p-4 shadow-sm space-y-3">
      {/* Top Search & Primary Filters Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 transition-all"
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

        {/* Compact Dropdown Selectors */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Make Filter */}
          <select
            value={filters.make}
            onChange={(e) => setFilter("make", e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none text-xs font-semibold cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs"
          >
            <option value="ALL">All Makes (Toyota, Lexus)</option>
            <option value="Toyota">Toyota</option>
            <option value="Lexus">Lexus</option>
          </select>

          {/* Body Type */}
          <select
            value={filters.bodyType}
            onChange={(e) => setFilter("bodyType", e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none text-xs font-semibold cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs"
          >
            <option value="ALL">All Body Types</option>
            <option value="SUV">SUV (Land Cruiser / LX)</option>
            <option value="Sedan">Sedan (Corolla / Camry)</option>
            <option value="Pickup">Pickup (Hilux Revo)</option>
            <option value="Crossover">Crossover (RAV4)</option>
          </select>

          {/* Origin */}
          <select
            value={filters.originCountry}
            onChange={(e) => setFilter("originCountry", e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none text-xs font-semibold cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs"
          >
            <option value="ALL">All Import Origins</option>
            <option value="UAE">UAE (Dubai GCC)</option>
            <option value="USA">USA Import</option>
            <option value="Canada">Canada Import</option>
            <option value="Japan">Japan Import</option>
          </select>

          {/* Status */}
          <select
            value={filters.status}
            onChange={(e) => setFilter("status", e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none text-xs font-semibold cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="Available on Lot">{t.availableTag}</option>
            <option value="In Transit">{t.inTransitTag}</option>
            <option value="Reserved/Deposit Paid">{t.reservedTag}</option>
            <option value="Sold">{t.soldTag}</option>
          </select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Price Range Presets Pill Track */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
          Price Range:
        </span>
        {pricePresets.map((preset) => {
          const isSelected = isCurrentPricePreset(preset);
          return (
            <button
              key={preset.label}
              onClick={() => {
                setFilter("minPrice", preset.min);
                setFilter("maxPrice", preset.max);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                isSelected
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
