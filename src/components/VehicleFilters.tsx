"use client";

import React, { useState } from "react";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import {
  RotateCcw,
  X,
  ChevronDown,
  SlidersHorizontal,
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

  const activeFiltersList: Array<{ key: string; label: string; clear: () => void }> = [];

  if (filters.search) {
    activeFiltersList.push({
      key: "search",
      label: `Search: "${filters.search}"`,
      clear: () => setFilter("search", ""),
    });
  }
  if (filters.status !== "ALL") {
    activeFiltersList.push({
      key: "status",
      label: `Status: ${filters.status}`,
      clear: () => setFilter("status", "ALL"),
    });
  }
  if (filters.make !== "ALL") {
    activeFiltersList.push({
      key: "make",
      label: `Make: ${filters.make}`,
      clear: () => setFilter("make", "ALL"),
    });
  }
  if (filters.bodyType !== "ALL") {
    activeFiltersList.push({
      key: "bodyType",
      label: `Body: ${filters.bodyType}`,
      clear: () => setFilter("bodyType", "ALL"),
    });
  }
  if (filters.originCountry !== "ALL") {
    activeFiltersList.push({
      key: "originCountry",
      label: `Origin: ${filters.originCountry}`,
      clear: () => setFilter("originCountry", "ALL"),
    });
  }
  if (filters.fuelType !== "ALL") {
    activeFiltersList.push({
      key: "fuelType",
      label: `Fuel: ${filters.fuelType}`,
      clear: () => setFilter("fuelType", "ALL"),
    });
  }
  if (filters.transmission !== "ALL") {
    activeFiltersList.push({
      key: "transmission",
      label: `Transmission: ${filters.transmission}`,
      clear: () => setFilter("transmission", "ALL"),
    });
  }
  if (filters.minPrice !== null || filters.maxPrice !== null) {
    const matchedPreset = pricePresets.find(isCurrentPricePreset);
    activeFiltersList.push({
      key: "price",
      label: matchedPreset
        ? matchedPreset.label
        : `$${filters.minPrice || 0} - $${filters.maxPrice || "Max"}`,
      clear: () => {
        setFilter("minPrice", null);
        setFilter("maxPrice", null);
      },
    });
  }

  const hasActiveFilters = activeFiltersList.length > 0;

  return (
    <div className="rounded-lg border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] p-3 sm:p-3.5 space-y-3">
      {/* 1. Status Segmented Filter Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100 dark:border-[#262F40]">
        <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#0F141C] overflow-x-auto scrollbar-none max-w-full">
          {statusOptions.map((opt) => {
            const isActive = filters.status === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setFilter("status", opt.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-white dark:bg-[#161B26] text-[#1A73E8] dark:text-[#8AB4F8] font-semibold shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>{opt.label}</span>
                <span className="font-mono tabular-nums text-[10px] opacity-75">
                  ({opt.count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Advanced Filters Toggle & Reset Button */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-colors cursor-pointer whitespace-nowrap ${
              showAdvanced || filters.fuelType !== "ALL" || filters.transmission !== "ALL"
                ? "bg-[#1A73E8] text-white border-[#1A73E8]"
                : "border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#121722] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span>More Specs</span>
            <ChevronDown
              className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
            />
          </button>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer whitespace-nowrap"
              title="Reset all filters"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Clear</span>
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
              className="h-8 ps-2.5 pe-7 py-1 text-xs rounded-md border border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#121722] text-slate-800 dark:text-slate-200 font-medium outline-none focus:border-[#1A73E8] cursor-pointer appearance-none"
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
              className="h-8 ps-2.5 pe-7 py-1 text-xs rounded-md border border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#121722] text-slate-800 dark:text-slate-200 font-medium outline-none focus:border-[#1A73E8] cursor-pointer appearance-none"
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
              className="h-8 ps-2.5 pe-7 py-1 text-xs rounded-md border border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#121722] text-slate-800 dark:text-slate-200 font-medium outline-none focus:border-[#1A73E8] cursor-pointer appearance-none"
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
          <span className="text-[11px] font-medium text-slate-400 shrink-0 me-1">
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
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer border ${
                  isSelected
                    ? "bg-[#1A73E8] text-white border-[#1A73E8] font-semibold"
                    : "border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#121722] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Advanced Filters Collapsible Row */}
      {showAdvanced && (
        <div className="p-2.5 rounded-md bg-slate-50 dark:bg-[#121722] border border-slate-200 dark:border-[#262F40] flex flex-wrap items-center gap-3 text-xs">
          <span className="text-[11px] font-semibold text-slate-500">Powertrain:</span>

          <div className="relative">
            <select
              value={filters.fuelType}
              onChange={(e) => setFilter("fuelType", e.target.value)}
              className="h-7 ps-2 pe-6 text-[11px] rounded border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] text-slate-800 dark:text-slate-200 outline-none cursor-pointer appearance-none"
            >
              <option value="ALL">All Fuel Types</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybrid">Hybrid</option>
            </select>
            <ChevronDown className="absolute end-1.5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filters.transmission}
              onChange={(e) => setFilter("transmission", e.target.value)}
              className="h-7 ps-2 pe-6 text-[11px] rounded border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] text-slate-800 dark:text-slate-200 outline-none cursor-pointer appearance-none"
            >
              <option value="ALL">All Transmissions</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
            <ChevronDown className="absolute end-1.5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* 4. Active Filter Tokens Row */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100 dark:border-[#262F40] font-mono">
          <span className="text-[11px] text-slate-400 font-semibold">Active filters:</span>
          {activeFiltersList.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={item.clear}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#1A73E8]/10 text-[#1A73E8] dark:text-[#8AB4F8] border border-[#1A73E8]/20 hover:bg-[#1A73E8]/20 cursor-pointer"
              title="Click to remove filter"
            >
              <span>{item.label}</span>
              <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
