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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
    clientPresentationMode,
    filters,
    setFilter,
    deleteVehicle,
    setVehicleStatus,
    batchUpdateVehicleStatus,
    addToast,
    compareIds,
  } = useShowroomStore();

  const t = translations[language];
  const showFinancialMargins =
    !clientPresentationMode &&
    (currentRole === "SuperAdmin" || currentRole === "Accountant");

  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [vehicleToDelete, setVehicleToDelete] = useState<VehicleItem | null>(null);

  const [makeFilter, setMakeFilter] = useState("ALL");
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
      if (makeFilter !== "ALL" && v.make !== makeFilter) return false;
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
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
  }, [vehicles, statusTab, makeFilter, filters.search, sortField, sortDir]);

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

  const handleBatchStatus = async (newStatus: VehicleItem["status"]) => {
    if (selectedVehicleIds.length === 0) return;
    try {
      await batchUpdateVehicleStatus(selectedVehicleIds, newStatus);
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Unable to update vehicle statuses", "error");
      return;
    }
    setSelectedVehicleIds([]);
  };

  const handleBatchExport = () => {
    const selected = vehicles.filter((v) => selectedVehicleIds.includes(v.id));
    exportInventoryToCSV(selected.length > 0 ? selected : vehicles);
    addToast(`Exported ${selected.length || vehicles.length} vehicle records to CSV`, "success");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Architectural Terminal Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b border-[#D8D5CD] dark:border-[#242A38]">
        <div>
          <div className="font-mono text-[10px] font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
            SADOZAI MOTORS HERAT // BAGH-E-AZADI SHOWROOM LEDGER
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111318] dark:text-white tracking-tight mt-0.5">
            {language === "ps"
              ? "د نندارتون عملیاتي مرکز"
              : language === "fa"
              ? "مرکز عملیاتی نمایشگاه"
              : "Operations Cockpit & Fleet Ledger"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
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
            Export Ledger CSV
          </MuiButton>

          <MuiButton
            component={Link}
            href="/intake"
            variant="contained"
            color="primary"
            size="small"
            startIcon={<Plus className="h-3.5 w-3.5" />}
          >
            {t.addNewVehicle}
          </MuiButton>
        </div>
      </div>

      {/* Architectural 1px Hairline Ledger Strip (No Pastel Icon Boxes or Floating Orbs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#D8D5CD] dark:bg-[#242A38] border border-[#D8D5CD] dark:border-[#242A38] rounded-md overflow-hidden">
        {/* Cell 01: Active Lot Valuation */}
        <button
          type="button"
          onClick={() => setStatusTab("Available on Lot")}
          className="p-4 sm:p-5 bg-white dark:bg-[#11141B] hover:bg-stone-50/80 dark:hover:bg-white/[0.02] transition-colors text-start flex flex-col justify-between"
        >
          <div className="flex items-center justify-between w-full font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>01 / {t.totalActiveValue}</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
              {activeLotVehicles.length} UNITS
            </span>
          </div>
          <div className="my-2.5 text-2xl sm:text-[26px] font-bold font-mono tabular-nums text-[#111318] dark:text-white tracking-tight leading-none">
            {formatCurrency(totalActiveValue, currency, exchangeRate)}
          </div>
          <div className="pt-2 border-t border-[#EAE8E1] dark:border-[#1B202B] w-full flex items-center justify-between text-[11px] font-mono tabular-nums">
            <span className="text-slate-500">
              {currency === "USD"
                ? `؋ ${(totalActiveValue * exchangeRate).toLocaleString()}`
                : `$${totalActiveValue.toLocaleString()} USD`}
            </span>
            {showFinancialMargins ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                +${totalProjectedProfit.toLocaleString()} NET
              </span>
            ) : (
              <span className="text-slate-400">LOT VALUATION</span>
            )}
          </div>
        </button>

        {/* Cell 02: Executed Sales & Deeds */}
        <button
          type="button"
          onClick={() => setStatusTab("Sold")}
          className="p-4 sm:p-5 bg-white dark:bg-[#11141B] hover:bg-stone-50/80 dark:hover:bg-white/[0.02] transition-colors text-start flex flex-col justify-between"
        >
          <div className="flex items-center justify-between w-full font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>02 / EXECUTED CONTRACTS</span>
            <span className="text-amber-700 dark:text-amber-400 font-semibold">
              {sales.length} DEEDS
            </span>
          </div>
          <div className="my-2.5 text-2xl sm:text-[26px] font-bold font-mono tabular-nums text-[#111318] dark:text-white tracking-tight leading-none">
            {formatCurrency(totalMonthlySales, currency, exchangeRate)}
          </div>
          <div className="pt-2 border-t border-[#EAE8E1] dark:border-[#1B202B] w-full flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-500">
            <span>{soldCount} units transferred</span>
            <span>SARRAFI SETTLED</span>
          </div>
        </button>

        {/* Cell 03: Fleet Composition */}
        <button
          type="button"
          onClick={() => setStatusTab("ALL")}
          className="p-4 sm:p-5 bg-white dark:bg-[#11141B] hover:bg-stone-50/80 dark:hover:bg-white/[0.02] transition-colors text-start flex flex-col justify-between"
        >
          <div className="flex items-center justify-between w-full font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>03 / FLEET ALLOCATION</span>
            <span>GCC · JPN · US</span>
          </div>
          <div className="my-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-[26px] font-bold font-mono tabular-nums text-[#111318] dark:text-white tracking-tight leading-none">
              {vehicles.length}
            </span>
            <span className="font-mono text-xs uppercase text-slate-500">Registered Units</span>
          </div>
          <div className="pt-2 border-t border-[#EAE8E1] dark:border-[#1B202B] w-full flex items-center justify-between text-[11px] font-mono tabular-nums">
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
              {availableCount} LOT
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-amber-700 dark:text-amber-400 font-semibold">
              {inTransitCount} TRANSIT
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600 dark:text-slate-300">
              {reservedCount} RSVD
            </span>
          </div>
        </button>

        {/* Cell 04: Islam Qala Dry Port Clearance */}
        <div className="p-4 sm:p-5 bg-white dark:bg-[#11141B] flex flex-col justify-between">
          <div className="flex items-center justify-between w-full font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>04 / GOMROK CLEARANCE</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">VERIFIED</span>
          </div>
          <div className="my-2.5 text-2xl sm:text-[26px] font-bold font-mono tabular-nums text-[#111318] dark:text-white tracking-tight leading-none">
            100% ACD
          </div>
          <div className="pt-2 border-t border-[#EAE8E1] dark:border-[#1B202B] w-full flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>ISLAM QALA PORT</span>
            <Link
              href="/logistics"
              className="text-[#111318] dark:text-amber-400 font-semibold hover:underline"
            >
              PORT VAULT →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Stock Registry Ledger Table */}
      <div className="rounded-md border border-[#D8D5CD] dark:border-[#242A38] bg-white dark:bg-[#11141B] overflow-hidden">
        {/* Architectural Underlined Tab Bar + Make Filter */}
        <div className="px-4 border-b border-[#D8D5CD] dark:border-[#242A38] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF9F6] dark:bg-[#0D1017]">
          <div className="flex items-center gap-5 overflow-x-auto scrollbar-none -mb-px">
            {[
              { id: "ALL", name: "All Fleet", count: vehicles.length },
              { id: "Available on Lot", name: "On Lot", count: availableCount },
              { id: "In Transit", name: "In Transit", count: inTransitCount },
              { id: "Reserved/Deposit Paid", name: "Reserved", count: reservedCount },
              { id: "Sold", name: "Sold", count: soldCount },
            ].map((tab) => {
              const isActive = statusTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusTab(tab.id as any)}
                  className={`py-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 shrink-0 ${
                    isActive
                      ? "border-[#111318] dark:border-amber-500 text-[#111318] dark:text-white"
                      : "border-transparent text-slate-500 hover:text-[#111318] dark:hover:text-slate-200"
                  }`}
                >
                  <span>{tab.name}</span>
                  <span
                    className={`font-mono tabular-nums text-[11px] ${
                      isActive
                        ? "text-amber-700 dark:text-amber-400 font-bold"
                        : "text-slate-400"
                    }`}
                  >
                    [{tab.count}]
                  </span>
                </button>
              );
            })}
          </div>

          {/* Table Make Filter & Counter */}
          <div className="flex flex-wrap items-center gap-2.5 py-2 sm:py-0 shrink-0">
            <select
              value={makeFilter}
              onChange={(e) => setMakeFilter(e.target.value)}
              className="h-7 ps-2.5 pe-6 text-xs rounded border border-[#D8D5CD] dark:border-[#242A38] bg-white dark:bg-[#11141B] text-[#111318] dark:text-slate-200 font-medium outline-none focus:border-[#111318] dark:focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">{t.allMakes}</option>
              <option value="Toyota">Toyota</option>
              <option value="Lexus">Lexus</option>
            </select>

            {(filters.search || makeFilter !== "ALL" || statusTab !== "ALL") && (
              <button
                onClick={() => {
                  setFilter("search", "");
                  setMakeFilter("ALL");
                  setStatusTab("ALL");
                }}
                className="text-xs font-mono font-semibold text-rose-700 dark:text-rose-400 hover:underline px-1 cursor-pointer"
              >
                RESET
              </button>
            )}

            <span className="text-[11px] font-mono tabular-nums text-slate-400">
              {processedVehicles.length}/{vehicles.length} RECORDS
            </span>
          </div>
        </div>

        {/* Bulk Actions Sticky Bar (when rows are selected) */}
        {selectedVehicleIds.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2 bg-[#111318] text-white border-b border-white/10 text-xs">
            <div className="flex items-center gap-3 font-mono">
              <span className="font-bold text-amber-400">
                {selectedVehicleIds.length} SELECTED
              </span>
              <button
                onClick={() => setSelectedVehicleIds([])}
                className="text-[11px] text-slate-300 underline hover:text-white"
              >
                Clear
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline me-1">
                BATCH STATUS:
              </span>
              <button
                onClick={() => handleBatchStatus("Available on Lot")}
                className="px-2.5 py-1 rounded bg-emerald-700 text-white font-mono font-semibold text-[11px] hover:bg-emerald-600"
              >
                ON LOT
              </button>
              <button
                onClick={() => handleBatchStatus("In Transit")}
                className="px-2.5 py-1 rounded bg-amber-700 text-white font-mono font-semibold text-[11px] hover:bg-amber-600"
              >
                TRANSIT
              </button>
              <button
                onClick={() => handleBatchStatus("Reserved/Deposit Paid")}
                className="px-2.5 py-1 rounded bg-slate-700 text-white font-mono font-semibold text-[11px] hover:bg-slate-600"
              >
                RESERVED
              </button>
              <button
                onClick={handleBatchExport}
                className="px-2.5 py-1 rounded border border-white/20 bg-white/10 text-white font-mono font-semibold text-[11px] hover:bg-white/20"
              >
                CSV
              </button>
            </div>
          </div>
        )}

        {/* Dense Institutional Data Table */}
        <MuiTableContainer className="overflow-x-auto !border-0 !rounded-none">
          <MuiTable dense size="small" className="w-full">
            <MuiTableHead>
              <MuiTableRow hover={false}>
                <MuiTableCell header className="w-8 !px-2 text-center">
                  <input
                    type="checkbox"
                    checked={
                      processedVehicles.length > 0 &&
                      selectedVehicleIds.length === processedVehicles.length
                    }
                    onChange={handleSelectAll}
                    className="h-3.5 w-3.5 rounded border-stone-300 accent-[#111318] dark:accent-amber-500 cursor-pointer"
                  />
                </MuiTableCell>
                <MuiTableCell
                  header
                  onClick={() => handleSort("stockNumber")}
                  className="cursor-pointer select-none hover:text-[#111318] dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>LOT #, VEHICLE & CHASSIS VIN</span>
                    {sortField === "stockNumber" ? (
                      sortDir === "asc" ? (
                        <ArrowUp className="h-3 w-3 text-amber-600" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-amber-600" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    )}
                  </div>
                </MuiTableCell>
                <MuiTableCell header>STATUS</MuiTableCell>
                <MuiTableCell header>GOMROK / PORT</MuiTableCell>
                {showFinancialMargins && (
                  <MuiTableCell
                    header
                    align="right"
                    onClick={() => handleSort("landedCost")}
                    className="cursor-pointer select-none hover:text-[#111318] dark:hover:text-white"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>{t.totalLanded}</span>
                      {sortField === "landedCost" ? (
                        sortDir === "asc" ? (
                          <ArrowUp className="h-3 w-3 text-amber-600" />
                        ) : (
                          <ArrowDown className="h-3 w-3 text-amber-600" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      )}
                    </div>
                  </MuiTableCell>
                )}
                <MuiTableCell
                  header
                  align="right"
                  onClick={() => handleSort("sellingPrice")}
                  className="cursor-pointer select-none hover:text-[#111318] dark:hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>{t.sellingPrice}</span>
                    {sortField === "sellingPrice" ? (
                      sortDir === "asc" ? (
                        <ArrowUp className="h-3 w-3 text-amber-600" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-amber-600" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    )}
                  </div>
                </MuiTableCell>
                {showFinancialMargins && (
                  <MuiTableCell header align="right">{t.targetMargin}</MuiTableCell>
                )}
                <MuiTableCell header align="right" className="!pe-3">DOSSIER</MuiTableCell>
              </MuiTableRow>
            </MuiTableHead>
            <MuiTableBody>
              {processedVehicles.length === 0 ? (
                <MuiTableRow>
                  <MuiTableCell colSpan={showFinancialMargins ? 8 : 6} align="center" className="py-10 text-slate-400 font-mono text-xs">
                    {t.noVehiclesFound}
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
                        isSelected ? "bg-amber-500/[0.06]" : undefined
                      }
                    >
                      {/* Checkbox */}
                      <MuiTableCell className="w-8 !px-2 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(veh.id)}
                          className="h-3.5 w-3.5 rounded border-stone-300 accent-[#111318] dark:accent-amber-500 cursor-pointer"
                        />
                      </MuiTableCell>

                      {/* Vehicle, Stock & VIN */}
                      <MuiTableCell className="py-2">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/vehicles/${veh.id}`}
                            className="relative h-8 w-12 shrink-0 rounded overflow-hidden bg-stone-100 dark:bg-slate-800 border border-[#D8D5CD] dark:border-[#242A38] block group/thumb"
                            title="Inspect vehicle dossier"
                          >
                            <Image
                              src={veh.images[0]}
                              alt={veh.model}
                              fill
                              className="object-cover group-hover/thumb:scale-105 transition-transform"
                            />
                          </Link>

                          <div className="min-w-0">
                            <Link
                              href={`/vehicles/${veh.id}`}
                              className="font-bold text-xs text-[#111318] dark:text-white hover:text-amber-700 dark:hover:text-amber-400 transition-colors block truncate leading-tight"
                            >
                              {veh.year} {veh.make} {veh.model}{" "}
                              <span className="font-normal text-slate-500">{veh.trim}</span>
                            </Link>
                            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                              <span className="font-semibold text-[#111318] dark:text-amber-400">
                                {veh.stockNumber}
                              </span>
                              <span className="text-slate-300 dark:text-slate-700">|</span>
                              <span className="select-all text-slate-500 font-mono tracking-tight">
                                {veh.vin}
                              </span>
                              <span className="text-slate-300 dark:text-slate-700">|</span>
                              <span>{veh.originCountry}</span>
                            </div>
                          </div>
                        </div>
                      </MuiTableCell>

                      {/* Architectural Rectangular Status Select */}
                      <MuiTableCell className="py-2 whitespace-nowrap">
                        <div className="relative inline-block">
                          <select
                            value={veh.status}
                            onChange={(e) =>
                              void setVehicleStatus(
                                veh.id,
                                e.target.value as VehicleItem["status"]
                              ).catch((error) => addToast(error.message, "error"))
                            }
                            className={`text-[11px] font-mono font-semibold rounded px-2 py-0.5 border transition-all cursor-pointer outline-none appearance-none pe-5 leading-tight ${
                              veh.status === "Available on Lot"
                                ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30"
                                : veh.status === "In Transit"
                                ? "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30"
                                : veh.status === "Reserved/Deposit Paid"
                                ? "bg-stone-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-stone-300 dark:border-slate-700"
                                : "bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            <option value="Available on Lot">ON LOT</option>
                            <option value="In Transit">IN TRANSIT</option>
                            <option value="Reserved/Deposit Paid">RESERVED</option>
                            <option value="Under Prep/Maintenance">PREP</option>
                            <option value="Sold">SOLD</option>
                          </select>
                          <ChevronDown className="h-2.5 w-2.5 text-current opacity-60 absolute end-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </MuiTableCell>

                      {/* Customs */}
                      <MuiTableCell className="py-2 whitespace-nowrap">
                        <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300">
                          {veh.customsClearance.split("-")[0].trim()}
                        </span>
                      </MuiTableCell>

                      {/* Landed Cost */}
                      {showFinancialMargins && (
                        <MuiTableCell align="right" className="py-2 font-mono tabular-nums text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          ${veh.landedCost.toLocaleString()}
                        </MuiTableCell>
                      )}

                      {/* Selling Price */}
                      <MuiTableCell align="right" className="py-2 whitespace-nowrap">
                        <div className="font-bold font-mono tabular-nums text-xs text-[#111318] dark:text-white">
                          ${veh.sellingPrice.toLocaleString()}
                        </div>
                        <div className="text-[10px] font-mono tabular-nums text-slate-400 leading-none mt-0.5">
                          ؋ {(veh.sellingPrice * exchangeRate).toLocaleString()}
                        </div>
                      </MuiTableCell>

                      {/* Target Margin */}
                      {showFinancialMargins && (
                        <MuiTableCell align="right" className="py-2 whitespace-nowrap">
                          <span className="font-mono tabular-nums font-bold text-xs text-emerald-700 dark:text-emerald-400">
                            +${marginAmount.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono tabular-nums ms-1">
                            ({marginPercent}%)
                          </span>
                        </MuiTableCell>
                      )}

                      {/* Actions */}
                      <MuiTableCell align="right" className="py-2 whitespace-nowrap !pe-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/vehicles/${veh.id}`}
                            className="px-2 py-1 rounded border border-[#D8D5CD] dark:border-[#242A38] hover:border-[#111318] dark:hover:border-amber-500 text-[11px] font-mono font-semibold text-[#111318] dark:text-slate-200 transition-colors"
                            title="Inspect vehicle dossier"
                          >
                            INSPECT
                          </Link>

                          <Link
                            href={`/vehicles/${veh.id}/deed`}
                            className="p-1 rounded border border-[#D8D5CD] dark:border-[#242A38] hover:border-amber-600 text-slate-600 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
                            title="Generate Official Bilingual Deed"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </Link>

                          {currentRole === "SuperAdmin" && (
                            <button
                              onClick={() => setVehicleToDelete(veh)}
                              className="p-1 rounded border border-transparent hover:border-rose-500/40 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete vehicle"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
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

        {/* Ledger Footer */}
        <div className="px-4 py-2.5 border-t border-[#D8D5CD] dark:border-[#242A38] bg-[#FAF9F6] dark:bg-[#0D1017] text-[11px] font-mono text-slate-500 flex items-center justify-between">
          <span>
            SHOWING {processedVehicles.length} OF {vehicles.length} REGISTERED UNITS
          </span>
          <span>EXCHANGE RATE: 1 USD = {exchangeRate} AFN</span>
        </div>
      </div>

      {/* Delete Confirmation Dialog (Replaces native window.confirm) */}
      <Dialog
        open={Boolean(vehicleToDelete)}
        onClose={() => setVehicleToDelete(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle className="text-sm font-bold text-slate-900 dark:text-white">
          Confirm Vehicle Removal
        </DialogTitle>
        <DialogContent className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
          <p>
            Are you sure you want to permanently remove{" "}
            <strong className="text-slate-900 dark:text-white">
              {vehicleToDelete?.year} {vehicleToDelete?.make} {vehicleToDelete?.model}
            </strong>{" "}
            (Stock #{vehicleToDelete?.stockNumber}) from the showroom registry?
          </p>
        </DialogContent>
        <DialogActions className="p-3 border-t border-slate-100 dark:border-slate-800">
          <MuiButton
            variant="outlined"
            color="inherit"
            size="small"
            onClick={() => setVehicleToDelete(null)}
          >
            Cancel
          </MuiButton>
          <MuiButton
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              if (!vehicleToDelete) return;
              const target = vehicleToDelete;
              setVehicleToDelete(null);
              try {
                await deleteVehicle(target.id);
                addToast(`Deleted vehicle ${target.stockNumber}`, "info");
              } catch (error) {
                addToast(
                  error instanceof Error ? error.message : "Unable to delete vehicle",
                  "error"
                );
              }
            }}
          >
            Delete Vehicle
          </MuiButton>
        </DialogActions>
      </Dialog>

      <CompareBar />
    </div>
  );
}
