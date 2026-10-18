"use client";

import React from "react";
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
} from "lucide-react";

interface VehicleCardProps {
  vehicle: VehicleItem;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const { currency, exchangeRate, language } = useShowroomStore();
  const t = translations[language];

  const primaryImage =
    vehicle.images[0] ||
    "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1400&q=85";

  // Status styling
  const statusConfig = {
    "Available on Lot": {
      bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      label: t.availableTag,
    },
    "Reserved/Deposit Paid": {
      bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      label: t.reservedTag,
    },
    "In Transit": {
      bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      label: t.inTransitTag,
    },
    "Under Prep/Maintenance": {
      bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      label: t.underPrepTag,
    },
    Sold: {
      bg: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
      label: t.soldTag,
    },
  }[vehicle.status] || {
    bg: "bg-slate-100 text-slate-700",
    label: vehicle.status,
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

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-xl dark:border-slate-800 dark:bg-navy-900">
      {/* Top Image & Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Image
          src={primaryImage}
          alt={`${vehicle.make} ${vehicle.model}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md ${statusConfig.bg}`}
          >
            {statusConfig.label}
          </span>
          <span className="rounded-full border border-gold/40 bg-navy/80 px-2 py-0.5 text-[11px] font-semibold text-gold-light backdrop-blur-md">
            {vehicle.originCountry} Import
          </span>
        </div>

        {/* Stock Number & Photos Count Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className="rounded-lg bg-black/70 px-2 py-1 text-[10px] font-bold text-gold-light backdrop-blur-md border border-gold/30">
            📸 {vehicle.images.length} {vehicle.images.length >= 40 ? "4K Photos" : "Photos"}
          </span>
          <span className="hidden sm:inline rounded-lg bg-black/60 px-2.5 py-1 text-[11px] font-mono font-medium text-white backdrop-blur-md">
            {vehicle.stockNumber}
          </span>
        </div>

        {/* Customs & Clean Title Trust Badges */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-1 drop-shadow-sm font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>{vehicle.cleanTitle ? t.cleanTitle : "Rebuilt Title"}</span>
          </div>
          <div className="flex items-center gap-1 drop-shadow-sm font-medium">
            <FileCheck className="h-4 w-4 text-gold-light" />
            <span className="truncate max-w-[140px]">
              {vehicle.customsClearance.split("-")[0].trim()}
            </span>
          </div>
        </div>
      </div>

      {/* Body Information */}
      <div className="flex flex-1 flex-col p-5">
        {/* Title & Year */}
        <div className="mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold dark:text-gold-light">
            {vehicle.make}
          </p>
          <Link href={`/vehicles/${vehicle.id}`}>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-gold dark:text-white transition-colors">
              {vehicle.year} {vehicle.model}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {vehicle.trim}
          </p>
        </div>

        {/* Quick Specs Grid */}
        <div className="my-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-2.5 text-xs dark:bg-navy-800/60">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Gauge className="h-3.5 w-3.5 text-gold" />
            <span>{formatMileage(vehicle.mileage)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Fuel className="h-3.5 w-3.5 text-gold" />
            <span>{vehicle.fuelType}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Compass className="h-3.5 w-3.5 text-gold" />
            <span>{vehicle.driveType} ({vehicle.transmission.slice(0, 4)})</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Car className="h-3.5 w-3.5 text-gold" />
            <span className="truncate">{vehicle.steering.includes("Left") ? "LHD (Left)" : "RHD Conv."}</span>
          </div>
        </div>

        {/* Price & Currency Display */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              {t.sellingPrice}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-slate-950 dark:text-white">
                {formatCurrency(vehicle.sellingPrice, currency, exchangeRate)}
              </span>
              {currency === "AFN" && (
                <span className="text-xs font-medium text-slate-400">
                  (${vehicle.sellingPrice.toLocaleString()} USD)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href={`/vehicles/${vehicle.id}`}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-navy-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Eye className="h-3.5 w-3.5 text-slate-500" />
            <span>{t.viewDetails}</span>
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500 transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{t.whatsappInquiry}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
