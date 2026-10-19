"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useShowroomStore } from "@/store/useShowroomStore";
import { formatCurrency, formatMileage } from "@/lib/utils";
import { translations } from "@/lib/translations";
import { VehicleItem } from "@/lib/mock-data";
import {
  MuiTableContainer,
  MuiTable,
  MuiTableHead,
  MuiTableBody,
  MuiTableRow,
  MuiTableCell,
  MuiPaper,
  MuiButton,
  MuiChip,
  MuiCard,
  MuiTextField,
  MenuItem,
  IconButton,
} from "@/components/mui";
import {
  Layers,
  ArrowLeft,
  X,
  Check,
  ShieldCheck,
  ArrowRight,
  Car,
  DollarSign,
  Plus,
  Trash2,
  Eye,
  FileCheck,
  Printer,
  Sparkles,
  TrendingUp,
  Award,
  Filter,
} from "lucide-react";

type SpecCategory = "ALL" | "FINANCIAL" | "MECHANICAL" | "CUSTOMS" | "FEATURES";

export default function VehicleComparePage() {
  const {
    vehicles,
    compareIds,
    toggleCompare,
    clearCompare,
    language,
    exchangeRate,
    addToast,
  } = useShowroomStore();
  const t = translations[language];

  const [activeCategory, setActiveCategory] = useState<SpecCategory>("ALL");
  const [highlightDiffsOnly, setHighlightDiffsOnly] = useState(false);

  const comparedVehicles = useMemo(() => {
    return vehicles.filter((v) => compareIds.includes(v.id));
  }, [vehicles, compareIds]);

  const unselectedVehicles = useMemo(() => {
    return vehicles.filter((v) => !compareIds.includes(v.id));
  }, [vehicles, compareIds]);

  // Calculations for best-in-class highlights
  const minPrice = useMemo(() => {
    if (comparedVehicles.length === 0) return 0;
    return Math.min(...comparedVehicles.map((v) => v.sellingPrice));
  }, [comparedVehicles]);

  const minMileage = useMemo(() => {
    if (comparedVehicles.length === 0) return 0;
    return Math.min(...comparedVehicles.map((v) => v.mileage));
  }, [comparedVehicles]);

  const maxMargin = useMemo(() => {
    if (comparedVehicles.length === 0) return 0;
    return Math.max(...comparedVehicles.map((v) => v.sellingPrice - (v.landedCost || 0)));
  }, [comparedVehicles]);

  // Handle swapping a vehicle in an existing slot
  const handleSwapVehicle = (currentId: string, newId: string) => {
    if (currentId === newId) return;
    toggleCompare(currentId);
    toggleCompare(newId);
    addToast("Vehicle replaced in comparison slot", "info");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 space-y-4 pb-16">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800 print:hidden">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-0.5">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Cockpit
            </Link>
            <span>/</span>
            <Link href="/inventory" className="hover:text-blue-600 transition-colors">
              Inventory
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">
              Fleet Comparison
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Side-by-Side Fleet Specification Audit ({comparedVehicles.length} of 3)
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Head-to-head comparison of mechanical specs, landed costs, Islam Qala customs clearance, and equipment.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <MuiButton
            variant="outlined"
            size="small"
            onClick={() => window.print()}
            startIcon={<Printer className="h-3.5 w-3.5" />}
            sx={{ fontSize: "11px", py: "3px" }}
          >
            Print Comparison Dossier
          </MuiButton>

          {comparedVehicles.length > 0 && (
            <MuiButton
              variant="outlined"
              color="error"
              size="small"
              onClick={clearCompare}
              startIcon={<Trash2 className="h-3.5 w-3.5" />}
              sx={{ fontSize: "11px", py: "3px" }}
            >
              Clear All
            </MuiButton>
          )}

          <MuiButton
            component={Link}
            href="/inventory"
            variant="contained"
            color="primary"
            size="small"
            startIcon={<ArrowLeft className="h-3.5 w-3.5" />}
            sx={{ fontSize: "11px", py: "3px" }}
          >
            Back to Inventory
          </MuiButton>
        </div>
      </div>

      {/* Main Comparison Area */}
      {comparedVehicles.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#121824] space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-blue-500/10 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Layers className="h-6 w-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No vehicles currently selected for comparison
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pick up to 3 vehicles to analyze specifications, landed costs, and Afghan market margins side-by-side.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-2">
            {vehicles.slice(0, 3).map((v) => (
              <MuiButton
                key={v.id}
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => toggleCompare(v.id)}
                startIcon={<Plus className="h-3 w-3" />}
                sx={{ fontSize: "11px", py: "3px" }}
              >
                + Compare {v.year} {v.make} {v.model}
              </MuiButton>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Controls Bar: Category Filter & Difference Highlighter (Hidden in Print) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 print:hidden">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setActiveCategory("ALL")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  activeCategory === "ALL"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                All Specifications
              </button>
              <button
                onClick={() => setActiveCategory("FINANCIAL")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  activeCategory === "FINANCIAL"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Pricing & Landed Cost
              </button>
              <button
                onClick={() => setActiveCategory("MECHANICAL")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  activeCategory === "MECHANICAL"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Powertrain & Mechanical
              </button>
              <button
                onClick={() => setActiveCategory("CUSTOMS")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  activeCategory === "CUSTOMS"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Gomrok & Provenance
              </button>
              <button
                onClick={() => setActiveCategory("FEATURES")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  activeCategory === "FEATURES"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Features & Options
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setHighlightDiffsOnly(!highlightDiffsOnly)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                  highlightDiffsOnly
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                }`}
              >
                <Sparkles className="h-3 w-3" />
                <span>Highlight Differences</span>
              </button>
            </div>
          </div>

          {/* Quick Picker Bar for remaining slots */}
          {comparedVehicles.length < 3 && unselectedVehicles.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 print:hidden">
              <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap pl-1">
                + Add vehicle to comparison:
              </span>
              {unselectedVehicles.slice(0, 6).map((v) => (
                <button
                  key={v.id}
                  onClick={() => toggleCompare(v.id)}
                  className="flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-500 transition-colors shrink-0 cursor-pointer shadow-2xs"
                >
                  <Plus className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span>
                    {v.year} {v.make} {v.model}
                  </span>
                  <span className="font-mono text-slate-400 text-[10px]">
                    ${v.sellingPrice.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Side-by-Side Comparison Matrix */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#111827] shadow-xs overflow-hidden print:border-none print:shadow-none">
            <div className="overflow-x-auto">
              <MuiTable dense size="small" className="w-full">
                <MuiTableHead>
                  <MuiTableRow className="bg-slate-50/70 dark:bg-slate-900/60">
                    <MuiTableCell className="w-56 font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                      Vehicle & Specification
                    </MuiTableCell>
                    {comparedVehicles.map((v) => (
                      <MuiTableCell key={v.id} className="min-w-[240px] pb-3 align-top">
                        <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden mb-2 border border-slate-200 dark:border-slate-800 shadow-xs bg-slate-100 dark:bg-slate-800">
                          <Image
                            src={v.images[0] || "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=600&q=80"}
                            alt={v.model}
                            fill
                            className="object-cover"
                          />
                          <IconButton
                            size="small"
                            onClick={() => toggleCompare(v.id)}
                            className="!absolute !top-1.5 !right-1.5 !bg-black/60 !text-white hover:!bg-black/80 !p-1 print:hidden"
                            title="Remove from comparison"
                          >
                            <X className="h-3.5 w-3.5" />
                          </IconButton>
                          <div className="absolute bottom-1.5 left-1.5">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-600 text-white">
                              {v.status}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {v.year} {v.make} {v.model}
                          </h4>
                          <div className="text-[11px] text-slate-500 truncate">{v.trim || "GCC Spec"}</div>
                          <div className="font-mono text-[10px] text-slate-400">
                            Stock: {v.stockNumber}
                          </div>
                        </div>

                        {/* Quick Swap Dropdown (Hidden in Print) */}
                        <div className="mt-2 print:hidden">
                          <MuiTextField
                            select
                            size="small"
                            fullWidth
                            value={v.id}
                            onChange={(e) => handleSwapVehicle(v.id, e.target.value)}
                            sx={{ fontSize: "11px", "& .MuiSelect-select": { py: "2px", fontSize: "11px" } }}
                          >
                            <MenuItem value={v.id}>
                              Active: {v.year} {v.make} {v.model}
                            </MenuItem>
                            {unselectedVehicles.map((u) => (
                              <MenuItem key={u.id} value={u.id}>
                                Swap with: {u.year} {u.make} {u.model} (${u.sellingPrice.toLocaleString()})
                              </MenuItem>
                            ))}
                          </MuiTextField>
                        </div>

                        <div className="mt-2 flex gap-1.5 print:hidden">
                          <MuiButton
                            component={Link}
                            href={`/vehicles/${v.id}`}
                            variant="contained"
                            color="primary"
                            size="small"
                            fullWidth
                            sx={{ fontSize: "11px", py: "3px" }}
                            startIcon={<Eye className="h-3 w-3" />}
                          >
                            Dossier
                          </MuiButton>
                          <MuiButton
                            component={Link}
                            href={`/verify?vin=${v.vin}`}
                            variant="outlined"
                            color="inherit"
                            size="small"
                            sx={{ py: "3px", px: "6px" }}
                            title="Verify Certificate"
                          >
                            <ShieldCheck className="h-3 w-3 text-blue-600" />
                          </MuiButton>
                        </div>
                      </MuiTableCell>
                    ))}
                  </MuiTableRow>
                </MuiTableHead>

                <MuiTableBody>
                  {/* SECTION 1: FINANCIAL & PRICING */}
                  {(activeCategory === "ALL" || activeCategory === "FINANCIAL") && (
                    <>
                      <MuiTableRow className="bg-slate-100/50 dark:bg-slate-800/30">
                        <MuiTableCell
                          colSpan={comparedVehicles.length + 1}
                          className="py-1.5 text-[10px] text-blue-600 dark:text-blue-400 uppercase font-bold tracking-wider"
                        >
                          Financial & Valuation Audit
                        </MuiTableCell>
                      </MuiTableRow>

                      <MuiTableRow className={highlightDiffsOnly ? "bg-amber-50/20 dark:bg-amber-950/10" : ""}>
                        <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                          Showroom Selling Price (USD)
                        </MuiTableCell>
                        {comparedVehicles.map((v) => (
                          <MuiTableCell key={v.id}>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                                ${v.sellingPrice.toLocaleString()} USD
                              </span>
                              {v.sellingPrice === minPrice && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                  <Award className="h-2.5 w-2.5" /> Best Price
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-xs text-emerald-600 dark:text-emerald-400">
                              ؋ {(v.sellingPrice * exchangeRate).toLocaleString()} AFN
                            </div>
                          </MuiTableCell>
                        ))}
                      </MuiTableRow>

                      <MuiTableRow>
                        <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                          Landed Cost (Customs + Freight)
                        </MuiTableCell>
                        {comparedVehicles.map((v) => (
                          <MuiTableCell key={v.id} className="font-mono text-xs text-slate-600 dark:text-slate-300">
                            ${v.landedCost?.toLocaleString() || "N/A"} USD
                          </MuiTableCell>
                        ))}
                      </MuiTableRow>

                      <MuiTableRow>
                        <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                          Gross Margin Spread
                        </MuiTableCell>
                        {comparedVehicles.map((v) => {
                          const margin = v.sellingPrice - (v.landedCost || v.purchasePrice || 0);
                          const marginPct = (
                            (margin / (v.landedCost || v.purchasePrice || 1)) *
                            100
                          ).toFixed(1);

                          return (
                            <MuiTableCell key={v.id}>
                              <div className="flex items-center gap-1 flex-wrap">
                                <MuiChip
                                  label={`+$${margin.toLocaleString()} (${marginPct}%)`}
                                  color="success"
                                  size="small"
                                />
                                {margin === maxMargin && (
                                  <span className="text-[10px] text-emerald-600 font-bold">★ Top Margin</span>
                                )}
                              </div>
                            </MuiTableCell>
                          );
                        })}
                      </MuiTableRow>

                      <MuiTableRow>
                        <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                          FOB Purchase Price
                        </MuiTableCell>
                        {comparedVehicles.map((v) => (
                          <MuiTableCell key={v.id} className="font-mono text-xs text-slate-500">
                            ${v.purchasePrice?.toLocaleString() || "N/A"} USD
                          </MuiTableCell>
                        ))}
                      </MuiTableRow>
                    </>
                  )}

                  {/* SECTION 2: MECHANICAL & POWERTRAIN */}
                  {(activeCategory === "ALL" || activeCategory === "MECHANICAL") && (
                    <>
                      <MuiTableRow className="bg-slate-100/50 dark:bg-slate-800/30">
                        <MuiTableCell
                          colSpan={comparedVehicles.length + 1}
                          className="py-1.5 text-[10px] text-blue-600 dark:text-blue-400 uppercase font-bold tracking-wider"
                        >
                          Mechanical Specifications & Powertrain
                        </MuiTableCell>
                      </MuiTableRow>

                      <MuiTableRow>
                        <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                          Mileage / Odometer
                        </MuiTableCell>
                        {comparedVehicles.map((v) => (
                          <MuiTableCell key={v.id} className="font-mono text-xs font-semibold">
                            <div className="flex items-center gap-1.5">
                              <span>{formatMileage(v.mileage)}</span>
                              {v.mileage === minMileage && (
                                <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1 rounded">
                                  Lowest KM
                                </span>
                              )}
                            </div>
                          </MuiTableCell>
                        ))}
                      </MuiTableRow>

                      <MuiTableRow>
                        <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                          Fuel Type & Transmission
                        </MuiTableCell>
                        {comparedVehicles.map((v) => (
                          <MuiTableCell key={v.id} className="text-xs">
                            <span className="font-semibold">{v.fuelType}</span> • {v.transmission}
                          </MuiTableCell>
                        ))}
                      </MuiTableRow>

                      <MuiTableRow>
                        <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                          Drivetrain & Steering
                        </MuiTableCell>
                        {comparedVehicles.map((v) => (
                          <MuiTableCell key={v.id} className="text-xs">
                            <span className="font-mono font-semibold">{v.driveType}</span> • {v.steering}
                          </MuiTableCell>
                        ))}
                      </MuiTableRow>

                      <MuiTableRow>
                        <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                          Exterior Color
                        </MuiTableCell>
                        {comparedVehicles.map((v) => (
                          <MuiTableCell key={v.id} className="text-xs font-medium">
                            {v.color}
                          </MuiTableCell>
                        ))}
                      </MuiTableRow>
                    </>
                  )}

                  {/* SECTION 3: CUSTOMS & PROVENANCE */}
                  {(activeCategory === "ALL" || activeCategory === "CUSTOMS") && (
                    <>
                      <MuiTableRow className="bg-slate-100/50 dark:bg-slate-800/30">
                        <MuiTableCell
                          colSpan={comparedVehicles.length + 1}
                          className="py-1.5 text-[10px] text-blue-600 dark:text-blue-400 uppercase font-bold tracking-wider"
                        >
                          Customs Clearance & Afghan Legal Status
                        </MuiTableCell>
                      </MuiTableRow>

                      <MuiTableRow>
                        <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                          Country of Origin
                        </MuiTableCell>
                        {comparedVehicles.map((v) => (
                          <MuiTableCell key={v.id} className="text-xs font-semibold">
                            {v.originCountry}
                          </MuiTableCell>
                        ))}
                      </MuiTableRow>

                      <MuiTableRow>
                        <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                          Islam Qala Gomrok Clearance
                        </MuiTableCell>
                        {comparedVehicles.map((v) => (
                          <MuiTableCell key={v.id} className="text-xs">
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                              <Check className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{v.customsClearance}</span>
                            </div>
                          </MuiTableCell>
                        ))}
                      </MuiTableRow>

                      <MuiTableRow>
                        <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                          VIN / Chassis Number
                        </MuiTableCell>
                        {comparedVehicles.map((v) => (
                          <MuiTableCell key={v.id} className="font-mono text-xs text-slate-500">
                            {v.vin}
                          </MuiTableCell>
                        ))}
                      </MuiTableRow>

                      <MuiTableRow>
                        <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                          Showroom Lot Bay
                        </MuiTableCell>
                        {comparedVehicles.map((v) => (
                          <MuiTableCell key={v.id} className="text-xs text-slate-600 dark:text-slate-300">
                            {v.yardLocation || "Bagh-e-Azadi"}
                          </MuiTableCell>
                        ))}
                      </MuiTableRow>
                    </>
                  )}

                  {/* SECTION 4: EQUIPPED FEATURES */}
                  {(activeCategory === "ALL" || activeCategory === "FEATURES") && (
                    <>
                      <MuiTableRow className="bg-slate-100/50 dark:bg-slate-800/30">
                        <MuiTableCell
                          colSpan={comparedVehicles.length + 1}
                          className="py-1.5 text-[10px] text-blue-600 dark:text-blue-400 uppercase font-bold tracking-wider"
                        >
                          Factory Equipment & Options
                        </MuiTableCell>
                      </MuiTableRow>

                      <MuiTableRow>
                        <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                          Features List
                        </MuiTableCell>
                        {comparedVehicles.map((v) => (
                          <MuiTableCell key={v.id}>
                            <div className="flex flex-wrap gap-1 max-w-[280px]">
                              {v.features.map((f, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium"
                                >
                                  {f}
                                </span>
                              ))}
                            </div>
                          </MuiTableCell>
                        ))}
                      </MuiTableRow>
                    </>
                  )}
                </MuiTableBody>
              </MuiTable>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
