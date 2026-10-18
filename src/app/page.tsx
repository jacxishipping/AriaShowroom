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
            variant="contained"
            color="primary"
            size="small"
            onClick={() => setIsIntakeOpen(true)}
            startIcon={<Plus className="h-4 w-4" />}
          >
            {t.addNewVehicle}
          </MuiButton>
        </div>
      </div>

      {/* 4 Interactive Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Lot Valuation */}
        <MuiCard
          elevation={1}
          onClick={() => setStatusTab("Available on Lot")}
          className="p-5 cursor-pointer hover:shadow-md transition-all relative overflow-hidden"
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
        </MuiCard>

        {/* Card 2: Executed Sales */}
        <MuiCard
          elevation={1}
          onClick={() => setStatusTab("Sold")}
          className="p-5 cursor-pointer hover:shadow-md transition-all"
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
        </MuiCard>

        {/* Card 3: Total Fleet Size */}
        <MuiCard
          elevation={1}
          onClick={() => setStatusTab("ALL")}
          className="p-5 cursor-pointer hover:shadow-md transition-all"
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
        </MuiCard>

        {/* Card 4: Customs Port Status */}
        <MuiCard elevation={1} className="p-5">
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
        </MuiCard>
      </div>

      {/* Main Stock Registry Container */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#111827] shadow-sm overflow-hidden">
        {/* Table Toolbar: Status Filter Tabs + Search */}
        <div className="p-4 border-b border-slate-200/90 dark:border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-900/40">
          {/* Segmented Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {[
              { id: "ALL", label: `All (${vehicles.length})` },
              { id: "Available on Lot", label: `Available (${availableCount})` },
              { id: "In Transit", label: `In Transit (${inTransitCount})` },
              { id: "Reserved/Deposit Paid", label: `Reserved (${reservedCount})` },
              { id: "Sold", label: `Sold (${soldCount})` },
            ].map((tab) => (
              <MuiChip
                key={tab.id}
                label={tab.label}
                clickable
                color={statusTab === tab.id ? "primary" : "default"}
                variant={statusTab === tab.id ? "filled" : "outlined"}
                onClick={() => setStatusTab(tab.id as any)}
              />
            ))}
          </div>

          {/* Search Box */}
          <MuiTextField
            size="small"
            placeholder="Search stock #, VIN, make, model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startAdornment={<Search className="h-3.5 w-3.5 text-slate-400" />}
            className="w-full md:w-72"
          />
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
                <MuiTableCell header>Status & Quick Change</MuiTableCell>
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
                </MuiTableCell>
                <MuiTableCell header align="right">Target Margin</MuiTableCell>
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
                      </MuiTableCell>

                      {/* VIN */}
                      <MuiTableCell className="font-mono text-slate-600 dark:text-slate-400 text-[11px] select-all">
                        {veh.vin}
                      </MuiTableCell>

                      {/* Inline Status Changer Dropdown */}
                      <MuiTableCell>
                        <MuiTextField
                          select
                          size="small"
                          value={veh.status}
                          onChange={(e) =>
                            setVehicleStatus(veh.id, e.target.value as VehicleItem["status"])
                          }
                          sx={{ minWidth: 150 }}
                        >
                          <MenuItem value="Available on Lot">Available on Lot</MenuItem>
                          <MenuItem value="In Transit">In Transit</MenuItem>
                          <MenuItem value="Reserved/Deposit Paid">Reserved / Deposit</MenuItem>
                          <MenuItem value="Under Prep/Maintenance">Under Prep</MenuItem>
                          <MenuItem value="Sold">Sold</MenuItem>
                        </MuiTextField>
                      </MuiTableCell>

                      {/* Customs */}
                      <MuiTableCell className="text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate max-w-[140px] text-[11px]">
                            {veh.customsClearance.split("-")[0].trim()}
                          </span>
                        </div>
                      </MuiTableCell>

                      {/* Landed Cost */}
                      <MuiTableCell align="right" className="font-mono text-slate-600 dark:text-slate-400">
                        ${veh.landedCost.toLocaleString()}
                      </MuiTableCell>

                      {/* Selling Price */}
                      <MuiTableCell align="right">
                        <div className="font-bold font-mono text-slate-900 dark:text-white">
                          ${veh.sellingPrice.toLocaleString()}
                        </div>
                        {currency === "AFN" && (
                          <div className="text-[10px] font-mono text-slate-400">
                            ؋ {(veh.sellingPrice * exchangeRate).toLocaleString()}
                          </div>
                        )}
                      </MuiTableCell>

                      {/* Target Margin */}
                      <MuiTableCell align="right" className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        +${marginAmount.toLocaleString()} ({marginPercent}%)
                      </MuiTableCell>

                      {/* Actions */}
                      <MuiTableCell align="right">
                        <div className="flex items-center justify-end gap-1">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => setQuickViewVehicle(veh)}
                            title="Quick Inspect"
                          >
                            <Eye className="h-4 w-4" />
                          </IconButton>

                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => setSelectedDeedVehicle(veh)}
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
