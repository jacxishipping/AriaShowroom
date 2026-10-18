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

  // Client-side instant faceted filtering
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      // Search
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesQuery =
          v.make.toLowerCase().includes(query) ||
          v.model.toLowerCase().includes(query) ||
          v.trim.toLowerCase().includes(query) ||
          v.vin.toLowerCase().includes(query) ||
          v.stockNumber.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // Make
      if (filters.make !== "ALL" && v.make !== filters.make) return false;

      // Body Type
      if (filters.bodyType !== "ALL" && v.bodyType !== filters.bodyType) return false;

      // Fuel Type
      if (filters.fuelType !== "ALL" && v.fuelType !== filters.fuelType) return false;

      // Steering Side
      if (filters.steering !== "ALL" && v.steering !== filters.steering) return false;

      // Origin
      if (filters.originCountry !== "ALL" && v.originCountry !== filters.originCountry) return false;

      // Status
      if (filters.status !== "ALL" && v.status !== filters.status) return false;

      return true;
    });
  }, [vehicles, filters]);

  return (
    <div className="space-y-6">
      {/* ERP Inventory Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-gold">
            Lot Stock Ledger & Landed Cost Ledger
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {language === "ps"
              ? "د موجودو موټرونو ګودام او مدیریت"
              : language === "fa"
              ? "گدام موجودی و انبار موترهای نمایشگاه"
              : "Vehicle Inventory & Stock Ledger"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time inspection data, Islam Qala customs clearance slips, 40+ photo albums, and landed margins
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Table / Lot Grid Switcher */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-800 dark:bg-navy-950">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                viewMode === "table"
                  ? "bg-navy text-gold shadow-xs dark:bg-gold dark:text-slate-950"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              <Table className="h-3.5 w-3.5" />
              <span>Data Table</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                viewMode === "grid"
                  ? "bg-navy text-gold shadow-xs dark:bg-gold dark:text-slate-950"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Lot Cards</span>
            </button>
          </div>

          <button
            onClick={() => setIsIntakeOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gold px-4 py-2 text-xs font-extrabold text-slate-950 shadow-md hover:bg-gold-light transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{t.addNewVehicle}</span>
          </button>
        </div>
      </div>

      {/* Multi-Criteria Faceted Filter Component */}
      <VehicleFilters />

      {/* Main Stock Content: Table or Grid */}
      {filteredVehicles.length > 0 ? (
        viewMode === "table" ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-navy-900 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-navy-800 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Stock # / Vehicle</th>
                  <th className="p-3.5">VIN / Chassis</th>
                  <th className="p-3.5">Origin & Specs</th>
                  <th className="p-3.5">Gomrok Customs</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">40+ Photos</th>
                  <th className="p-3.5">Landed Cost</th>
                  <th className="p-3.5">Selling Price</th>
                  <th className="p-3.5">Gross Margin</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredVehicles.map((veh) => {
                  const marginAmount = veh.sellingPrice - veh.landedCost;
                  const marginPercent =
                    veh.landedCost > 0
                      ? ((marginAmount / veh.landedCost) * 100).toFixed(1)
                      : "0";

                  return (
                    <tr
                      key={veh.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-navy-800/50 transition-colors"
                    >
                      <td className="p-3.5">
                        <Link
                          href={`/vehicles/${veh.id}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-gold block"
                        >
                          {veh.year} {veh.make} {veh.model}
                        </Link>
                        <span className="text-[11px] font-mono text-gold">
                          {veh.stockNumber} • {veh.trim}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                        {veh.vin}
                      </td>

                      <td className="p-3.5">
                        <span className="font-semibold block">{veh.originCountry}</span>
                        <span className="text-[10px] text-slate-400">
                          {formatMileage(veh.mileage)} • {veh.fuelType}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-600 dark:text-slate-300 max-w-[140px] truncate">
                        <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="h-3 w-3 shrink-0" />
                          <span className="truncate">{veh.customsClearance.split("-")[0]}</span>
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            veh.status === "Available on Lot"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : veh.status === "In Transit"
                              ? "bg-blue-500/10 text-blue-500"
                              : veh.status === "Under Prep/Maintenance"
                              ? "bg-purple-500/10 text-purple-500"
                              : veh.status === "Reserved/Deposit Paid"
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-slate-500/10 text-slate-500"
                          }`}
                        >
                          {veh.status}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <Link
                          href={`/vehicles/${veh.id}`}
                          className="font-mono text-[11px] font-bold text-gold hover:underline"
                        >
                          📸 {veh.images.length}
                        </Link>
                      </td>

                      <td className="p-3.5 font-mono">
                        {formatCurrency(veh.landedCost, currency, exchangeRate)}
                      </td>

                      <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(veh.sellingPrice, currency, exchangeRate)}
                      </td>

                      <td className="p-3.5 font-mono text-emerald-500 font-bold">
                        +${marginAmount.toLocaleString()} ({marginPercent}%)
                      </td>

                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <Link
                          href={`/vehicles/${veh.id}`}
                          className="inline-block rounded-lg p-1.5 text-slate-400 hover:text-gold hover:bg-slate-100 dark:hover:bg-navy-800"
                          title="View 40+ Gallery & Specs"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setSelectedDeedVehicle(veh)}
                          className="rounded-lg p-1.5 text-gold hover:bg-gold/10"
                          title="Generate Legal Sales Deed"
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
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-500/10"
                            title="Delete Stock"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-navy-900">
          <SearchX className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
            {t.noVehiclesFound}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            No stock records match the selected query. Reset filters to view all lot units.
          </p>
        </div>
      )}

      {/* Modals */}
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
