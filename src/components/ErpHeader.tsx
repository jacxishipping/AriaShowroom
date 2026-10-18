"use client";

import React, { useState } from "react";
import { useShowroomStore, RoleType } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { LotBarcodeScannerModal } from "@/components/LotBarcodeScannerModal";
import {
  Search,
  Sun,
  Moon,
  Bell,
  ScanLine,
  Check,
  ChevronDown,
} from "lucide-react";

export function ErpHeader() {
  const {
    currency,
    setCurrency,
    exchangeRate,
    setExchangeRate,
    language,
    setLanguage,
    darkMode,
    toggleDarkMode,
    currentRole,
    setCurrentRole,
    filters,
    setFilter,
  } = useShowroomStore();

  const [isRateEditOpen, setIsRateEditOpen] = useState(false);
  const [tempRate, setTempRate] = useState(exchangeRate.toString());
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const t = translations[language];

  const handleSaveRate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(tempRate);
    if (!isNaN(parsed) && parsed > 0) {
      setExchangeRate(parsed);
      setIsRateEditOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] px-4 sm:px-6 transition-colors">
      {/* Left: Search with Barcode Scanner Icon */}
      <div className="flex items-center gap-2 w-full max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={
              language === "ps"
                ? "د موټر VIN، سټاک کوډ، یا تذکره..."
                : language === "fa"
                ? "جستجوی VIN، استاک موتر، یا تذکره..."
                : "Search VIN, Stock #, Tazkira..."
            }
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            className="w-full pl-9 pr-9 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
          />
          <button
            onClick={() => setIsScannerOpen(true)}
            className="absolute right-2.5 top-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            title="Scan VIN Barcode"
          >
            <ScanLine className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Right Controls: Quiet, Elegant, Professional */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sarrafi Exchange Rate Pill */}
        <div className="relative">
          <button
            onClick={() => setIsRateEditOpen(!isRateEditOpen)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer"
            title="Click to edit Sarrafi market rate"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>$1 = {exchangeRate} AFN</span>
          </button>

          {isRateEditOpen && (
            <div className="absolute right-0 top-9 z-50 w-52 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] p-3 shadow-lg">
              <form onSubmit={handleSaveRate} className="space-y-2">
                <span className="text-[10px] font-semibold uppercase text-slate-400 block">
                  Herat Sarrafi Rate
                </span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={tempRate}
                    onChange={(e) => setTempRate(e.target.value)}
                    className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Currency Switcher */}
        <div className="inline-flex items-center rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-0.5 text-xs font-medium">
          <button
            onClick={() => setCurrency("USD")}
            className={`px-2 py-0.5 rounded transition-colors ${
              currency === "USD"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            USD
          </button>
          <button
            onClick={() => setCurrency("AFN")}
            className={`px-2 py-0.5 rounded transition-colors ${
              currency === "AFN"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            AFN
          </button>
        </div>

        {/* Language Switcher */}
        <div className="inline-flex items-center rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-0.5 text-xs font-medium">
          <button
            onClick={() => setLanguage("en")}
            className={`px-1.5 py-0.5 rounded transition-colors ${
              language === "en"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-bold"
                : "text-slate-500"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage("fa")}
            className={`px-1.5 py-0.5 rounded font-dari transition-colors ${
              language === "fa"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-bold"
                : "text-slate-500"
            }`}
          >
            دری
          </button>
          <button
            onClick={() => setLanguage("ps")}
            className={`px-1.5 py-0.5 rounded font-dari transition-colors ${
              language === "ps"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-bold"
                : "text-slate-500"
            }`}
          >
            پښتو
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Toggle Dark / Light Theme"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Role Switcher */}
        <div className="border-l border-slate-200 dark:border-slate-800 pl-2">
          <select
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value as RoleType)}
            className="px-2 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="SuperAdmin">SuperAdmin</option>
            <option value="SalesAgent">Sales Agent</option>
            <option value="Accountant">Accountant</option>
          </select>
        </div>
      </div>

      {/* Lot Barcode Scanner Modal */}
      <LotBarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </header>
  );
}
