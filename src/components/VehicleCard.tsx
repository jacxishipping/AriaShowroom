"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { VehicleItem } from "@/lib/mock-data";
import { useShowroomStore } from "@/store/useShowroomStore";
import { formatCurrency, formatMileage } from "@/lib/utils";
import { translations } from "@/lib/translations";
import {
  ShieldCheck,
  Fuel,
  Gauge,
  Compass,
  FileCheck,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  Car,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Heart,
  Layers,
  Sparkles,
} from "lucide-react";

interface VehicleCardProps {
  vehicle: VehicleItem;
  onQuickView?: (vehicle: VehicleItem) => void;
}

export function VehicleCard({ vehicle, onQuickView }: VehicleCardProps) {
  const {
    currency,
    exchangeRate,
    language,
    currentRole,
    favoriteIds,
    toggleFavorite,
    compareIds,
    toggleCompare,
    addToast,
  } = useShowroomStore();
  const t = translations[language];

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const isFavorite = favoriteIds.includes(vehicle.id);
  const isCompared = compareIds.includes(vehicle.id);
  const currentImage = vehicle.images[activePhotoIndex] || vehicle.images[0];

  // Status styling
  const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    "Available on Lot": {
      bg: "bg-emerald-500/15 border-emerald-500/30",
      text: "text-emerald-700 dark:text-emerald-400",
      dot: "bg-emerald-500",
    },
    "Reserved/Deposit Paid": {
      bg: "bg-amber-500/15 border-amber-500/30",
      text: "text-amber-700 dark:text-amber-400",
      dot: "bg-amber-500",
    },
    "In Transit": {
      bg: "bg-blue-500/15 border-blue-500/30",
      text: "text-blue-700 dark:text-blue-400",
      dot: "bg-blue-500",
    },
    "Under Prep/Maintenance": {
      bg: "bg-purple-500/15 border-purple-500/30",
      text: "text-purple-700 dark:text-purple-400",
      dot: "bg-purple-500",
    },
    Sold: {
      bg: "bg-slate-500/15 border-slate-500/30",
      text: "text-slate-600 dark:text-slate-400",
      dot: "bg-slate-400",
    },
  };

  const statusStyle = statusConfig[vehicle.status] || {
    bg: "bg-slate-500/10 border-slate-500/20",
    text: "text-slate-700 dark:text-slate-300",
    dot: "bg-slate-400",
  };

  // Pre-filled WhatsApp message
  const whatsappUrl = `https://wa.me/93799102030?text=${encodeURIComponent(
    `Hello Sadozai Motors Herat! I am inquiring about:
🚗 ${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.trim})
🏷️ Stock ID: ${vehicle.stockNumber}
🔑 VIN: ${vehicle.vin}
💵 Listed Price: $${vehicle.sellingPrice.toLocaleString()} USD
Link: http://localhost:3000/vehicles/${vehicle.id}`
  )}`;

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActivePhotoIndex((prev) =>
      prev === 0 ? vehicle.images.length - 1 : prev - 1
    );
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActivePhotoIndex((prev) =>
      prev === vehicle.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(vehicle.id);
    addToast(
      isFavorite
        ? `Removed ${vehicle.model} from favorites`
        : `Saved ${vehicle.model} to favorites`,
      "info"
    );
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isCompared && compareIds.length >= 3) {
      addToast("You can compare up to 3 vehicles at a time", "warning");
      return;
    }
    toggleCompare(vehicle.id);
  };

  const marginAmount = vehicle.sellingPrice - vehicle.landedCost;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#111827] shadow-sm hover:shadow-xl hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all duration-300"
    >
      {/* Top Image & Interactive Controls */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Image
          src={currentImage}
          alt={`${vehicle.make} ${vehicle.model}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Subtle Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

        {/* Top Floating Controls Bar */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
          {/* Status Badge */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-md shadow-xs ${statusStyle.bg} ${statusStyle.text} bg-white/80 dark:bg-[#111827]/80`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
              <span>{vehicle.status}</span>
            </span>

            <span className="rounded-full border border-gold/40 bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-gold-light backdrop-blur-md">
              {vehicle.originCountry} Import
            </span>
          </div>

          {/* Quick Action Badges (Compare & Favorite) */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Compare Checkbox Button */}
            <button
              onClick={handleToggleCompare}
              className={`h-7 w-7 rounded-lg flex items-center justify-center backdrop-blur-md transition-colors ${
                isCompared
                  ? "bg-blue-600 text-white shadow-md ring-2 ring-white/50"
                  : "bg-black/50 text-white hover:bg-black/80"
              }`}
              title={isCompared ? "Remove from comparison" : "Add to comparison"}
            >
              <Layers className="h-3.5 w-3.5" />
            </button>

            {/* Favorite Button */}
            <button
              onClick={handleToggleFavorite}
              className={`h-7 w-7 rounded-lg flex items-center justify-center backdrop-blur-md transition-colors ${
                isFavorite
                  ? "bg-red-500 text-white shadow-md"
                  : "bg-black/50 text-white hover:bg-black/80"
              }`}
              title={isFavorite ? "Remove from saved" : "Save vehicle"}
            >
              <Heart
                className={`h-3.5 w-3.5 ${isFavorite ? "fill-white" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Photo Navigation Arrows (on card hover) */}
        {vehicle.images.length > 1 && isHovered && (
          <div className="absolute inset-x-2.5 top-1/2 -translate-y-1/2 flex justify-between z-10 pointer-events-none animate-in fade-in duration-150">
            <button
              onClick={handlePrevPhoto}
              className="pointer-events-auto h-7 w-7 rounded-full bg-black/70 text-white hover:bg-black flex items-center justify-center backdrop-blur-xs shadow-md transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNextPhoto}
              className="pointer-events-auto h-7 w-7 rounded-full bg-black/70 text-white hover:bg-black flex items-center justify-center backdrop-blur-xs shadow-md transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Quick View Button (Centered on card hover) */}
        {onQuickView && isHovered && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none animate-in fade-in duration-200">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(vehicle);
              }}
              className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 text-slate-900 dark:bg-[#111827]/95 dark:text-white font-bold text-xs shadow-xl backdrop-blur-md hover:scale-105 transition-transform"
            >
              <Eye className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Quick Inspect</span>
            </button>
          </div>
        )}

        {/* Bottom Overlay: Stock # and Photo Counter */}
        <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between text-white text-xs z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 font-medium drop-shadow-sm text-[11px]">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="truncate max-w-[140px]">
              {vehicle.customsClearance.split("-")[0].trim()}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
            <span>{vehicle.stockNumber}</span>
            <span>•</span>
            <span>
              {activePhotoIndex + 1}/{vehicle.images.length}
            </span>
          </div>
        </div>
      </div>

      {/* Body Information */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Title & Trim */}
        <div className="mb-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {vehicle.make}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {vehicle.year}
            </span>
          </div>

          <Link href={`/vehicles/${vehicle.id}`}>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors truncate">
              {vehicle.year} {vehicle.model}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {vehicle.trim}
          </p>
        </div>

        {/* Quick Specs Grid */}
        <div className="my-2.5 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 p-2.5 text-xs border border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Gauge className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span className="font-mono">{formatMileage(vehicle.mileage)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Fuel className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span>{vehicle.fuelType}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Compass className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span>{vehicle.driveType}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Car className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span className="truncate">
              {vehicle.steering.includes("Left") ? "LHD" : "RHD Conv."}
            </span>
          </div>
        </div>

        {/* Price & Currency Display */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white">
                {formatCurrency(vehicle.sellingPrice, currency, exchangeRate)}
              </span>
            </div>
            {currency === "AFN" && (
              <div className="text-[10px] font-mono text-slate-400">
                ${vehicle.sellingPrice.toLocaleString()} USD
              </div>
            )}
            {currency === "USD" && (
              <div className="text-[10px] font-mono text-gold-600 dark:text-gold-light">
                ؋ {(vehicle.sellingPrice * exchangeRate).toLocaleString()} AFN
              </div>
            )}
          </div>

          {/* Dealership Margin Pill */}
          {marginAmount > 0 && (
            <div className="text-right">
              <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                +${marginAmount.toLocaleString()} margin
              </span>
            </div>
          )}
        </div>

        {/* CTAs */}
        <div className="mt-3.5 grid grid-cols-2 gap-2">
          <Link
            href={`/vehicles/${vehicle.id}`}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <Eye className="h-3.5 w-3.5 text-slate-400" />
            <span>{t.viewDetails}</span>
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
