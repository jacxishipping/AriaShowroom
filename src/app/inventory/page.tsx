"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useShowroomStore } from "@/store/useShowroomStore";
import { VehicleCard } from "@/components/VehicleCard";
import { VehicleFilters } from "@/components/VehicleFilters";
import { VehicleDeedModal } from "@/components/VehicleDeedModal";
import { VehicleIntakeModal } from "@/components/VehicleIntakeModal";
import { translations } from "@/lib/translations";
import { formatCurrency, formatMileage } from "@/lib/utils";
import { VehicleItem } from "@/lib/mock-data";
import { exportInventoryToCSV } from "@/lib/export-utils";
import {
  MuiCard,
  MuiCardHeader,
  MuiCardContent,
  MuiButton,
  MuiChip,
  MuiTableContainer,
  MuiTable,
  MuiTableHead,
  MuiTableBody,
  MuiTableRow,
  MuiTableCell,
  MuiTablePagination,
} from "@/components/mui";
import {
  Car,
  SearchX,
  Table,
  LayoutGrid,
  Plus,
  Eye,
  FileText,
  Trash2,
  ShieldCheck,
  Layers,
  FileSpreadsheet,
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
  } = useShowroomStore();

  const t = translations[language];

  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedDeedVehicle, setSelectedDeedVehicle] = useState<VehicleItem | null>(null);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<"sellingPrice" | "landedCost" | "year" | "stockNumber" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const rowsPerPage = 10;

  const handleSort = (field: "sellingPrice" | "landedCost" | "year" | "stockNumber") => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  // Client-side instant faceted filtering
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

    if (sortField) {
      result = [...result].sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];
        if (typeof valA === "string") {
          return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortDir === "asc" ? valA - valB : valB - valA;
      });
    }

    return result;
  }, [vehicles, filters, sortField, sortDir]);

  // Paginated vehicles
  const paginatedVehicles = useMemo(() => {
    return filteredVehicles.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  }, [filteredVehicles, page]);

  return (
    <div className="space-y-6">
      {/* Material Inventory Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#D97706]">
            Lot Stock Ledger & Landed Cost Ledger
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {language === "ps"
              ? "د موجودو موټرونو ګودام او مدیریت"
              : language === "fa"
              ? "گدام و موجودی موترهای نمایشگاه"
              : "Vehicle Inventory & Stock Ledger"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time inspection data, Islam Qala customs clearance slips, 40+ photo albums, and landed margins
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Table / Lot Grid Switcher */}
          <div className="flex items-center rounded-md border border-slate-300 p-0.5 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-bold transition-all ${
                viewMode === "table"
                  ? "bg-[#1976D2] text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              <Table className="h-3.5 w-3.5" />
              <span>Data Table</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-bold transition-all ${
                viewMode === "grid"
                  ? "bg-[#1976D2] text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Lot Cards</span>
            </button>
          </div>

          <MuiButton
            variant="outlined"
            size="small"
            onClick={() => exportInventoryToCSV(filteredVehicles)}
            startIcon={<FileSpreadsheet className="h-4 w-4 text-emerald-600" />}
          >
            Export CSV
          </MuiButton>

          <MuiButton
            variant="contained"
            color="gold"
            size="small"
            onClick={() => setIsIntakeOpen(true)}
            startIcon={<Plus className="h-4 w-4" />}
          >
            {t.addNewVehicle}
          </MuiButton>
        </div>
      </div>

      {/* Multi-Criteria Faceted Filter Component */}
      <VehicleFilters />

      {/* Main Stock Content: Table or Grid */}
      {filteredVehicles.length > 0 ? (
        viewMode === "table" ? (
          <MuiCard elevation={1}>
            <div className="overflow-x-auto">
              <MuiTable dense>
                <MuiTableHead>
                  <MuiTableRow hover={false}>
                    <MuiTableCell
                      header
                      onClick={() => handleSort("stockNumber")}
                      className="cursor-pointer select-none hover:text-[#1976D2]"
                    >
                      <div className="flex items-center gap-1">
                        <span>Stock # / Vehicle</span>
                        {sortField === "stockNumber" && (
                          <span className="text-xs text-[#1976D2]">{sortDir === "asc" ? "▲" : "▼"}</span>
                        )}
                      </div>
                    </MuiTableCell>
                    <MuiTableCell header>VIN / Chassis</MuiTableCell>
                    <MuiTableCell header>Origin & Specs</MuiTableCell>
                    <MuiTableCell header>Gomrok Customs</MuiTableCell>
                    <MuiTableCell header>Status</MuiTableCell>
                    <MuiTableCell header>40+ Photos</MuiTableCell>
                    <MuiTableCell
                      header
                      onClick={() => handleSort("landedCost")}
                      className="cursor-pointer select-none hover:text-[#1976D2]"
                    >
                      <div className="flex items-center gap-1">
                        <span>Landed Cost</span>
                        {sortField === "landedCost" && (
                          <span className="text-xs text-[#1976D2]">{sortDir === "asc" ? "▲" : "▼"}</span>
                        )}
                      </div>
                    </MuiTableCell>
                    <MuiTableCell
                      header
                      onClick={() => handleSort("sellingPrice")}
                      className="cursor-pointer select-none hover:text-[#1976D2]"
                    >
                      <div className="flex items-center gap-1">
                        <span>Selling Price</span>
                        {sortField === "sellingPrice" && (
                          <span className="text-xs text-[#1976D2]">{sortDir === "asc" ? "▲" : "▼"}</span>
                        )}
                      </div>
                    </MuiTableCell>
                    <MuiTableCell header>Gross Margin</MuiTableCell>
                    <MuiTableCell header align="right">
                      Actions
                    </MuiTableCell>
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
                        <MuiTableCell>
                          <Link
                            href={`/vehicles/${veh.id}`}
                            className="font-bold text-slate-900 dark:text-white hover:text-[#1976D2] block"
                          >
                            {veh.year} {veh.make} {veh.model}
                          </Link>
                          <span className="text-[11px] font-mono text-[#D97706] font-semibold">
                            {veh.stockNumber} • {veh.trim}
                          </span>
                        </MuiTableCell>

                        <MuiTableCell className="font-mono text-slate-600 dark:text-slate-400">
                          {veh.vin}
                        </MuiTableCell>

                        <MuiTableCell>
                          <span className="font-semibold block">{veh.originCountry}</span>
                          <span className="text-[10px] text-slate-400">
                            {formatMileage(veh.mileage)} • {veh.fuelType}
                          </span>
                        </MuiTableCell>

                        <MuiTableCell>
                          <MuiChip
                            label="Islam Qala Cleared"
                            color="success"
                            variant="outlined"
                            size="small"
                          />
                        </MuiTableCell>

                        <MuiTableCell>
                          <MuiChip
                            label={veh.status}
                            color={
                              veh.status === "Available on Lot"
                                ? "success"
                                : veh.status === "In Transit"
                                ? "info"
                                : veh.status === "Reserved/Deposit Paid"
                                ? "warning"
                                : "default"
                            }
                            size="small"
                          />
                        </MuiTableCell>

                        <MuiTableCell>
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-500">
                            📷 {veh.images.length}
                          </span>
                        </MuiTableCell>

                        <MuiTableCell className="font-mono font-medium text-slate-700 dark:text-slate-300">
                          ${veh.landedCost.toLocaleString()}
                        </MuiTableCell>

                        <MuiTableCell>
                          <span className="font-mono font-bold text-slate-900 dark:text-white block">
                            {formatCurrency(veh.sellingPrice, currency, exchangeRate)}
                          </span>
                          {currency === "AFN" && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              (${veh.sellingPrice.toLocaleString()} USD)
                            </span>
                          )}
                        </MuiTableCell>

                        <MuiTableCell>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                            +${marginAmount.toLocaleString()} ({marginPercent}%)
                          </span>
                        </MuiTableCell>

                        <MuiTableCell align="right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/vehicles/${veh.id}`}
                              className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:text-slate-400"
                              title="Inspection & Deal Desk"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>

                            <button
                              onClick={() => setSelectedDeedVehicle(veh)}
                              className="rounded p-1 text-[#D97706] hover:bg-amber-500/10"
                              title="Generate Afghan Deed"
                            >
                              <FileText className="h-4 w-4" />
                            </button>

                            {currentRole === "SuperAdmin" && (
                              <button
                                onClick={() => deleteVehicle(veh.id)}
                                className="rounded p-1 text-[#D32F2F] hover:bg-red-500/10"
                                title="Delete Vehicle Stock"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </MuiTableCell>
                      </MuiTableRow>
                    );
                  })}
                </MuiTableBody>
              </MuiTable>
            </div>

            <MuiTablePagination
              count={filteredVehicles.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </MuiCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )
      ) : (
        <MuiCard elevation={1} className="p-12 text-center space-y-3">
          <SearchX className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {t.noVehiclesFound}
          </h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search filters or status parameters
          </p>
        </MuiCard>
      )}

      {/* Modals */}
      {selectedDeedVehicle && (
        <VehicleDeedModal
          vehicle={selectedDeedVehicle}
          isOpen={!!selectedDeedVehicle}
          onClose={() => setSelectedDeedVehicle(null)}
        />
      )}

      <VehicleIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
      />
    </div>
  );
}
