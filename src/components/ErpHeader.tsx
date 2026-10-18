"use client";

import React, { useState } from "react";
import { useShowroomStore, RoleType } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { LotBarcodeScannerModal } from "@/components/LotBarcodeScannerModal";
import { MuiChip, MuiButton } from "@/components/mui";
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
  ScanLine,
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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 dark:border-slate-800/80 dark:bg-[#121824]/95 backdrop-blur-sm shadow-mui-1 transition-colors">
      {/* Left: Material Outlined Search Field & Camera Scanner */}
      <div className="flex items-center gap-2 w-full max-w-md">
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
            className="w-full rounded-md border border-slate-300 bg-slate-50/50 py-1.5 pl-9 pr-9 text-xs font-normal text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-[#1976D2] focus:bg-white focus:ring-1 focus:ring-[#1976D2] dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-[#42A5F5] dark:focus:bg-[#121824]"
          />
          <button
            onClick={() => setIsScannerOpen(true)}
            className="absolute right-2 top-1.5 p-1 text-slate-400 hover:text-[#D97706] dark:hover:text-[#F59E0B] transition-colors cursor-pointer"
            title="Scan VIN Barcode or Windshield Sticker (اسکن بارکد)"
          >
            <ScanLine className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Right: Exchange Rate Chip, Currency Toggle, Tri-lingual, Theme, and Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Sarrafi Exchange Rate Chip */}
        <div className="relative">
          <button
            onClick={() => setIsRateEditOpen(!isRateEditOpen)}
            className="cursor-pointer"
            title="Click to update market exchange rate"
          >
            <MuiChip
              variant="outlined"
              color="success"
              size="medium"
              label={`$1 = ${exchangeRate} AFN`}
              className="font-mono font-bold"
            />
          </button>

          {isRateEditOpen && (
            <div className="absolute right-0 top-11 z-50 w-56 rounded-lg border border-slate-200 bg-white p-3 shadow-mui-8 dark:border-slate-800 dark:bg-[#121824]">
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
                    className="w-full rounded border border-slate-300 px-2 py-1 text-xs font-mono dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="rounded bg-[#1976D2] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#115293]"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Currency Switcher (USD / AFN Material Segmented) */}
        <div className="flex items-center rounded-md border border-slate-300 p-0.5 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60">
          <button
            onClick={() => setCurrency("USD")}
            className={`rounded px-2 py-0.5 text-xs font-bold transition-all ${
              currency === "USD"
                ? "bg-[#1976D2] text-white shadow-2xs"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            USD ($)
          </button>
          <button
            onClick={() => setCurrency("AFN")}
            className={`rounded px-2 py-0.5 text-xs font-bold transition-all ${
              currency === "AFN"
                ? "bg-[#1976D2] text-white shadow-2xs"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            AFN (؋)
          </button>
        </div>

        {/* Tri-Lingual Language Switcher */}
        <div className="flex items-center rounded-md border border-slate-300 p-0.5 dark:border-slate-700 text-xs font-bold bg-slate-50 dark:bg-slate-900/60">
          <button
            onClick={() => setLanguage("en")}
            className={`rounded px-1.5 py-0.5 ${
              language === "en" ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900" : "text-slate-500"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage("fa")}
            className={`rounded px-1.5 py-0.5 ${
              language === "fa" ? "bg-[#D97706] text-white font-dari" : "text-slate-500 font-dari"
            }`}
          >
            دری
          </button>
          <button
            onClick={() => setLanguage("ps")}
            className={`rounded px-1.5 py-0.5 ${
              language === "ps" ? "bg-[#D97706] text-white font-dari" : "text-slate-500 font-dari"
            }`}
          >
            پښتو
          </button>
        </div>

        {/* Theme Toggle (Material IconButton) */}
        <button
          onClick={toggleDarkMode}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors cursor-pointer"
          title="Toggle Light / Dark Material Theme"
        >
          {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications Icon with Badge */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#D32F2F] ring-2 ring-white dark:ring-[#121824]" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-11 z-50 w-80 rounded-lg border border-slate-200 bg-white p-4 shadow-mui-16 dark:border-slate-800 dark:bg-[#121824]">
              <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Showroom Alerts
                </span>
                <span className="text-[10px] font-semibold text-[#1976D2]">Mark all read</span>
              </div>
              <div className="mt-3 space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5 rounded-md bg-amber-500/10 p-2 dark:bg-amber-500/15">
                  <AlertTriangle className="h-4 w-4 text-[#ED6C02] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      Islam Qala Customs Inspection Due
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Stock #SM-HRT-101 requires Maktoub clearance stamp validation.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher (Material Select) */}
        <div className="border-l border-slate-200 dark:border-slate-800 pl-2">
          <select
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value as RoleType)}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-[#121824] dark:text-slate-200 outline-none focus:border-[#1976D2] cursor-pointer"
            title="Switch Active ERP Role"
          >
            <option value="SuperAdmin">SuperAdmin</option>
            <option value="SalesAgent">Sales Agent</option>
            <option value="Accountant">Accountant</option>
          </select>
        </div>
      </div>

      {/* Lot Walk VIN / Barcode Scanner Modal */}
      <LotBarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </header>
  );
}
