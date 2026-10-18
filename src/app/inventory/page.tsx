"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useShowroomStore } from "@/store/useShowroomStore";
import { VehicleCard } from "@/components/VehicleCard";
import { VehicleFilters } from "@/components/VehicleFilters";
import { VehicleDeedModal } from "@/components/VehicleDeedModal";
import { VehicleIntakeModal } from "@/components/VehicleIntakeModal";
import { VehicleQuickViewModal } from "@/components/VehicleQuickViewModal";
import { VehicleCompareModal } from "@/components/VehicleCompareModal";
import { CompareBar } from "@/components/CompareBar";
import { translations } from "@/lib/translations";
import { formatCurrency } from "@/lib/utils";
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
  MuiTablePagination,
  MuiTextField,
  MenuItem,
  IconButton,
  ButtonGroup,
  Box,
} from "@/components/mui";
import {
  Car,
  Table,
  LayoutGrid,
  Plus,
  Eye,
  FileText,
  Trash2,
  ShieldCheck,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function InventoryPage() {
  const {
    vehicles,
    filters,
    language,
    currency,
    exchangeRate,
    currentRole,
    deleteVehicle,
    setVehicleStatus,
    addToast,
  } = useShowroomStore();

  const t = translations[language];

  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedDeedVehicle, setSelectedDeedVehicle] = useState<VehicleItem | null>(null);
  const [quickViewVehicle, setQuickViewVehicle] = useState<VehicleItem | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);

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

  // Instant faceted filtering
  const filteredVehicles = useMemo(() => {
    let result = vehicles.filter((v) => {
      // Search
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesQuery =
          v.make.toLowerCase().includes(query) ||
          v.model.toLowerCase().includes(query) ||
          v.stockNumber.toLowerCase().includes(query) ||
          v.vin.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // Faceted filters
      if (filters.make !== "ALL" && v.make !== filters.make) return false;
      if (filters.bodyType !== "ALL" && v.bodyType !== filters.bodyType) return false;
      if (filters.fuelType !== "ALL" && v.fuelType !== filters.fuelType) return false;
      if (filters.transmission !== "ALL" && v.transmission !== filters.transmission) return false;
      if (filters.originCountry !== "ALL" && v.originCountry !== filters.originCountry) return false;
      if (filters.status !== "ALL" && v.status !== filters.status) return false;
      if (filters.minPrice && v.sellingPrice < filters.minPrice) return false;
      if (filters.maxPrice && v.sellingPrice > filters.maxPrice) return false;
      if (filters.minYear && v.year < filters.minYear) return false;
      if (filters.maxYear && v.year > filters.maxYear) return false;

      return true;
    });

    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (typeof valA === "string") {
        return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortDir === "asc" ? valA - valB : valB - valA;
    });

    return result;
  }, [vehicles, filters, sortField, sortDir]);

  // Paginated vehicles
  const totalPages = Math.ceil(filteredVehicles.length / rowsPerPage) || 1;
  const paginatedVehicles = useMemo(() => {
    return filteredVehicles.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  }, [filteredVehicles, page, rowsPerPage]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Inventory Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/90 dark:border-slate-800/90">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {language === "ps"
                ? "د موجودو موټرونو ګودام او سټاک"
                : language === "fa"
                ? "گدام و موجودی موترها"
                : "Vehicle Inventory & Fleet Registry"}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <span>{filteredVehicles.length} Units Listed</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse verified stock • Landed cost, Islam Qala clearance & real-time Afghan market valuation
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Table / Grid Switcher */}
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
                  onQuickView={(v) => setQuickViewVehicle(v)}
                />
              ))}
            </div>

            {/* Pagination Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-xs text-slate-500 dark:text-slate-400">
              <div>
                Showing {page * rowsPerPage + 1} to{" "}
                {Math.min((page + 1) * rowsPerPage, filteredVehicles.length)} of{" "}
                {filteredVehicles.length} vehicles
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-semibold px-2">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <MuiTableContainer className="rounded-2xl shadow-sm overflow-hidden">
            <MuiTable dense>
              <MuiTableHead>
                <MuiTableRow hover={false}>
                  <MuiTableCell
                    header
                    onClick={() => handleSort("stockNumber")}
                    className="cursor-pointer select-none"
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
                    className="cursor-pointer select-none"
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
                    className="cursor-pointer select-none"
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
                {paginatedVehicles.map((veh) => {
                  const marginAmount = veh.sellingPrice - veh.landedCost;
                  const marginPercent =
                    veh.landedCost > 0
                      ? ((marginAmount / veh.landedCost) * 100).toFixed(1)
                      : "0";

                  return (
                    <MuiTableRow key={veh.id}>
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
                              className="font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors block"
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

                      <MuiTableCell className="font-mono text-slate-600 dark:text-slate-400 text-[11px] select-all">
                        {veh.vin}
                      </MuiTableCell>

                      {/* Inline Status Changer */}
                      <MuiTableCell>
                        <MuiTextField
                          select
                          size="small"
                          value={veh.status}
                          onChange={(e) =>
                            setVehicleStatus(
                              veh.id,
                              e.target.value as VehicleItem["status"]
                            )
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

                      <MuiTableCell className="text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate max-w-[140px] text-[11px]">
                            {veh.customsClearance.split("-")[0].trim()}
                          </span>
                        </div>
                      </MuiTableCell>

                      <MuiTableCell align="right" className="font-mono text-slate-600 dark:text-slate-400">
                        ${veh.landedCost.toLocaleString()}
                      </MuiTableCell>

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

                      <MuiTableCell align="right" className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        +${marginAmount.toLocaleString()} ({marginPercent}%)
                      </MuiTableCell>

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
                            title="Print legal deed"
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
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-12 text-center text-slate-400 space-y-3">
          <Car className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-700" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            No Vehicles Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, price brackets, or clear filters to view more fleet vehicles.
          </p>
        </div>
      )}

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
