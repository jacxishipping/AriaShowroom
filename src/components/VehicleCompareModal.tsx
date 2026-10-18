"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useShowroomStore } from "@/store/useShowroomStore";
import { formatMileage } from "@/lib/utils";
import { X, Check, ShieldCheck, ArrowRight } from "lucide-react";
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
  IconButton,
} from "@/components/mui";

interface VehicleCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VehicleCompareModal({ isOpen, onClose }: VehicleCompareModalProps) {
  const { vehicles, compareIds, toggleCompare, clearCompare } =
    useShowroomStore();

  if (!isOpen) return null;

  const comparedVehicles = vehicles.filter((v) => compareIds.includes(v.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#111827]/95 px-6 py-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Fleet Specification Comparison ({comparedVehicles.length} of 3)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Side-by-side technical, financial, and customs audit
            </p>
          </div>

          <div className="flex items-center gap-2">
            {comparedVehicles.length > 0 && (
              <MuiButton
                variant="text"
                color="error"
                size="small"
                onClick={clearCompare}
              >
                Clear All
              </MuiButton>
            )}
            <IconButton size="small" onClick={onClose}>
              <X className="h-5 w-5" />
            </IconButton>
          </div>
        </div>

        {/* Comparison Table / Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {comparedVehicles.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-sm">No vehicles selected for comparison.</p>
              <p className="text-xs mt-1 text-slate-500">
                Check the "Compare" box on any vehicle in the Inventory to compare side-by-side.
              </p>
            </div>
          ) : (
            <MuiTableContainer>
              <MuiTable size="small">
                <MuiTableHead>
                  <MuiTableRow>
                    <MuiTableCell className="w-44 font-semibold text-slate-400 uppercase text-[10px] tracking-wider bg-slate-50/50 dark:bg-slate-900/30">
                      Feature / Spec
                    </MuiTableCell>
                    {comparedVehicles.map((v) => (
                      <MuiTableCell key={v.id} className="min-w-[220px]">
                        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden mb-2.5 border border-slate-200 dark:border-slate-800">
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
                            <X className="h-3.5 w-3.5" />
                          </IconButton>
                        </div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          {v.year} {v.make} {v.model}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">{v.stockNumber}</div>
                        <div className="mt-1.5 font-mono text-base font-bold text-primary">
                          ${v.sellingPrice.toLocaleString()}
                        </div>
                        <div className="mt-2">
                          <MuiButton
                            component={Link}
                            href={`/vehicles/${v.id}`}
                            onClick={onClose}
                            variant="text"
                            color="primary"
                            size="small"
                            endIcon={<ArrowRight className="h-3 w-3" />}
                          >
                            Inspect Specs
                          </MuiButton>
                        </div>
                      </MuiTableCell>
                    ))}
                  </MuiTableRow>
                </MuiTableHead>
                <MuiTableBody>
                  {/* Status */}
                  <MuiTableRow hover>
                    <MuiTableCell className="font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/30">Status</MuiTableCell>
                    {comparedVehicles.map((v) => (
                      <MuiTableCell key={v.id}>
                        <MuiChip
                          label={v.status}
                          color={v.status === "Available on Lot" ? "success" : "default"}
                          size="small"
                        />
                      </MuiTableCell>
                    ))}
                  </MuiTableRow>
                  {/* Landed Cost */}
                  <MuiTableRow hover>
                    <MuiTableCell className="font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/30">Landed Cost</MuiTableCell>
                    {comparedVehicles.map((v) => (
                      <MuiTableCell key={v.id} className="font-mono font-medium text-slate-700 dark:text-slate-300">
                        ${v.landedCost.toLocaleString()}
                      </MuiTableCell>
                    ))}
                  </MuiTableRow>
                  {/* Target Margin */}
                  <MuiTableRow hover>
                    <MuiTableCell className="font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/30">Target Margin</MuiTableCell>
                    {comparedVehicles.map((v) => {
                      const margin = v.sellingPrice - v.landedCost;
                      return (
                        <MuiTableCell key={v.id} className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          +${margin.toLocaleString()}
                        </MuiTableCell>
                      );
                    })}
                  </MuiTableRow>
                  {/* Mileage */}
                  <MuiTableRow hover>
                    <MuiTableCell className="font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/30">Mileage</MuiTableCell>
                    {comparedVehicles.map((v) => (
                      <MuiTableCell key={v.id} className="font-mono">
                        {formatMileage(v.mileage)}
                      </MuiTableCell>
                    ))}
                  </MuiTableRow>
                  {/* Body Type */}
                  <MuiTableRow hover>
                    <MuiTableCell className="font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/30">Body Type</MuiTableCell>
                    {comparedVehicles.map((v) => (
                      <MuiTableCell key={v.id}>{v.bodyType}</MuiTableCell>
                    ))}
                  </MuiTableRow>
                  {/* Fuel & Drive */}
                  <MuiTableRow hover>
                    <MuiTableCell className="font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/30">Fuel & Drive</MuiTableCell>
                    {comparedVehicles.map((v) => (
                      <MuiTableCell key={v.id}>{v.fuelType} • {v.driveType}</MuiTableCell>
                    ))}
                  </MuiTableRow>
                  {/* Transmission */}
                  <MuiTableRow hover>
                    <MuiTableCell className="font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/30">Transmission</MuiTableCell>
                    {comparedVehicles.map((v) => (
                      <MuiTableCell key={v.id}>{v.transmission}</MuiTableCell>
                    ))}
                  </MuiTableRow>
                  {/* Steering */}
                  <MuiTableRow hover>
                    <MuiTableCell className="font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/30">Steering</MuiTableCell>
                    {comparedVehicles.map((v) => (
                      <MuiTableCell key={v.id}>{v.steering}</MuiTableCell>
                    ))}
                  </MuiTableRow>
                  {/* Origin */}
                  <MuiTableRow hover>
                    <MuiTableCell className="font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/30">Origin Country</MuiTableCell>
                    {comparedVehicles.map((v) => (
                      <MuiTableCell key={v.id} className="font-medium">{v.originCountry} Direct Import</MuiTableCell>
                    ))}
                  </MuiTableRow>
                  {/* Customs Clearance */}
                  <MuiTableRow hover>
                    <MuiTableCell className="font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/30">Customs Clearance</MuiTableCell>
                    {comparedVehicles.map((v) => (
                      <MuiTableCell key={v.id}>
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                          <ShieldCheck className="h-4 w-4 shrink-0" />
                          <span>{v.customsClearance}</span>
                        </div>
                      </MuiTableCell>
                    ))}
                  </MuiTableRow>
                  {/* Color */}
                  <MuiTableRow hover>
                    <MuiTableCell className="font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/30">Color</MuiTableCell>
                    {comparedVehicles.map((v) => (
                      <MuiTableCell key={v.id}>{v.color}</MuiTableCell>
                    ))}
                  </MuiTableRow>
                  {/* Key Features */}
                  <MuiTableRow hover>
                    <MuiTableCell className="font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/30 align-top">Key Features</MuiTableCell>
                    {comparedVehicles.map((v) => (
                      <MuiTableCell key={v.id} className="align-top">
                        <ul className="space-y-1">
                          {v.features.slice(0, 5).map((f, i) => (
                            <li key={i} className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                              <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </MuiTableCell>
                    ))}
                  </MuiTableRow>
                </MuiTableBody>
              </MuiTable>
            </MuiTableContainer>
          )}
        </div>
      </div>
    </div>
  );
}
