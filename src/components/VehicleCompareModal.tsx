"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useShowroomStore } from "@/store/useShowroomStore";
import { formatCurrency, formatMileage } from "@/lib/utils";
import { translations } from "@/lib/translations";
import { X, Check, Eye, Trash2, ShieldCheck, ArrowRight } from "lucide-react";

interface VehicleCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VehicleCompareModal({ isOpen, onClose }: VehicleCompareModalProps) {
  const { vehicles, compareIds, toggleCompare, clearCompare, currency, exchangeRate, language } =
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

          <div className="flex items-center gap-3">
            {comparedVehicles.length > 0 && (
              <button
                onClick={clearCompare}
                className="text-xs font-semibold text-red-600 hover:text-red-700 dark:hover:text-red-400 transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
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
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3 px-4 w-44 font-semibold text-slate-400 uppercase text-[10px] tracking-wider bg-slate-50/50 dark:bg-slate-900/30">
                      Feature / Spec
                    </th>
                    {comparedVehicles.map((v) => (
                      <th key={v.id} className="py-3 px-4 min-w-[220px]">
                        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden mb-2.5 border border-slate-200 dark:border-slate-800">
                          <Image
                            src={v.images[0]}
                            alt={v.model}
                            fill
                            className="object-cover"
                          />
                          <button
                            onClick={() => toggleCompare(v.id)}
                            className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                            title="Remove from comparison"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          {v.year} {v.make} {v.model}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">{v.stockNumber}</div>
                        <div className="mt-1.5 font-mono text-base font-bold text-blue-600 dark:text-blue-400">
                          ${v.sellingPrice.toLocaleString()}
                        </div>
                        <div className="mt-2">
                          <Link
                            href={`/vehicles/${v.id}`}
                            onClick={onClose}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
                          >
                            <span>Inspect Specs</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {/* Status */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/30">Status</td>
                    {comparedVehicles.map((v) => (
                      <td key={v.id} className="py-3 px-4">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{v.status}</span>
                      </td>
                    ))}
                  </tr>
                  {/* Landed Cost vs Margin */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/30">Landed Cost</td>
                    {comparedVehicles.map((v) => (
                      <td key={v.id} className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                        ${v.landedCost.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/30">Target Margin</td>
                    {comparedVehicles.map((v) => {
                      const margin = v.sellingPrice - v.landedCost;
                      return (
                        <td key={v.id} className="py-3 px-4 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          +${margin.toLocaleString()}
                        </td>
                      );
                    })}
                  </tr>
                  {/* Mileage */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/30">Mileage</td>
                    {comparedVehicles.map((v) => (
                      <td key={v.id} className="py-3 px-4 font-mono">
                        {formatMileage(v.mileage)}
                      </td>
                    ))}
                  </tr>
                  {/* Body Type */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/30">Body Type</td>
                    {comparedVehicles.map((v) => (
                      <td key={v.id} className="py-3 px-4">{v.bodyType}</td>
                    ))}
                  </tr>
                  {/* Fuel & Drive */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/30">Fuel & Drive</td>
                    {comparedVehicles.map((v) => (
                      <td key={v.id} className="py-3 px-4">{v.fuelType} • {v.driveType}</td>
                    ))}
                  </tr>
                  {/* Transmission */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/30">Transmission</td>
                    {comparedVehicles.map((v) => (
                      <td key={v.id} className="py-3 px-4">{v.transmission}</td>
                    ))}
                  </tr>
                  {/* Steering */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/30">Steering</td>
                    {comparedVehicles.map((v) => (
                      <td key={v.id} className="py-3 px-4">{v.steering}</td>
                    ))}
                  </tr>
                  {/* Origin */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/30">Origin Country</td>
                    {comparedVehicles.map((v) => (
                      <td key={v.id} className="py-3 px-4 font-medium">{v.originCountry} Direct Import</td>
                    ))}
                  </tr>
                  {/* Customs Clearance */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/30">Customs Clearance</td>
                    {comparedVehicles.map((v) => (
                      <td key={v.id} className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                          <ShieldCheck className="h-4 w-4 shrink-0" />
                          <span>{v.customsClearance}</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                  {/* Color */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/30">Color</td>
                    {comparedVehicles.map((v) => (
                      <td key={v.id} className="py-3 px-4">{v.color}</td>
                    ))}
                  </tr>
                  {/* Key Features */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-500 bg-slate-50/50 dark:bg-slate-900/30 align-top">Key Features</td>
                    {comparedVehicles.map((v) => (
                      <td key={v.id} className="py-3 px-4 align-top">
                        <ul className="space-y-1">
                          {v.features.slice(0, 5).map((f, i) => (
                            <li key={i} className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                              <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
