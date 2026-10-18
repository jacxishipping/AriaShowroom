"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useShowroomStore } from "@/store/useShowroomStore";
import { formatCurrency, formatMileage } from "@/lib/utils";
import { translations } from "@/lib/translations";
import { CustomsDocumentVault } from "@/components/CustomsDocumentVault";
import { CompareBar } from "@/components/CompareBar";
import { MuiCard, MuiButton, MuiChip } from "@/components/mui";
import {
  ShieldCheck,
  FileCheck,
  Gauge,
  Fuel,
  Compass,
  Car,
  ChevronLeft,
  ChevronRight,
  Send,
  Printer,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  Clock,
  Sparkles,
  Maximize2,
  AlertCircle,
  FileText,
  Grid,
  X,
  Camera,
  Banknote,
  Heart,
  Calculator,
  Truck,
  Check,
  Anchor,
} from "lucide-react";

export default function VehicleDetailsPage() {
  const params = useParams();
  const vehicleId = params?.id as string;
  const {
    vehicles,
    currency,
    exchangeRate,
    language,
    favoriteIds,
    toggleFavorite,
    compareIds,
    toggleCompare,
    addToast,
  } = useShowroomStore();
  const t = translations[language];

  const vehicle = vehicles.find((v) => v.id === vehicleId) || vehicles[0];

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isAllPhotosModalOpen, setIsAllPhotosModalOpen] = useState(false);

  // Financing Calculator State
  const [downPaymentPercent, setDownPaymentPercent] = useState(30);
  const [loanTermMonths, setLoanTermMonths] = useState(24);

  const isFavorite = favoriteIds.includes(vehicle?.id || "");
  const isCompared = compareIds.includes(vehicle?.id || "");

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setActivePhotoIndex((prev) =>
          prev === vehicle.images.length - 1 ? 0 : prev + 1
        );
      } else if (e.key === "ArrowLeft") {
        setActivePhotoIndex((prev) =>
          prev === 0 ? vehicle.images.length - 1 : prev - 1
        );
      } else if (e.key === "Escape") {
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, vehicle?.images.length]);

  if (!vehicle) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h2 className="text-xl font-bold">Vehicle Not Found</h2>
        <Link
          href="/inventory"
          className="text-blue-600 underline mt-4 inline-block font-medium"
        >
          Return to Inventory
        </Link>
      </div>
    );
  }

  // Financing Calculations
  const downPaymentUSD = (vehicle.sellingPrice * downPaymentPercent) / 100;
  const financedAmountUSD = vehicle.sellingPrice - downPaymentUSD;
  const monthlyPaymentUSD = financedAmountUSD / loanTermMonths;
  const monthlyPaymentAFN = Math.round(monthlyPaymentUSD * exchangeRate);

  // Pre-filled WhatsApp message
  const whatsappUrl = `https://wa.me/93799102030?text=${encodeURIComponent(
    `Hello Sadozai Motors Herat! I am interested in inspecting the following vehicle:
🚗 ${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.trim})
🏷️ Stock ID: ${vehicle.stockNumber}
🔑 VIN: ${vehicle.vin}
💵 Price: $${vehicle.sellingPrice.toLocaleString()} USD
Please schedule a viewing or share more photos.`
  )}`;

  const handlePrintSpecs = () => {
    window.print();
  };

  const handleToggleFavorite = () => {
    toggleFavorite(vehicle.id);
    addToast(
      isFavorite
        ? `Removed ${vehicle.model} from favorites`
        : `Saved ${vehicle.model} to favorites`,
      "info"
    );
  };

  const handleToggleCompare = () => {
    if (!isCompared && compareIds.length >= 3) {
      addToast("You can compare up to 3 vehicles at a time", "warning");
      return;
    }
    toggleCompare(vehicle.id);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8 pb-24">
      {/* Breadcrumb & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/90 dark:border-slate-800/90 pb-3">
        <Link
          href="/inventory"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Showroom Inventory</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              isFavorite
                ? "border-red-300 bg-red-50 text-red-600 dark:bg-red-950/40 dark:border-red-900"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
            }`}
          >
            <Heart
              className={`h-3.5 w-3.5 ${isFavorite ? "fill-red-500" : ""}`}
            />
            <span>{isFavorite ? "Saved" : "Save"}</span>
          </button>

          {/* Compare Button */}
          <button
            onClick={handleToggleCompare}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              isCompared
                ? "border-blue-300 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:border-blue-900"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{isCompared ? "Compared" : "Compare"}</span>
          </button>

          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
            Stock #{vehicle.stockNumber}
          </span>
          <span className="hidden sm:inline font-mono text-xs text-slate-500 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
            VIN: {vehicle.vin}
          </span>
        </div>
      </div>

      {/* Main Grid: Gallery on Left (7 cols), Overview & CTAs on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Gallery Carousel & Condition */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Photo Viewport */}
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-black shadow-md">
            <Image
              src={vehicle.images[activePhotoIndex] || vehicle.images[0]}
              alt={`${vehicle.make} ${vehicle.model}`}
              fill
              priority
              className="object-cover"
            />

            {/* Badges on Image */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="rounded-lg bg-emerald-600/95 px-2.5 py-1 text-xs font-semibold text-white shadow-xs backdrop-blur-xs">
                {vehicle.status}
              </span>
              <span className="rounded-lg bg-black/80 px-2.5 py-1 text-xs font-semibold text-white shadow-xs backdrop-blur-xs border border-white/20">
                {vehicle.originCountry} Direct Import
              </span>
            </div>

            {/* Photo Counter Pill & Lightbox trigger */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="rounded-lg bg-black/70 px-2.5 py-1 text-xs font-mono font-medium text-white backdrop-blur-xs">
                {activePhotoIndex + 1} / {vehicle.images.length} Photos
              </span>
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="rounded-lg bg-black/70 p-1.5 text-white backdrop-blur-xs hover:bg-black/90 transition-colors"
                title="Full screen view"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>

            {/* Carousel navigation buttons */}
            {vehicle.images.length > 1 && (
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                <button
                  onClick={() =>
                    setActivePhotoIndex((prev) =>
                      prev === 0 ? vehicle.images.length - 1 : prev - 1
                    )
                  }
                  className="pointer-events-auto rounded-full bg-black/60 p-2.5 text-white hover:bg-black/90 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() =>
                    setActivePhotoIndex((prev) =>
                      prev === vehicle.images.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="pointer-events-auto rounded-full bg-black/60 p-2.5 text-white hover:bg-black/90 transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Bottom Floating Bar: View All 40+ Photos Button */}
            <div className="absolute bottom-4 right-4">
              <button
                onClick={() => setIsAllPhotosModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-white/95 dark:bg-[#111827]/95 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white backdrop-blur-sm hover:scale-105 transition-all shadow-md cursor-pointer"
              >
                <Grid className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>View All {vehicle.images.length} Photos</span>
              </button>
            </div>
          </div>

          {/* Thumbnail Track */}
          {vehicle.images.length > 1 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                  <Camera className="h-3.5 w-3.5 text-blue-600" />
                  <span>Album Gallery ({vehicle.images.length} Photos)</span>
                </span>
                <button
                  onClick={() => setIsAllPhotosModalOpen(true)}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                >
                  Browse Full Grid →
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {vehicle.images.slice(0, 15).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`relative aspect-[16/10] w-20 shrink-0 overflow-hidden rounded-xl border transition-all cursor-pointer ${
                      activePhotoIndex === idx
                        ? "border-blue-600 ring-2 ring-blue-500/30"
                        : "border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt="Thumbnail" fill className="object-cover" />
                    <span className="absolute bottom-0.5 right-1 text-[9px] font-mono text-white bg-black/60 px-1 rounded">
                      #{idx + 1}
                    </span>
                  </button>
                ))}

                {vehicle.images.length > 15 && (
                  <button
                    onClick={() => setIsAllPhotosModalOpen(true)}
                    className="relative aspect-[16/10] w-20 shrink-0 overflow-hidden rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-600 dark:text-slate-300 font-medium text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <span>+{vehicle.images.length - 15}</span>
                    <span className="text-[9px]">More</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Import Logistics & Port Clearance Timeline */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Import Journey & Port Clearance Pipeline</span>
            </h3>

            <div className="relative pl-6 space-y-4 border-l-2 border-emerald-500/30 text-xs">
              <div className="relative">
                <span className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[9px]">
                  ✓
                </span>
                <span className="font-bold text-slate-900 dark:text-white block">
                  1. Origin Acquisition ({vehicle.originCountry})
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Vehicle purchased and containerized from origin hub with clean export title.
                </span>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[9px]">
                  ✓
                </span>
                <span className="font-bold text-slate-900 dark:text-white block">
                  2. Ocean & Transit Freight
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Transited via Bandar Abbas corridor directly into Western Afghanistan dry port.
                </span>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[9px]">
                  ✓
                </span>
                <span className="font-bold text-slate-900 dark:text-white block">
                  3. Islam Qala Dry Port Clearance (گمرک اسلام قلعه)
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Customs tariff paid, Maktoub verified, and technical chassis check approved.
                </span>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px]">
                  ●
                </span>
                <span className="font-bold text-slate-900 dark:text-white block">
                  4. Sadozai Showroom Lot (Bagh-e-Azadi Avenue, Herat)
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  PDI detailing complete, ready for direct buyer transfer and negative plate registration.
                </span>
              </div>
            </div>
          </div>

          {/* Condition Breakdown */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Sadozai Certified Condition & Inspection Report</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3.5 border border-slate-200/80 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  Exterior & Paint:
                </span>
                <span className="text-slate-600 dark:text-slate-300">
                  {vehicle.conditionNotes.exterior}
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3.5 border border-slate-200/80 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  Interior & Upholstery:
                </span>
                <span className="text-slate-600 dark:text-slate-300">
                  {vehicle.conditionNotes.interior}
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3.5 border border-slate-200/80 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  Engine & Powertrain:
                </span>
                <span className="text-slate-600 dark:text-slate-300">
                  {vehicle.conditionNotes.engine}
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3.5 border border-slate-200/80 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  Tires & Suspension:
                </span>
                <span className="text-slate-600 dark:text-slate-300">
                  {vehicle.conditionNotes.tires}
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3.5 border border-slate-200/80 dark:border-slate-800 sm:col-span-2">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  Accident & Airbag History:
                </span>
                <span className="text-slate-600 dark:text-slate-300">
                  {vehicle.conditionNotes.accidentHistory}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Financing Calculator & CTAs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Info Card */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 sm:p-7 shadow-xs">
            <span className="text-[11px] font-mono font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {vehicle.make} • {vehicle.originCountry} Direct Import
            </span>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {vehicle.year} {vehicle.model}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {vehicle.trim}
            </p>

            {/* ERP Pricing & Margin Box */}
            <div className="mt-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Lot Selling Price
                </span>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold font-mono text-slate-950 dark:text-white">
                    {formatCurrency(vehicle.sellingPrice, currency, exchangeRate)}
                  </span>
                  {currency === "AFN" && (
                    <span className="text-xs font-mono font-medium text-slate-500">
                      (${vehicle.sellingPrice.toLocaleString()} USD)
                    </span>
                  )}
                </div>
                {currency === "USD" && (
                  <div className="text-xs font-mono font-semibold text-gold dark:text-gold-light mt-0.5">
                    ؋ {(vehicle.sellingPrice * exchangeRate).toLocaleString()} AFN
                  </div>
                )}
              </div>

              {/* Landed Cost vs Margin Breakdown */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs font-mono">
                <div className="rounded-xl bg-white dark:bg-[#151D2A] p-2.5 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-sans font-semibold">
                    Total Landed Cost
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    ${vehicle.landedCost.toLocaleString()} USD
                  </span>
                </div>
                <div className="rounded-xl bg-white dark:bg-[#151D2A] p-2.5 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-sans font-semibold">
                    Target Margin
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    +${(vehicle.sellingPrice - vehicle.landedCost).toLocaleString()} (
                    {vehicle.landedCost > 0
                      ? (
                          ((vehicle.sellingPrice - vehicle.landedCost) /
                            vehicle.landedCost) *
                          100
                        ).toFixed(1)
                      : 0}
                    %)
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Customs duty settled at Herat Islam Qala Dry Port</span>
              </p>
            </div>

            {/* Core Specs Pills */}
            <div className="mt-5 grid grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 p-2.5 border border-slate-200/80 dark:border-slate-800">
                <Gauge className="h-4 w-4 text-blue-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Mileage
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                    {formatMileage(vehicle.mileage)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 p-2.5 border border-slate-200/80 dark:border-slate-800">
                <Fuel className="h-4 w-4 text-blue-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Fuel Type
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {vehicle.fuelType}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 p-2.5 border border-slate-200/80 dark:border-slate-800">
                <Compass className="h-4 w-4 text-blue-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Drivetrain
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {vehicle.driveType} • {vehicle.transmission}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 p-2.5 border border-slate-200/80 dark:border-slate-800">
                <Car className="h-4 w-4 text-blue-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Steering
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {vehicle.steering.split(" ")[0]}
                  </span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-6 space-y-2.5">
              <MuiButton
                component="a"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                color="success"
                fullWidth
                size="large"
                startIcon={<Send className="h-4 w-4" />}
              >
                Inquire directly on WhatsApp (واتساپ)
              </MuiButton>

              <MuiButton
                component={Link}
                href={`/vehicles/${vehicle.id}/deed`}
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                startIcon={<FileText className="h-4 w-4" />}
              >
                {t.generateDeed} (قباله رسمی با QR کد)
              </MuiButton>

              <MuiButton
                component={Link}
                href={`/vehicles/${vehicle.id}/settlement`}
                variant="outlined"
                color="inherit"
                fullWidth
                size="large"
                startIcon={<Banknote className="h-4 w-4 text-warning" />}
              >
                Sarrafi & Milestone Installment Ledger (تسویه حساب صرافی)
              </MuiButton>

              <MuiButton
                onClick={handlePrintSpecs}
                variant="text"
                color="inherit"
                fullWidth
                size="medium"
                startIcon={<Printer className="h-4 w-4" />}
              >
                {t.printSpecSheet}
              </MuiButton>
            </div>
          </div>

          {/* Interactive Installment & Financing Calculator */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" />
                <span>Showroom Financing & Installment Estimator</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-600 font-bold">
                0% Dealer Fee
              </span>
            </div>

            {/* Down Payment Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Down Payment ({downPaymentPercent}%):</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  ${Math.round(downPaymentUSD).toLocaleString()} USD
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="70"
                step="5"
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(parseInt(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Loan Term Selection */}
            <div className="space-y-1.5">
              <span className="text-xs text-slate-500 block">Payment Term:</span>
              <div className="grid grid-cols-3 gap-2">
                {[12, 24, 36].map((months) => (
                  <MuiButton
                    key={months}
                    onClick={() => setLoanTermMonths(months)}
                    variant={loanTermMonths === months ? "contained" : "outlined"}
                    color={loanTermMonths === months ? "primary" : "inherit"}
                    size="small"
                  >
                    {months} Months
                  </MuiButton>
                ))}
              </div>
            </div>

            {/* Estimated Monthly Payment Result */}
            <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3.5 border border-slate-200/80 dark:border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Estimated Monthly Installment
              </span>
              <div className="mt-1 text-2xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
                ${Math.round(monthlyPaymentUSD).toLocaleString()}{" "}
                <span className="text-xs font-sans text-slate-400 font-normal">/ mo</span>
              </div>
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                ؋ {monthlyPaymentAFN.toLocaleString()} AFN per month
              </div>
            </div>
          </div>

          {/* Description & Features Box */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
              Description & Highlights
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {vehicle.description}
            </p>
            {language === "ps" && vehicle.descriptionPashto ? (
              <p
                dir="rtl"
                className="mt-3 text-xs font-dari text-slate-600 dark:text-slate-300 leading-relaxed border-t pt-3 dark:border-slate-800"
              >
                <span className="font-bold text-slate-900 dark:text-white block mb-1">
                  د موټر پښتو تشریح:
                </span>
                {vehicle.descriptionPashto}
              </p>
            ) : vehicle.descriptionDari ? (
              <p
                dir="rtl"
                className="mt-3 text-xs font-dari text-slate-600 dark:text-slate-300 leading-relaxed border-t pt-3 dark:border-slate-800"
              >
                <span className="font-bold text-slate-900 dark:text-white block mb-1">
                  معلومات موتر به دری:
                </span>
                {vehicle.descriptionDari}
              </p>
            ) : null}

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider block mb-2">
                Factory Options & Packages:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                {vehicle.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Official Customs Maktoub & Title Document Vault */}
      <CustomsDocumentVault vehicle={vehicle} />

      {/* Sticky Quick-Action Bar on Bottom of Viewport */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-[#111827]/95 border-t border-slate-200 dark:border-slate-800 px-4 py-3 backdrop-blur-md shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-14 shrink-0 rounded-lg overflow-hidden hidden sm:block border border-slate-200 dark:border-slate-700">
              <Image src={vehicle.images[0]} alt={vehicle.model} fill className="object-cover" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </span>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  ${vehicle.sellingPrice.toLocaleString()} USD
                </span>
                <span className="text-slate-400 hidden sm:inline">
                  (؋ {(vehicle.sellingPrice * exchangeRate).toLocaleString()} AFN)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/vehicles/${vehicle.id}/deed`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Official Deed</span>
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      <CompareBar />

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/95 p-4 backdrop-blur-md">
          {/* Top Bar */}
          <div className="flex w-full items-center justify-between text-white border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm text-white">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </span>
              <span className="rounded-full bg-slate-800 px-3 py-0.5 text-xs font-mono text-slate-300">
                Photo {activePhotoIndex + 1} of {vehicle.images.length}
              </span>
            </div>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="rounded-full bg-slate-800 p-2 text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Center Image */}
          <div className="relative flex-1 w-full flex items-center justify-center my-4">
            <div className="relative aspect-[16/10] max-h-[75vh] w-full max-w-5xl">
              <Image
                src={vehicle.images[activePhotoIndex]}
                alt={`Photo ${activePhotoIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>

            {vehicle.images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActivePhotoIndex((prev) =>
                      prev === 0 ? vehicle.images.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-3 text-white hover:bg-black transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() =>
                    setActivePhotoIndex((prev) =>
                      prev === vehicle.images.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-3 text-white hover:bg-black transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          <div className="w-full max-w-4xl overflow-x-auto py-2 flex gap-2 justify-center">
            {vehicle.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhotoIndex(idx)}
                className={`relative aspect-[16/10] w-14 shrink-0 overflow-hidden rounded-lg border transition-all cursor-pointer ${
                  activePhotoIndex === idx
                    ? "border-blue-500 ring-2 ring-blue-500/40"
                    : "border-transparent opacity-40 hover:opacity-100"
                }`}
              >
                <Image src={img} alt="Thumb" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* View All 40+ Photos Grid Modal */}
      {isAllPhotosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#111827] sm:p-8 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Full Photo Gallery ({vehicle.images.length} High-Resolution Angles)
                </h3>
                <p className="text-xs text-slate-500">
                  {vehicle.year} {vehicle.make} {vehicle.model} • Stock #{vehicle.stockNumber}
                </p>
              </div>
              <button
                onClick={() => setIsAllPhotosModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {vehicle.images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setActivePhotoIndex(idx);
                    setIsAllPhotosModalOpen(false);
                    setIsLightboxOpen(true);
                  }}
                  className={`group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl border transition-all hover:scale-105 hover:border-blue-500 ${
                    activePhotoIndex === idx
                      ? "border-blue-600 ring-2 ring-blue-500/40"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <Image
                    src={imgUrl}
                    alt={`Angle ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                  <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-mono text-white">
                    #{idx + 1}
                  </span>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Maximize2 className="h-5 w-5 text-white drop-shadow-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
