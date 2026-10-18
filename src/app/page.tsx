"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { formatCurrency, formatMileage } from "@/lib/utils";
import { VehicleDeedModal } from "@/components/VehicleDeedModal";
import { VehicleIntakeModal } from "@/components/VehicleIntakeModal";
import { VehicleItem } from "@/lib/mock-data";
import { exportInventoryToCSV, exportSalesLedgerToCSV } from "@/lib/export-utils";
import {
  Car,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Truck,
  Users,
  FileText,
  Plus,
  Eye,
  Trash2,
  Table,
  LayoutGrid,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Compass,
  ArrowUpRight,
  ExternalLink,
  Printer,
  Sparkles,
  Search,
  FileSpreadsheet,
  Download,
} from "lucide-react";

export default function ErpOperationsCockpit() {
  const {
    vehicles,
    customers,
    sales,
    expenses,
    currency,
    exchangeRate,
    language,
    currentRole,
    filters,
    setFilter,
    deleteVehicle,
  } = useShowroomStore();

  const t = translations[language];

  // View Mode: Dense Table vs Visual Lot Grid (iPad/Lot walk mode)
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedDeedVehicle, setSelectedDeedVehicle] = useState<VehicleItem | null>(null);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);

  // Financial Calculations
  const activeLotVehicles = vehicles.filter((v) => v.status !== "Sold");
  const totalActiveValue = activeLotVehicles.reduce((acc, v) => acc + v.sellingPrice, 0);
  const totalLandedCost = activeLotVehicles.reduce((acc, v) => acc + v.landedCost, 0);
  const totalProjectedProfit = totalActiveValue - totalLandedCost;
  const totalMonthlySales = sales.reduce((acc, s) => acc + s.salePriceUSD, 0);

  // Status counts
  const availableCount = vehicles.filter((v) => v.status === "Available on Lot").length;
  const inTransitCount = vehicles.filter((v) => v.status === "In Transit").length;
  const underPrepCount = vehicles.filter((v) => v.status === "Under Prep/Maintenance").length;
  const reservedCount = vehicles.filter((v) => v.status === "Reserved/Deposit Paid").length;

  // Filtered inventory
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matches =
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.stockNumber.toLowerCase().includes(q) ||
          v.vin.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (filters.make !== "ALL" && v.make !== filters.make) return false;
      if (filters.status !== "ALL" && v.status !== filters.status) return false;
      return true;
    });
  }, [vehicles, filters]);

  return (
    <div className="space-y-6">
      {/* Cockpit Top Bar: Title & Quick Intake Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-gold">
              Live Lot Telemetry • Herat Bagh-e-Azadi Lot
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {language === "ps"
              ? "د سدوزی موټرز د مدیریت او عملیاتو مرکز"
              : language === "fa"
              ? "مرکز عملیات و مدیریت نمایشگاه سدوزی"
              : "Dealership Operations & Stock Cockpit"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time inventory valuation, customs port clearances, sales pipeline, and landed cost analytics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => exportInventoryToCSV(vehicles)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-navy-900 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer"
            title="Download full lot stock spreadsheet with margins and customs data"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
            <span className="hidden sm:inline">Export Excel / CSV</span>
            <span className="sm:hidden">Export</span>
          </button>

          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-navy-900 dark:text-slate-200 transition-colors shadow-xs"
          >
            <Users className="h-4 w-4 text-gold" />
            <span>CRM & Financials Hub</span>
          </Link>

          <button
            onClick={() => setIsIntakeOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-gold to-gold-light px-4 py-2 text-xs font-extrabold text-slate-950 shadow-md hover:brightness-110 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{t.addNewVehicle}</span>
          </button>
        </div>
      </div>

      {/* Operational KPI Metric Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Lot Value */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-navy-900 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {t.totalActiveValue}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/15 text-gold">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {formatCurrency(totalActiveValue, currency, exchangeRate)}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{activeLotVehicles.length} active lot units</span>
            <span className="font-mono text-emerald-500 font-bold">
              +${totalProjectedProfit.toLocaleString()} projected profit
            </span>
          </div>
        </div>

        {/* Metric 2: Monthly Sales Revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-navy-900 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {t.monthlyRevenue}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-500 font-mono">
            +{formatCurrency(totalMonthlySales, currency, exchangeRate)}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{sales.length} contracts signed</span>
            <span className="font-mono text-slate-400">Herat Lot</span>
          </div>
        </div>

        {/* Metric 3: Lot Units Status Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-navy-900 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Lot Unit Statuses
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-500">
              <Car className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {vehicles.length} Total Fleet
          </p>
          <div className="flex flex-wrap gap-2 text-[10px] font-mono">
            <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-bold text-emerald-600 dark:text-emerald-400">
              {availableCount} Available
            </span>
            <span className="rounded bg-blue-500/10 px-1.5 py-0.5 font-bold text-blue-500">
              {inTransitCount} In Transit
            </span>
            <span className="rounded bg-purple-500/10 px-1.5 py-0.5 font-bold text-purple-500">
              {underPrepCount} Prep
            </span>
            <span className="rounded bg-amber-500/10 px-1.5 py-0.5 font-bold text-amber-500">
              {reservedCount} Reserved
            </span>
          </div>
        </div>

        {/* Metric 4: Islam Qala Customs Status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-navy-900 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Islam Qala Customs
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            100% Cleared
          </p>
          <p className="text-xs text-slate-500 leading-snug">
            All active lot vehicles verified with official customs clearance slips & legal maktoub
          </p>
        </div>
      </div>

      {/* Main Lot Stock Management Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-navy-900 space-y-5">
        {/* Table / Grid Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Active Showroom Stock Registry
            </h2>
            <span className="rounded-full bg-slate-100 dark:bg-navy-800 px-2.5 py-0.5 text-xs font-mono font-bold text-gold">
              {filteredVehicles.length} of {vehicles.length} Units
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Status Filter Dropdown */}
            <select
              value={filters.status}
              onChange={(e) => setFilter("status", e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-navy-800 dark:text-white outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Available on Lot">{t.availableTag}</option>
              <option value="In Transit">{t.inTransitTag}</option>
              <option value="Under Prep/Maintenance">{t.underPrepTag}</option>
              <option value="Reserved/Deposit Paid">{t.reservedTag}</option>
              <option value="Sold">{t.soldTag}</option>
            </select>

            {/* Quick Make Filter */}
            <select
              value={filters.make}
              onChange={(e) => setFilter("make", e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-navy-800 dark:text-white outline-none"
            >
              <option value="ALL">{t.allMakes}</option>
              <option value="Toyota">Toyota</option>
              <option value="Lexus">Lexus</option>
            </select>

            {/* View Mode Toggle: Dense Data Table vs Lot Inspection Grid */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-800 dark:bg-navy-950">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  viewMode === "table"
                    ? "bg-navy text-gold shadow-xs dark:bg-gold dark:text-slate-950"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                }`}
                title="Dense Data Table"
              >
                <Table className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  viewMode === "grid"
                    ? "bg-navy text-gold shadow-xs dark:bg-gold dark:text-slate-950"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                }`}
                title="Lot Walk Card Grid"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Lot Grid</span>
              </button>
            </div>
          </div>
        </div>

        {/* View Mode 1: Dense Enterprise Data Table */}
        {viewMode === "table" ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-navy-800 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Stock # / Unit</th>
                  <th className="p-3.5">VIN / Chassis</th>
                  <th className="p-3.5">Origin & Steering</th>
                  <th className="p-3.5">Customs Slip</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Photos</th>
                  <th className="p-3.5">Landed Cost</th>
                  <th className="p-3.5">Lot Selling Price</th>
                  <th className="p-3.5">Target Margin</th>
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
                      {/* Stock # & Vehicle Info */}
                      <td className="p-3.5">
                        <Link
                          href={`/vehicles/${veh.id}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-gold transition-colors block"
                        >
                          {veh.year} {veh.make} {veh.model}
                        </Link>
                        <span className="text-[11px] font-mono text-gold dark:text-gold-light">
                          {veh.stockNumber} • {veh.trim}
                        </span>
                      </td>

                      {/* VIN */}
                      <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                        {veh.vin}
                      </td>

                      {/* Origin & Steering */}
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {veh.originCountry}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {veh.steering.includes("Left") ? "LHD (Left)" : "RHD Conv."}
                        </span>
                      </td>

                      {/* Customs Clearance */}
                      <td className="p-3.5 text-slate-600 dark:text-slate-300 max-w-[140px] truncate">
                        <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="h-3 w-3 shrink-0" />
                          <span className="truncate">{veh.customsClearance.split("-")[0]}</span>
                        </span>
                      </td>

                      {/* Status */}
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

                      {/* Photo Vault Counter */}
                      <td className="p-3.5">
                        <Link
                          href={`/vehicles/${veh.id}`}
                          className="flex items-center gap-1 font-mono text-[11px] font-bold text-gold hover:underline"
                        >
                          <span>📸 {veh.images.length}</span>
                        </Link>
                      </td>

                      {/* Landed Cost */}
                      <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                        {formatCurrency(veh.landedCost, currency, exchangeRate)}
                      </td>

                      {/* Selling Price */}
                      <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(veh.sellingPrice, currency, exchangeRate)}
                      </td>

                      {/* Target Margin */}
                      <td className="p-3.5 font-mono">
                        <span className="text-emerald-500 font-bold">
                          +${marginAmount.toLocaleString()} ({marginPercent}%)
                        </span>
                      </td>

                      {/* Actions */}
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
          /* View Mode 2: Lot Walk Visual Card Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVehicles.map((veh) => (
              <div
                key={veh.id}
                className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:border-gold/50 dark:border-slate-800 dark:bg-navy-950 transition-all"
              >
                <div className="relative aspect-[16/10] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <Image
                    src={veh.images[0]}
                    alt={veh.model}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                      {veh.status}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-mono font-bold text-gold-light backdrop-blur-md">
                      📸 {veh.images.length} Photos
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[11px] font-mono text-white drop-shadow">
                    <span>{veh.stockNumber}</span>
                    <span>{formatMileage(veh.mileage)}</span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      {veh.year} {veh.make} {veh.model}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">{veh.trim}</p>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex items-baseline justify-between font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Selling Price</span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(veh.sellingPrice, currency, exchangeRate)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Margin</span>
                      <span className="text-xs font-bold text-emerald-500">
                        +${(veh.sellingPrice - veh.landedCost).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href={`/vehicles/${veh.id}`}
                      className="flex items-center justify-center gap-1 rounded-lg border border-slate-200 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Inspect</span>
                    </Link>
                    <button
                      onClick={() => setSelectedDeedVehicle(veh)}
                      className="flex items-center justify-center gap-1 rounded-lg bg-gold py-1.5 text-xs font-bold text-slate-950 hover:bg-gold-light"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Deed</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CRM Quick Deals & Customs Logistics Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active CRM Leads & Negotiations (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-navy-900 space-y-4">
          <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gold" />
              <h3 className="font-bold text-slate-900 dark:text-white">
                Active Buyer Pipeline & Tazkira Registry
              </h3>
            </div>
            <Link href="/admin" className="text-xs font-bold text-gold hover:underline">
              Full CRM Pipeline →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {customers.slice(0, 4).map((cust) => (
              <div key={cust.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {cust.fullName}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Tazkira: {cust.tazkiraNumber} • {cust.phone}
                  </p>
                  {cust.tradeInRecord && (
                    <p className="text-[10px] text-gold-light">
                      Trade-In: {cust.tradeInRecord}
                    </p>
                  )}
                </div>

                <div className="text-right space-y-1">
                  <span className="inline-block rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold uppercase">
                    {cust.leadStage}
                  </span>
                  <p className="font-mono font-bold text-slate-900 dark:text-white">
                    Budget: ${cust.budget.toLocaleString()} USD
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Islam Qala & Bandar Abbas Logistics Overview (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-navy-900 space-y-4">
          <div className="flex items-center gap-2 border-b pb-3 dark:border-slate-800">
            <Truck className="h-4 w-4 text-gold" />
            <h3 className="font-bold text-slate-900 dark:text-white">
              Herat Customs & Port Logistics
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-navy-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">
                  Islam Qala Dry Port Corridor
                </span>
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-bold text-emerald-500">
                  Open
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                120km West of Herat City. Direct truck convoy connections from Bandar Abbas container terminal.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-navy-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">
                  Gomrok Herat Verification Office
                </span>
                <span className="font-mono text-gold font-bold text-[10px]">
                  Daily 08:00 - 16:30
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Official document stamps, vehicle weight scale receipts, and Negative-Plate maktoub releases issued on lot.
              </p>
            </div>

            <div className="rounded-xl bg-gold/10 p-3 border border-gold/20 flex items-center justify-between">
              <div>
                <p className="font-bold text-gold text-xs">Execute New Sale & Deed</p>
                <p className="text-[10px] text-slate-500">Bilingual contract with instant PDF generation</p>
              </div>
              <Link
                href="/admin"
                className="rounded-lg bg-navy px-3 py-1.5 text-xs font-bold text-gold hover:bg-navy-800 dark:bg-gold dark:text-slate-950"
              >
                Go to Sales
              </Link>
            </div>
          </div>
        </div>
      </div>

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
