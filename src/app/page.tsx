"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { formatCurrency } from "@/lib/utils";
import { CompareBar } from "@/components/CompareBar";
import { FloatingBatchToolbar } from "@/components/FloatingBatchToolbar";
import { WorkflowAlerts } from "@/components/WorkflowAlerts";
import { PinnedViewsBar } from "@/components/PinnedViewsBar";
import { LookerAnalyticsStrip } from "@/components/LookerAnalyticsStrip";
import { VehicleItem } from "@/lib/mock-data";
import { exportInventoryToCSV } from "@/lib/export-utils";
import {
  MuiButton,
  MuiTableContainer,
  MuiTable,
  MuiTableHead,
  MuiTableBody,
  MuiTableRow,
  MuiTableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@/components/mui";
import {
  Car,
  Plus,
  Trash2,
  FileText,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  PanelRightOpen,
  BarChart3,
  Keyboard,
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
    resetFilters,
    chartFilter,
    setChartFilter,
    inspectedVehicleId,
    setInspectedVehicleId,
    setIsShortcutsModalOpen,
    deleteVehicle,
    setVehicleStatus,
    batchUpdateVehicleStatus,
    batchAdjustVehiclePrice,
    addToast,
    branding,
  } = useShowroomStore();

  const t = translations[language];
  const showFinancialMargins =
    !clientPresentationMode &&
    (currentRole === "SuperAdmin" || currentRole === "Accountant");

  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [vehicleToDelete, setVehicleToDelete] = useState<VehicleItem | null>(null);
  const [showLookerAnalytics, setShowLookerAnalytics] = useState(true);

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

  // Filter & sort (integrating global filters, PinnedViews, and Looker Studio chartFilter)
  const processedVehicles = useMemo(() => {
    const list = vehicles.filter((v) => {
      if (filters.status !== "ALL" && v.status !== filters.status) return false;
      if (filters.make !== "ALL" && v.make !== filters.make) return false;
      if (filters.bodyType !== "ALL" && v.bodyType !== filters.bodyType) return false;
      if (filters.fuelType !== "ALL" && v.fuelType !== filters.fuelType) return false;
      if (filters.originCountry !== "ALL" && v.originCountry !== filters.originCountry)
        return false;
      if (filters.maxPrice && v.sellingPrice > filters.maxPrice) return false;
      if (filters.minPrice && v.sellingPrice < filters.minPrice) return false;

      if (chartFilter) {
        if (v[chartFilter.dimension] !== chartFilter.value) return false;
      }

      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        return (
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.stockNumber.toLowerCase().includes(q) ||
          v.vin.toLowerCase().includes(q) ||
          v.originCountry.toLowerCase().includes(q)
        );
      }
      return true;
    });

    list.sort((a, b) => {
      const valA: any = a[sortField];
      const valB: any = b[sortField];
      if (typeof valA === "string") {
        return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortDir === "asc" ? valA - valB : valB - valA;
    });

    return list;
  }, [vehicles, filters, chartFilter, sortField, sortDir]);

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
      addToast(
        error instanceof Error ? error.message : t.inventoryUpdateStatusesError,
        "error"
      );
      return;
    }
    setSelectedVehicleIds([]);
  };

  const handleBatchPriceAdjust = async (deltaPct: number) => {
    if (selectedVehicleIds.length === 0) return;
    await batchAdjustVehiclePrice(selectedVehicleIds, deltaPct);
  };

  const handleBatchExport = () => {
    const selected = vehicles.filter((v) => selectedVehicleIds.includes(v.id));
    exportInventoryToCSV(selected.length > 0 ? selected : processedVehicles);
    addToast(
      t.inventoryExportedVehicles.replace(
        "{count}",
        String(selected.length || processedVehicles.length)
      ),
      "success"
    );
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Google Cloud Console Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b border-slate-200 dark:border-[#262F40]">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Sadozai Motors Herat</span>
            <span>·</span>
            <span>Bagh-e-Azadi Showroom</span>
            <span>·</span>
            <span className="font-mono text-[#1A73E8] dark:text-[#8AB4F8] font-semibold">
              {t.dashboardLicense} #49912
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
            {language === "ps"
              ? "د نندارتون عملیاتي مرکز"
              : language === "fa"
              ? "مرکز عملیاتی نمایشگاه"
              : "Operations Cockpit & Fleet Console"}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLookerAnalytics(!showLookerAnalytics)}
            className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-md border text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              showLookerAnalytics
                ? "border-[#1A73E8] bg-[#1A73E8]/10 text-[#1A73E8] dark:text-[#8AB4F8]"
                : "border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] text-slate-700 dark:text-slate-300"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>{t.dashboardLookerCohorts}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsShortcutsModalOpen(true)}
            className="hidden md:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-[#1A73E8]"
            title={t.dashboardKeyboardShortcutsTitle}
          >
            <Keyboard className="h-3.5 w-3.5" />
            <span>{t.dashboardKeyboardShortcuts}</span>
          </button>

          <MuiButton
            variant="outlined"
            color="inherit"
            size="small"
            onClick={() => {
              exportInventoryToCSV(processedVehicles);
              addToast(
                t.dashboardExportedFleet.replace("{count}", String(processedVehicles.length)),
                "success"
              );
            }}
            startIcon={<Download className="h-3.5 w-3.5" />}
          >
            {t.inventoryExportCsv}
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

      {/* Customizable Pinned Views & Saved Filter Presets */}
      <PinnedViewsBar />
      <WorkflowAlerts />

      {/* Google Cloud 1px Hairline KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 dark:bg-[#262F40] border border-slate-200 dark:border-[#262F40] rounded-lg overflow-hidden">
        {/* Cell 01: Active Lot Valuation */}
        <button
          type="button"
          onClick={() => setFilter("status", "Available on Lot")}
          className="p-4 sm:p-5 bg-white dark:bg-[#161B26] hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors text-start flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between w-full text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>01. {t.totalActiveValue}</span>
            <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
              {activeLotVehicles.length} {t.units}
            </span>
          </div>
          <div className="my-2.5 text-2xl sm:text-[26px] font-bold font-mono tabular-nums text-slate-900 dark:text-white tracking-tight leading-none">
            {formatCurrency(totalActiveValue, currency, exchangeRate)}
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-[#262F40] w-full flex items-center justify-between text-[11px] font-mono tabular-nums">
            <span className="text-slate-500">
              {currency === "USD"
                ? `؋ ${(totalActiveValue * exchangeRate).toLocaleString()}`
                : `$${totalActiveValue.toLocaleString()} USD`}
            </span>
            {showFinancialMargins ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                +${totalProjectedProfit.toLocaleString()} {t.dashboardNet}
              </span>
            ) : (
              <span className="text-slate-400">{t.dashboardLotValuation}</span>
            )}
          </div>
        </button>

        {/* Cell 02: Executed Sales & Deeds */}
        <button
          type="button"
          onClick={() => setFilter("status", "Sold")}
          className="p-4 sm:p-5 bg-white dark:bg-[#161B26] hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors text-start flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between w-full text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>02. {t.dashboardExecutedContracts}</span>
            <span className="font-mono text-[11px] text-[#1A73E8] dark:text-[#8AB4F8]">
              {sales.length} {t.dashboardDeeds}
            </span>
          </div>
          <div className="my-2.5 text-2xl sm:text-[26px] font-bold font-mono tabular-nums text-slate-900 dark:text-white tracking-tight leading-none">
            {formatCurrency(totalMonthlySales, currency, exchangeRate)}
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-[#262F40] w-full flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-500">
            <span>{soldCount} {t.dashboardUnitsTransferred}</span>
            <span>{t.dashboardSarrafiSettled}</span>
          </div>
        </button>

        {/* Cell 03: Fleet Composition */}
        <button
          type="button"
          onClick={() => resetFilters()}
          className="p-4 sm:p-5 bg-white dark:bg-[#161B26] hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors text-start flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between w-full text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>03. {t.dashboardFleetAllocation}</span>
            <span className="font-mono text-[11px]">UAE · JPN · USA</span>
          </div>
          <div className="my-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-[26px] font-bold font-mono tabular-nums text-slate-900 dark:text-white tracking-tight leading-none">
              {vehicles.length}
            </span>
            <span className="text-xs text-slate-500">{t.dashboardRegisteredUnits}</span>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-[#262F40] w-full flex items-center justify-between text-[11px] font-mono tabular-nums">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {availableCount} {t.dashboardAvailable}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              {inTransitCount} {t.dashboardTransit}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-600 dark:text-slate-300">
              {reservedCount} {t.dashboardReserved}
            </span>
          </div>
        </button>

        {/* Cell 04: Islam Qala Dry Port Clearance */}
        <div className="p-4 sm:p-5 bg-white dark:bg-[#161B26] flex flex-col justify-between">
          <div className="flex items-center justify-between w-full text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>04. {t.dashboardGomrokClearance}</span>
            <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
              {t.dashboardVerified}
            </span>
          </div>
          <div className="my-2.5 text-2xl sm:text-[26px] font-bold font-mono tabular-nums text-slate-900 dark:text-white tracking-tight leading-none">
            100% ACD
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-[#262F40] w-full flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Islam Qala Port</span>
            <Link
              href="/logistics"
              className="text-[#1A73E8] dark:text-[#8AB4F8] font-semibold hover:underline"
            >
              {t.dashboardPortVault} →
            </Link>
          </div>
        </div>
      </div>

      {/* Looker Studio Interactive Cross-Filtering Analytics Strip */}
      {showLookerAnalytics && <LookerAnalyticsStrip />}

      {/* Main Google Cloud Resource Table */}
      <div className="rounded-lg border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] overflow-hidden">
        {/* Underlined Tab Bar + Make Filter */}
        <div className="px-4 border-b border-slate-200 dark:border-[#262F40] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-[#121722]">
          <div className="flex items-center gap-5 overflow-x-auto scrollbar-none -mb-px">
            {[
              { id: "ALL", name: t.dashboardAllFleet, count: vehicles.length },
              { id: "Available on Lot", name: t.inventoryOnLot, count: availableCount },
              { id: "In Transit", name: t.inventoryInTransit, count: inTransitCount },
              { id: "Reserved/Deposit Paid", name: t.inventoryReserved, count: reservedCount },
              { id: "Sold", name: t.inventorySold, count: soldCount },
            ].map((tab) => {
              const isActive = filters.status === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter("status", tab.id)}
                  className={`py-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isActive
                      ? "border-[#1A73E8] dark:border-[#8AB4F8] text-[#1A73E8] dark:text-[#8AB4F8]"
                      : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <span>{tab.name}</span>
                  <span className="font-mono tabular-nums text-[11px] opacity-80">
                    ({tab.count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Table Make Filter & Counter */}
          <div className="flex flex-wrap items-center gap-2.5 py-2 sm:py-0 shrink-0">
            <select
              value={filters.make}
              onChange={(e) => setFilter("make", e.target.value)}
              className="h-7 ps-2.5 pe-6 text-xs rounded-md border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] text-slate-800 dark:text-slate-200 font-medium outline-none focus:border-[#1A73E8] cursor-pointer"
            >
              <option value="ALL">{t.allMakes}</option>
              <option value="Toyota">Toyota</option>
              <option value="Lexus">Lexus</option>
            </select>

            {(filters.search ||
              filters.make !== "ALL" ||
              filters.status !== "ALL" ||
              chartFilter) && (
              <button
                onClick={() => {
                  resetFilters();
                  setChartFilter(null);
                }}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline px-1 cursor-pointer"
              >
                {t.dashboardResetFilters}
              </button>
            )}

            <span className="text-[11px] font-mono tabular-nums text-slate-400">
              {processedVehicles.length} / {vehicles.length} {t.inventoryResources}
            </span>
          </div>
        </div>

        {/* Google Workspace / Cloud Console Multi-Select Batch Action Bar */}
        {selectedVehicleIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-[#1A73E8] text-white text-xs">
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold">
                {t.dashboardSelectedCount.replace(
                  "{count}",
                  String(selectedVehicleIds.length)
                )}
              </span>
              <button
                onClick={() => setSelectedVehicleIds([])}
                className="text-[11px] text-white/80 underline hover:text-white"
              >
                {t.inventoryDeselectAll}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-white/80 hidden md:inline me-1">
                {t.dashboardStatus}:
              </span>
              <button
                onClick={() => handleBatchStatus("Available on Lot")}
                className="px-2.5 py-1 rounded bg-white/15 hover:bg-white/25 font-semibold text-[11px] whitespace-nowrap"
              >
                {t.dashboardSet} {t.inventoryOnLot}
              </button>
              <button
                onClick={() => handleBatchStatus("In Transit")}
                className="px-2.5 py-1 rounded bg-white/15 hover:bg-white/25 font-semibold text-[11px] whitespace-nowrap"
              >
                {t.dashboardSet} {t.inventoryInTransit}
              </button>
              <button
                onClick={() => handleBatchStatus("Reserved/Deposit Paid")}
                className="px-2.5 py-1 rounded bg-white/15 hover:bg-white/25 font-semibold text-[11px] whitespace-nowrap"
              >
                {t.dashboardSet} {t.inventoryReserved}
              </button>

              <span className="mx-1 text-white/40">|</span>
              <span className="text-[11px] text-white/80 hidden md:inline">
                {t.dashboardRepricing}:
              </span>
              <button
                onClick={() => handleBatchPriceAdjust(-2)}
                className="px-2 py-1 rounded bg-white/15 hover:bg-white/25 font-mono font-semibold text-[11px]"
                title={t.dashboardReducePrice}
              >
                -2%
              </button>
              <button
                onClick={() => handleBatchPriceAdjust(2)}
                className="px-2 py-1 rounded bg-white/15 hover:bg-white/25 font-mono font-semibold text-[11px]"
                title={t.dashboardIncreasePrice}
              >
                +2%
              </button>

              <span className="mx-1 text-white/40">|</span>
              <button
                onClick={handleBatchExport}
                className="px-2.5 py-1 rounded bg-white text-[#1A73E8] font-semibold text-[11px] hover:bg-slate-100 whitespace-nowrap"
              >
                {t.dashboardExportSelectedCsv}
              </button>
            </div>
          </div>
        )}

        {/* High-Density Resource Table */}
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
                    className="h-3.5 w-3.5 rounded border-slate-300 accent-[#1A73E8] cursor-pointer"
                  />
                </MuiTableCell>
                <MuiTableCell
                  header
                  onClick={() => handleSort("stockNumber")}
                  className="cursor-pointer select-none hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{t.dashboardResourceStockVin}</span>
                    {sortField === "stockNumber" ? (
                      sortDir === "asc" ? (
                        <ArrowUp className="h-3 w-3 text-[#1A73E8]" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-[#1A73E8]" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    )}
                  </div>
                </MuiTableCell>
                <MuiTableCell header>{t.dashboardStatus}</MuiTableCell>
                <MuiTableCell header>{t.dashboardCustomsOrigin}</MuiTableCell>
                {showFinancialMargins && (
                  <MuiTableCell
                    header
                    align="right"
                    onClick={() => handleSort("landedCost")}
                    className="cursor-pointer select-none hover:text-slate-900 dark:hover:text-white"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>{t.totalLanded}</span>
                      {sortField === "landedCost" ? (
                        sortDir === "asc" ? (
                          <ArrowUp className="h-3 w-3 text-[#1A73E8]" />
                        ) : (
                          <ArrowDown className="h-3 w-3 text-[#1A73E8]" />
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
                  className="cursor-pointer select-none hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>{t.sellingPrice}</span>
                    {sortField === "sellingPrice" ? (
                      sortDir === "asc" ? (
                        <ArrowUp className="h-3 w-3 text-[#1A73E8]" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-[#1A73E8]" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    )}
                  </div>
                </MuiTableCell>
                {showFinancialMargins && (
                  <MuiTableCell header align="right">
                    {t.targetMargin}
                  </MuiTableCell>
                )}
                <MuiTableCell header align="right" className="!pe-3">
                  {t.inventoryActions}
                </MuiTableCell>
              </MuiTableRow>
            </MuiTableHead>
            <MuiTableBody>
              {processedVehicles.length === 0 ? (
                <MuiTableRow>
                  <MuiTableCell
                    colSpan={showFinancialMargins ? 8 : 6}
                    align="center"
                    className="py-10 text-slate-400 text-xs"
                  >
                    {t.noVehiclesFound}
                  </MuiTableCell>
                </MuiTableRow>
              ) : (
                processedVehicles.map((veh) => {
                  const isSelected = selectedVehicleIds.includes(veh.id);
                  const isInspected = inspectedVehicleId === veh.id;
                  const marginAmount = veh.sellingPrice - veh.landedCost;
                  const marginPercent =
                    veh.landedCost > 0
                      ? ((marginAmount / veh.landedCost) * 100).toFixed(1)
                      : "0";

                  return (
                    <MuiTableRow
                      key={veh.id}
                      className={
                        isSelected || isInspected
                          ? "bg-[#1A73E8]/[0.06] dark:bg-[#8AB4F8]/[0.08]"
                          : undefined
                      }
                    >
                      {/* Checkbox */}
                      <MuiTableCell className="w-8 !px-2 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(veh.id)}
                          className="h-3.5 w-3.5 rounded border-slate-300 accent-[#1A73E8] cursor-pointer"
                        />
                      </MuiTableCell>

                      {/* Vehicle, Stock & VIN */}
                      <MuiTableCell className="py-2">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setInspectedVehicleId(veh.id)}
                            className="relative h-8 w-12 shrink-0 rounded overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-[#262F40] block group/thumb cursor-pointer"
                            title={t.dashboardQuickInspect}
                          >
                            {veh.images[0] ? (
                              <Image
                                src={veh.images[0]}
                                alt={veh.model}
                                fill
                                referrerPolicy="no-referrer"
                                className="object-cover group-hover/thumb:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Car className="h-4 w-4 opacity-50" />
                              </div>
                            )}
                          </button>

                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setInspectedVehicleId(veh.id)}
                              className="font-bold text-xs text-slate-900 dark:text-white hover:text-[#1A73E8] dark:hover:text-[#8AB4F8] transition-colors block truncate leading-tight text-start cursor-pointer"
                            >
                              {veh.year} {veh.make} {veh.model}{" "}
                              <span className="font-normal text-slate-500">{veh.trim}</span>
                            </button>
                            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                              <span className="font-semibold text-[#1A73E8] dark:text-[#8AB4F8]">
                                {veh.stockNumber}
                              </span>
                              <span>·</span>
                              <span className="select-all text-slate-500 font-mono tracking-tight">
                                {veh.vin}
                              </span>
                              <span>·</span>
                              <span>{veh.fuelType}</span>
                            </div>
                          </div>
                        </div>
                      </MuiTableCell>

                      {/* Status Select */}
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
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                                : veh.status === "In Transit"
                                ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                                : veh.status === "Reserved/Deposit Paid"
                                ? "bg-[#1A73E8]/10 text-[#1A73E8] dark:text-[#8AB4F8] border-[#1A73E8]/30"
                                : "bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            <option value="Available on Lot">{t.inventoryOnLotShort}</option>
                            <option value="In Transit">{t.inventoryInTransitShort}</option>
                            <option value="Reserved/Deposit Paid">{t.inventoryReservedShort}</option>
                            <option value="Under Prep/Maintenance">{t.inventoryPrepShort}</option>
                            <option value="Sold">{t.inventorySoldShort}</option>
                          </select>
                          <ChevronDown className="h-2.5 w-2.5 text-current opacity-60 absolute end-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </MuiTableCell>

                      {/* Customs & Origin */}
                      <MuiTableCell className="py-2 whitespace-nowrap">
                        <div className="text-xs text-slate-700 dark:text-slate-300">
                          {veh.originCountry} · {veh.customsClearance.split("-")[0].trim()}
                        </div>
                      </MuiTableCell>

                      {/* Landed Cost */}
                      {showFinancialMargins && (
                        <MuiTableCell
                          align="right"
                          className="py-2 font-mono tabular-nums text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap"
                        >
                          ${veh.landedCost.toLocaleString()}
                        </MuiTableCell>
                      )}

                      {/* Selling Price */}
                      <MuiTableCell align="right" className="py-2 whitespace-nowrap">
                        <div className="font-bold font-mono tabular-nums text-xs text-slate-900 dark:text-white">
                          ${veh.sellingPrice.toLocaleString()}
                        </div>
                        <div className="text-[10px] font-mono tabular-nums text-slate-400 leading-none mt-0.5">
                          ؋ {(veh.sellingPrice * exchangeRate).toLocaleString()}
                        </div>
                      </MuiTableCell>

                      {/* Target Margin */}
                      {showFinancialMargins && (
                        <MuiTableCell align="right" className="py-2 whitespace-nowrap">
                          <span className="font-mono tabular-nums font-bold text-xs text-emerald-600 dark:text-emerald-400">
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
                          <button
                            type="button"
                            onClick={() => setInspectedVehicleId(veh.id)}
                            className={`px-2 py-1 rounded border text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                              isInspected
                                ? "border-[#1A73E8] bg-[#1A73E8] text-white"
                                : "border-slate-200 dark:border-[#262F40] hover:border-[#1A73E8] text-slate-700 dark:text-slate-200"
                            }`}
                            title={t.inventoryInspectorTitle}
                          >
                            <PanelRightOpen className="h-3 w-3" />
                            <span>{t.inventoryInspect}</span>
                          </button>

                          <Link
                            href={`/vehicles/${veh.id}/deed`}
                            className="p-1 rounded border border-slate-200 dark:border-[#262F40] hover:border-[#1A73E8] text-slate-600 dark:text-slate-300 hover:text-[#1A73E8] transition-colors"
                            title={t.dashboardGenerateDeed}
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </Link>

                          {currentRole === "SuperAdmin" && (
                            <button
                              onClick={() => setVehicleToDelete(veh)}
                              className="p-1 rounded border border-transparent hover:border-rose-500/40 text-slate-400 hover:text-rose-600 transition-colors"
                              title={t.inventoryDeleteVehicle}
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

        {/* Table Footer */}
        <div className="px-4 py-2.5 border-t border-slate-200 dark:border-[#262F40] bg-slate-50/70 dark:bg-[#121722] text-[11px] font-mono text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <span>
            {t.dashboardShowingResources
              .replace("{visible}", String(processedVehicles.length))
              .replace("{total}", String(vehicles.length))} ·{" "}
            {t.dashboardPressToCycleInspector}{" "}
            <kbd className="px-1 py-0.2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800">
              j
            </kbd>{" "}
            /{" "}
            <kbd className="px-1 py-0.2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800">
              k
            </kbd>{" "}
          </span>
          <span>
            {t.dashboardSarrafiSpot.replace("{rate}", String(exchangeRate))}
          </span>
        </div>
      </div>

      
      {/* About Showroom & Customs Terminal Overview Section */}
      <section
        id="about"
        className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#121722] p-6 shadow-xs scroll-mt-20 space-y-4"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-[#262F40] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs">
                ★
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                About {branding?.dealershipName || "Aria Motors"} Herat
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {branding?.dealershipTagline || "Premier Luxury Automotive Showroom & Import Agency"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
              License #49912
            </span>
            <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              Islam Qala Verified Customs
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-4 rounded-lg bg-slate-50/70 dark:bg-[#161B26] border border-slate-200/80 dark:border-[#262F40] space-y-1.5">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>📍</span>
              <span>Central Showroom Lot</span>
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              {branding?.address || "Bagh-e-Azadi Boulevard, Herat, Afghanistan"}
            </p>
            <p className="text-[11px] text-slate-400">
              Mon – Sat: 8:00 AM – 7:30 PM (Friday by Appointment)
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50/70 dark:bg-[#161B26] border border-slate-200/80 dark:border-[#262F40] space-y-1.5">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>🛡️</span>
              <span>Import Corridor & Customs</span>
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              {branding?.customsTerminalBranch || "Islam Qala Dry Port Customs Terminal #3"}
            </p>
            <p className="text-[11px] text-slate-400">
              Direct Gulf & Dubai Jebel Ali transit, bonded escort clearance & Maktoub inspection.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50/70 dark:bg-[#161B26] border border-slate-200/80 dark:border-[#262F40] space-y-1.5">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>🏛️</span>
              <span>Sarrafi & Legal Transfers</span>
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Official legal deeds (قواله شرعی/عرفی), court notary seals, and Hawala settlement via Saray-e-Sarrafan Herat.
            </p>
            <p className="text-[11px] text-slate-400">
              TIN: {branding?.tinNumber || "TIN-98234-AF"}
            </p>
          </div>
        </div>
      </section>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(vehicleToDelete)}
        onClose={() => setVehicleToDelete(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle className="text-sm font-bold text-slate-900 dark:text-white">
          {t.inventoryDeleteTitle}
        </DialogTitle>
        <DialogContent className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
          <p>
            {t.inventoryDeletePrompt
              .replace(
                "{vehicle}",
                `${vehicleToDelete?.year ?? ""} ${vehicleToDelete?.make ?? ""} ${
                  vehicleToDelete?.model ?? ""
                }`.trim()
              )
              .replace("{stock}", vehicleToDelete?.stockNumber ?? "")}
          </p>
        </DialogContent>
        <DialogActions className="p-3 border-t border-slate-100 dark:border-slate-800">
          <MuiButton
            variant="outlined"
            color="inherit"
            size="small"
            onClick={() => setVehicleToDelete(null)}
          >
            {t.inventoryCancel}
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
                addToast(
                  t.inventoryRemovedVehicle.replace("{stock}", target.stockNumber),
                  "info"
                );
              } catch (error) {
                addToast(
                  error instanceof Error ? error.message : t.inventoryDeleteVehicle,
                  "error"
                );
              }
            }}
          >
            {t.inventoryDeleteVehicle}
          </MuiButton>
        </DialogActions>
      </Dialog>

      <FloatingBatchToolbar
        selectedCount={selectedVehicleIds.length}
        entityLabel={t.inventoryResources}
        statusLabel={t.inventorySetStatus}
        statusOptions={[
          { label: t.inventoryOnLot, value: "Available on Lot" },
          { label: t.inventoryInTransit, value: "In Transit" },
          { label: t.inventoryReserved, value: "Reserved/Deposit Paid" },
          { label: t.inventoryPrep, value: "Under Prep/Maintenance" },
          { label: t.inventorySold, value: "Sold" },
        ]}
        onApplyStatus={(status) => void handleBatchStatus(status as VehicleItem["status"])}
        onAdjustPrice={handleBatchPriceAdjust}
        onExportCSV={handleBatchExport}
        onClearSelection={() => setSelectedVehicleIds([])}
      />

      <CompareBar />
    </div>
  );
}
