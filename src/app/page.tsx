"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { formatCurrency } from "@/lib/utils";
import { CompareBar } from "@/components/CompareBar";
import { VehicleItem } from "@/lib/mock-data";
import { exportInventoryToCSV } from "@/lib/export-utils";
import {
  MuiButton,
  MuiCard,
  MuiChip,
  MuiTableContainer,
  MuiTable,
  MuiTableHead,
  MuiTableBody,
  MuiTableRow,
  MuiTableCell,
  MuiTextField,
  MenuItem,
  IconButton,
} from "@/components/mui";
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
          <MuiButton
            variant="outlined"
            color="inherit"
            size="small"
            onClick={() => {
              exportInventoryToCSV(vehicles);
              addToast("Exported fleet inventory to CSV", "success");
            }}
            startIcon={<Download className="h-3.5 w-3.5" />}
          >
            Export CSV
          </MuiButton>

          <MuiButton
            component={Link}
            href="/intake"
            variant="contained"
            color="primary"
            size="small"
            startIcon={<Plus className="h-4 w-4" />}
          >
            {t.addNewVehicle}
          </MuiButton>
        </div>
      </div>

      {/* 4 Interactive Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Lot Valuation */}
        <div
          onClick={() => setStatusTab("Available on Lot")}
          className="p-5 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800/90 hover:border-blue-500/40 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="absolute top-0 end-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Lot Valuation
            </span>
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
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
              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${vehicles.length > 0 ? (availableCount / vehicles.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Card 2: Executed Sales */}
        <div
          onClick={() => setStatusTab("Sold")}
          className="p-5 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800/90 hover:border-emerald-500/40 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="absolute top-0 end-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Executed Sales
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
            +{formatCurrency(totalMonthlySales, currency, exchangeRate)}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>{sales.length} legal deeds executed</span>
            <span className="text-slate-700 dark:text-slate-300 font-mono font-medium">
              {soldCount} units sold
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${vehicles.length > 0 ? (soldCount / vehicles.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Card 3: Total Fleet Size */}
        <div
          onClick={() => setStatusTab("ALL")}
          className="p-5 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800/90 hover:border-amber-500/40 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="absolute top-0 end-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Fleet Registry
            </span>
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40">
              <Car className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
            {vehicles.length} Units
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {availableCount} Available
            </span>
            <span>•</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">
              {inTransitCount} Transit
            </span>
            <span>•</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              {reservedCount} Reserved
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full"
              style={{ width: `${vehicles.length > 0 ? (availableCount / vehicles.length) * 100 : 0}%` }}
            />
            <div
              className="bg-blue-500 h-full"
              style={{ width: `${vehicles.length > 0 ? (inTransitCount / vehicles.length) * 100 : 0}%` }}
            />
            <div
              className="bg-amber-500 h-full"
              style={{ width: `${vehicles.length > 0 ? (reservedCount / vehicles.length) * 100 : 0}%` }}
            />
            <div
              className="bg-slate-400 h-full"
              style={{ width: `${vehicles.length > 0 ? (soldCount / vehicles.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Card 4: Customs Port Status */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800/90 shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 end-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Port Clearance
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
            100% Cleared
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">Islam Qala & Gomrok verified</span>
          </div>
          <div className="mt-3 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
            Tariffs & Maktoubs current
          </div>
        </div>
      </div>

      {/* Main Stock Registry Container */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#111827] shadow-sm overflow-hidden">
        {/* Table Toolbar: Status Filter Tabs + Search */}
        <div className="p-3 sm:p-4 border-b border-slate-200/90 dark:border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-900/40">
          {/* Segmented Status Pill Strip */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 overflow-x-auto scrollbar-none max-w-full">
            {[
              { id: "ALL", name: "All Fleet", count: vehicles.length },
              { id: "Available on Lot", name: "Available", count: availableCount },
              { id: "In Transit", name: "In Transit", count: inTransitCount },
              { id: "Reserved/Deposit Paid", name: "Reserved", count: reservedCount },
              { id: "Sold", name: "Sold", count: soldCount },
            ].map((tab) => {
              const isActive = statusTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span>{tab.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold"
                        : "bg-black/5 dark:bg-white/5 text-slate-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Table Quick Filter Input */}
          <div className="relative flex items-center shrink-0">
            <Search className="absolute start-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter stock #, VIN, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 ps-8 pe-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute end-2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="h-3 w-3" />
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
        <MuiTableContainer className="overflow-x-auto">
          <MuiTable dense>
            <MuiTableHead>
              <MuiTableRow hover={false}>
                <MuiTableCell header className="w-10">
                  <input
                    type="checkbox"
                    checked={
                      processedVehicles.length > 0 &&
                      selectedVehicleIds.length === processedVehicles.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </MuiTableCell>
                <MuiTableCell
                  header
                  onClick={() => handleSort("stockNumber")}
                  className="cursor-pointer select-none hover:text-slate-900 dark:hover:text-white"
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
                </MuiTableCell>
                <MuiTableCell header>VIN / Chassis</MuiTableCell>
                <MuiTableCell header>Status</MuiTableCell>
                <MuiTableCell header>Customs Clearance</MuiTableCell>
                <MuiTableCell
                  header
                  align="right"
                  onClick={() => handleSort("landedCost")}
                  className="cursor-pointer select-none hover:text-slate-900 dark:hover:text-white"
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
                </MuiTableCell>
                <MuiTableCell
                  header
                  align="right"
                  onClick={() => handleSort("sellingPrice")}
                  className="cursor-pointer select-none hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Listed Price</span>
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
                </MuiTableCell>
                <MuiTableCell header align="right">Margin</MuiTableCell>
                <MuiTableCell header align="right">Actions</MuiTableCell>
              </MuiTableRow>
            </MuiTableHead>
            <MuiTableBody>
              {processedVehicles.length === 0 ? (
                <MuiTableRow>
                  <MuiTableCell colSpan={9} align="center" className="py-12 text-slate-400">
                    No vehicles found matching current criteria.
                  </MuiTableCell>
                </MuiTableRow>
              ) : (
                processedVehicles.map((veh) => {
                  const isSelected = selectedVehicleIds.includes(veh.id);
                  const marginAmount = veh.sellingPrice - veh.landedCost;
                  const marginPercent =
                    veh.landedCost > 0
                      ? ((marginAmount / veh.landedCost) * 100).toFixed(1)
                      : "0";

                  return (
                    <MuiTableRow
                      key={veh.id}
                      className={
                        isSelected ? "bg-blue-50/60 dark:bg-blue-950/30" : undefined
                      }
                    >
                      {/* Checkbox */}
                      <MuiTableCell>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(veh.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </MuiTableCell>

                      {/* Vehicle & Stock with Thumbnail */}
                      <MuiTableCell>
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/vehicles/${veh.id}`}
                            className="relative h-11 w-14 shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group/thumb cursor-pointer block shadow-2xs"
                            title="Inspect vehicle dossier"
                          >
                            <Image
                              src={veh.images[0]}
                              alt={veh.model}
                              fill
                              className="object-cover group-hover/thumb:scale-110 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center text-white transition-opacity">
                              <Eye className="h-3.5 w-3.5" />
                            </div>
                          </Link>

                          <div>
                            <Link
                              href={`/vehicles/${veh.id}`}
                              className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors block leading-snug"
                            >
                              {veh.year} {veh.make} {veh.model}
                            </Link>
                            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                              <span className="font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.2 rounded border border-blue-200/50 dark:border-blue-900/50">
                                {veh.stockNumber}
                              </span>
                              <span>•</span>
                              <span>{veh.originCountry} Import</span>
                              <span>•</span>
                              <span>{veh.images.length} photos</span>
                            </div>
                          </div>
                        </div>
                      </MuiTableCell>

                      {/* VIN */}
                      <MuiTableCell className="font-mono text-slate-600 dark:text-slate-400 text-xs select-all whitespace-nowrap">
                        {veh.vin}
                      </MuiTableCell>

                      {/* Interactive Status Pill Badge */}
                      <MuiTableCell>
                        <div className="relative inline-block">
                          <select
                            value={veh.status}
                            onChange={(e) =>
                              setVehicleStatus(veh.id, e.target.value as VehicleItem["status"])
                            }
                            className={`text-xs font-semibold rounded-full px-2.5 py-1 border transition-all cursor-pointer outline-none appearance-none pe-6 ${
                              veh.status === "Available on Lot"
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                                : veh.status === "In Transit"
                                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800"
                                : veh.status === "Reserved/Deposit Paid"
                                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                                : veh.status === "Sold"
                                ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                                : "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800"
                            }`}
                          >
                            <option value="Available on Lot">Available on Lot</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Reserved/Deposit Paid">Reserved</option>
                            <option value="Under Prep/Maintenance">Under Prep</option>
                            <option value="Sold">Sold</option>
                          </select>
                          <ChevronDown className="h-3 w-3 text-current opacity-60 absolute end-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </MuiTableCell>

                      {/* Customs */}
                      <MuiTableCell className="text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="text-[11px] font-medium">
                            {veh.customsClearance.split("-")[0].trim()}
                          </span>
                        </div>
                      </MuiTableCell>

                      {/* Landed Cost */}
                      <MuiTableCell align="right" className="font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        ${veh.landedCost.toLocaleString()}
                      </MuiTableCell>

                      {/* Selling Price */}
                      <MuiTableCell align="right" className="whitespace-nowrap">
                        <div className="font-bold font-mono text-xs sm:text-sm text-slate-900 dark:text-white">
                          ${veh.sellingPrice.toLocaleString()}
                        </div>
                        {currency === "AFN" && (
                          <div className="text-[10px] font-mono text-slate-400">
                            ؋ {(veh.sellingPrice * exchangeRate).toLocaleString()}
                          </div>
                        )}
                      </MuiTableCell>

                      {/* Target Margin */}
                      <MuiTableCell align="right" className="whitespace-nowrap">
                        <div className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                          +${marginAmount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-emerald-500/80 font-mono">
                          ({marginPercent}%)
                        </div>
                      </MuiTableCell>

                      {/* Actions */}
                      <MuiTableCell align="right" className="whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <IconButton
                            component={Link}
                            href={`/vehicles/${veh.id}`}
                            size="small"
                            color="primary"
                            title="Inspect vehicle dossier"
                          >
                            <Eye className="h-4 w-4" />
                          </IconButton>

                          <IconButton
                            component={Link}
                            href={`/vehicles/${veh.id}/deed`}
                            size="small"
                            color="warning"
                            title="Generate Official Bilingual Deed"
                          >
                            <FileText className="h-4 w-4" />
                          </IconButton>

                          {currentRole === "SuperAdmin" && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                if (confirm(`Delete vehicle ${veh.stockNumber}?`)) {
                                  deleteVehicle(veh.id);
                                  addToast(`Deleted vehicle ${veh.stockNumber}`, "info");
                                }
                              }}
                              title="Delete vehicle"
                            >
                              <Trash2 className="h-4 w-4" />
                            </IconButton>
                          )}
                        </div>
                      </MuiTableCell>
                    </MuiTableRow>
                  );
                })
              )}
            </MuiTableBody>
          </MuiTable>
        </MuiTableContainer>

        {/* Clean Footer / Counter */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>
            Showing {processedVehicles.length} of {vehicles.length} fleet records
          </span>
          <span className="font-mono text-[11px]">Herat Bagh-e-Azadi Inventory Ledger</span>
        </div>
      </div>

      <CompareBar />
    </div>
  );
}
