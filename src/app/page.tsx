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

  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [selectedDeedVehicle, setSelectedDeedVehicle] = useState<VehicleItem | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  // Active lot vehicles
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

  // Status breakdown counts
  const availableCount = vehicles.filter((v) => v.status === "Available on Lot").length;
  const inTransitCount = vehicles.filter((v) => v.status === "In Transit").length;
  const underPrepCount = vehicles.filter((v) => v.status === "Under Prep/Maintenance").length;
  const reservedCount = vehicles.filter((v) => v.status === "Reserved/Deposit Paid").length;
  const soldCount = vehicles.filter((v) => v.status === "Sold").length;

  // Faceted list filtering
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

  // Paginated vehicles
  const paginatedVehicles = useMemo(() => {
    return filteredVehicles.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  }, [filteredVehicles, page]);

  return (
    <div className="space-y-6">
      {/* Material Top Bar: Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#D97706]">
              Live Lot Telemetry • Herat Bagh-e-Azadi Lot
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
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

        <div className="flex flex-wrap items-center gap-2">
          <MuiButton
            variant="outlined"
            size="small"
            onClick={() => exportInventoryToCSV(vehicles)}
            startIcon={<FileSpreadsheet className="h-4 w-4 text-emerald-600" />}
          >
            Export Lot CSV
          </MuiButton>

          <Link href="/admin">
            <MuiButton
              variant="outlined"
              size="small"
              startIcon={<Users className="h-4 w-4 text-[#1976D2]" />}
            >
              CRM & Financials Hub
            </MuiButton>
          </Link>

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

      {/* Material KPI Cards Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Lot Value */}
        <MuiCard elevation={1}>
          <MuiCardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t.totalActiveValue}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D97706]/15 text-[#D97706]">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
              {formatCurrency(totalActiveValue, currency, exchangeRate)}
            </p>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>{activeLotVehicles.length} active lot units</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                +${totalProjectedProfit.toLocaleString()} profit
              </span>
            </div>
          </MuiCardContent>
        </MuiCard>

        {/* Metric 2: Monthly Sales Revenue */}
        <MuiCard elevation={1}>
          <MuiCardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t.monthlyRevenue}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
              +{formatCurrency(totalMonthlySales, currency, exchangeRate)}
            </p>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>{sales.length} contracts signed</span>
              <span className="font-mono text-slate-400">Herat Lot</span>
            </div>
          </MuiCardContent>
        </MuiCard>

        {/* Metric 3: Lot Units Status Breakdown */}
        <MuiCard elevation={1}>
          <MuiCardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Lot Unit Statuses
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1976D2]/15 text-[#1976D2]">
                <Car className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
              {vehicles.length} Total Fleet
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <MuiChip label={`${availableCount} Available`} color="success" size="small" />
              <MuiChip label={`${inTransitCount} In Transit`} color="info" size="small" />
              <MuiChip label={`${reservedCount} Reserved`} color="warning" size="small" />
            </div>
          </MuiCardContent>
        </MuiCard>

        {/* Metric 4: Islam Qala Customs Status */}
        <MuiCard elevation={1}>
          <MuiCardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Islam Qala Customs
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-[#D97706]">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
              100% Cleared
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug pt-1">
              All active lot vehicles verified with official customs clearance slips & legal maktoub
            </p>
          </MuiCardContent>
        </MuiCard>
      </div>

      {/* Main Lot Stock Management Section (Material Paper) */}
      <MuiCard elevation={1}>
        <MuiCardHeader
          title="Active Showroom Stock Registry"
          subheader={`Showing ${filteredVehicles.length} of ${vehicles.length} units currently tracked in Herat lot`}
          action={
            <div className="flex items-center gap-2">
              {/* Quick Status Filter Dropdown */}
              <select
                value={filters.status}
                onChange={(e) => setFilter("status", e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-[#121824] dark:text-slate-200 outline-none focus:border-[#1976D2]"
              >
                <option value="ALL">All Statuses</option>
                <option value="Available on Lot">{t.availableTag}</option>
                <option value="In Transit">{t.inTransitTag}</option>
                <option value="Under Prep/Maintenance">{t.underPrepTag}</option>
                <option value="Reserved/Deposit Paid">{t.reservedTag}</option>
                <option value="Sold">{t.soldTag}</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center rounded-md border border-slate-300 p-0.5 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <button
                  onClick={() => setViewMode("table")}
                  className={`flex items-center gap-1 rounded px-2 py-0.5 text-xs font-bold transition-all ${
                    viewMode === "table"
                      ? "bg-[#1976D2] text-white shadow-2xs"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                  }`}
                  title="Dense Data Table"
                >
                  <Table className="h-3 w-3" />
                  <span className="hidden sm:inline">Table</span>
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-1 rounded px-2 py-0.5 text-xs font-bold transition-all ${
                    viewMode === "grid"
                      ? "bg-[#1976D2] text-white shadow-2xs"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                  }`}
                  title="Lot Walk Card Grid"
                >
                  <LayoutGrid className="h-3 w-3" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
              </div>
            </div>
          }
        />

        {/* View Mode 1: Material Dense Data Table */}
        {viewMode === "table" ? (
          <div>
            <div className="overflow-x-auto">
              <MuiTable dense>
                <MuiTableHead>
                  <MuiTableRow hover={false}>
                    <MuiTableCell header>Stock # / Unit</MuiTableCell>
                    <MuiTableCell header>VIN / Chassis</MuiTableCell>
                    <MuiTableCell header>Origin & Steering</MuiTableCell>
                    <MuiTableCell header>Customs Slip</MuiTableCell>
                    <MuiTableCell header>Status</MuiTableCell>
                    <MuiTableCell header>Photos</MuiTableCell>
                    <MuiTableCell header>Landed Cost</MuiTableCell>
                    <MuiTableCell header>Selling Price</MuiTableCell>
                    <MuiTableCell header>Target Margin</MuiTableCell>
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
                        {/* Stock # & Vehicle Info */}
                        <MuiTableCell>
                          <Link
                            href={`/vehicles/${veh.id}`}
                            className="font-bold text-slate-900 dark:text-white hover:text-[#1976D2] transition-colors block"
                          >
                            {veh.year} {veh.make} {veh.model}
                          </Link>
                          <span className="text-[11px] font-mono text-[#D97706] font-semibold">
                            {veh.stockNumber} • {veh.trim}
                          </span>
                        </MuiTableCell>

                        {/* VIN */}
                        <MuiTableCell className="font-mono text-slate-600 dark:text-slate-400">
                          {veh.vin}
                        </MuiTableCell>

                        {/* Origin & Steering */}
                        <MuiTableCell>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                            {veh.originCountry}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {veh.steering.includes("Left") ? "LHD (Left)" : "RHD Conv."}
                          </span>
                        </MuiTableCell>

                        {/* Customs Slip */}
                        <MuiTableCell>
                          <MuiChip
                            label="Islam Qala Cleared"
                            color="success"
                            variant="outlined"
                            size="small"
                          />
                        </MuiTableCell>

                        {/* Status */}
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

                        {/* Photos count */}
                        <MuiTableCell>
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                            📷 {veh.images.length}
                          </span>
                        </MuiTableCell>

                        {/* Landed Cost */}
                        <MuiTableCell className="font-mono font-medium text-slate-700 dark:text-slate-300">
                          ${veh.landedCost.toLocaleString()}
                        </MuiTableCell>

                        {/* Selling Price */}
                        <MuiTableCell>
                          <div className="font-bold text-slate-900 dark:text-white font-mono">
                            {formatCurrency(veh.sellingPrice, currency, exchangeRate)}
                          </div>
                          {currency === "AFN" && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              ${veh.sellingPrice.toLocaleString()} USD
                            </span>
                          )}
                        </MuiTableCell>

                        {/* Margin */}
                        <MuiTableCell>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            +${marginAmount.toLocaleString()} ({marginPercent}%)
                          </span>
                        </MuiTableCell>

                        {/* Actions */}
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
          </div>
        ) : (
          /* View Mode 2: Material Lot Cards Grid */
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVehicles.map((veh) => (
              <MuiCard key={veh.id} elevation={1} className="flex flex-col justify-between">
                <div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
                    <Image
                      src={veh.images[0]}
                      alt={veh.model}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <MuiChip label={`#${veh.stockNumber}`} color="primary" size="small" />
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      <MuiChip label={veh.status} color="success" size="small" />
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D97706]">
                      {veh.originCountry} • {veh.steering.split(" ")[0]}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {veh.year} {veh.make} {veh.model}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">VIN: {veh.vin}</p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Lot Price</span>
                        <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                          {formatCurrency(veh.sellingPrice, currency, exchangeRate)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase">Target Margin</span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          +${(veh.sellingPrice - veh.landedCost).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 pt-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <Link href={`/vehicles/${veh.id}`} className="flex-1">
                    <MuiButton variant="contained" size="small" fullWidth>
                      View Lot Car
                    </MuiButton>
                  </Link>
                  <MuiButton
                    variant="outlined"
                    color="gold"
                    size="small"
                    onClick={() => setSelectedDeedVehicle(veh)}
                  >
                    Deed
                  </MuiButton>
                </div>
              </MuiCard>
            ))}
          </div>
        )}
      </MuiCard>

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
