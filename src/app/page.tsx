"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { formatCurrency } from "@/lib/utils";
import { VehicleDeedModal } from "@/components/VehicleDeedModal";
import { VehicleIntakeModal } from "@/components/VehicleIntakeModal";
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
  } = useShowroomStore();

  const t = translations[language];

  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [selectedDeedVehicle, setSelectedDeedVehicle] = useState<VehicleItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusTab, setStatusTab] = useState<"ALL" | "Available on Lot" | "In Transit" | "Reserved/Deposit Paid" | "Sold">("ALL");
  const [sortField, setSortField] = useState<"sellingPrice" | "landedCost" | "year" | "stockNumber">("year");
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Clean Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {language === "ps"
              ? "د نندارتون عملیاتي مرکز"
              : language === "fa"
              ? "مرکز عملیاتی نمایشگاه"
              : "Operations Cockpit"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sadozai Motors Herat • Fleet inventory, customs port clearance, and margin analytics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportInventoryToCSV(vehicles)}
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

      {/* 4 Clean Metric Cards (Restrained & Professional) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Lot Valuation</span>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalActiveValue, currency, exchangeRate)}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>{activeLotVehicles.length} units on lot</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
              +${totalProjectedProfit.toLocaleString()} margin
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Executed Sales</span>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
            +{formatCurrency(totalMonthlySales, currency, exchangeRate)}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span>{sales.length} legal sales deeds signed</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Fleet Size</span>
            <Car className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
            {vehicles.length} Units
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">{availableCount} Available</span>
            <span>•</span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">{inTransitCount} En Route</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Customs Status</span>
            <ShieldCheck className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
            100% Cleared
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Islam Qala port duty settled</span>
          </div>
        </div>
      </div>

      {/* Main Stock Registry Container */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xs overflow-hidden">
        {/* Table Toolbar: Status Filter Tabs + Search */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/30">
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                  statusTab === tab.id
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter stock #, VIN, make..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Clean Enterprise Data Table */}
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
              {processedVehicles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No vehicles found matching current criteria.
                  </td>
                </tr>
              ) : (
                processedVehicles.map((veh) => {
                  const marginAmount = veh.sellingPrice - veh.landedCost;
                  const marginPercent =
                    veh.landedCost > 0
                      ? ((marginAmount / veh.landedCost) * 100).toFixed(1)
                      : "0";

                  // Status badge style
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
                      {/* Vehicle & Stock */}
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

                      {/* VIN */}
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                        {veh.vin}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot}`} />
                          <span>{veh.status}</span>
                        </span>
                      </td>

                      {/* Customs */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate max-w-[140px] text-[11px]">{veh.customsClearance.split("-")[0].trim()}</span>
                        </div>
                      </td>

                      {/* Landed Cost */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                        ${veh.landedCost.toLocaleString()}
                      </td>

                      {/* Selling Price */}
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

                      {/* Target Margin */}
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        +${marginAmount.toLocaleString()} ({marginPercent}%)
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/vehicles/${veh.id}`}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="View Inspection & Specs"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          <button
                            onClick={() => setSelectedDeedVehicle(veh)}
                            className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Generate Official Deed"
                          >
                            <FileText className="h-4 w-4" />
                          </button>

                          {currentRole === "SuperAdmin" && (
                            <button
                              onClick={() => {
                                if (confirm(`Delete vehicle ${veh.stockNumber}?`)) {
                                  deleteVehicle(veh.id);
                                }
                              }}
                              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Delete vehicle"
                            >
                              <Trash2 className="h-4 w-4" />
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
          <span>Showing {processedVehicles.length} of {vehicles.length} fleet records</span>
          <span className="font-mono text-[11px]">Herat Bagh-e-Azadi Inventory Ledger</span>
        </div>
      </div>

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
