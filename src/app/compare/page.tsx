"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useShowroomStore } from "@/store/useShowroomStore";
import { formatCurrency, formatMileage } from "@/lib/utils";
import { translations } from "@/lib/translations";
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
} from "lucide-react";

export default function VehicleComparePage() {
  const { vehicles, compareIds, toggleCompare, clearCompare, language, exchangeRate } =
    useShowroomStore();
  const t = translations[language];

  const comparedVehicles = vehicles.filter((v) => compareIds.includes(v.id));
  const unselectedVehicles = vehicles.filter((v) => !compareIds.includes(v.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/" className="hover:text-primary transition-colors">
              Cockpit
            </Link>
            <span>/</span>
            <Link href="/inventory" className="hover:text-primary transition-colors">
              Inventory
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">
              Fleet Comparison
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            Fleet Specification Comparison ({comparedVehicles.length} of 3)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Side-by-side technical, financial, customs tariff, and equipment audit for high-value buyer presentations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {comparedVehicles.length > 0 && (
            <MuiButton
              variant="outlined"
              color="error"
              size="small"
              onClick={clearCompare}
              startIcon={<Trash2 className="h-4 w-4" />}
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
            startIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Inventory
          </MuiButton>
        </div>
      </div>

      {/* Main Comparison Area */}
      {comparedVehicles.length === 0 ? (
        <MuiCard elevation={1} className="p-12 text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <Layers className="h-8 w-8 text-slate-400" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No vehicles currently selected for comparison
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Select vehicles from the inventory list below or click &apos;Compare&apos; on any vehicle card to analyze their specifications side by side.
            </p>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-2">
            {vehicles.slice(0, 3).map((v) => (
              <MuiButton
                key={v.id}
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => toggleCompare(v.id)}
                startIcon={<Plus className="h-3.5 w-3.5" />}
              >
                Add {v.year} {v.make} {v.model}
              </MuiButton>
            ))}
          </div>
        </MuiCard>
      ) : (
        <div className="space-y-6">
          {/* Quick Picker Bar for remaining slots */}
          {comparedVehicles.length < 3 && unselectedVehicles.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap pl-1">
                + Add vehicle to compare:
              </span>
              {unselectedVehicles.slice(0, 6).map((v) => (
                <button
                  key={v.id}
                  onClick={() => toggleCompare(v.id)}
                  className="flex items-center gap-2 px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary transition-colors shrink-0 cursor-pointer shadow-2xs"
                >
                  <Plus className="h-3 w-3 text-primary" />
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
          <MuiTableContainer component={MuiPaper} elevation={1} className="overflow-x-auto">
            <MuiTable size="medium">
              <MuiTableHead>
                <MuiTableRow className="bg-slate-50 dark:bg-slate-900/60">
                  <MuiTableCell className="w-52 font-bold text-slate-500 uppercase text-[11px] tracking-wider">
                    Specification / Metric
                  </MuiTableCell>
                  {comparedVehicles.map((v) => (
                    <MuiTableCell key={v.id} className="min-w-[260px] pb-4">
                      <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden mb-3 border border-slate-200 dark:border-slate-800 shadow-xs">
                        <Image
                          src={v.images[0]}
                          alt={v.model}
                          fill
                          className="object-cover"
                        />
                        <IconButton
                          size="small"
                          onClick={() => toggleCompare(v.id)}
                          className="!absolute !top-2 !right-2 !bg-black/60 !text-white hover:!bg-black/80"
                          title="Remove from comparison"
                        >
                          <X className="h-4 w-4" />
                        </IconButton>
                        <div className="absolute bottom-2 left-2">
                          <MuiChip
                            label={v.status}
                            size="small"
                            color={v.status === "Available on Lot" ? "success" : "default"}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {v.year} {v.make} {v.model}
                        </h4>
                        <div className="text-xs text-slate-500">{v.trim}</div>
                        <div className="font-mono text-[10px] text-slate-400">
                          Stock: {v.stockNumber}
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <MuiButton
                          component={Link}
                          href={`/vehicles/${v.id}`}
                          variant="contained"
                          color="primary"
                          size="small"
                          fullWidth
                          startIcon={<Eye className="h-3.5 w-3.5" />}
                        >
                          Dossier
                        </MuiButton>
                        <MuiButton
                          component={Link}
                          href={`/vehicles/${v.id}/deed`}
                          variant="outlined"
                          color="inherit"
                          size="small"
                          title="Official Deed"
                        >
                          <FileCheck className="h-3.5 w-3.5" />
                        </MuiButton>
                      </div>
                    </MuiTableCell>
                  ))}
                </MuiTableRow>
              </MuiTableHead>

              <MuiTableBody>
                {/* Section: Pricing */}
                <MuiTableRow className="bg-slate-100/40 dark:bg-slate-800/20 font-bold">
                  <MuiTableCell colSpan={comparedVehicles.length + 1} className="py-2 text-xs text-primary uppercase font-bold tracking-wider">
                    Financial & Pricing Audit
                  </MuiTableCell>
                </MuiTableRow>

                <MuiTableRow>
                  <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                    Showroom Selling Price
                  </MuiTableCell>
                  {comparedVehicles.map((v) => (
                    <MuiTableCell key={v.id}>
                      <div className="font-mono font-bold text-base text-slate-900 dark:text-white">
                        ${v.sellingPrice.toLocaleString()} USD
                      </div>
                      <div className="font-mono text-xs text-emerald-600">
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
                      ${v.landedCost.toLocaleString()} USD
                    </MuiTableCell>
                  ))}
                </MuiTableRow>

                <MuiTableRow>
                  <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                    Gross Margin Spread
                  </MuiTableCell>
                  {comparedVehicles.map((v) => {
                    const margin = v.sellingPrice - v.landedCost;
                    const marginPct = ((margin / v.landedCost) * 100).toFixed(1);
                    return (
                      <MuiTableCell key={v.id}>
                        <MuiChip
                          label={`+$${margin.toLocaleString()} (${marginPct}%)`}
                          color="success"
                          size="small"
                        />
                      </MuiTableCell>
                    );
                  })}
                </MuiTableRow>

                {/* Section: Technical Specs */}
                <MuiTableRow className="bg-slate-100/40 dark:bg-slate-800/20 font-bold">
                  <MuiTableCell colSpan={comparedVehicles.length + 1} className="py-2 text-xs text-primary uppercase font-bold tracking-wider">
                    Technical Specifications
                  </MuiTableCell>
                </MuiTableRow>

                <MuiTableRow>
                  <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                    Mileage / Odometer
                  </MuiTableCell>
                  {comparedVehicles.map((v) => (
                    <MuiTableCell key={v.id} className="font-mono text-xs font-semibold">
                      {formatMileage(v.mileage)}
                    </MuiTableCell>
                  ))}
                </MuiTableRow>

                <MuiTableRow>
                  <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                    Fuel & Transmission
                  </MuiTableCell>
                  {comparedVehicles.map((v) => (
                    <MuiTableCell key={v.id} className="text-xs">
                      {v.fuelType} • {v.transmission}
                    </MuiTableCell>
                  ))}
                </MuiTableRow>

                <MuiTableRow>
                  <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                    Drivetrain & Steering
                  </MuiTableCell>
                  {comparedVehicles.map((v) => (
                    <MuiTableCell key={v.id} className="text-xs">
                      {v.driveType} • {v.steering}
                    </MuiTableCell>
                  ))}
                </MuiTableRow>

                <MuiTableRow>
                  <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                    Exterior Paint Color
                  </MuiTableCell>
                  {comparedVehicles.map((v) => (
                    <MuiTableCell key={v.id} className="text-xs font-medium">
                      {v.color}
                    </MuiTableCell>
                  ))}
                </MuiTableRow>

                {/* Section: Customs & Provenance */}
                <MuiTableRow className="bg-slate-100/40 dark:bg-slate-800/20 font-bold">
                  <MuiTableCell colSpan={comparedVehicles.length + 1} className="py-2 text-xs text-primary uppercase font-bold tracking-wider">
                    Customs Clearance & Afghan Legal Status
                  </MuiTableCell>
                </MuiTableRow>

                <MuiTableRow>
                  <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                    Import Country of Origin
                  </MuiTableCell>
                  {comparedVehicles.map((v) => (
                    <MuiTableCell key={v.id} className="text-xs">
                      {v.originCountry}
                    </MuiTableCell>
                  ))}
                </MuiTableRow>

                <MuiTableRow>
                  <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                    Islam Qala Customs Maktoub
                  </MuiTableCell>
                  {comparedVehicles.map((v) => (
                    <MuiTableCell key={v.id} className="text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                        <Check className="h-3.5 w-3.5 shrink-0" />
                        <span>{v.customsClearance}</span>
                      </div>
                    </MuiTableCell>
                  ))}
                </MuiTableRow>

                <MuiTableRow>
                  <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                    VIN / Chassis Code
                  </MuiTableCell>
                  {comparedVehicles.map((v) => (
                    <MuiTableCell key={v.id} className="font-mono text-xs text-slate-500">
                      {v.vin}
                    </MuiTableCell>
                  ))}
                </MuiTableRow>

                <MuiTableRow>
                  <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                    Showroom Lot Yard
                  </MuiTableCell>
                  {comparedVehicles.map((v) => (
                    <MuiTableCell key={v.id} className="text-xs text-slate-600 dark:text-slate-300">
                      {v.yardLocation}
                    </MuiTableCell>
                  ))}
                </MuiTableRow>

                <MuiTableRow>
                  <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                    Equipped Features
                  </MuiTableCell>
                  {comparedVehicles.map((v) => (
                    <MuiTableCell key={v.id}>
                      <div className="flex flex-wrap gap-1 max-w-[280px]">
                        {v.features.map((f, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </MuiTableCell>
                  ))}
                </MuiTableRow>
              </MuiTableBody>
            </MuiTable>
          </MuiTableContainer>
        </div>
      )}
    </div>
  );
}
