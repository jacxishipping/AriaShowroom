"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShowroomStore, RoleType } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { Dialog, DialogContent } from "@/components/mui";
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
  X,
  TrendingUp,
  ExternalLink,
  Menu,
  Globe,
  Banknote,
  Eye,
  EyeOff,
  Building2,
  Keyboard,
  Calculator,
  PanelRightOpen,
} from "lucide-react";

interface ErpHeaderProps {
  onOpenIntake?: () => void;
}

const BRANCH_LOCATIONS = [
  "Herat HQ · Bagh-e-Azadi",
  "Islam Qala Customs Terminal",
  "Kabul Shahr-e-Naw Desk",
];

const OMNIBOX_TOKEN_SUGGESTIONS = [
  { label: "status:available", key: "status", val: "Available on Lot" },
  { label: "status:transit", key: "status", val: "In Transit" },
  { label: "origin:Japan", key: "originCountry", val: "Japan" },
  { label: "origin:UAE", key: "originCountry", val: "UAE" },
  { label: "fuel:Hybrid", key: "fuelType", val: "Hybrid" },
  { label: "make:Toyota", key: "make", val: "Toyota" },
  { label: "make:Lexus", key: "make", val: "Lexus" },
];

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
    resetFilters,
    addToast,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    toggleMobileDrawer,
    clientPresentationMode,
    toggleClientPresentationMode,
    activeBranch,
    setActiveBranch,
    setInspectedVehicleId,
    setIsShortcutsModalOpen,
  } = useShowroomStore();

  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);
  const [isRateEditOpen, setIsRateEditOpen] = useState(false);
  const [tempRate, setTempRate] = useState(exchangeRate.toString());
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  // Spotlight Command Palette State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [commandCategory, setCommandCategory] = useState<
    "all" | "vehicles" | "customers" | "actions" | "sarrafi"
  >("all");

  const branchMenuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const roleMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const rateEditRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const t = translations[language];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (branchMenuRef.current && !branchMenuRef.current.contains(event.target as Node)) {
        setIsBranchMenuOpen(false);
      }
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
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setIsRoleMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
      if (rateEditRef.current && !rateEditRef.current.contains(event.target as Node)) {
        setIsRateEditOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global Ctrl+K / Cmd+K shortcut for command palette
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
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

  // Parse structured Omnibox input tokens (e.g. "origin:Japan", "fuel:Hybrid", "make:Toyota")
  const handleOmniboxInput = (raw: string) => {
    const lower = raw.trim().toLowerCase();
    if (lower === "status:available" || lower === "status:lot") {
      setFilter("status", "Available on Lot");
      setFilter("search", "");
      addToast("Applied token filter: Status = Available on Lot", "info");
      return;
    }
    if (lower === "status:transit") {
      setFilter("status", "In Transit");
      setFilter("search", "");
      addToast("Applied token filter: Status = In Transit", "info");
      return;
    }
    if (lower === "origin:japan") {
      setFilter("originCountry", "Japan");
      setFilter("search", "");
      addToast("Applied token filter: Origin = Japan", "info");
      return;
    }
    if (lower === "origin:uae" || lower === "origin:dubai") {
      setFilter("originCountry", "UAE");
      setFilter("search", "");
      addToast("Applied token filter: Origin = UAE", "info");
      return;
    }
    if (lower === "fuel:hybrid") {
      setFilter("fuelType", "Hybrid");
      setFilter("search", "");
      addToast("Applied token filter: Fuel = Hybrid", "info");
      return;
    }
    if (lower === "make:toyota") {
      setFilter("make", "Toyota");
      setFilter("search", "");
      addToast("Applied token filter: Make = Toyota", "info");
      return;
    }
    if (lower === "make:lexus") {
      setFilter("make", "Lexus");
      setFilter("search", "");
      addToast("Applied token filter: Make = Lexus", "info");
      return;
    }
    setFilter("search", raw);
  };

  // Live numeric FX conversion if user types a number in Omnibox or Command Palette
  const numericFxPreview = React.useMemo(() => {
    const q = (isCommandPaletteOpen ? commandQuery : filters.search).trim().replace(/,/g, "");
    const num = Number(q);
    if (!q || isNaN(num) || num <= 0) return null;
    return {
      usdToAfn: Math.round(num * exchangeRate),
      afnToUsd: Math.round(num / exchangeRate),
      input: num,
    };
  }, [isCommandPaletteOpen, commandQuery, filters.search, exchangeRate]);

  // Comprehensive Command Palette Results
  const commandResults = React.useMemo(() => {
    const q = commandQuery.trim().toLowerCase();

    const matchedVehicles = vehicles.filter(
      (v) =>
        !q ||
        v.make.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.stockNumber.toLowerCase().includes(q) ||
        v.vin.toLowerCase().includes(q) ||
        v.year.toString().includes(q) ||
        v.fuelType.toLowerCase().includes(q) ||
        v.originCountry.toLowerCase().includes(q)
    );

    const matchedCustomers = customers.filter(
      (c) =>
        !q ||
        c.fullName.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.tazkiraNumber.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    );

    const quickActions = [
      {
        id: "intake",
        title: "Register New Vehicle Intake",
        desc: "VIN decoder, Islam Qala tariff calculator, 11-zone paint blueprint",
        icon: Plus,
        color: "text-[#1A73E8] bg-[#1A73E8]/10",
        action: () => {
          setIsCommandPaletteOpen(false);
          if (onOpenIntake) onOpenIntake();
          else router.push("/intake");
        },
      },
      {
        id: "inventory",
        title: "Explore Vehicle Inventory Fleet",
        desc: "Browse stock with Looker cross-filters & slide-over inspector",
        icon: Car,
        color: "text-emerald-600 bg-emerald-500/10",
        action: () => {
          setIsCommandPaletteOpen(false);
          router.push("/inventory");
        },
      },
      {
        id: "accounting",
        title: "Dealership Accounting, P&L & Sarrafi",
        desc: "Sarrafi balances, receivables, P&L, double-entry ledgers",
        icon: TrendingUp,
        color: "text-amber-600 bg-amber-500/10",
        action: () => {
          setIsCommandPaletteOpen(false);
          router.push("/accounting");
        },
      },
      {
        id: "scanner",
        title: "Scan Vehicle VIN Barcode",
        desc: "Live camera barcode & OCR scanner for doorjambs",
        icon: ScanLine,
        color: "text-indigo-600 bg-indigo-500/10",
        action: () => {
          setIsCommandPaletteOpen(false);
          router.push("/scanner");
        },
      },
      {
        id: "shortcuts",
        title: "Keyboard Shortcuts Cheat Sheet (?)",
        desc: "View Gmail & Google Cloud Console navigation chords",
        icon: Keyboard,
        color: "text-slate-700 dark:text-slate-200 bg-slate-500/10",
        action: () => {
          setIsCommandPaletteOpen(false);
          setIsShortcutsModalOpen(true);
        },
      },
      {
        id: "switchCurrency",
        title: `Switch Display Currency to ${currency === "USD" ? "AFN (؋)" : "USD ($)"}`,
        desc: `Current base rate: $1 USD = ؋${exchangeRate} AFN`,
        icon: Banknote,
        color: "text-teal-600 bg-teal-500/10",
        action: () => {
          setCurrency(currency === "USD" ? "AFN" : "USD");
          addToast(`Currency switched to ${currency === "USD" ? "AFN" : "USD"}`, "info");
        },
      },
    ].filter(
      (a) =>
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.desc.toLowerCase().includes(q)
    );

    const sarrafiFxRates = [
      {
        pair: "USD / AFN (US Dollar)",
        label: "Khorasan Market Spot",
        rate: `؋${exchangeRate}`,
        trend: "+0.2%",
        base: "$1.00 USD",
      },
      {
        pair: "EUR / AFN (Euro)",
        label: "Herat Sarrafi Desk",
        rate: `؋${(exchangeRate * 1.085).toFixed(2)}`,
        trend: "+0.1%",
        base: "€1.00 EUR",
      },
      {
        pair: "AED / AFN (UAE Dirham)",
        label: "Dubai Import Corridor",
        rate: `؋${(exchangeRate / 3.67).toFixed(2)}`,
        trend: "0.0%",
        base: "AED 1.00",
      },
    ].filter(
      (r) =>
        !q ||
        r.pair.toLowerCase().includes(q) ||
        r.label.toLowerCase().includes(q)
    );

    return {
      vehicles: matchedVehicles,
      customers: matchedCustomers,
      actions: quickActions,
      rates: sarrafiFxRates,
    };
  }, [
    commandQuery,
    vehicles,
    customers,
    onOpenIntake,
    router,
    currency,
    exchangeRate,
    setCurrency,
    addToast,
    setIsShortcutsModalOpen,
  ]);

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

  const roleProfiles: Record<RoleType, { name: string; title: string; avatar: string }> = {
    SuperAdmin: {
      name: "Haji Ahmad Shah",
      title: "Showroom Proprietor & Director",
      avatar: "HA",
    },
    SalesAgent: {
      name: "Farhad Timori",
      title: "Senior Sales & Import Agent",
      avatar: "FT",
    },
    Accountant: {
      name: "Mirwais Saljuqi",
      title: "Chief Financial Accountant",
      avatar: "MS",
    },
  };

  const activeProfile = roleProfiles[currentRole];

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-3 backdrop-blur-md dark:border-[#262F40] dark:bg-[#161B26]/95 sm:px-6">
      {/* Left + Center Zone: Branch Project Selector + Google Cloud Omnibox */}
      <div className="flex flex-1 items-center gap-2.5 max-w-3xl">
        <button
          onClick={toggleMobileDrawer}
          className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
          aria-label="Open Navigation Menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Google Cloud Console Project / Branch Selector */}
        <div ref={branchMenuRef} className="relative hidden lg:block shrink-0">
          <button
            type="button"
            onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 dark:border-[#262F40] bg-slate-50/70 dark:bg-[#0F141C] px-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#1A73E8] transition-colors whitespace-nowrap"
            title="Select Dealership Branch / Port Context"
          >
            <Building2 className="h-3.5 w-3.5 text-[#1A73E8] dark:text-[#8AB4F8]" />
            <span>{activeBranch}</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {isBranchMenuOpen && (
            <div className="absolute start-0 top-10 z-50 w-64 rounded-lg border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] p-1.5 shadow-xl">
              <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Active Dealership Facility
              </div>
              {BRANCH_LOCATIONS.map((branch) => {
                const isSelected = activeBranch === branch;
                return (
                  <button
                    key={branch}
                    type="button"
                    onClick={() => {
                      setActiveBranch(branch);
                      setIsBranchMenuOpen(false);
                      addToast(`Switched workspace context to ${branch}`, "info");
                    }}
                    className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-xs font-medium transition ${
                      isSelected
                        ? "bg-[#1A73E8]/10 text-[#1A73E8] dark:text-[#8AB4F8] font-semibold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <span>{branch}</span>
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Google Cloud Structured Omnibox */}
        <div ref={searchContainerRef} className="relative w-full">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute start-3 h-3.5 w-3.5 text-slate-400" />
            <input
              ref={searchInputRef}
              data-omnibox="true"
              type="text"
              placeholder={
                language === "ps"
                  ? "د موټر VIN، سټاک کوډ، یا تذکره..."
                  : language === "fa"
                  ? "جستجوی VIN، استاک موتر، یا تذکره..."
                  : "Search resources, VIN, or filter (e.g. origin:Japan, fuel:Hybrid)..."
              }
              value={filters.search}
              onChange={(e) => {
                handleOmniboxInput(e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/80 py-1.5 ps-8 pe-28 text-xs font-medium text-slate-900 outline-none transition focus:border-[#1A73E8] focus:bg-white dark:border-[#262F40] dark:bg-[#0F141C] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#8AB4F8]"
            />

            <div className="absolute end-1.5 flex items-center gap-1">
              {filters.search && (
                <button
                  onClick={() => setFilter("search", "")}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              <Link
                href="/scanner"
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-[#1A73E8] dark:hover:bg-slate-800 dark:hover:text-[#8AB4F8]"
                title="Scan VIN Barcode"
              >
                <ScanLine className="h-3.5 w-3.5" />
              </Link>

              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="hidden rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-500 hover:border-[#1A73E8] hover:text-[#1A73E8] dark:border-[#262F40] dark:bg-[#161B26] dark:text-slate-300 sm:inline-flex"
                title="Open Command Palette (Ctrl+K or /)"
              >
                ⌘K
              </button>
            </div>
          </div>

          {isSearchFocused && (
            <div className="absolute inset-x-0 top-11 z-50 max-h-[80vh] overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 shadow-xl dark:border-[#262F40] dark:bg-[#161B26] space-y-3">
              {/* Structured Query Token Suggestions */}
              <div>
                <div className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Structured Filter Tokens</span>
                  <button
                    type="button"
                    onClick={() => {
                      resetFilters();
                      setIsSearchFocused(false);
                    }}
                    className="text-[#1A73E8] dark:text-[#8AB4F8] hover:underline"
                  >
                    Reset all filters
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {OMNIBOX_TOKEN_SUGGESTIONS.map((tok) => (
                    <button
                      key={tok.label}
                      type="button"
                      onClick={() => {
                        setFilter(tok.key as any, tok.val);
                        setIsSearchFocused(false);
                        addToast(`Filter applied: ${tok.label}`, "info");
                      }}
                      className="px-2 py-1 rounded border border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#0F141C] hover:border-[#1A73E8] text-[11px] font-mono text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      {tok.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Instant Inline Sarrafi Calculator when typing numbers */}
              {numericFxPreview && (
                <div className="rounded-md border border-[#1A73E8]/30 bg-[#1A73E8]/[0.05] p-2.5 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-[#1A73E8]" />
                    <span>Live Sarrafi FX Conversion:</span>
                  </div>
                  <div className="tabular-nums font-bold text-slate-900 dark:text-white">
                    ${numericFxPreview.input.toLocaleString()} USD = ؋{" "}
                    {numericFxPreview.usdToAfn.toLocaleString()} AFN
                  </div>
                </div>
              )}

              {filters.search.trim() ? (
                <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-[#262F40]">
                  {searchResults.vehicles.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Matching Fleet Resources ({searchResults.vehicles.length})
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-[#262F40]">
                        {searchResults.vehicles.map((v) => (
                          <div
                            key={v.id}
                            className="flex items-center justify-between rounded-md p-2 transition hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                          >
                            <Link
                              href={`/vehicles/${v.id}`}
                              onClick={() => setIsSearchFocused(false)}
                              className="flex items-center gap-2.5 overflow-hidden flex-1"
                            >
                              <div className="relative h-8 w-11 overflow-hidden rounded bg-slate-100 dark:bg-slate-800 shrink-0">
                                <Image
                                  src={v.images[0]}
                                  alt={v.model}
                                  fill
                                  referrerPolicy="no-referrer"
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                                  {v.year} {v.make} {v.model}
                                </div>
                                <div className="mt-0.5 text-[11px] font-mono text-slate-500">
                                  {v.stockNumber} · {v.status} · {v.originCountry}
                                </div>
                              </div>
                            </Link>

                            <div className="flex items-center gap-2 shrink-0 ps-2">
                              <div className="text-end font-mono tabular-nums">
                                <div className="text-xs font-bold text-slate-900 dark:text-white">
                                  ${v.sellingPrice.toLocaleString()}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setInspectedVehicleId(v.id);
                                  setIsSearchFocused(false);
                                }}
                                className="px-2 py-1 rounded border border-slate-200 dark:border-[#262F40] hover:border-[#1A73E8] text-[11px] font-semibold text-[#1A73E8] dark:text-[#8AB4F8] flex items-center gap-1"
                                title="Open in right-hand Inspector Drawer"
                              >
                                <PanelRightOpen className="h-3 w-3" />
                                <span>Inspect</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.customers.length > 0 && (
                    <div className="border-t border-slate-100 pt-2 dark:border-[#262F40]">
                      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        CRM Customers ({searchResults.customers.length})
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-[#262F40]">
                        {searchResults.customers.map((c) => (
                          <Link
                            key={c.id}
                            href="/admin"
                            onClick={() => setIsSearchFocused(false)}
                            className="flex items-center justify-between rounded-md p-2 transition hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                          >
                            <div className="flex items-center gap-2">
                              <Users className="h-3.5 w-3.5 text-slate-500" />
                              <div>
                                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                                  {c.fullName}
                                </div>
                                <div className="text-[11px] font-mono text-slate-500">
                                  {c.phone} · {c.city}
                                </div>
                              </div>
                            </div>
                            <span className="font-mono text-[11px] font-semibold text-[#1A73E8] dark:text-[#8AB4F8]">
                              {c.leadStage}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Right Workspace Utility Cluster */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="inline-flex items-center divide-x rtl:divide-x-reverse divide-slate-200 dark:divide-[#262F40] rounded-lg border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26]">
          {/* Client Presentation Privacy Mode Toggle */}
          <button
            onClick={() => {
              toggleClientPresentationMode();
              addToast(
                !clientPresentationMode
                  ? "Client Presentation Mode enabled — dealer costs & margins hidden"
                  : "Staff View restored — landed costs & margins visible",
                "info"
              );
            }}
            className={`inline-flex h-8 items-center gap-1.5 px-2.5 text-xs font-semibold transition whitespace-nowrap ${
              clientPresentationMode
                ? "bg-[#1A73E8]/10 text-[#1A73E8] dark:text-[#8AB4F8]"
                : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.03]"
            }`}
            title="Toggle Client Presentation Privacy Mode"
          >
            {clientPresentationMode ? (
              <EyeOff className="h-3.5 w-3.5 text-[#1A73E8] dark:text-[#8AB4F8]" />
            ) : (
              <Eye className="h-3.5 w-3.5 text-slate-400" />
            )}
            <span className="hidden xl:inline">
              {clientPresentationMode ? "Client View" : "Hide Costs"}
            </span>
          </button>

          {/* Currency & Live Sarrafi Rate Editor */}
          <div ref={rateEditRef} className="relative">
            <button
              onClick={() => setIsRateEditOpen(!isRateEditOpen)}
              className="inline-flex h-8 items-center gap-1.5 px-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.03] whitespace-nowrap"
              title="Switch Currency & Sarrafi Rate"
            >
              <span className="font-mono font-bold text-[#1A73E8] dark:text-[#8AB4F8]">
                {currency}
              </span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span className="font-mono tabular-nums text-[11px] text-slate-500 dark:text-slate-400">
                ؋{exchangeRate}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {isRateEditOpen && (
              <div className="absolute end-0 top-10 z-50 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-xl dark:border-[#262F40] dark:bg-[#161B26]">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Settlement Currency
                </div>
                <div className="grid grid-cols-2 gap-1 rounded-md bg-slate-100 p-1 dark:bg-[#0F141C]">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrency("USD");
                      setIsRateEditOpen(false);
                    }}
                    className={`rounded px-2 py-1 text-xs font-mono font-semibold ${
                      currency === "USD"
                        ? "bg-[#1A73E8] text-white"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    USD ($)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrency("AFN");
                      setIsRateEditOpen(false);
                    }}
                    className={`rounded px-2 py-1 text-xs font-mono font-semibold ${
                      currency === "AFN"
                        ? "bg-[#1A73E8] text-white"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    AFN (؋)
                  </button>
                </div>

                <form
                  onSubmit={handleSaveRate}
                  className="mt-3 space-y-2 border-t border-slate-100 pt-2.5 dark:border-[#262F40]"
                >
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-slate-500">Khorasan Sarrafi</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      1 USD
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="relative flex-1">
                      <span className="absolute start-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                        ؋
                      </span>
                      <input
                        type="number"
                        step="0.1"
                        value={tempRate}
                        onChange={(e) => setTempRate(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-slate-50 py-1 ps-6 pe-2 text-xs font-mono font-semibold outline-none focus:border-[#1A73E8] dark:border-[#262F40] dark:bg-[#0F141C] dark:text-white"
                        autoFocus
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded bg-[#1A73E8] px-3 py-1 text-xs font-semibold text-white hover:bg-[#1557B0]"
                    >
                      Set
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Language Selector */}
          <div ref={langMenuRef} className="relative">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="inline-flex h-8 items-center gap-1.5 px-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.03] whitespace-nowrap"
            >
              <Globe className="h-3.5 w-3.5 text-slate-400" />
              <span>{language === "en" ? "EN" : language === "fa" ? "دری" : "پښتو"}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {isLangMenuOpen && (
              <div className="absolute end-0 top-10 z-50 w-36 space-y-0.5 rounded-lg border border-slate-200 bg-white p-1 shadow-xl dark:border-[#262F40] dark:bg-[#161B26]">
                {[
                  { code: "en", label: "English" },
                  { code: "fa", label: "دری (Dari)" },
                  { code: "ps", label: "پښتو (Pashto)" },
                ].map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code as any);
                      setIsLangMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium ${
                      language === l.code
                        ? "bg-[#1A73E8]/10 font-semibold text-[#1A73E8] dark:text-[#8AB4F8]"
                        : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/[0.03]"
                    }`}
                  >
                    <span>{l.label}</span>
                    {language === l.code && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Keyboard Shortcuts Button */}
          <button
            onClick={() => setIsShortcutsModalOpen(true)}
            className="hidden sm:flex h-8 w-8 items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-[#1A73E8] dark:text-slate-300 dark:hover:bg-white/[0.03]"
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard className="h-3.5 w-3.5" />
          </button>

          {/* Notifications */}
          <div ref={notificationsRef} className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative flex h-8 w-8 items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.03]"
              title="Activity Feed"
            >
              <Bell className="h-3.5 w-3.5" />
              {unreadNotifCount > 0 && (
                <span className="absolute end-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#1A73E8]" />
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute end-0 top-10 z-50 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl dark:border-[#262F40] dark:bg-[#161B26]">
                <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5 dark:border-[#262F40]">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                    Showroom Activity Stream
                  </span>
                  {unreadNotifCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] font-semibold text-[#1A73E8] dark:text-[#8AB4F8]"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto dark:divide-[#262F40]">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`cursor-pointer p-3 text-xs transition hover:bg-slate-50 dark:hover:bg-white/[0.02] ${
                        !n.read ? "bg-[#1A73E8]/[0.04]" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {n.title}
                        </span>
                        <span className="shrink-0 font-mono text-[10px] text-slate-400">
                          {n.time}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="flex h-8 w-8 items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.03]"
            title="Toggle Daylight / Dark Console Theme"
          >
            {darkMode ? (
              <Sun className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <Moon className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Operator Role Switcher */}
          <div ref={roleMenuRef} className="relative">
            <button
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="flex h-8 items-center gap-2 px-2.5 transition hover:bg-slate-50 dark:hover:bg-white/[0.03]"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded bg-[#1A73E8] font-mono text-[10px] font-bold text-white">
                {activeProfile.avatar}
              </div>
              <span className="hidden font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200 md:inline">
                {currentRole}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute end-0 top-10 z-50 w-60 rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl dark:border-[#262F40] dark:bg-[#161B26]">
                <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Authorized Workspace Role
                </div>
                <div className="space-y-0.5">
                  {(Object.keys(roleProfiles) as RoleType[]).map((r) => {
                    const p = roleProfiles[r];
                    const isActive = currentRole === r;
                    return (
                      <button
                        key={r}
                        onClick={() => handleRoleChange(r)}
                        className={`flex w-full items-center justify-between rounded-md p-2 text-start transition ${
                          isActive
                            ? "bg-[#1A73E8]/10 font-semibold text-[#1A73E8] dark:text-[#8AB4F8]"
                            : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#1A73E8] font-mono text-[10px] font-bold text-white">
                            {p.avatar}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-900 dark:text-white">
                              {p.name}
                            </div>
                            <div className="font-mono text-[10px] text-slate-400">{p.title}</div>
                          </div>
                        </div>
                        {isActive && <Check className="h-3.5 w-3.5 text-[#1A73E8]" />}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-1.5 border-t border-slate-100 pt-1.5 dark:border-[#262F40]">
                  <Link
                    href="/login"
                    onClick={() => setIsRoleMenuOpen(false)}
                    className="flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.04]"
                  >
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#1A73E8]" /> Staff Sign-In
                    </span>
                    <ExternalLink className="h-3 w-3 text-slate-400" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spotlight Command Palette (Ctrl+K) Modal */}
      <Dialog
        open={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent className="p-0 overflow-hidden bg-white dark:bg-[#161B26]">
          <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-[#262F40] gap-3">
            <Search className="h-5 w-5 text-[#1A73E8] shrink-0" />
            <input
              type="text"
              placeholder="Search vehicles, VIN, customers, actions, or type USD amount for instant AFN conversion..."
              value={commandQuery}
              onChange={(e) => setCommandQuery(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none"
              autoFocus
            />
            {commandQuery && (
              <button
                onClick={() => setCommandQuery("")}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              ESC
            </kbd>
          </div>

          {numericFxPreview && (
            <div className="px-4 py-2 bg-[#1A73E8]/10 border-b border-[#1A73E8]/20 flex items-center justify-between text-xs font-mono">
              <span className="font-semibold text-[#1A73E8] dark:text-[#8AB4F8]">
                Instant Sarrafi Calculator (Rate: 1 USD = {exchangeRate} AFN)
              </span>
              <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                ${numericFxPreview.input.toLocaleString()} USD = ؋{" "}
                {numericFxPreview.usdToAfn.toLocaleString()} AFN
              </span>
            </div>
          )}

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 dark:border-[#262F40] bg-slate-50/60 dark:bg-[#121722] text-xs overflow-x-auto scrollbar-none">
            {[
              { id: "all", label: "All Resources" },
              { id: "vehicles", label: `Vehicles (${commandResults.vehicles.length})` },
              { id: "customers", label: `Customers (${commandResults.customers.length})` },
              { id: "actions", label: `Commands (${commandResults.actions.length})` },
              { id: "sarrafi", label: `Sarrafi FX (${commandResults.rates.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCommandCategory(tab.id as any)}
                className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  commandCategory === tab.id
                    ? "bg-[#1A73E8] text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
            {(commandCategory === "all" || commandCategory === "actions") &&
              commandResults.actions.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                    Platform Commands ({commandResults.actions.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {commandResults.actions.map((act) => {
                      const IconComponent = act.icon;
                      return (
                        <button
                          key={act.id}
                          onClick={act.action}
                          className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-100 dark:border-[#262F40] hover:border-[#1A73E8] transition-colors text-left cursor-pointer group"
                        >
                          <div className={`p-2 rounded-md shrink-0 ${act.color}`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="overflow-hidden">
                            <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-[#1A73E8] transition-colors truncate">
                              {act.title}
                            </span>
                            <span className="text-[10px] text-slate-400 block line-clamp-1">
                              {act.desc}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            {(commandCategory === "all" || commandCategory === "vehicles") &&
              commandResults.vehicles.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                    Fleet Vehicles ({commandResults.vehicles.length})
                  </div>
                  <div className="space-y-1">
                    {commandResults.vehicles.slice(0, 8).map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/[0.03] border border-transparent hover:border-slate-200 dark:hover:border-[#262F40] transition-colors"
                      >
                        <Link
                          href={`/vehicles/${v.id}`}
                          onClick={() => setIsCommandPaletteOpen(false)}
                          className="flex items-center gap-3 overflow-hidden flex-1 cursor-pointer"
                        >
                          <div className="relative h-10 w-14 shrink-0 rounded overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <Image
                              src={v.images[0]}
                              alt={v.model}
                              fill
                              referrerPolicy="no-referrer"
                              className="object-cover"
                            />
                          </div>
                          <div className="truncate">
                            <div className="text-xs font-bold text-slate-900 dark:text-white hover:text-[#1A73E8] transition-colors truncate">
                              {v.year} {v.make} {v.model} ({v.trim})
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                              <span className="font-semibold text-[#1A73E8] dark:text-[#8AB4F8]">
                                {v.stockNumber}
                              </span>
                              <span>·</span>
                              <span className="text-slate-500">{v.vin}</span>
                              <span>·</span>
                              <span className="text-emerald-600 font-semibold">{v.status}</span>
                            </div>
                          </div>
                        </Link>

                        <div className="flex items-center gap-2 shrink-0 ps-2">
                          <div className="text-right font-mono tabular-nums">
                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                              ${v.sellingPrice.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              ؋ {(v.sellingPrice * exchangeRate).toLocaleString()}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setIsCommandPaletteOpen(false);
                              setInspectedVehicleId(v.id);
                            }}
                            className="px-2 py-1 rounded border border-slate-200 dark:border-[#262F40] hover:border-[#1A73E8] text-xs font-semibold text-[#1A73E8] dark:text-[#8AB4F8]"
                          >
                            Inspect
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
