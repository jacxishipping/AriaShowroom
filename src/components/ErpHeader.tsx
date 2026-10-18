"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShowroomStore, RoleType } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { formatCurrency } from "@/lib/utils";
import { MuiButton, IconButton } from "@/components/mui";
import {
  Search,
  Sun,
  Moon,
  Bell,
  ScanLine,
  Check,
  ChevronDown,
  Plus,
  Car,
  Users,
  ShieldCheck,
  Sparkles,
  Command,
  X,
  ArrowRight,
  TrendingUp,
  ExternalLink,
} from "lucide-react";

interface ErpHeaderProps {
  onOpenIntake?: () => void;
}

export function ErpHeader({ onOpenIntake }: ErpHeaderProps) {
  const router = useRouter();
  const {
    vehicles,
    customers,
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
    addToast,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useShowroomStore();

  const [isRateEditOpen, setIsRateEditOpen] = useState(false);
  const [tempRate, setTempRate] = useState(exchangeRate.toString());
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const roleMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const t = translations[language];

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
      if (
        roleMenuRef.current &&
        !roleMenuRef.current.contains(event.target as Node)
      ) {
        setIsRoleMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global Ctrl+K / Cmd+K shortcut for search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchFocused(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSaveRate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(tempRate);
    if (!isNaN(parsed) && parsed > 0) {
      setExchangeRate(parsed);
      setIsRateEditOpen(false);
      addToast(`Herat Sarrafi rate updated to $1 = ${parsed} AFN`, "success");
    }
  };

  const handleRoleChange = (newRole: RoleType) => {
    setCurrentRole(newRole);
    setIsRoleMenuOpen(false);
    const names = {
      SuperAdmin: "Haji Ahmad Shah (SuperAdmin)",
      SalesAgent: "Farhad Timori (Sales Agent)",
      Accountant: "Mirwais Saljuqi (Accountant)",
    };
    addToast(`Switched active profile to ${names[newRole]}`, "info");
  };

  // Search Results for OmniSearch
  const searchResults = React.useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    if (!q) return { vehicles: [], customers: [] };

    const matchedVehicles = vehicles
      .filter(
        (v) =>
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.stockNumber.toLowerCase().includes(q) ||
          v.vin.toLowerCase().includes(q) ||
          v.year.toString().includes(q)
      )
      .slice(0, 5);

    const matchedCustomers = customers
      .filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.tazkiraNumber.toLowerCase().includes(q)
      )
      .slice(0, 3);

    return { vehicles: matchedVehicles, customers: matchedCustomers };
  }, [vehicles, customers, filters.search]);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const roleProfiles: Record<RoleType, { name: string; title: string; avatar: string; color: string }> = {
    SuperAdmin: {
      name: "Haji Ahmad Shah",
      title: "Showroom Proprietor & Director",
      avatar: "HA",
      color: "bg-blue-600",
    },
    SalesAgent: {
      name: "Farhad Timori",
      title: "Senior Sales & Import Agent",
      avatar: "FT",
      color: "bg-emerald-600",
    },
    Accountant: {
      name: "Mirwais Saljuqi",
      title: "Chief Financial Accountant",
      avatar: "MS",
      color: "bg-amber-600",
    },
  };

  const activeProfile = roleProfiles[currentRole];

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-[#111827]/95 px-4 sm:px-6 backdrop-blur-md transition-colors">
      {/* Left: OmniSearch Bar with Barcode Scanner Icon & Command Dropdown */}
      <div ref={searchContainerRef} className="relative w-full max-w-sm sm:max-w-md">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={
              language === "ps"
                ? "د موټر VIN، سټاک کوډ، یا تذکره..."
                : language === "fa"
                ? "جستجوی VIN، استاک موتر، یا تذکره..."
                : "Search VIN, Stock #, Customer, or Make..."
            }
            value={filters.search}
            onChange={(e) => {
              setFilter("search", e.target.value);
              setIsSearchFocused(true);
            }}
            onFocus={() => setIsSearchFocused(true)}
            className="w-full pl-9 pr-20 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            {filters.search && (
              <button
                onClick={() => setFilter("search", "")}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            )}

            <Link
              href="/scanner"
              className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1"
              title="Scan VIN Barcode"
            >
              <ScanLine className="h-3.5 w-3.5" />
            </Link>

            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
              ⌘K
            </span>
          </div>
        </div>

        {/* OmniSearch Quick Dropdown */}
        {isSearchFocused && (
          <div className="absolute left-0 right-0 top-11 z-50 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#111827]/95 p-3 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-1 max-h-[80vh] overflow-y-auto">
            {filters.search.trim() ? (
              <div className="space-y-3">
                {/* Vehicles Results */}
                {searchResults.vehicles.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                      Fleet Vehicles ({searchResults.vehicles.length})
                    </div>
                    <div className="space-y-1">
                      {searchResults.vehicles.map((v) => (
                        <Link
                          key={v.id}
                          href={`/vehicles/${v.id}`}
                          onClick={() => setIsSearchFocused(false)}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="relative h-9 w-12 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                              <Image
                                src={v.images[0]}
                                alt={v.model}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="truncate">
                              <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">
                                {v.year} {v.make} {v.model}
                              </div>
                              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                                <span className="font-semibold text-slate-600 dark:text-slate-300">
                                  {v.stockNumber}
                                </span>
                                <span>•</span>
                                <span className="text-emerald-600 dark:text-emerald-400">
                                  {v.status}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0 pl-2">
                            <div className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                              ${v.sellingPrice.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {v.originCountry} Import
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customers Results */}
                {searchResults.customers.length > 0 && (
                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                      CRM Customers ({searchResults.customers.length})
                    </div>
                    <div className="space-y-1">
                      {searchResults.customers.map((c) => (
                        <Link
                          key={c.id}
                          href="/admin"
                          onClick={() => setIsSearchFocused(false)}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            <div>
                              <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                                {c.fullName}
                              </span>
                              <span className="text-[11px] font-mono text-slate-400">
                                {c.phone} • {c.city}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                            {c.leadStage}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.vehicles.length === 0 && searchResults.customers.length === 0 && (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No vehicles or customers found for &ldquo;{filters.search}&rdquo;
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 py-1 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block">
                  Quick Showroom Actions
                </span>
                <div className="grid grid-cols-1 gap-1">
                  <Link
                    href="/intake"
                    onClick={() => setIsSearchFocused(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 text-left transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4 text-blue-600" />
                    <div>
                      <span className="font-semibold block">Add New Vehicle Intake</span>
                      <span className="text-[10px] text-slate-400">Register VIN, customs tariff, and landed costs</span>
                    </div>
                  </Link>

                  <Link
                    href="/inventory"
                    onClick={() => setIsSearchFocused(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <Car className="h-4 w-4 text-emerald-600" />
                    <div>
                      <span className="font-semibold block">Explore Vehicle Inventory</span>
                      <span className="text-[10px] text-slate-400">Browse showroom fleet with multi-criteria filters</span>
                    </div>
                  </Link>

                  <Link
                    href="/admin"
                    onClick={() => setIsSearchFocused(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <TrendingUp className="h-4 w-4 text-amber-600" />
                    <div>
                      <span className="font-semibold block">Dealership ERP & Accounting</span>
                      <span className="text-[10px] text-slate-400">P&L, Sarrafi settlements, and CRM lead progression</span>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Executive Tools & Preferences */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Quick Add Vehicle Intake Button */}
        <div className="hidden sm:block">
          <MuiButton
            component={Link}
            href="/intake"
            variant="contained"
            color="primary"
            size="small"
            startIcon={<Plus className="h-3.5 w-3.5" />}
          >
            New Intake
          </MuiButton>
        </div>

        {/* Sarrafi Exchange Rate Pill */}
        <div className="relative">
          <button
            onClick={() => setIsRateEditOpen(!isRateEditOpen)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer shadow-2xs"
            title="Click to edit Sarrafi market rate"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>$1 = {exchangeRate} AFN</span>
          </button>

          {isRateEditOpen && (
            <div className="absolute right-0 top-10 z-50 w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#111827]/95 p-3.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-1">
              <form onSubmit={handleSaveRate} className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Herat Sarrafi Rate
                  </span>
                  <span className="text-[10px] text-emerald-600 font-mono">Live Sync</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={tempRate}
                    onChange={(e) => setTempRate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shrink-0"
                  >
                    Save
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Updates dual-currency calculations across inventory & deed contracts.
                </p>
              </form>
            </div>
          )}
        </div>

        {/* Currency Switcher Pill */}
        <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-0.5 text-xs font-medium shadow-2xs">
          <button
            onClick={() => setCurrency("USD")}
            className={`px-2 py-1 rounded-lg transition-colors ${
              currency === "USD"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            USD
          </button>
          <button
            onClick={() => setCurrency("AFN")}
            className={`px-2 py-1 rounded-lg transition-colors ${
              currency === "AFN"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            AFN
          </button>
        </div>

        {/* Language Switcher */}
        <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-0.5 text-xs font-medium shadow-2xs">
          <button
            onClick={() => setLanguage("en")}
            className={`px-1.5 py-1 rounded-lg transition-colors ${
              language === "en"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-bold"
                : "text-slate-500"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage("fa")}
            className={`px-1.5 py-1 rounded-lg font-dari transition-colors ${
              language === "fa"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-bold"
                : "text-slate-500"
            }`}
          >
            دری
          </button>
          <button
            onClick={() => setLanguage("ps")}
            className={`px-1.5 py-1 rounded-lg font-dari transition-colors ${
              language === "ps"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-bold"
                : "text-slate-500"
            }`}
          >
            پښتو
          </button>
        </div>

        {/* Showroom Notifications Bell */}
        <div ref={notificationsRef} className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Activity Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#111827]/95 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-1 overflow-hidden">
              <div className="flex items-center justify-between p-3.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Showroom Activity
                  </span>
                  {unreadNotifCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                      {unreadNotifCount} new
                    </span>
                  )}
                </div>
                {unreadNotifCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-blue-600 hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                      !n.read ? "bg-blue-50/40 dark:bg-blue-950/20" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {n.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                      {n.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <IconButton
          size="small"
          onClick={toggleDarkMode}
          title="Toggle Dark / Light Theme"
        >
          {darkMode ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4" />}
        </IconButton>

        {/* Role & Staff Profile Pill */}
        <div ref={roleMenuRef} className="relative">
          <button
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className="flex items-center gap-2 p-1 pl-1.5 sm:px-2 sm:py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
          >
            <div
              className={`h-6 w-6 rounded-lg ${activeProfile.color} text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs`}
            >
              {activeProfile.avatar}
            </div>
            <div className="hidden md:block text-left truncate max-w-[110px]">
              <span className="text-xs font-bold text-slate-900 dark:text-white block truncate leading-none">
                {activeProfile.name}
              </span>
              <span className="text-[9px] text-slate-400 block truncate mt-0.5 font-medium">
                {currentRole}
              </span>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {isRoleMenuOpen && (
            <div className="absolute right-0 top-11 z-50 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#111827]/95 p-2 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5 block">
                Herat Dealership Personnel
              </span>
              <div className="space-y-1">
                {(Object.keys(roleProfiles) as RoleType[]).map((r) => {
                  const p = roleProfiles[r];
                  const isActive = currentRole === r;
                  return (
                    <button
                      key={r}
                      onClick={() => handleRoleChange(r)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors text-left cursor-pointer ${
                        isActive
                          ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`h-7 w-7 rounded-lg ${p.color} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}
                        >
                          {p.avatar}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-slate-400">{p.title}</div>
                        </div>
                      </div>
                      {isActive && <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/login"
                  onClick={() => setIsRoleMenuOpen(false)}
                  className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Staff Sign-In Portal
                  </span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

    </header>
  );
}
