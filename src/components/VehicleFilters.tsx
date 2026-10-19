"use client";

import React, { useState } from "react";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import {
  Search,
  RotateCcw,
  X,
  Filter,
  ChevronDown,
  SlidersHorizontal,
  DollarSign,
  Car,
  Globe2,
  Layers,
} from "lucide-react";

export function VehicleFilters() {
  const { vehicles, filters, setFilter, resetFilters, language } = useShowroomStore();
  const t = translations[language];
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Status counts
  const availableCount = vehicles.filter((v) => v.status === "Available on Lot").length;
  const inTransitCount = vehicles.filter((v) => v.status === "In Transit").length;
  const reservedCount = vehicles.filter((v) => v.status === "Reserved/Deposit Paid").length;
  const soldCount = vehicles.filter((v) => v.status === "Sold").length;

  const statusOptions = [
    { id: "ALL", label: t.allStatuses, count: vehicles.length },
    { id: "Available on Lot", label: t.availableTag, count: availableCount },
    { id: "In Transit", label: t.inTransitTag, count: inTransitCount },
    { id: "Reserved/Deposit Paid", label: t.reservedTag, count: reservedCount },
    { id: "Sold", label: t.soldTag, count: soldCount },
  ];

  const pricePresets = [
    { label: "All Prices", min: null, max: null },
    { label: "Under $40k", min: null, max: 40000 },
    { label: "$40k - $70k", min: 40000, max: 70000 },
    { label: "$70k - $100k", min: 70000, max: 100000 },
    { label: "$100k+", min: 100000, max: null },
  ];

  const isCurrentPricePreset = (preset: (typeof pricePresets)[0]) =>
    filters.minPrice === preset.min && filters.maxPrice === preset.max;

  // Active filter count
  const activeFiltersList: Array<{ key: string; label: string; clear: () => void }> = [];

  if (filters.search) {
    activeFiltersList.push({
      key: "search",
      label: `"${filters.search}"`,
      clear: () => setFilter("search", ""),
    });
  }
  if (filters.status !== "ALL") {
    activeFiltersList.push({
      key: "status",
      label: filters.status,
      clear: () => setFilter("status", "ALL"),
    });
  }
  if (filters.make !== "ALL") {
    activeFiltersList.push({
      key: "make",
      label: filters.make,
      clear: () => setFilter("make", "ALL"),
    });
  }
  if (filters.bodyType !== "ALL") {
    activeFiltersList.push({
      key: "bodyType",
      label: filters.bodyType,
      clear: () => setFilter("bodyType", "ALL"),
    });
  }
  if (filters.originCountry !== "ALL") {
    activeFiltersList.push({
      key: "originCountry",
      label: filters.originCountry,
      clear: () => setFilter("originCountry", "ALL"),
    });
  }
  if (filters.fuelType !== "ALL") {
    activeFiltersList.push({
      key: "fuelType",
      label: filters.fuelType,
      clear: () => setFilter("fuelType", "ALL"),
    });
  }
  if (filters.transmission !== "ALL") {
    activeFiltersList.push({
      key: "transmission",
      label: filters.transmission,
      clear: () => setFilter("transmission", "ALL"),
    });
  }
  if (filters.minPrice !== null || filters.maxPrice !== null) {
    const matchedPreset = pricePresets.find(isCurrentPricePreset);
    activeFiltersList.push({
      key: "price",
      label: matchedPreset ? matchedPreset.label : `$${filters.minPrice || 0} - $${filters.maxPrice || "Max"}`,
      clear: () => {
        setFilter("minPrice", null);
        setFilter("maxPrice", null);
      },
    });
  }

  const hasActiveFilters = activeFiltersList.length > 0;

  return (
    <div className="rounded-md border border-[#D8D5CD] dark:border-[#242A38] bg-white dark:bg-[#11141B] p-3 sm:p-3.5 space-y-3">
      {/* 1. Status Segmented Navigation Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#E2E0D8] dark:border-[#1F2430]">
        <div className="inline-flex items-center divide-x divide-[#D8D5CD] dark:divide-[#242A38] rtl:divide-x-reverse rounded border border-[#D8D5CD] dark:border-[#242A38] bg-[#FAF9F6] dark:bg-[#0D1017] overflow-x-auto scrollbar-none max-w-full">
          {statusOptions.map((opt) => {
            const isActive = filters.status === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setFilter("status", opt.id)}
                className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-[#111318] text-white dark:bg-amber-600 dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-stone-200/50 dark:hover:bg-slate-800/60 hover:text-[#111318] dark:hover:text-white"
                }`}
              >
                <span>{opt.label}</span>
                <span
                  className={`px-1 py-0.2 rounded text-[10px] font-mono tabular-nums ${
                    isActive
                      ? "bg-white/20 text-white font-bold"
                      : "bg-stone-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {opt.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Advanced Filters Toggle & Reset Button */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded border transition-colors cursor-pointer ${
              showAdvanced || filters.fuelType !== "ALL" || filters.transmission !== "ALL"
                ? "bg-[#111318] text-white border-[#111318] dark:bg-amber-600 dark:border-amber-600"
                : "border-[#D8D5CD] dark:border-[#242A38] bg-[#FAF9F6] dark:bg-[#0D1017] text-slate-600 dark:text-slate-400 hover:text-[#111318] dark:hover:text-white"
            }`}
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span>More Specs</span>
            <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
          </button>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-semibold text-rose-700 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="h-3 w-3" />
              <span>CLEAR</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Primary Faceted Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Make Selector */}
          <div className="relative">
            <select
              value={filters.make}
              onChange={(e) => setFilter("make", e.target.value)}
              className="h-8 ps-2.5 pe-7 py-1 text-xs rounded border border-[#D8D5CD] dark:border-[#242A38] bg-[#FAF9F6] dark:bg-[#0D1017] text-[#111318] dark:text-slate-200 font-medium outline-none focus:border-[#111318] dark:focus:border-amber-500 cursor-pointer appearance-none"
            >
              <option value="ALL">{t.allMakes} (Toyota, Lexus)</option>
              <option value="Toyota">Toyota</option>
              <option value="Lexus">Lexus</option>
            </select>
            <ChevronDown className="absolute end-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
          </div>

          {/* Body Type Selector */}
          <div className="relative">
            <select
              value={filters.bodyType}
              onChange={(e) => setFilter("bodyType", e.target.value)}
              className="h-8 ps-2.5 pe-7 py-1 text-xs rounded border border-[#D8D5CD] dark:border-[#242A38] bg-[#FAF9F6] dark:bg-[#0D1017] text-[#111318] dark:text-slate-200 font-medium outline-none focus:border-[#111318] dark:focus:border-amber-500 cursor-pointer appearance-none"
            >
              <option value="ALL">{t.body}: All</option>
              <option value="SUV">SUV (Land Cruiser / LX)</option>
              <option value="Sedan">Sedan (Corolla / Camry)</option>
              <option value="Pickup">Pickup (Hilux Revo)</option>
              <option value="Crossover">Crossover (RAV4)</option>
            </select>
            <ChevronDown className="absolute end-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
          </div>

          {/* Origin Country Selector */}
          <div className="relative">
            <select
              value={filters.originCountry}
              onChange={(e) => setFilter("originCountry", e.target.value)}
              className="h-8 ps-2.5 pe-7 py-1 text-xs rounded border border-[#D8D5CD] dark:border-[#242A38] bg-[#FAF9F6] dark:bg-[#0D1017] text-[#111318] dark:text-slate-200 font-medium outline-none focus:border-[#111318] dark:focus:border-amber-500 cursor-pointer appearance-none"
            >
              <option value="ALL">{t.allOrigins}</option>
              <option value="UAE">UAE (Dubai GCC)</option>
              <option value="USA">USA Import</option>
              <option value="Canada">Canada Import</option>
              <option value="Japan">Japan Import</option>
            </select>
            <ChevronDown className="absolute end-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Price Presets */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 font-mono">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 shrink-0 me-1">
            {t.priceRange}:
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
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer border ${
                  isSelected
                    ? "bg-[#111318] text-white border-[#111318] dark:bg-amber-600 dark:border-amber-600 font-semibold"
                    : "border-[#D8D5CD] dark:border-[#242A38] bg-[#FAF9F6] dark:bg-[#0D1017] text-slate-600 dark:text-slate-400 hover:text-[#111318] dark:hover:text-white"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Advanced Filters Collapsible Row (Fuel, Transmission) */}
      {showAdvanced && (
        <div className="p-2.5 rounded bg-[#FAF9F6] dark:bg-[#0D1017] border border-[#E2E0D8] dark:border-[#1F2430] flex flex-wrap items-center gap-3 text-xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            POWERTRAIN:
          </span>

          {/* Fuel Type */}
          <div className="relative">
            <select
              value={filters.fuelType}
              onChange={(e) => setFilter("fuelType", e.target.value)}
              className="h-7 ps-2 pe-6 text-[11px] rounded border border-[#D8D5CD] dark:border-[#242A38] bg-white dark:bg-[#11141B] text-[#111318] dark:text-slate-300 outline-none cursor-pointer appearance-none"
            >
              <option value="ALL">All Fuel Types</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybrid">Hybrid</option>
            </select>
            <ChevronDown className="absolute end-1.5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Transmission */}
          <div className="relative">
            <select
              value={filters.transmission}
              onChange={(e) => setFilter("transmission", e.target.value)}
              className="h-7 ps-2 pe-6 text-[11px] rounded border border-[#D8D5CD] dark:border-[#242A38] bg-white dark:bg-[#11141B] text-[#111318] dark:text-slate-300 outline-none cursor-pointer appearance-none"
            >
              <option value="ALL">All Transmissions</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
            <ChevronDown className="absolute end-1.5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* 4. Active Filter Badges Row */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[#E2E0D8] dark:border-[#1F2430] font-mono">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
            ACTIVE FILTERS:
          </span>
          {activeFiltersList.map((item) => (
            <span
              key={item.key}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FAF9F6] dark:bg-[#0D1017] text-[#111318] dark:text-amber-400 border border-[#D8D5CD] dark:border-[#242A38]"
            >
              <span>{item.label}</span>
              <button
                onClick={item.clear}
                className="hover:text-rose-500 rounded p-0.5 cursor-pointer"
                title="Remove filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
