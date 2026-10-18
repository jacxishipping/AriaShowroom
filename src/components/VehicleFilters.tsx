"use client";

import React from "react";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { Search, RotateCcw, Filter, Car, Fuel, Globe2, Compass } from "lucide-react";

export function VehicleFilters() {
  const { filters, setFilter, resetFilters, language } = useShowroomStore();
  const t = translations[language];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-navy-900">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gold" />
          <h3 className="font-bold text-slate-900 dark:text-white">
            {t.filterTitle}
          </h3>
        </div>
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-gold dark:text-slate-400 dark:hover:text-gold transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>{t.clearFilters}</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-gold focus:bg-white dark:border-slate-800 dark:bg-navy-800 dark:text-white dark:focus:border-gold"
          />
        </div>
      </div>

      {/* Grid of Select Dropdowns */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {/* Make */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Make
          </label>
          <select
            value={filters.make}
            onChange={(e) => setFilter("make", e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-gold dark:border-slate-800 dark:bg-navy-800 dark:text-slate-200"
          >
            <option value="ALL">{t.allMakes}</option>
            <option value="Toyota">Toyota</option>
            <option value="Lexus">Lexus</option>
          </select>
        </div>

        {/* Body Type */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {t.body}
          </label>
          <select
            value={filters.bodyType}
            onChange={(e) => setFilter("bodyType", e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-gold dark:border-slate-800 dark:bg-navy-800 dark:text-slate-200"
          >
            <option value="ALL">All Body Types</option>
            <option value="SUV">SUV (Land Cruiser / LX)</option>
            <option value="Sedan">Sedan (Corolla / Camry)</option>
            <option value="Pickup">Pickup (Hilux Rocco)</option>
            <option value="Crossover">Crossover (RX 350)</option>
          </select>
        </div>

        {/* Fuel Type */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {t.fuel}
          </label>
          <select
            value={filters.fuelType}
            onChange={(e) => setFilter("fuelType", e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-gold dark:border-slate-800 dark:bg-navy-800 dark:text-slate-200"
          >
            <option value="ALL">{t.allFuelTypes}</option>
            <option value="Petrol">Petrol</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Diesel">Diesel</option>
          </select>
        </div>

        {/* Origin Country */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {t.origin}
          </label>
          <select
            value={filters.originCountry}
            onChange={(e) => setFilter("originCountry", e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-gold dark:border-slate-800 dark:bg-navy-800 dark:text-slate-200"
          >
            <option value="ALL">{t.allOrigins}</option>
            <option value="UAE">UAE (Dubai Import)</option>
            <option value="USA">USA Import</option>
            <option value="Canada">Canada Import</option>
            <option value="Japan">Japan Import</option>
            <option value="Europe">Europe Import</option>
          </select>
        </div>

        {/* Steering Side */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {t.steering}
          </label>
          <select
            value={filters.steering}
            onChange={(e) => setFilter("steering", e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-gold dark:border-slate-800 dark:bg-navy-800 dark:text-slate-200"
          >
            <option value="ALL">{t.allSteering}</option>
            <option value="Left-Hand Drive (LHD)">Original Left-Hand (LHD)</option>
            <option value="Right-Hand Drive (RHD Converted)">RHD Converted</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilter("status", e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-gold dark:border-slate-800 dark:bg-navy-800 dark:text-slate-200"
          >
            <option value="ALL">{t.allStatuses}</option>
            <option value="Available on Lot">{t.availableTag}</option>
            <option value="Reserved/Deposit Paid">{t.reservedTag}</option>
            <option value="In Transit">{t.inTransitTag}</option>
            <option value="Under Prep/Maintenance">{t.underPrepTag}</option>
            <option value="Sold">{t.soldTag}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
