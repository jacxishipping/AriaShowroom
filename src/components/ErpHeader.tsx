"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShowroomStore, RoleType } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { formatCurrency } from "@/lib/utils";
import { MuiButton, IconButton, Dialog, DialogContent } from "@/components/mui";
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
  Menu,
  Globe,
  FileText,
  Banknote,
  CornerDownLeft,
  Sliders,
  Calculator,
  Eye,
  EyeOff,
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
    toggleMobileDrawer,
    clientPresentationMode,
    toggleClientPresentationMode,
  } = useShowroomStore();

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

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const roleMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const rateEditRef = useRef<HTMLDivElement>(null);
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
      if (
        langMenuRef.current &&
        !langMenuRef.current.contains(event.target as Node)
      ) {
        setIsLangMenuOpen(false);
      }
      if (
        rateEditRef.current &&
        !rateEditRef.current.contains(event.target as Node)
      ) {
        setIsRateEditOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global Ctrl+K / Cmd+K shortcut for command palette
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
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
        title: "Register New Vehicle Intake (فورم ثبت موتر جدید)",
        desc: "VIN decoder, Islam Qala tariff calculator, multi-step intake",
        icon: Plus,
        color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50",
        action: () => {
          setIsCommandPaletteOpen(false);
          if (onOpenIntake) onOpenIntake();
          else router.push("/intake");
        },
      },
      {
        id: "inventory",
        title: "Explore Vehicle Inventory Fleet (موجودی موترها)",
        desc: "Browse stock with multi-criteria filters & grid/list views",
        icon: Car,
        color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50",
        action: () => {
          setIsCommandPaletteOpen(false);
          router.push("/inventory");
        },
      },
      {
        id: "accounting",
        title: "Dealership Accounting, P&L & Sarrafi (بخش مالی و صرافی)",
        desc: "Sarrafi balances, receivables, P&L, customer ledgers",
        icon: TrendingUp,
        color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50",
        action: () => {
          setIsCommandPaletteOpen(false);
          router.push("/admin");
        },
      },
      {
        id: "scanner",
        title: "Scan Vehicle VIN Barcode (اسکن بارکد VIN)",
        desc: "Instant live camera barcode & OCR scanner for doorjambs",
        icon: ScanLine,
        color: "text-purple-600 bg-purple-50 dark:bg-purple-950/50",
        action: () => {
          setIsCommandPaletteOpen(false);
          router.push("/scanner");
        },
      },
      {
        id: "toggleTheme",
        title: `Switch to ${darkMode ? "Light" : "Dark"} Mode (تغییر تم شب/روز)`,
        desc: `Toggle interface theme to ${darkMode ? "Daylight Mode" : "Dark Room Mode"}`,
        icon: darkMode ? Sun : Moon,
        color: "text-orange-500 bg-orange-50 dark:bg-orange-950/50",
        action: () => {
          toggleDarkMode();
          addToast(`Switched to ${!darkMode ? "Dark" : "Light"} Mode`, "info");
        },
      },
      {
        id: "switchCurrency",
        title: `Switch Display Currency to ${currency === "USD" ? "AFN (؋)" : "USD ($)"} (واحد پولی)`,
        desc: `Current base rate: $1 USD = ؋${exchangeRate} AFN`,
        icon: Banknote,
        color: "text-teal-600 bg-teal-50 dark:bg-teal-950/50",
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
        pair: "USD / AFN (دالر / افغانی)",
        label: "US Dollar",
        rate: `؋${exchangeRate}`,
        trend: "+0.2%",
        base: "$1.00 USD",
      },
      {
        pair: "EUR / AFN (یورو / افغانی)",
        label: "Euro",
        rate: `؋${(exchangeRate * 1.085).toFixed(2)}`,
        trend: "+0.1%",
        base: "€1.00 EUR",
      },
      {
        pair: "AED / AFN (درهم امارات / افغانی)",
        label: "UAE Dirham",
        rate: `؋${(exchangeRate / 3.67).toFixed(2)}`,
        trend: "0.0%",
        base: "AED 1.00",
      },
      {
        pair: "IRR / AFN (تومان ایران / افغانی)",
        label: "Iranian Toman",
        rate: `؋0.115`,
        trend: "-0.5%",
        base: "1,000 Tomans",
      },
      {
        pair: "PKR / AFN (کلدار پاکستان / افغانی)",
        label: "Pakistani Rupee",
        rate: `؋0.245`,
        trend: "-0.1%",
        base: "1.00 PKR",
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
    darkMode,
    currency,
    exchangeRate,
    toggleDarkMode,
    setCurrency,
    addToast,
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
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between gap-3 border-b border-[#E2E0D8] bg-[#F4F3EF]/95 px-3 backdrop-blur-md dark:border-[#1F2430] dark:bg-[#0A0C10]/95 sm:px-6">
      <div className="flex w-full items-center gap-3 sm:max-w-xl">
        <button
          onClick={toggleMobileDrawer}
          className="rounded p-1.5 text-slate-700 hover:bg-stone-200/70 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
          aria-label="Open Navigation Menu"
          title="Open Menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div ref={searchContainerRef} className="relative w-full">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute start-3 h-3.5 w-3.5 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={
                language === "ps"
                  ? "د موټر VIN، سټاک کوډ، یا تذکره..."
                  : language === "fa"
                  ? "جستجوی VIN، استاک موتر، یا تذکره..."
                  : "Search VIN, lot #, or buyer Tazkira..."
              }
              value={filters.search}
              onChange={(e) => {
                setFilter("search", e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
              className="h-9 w-full rounded-md border border-[#D8D5CD] bg-white py-1.5 ps-8 pe-24 text-xs font-medium text-[#111318] outline-none transition focus:border-[#111318] dark:border-[#242A38] dark:bg-[#11141B] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-amber-500"
            />

            <div className="absolute end-1.5 flex items-center gap-1">
              {filters.search && (
                <button
                  onClick={() => setFilter("search", "")}
                  className="rounded p-1 text-slate-400 hover:bg-stone-100 hover:text-slate-700 dark:hover:bg-slate-800"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              <Link
                href="/scanner"
                className="rounded p-1 text-slate-400 hover:bg-stone-100 hover:text-[#111318] dark:hover:bg-slate-800 dark:hover:text-amber-400"
                title="Scan VIN Barcode"
              >
                <ScanLine className="h-3.5 w-3.5" />
              </Link>

              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="hidden rounded border border-[#E2E0D8] bg-[#F4F3EF] px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-600 hover:border-[#111318] hover:text-[#111318] dark:border-[#242A38] dark:bg-[#171B24] dark:text-slate-300 sm:inline-flex"
                title="Open Command Palette (Ctrl+K)"
              >
                ⌘K
              </button>
            </div>
          </div>

          {isSearchFocused && (
            <div className="absolute inset-x-0 top-11 z-50 max-h-[80vh] overflow-y-auto rounded-md border border-[#D8D5CD] bg-white p-2.5 shadow-xl dark:border-[#242A38] dark:bg-[#11141B]">
              {filters.search.trim() ? (
                <div className="space-y-3">
                  {searchResults.vehicles.length > 0 && (
                    <div>
                      <div className="px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Fleet Registry ({searchResults.vehicles.length})
                      </div>
                      <div className="divide-y divide-[#EAE8E1] dark:divide-[#1B202B]">
                        {searchResults.vehicles.map((v) => (
                          <Link
                            key={v.id}
                            href={`/vehicles/${v.id}`}
                            onClick={() => setIsSearchFocused(false)}
                            className="flex items-center justify-between rounded p-2 transition hover:bg-stone-50 dark:hover:bg-white/[0.03]"
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <div className="relative h-8 w-11 overflow-hidden rounded bg-stone-100 dark:bg-slate-800">
                                <Image src={v.images[0]} alt={v.model} fill className="object-cover" />
                              </div>
                              <div className="min-w-0">
                                <div className="truncate text-xs font-semibold text-[#111318] dark:text-white">
                                  {v.year} {v.make} {v.model}
                                </div>
                                <div className="mt-0.5 text-[11px] font-mono text-slate-500">
                                  {v.stockNumber} · {v.status}
                                </div>
                              </div>
                            </div>
                            <div className="shrink-0 ps-2 text-end">
                              <div className="text-xs font-bold font-mono tabular-nums text-[#111318] dark:text-white">
                                ${v.sellingPrice.toLocaleString()}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400">{v.originCountry}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.customers.length > 0 && (
                    <div className="border-t border-[#EAE8E1] pt-2 dark:border-[#1B202B]">
                      <div className="px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        CRM Customers ({searchResults.customers.length})
                      </div>
                      <div className="divide-y divide-[#EAE8E1] dark:divide-[#1B202B]">
                        {searchResults.customers.map((c) => (
                          <Link
                            key={c.id}
                            href="/admin"
                            onClick={() => setIsSearchFocused(false)}
                            className="flex items-center justify-between rounded p-2 transition hover:bg-stone-50 dark:hover:bg-white/[0.03]"
                          >
                            <div className="flex items-center gap-2">
                              <Users className="h-3.5 w-3.5 text-slate-500" />
                              <div>
                                <div className="text-xs font-semibold text-[#111318] dark:text-white">{c.fullName}</div>
                                <div className="text-[11px] font-mono text-slate-500">{c.phone} · {c.city}</div>
                              </div>
                            </div>
                            <span className="font-mono text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                              {c.leadStage}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.vehicles.length === 0 && searchResults.customers.length === 0 && (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No matching fleet records or buyers for “{filters.search}”
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5 py-1 text-xs">
                  <div className="px-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Direct Terminal Actions
                  </div>
                  <div className="grid gap-1">
                    <Link href="/intake" onClick={() => setIsSearchFocused(false)} className="flex items-center gap-2.5 rounded p-2 text-slate-700 transition hover:bg-stone-100 dark:text-slate-200 dark:hover:bg-white/[0.04]">
                      <Plus className="h-3.5 w-3.5 text-amber-600" />
                      <div>
                        <div className="font-semibold">Vehicle Intake & Gomrok Tariff</div>
                        <div className="text-[11px] text-slate-400">Register VIN, customs Maktoub, and landed cost</div>
                      </div>
                    </Link>
                    <Link href="/inventory" onClick={() => setIsSearchFocused(false)} className="flex items-center gap-2.5 rounded p-2 text-slate-700 transition hover:bg-stone-100 dark:text-slate-200 dark:hover:bg-white/[0.04]">
                      <Car className="h-3.5 w-3.5 text-emerald-600" />
                      <div>
                        <div className="font-semibold">Showroom Fleet Dossier</div>
                        <div className="text-[11px] text-slate-400">Inspect specifications, photos, and pricing</div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Unified Right Instrument Cluster */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="inline-flex items-center divide-x rtl:divide-x-reverse divide-[#E2E0D8] dark:divide-[#242A38] rounded-md border border-[#D8D5CD] dark:border-[#242A38] bg-white dark:bg-[#11141B]">
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
                ? "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                : "text-slate-700 hover:bg-stone-50 dark:text-slate-200 dark:hover:bg-white/[0.03]"
            }`}
            title={
              clientPresentationMode
                ? "Client Mode Active (Dealer Costs Hidden) — Click for Staff View"
                : "Hide Landed Costs & Margins for Walk-in Buyers"
            }
          >
            {clientPresentationMode ? (
              <EyeOff className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            ) : (
              <Eye className="h-3.5 w-3.5 text-slate-400" />
            )}
            <span className="hidden lg:inline">
              {clientPresentationMode
                ? language === "fa"
                  ? "نمای مشتری"
                  : language === "ps"
                  ? "د پیرودونکي لید"
                  : "Client View"
                : language === "fa"
                ? "مخفی مفاد"
                : language === "ps"
                ? "ګټه پټول"
                : "Hide Costs"}
            </span>
          </button>

          {/* Currency & Live Sarrafi Rate Editor */}
          <div ref={rateEditRef} className="relative">
            <button
              onClick={() => setIsRateEditOpen(!isRateEditOpen)}
              className="inline-flex h-8 items-center gap-1.5 px-2.5 text-xs font-semibold text-slate-700 transition hover:bg-stone-50 dark:text-slate-200 dark:hover:bg-white/[0.03] whitespace-nowrap"
              title="Switch Currency & Sarrafi Rate"
            >
              <span className="font-mono font-bold text-[#111318] dark:text-amber-400">{currency}</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="font-mono tabular-nums text-[11px] text-slate-500 dark:text-slate-400">
                ؋{exchangeRate}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {isRateEditOpen && (
              <div className="absolute end-0 top-10 z-50 w-64 rounded-md border border-[#D8D5CD] bg-white p-3 shadow-xl dark:border-[#242A38] dark:bg-[#11141B]">
                <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Settlement Currency
                </div>
                <div className="grid grid-cols-2 gap-1 rounded bg-[#F4F3EF] p-1 dark:bg-[#0A0C10]">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrency("USD");
                      setIsRateEditOpen(false);
                    }}
                    className={`rounded px-2 py-1 text-xs font-mono font-semibold ${
                      currency === "USD"
                        ? "bg-[#111318] text-white dark:bg-amber-600"
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
                        ? "bg-[#111318] text-white dark:bg-amber-600"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    AFN (؋)
                  </button>
                </div>

                <form
                  onSubmit={handleSaveRate}
                  className="mt-3 space-y-2 border-t border-[#EAE8E1] pt-2.5 dark:border-[#1B202B]"
                >
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="uppercase text-slate-500">Khorasan Sarrafi</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">1 USD</span>
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
                        className="w-full rounded border border-[#D8D5CD] bg-[#F4F3EF] py-1 ps-6 pe-2 text-xs font-mono font-semibold outline-none focus:border-[#111318] dark:border-[#242A38] dark:bg-[#0A0C10] dark:text-white"
                        autoFocus
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded bg-[#111318] px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-amber-600 dark:hover:bg-amber-500"
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
              className="inline-flex h-8 items-center gap-1.5 px-2.5 text-xs font-semibold text-slate-700 transition hover:bg-stone-50 dark:text-slate-200 dark:hover:bg-white/[0.03] whitespace-nowrap"
            >
              <Globe className="h-3.5 w-3.5 text-slate-400" />
              <span>{language === "en" ? "EN" : language === "fa" ? "دری" : "پښتو"}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {isLangMenuOpen && (
              <div className="absolute end-0 top-10 z-50 w-36 space-y-0.5 rounded-md border border-[#D8D5CD] bg-white p-1 shadow-xl dark:border-[#242A38] dark:bg-[#11141B]">
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
                    className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-xs font-medium ${
                      language === l.code
                        ? "bg-[#F4F3EF] font-semibold text-[#111318] dark:bg-white/[0.06] dark:text-amber-400"
                        : "text-slate-700 hover:bg-stone-50 dark:text-slate-300 dark:hover:bg-white/[0.03]"
                    }`}
                  >
                    <span>{l.label}</span>
                    {language === l.code && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div ref={notificationsRef} className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative flex h-8 w-8 items-center justify-center text-slate-500 transition hover:bg-stone-50 hover:text-[#111318] dark:text-slate-300 dark:hover:bg-white/[0.03]"
              title="Activity Feed"
            >
              <Bell className="h-3.5 w-3.5" />
              {unreadNotifCount > 0 && (
                <span className="absolute end-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-600" />
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute end-0 top-10 z-50 w-80 overflow-hidden rounded-md border border-[#D8D5CD] bg-white shadow-xl dark:border-[#242A38] dark:bg-[#11141B]">
                <div className="flex items-center justify-between border-b border-[#EAE8E1] px-3 py-2.5 dark:border-[#1B202B]">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Showroom Ledger Events
                  </span>
                  {unreadNotifCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] font-semibold text-amber-700 dark:text-amber-400"
                    >
                      Mark read
                    </button>
                  )}
                </div>
                <div className="max-h-72 divide-y divide-[#EAE8E1] overflow-y-auto dark:divide-[#1B202B]">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`cursor-pointer p-3 text-xs transition hover:bg-stone-50 dark:hover:bg-white/[0.02] ${
                        !n.read ? "bg-amber-500/[0.04]" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-[#111318] dark:text-white">{n.title}</span>
                        <span className="shrink-0 font-mono text-[10px] text-slate-400">{n.time}</span>
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
            className="flex h-8 w-8 items-center justify-center text-slate-500 transition hover:bg-stone-50 hover:text-[#111318] dark:text-slate-300 dark:hover:bg-white/[0.03]"
            title="Toggle Dark / Light Theme"
          >
            {darkMode ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5" />}
          </button>

          {/* Operator Role Switcher */}
          <div ref={roleMenuRef} className="relative">
            <button
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="flex h-8 items-center gap-2 px-2.5 transition hover:bg-stone-50 dark:hover:bg-white/[0.03]"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded bg-[#111318] font-mono text-[10px] font-bold text-amber-400 dark:bg-slate-800">
                {activeProfile.avatar}
              </div>
              <span className="hidden font-mono text-[11px] font-semibold text-[#111318] dark:text-slate-200 md:inline">
                {currentRole}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute end-0 top-10 z-50 w-60 rounded-md border border-[#D8D5CD] bg-white p-1.5 shadow-xl dark:border-[#242A38] dark:bg-[#11141B]">
                <div className="px-2.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Authorized Desk Role
                </div>
                <div className="space-y-0.5">
                  {(Object.keys(roleProfiles) as RoleType[]).map((r) => {
                    const p = roleProfiles[r];
                    const isActive = currentRole === r;
                    return (
                      <button
                        key={r}
                        onClick={() => handleRoleChange(r)}
                        className={`flex w-full items-center justify-between rounded p-2 text-start transition ${
                          isActive
                            ? "bg-[#F4F3EF] font-semibold text-[#111318] dark:bg-white/[0.06] dark:text-white"
                            : "text-slate-700 hover:bg-stone-50 dark:text-slate-300 dark:hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#111318] font-mono text-[10px] font-bold text-amber-400 dark:bg-slate-800">
                            {p.avatar}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-[#111318] dark:text-white">{p.name}</div>
                            <div className="font-mono text-[10px] text-slate-400">{p.title}</div>
                          </div>
                        </div>
                        {isActive && <Check className="h-3.5 w-3.5 text-amber-600" />}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-1.5 border-t border-[#EAE8E1] pt-1.5 dark:border-[#1B202B]">
                  <Link
                    href="/login"
                    onClick={() => setIsRoleMenuOpen(false)}
                    className="flex items-center justify-between rounded px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-stone-100 dark:text-slate-300 dark:hover:bg-white/[0.04]"
                  >
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-amber-600" /> Staff Sign-In
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
        <DialogContent className="p-0 overflow-hidden bg-white dark:bg-[#111827]">
          {/* Spotlight Search Header */}
          <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
            <Search className="h-5 w-5 text-blue-500 shrink-0" />
            <input
              type="text"
              placeholder="Search vehicles, VIN, customers, actions, or market rates (or press ESC)..."
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

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 text-xs overflow-x-auto scrollbar-none">
            {[
              { id: "all", label: "All Items" },
              { id: "vehicles", label: `Vehicles (${commandResults.vehicles.length})` },
              { id: "customers", label: `Customers (${commandResults.customers.length})` },
              { id: "actions", label: `Actions (${commandResults.actions.length})` },
              { id: "sarrafi", label: `Sarrafi FX (${commandResults.rates.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCommandCategory(tab.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  commandCategory === tab.id
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
            {/* Quick Actions Section */}
            {(commandCategory === "all" || commandCategory === "actions") &&
              commandResults.actions.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                    Quick Actions & Navigation ({commandResults.actions.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {commandResults.actions.map((act) => {
                      const IconComponent = act.icon;
                      return (
                        <button
                          key={act.id}
                          onClick={act.action}
                          className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left cursor-pointer group"
                        >
                          <div
                            className={`p-2 rounded-lg shrink-0 ${act.color}`}
                          >
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="overflow-hidden">
                            <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-blue-600 transition-colors truncate">
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

            {/* Fleet Vehicles Section */}
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
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors"
                      >
                        <Link
                          href={`/vehicles/${v.id}`}
                          onClick={() => setIsCommandPaletteOpen(false)}
                          className="flex items-center gap-3 overflow-hidden flex-1 cursor-pointer"
                        >
                          <div className="relative h-10 w-14 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <Image
                              src={v.images[0]}
                              alt={v.model}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="truncate">
                            <div className="text-xs font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors truncate">
                              {v.year} {v.make} {v.model} ({v.trim})
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                Stock #{v.stockNumber}
                              </span>
                              <span>•</span>
                              <span className="text-slate-500">VIN: {v.vin}</span>
                              <span>•</span>
                              <span className="text-emerald-600 font-bold">
                                {v.status}
                              </span>
                            </div>
                          </div>
                        </Link>

                        <div className="flex items-center gap-2 shrink-0 pl-2">
                          <div className="text-right">
                            <div className="text-xs font-black font-mono text-slate-900 dark:text-white">
                              ${v.sellingPrice.toLocaleString()}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              ؋ {(v.sellingPrice * exchangeRate).toLocaleString()}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <Link
                              href={`/vehicles/${v.id}/deed`}
                              onClick={() => setIsCommandPaletteOpen(false)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
                              title="Official Sales Deed"
                            >
                              <FileText className="h-3.5 w-3.5" />
                            </Link>
                            <Link
                              href={`/vehicles/${v.id}/settlement`}
                              onClick={() => setIsCommandPaletteOpen(false)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-600 dark:text-slate-300 hover:text-amber-600 transition-colors"
                              title="Sarrafi Installment Ledger"
                            >
                              <Banknote className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Customers Section */}
            {(commandCategory === "all" || commandCategory === "customers") &&
              commandResults.customers.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                    CRM Customer Leads ({commandResults.customers.length})
                  </div>
                  <div className="space-y-1">
                    {commandResults.customers.slice(0, 6).map((c) => (
                      <Link
                        key={c.id}
                        href="/admin"
                        onClick={() => setIsCommandPaletteOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                            {c.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block">
                              {c.fullName}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              Tel: {c.phone} • {c.city} • Tazkira: {c.tazkiraNumber}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                          {c.leadStage}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            {/* Sarrafi FX Rates Section */}
            {(commandCategory === "all" || commandCategory === "sarrafi") &&
              commandResults.rates.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                    <span>Khorasan Sarrafi Live FX Ticker ({commandResults.rates.length})</span>
                    <span className="text-emerald-600 font-mono">Market Active</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {commandResults.rates.map((rate, i) => (
                      <div
                        key={i}
                        className="rounded-xl p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-left"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>{rate.base}</span>
                          <span
                            className={
                              rate.trend.startsWith("+")
                                ? "text-emerald-500 font-bold"
                                : "text-amber-500 font-bold"
                            }
                          >
                            {rate.trend}
                          </span>
                        </div>
                        <div className="text-sm font-black font-mono text-slate-900 dark:text-white mt-0.5">
                          {rate.rate}
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                          {rate.pair}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Empty State */}
            {commandResults.vehicles.length === 0 &&
              commandResults.customers.length === 0 &&
              commandResults.actions.length === 0 &&
              commandResults.rates.length === 0 && (
                <div className="py-12 text-center space-y-2">
                  <Search className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="text-xs text-slate-500">
                    No matching results for &ldquo;{commandQuery}&rdquo;
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Try searching by VIN, stock number, customer name, or action keyword.
                  </p>
                </div>
              )}
          </div>

          {/* Footer with Keyboard Guide */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                  ↵
                </kbd>
                <span>to select</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                  ESC
                </kbd>
                <span>to close</span>
              </span>
            </div>
            <span className="font-medium text-slate-500">
              Aria Showroom Omnichannel Command (Ctrl+K)
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
