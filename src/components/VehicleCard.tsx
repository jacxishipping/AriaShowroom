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
  Send,
  Eye,
  Car,
  ChevronLeft,
  ChevronRight,
  Heart,
  Layers,
} from "lucide-react";
import { MuiCard, MuiChip, MuiButton, IconButton } from "@/components/mui";

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
    clientPresentationMode,
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

  const showDealerMargin =
    !clientPresentationMode &&
    (currentRole === "SuperAdmin" || currentRole === "Accountant");

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Available on Lot":
        return "bg-emerald-950/80 text-emerald-300 border-emerald-500/30";
      case "Reserved/Deposit Paid":
        return "bg-amber-950/80 text-amber-300 border-amber-500/30";
      case "In Transit":
        return "bg-blue-950/80 text-blue-300 border-blue-500/30";
      default:
        return "bg-slate-900/80 text-slate-200 border-white/15";
    }
  };

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
  const originUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/vehicles/${vehicle.id}`
      : `/vehicles/${vehicle.id}`;

  const whatsappUrl = `https://wa.me/93799102030?text=${encodeURIComponent(
    `Hello Sadozai Motors Herat! I am inquiring about:
${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.trim})
Stock ID: ${vehicle.stockNumber}
VIN: ${vehicle.vin}
Listed Price: $${vehicle.sellingPrice.toLocaleString()} USD
Details: ${originUrl}`
  )}`;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col rounded-md border border-[#D8D5CD] dark:border-[#242A38] bg-white dark:bg-[#11141B] overflow-hidden transition-colors hover:border-[#111318] dark:hover:border-amber-500/70"
    >
      {/* Top Architectural Lot & Status Header Bar (Keeps Photo 100% Unobstructed) */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-[#E2E0D8] dark:border-[#1F2430] bg-[#FAF9F6] dark:bg-[#0D1017] font-mono text-[11px]">
        <div className="flex items-center gap-2 truncate">
          <span className="font-bold text-[#111318] dark:text-amber-400">
            {vehicle.stockNumber}
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-slate-500 dark:text-slate-400 uppercase">
            {vehicle.originCountry}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
              vehicle.status === "Available on Lot"
                ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30"
                : vehicle.status === "Reserved/Deposit Paid"
                ? "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30"
                : vehicle.status === "In Transit"
                ? "bg-stone-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-stone-300 dark:border-slate-700"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
            }`}
          >
            {vehicle.status === "Available on Lot"
              ? "ON LOT"
              : vehicle.status === "Reserved/Deposit Paid"
              ? "RESERVED"
              : vehicle.status.toUpperCase()}
          </span>

          <button
            onClick={handleToggleCompare}
            className={`h-6 w-6 rounded flex items-center justify-center border transition-colors ${
              isCompared
                ? "bg-[#111318] text-white border-[#111318] dark:bg-amber-500 dark:text-black dark:border-amber-500"
                : "border-[#D8D5CD] dark:border-[#242A38] text-slate-500 hover:text-[#111318] dark:hover:text-white"
            }`}
            title={isCompared ? "Remove from comparison" : "Add to comparison"}
            aria-label={isCompared ? "Remove from comparison" : "Add to comparison"}
          >
            <Layers className="h-3 w-3" />
          </button>

          <button
            onClick={handleToggleFavorite}
            className={`h-6 w-6 rounded flex items-center justify-center border transition-colors ${
              isFavorite
                ? "bg-rose-600 text-white border-rose-600"
                : "border-[#D8D5CD] dark:border-[#242A38] text-slate-500 hover:text-rose-600"
            }`}
            title={isFavorite ? "Remove from saved" : "Save vehicle"}
            aria-label={isFavorite ? "Remove from saved" : "Save vehicle"}
          >
            <Heart className={`h-3 w-3 ${isFavorite ? "fill-white" : ""}`} />
          </button>
        </div>
      </div>

      {/* Unobstructed 16:10 Vehicle Photography Viewport */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100 dark:bg-slate-900">
        <Link href={`/vehicles/${vehicle.id}`} className="block w-full h-full">
          <Image
            src={currentImage}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            fill
            referrerPolicy="no-referrer"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-103"
          />
        </Link>

        {/* Photo Navigation Arrows */}
        {vehicle.images.length > 1 && (
          <div
            className={`absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between z-10 pointer-events-none transition-opacity duration-150 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <button
              onClick={handlePrevPhoto}
              className="pointer-events-auto h-7 w-7 rounded bg-black/75 text-white hover:bg-black flex items-center justify-center transition-colors"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            </button>
            <button
              onClick={handleNextPhoto}
              className="pointer-events-auto h-7 w-7 rounded bg-black/75 text-white hover:bg-black flex items-center justify-center transition-colors"
              aria-label="Next photo"
            >
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </button>
          </div>
        )}

        {/* Quick View Trigger */}
        {onQuickView && isHovered && (
          <button
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView(vehicle);
            }}
            className="absolute bottom-2.5 start-2.5 z-10 px-2.5 py-1 rounded bg-black/80 hover:bg-black text-white font-mono text-[10px] font-semibold uppercase tracking-wider backdrop-blur-xs transition-colors"
          >
            QUICK INSPECT
          </button>
        )}

        {/* Discreet Monospace Frame Counter */}
        <div className="absolute bottom-2.5 end-2.5 px-1.5 py-0.5 rounded bg-black/75 font-mono tabular-nums text-[10px] text-white/90 pointer-events-none">
          {activePhotoIndex + 1}/{vehicle.images.length}
        </div>
      </div>

      {/* Title & Chassis Block */}
      <div className="p-4 pb-3">
        <Link href={`/vehicles/${vehicle.id}`} className="block">
          <h3 className="text-base font-bold text-[#111318] group-hover:text-amber-700 dark:text-white dark:group-hover:text-amber-400 transition-colors truncate tracking-tight">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
        </Link>
        <div className="mt-0.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="truncate">{vehicle.trim}</span>
          <span className="font-mono text-[10px] text-slate-400 shrink-0 ms-2">
            VIN: {vehicle.vin.slice(-8)}
          </span>
        </div>
      </div>

      {/* 1px Hairline 2x2 Technical Spec Grid */}
      <div className="grid grid-cols-2 gap-px bg-[#E2E0D8] dark:bg-[#1F2430] border-y border-[#E2E0D8] dark:border-[#1F2430] font-mono text-[11px]">
        <div className="bg-[#FAF9F6] dark:bg-[#0D1017] px-3.5 py-2 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 uppercase">ODO</span>
          <span className="font-semibold text-[#111318] dark:text-slate-200 tabular-nums">
            {formatMileage(vehicle.mileage)}
          </span>
        </div>
        <div className="bg-[#FAF9F6] dark:bg-[#0D1017] px-3.5 py-2 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 uppercase">FUEL</span>
          <span className="font-semibold text-[#111318] dark:text-slate-200 truncate ms-1">
            {vehicle.fuelType}
          </span>
        </div>
        <div className="bg-[#FAF9F6] dark:bg-[#0D1017] px-3.5 py-2 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 uppercase">DRIVE</span>
          <span className="font-semibold text-[#111318] dark:text-slate-200">
            {vehicle.driveType} · {vehicle.steering.includes("Left") ? "LHD" : "RHD"}
          </span>
        </div>
        <div className="bg-[#FAF9F6] dark:bg-[#0D1017] px-3.5 py-2 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 uppercase">PORT</span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-400 truncate ms-1">
            CLEARED
          </span>
        </div>
      </div>

      {/* Valuation & Settlement Actions Footer */}
      <div className="mt-auto p-4 pt-3 flex flex-col gap-3 bg-white dark:bg-[#11141B]">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <div className="text-lg font-bold font-mono tabular-nums text-[#111318] dark:text-white leading-tight">
              {formatCurrency(vehicle.sellingPrice, currency, exchangeRate)}
            </div>
            <div className="text-[11px] font-mono tabular-nums text-slate-500">
              {currency === "AFN"
                ? `$${vehicle.sellingPrice.toLocaleString()} USD`
                : `؋ ${(vehicle.sellingPrice * exchangeRate).toLocaleString()} AFN`}
            </div>
          </div>

          {showDealerMargin && marginAmount > 0 && (
            <div className="text-end font-mono">
              <span className="text-xs tabular-nums font-bold text-emerald-700 dark:text-emerald-400 block">
                +${marginAmount.toLocaleString()}
              </span>
              <span className="text-[10px] uppercase text-slate-400 block">
                NET MARGIN
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/vehicles/${vehicle.id}`}
            className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded border border-[#D8D5CD] dark:border-[#242A38] bg-[#FAF9F6] dark:bg-[#161A23] hover:border-[#111318] dark:hover:border-amber-500 text-xs font-semibold text-[#111318] dark:text-white transition-colors"
          >
            <span>{t.viewDetails}</span>
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded bg-[#111318] hover:bg-slate-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-xs font-semibold text-white transition-colors"
          >
            <Send className="h-3 w-3" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
