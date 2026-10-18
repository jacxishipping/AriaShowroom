"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { formatCurrency } from "@/lib/utils";
import { VehicleDeedModal } from "@/components/VehicleDeedModal";
import { VehicleIntakeModal } from "@/components/VehicleIntakeModal";
import { VehicleQuickViewModal } from "@/components/VehicleQuickViewModal";
import { VehicleCompareModal } from "@/components/VehicleCompareModal";
import { CompareBar } from "@/components/CompareBar";
import { VehicleItem } from "@/lib/mock-data";
import { exportInventoryToCSV } from "@/lib/export-utils";
import {
  Car,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Plus,
  Eye,
  Trash2,
  FileText,
  Search,
  Download,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers,
  ChevronDown,
  Check,
  X,
  Sparkles,
} from "lucide-react";

export default function ErpOperationsCockpit() {
  const {
    vehicles,
    sales,
    currency,
    exchangeRate,
    language,
    currentRole,
    deleteVehicle,
    setVehicleStatus,
    batchUpdateVehicleStatus,
    addToast,
    compareIds,
  } = useShowroomStore();

  const t = translations[language];

  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [selectedDeedVehicle, setSelectedDeedVehicle] = useState<VehicleItem | null>(null);
  const [quickViewVehicle, setQuickViewVehicle] = useState<VehicleItem | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusTab, setStatusTab] = useState<
    "ALL" | "Available on Lot" | "In Transit" | "Reserved/Deposit Paid" | "Sold"
  >("ALL");
  const [sortField, setSortField] = useState<
    "sellingPrice" | "landedCost" | "year" | "stockNumber"
  >("year");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Metrics calculations
  const activeLotVehicles = useMemo(
    () => vehicles.filter((v) => v.status === "Available on Lot"),
    [vehicles]
  );

  const totalActiveValue = useMemo(
    () => activeLotVehicles.reduce((acc, v) => acc + v.sellingPrice, 0),
    [activeLotVehicles]
  );

  const totalActiveLanded = useMemo(
    () => activeLotVehicles.reduce((acc, v) => acc + v.landedCost, 0),
    [activeLotVehicles]
  );

  const totalProjectedProfit = totalActiveValue - totalActiveLanded;

  const totalMonthlySales = useMemo(
    () => sales.reduce((acc, s) => acc + s.salePriceUSD, 0),
    [sales]
  );

  // Status counts
  const availableCount = vehicles.filter((v) => v.status === "Available on Lot").length;
  const inTransitCount = vehicles.filter((v) => v.status === "In Transit").length;
  const reservedCount = vehicles.filter((v) => v.status === "Reserved/Deposit Paid").length;
  const soldCount = vehicles.filter((v) => v.status === "Sold").length;

  const handleSort = (field: "sellingPrice" | "landedCost" | "year" | "stockNumber") => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  // Filter & sort
  const processedVehicles = useMemo(() => {
    let list = vehicles.filter((v) => {
      if (statusTab !== "ALL" && v.status !== statusTab) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.stockNumber.toLowerCase().includes(q) ||
          v.vin.toLowerCase().includes(q)
        );
      }
      return true;
    });

    list.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (typeof valA === "string") {
        return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortDir === "asc" ? valA - valB : valB - valA;
    });

    return list;
  }, [vehicles, statusTab, searchQuery, sortField, sortDir]);

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedVehicleIds.length === processedVehicles.length) {
      setSelectedVehicleIds([]);
    } else {
      setSelectedVehicleIds(processedVehicles.map((v) => v.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedVehicleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBatchStatus = (newStatus: VehicleItem["status"]) => {
    if (selectedVehicleIds.length === 0) return;
    batchUpdateVehicleStatus(selectedVehicleIds, newStatus);
    setSelectedVehicleIds([]);
  };

  const handleBatchExport = () => {
    const selected = vehicles.filter((v) => selectedVehicleIds.includes(v.id));
    exportInventoryToCSV(selected.length > 0 ? selected : vehicles);
    addToast(`Exported ${selected.length || vehicles.length} vehicle records to CSV`, "success");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/90 dark:border-slate-800/90">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {language === "ps"
                ? "د نندارتون عملیاتي مرکز"
                : language === "fa"
                ? "مرکز عملیاتی نمایشگاه"
                : "Operations Cockpit"}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Herat Lot</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Sadozai Motors Herat • Fleet inventory, customs port clearance, and margin analytics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              exportInventoryToCSV(vehicles);
              addToast("Exported fleet inventory to CSV", "success");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsIntakeOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{t.addNewVehicle}</span>
          </button>
        </div>
      </div>

      {/* 4 Interactive Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Lot Valuation */}
        <div
          onClick={() => setStatusTab("Available on Lot")}
          className="group rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#111827] p-5 shadow-xs hover:shadow-md hover:border-blue-500/40 transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Active Lot Valuation
            </span>
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalActiveValue, currency, exchangeRate)}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {activeLotVehicles.length} units on lot
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono text-xs">
              +${totalProjectedProfit.toLocaleString()} margin
            </span>
          </div>
          {/* Progress Bar for Active Lot */}
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${vehicles.length > 0 ? (availableCount / vehicles.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Card 2: Executed Sales */}
        <div
          onClick={() => setStatusTab("Sold")}
          className="group rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#111827] p-5 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Executed Sales
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
            +{formatCurrency(totalMonthlySales, currency, exchangeRate)}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>{sales.length} legal deeds executed</span>
            <span className="text-slate-600 dark:text-slate-300 font-mono">
              {soldCount} units sold
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{
                width: `${vehicles.length > 0 ? (soldCount / vehicles.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Card 3: Total Fleet Size */}
        <div
          onClick={() => setStatusTab("ALL")}
          className="group rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#111827] p-5 shadow-xs hover:shadow-md hover:border-amber-500/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Fleet Registry
            </span>
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Car className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
            {vehicles.length} Units
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {availableCount} Available
            </span>
            <span>•</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">
              {inTransitCount} En Route
            </span>
            <span>•</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              {reservedCount} Reserved
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full"
              style={{ width: `${(availableCount / vehicles.length) * 100}%` }}
            />
            <div
              className="bg-blue-500 h-full"
              style={{ width: `${(inTransitCount / vehicles.length) * 100}%` }}
            />
            <div
              className="bg-amber-500 h-full"
              style={{ width: `${(reservedCount / vehicles.length) * 100}%` }}
            />
            <div
              className="bg-slate-400 h-full"
              style={{ width: `${(soldCount / vehicles.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Card 4: Customs Port Status */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#111827] p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Customs Status
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
            100% Cleared
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Islam Qala & Gomrok Herat verified</span>
          </div>
          <div className="mt-3 text-[11px] font-mono text-slate-400">
            Tariffs & Maktoubs current
          </div>
        </div>
      </div>

      {/* Main Stock Registry Container */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#111827] shadow-sm overflow-hidden">
        {/* Table Toolbar: Status Filter Tabs + Search */}
        <div className="p-4 border-b border-slate-200/90 dark:border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-900/40">
          {/* Segmented Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {[
              { id: "ALL", label: `All (${vehicles.length})` },
              { id: "Available on Lot", label: `Available (${availableCount})` },
              { id: "In Transit", label: `In Transit (${inTransitCount})` },
              { id: "Reserved/Deposit Paid", label: `Reserved (${reservedCount})` },
              { id: "Sold", label: `Sold (${soldCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  statusTab === tab.id
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs border border-slate-200 dark:border-slate-700"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search stock #, VIN, make, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Bulk Actions Sticky Bar (when rows are selected) */}
        {selectedVehicleIds.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="font-bold">
                {selectedVehicleIds.length} vehicle(s) selected
              </span>
              <button
                onClick={() => setSelectedVehicleIds([])}
                className="text-xs text-blue-600 dark:text-blue-400 underline hover:no-underline"
              >
                Deselect
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                Set Status:
              </span>
              <button
                onClick={() => handleBatchStatus("Available on Lot")}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-[11px] hover:bg-emerald-700"
              >
                Available
              </button>
              <button
                onClick={() => handleBatchStatus("In Transit")}
                className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-semibold text-[11px] hover:bg-blue-700"
              >
                In Transit
              </button>
              <button
                onClick={() => handleBatchStatus("Reserved/Deposit Paid")}
                className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-semibold text-[11px] hover:bg-amber-700"
              >
                Reserved
              </button>
              <button
                onClick={handleBatchExport}
                className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold text-[11px]"
              >
                Export Selected
              </button>
            </div>
          </div>
        )}

        {/* Clean Enterprise Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      processedVehicles.length > 0 &&
                      selectedVehicleIds.length === processedVehicles.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th
                  onClick={() => handleSort("stockNumber")}
                  className="py-3 px-4 cursor-pointer select-none hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Vehicle & Stock</span>
                    {sortField === "stockNumber" ? (
                      sortDir === "asc" ? (
                        <ArrowUp className="h-3 w-3 text-blue-600" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-blue-600" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th className="py-3 px-4">VIN / Chassis</th>
                <th className="py-3 px-4">Status & Quick Change</th>
                <th className="py-3 px-4">Customs Clearance</th>
                <th
                  onClick={() => handleSort("landedCost")}
                  className="py-3 px-4 text-right cursor-pointer select-none hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Landed Cost</span>
                    {sortField === "landedCost" ? (
                      sortDir === "asc" ? (
                        <ArrowUp className="h-3 w-3 text-blue-600" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-blue-600" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("sellingPrice")}
                  className="py-3 px-4 text-right cursor-pointer select-none hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Selling Price</span>
                    {sortField === "sellingPrice" ? (
                      sortDir === "asc" ? (
                        <ArrowUp className="h-3 w-3 text-blue-600" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-blue-600" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Target Margin</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {processedVehicles.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No vehicles found matching current criteria.
                  </td>
                </tr>
              ) : (
                processedVehicles.map((veh) => {
                  const isSelected = selectedVehicleIds.includes(veh.id);
                  const marginAmount = veh.sellingPrice - veh.landedCost;
                  const marginPercent =
                    veh.landedCost > 0
                      ? ((marginAmount / veh.landedCost) * 100).toFixed(1)
                      : "0";

                  return (
                    <tr
                      key={veh.id}
                      className={`transition-colors ${
                        isSelected
                          ? "bg-blue-50/60 dark:bg-blue-950/30"
                          : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(veh.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Vehicle & Stock with Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setQuickViewVehicle(veh)}
                            className="relative h-11 w-14 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group/thumb cursor-pointer"
                            title="Click for quick view"
                          >
                            <Image
                              src={veh.images[0]}
                              alt={veh.model}
                              fill
                              className="object-cover group-hover/thumb:scale-110 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center text-white transition-opacity">
                              <Eye className="h-3 w-3" />
                            </div>
                          </button>

                          <div>
                            <Link
                              href={`/vehicles/${veh.id}`}
                              className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors block"
                            >
                              {veh.year} {veh.make} {veh.model}
                            </Link>
                            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {veh.stockNumber}
                              </span>
                              <span>•</span>
                              <span>{veh.originCountry} Import</span>
                              <span>•</span>
                              <span>{veh.images.length} photos</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* VIN */}
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 text-[11px] select-all">
                        {veh.vin}
                      </td>

                      {/* Inline Status Changer Dropdown */}
                      <td className="py-3 px-4">
                        <select
                          value={veh.status}
                          onChange={(e) =>
                            setVehicleStatus(veh.id, e.target.value as VehicleItem["status"])
                          }
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none cursor-pointer hover:border-slate-400 transition-colors"
                        >
                          <option value="Available on Lot">Available on Lot</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Reserved/Deposit Paid">Reserved / Deposit</option>
                          <option value="Under Prep/Maintenance">Under Prep</option>
                          <option value="Sold">Sold</option>
                        </select>
                      </td>

                      {/* Customs */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate max-w-[140px] text-[11px]">
                            {veh.customsClearance.split("-")[0].trim()}
                          </span>
                        </div>
                      </td>

                      {/* Landed Cost */}
                      <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                        ${veh.landedCost.toLocaleString()}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-bold font-mono text-slate-900 dark:text-white">
                          ${veh.sellingPrice.toLocaleString()}
                        </div>
                        {currency === "AFN" && (
                          <div className="text-[10px] font-mono text-slate-400">
                            ؋ {(veh.sellingPrice * exchangeRate).toLocaleString()}
                          </div>
                        )}
                      </td>

                      {/* Target Margin */}
                      <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        +${marginAmount.toLocaleString()} ({marginPercent}%)
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setQuickViewVehicle(veh)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Quick Inspect"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => setSelectedDeedVehicle(veh)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Generate Official Bilingual Deed"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </button>

                          {currentRole === "SuperAdmin" && (
                            <button
                              onClick={() => {
                                if (confirm(`Delete vehicle ${veh.stockNumber}?`)) {
                                  deleteVehicle(veh.id);
                                  addToast(`Deleted vehicle ${veh.stockNumber}`, "info");
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Delete vehicle"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Clean Footer / Counter */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>
            Showing {processedVehicles.length} of {vehicles.length} fleet records
          </span>
          <span className="font-mono text-[11px]">Herat Bagh-e-Azadi Inventory Ledger</span>
        </div>
      </div>

      {/* Global Modals */}
      <VehicleIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
      />

      <VehicleQuickViewModal
        vehicle={quickViewVehicle}
        isOpen={!!quickViewVehicle}
        onClose={() => setQuickViewVehicle(null)}
        onOpenDeed={(v) => setSelectedDeedVehicle(v)}
      />

      {selectedDeedVehicle && (
        <VehicleDeedModal
          vehicle={selectedDeedVehicle}
          isOpen={!!selectedDeedVehicle}
          onClose={() => setSelectedDeedVehicle(null)}
        />
      )}

      <VehicleCompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
      />

      <CompareBar onOpenCompare={() => setIsCompareOpen(true)} />
    </div>
  );
}
