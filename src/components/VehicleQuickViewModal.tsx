"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { VehicleItem } from "@/lib/mock-data";
import { useShowroomStore } from "@/store/useShowroomStore";
import { formatMileage } from "@/lib/utils";
import { translations } from "@/lib/translations";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Send,
  Eye,
  FileText,
  Heart,
} from "lucide-react";
import { MuiButton, MuiChip, IconButton } from "@/components/mui";

interface VehicleQuickViewModalProps {
  vehicle: VehicleItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenDeed?: (vehicle: VehicleItem) => void;
}

export function VehicleQuickViewModal({
  vehicle,
  isOpen,
  onClose,
  onOpenDeed,
}: VehicleQuickViewModalProps) {
  const { exchangeRate, language, favoriteIds, toggleFavorite } = useShowroomStore();
  const [activePhoto, setActivePhoto] = useState(0);

  if (!isOpen || !vehicle) return null;

  const t = translations[language];
  const isFav = favoriteIds.includes(vehicle.id);
  const primaryImage = vehicle.images[activePhoto] || vehicle.images[0];

  const whatsappUrl = `https://wa.me/93799102030?text=${encodeURIComponent(
    `Hello Sadozai Motors Herat! I am interested in inspecting the following vehicle:
🚗 ${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.trim})
🏷️ Stock ID: ${vehicle.stockNumber}
🔑 VIN: ${vehicle.vin}
💵 Price: $${vehicle.sellingPrice.toLocaleString()} USD
Please schedule a viewing or share more photos.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#111827]/95 px-5 py-3.5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
              {vehicle.stockNumber}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h2>
            <span className="text-xs text-slate-400 hidden sm:inline">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              {vehicle.trim}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <IconButton
              size="small"
              onClick={() => toggleFavorite(vehicle.id)}
              color={isFav ? "error" : "default"}
              title="Save to favorites"
            >
              <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
            </IconButton>
            <IconButton size="small" onClick={onClose}>
              <X className="h-5 w-5" />
            </IconButton>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Photo Gallery Column (7 cols) */}
          <div className="md:col-span-7 space-y-3">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-black border border-slate-200 dark:border-slate-800">
              <Image
                src={primaryImage}
                alt={`${vehicle.make} ${vehicle.model}`}
                fill
                className="object-cover"
              />
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                <MuiChip
                  label={vehicle.status}
                  color={vehicle.status === "Available on Lot" ? "success" : "default"}
                  size="small"
                />
                <span className="rounded-md bg-slate-900/80 px-2 py-0.5 text-[11px] font-semibold text-white shadow-xs backdrop-blur-xs">
                  {vehicle.originCountry} Direct Import
                </span>
              </div>

              {vehicle.images.length > 1 && (
                <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                  <button
                    onClick={() =>
                      setActivePhoto((prev) =>
                        prev === 0 ? vehicle.images.length - 1 : prev - 1
                      )
                    }
                    className="pointer-events-auto rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      setActivePhoto((prev) =>
                        prev === vehicle.images.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="pointer-events-auto rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="absolute bottom-2.5 right-2.5 bg-black/70 text-white font-mono text-[10px] px-2 py-0.5 rounded backdrop-blur-xs">
                {activePhoto + 1} / {vehicle.images.length}
              </div>
            </div>

            {/* Thumbnail Track */}
            {vehicle.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {vehicle.images.slice(0, 8).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhoto(idx)}
                    className={`relative aspect-[16/10] w-14 shrink-0 overflow-hidden rounded-md border transition-all cursor-pointer ${
                      activePhoto === idx
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt="Thumbnail" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Customs Clearance Banner */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                  Islam Qala Dry Port Clearance Verified
                </span>
                <span className="text-emerald-700 dark:text-emerald-400/90 text-[11px]">
                  {vehicle.customsClearance}
                </span>
              </div>
            </div>
          </div>

          {/* Details & Specs Column (5 cols) */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Pricing Box */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Showroom Listed Price
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                    ${vehicle.sellingPrice.toLocaleString()}
                  </span>
                  <span className="text-xs font-mono text-slate-500 uppercase">USD</span>
                </div>
                <div className="mt-1 font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">
                  ؋ {(vehicle.sellingPrice * exchangeRate).toLocaleString()} AFN
                </div>
                <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200/80 dark:border-slate-800 pt-2 flex items-center justify-between">
                  <span>Landed Cost:</span>
                  <span className="font-mono font-semibold">${vehicle.landedCost.toLocaleString()}</span>
                </div>
              </div>

              {/* Quick Spec Pills */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-2.5 bg-white dark:bg-[#111827]">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Year / Make</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{vehicle.year} {vehicle.make}</span>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-2.5 bg-white dark:bg-[#111827]">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Mileage</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{formatMileage(vehicle.mileage)}</span>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-2.5 bg-white dark:bg-[#111827]">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Transmission</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{vehicle.transmission}</span>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-2.5 bg-white dark:bg-[#111827]">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Fuel & Drive</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{vehicle.fuelType} • {vehicle.driveType}</span>
                </div>
              </div>

              {/* VIN & Origin */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-[#111827] text-xs space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">VIN:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 select-all">{vehicle.vin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Steering:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{vehicle.steering}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Color:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{vehicle.color}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <MuiButton
                component={Link}
                href={`/vehicles/${vehicle.id}`}
                onClick={onClose}
                variant="contained"
                color="primary"
                fullWidth
                size="medium"
                startIcon={<Eye className="h-4 w-4" />}
              >
                View Full Inspection & Album
              </MuiButton>

              <div className="grid grid-cols-2 gap-2">
                {onOpenDeed && (
                  <MuiButton
                    onClick={() => {
                      onClose();
                      onOpenDeed(vehicle);
                    }}
                    variant="outlined"
                    color="inherit"
                    size="small"
                    startIcon={<FileText className="h-3.5 w-3.5 text-warning" />}
                  >
                    Print Deed
                  </MuiButton>
                )}

                <MuiButton
                  component="a"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  color="success"
                  size="small"
                  startIcon={<Send className="h-3.5 w-3.5" />}
                >
                  WhatsApp
                </MuiButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
