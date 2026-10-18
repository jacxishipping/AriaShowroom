"use client";

import React from "react";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { Search, RotateCcw, X } from "lucide-react";
import {
  MuiTextField,
  MenuItem,
  MuiChip,
  MuiButton,
  IconButton,
} from "@/components/mui";

export function VehicleFilters() {
  const { filters, setFilter, resetFilters, language } = useShowroomStore();
  const t = translations[language];

  const hasActiveFilters =
    Boolean(filters.search) ||
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
          <MuiTextField
            sizeVariant="small"
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            placeholder={t.searchPlaceholder}
            fullWidth
            startAdornment={<Search className="h-4 w-4 text-slate-400" />}
            endAdornment={
              filters.search ? (
                <IconButton
                  size="small"
                  onClick={() => setFilter("search", "")}
                  sx={{ p: 0.5 }}
                >
                  <X className="h-3.5 w-3.5" />
                </IconButton>
              ) : undefined
            }
          />
        </div>

        {/* Compact Dropdown Selectors */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Make Filter */}
          <MuiTextField
            select
            sizeVariant="small"
            value={filters.make}
            onChange={(e) => setFilter("make", e.target.value)}
            className="min-w-[150px]"
          >
            <MenuItem value="ALL">All Makes (Toyota, Lexus)</MenuItem>
            <MenuItem value="Toyota">Toyota</MenuItem>
            <MenuItem value="Lexus">Lexus</MenuItem>
          </MuiTextField>

          {/* Body Type */}
          <MuiTextField
            select
            sizeVariant="small"
            value={filters.bodyType}
            onChange={(e) => setFilter("bodyType", e.target.value)}
            className="min-w-[150px]"
          >
            <MenuItem value="ALL">All Body Types</MenuItem>
            <MenuItem value="SUV">SUV (Land Cruiser / LX)</MenuItem>
            <MenuItem value="Sedan">Sedan (Corolla / Camry)</MenuItem>
            <MenuItem value="Pickup">Pickup (Hilux Revo)</MenuItem>
            <MenuItem value="Crossover">Crossover (RAV4)</MenuItem>
          </MuiTextField>

          {/* Origin */}
          <MuiTextField
            select
            sizeVariant="small"
            value={filters.originCountry}
            onChange={(e) => setFilter("originCountry", e.target.value)}
            className="min-w-[140px]"
          >
            <MenuItem value="ALL">All Import Origins</MenuItem>
            <MenuItem value="UAE">UAE (Dubai GCC)</MenuItem>
            <MenuItem value="USA">USA Import</MenuItem>
            <MenuItem value="Canada">Canada Import</MenuItem>
            <MenuItem value="Japan">Japan Import</MenuItem>
          </MuiTextField>

          {/* Status */}
          <MuiTextField
            select
            sizeVariant="small"
            value={filters.status}
            onChange={(e) => setFilter("status", e.target.value)}
            className="min-w-[130px]"
          >
            <MenuItem value="ALL">All Statuses</MenuItem>
            <MenuItem value="Available on Lot">{t.availableTag}</MenuItem>
            <MenuItem value="In Transit">{t.inTransitTag}</MenuItem>
            <MenuItem value="Reserved/Deposit Paid">{t.reservedTag}</MenuItem>
            <MenuItem value="Sold">{t.soldTag}</MenuItem>
          </MuiTextField>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <MuiButton
              variant="text"
              color="error"
              size="small"
              onClick={resetFilters}
              startIcon={<RotateCcw className="h-3.5 w-3.5" />}
            >
              Reset
            </MuiButton>
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
            <MuiChip
              key={preset.label}
              label={preset.label}
              clickable
              color={isSelected ? "primary" : "default"}
              size="small"
              onClick={() => {
                setFilter("minPrice", preset.min);
                setFilter("maxPrice", preset.max);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
