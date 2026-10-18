"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useShowroomStore } from "@/store/useShowroomStore";
import { VehicleCard } from "@/components/VehicleCard";
import { VehicleFilters } from "@/components/VehicleFilters";
import { VehicleDeedModal } from "@/components/VehicleDeedModal";
import { VehicleIntakeModal } from "@/components/VehicleIntakeModal";
import { translations } from "@/lib/translations";
import { formatCurrency } from "@/lib/utils";
import { VehicleItem } from "@/lib/mock-data";
import { exportInventoryToCSV } from "@/lib/export-utils";
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
  const [sortField, setSortField] = useState<"sellingPrice" | "landedCost" | "year" | "stockNumber">("year");
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
  const paginatedVehicles = useMemo(() => {
    return filteredVehicles.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  }, [filteredVehicles, page]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Clean Inventory Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {language === "ps"
              ? "د موجودو موټرونو ګودام او سټاک"
              : language === "fa"
              ? "گدام و موجودی موترها"
              : "Vehicle Inventory & Ledger"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Showing {filteredVehicles.length} of {vehicles.length} vehicles • Landed cost, Islam Qala clearance & margin tracking
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Table / Grid Switcher */}
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5 shadow-2xs">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                viewMode === "table"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Table className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                viewMode === "grid"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards</span>
            </button>
          </div>

          <button
            onClick={() => exportInventoryToCSV(filteredVehicles)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsIntakeOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{t.addNewVehicle}</span>
          </button>
        </div>
      </div>

      {/* Sleek Compact Toolbar Filter Component */}
      <VehicleFilters />

      {/* Main Stock Content: Table or Grid */}
      {filteredVehicles.length > 0 ? (
        viewMode === "table" ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <th
                      onClick={() => handleSort("stockNumber")}
                      className="py-3 px-4 cursor-pointer select-none hover:text-slate-900 dark:hover:text-white"
                    >
                      <div className="flex items-center gap-1">
                        <span>Vehicle & Stock</span>
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3 px-4">VIN / Chassis</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Customs Clearance</th>
                    <th
                      onClick={() => handleSort("landedCost")}
                      className="py-3 px-4 text-right cursor-pointer select-none hover:text-slate-900 dark:hover:text-white"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Landed Cost</span>
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("sellingPrice")}
                      className="py-3 px-4 text-right cursor-pointer select-none hover:text-slate-900 dark:hover:text-white"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Selling Price</span>
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3 px-4 text-right">Target Margin</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {paginatedVehicles.map((veh) => {
                    const marginAmount = veh.sellingPrice - veh.landedCost;
                    const marginPercent =
                      veh.landedCost > 0
                        ? ((marginAmount / veh.landedCost) * 100).toFixed(1)
                        : "0";

                    const statusBadge =
                      veh.status === "Available on Lot"
                        ? { dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" }
                        : veh.status === "In Transit"
                        ? { dot: "bg-blue-500", text: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40" }
                        : veh.status === "Reserved/Deposit Paid"
                        ? { dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40" }
                        : { dot: "bg-slate-400", text: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800" };

                    return (
                      <tr
                        key={veh.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <Link
                            href={`/vehicles/${veh.id}`}
                            className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 transition-colors block"
                          >
                            {veh.year} {veh.make} {veh.model}
                          </Link>
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{veh.stockNumber}</span>
                            <span>•</span>
                            <span>{veh.originCountry} Import</span>
                            <span>•</span>
                            <span>{veh.images.length} photos</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                          {veh.vin}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot}`} />
                            <span>{veh.status}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="truncate max-w-[140px] text-[11px]">{veh.customsClearance.split("-")[0].trim()}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                          ${veh.landedCost.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="font-bold font-mono text-slate-900 dark:text-white">
                            ${veh.sellingPrice.toLocaleString()}
                          </div>
                          {currency === "AFN" && (
                            <div className="text-[10px] font-mono text-slate-400">
                              ؋ {(veh.sellingPrice * exchangeRate).toLocaleString()}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          +${marginAmount.toLocaleString()} ({marginPercent}%)
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/vehicles/${veh.id}`}
                              className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="View specs & 40+ photos"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>

                            <button
                              onClick={() => setSelectedDeedVehicle(veh)}
                              className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Print legal deed"
                            >
                              <FileText className="h-4 w-4" />
                            </button>

                            {currentRole === "SuperAdmin" && (
                              <button
                                onClick={() => {
                                  if (confirm(`Delete stock ${veh.stockNumber}?`)) {
                                    deleteVehicle(veh.id);
                                  }
                                }}
                                className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Delete stock"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Showing {paginatedVehicles.length} of {filteredVehicles.length} records</span>
              <span className="font-mono text-[11px]">Sadozai Dealership Stock Ledger</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-12 text-center">
          <Car className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No vehicles found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            No stock matches the selected criteria. Try adjusting or clearing filters.
          </p>
        </div>
      )}

      {/* Global Modals */}
      <VehicleIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
      />

      {selectedDeedVehicle && (
        <VehicleDeedModal
          vehicle={selectedDeedVehicle}
          isOpen={!!selectedDeedVehicle}
          onClose={() => setSelectedDeedVehicle(null)}
        />
      )}
    </div>
  );
}
