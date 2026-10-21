"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useShowroomStore } from "@/store/useShowroomStore";
import { VehicleCard } from "@/components/VehicleCard";
import { VehicleFilters } from "@/components/VehicleFilters";
import { PinnedViewsBar } from "@/components/PinnedViewsBar";
import { LookerAnalyticsStrip } from "@/components/LookerAnalyticsStrip";
import { CompareBar } from "@/components/CompareBar";
import { FloatingBatchToolbar } from "@/components/FloatingBatchToolbar";
import { translations } from "@/lib/translations";
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
  MuiTablePagination,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@/components/mui";
import {
  Car,
  Table,
  LayoutGrid,
  Plus,
  FileText,
  Trash2,
  ShieldCheck,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  PanelRightOpen,
  BarChart3,
} from "lucide-react";

export default function InventoryPage() {
  const {
    vehicles,
    filters,
    chartFilter,
    language,
    currency,
    exchangeRate,
    currentRole,
    clientPresentationMode,
    inspectedVehicleId,
    setInspectedVehicleId,
    deleteVehicle,
    setVehicleStatus,
    batchUpdateVehicleStatus,
    batchAdjustVehiclePrice,
    addToast,
  } = useShowroomStore();

  const t = translations[language];
  const hideFinancialMargins = clientPresentationMode || currentRole === "SalesAgent";

  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [showLookerAnalytics, setShowLookerAnalytics] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [vehicleToDelete, setVehicleToDelete] = useState<VehicleItem | null>(null);

  const [sortField, setSortField] = useState<
    "sellingPrice" | "landedCost" | "year" | "stockNumber"
  >("year");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handleSort = (field: "sellingPrice" | "landedCost" | "year" | "stockNumber") => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  // Instant faceted filtering + Looker cross-filter
  const filteredVehicles = useMemo(() => {
    const result = vehicles.filter((v) => {
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesQuery =
          v.make.toLowerCase().includes(query) ||
          v.model.toLowerCase().includes(query) ||
          v.stockNumber.toLowerCase().includes(query) ||
          v.vin.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      if (filters.make !== "ALL" && v.make !== filters.make) return false;
      if (filters.bodyType !== "ALL" && v.bodyType !== filters.bodyType) return false;
      if (filters.fuelType !== "ALL" && v.fuelType !== filters.fuelType) return false;
      if (filters.transmission !== "ALL" && v.transmission !== filters.transmission)
        return false;
      if (filters.originCountry !== "ALL" && v.originCountry !== filters.originCountry)
        return false;
      if (filters.status !== "ALL" && v.status !== filters.status) return false;
      if (filters.minPrice && v.sellingPrice < filters.minPrice) return false;
      if (filters.maxPrice && v.sellingPrice > filters.maxPrice) return false;
      if (filters.minYear && v.year < filters.minYear) return false;
      if (filters.maxYear && v.year > filters.maxYear) return false;

      if (chartFilter) {
        if (v[chartFilter.dimension] !== chartFilter.value) return false;
      }

      return true;
    });

    result.sort((a, b) => {
      const valA: any = a[sortField];
      const valB: any = b[sortField];
      if (typeof valA === "string") {
        return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortDir === "asc" ? valA - valB : valB - valA;
    });

    return result;
  }, [vehicles, filters, chartFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filteredVehicles.length / rowsPerPage) || 1;
  const paginatedVehicles = useMemo(() => {
    return filteredVehicles.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  }, [filteredVehicles, page, rowsPerPage]);

  const handleToggleSelect = (id: string) => {
    setSelectedVehicleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (
      paginatedVehicles.length > 0 &&
      paginatedVehicles.every((v) => selectedVehicleIds.includes(v.id))
    ) {
      const pageIds = new Set(paginatedVehicles.map((v) => v.id));
      setSelectedVehicleIds((prev) => prev.filter((id) => !pageIds.has(id)));
    } else {
      const combined = new Set([...selectedVehicleIds, ...paginatedVehicles.map((v) => v.id)]);
      setSelectedVehicleIds(Array.from(combined));
    }
  };

  const handleBatchStatusUpdate = async (status: string) => {
    if (selectedVehicleIds.length === 0) return;
    await batchUpdateVehicleStatus(selectedVehicleIds, status as VehicleItem["status"]);
    setSelectedVehicleIds([]);
  };

  const handleBatchPriceAdjust = async (percentDelta: number) => {
    if (selectedVehicleIds.length === 0) return;
    await batchAdjustVehiclePrice(selectedVehicleIds, percentDelta);
  };

  const handleBatchExportCSV = () => {
    const selected = vehicles.filter((v) => selectedVehicleIds.includes(v.id));
    if (selected.length === 0) return;
    exportInventoryToCSV(selected, `sadozai_inventory_batch_${selected.length}.csv`);
    addToast(`Exported ${selected.length} selected vehicle(s) to CSV`, "success");
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Google Cloud Inventory Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b border-slate-200 dark:border-[#262F40]">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Herat Customs Lot #04</span>
            <span>·</span>
            <span className="font-mono text-[#1A73E8] dark:text-[#8AB4F8] font-semibold">
              {filteredVehicles.length} verified chassis
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {language === "ps"
              ? "د موجودو موټرونو ګودام او سټاک"
              : language === "fa"
              ? "گدام و موجودی موترها"
              : "Vehicle Inventory & Fleet Registry"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Browse verified stock · Landed cost, Islam Qala clearance & real-time Afghan market valuation
          </p>
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
            <span>Looker Cohorts</span>
          </button>

          <ButtonGroup size="small" variant="outlined">
            <MuiButton
              variant={viewMode === "grid" ? "contained" : "outlined"}
              color="primary"
              size="small"
              onClick={() => setViewMode("grid")}
              startIcon={<LayoutGrid className="h-3.5 w-3.5" />}
            >
              Cards
            </MuiButton>
            <MuiButton
              variant={viewMode === "table" ? "contained" : "outlined"}
              color="primary"
              size="small"
              onClick={() => setViewMode("table")}
              startIcon={<Table className="h-3.5 w-3.5" />}
            >
              Table
            </MuiButton>
          </ButtonGroup>

          <MuiButton
            variant="outlined"
            color="inherit"
            size="small"
            onClick={() => {
              exportInventoryToCSV(filteredVehicles);
              addToast(`Exported ${filteredVehicles.length} vehicles to CSV`, "success");
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

      {/* Pinned Views Bar */}
      <PinnedViewsBar />

      {/* Optional Looker Studio Cohort Strip */}
      {showLookerAnalytics && <LookerAnalyticsStrip />}

      {/* Filter Toolbar */}
      <VehicleFilters />

      {/* Main Stock Content: Cards Grid or Table */}
      {filteredVehicles.length > 0 ? (
        viewMode === "grid" ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onQuickView={(v) => setInspectedVehicleId(v.id)}
                />
              ))}
            </div>

            {/* Pagination Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] text-xs font-mono text-slate-500 dark:text-slate-400">
              <div>
                Showing {page * rowsPerPage + 1}–
                {Math.min((page + 1) * rowsPerPage, filteredVehicles.length)} of{" "}
                {filteredVehicles.length} units
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="p-1.5 rounded border border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#121722] text-slate-800 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#1A73E8] transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-semibold px-2 tabular-nums text-slate-900 dark:text-white">
                  Page {page + 1} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  className="p-1.5 rounded border border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#121722] text-slate-800 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#1A73E8] transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <MuiTableContainer className="rounded-lg overflow-x-auto">
            <MuiTable dense size="small" className="w-full">
              <MuiTableHead>
                <MuiTableRow hover={false}>
                  <MuiTableCell header className="w-8 !px-2.5 text-center">
                    <input
                      type="checkbox"
                      aria-label="Select all vehicles on page"
                      checked={
                        paginatedVehicles.length > 0 &&
                        paginatedVehicles.every((v) => selectedVehicleIds.includes(v.id))
                      }
                      onChange={handleSelectAll}
                      className="h-3.5 w-3.5 rounded border-slate-300 accent-[#1A73E8] cursor-pointer"
                    />
                  </MuiTableCell>
                  <MuiTableCell
                    header
                    onClick={() => handleSort("stockNumber")}
                    className="cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Vehicle, Stock & VIN</span>
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
                  <MuiTableCell header>Status</MuiTableCell>
                  <MuiTableCell header>Customs</MuiTableCell>
                  {!hideFinancialMargins && (
                    <MuiTableCell
                      header
                      align="right"
                      onClick={() => handleSort("landedCost")}
                      className="cursor-pointer select-none"
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Landed Cost</span>
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
                    className="cursor-pointer select-none"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Selling Price</span>
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
                  {!hideFinancialMargins && (
                    <MuiTableCell header align="right">
                      Target Margin
                    </MuiTableCell>
                  )}
                  <MuiTableCell header align="right" className="!pe-3">
                    Actions
                  </MuiTableCell>
                </MuiTableRow>
              </MuiTableHead>
              <MuiTableBody>
                {paginatedVehicles.map((veh) => {
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
                      <MuiTableCell className="w-8 !px-2.5 text-center py-1.5">
                        <input
                          type="checkbox"
                          aria-label={`Select ${veh.year} ${veh.make} ${veh.model}`}
                          checked={isSelected}
                          onChange={() => handleToggleSelect(veh.id)}
                          className="h-3.5 w-3.5 rounded border-slate-300 accent-[#1A73E8] cursor-pointer"
                        />
                      </MuiTableCell>
                      <MuiTableCell className="py-1.5">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setInspectedVehicleId(veh.id)}
                            className="relative h-8 w-11 shrink-0 rounded overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer block"
                            title="Inspect in drawer"
                          >
                            <Image
                              src={veh.images[0]}
                              alt={veh.model}
                              fill
                              referrerPolicy="no-referrer"
                              className="object-cover"
                            />
                          </button>

                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setInspectedVehicleId(veh.id)}
                              className="font-bold text-xs text-slate-900 dark:text-white hover:text-[#1A73E8] transition-colors block truncate leading-tight text-start cursor-pointer"
                            >
                              {veh.year} {veh.make} {veh.model}
                            </button>
                            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                              <span className="font-bold text-[#1A73E8] dark:text-[#8AB4F8]">
                                {veh.stockNumber}
                              </span>
                              <span>·</span>
                              <span className="select-all text-slate-500 font-mono">
                                {veh.vin}
                              </span>
                              <span>·</span>
                              <span>{veh.originCountry}</span>
                            </div>
                          </div>
                        </div>
                      </MuiTableCell>

                      <MuiTableCell className="py-1.5 whitespace-nowrap">
                        <div className="relative inline-block">
                          <select
                            value={veh.status}
                            onChange={(e) =>
                              void setVehicleStatus(
                                veh.id,
                                e.target.value as VehicleItem["status"]
                              ).catch((error) => addToast(error.message, "error"))
                            }
                            className={`text-[10px] font-mono font-bold uppercase tracking-wider rounded px-2 py-0.5 border transition-colors cursor-pointer outline-none appearance-none pe-5 leading-tight ${
                              veh.status === "Available on Lot"
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                                : veh.status === "In Transit"
                                ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                                : veh.status === "Reserved/Deposit Paid"
                                ? "bg-[#1A73E8]/10 text-[#1A73E8] dark:text-[#8AB4F8] border-[#1A73E8]/30"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700"
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

                      <MuiTableCell className="py-1.5 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                            {veh.customsClearance.split("-")[0].trim()}
                          </span>
                        </div>
                      </MuiTableCell>

                      {!hideFinancialMargins && (
                        <MuiTableCell
                          align="right"
                          className="py-1.5 font-mono tabular-nums text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap"
                        >
                          ${veh.landedCost.toLocaleString()}
                        </MuiTableCell>
                      )}

                      <MuiTableCell align="right" className="py-1.5 whitespace-nowrap">
                        <div className="font-bold font-mono tabular-nums text-xs text-slate-900 dark:text-white">
                          ${veh.sellingPrice.toLocaleString()}
                        </div>
                        {currency === "AFN" && (
                          <div className="text-[11px] font-mono tabular-nums text-slate-400 leading-none mt-0.5">
                            ؋ {(veh.sellingPrice * exchangeRate).toLocaleString()}
                          </div>
                        )}
                      </MuiTableCell>

                      {!hideFinancialMargins && (
                        <MuiTableCell
                          align="right"
                          className="py-1.5 font-mono tabular-nums font-semibold text-xs text-emerald-600 dark:text-emerald-400 whitespace-nowrap"
                        >
                          +${marginAmount.toLocaleString()}{" "}
                          <span className="text-[11px] text-emerald-500/80 font-normal">
                            ({marginPercent}%)
                          </span>
                        </MuiTableCell>
                      )}

                      <MuiTableCell align="right" className="py-1.5 whitespace-nowrap !pe-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setInspectedVehicleId(veh.id)}
                            className="px-2 py-1 rounded border border-slate-200 dark:border-[#262F40] hover:border-[#1A73E8] text-[11px] font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
                            title="Open Contextual Inspector Drawer"
                          >
                            <PanelRightOpen className="h-3 w-3" />
                            <span>Inspect</span>
                          </button>

                          <Link
                            href={`/vehicles/${veh.id}/deed`}
                            className="p-1 rounded border border-slate-200 dark:border-[#262F40] hover:border-[#1A73E8] text-slate-600 dark:text-slate-300"
                            title="Print legal deed"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </Link>

                          {currentRole === "SuperAdmin" && (
                            <button
                              onClick={() => setVehicleToDelete(veh)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600"
                              title="Delete vehicle"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </MuiTableCell>
                    </MuiTableRow>
                  );
                })}
              </MuiTableBody>
            </MuiTable>

            <MuiTablePagination
              component="div"
              count={filteredVehicles.length}
              page={page}
              onPageChange={(_e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[6, 12, 24, 48]}
            />
          </MuiTableContainer>
        )
      ) : (
        <div className="rounded-lg border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] p-12 text-center text-slate-400 space-y-3">
          <Car className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-700" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            No Matching Fleet Resources
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, Looker chart filter, or pinned view preset.
          </p>
        </div>
      )}

      <FloatingBatchToolbar
        selectedCount={selectedVehicleIds.length}
        entityLabel="vehicles"
        statusLabel="Set Status"
        statusOptions={[
          { label: "On Lot", value: "Available on Lot" },
          { label: "In Transit", value: "In Transit" },
          { label: "Reserved", value: "Reserved/Deposit Paid" },
          { label: "Prep", value: "Under Prep/Maintenance" },
          { label: "Sold", value: "Sold" },
        ]}
        onApplyStatus={handleBatchStatusUpdate}
        onAdjustPrice={handleBatchPriceAdjust}
        onExportCSV={handleBatchExportCSV}
        onClearSelection={() => setSelectedVehicleIds([])}
      />

      <CompareBar />

      {/* Custom Delete Vehicle Confirmation Dialog */}
      <Dialog
        open={Boolean(vehicleToDelete)}
        onClose={() => setVehicleToDelete(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle className="font-bold text-slate-900 dark:text-white">
          Confirm Vehicle Removal
        </DialogTitle>
        <DialogContent>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
            Are you sure you want to permanently remove{" "}
            <strong className="text-slate-900 dark:text-white">
              {vehicleToDelete?.year} {vehicleToDelete?.make} {vehicleToDelete?.model}
            </strong>{" "}
            (Stock <span className="font-mono font-semibold">{vehicleToDelete?.stockNumber}</span>)
            from the showroom registry?
          </p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
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
                addToast(`Removed vehicle ${target.stockNumber}`, "info");
              } catch (error) {
                addToast(
                  error instanceof Error ? error.message : "Unable to delete vehicle",
                  "error"
                );
              }
            }}
          >
            Delete Permanently
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
