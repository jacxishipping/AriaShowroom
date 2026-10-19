"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { VehicleItem } from "@/lib/mock-data";
import { useShowroomStore } from "@/store/useShowroomStore";
import { formatCurrency, formatMileage } from "@/lib/utils";
import { translations } from "@/lib/translations";
import {
  Send,
  ChevronLeft,
  ChevronRight,
  Heart,
  Layers,
  PanelRightOpen,
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
    clientPresentationMode,
    favoriteIds,
    toggleFavorite,
    compareIds,
    toggleCompare,
    setInspectedVehicleId,
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
        ? `Removed ${vehicle.model} from saved`
        : `Saved ${vehicle.model} to bookmarks`,
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
      className="group relative flex flex-col rounded-lg border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] overflow-hidden transition-colors hover:border-[#1A73E8] dark:hover:border-[#8AB4F8]"
    >
      {/* Top Unboxed Metadata Strip (Zero-Pill Compliance) */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-100 dark:border-[#262F40] bg-slate-50/70 dark:bg-[#121722] text-[11px]">
        <div className="flex items-center gap-1.5 font-mono text-slate-500 dark:text-slate-400 truncate">
          <span className="font-bold text-[#1A73E8] dark:text-[#8AB4F8]">
            {vehicle.stockNumber}
          </span>
          <span>·</span>
          <span>{vehicle.originCountry}</span>
          <span>·</span>
          <span
            className={
              vehicle.status === "Available on Lot"
                ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                : vehicle.status === "In Transit"
                ? "text-amber-600 dark:text-amber-400 font-semibold"
                : "text-slate-600 dark:text-slate-300 font-semibold"
            }
          >
            {vehicle.status === "Available on Lot"
              ? "On Lot"
              : vehicle.status === "Reserved/Deposit Paid"
              ? "Reserved"
              : vehicle.status}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleToggleCompare}
            className={`h-6 w-6 rounded flex items-center justify-center border transition-colors ${
              isCompared
                ? "bg-[#1A73E8] text-white border-[#1A73E8]"
                : "border-slate-200 dark:border-[#262F40] text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
            title={isCompared ? "Remove from comparison" : "Add to comparison"}
          >
            <Layers className="h-3 w-3" />
          </button>

          <button
            onClick={handleToggleFavorite}
            className={`h-6 w-6 rounded flex items-center justify-center border transition-colors ${
              isFavorite
                ? "bg-rose-600 text-white border-rose-600"
                : "border-slate-200 dark:border-[#262F40] text-slate-500 hover:text-rose-600"
            }`}
            title={isFavorite ? "Remove from saved" : "Save vehicle"}
          >
            <Heart className={`h-3 w-3 ${isFavorite ? "fill-white" : ""}`} />
          </button>
        </div>
      </div>

      {/* 16:10 Vehicle Photography Viewport */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
        <Link href={`/vehicles/${vehicle.id}`} className="block w-full h-full">
          <Image
            src={currentImage}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            fill
            referrerPolicy="no-referrer"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-103"
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

        {/* Discreet Monospace Frame Counter */}
        <div className="absolute bottom-2.5 end-2.5 px-1.5 py-0.5 rounded bg-black/75 font-mono tabular-nums text-[10px] text-white/90 pointer-events-none">
          {activePhotoIndex + 1}/{vehicle.images.length}
        </div>
      </div>

      {/* Title & Clean Unboxed Spec Line */}
      <div className="p-4 pb-3 space-y-1">
        <Link href={`/vehicles/${vehicle.id}`} className="block">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-[#1A73E8] dark:text-white dark:group-hover:text-[#8AB4F8] transition-colors truncate tracking-tight">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
        </Link>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="truncate">{vehicle.trim}</span>
          <span className="font-mono text-[10px] text-slate-400 shrink-0 ms-2">
            VIN: {vehicle.vin.slice(-8)}
          </span>
        </div>
        <div className="pt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums truncate">
          <span>{formatMileage(vehicle.mileage)}</span>
          <span>·</span>
          <span>{vehicle.fuelType}</span>
          <span>·</span>
          <span>{vehicle.driveType}</span>
          <span>·</span>
          <span className="text-emerald-600 dark:text-emerald-400">Cleared</span>
        </div>
      </div>

      {/* Valuation & Google Workspace Actions Footer */}
      <div className="mt-auto p-4 pt-3 border-t border-slate-100 dark:border-[#262F40] flex flex-col gap-3 bg-white dark:bg-[#161B26]">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white leading-tight">
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
              <span className="text-xs tabular-nums font-bold text-emerald-600 dark:text-emerald-400 block">
                +${marginAmount.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block">Net margin</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => {
              if (onQuickView) onQuickView(vehicle);
              else setInspectedVehicleId(vehicle.id);
            }}
            className="inline-flex items-center justify-center gap-1 h-8 px-2.5 rounded-md border border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#121722] hover:border-[#1A73E8] text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap cursor-pointer"
            title="Open in right-hand Inspector Drawer"
          >
            <PanelRightOpen className="h-3 w-3 text-[#1A73E8] dark:text-[#8AB4F8]" />
            <span>Inspect</span>
          </button>

          <Link
            href={`/vehicles/${vehicle.id}`}
            className="inline-flex items-center justify-center h-8 px-2.5 rounded-md border border-slate-200 dark:border-[#262F40] hover:border-[#1A73E8] text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap"
          >
            <span>Dossier</span>
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1 h-8 px-2.5 rounded-md bg-[#1A73E8] hover:bg-[#1557B0] text-xs font-semibold text-white transition-colors whitespace-nowrap"
          >
            <Send className="h-3 w-3" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
