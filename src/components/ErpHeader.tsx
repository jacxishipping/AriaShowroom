"use client";

import React, { useState } from "react";
import { useShowroomStore, RoleType } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import {
  Search,
  DollarSign,
  Globe,
  Sun,
  Moon,
  Bell,
  Shield,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UserCheck,
} from "lucide-react";

interface ErpHeaderProps {
  onSearch?: (query: string) => void;
}

export function ErpHeader({ onSearch }: ErpHeaderProps) {
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
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 dark:border-slate-800 dark:bg-navy-900 transition-colors">
      {/* Left: Global Omni-Search Bar */}
      <div className="flex items-center gap-3 w-full max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={
              language === "ps"
                ? "د موټر VIN، سټاک کوډ، یا تذکره وپلټئ..."
                : language === "fa"
                ? "جستجوی VIN، استاک موتر، یا تذکره خریدار..."
                : "Search VIN, Stock ID, or Customer Tazkira..."
            }
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition-colors focus:border-gold focus:bg-white dark:border-slate-800 dark:bg-navy-950 dark:text-slate-100 dark:focus:border-gold"
          />
        </div>
      </div>

      {/* Right: Exchange Rate, Currency, Tri-lingual, Theme, and Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Exchange Rate Modifier (USD / AFN) */}
        <div className="relative">
          <button
            onClick={() => setIsRateEditOpen(!isRateEditOpen)}
            className="hidden md:flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            title="Click to update market exchange rate"
          >
            <span>$1 = {exchangeRate} AFN</span>
          </button>

          {isRateEditOpen && (
            <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-navy-900">
              <form onSubmit={handleSaveRate} className="space-y-2">
                <label className="block text-[10px] font-bold uppercase text-slate-400">
                  Update Herat Sarrafi Rate:
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={tempRate}
                    onChange={(e) => setTempRate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-1.5 text-xs font-mono font-bold dark:border-slate-700 dark:bg-navy-800"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-gold px-2.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-gold-light"
                  >
                    Set
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-800 dark:bg-navy-950">
          <button
            onClick={() => setCurrency("USD")}
            className={`rounded-lg px-2 py-1 text-xs font-bold transition-all ${
              currency === "USD"
                ? "bg-navy text-gold shadow-xs dark:bg-gold dark:text-slate-950"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            USD $
          </button>
          <button
            onClick={() => setCurrency("AFN")}
            className={`rounded-lg px-2 py-1 text-xs font-bold transition-all ${
              currency === "AFN"
                ? "bg-navy text-gold shadow-xs dark:bg-gold dark:text-slate-950"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            AFN ؋
          </button>
        </div>

        {/* Tri-Lingual Language Switcher */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-800 dark:bg-navy-950">
          <button
            onClick={() => setLanguage("en")}
            className={`rounded-lg px-2 py-1 text-xs font-bold transition-all ${
              language === "en"
                ? "bg-navy text-gold shadow-xs dark:bg-gold dark:text-slate-950"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage("fa")}
            className={`rounded-lg px-2 py-1 text-xs font-bold font-dari transition-all ${
              language === "fa"
                ? "bg-navy text-gold shadow-xs dark:bg-gold dark:text-slate-950"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            دری
          </button>
          <button
            onClick={() => setLanguage("ps")}
            className={`rounded-lg px-2 py-1 text-xs font-bold font-dari transition-all ${
              language === "ps"
                ? "bg-navy text-gold shadow-xs dark:bg-gold dark:text-slate-950"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            پښتو
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun className="h-4 w-4 text-gold" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* System Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gold animate-ping" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gold" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-11 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-navy-900 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold border-b pb-2 dark:border-slate-800">
                <span>Herat Lot Alerts</span>
                <span className="rounded bg-gold/15 px-1.5 py-0.5 text-[10px] text-gold font-mono">
                  3 New
                </span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <p className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                  ✓ Customs Maktoub release confirmed for Land Cruiser 300 (Islam Qala).
                </p>
                <p className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                  ⚠️ Installment payment due in 3 days: SM-CNTR-2026-089.
                </p>
                <p className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
                  🚢 In Transit: Lexus RX 350 cleared Bandar Abbas en route to Herat.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Active Staff Profile & Role Indicator */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="hidden sm:block text-right">
            <span className="text-[11px] font-bold text-slate-900 dark:text-white block leading-tight">
              {currentRole === "SuperAdmin" && "Haji Ahmad Shah Sadozai"}
              {currentRole === "SalesAgent" && "Farhad Timori"}
              {currentRole === "Accountant" && "Mirwais Saljuqi"}
            </span>
            <span className="text-[10px] font-mono text-gold block">
              {currentRole} • Herat Lot
            </span>
          </div>

          <select
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value as RoleType)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-navy-950 dark:text-gold-light outline-none"
            title="Switch Active ERP Role"
          >
            <option value="SuperAdmin">SuperAdmin</option>
            <option value="SalesAgent">Sales Agent</option>
            <option value="Accountant">Accountant</option>
          </select>
        </div>
      </div>
    </header>
  );
}
