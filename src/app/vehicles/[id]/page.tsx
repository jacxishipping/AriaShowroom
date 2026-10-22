"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useShowroomStore } from "@/store/useShowroomStore";
import { formatCurrency, formatMileage } from "@/lib/utils";
import { translations } from "@/lib/translations";
import { CustomsDocumentVault } from "@/components/CustomsDocumentVault";
import { PaintInspectionDiagram } from "@/components/PaintInspectionDiagram";
import { CompareBar } from "@/components/CompareBar";
import {
  MuiCard,
  MuiButton,
  MuiChip,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
} from "@/components/mui";
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
  RotateCcw,
  Play,
  Pause,
  Share2,
  Download,
  QrCode,
  Copy,
} from "lucide-react";

export default function VehicleDetailsPage() {
  const params = useParams();
  const vehicleId = params?.id as string;
  const {
    vehicles,
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
  const hideFinancialMargins = clientPresentationMode || currentRole === "SalesAgent";

  const vehicle = vehicles.find((v) => v.id === vehicleId);

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isAllPhotosModalOpen, setIsAllPhotosModalOpen] = useState(false);

  // 360 Virtual Walkaround Spin state
  const [isSpinMode, setIsSpinMode] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isDraggingSpin, setIsDraggingSpin] = useState(false);
  const [spinStartX, setSpinStartX] = useState(0);

  // Branded Showroom Flyer Modal state
  const [isFlyerOpen, setIsFlyerOpen] = useState(false);
  const [copiedFlyerLink, setCopiedFlyerLink] = useState(false);

  // Financing Calculator State
  const [downPaymentPercent, setDownPaymentPercent] = useState(30);
  const [loanTermMonths, setLoanTermMonths] = useState(24);

  const isFavorite = favoriteIds.includes(vehicle?.id || "");
  const isCompared = compareIds.includes(vehicle?.id || "");

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!vehicle || !vehicle.images || vehicle.images.length === 0) return;
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

  // 360 Auto-rotation effect
  useEffect(() => {
    if (!isAutoRotating || !isSpinMode) return;
    const interval = setInterval(() => {
      setActivePhotoIndex((prev) => (prev + 1) % vehicle.images.length);
    }, 350);
    return () => clearInterval(interval);
  }, [isAutoRotating, isSpinMode, vehicle.images.length]);

  const handleMouseDownSpin = (e: React.MouseEvent) => {
    if (!isSpinMode) return;
    setIsDraggingSpin(true);
    setSpinStartX(e.clientX);
  };

  const handleMouseMoveSpin = (e: React.MouseEvent) => {
    if (!isDraggingSpin || !isSpinMode) return;
    const deltaX = e.clientX - spinStartX;
    if (Math.abs(deltaX) > 12) {
      const direction = deltaX > 0 ? -1 : 1;
      setActivePhotoIndex((prev) => {
        const next = prev + direction;
        if (next < 0) return vehicle.images.length - 1;
        if (next >= vehicle.images.length) return 0;
        return next;
      });
      setSpinStartX(e.clientX);
    }
  };

  const handleMouseUpSpin = () => {
    setIsDraggingSpin(false);
  };

  const handleTouchStartSpin = (e: React.TouchEvent) => {
    if (!isSpinMode) return;
    setIsDraggingSpin(true);
    setSpinStartX(e.touches[0].clientX);
  };

  const handleTouchMoveSpin = (e: React.TouchEvent) => {
    if (!isDraggingSpin || !isSpinMode) return;
    const deltaX = e.touches[0].clientX - spinStartX;
    if (Math.abs(deltaX) > 12) {
      const direction = deltaX > 0 ? -1 : 1;
      setActivePhotoIndex((prev) => {
        const next = prev + direction;
        if (next < 0) return vehicle.images.length - 1;
        if (next >= vehicle.images.length) return 0;
        return next;
      });
      setSpinStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEndSpin = () => {
    setIsDraggingSpin(false);
  };

  const handleCopyFlyerLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedFlyerLink(true);
      addToast("Showroom Dossier link copied to clipboard", "success");
      setTimeout(() => setCopiedFlyerLink(false), 2500);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20">
      {/* Architectural Top Dossier Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8D5CD] dark:border-[#242A38] pb-3">
        <Link
          href="/inventory"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-600 hover:text-[#111318] dark:text-slate-400 dark:hover:text-amber-400 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>BACK TO FLEET REGISTRY</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={handleToggleFavorite}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-semibold transition-colors cursor-pointer ${
              isFavorite
                ? "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                : "border-[#D8D5CD] dark:border-[#242A38] bg-white dark:bg-[#11141B] text-slate-600 dark:text-slate-300 hover:border-[#111318]"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${isFavorite ? "fill-rose-500" : ""}`} />
            <span>{isFavorite ? "SAVED" : "SAVE"}</span>
          </button>

          <button
            onClick={handleToggleCompare}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-semibold transition-colors cursor-pointer ${
              isCompared
                ? "border-[#111318] bg-[#111318] text-white dark:bg-amber-500 dark:text-black dark:border-amber-500"
                : "border-[#D8D5CD] dark:border-[#242A38] bg-white dark:bg-[#11141B] text-slate-600 dark:text-slate-300 hover:border-[#111318]"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{isCompared ? "COMPARING" : "COMPARE"}</span>
          </button>

          <span className="font-bold px-2.5 py-1 rounded bg-[#111318] text-white dark:bg-amber-500 dark:text-black">
            LOT #{vehicle.stockNumber}
          </span>
          <span className="hidden sm:inline text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded border border-[#D8D5CD] dark:border-[#242A38] bg-[#FAF9F6] dark:bg-[#0D1017]">
            VIN: {vehicle.vin}
          </span>
        </div>
      </div>

      {/* Main Grid: Gallery on Left (7 cols), Overview & CTAs on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Gallery Carousel & Condition */}
        <div className="lg:col-span-7 space-y-5">
          {/* Gallery View Switcher Tabs: Standard vs 360° Walkaround */}
          <div className="inline-flex items-center divide-x divide-[#D8D5CD] dark:divide-[#242A38] rtl:divide-x-reverse rounded border border-[#D8D5CD] dark:border-[#242A38] bg-[#FAF9F6] dark:bg-[#0D1017] overflow-hidden">
            <button
              onClick={() => {
                setIsSpinMode(false);
                setIsAutoRotating(false);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                !isSpinMode
                  ? "bg-[#111318] text-white dark:bg-amber-600 dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-[#111318] dark:hover:text-white"
              }`}
            >
              <Camera className="h-3.5 w-3.5" />
              <span>STILLS ({vehicle.images.length})</span>
            </button>

            <button
              onClick={() => setIsSpinMode(true)}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                isSpinMode
                  ? "bg-[#111318] text-white dark:bg-amber-600 dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-[#111318] dark:hover:text-white"
              }`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>360° WALKAROUND SPIN</span>
            </button>
          </div>

          {/* Main Photo Viewport */}
          <div
            onMouseDown={handleMouseDownSpin}
            onMouseMove={handleMouseMoveSpin}
            onMouseUp={handleMouseUpSpin}
            onMouseLeave={handleMouseUpSpin}
            onTouchStart={handleTouchStartSpin}
            onTouchMove={handleTouchMoveSpin}
            onTouchEnd={handleTouchEndSpin}
            className={`relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-black shadow-md select-none ${
              isSpinMode
                ? isDraggingSpin
                  ? "cursor-grabbing"
                  : "cursor-grab"
                : ""
            }`}
          >
            <Image
              src={vehicle.images[activePhotoIndex] || vehicle.images[0]}
              alt={`${vehicle.make} ${vehicle.model}`}
              fill
              priority
              className="object-cover pointer-events-none"
            />

            {/* Badges on Image */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="rounded-lg bg-emerald-600/95 px-2.5 py-1 text-xs font-semibold text-white shadow-xs backdrop-blur-xs">
                {vehicle.status}
              </span>
              <span className="rounded-lg bg-black/80 px-2.5 py-1 text-xs font-semibold text-white shadow-xs backdrop-blur-xs border border-white/20">
                {vehicle.originCountry} Direct Import
              </span>
              {isSpinMode && (
                <span className="rounded-lg bg-indigo-600/90 px-2.5 py-1 text-xs font-bold text-white shadow-xs backdrop-blur-xs flex items-center gap-1.5 animate-pulse">
                  <RotateCcw className="h-3 w-3" />
                  <span>360° Interactive</span>
                </span>
              )}
            </div>

            {/* Photo Counter Pill & Lightbox trigger */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="rounded-lg bg-black/70 px-2.5 py-1 text-xs font-mono font-medium text-white backdrop-blur-xs">
                {activePhotoIndex + 1} / {vehicle.images.length} Photos
              </span>
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="rounded-lg bg-black/70 p-1.5 text-white backdrop-blur-xs hover:bg-black/90 transition-colors cursor-pointer"
                title="Full screen view"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>

            {/* In Standard Mode: Carousel Arrows */}
            {!isSpinMode && vehicle.images.length > 1 && (
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

            {/* In 360 Spin Mode: Drag hint and angle overlay */}
            {isSpinMode && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] font-bold">
                      {Math.round(
                        (activePhotoIndex / vehicle.images.length) * 360
                      )}
                      ° View Angle
                    </span>
                    <span className="text-[11px] text-slate-300 hidden sm:inline">
                      (Drag horizontally or use scrubber)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsAutoRotating(!isAutoRotating);
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isAutoRotating
                          ? "bg-amber-500 text-white"
                          : "bg-white/20 hover:bg-white/30 text-white"
                      }`}
                    >
                      {isAutoRotating ? (
                        <>
                          <Pause className="h-3.5 w-3.5" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5" />
                          <span>Auto-Spin</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePhotoIndex(0);
                        setIsAutoRotating(false);
                      }}
                      className="px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold cursor-pointer"
                      title="Reset angle to front"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* 360 Angle Scrubber Slider */}
                <div className="px-1">
                  <Slider
                    min={0}
                    max={vehicle.images.length - 1}
                    value={activePhotoIndex}
                    onChange={(_, val) => setActivePhotoIndex(val as number)}
                    size="small"
                    sx={{
                      color: "#60a5fa",
                      height: 4,
                      "& .MuiSlider-thumb": {
                        width: 14,
                        height: 14,
                        backgroundColor: "#ffffff",
                        boxShadow: "0 0 8px rgba(0,0,0,0.5)",
                      },
                      "& .MuiSlider-rail": {
                        opacity: 0.3,
                        backgroundColor: "#ffffff",
                      },
                    }}
                  />
                </div>
              </div>
            )}

            {/* Bottom Floating Bar: View All 40+ Photos Button (when not in spin mode) */}
            {!isSpinMode && (
              <div className="absolute bottom-4 right-4">
                <button
                  onClick={() => setIsAllPhotosModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-white/95 dark:bg-[#111827]/95 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white backdrop-blur-sm hover:scale-105 transition-all shadow-md cursor-pointer"
                >
                  <Grid className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>View All {vehicle.images.length} Photos</span>
                </button>
              </div>
            )}
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
          <div className="rounded-md border border-[#D8D5CD] dark:border-[#242A38] bg-white dark:bg-[#11141B] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[#E2E0D8] dark:border-[#1F2430] bg-[#FAF9F6] dark:bg-[#0D1017] flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-[#111318] dark:text-white flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-amber-600" />
                <span>IMPORT PROVENANCE & ISLAM QALA CLEARANCE</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                TIR CARNET VERIFIED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#E2E0D8] dark:bg-[#1F2430] text-xs">
              <div className="bg-white dark:bg-[#11141B] p-3.5">
                <span className="text-[10px] font-mono text-slate-400 block">01 / ORIGIN PORT</span>
                <span className="font-bold text-[#111318] dark:text-white block mt-0.5">
                  {vehicle.originCountry} Export Terminal
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Clean export certificate & bill of lading verified.
                </span>
              </div>
              <div className="bg-white dark:bg-[#11141B] p-3.5">
                <span className="text-[10px] font-mono text-slate-400 block">02 / CORRIDOR</span>
                <span className="font-bold text-[#111318] dark:text-white block mt-0.5">
                  Bandar Abbas / Dogharoun
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Bonded transit convoy into Western Afghanistan.
                </span>
              </div>
              <div className="bg-white dark:bg-[#11141B] p-3.5">
                <span className="text-[10px] font-mono text-slate-400 block">03 / GOMROK</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 block mt-0.5">
                  Islam Qala Dry Port
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Tariff paid, Maktoub & chassis audit completed.
                </span>
              </div>
              <div className="bg-white dark:bg-[#11141B] p-3.5">
                <span className="text-[10px] font-mono text-slate-400 block">04 / SHOWROOM LOT</span>
                <span className="font-bold text-[#111318] dark:text-amber-400 block mt-0.5">
                  Bagh-e-Azadi, Herat
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  PDI detailed & ready for deed execution.
                </span>
              </div>
            </div>
          </div>

          {/* Condition Breakdown */}
          <div className="rounded-md border border-[#D8D5CD] dark:border-[#242A38] bg-white dark:bg-[#11141B] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[#E2E0D8] dark:border-[#1F2430] bg-[#FAF9F6] dark:bg-[#0D1017] flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-[#111318] dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>PDI MECHANICAL & COSMETIC AUDIT</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                CERTIFIED BY SADOZAI TECHNICAL BAY
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#E2E0D8] dark:bg-[#1F2430] text-xs">
              <div className="bg-white dark:bg-[#11141B] p-3.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                  EXTERIOR & CLEARCOAT
                </span>
                <span className="font-medium text-[#111318] dark:text-slate-200">
                  {vehicle.conditionNotes.exterior}
                </span>
              </div>

              <div className="bg-white dark:bg-[#11141B] p-3.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                  CABIN & UPHOLSTERY
                </span>
                <span className="font-medium text-[#111318] dark:text-slate-200">
                  {vehicle.conditionNotes.interior}
                </span>
              </div>

              <div className="bg-white dark:bg-[#11141B] p-3.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                  ENGINE & POWERTRAIN
                </span>
                <span className="font-medium text-[#111318] dark:text-slate-200">
                  {vehicle.conditionNotes.engine}
                </span>
              </div>

              <div className="bg-white dark:bg-[#11141B] p-3.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                  TIRES & SUSPENSION
                </span>
                <span className="font-medium text-[#111318] dark:text-slate-200">
                  {vehicle.conditionNotes.tires}
                </span>
              </div>

              <div className="bg-white dark:bg-[#11141B] p-3.5 sm:col-span-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                  STRUCTURAL CHASSIS & SRS AIRBAG HISTORY
                </span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {vehicle.conditionNotes.accidentHistory}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Financing Calculator & CTAs */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Spec & Valuation Dossier */}
          <div className="rounded-md border border-[#D8D5CD] dark:border-[#242A38] bg-white dark:bg-[#11141B] overflow-hidden">
            <div className="p-5 border-b border-[#E2E0D8] dark:border-[#1F2430]">
              <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 uppercase tracking-[0.16em]">
                {vehicle.make} · {vehicle.originCountry} SPEC · {vehicle.bodyType}
              </span>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-[#111318] dark:text-white">
                {vehicle.year} {vehicle.model}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                {vehicle.trim}
              </p>

              {/* Valuation Strip */}
              <div className="mt-4 pt-4 border-t border-[#E2E0D8] dark:border-[#1F2430] flex items-baseline justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    ASKING VALUATION
                  </span>
                  <span className="text-3xl font-bold font-mono tabular-nums text-[#111318] dark:text-white">
                    {formatCurrency(vehicle.sellingPrice, currency, exchangeRate)}
                  </span>
                </div>
                <div className="text-end font-mono">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                    {currency === "USD" ? "AFGHANI EQUIVALENT" : "USD EQUIVALENT"}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-amber-700 dark:text-amber-400">
                    {currency === "USD"
                      ? `؋ ${(vehicle.sellingPrice * exchangeRate).toLocaleString()} AFN`
                      : `$${vehicle.sellingPrice.toLocaleString()} USD`}
                  </span>
                </div>
              </div>

              {/* Landed Cost vs Margin Breakdown (Hidden in Client Presentation Mode) */}
              {!hideFinancialMargins && (
                <div className="mt-3 grid grid-cols-2 gap-px bg-[#E2E0D8] dark:bg-[#1F2430] border border-[#E2E0D8] dark:border-[#1F2430] rounded overflow-hidden font-mono text-xs">
                  <div className="bg-[#FAF9F6] dark:bg-[#0D1017] p-2.5">
                    <span className="text-[9px] text-slate-400 block uppercase">
                      LANDED COST BASIS
                    </span>
                    <span className="font-bold tabular-nums text-[#111318] dark:text-slate-200">
                      ${vehicle.landedCost.toLocaleString()} USD
                    </span>
                  </div>
                  <div className="bg-[#FAF9F6] dark:bg-[#0D1017] p-2.5">
                    <span className="text-[9px] text-slate-400 block uppercase">
                      TARGET NET MARGIN
                    </span>
                    <span className="font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
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
              )}
            </div>

            {/* 1px Hairline 2x2 Technical Specs Grid */}
            <div className="grid grid-cols-2 gap-px bg-[#E2E0D8] dark:bg-[#1F2430] border-b border-[#E2E0D8] dark:border-[#1F2430] font-mono text-xs">
              <div className="bg-[#FAF9F6] dark:bg-[#0D1017] p-3">
                <span className="text-[10px] text-slate-400 block uppercase">ODOMETER</span>
                <span className="font-bold text-[#111318] dark:text-slate-200 tabular-nums">
                  {formatMileage(vehicle.mileage)}
                </span>
              </div>
              <div className="bg-[#FAF9F6] dark:bg-[#0D1017] p-3">
                <span className="text-[10px] text-slate-400 block uppercase">POWERTRAIN</span>
                <span className="font-bold text-[#111318] dark:text-slate-200">
                  {vehicle.fuelType} · {vehicle.transmission}
                </span>
              </div>
              <div className="bg-[#FAF9F6] dark:bg-[#0D1017] p-3">
                <span className="text-[10px] text-slate-400 block uppercase">DRIVETRAIN</span>
                <span className="font-bold text-[#111318] dark:text-slate-200">
                  {vehicle.driveType} · {vehicle.steering.split(" ")[0]}
                </span>
              </div>
              <div className="bg-[#FAF9F6] dark:bg-[#0D1017] p-3">
                <span className="text-[10px] text-slate-400 block uppercase">CUSTOMS STATUS</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  ISLAM QALA CLEARED
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="p-4 space-y-2 bg-white dark:bg-[#11141B]">
              <MuiButton
                component={Link}
                href={`/vehicles/${vehicle.id}/deed`}
                variant="contained"
                color="primary"
                fullWidth
                size="medium"
                startIcon={<FileText className="h-4 w-4" />}
              >
                {t.generateDeed}
              </MuiButton>

              <MuiButton
                component="a"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                color="success"
                fullWidth
                size="medium"
                startIcon={<Send className="h-4 w-4" />}
              >
                {t.buttonInquireWhatsApp}
              </MuiButton>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <MuiButton
                  component={Link}
                  href={`/vehicles/${vehicle.id}/settlement`}
                  variant="outlined"
                  color="inherit"
                  size="small"
                  startIcon={<Banknote className="h-3.5 w-3.5 text-amber-600" />}
                >
                  Sarrafi Ledger
                </MuiButton>

                <MuiButton
                  onClick={() => setIsFlyerOpen(true)}
                  variant="outlined"
                  color="inherit"
                  size="small"
                  startIcon={<Share2 className="h-3.5 w-3.5" />}
                >
                  Spec Flyer
                </MuiButton>
              </div>
            </div>
          </div>

          {/* Interactive Installment & Financing Calculator */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" />
                <span>Showroom Financing & Installment Estimator</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                0% Dealer Fee
              </span>
            </div>

            {/* Down Payment Slider with MUI */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  Down Payment ({downPaymentPercent}%):
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  ${Math.round(downPaymentUSD).toLocaleString()} USD
                  <span className="text-[11px] text-slate-400 font-normal ml-1">
                    (؋ {Math.round(downPaymentUSD * exchangeRate).toLocaleString()})
                  </span>
                </span>
              </div>
              <div className="px-2 pt-2">
                <Slider
                  value={downPaymentPercent}
                  min={10}
                  max={70}
                  step={5}
                  marks={[
                    { value: 10, label: "10%" },
                    { value: 20, label: "20%" },
                    { value: 30, label: "30%" },
                    { value: 50, label: "50%" },
                    { value: 70, label: "70%" },
                  ]}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(val) => `${val}%`}
                  onChange={(_, val) => setDownPaymentPercent(val as number)}
                  sx={{
                    color: "#2563eb",
                    height: 5,
                    "& .MuiSlider-thumb": {
                      width: 16,
                      height: 16,
                      backgroundColor: "#fff",
                      border: "2px solid #2563eb",
                    },
                    "& .MuiSlider-markLabel": {
                      fontSize: "0.68rem",
                      color: "text.secondary",
                    },
                  }}
                />
              </div>
            </div>

            {/* Loan Term Selection */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  Repayment Duration:
                </span>
                <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {loanTermMonths} Months ({(loanTermMonths / 12).toFixed(1)} Yrs)
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[12, 18, 24, 36, 48].map((months) => (
                  <button
                    key={months}
                    onClick={() => setLoanTermMonths(months)}
                    className={`py-1.5 px-1 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                      loanTermMonths === months
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400"
                    }`}
                  >
                    {months}m
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated Monthly Payment Result */}
            <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-200/80 dark:border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Estimated Monthly Installment (اقساط ماهوار)
              </span>
              <div className="mt-1 text-2xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
                ${Math.round(monthlyPaymentUSD).toLocaleString()}{" "}
                <span className="text-xs font-sans text-slate-400 font-normal">/ mo</span>
              </div>
              <div className="text-[11px] font-mono text-slate-600 dark:text-slate-300 mt-1">
                ؋ {monthlyPaymentAFN.toLocaleString()} AFN per month
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>Sharia Murabaha Transparent Installments (بدون سود مرکب)</span>
              </div>
            </div>
          </div>

          {/* Description & Features Box */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-xs">
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

      {/* Interactive Ultrasonic Body-Panel Paint & Chassis Inspection Diagram */}
      <PaintInspectionDiagram vin={vehicle.vin} cleanTitle={vehicle.cleanTitle} />

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

      {/* Branded Showroom Flyer & Digital Card Dialog */}
      <Dialog
        open={isFlyerOpen}
        onClose={() => setIsFlyerOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Official Showroom Flyer (بروشور و کارت مشخصات)
            </span>
          </div>
          <button
            onClick={() => setIsFlyerOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogTitle>

        <DialogContent className="p-4 sm:p-6 space-y-4">
          {/* Printable Flyer Container */}
          <div
            id="printable-flyer"
            className="rounded-2xl border-2 border-amber-500/30 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white p-5 shadow-xl relative overflow-hidden"
          >
            {/* Top Dealership Crest */}
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold block uppercase">
                  Sadozai Motors Herat • سدوزی موتر
                </span>
                <span className="text-xs font-serif text-slate-300">
                  Luxury Automotive Importers & Dealership
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full border border-amber-400/40 bg-amber-400/10 text-[9px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                Official Dossier
              </span>
            </div>

            {/* Vehicle Hero Image */}
            <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden my-3 border border-slate-700">
              <Image
                src={vehicle.images[0]}
                alt={vehicle.model}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-600/90 text-[10px] font-bold text-white uppercase backdrop-blur-xs">
                {vehicle.originCountry} Direct Import
              </div>
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-[10px] font-mono text-white backdrop-blur-xs">
                Stock #{vehicle.stockNumber}
              </div>
            </div>

            {/* Vehicle Title & Pricing */}
            <div className="flex items-end justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-xl font-bold text-white tracking-tight">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h4>
                <p className="text-xs text-slate-400 font-medium">
                  {vehicle.trim}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black font-mono text-amber-400">
                  ${vehicle.sellingPrice.toLocaleString()} USD
                </div>
                <div className="text-[11px] font-mono text-slate-300">
                  ؋ {(vehicle.sellingPrice * exchangeRate).toLocaleString()} AFN
                </div>
              </div>
            </div>

            {/* 6-Grid Technical Summary */}
            <div className="grid grid-cols-3 gap-2 my-3 text-[11px] font-mono">
              <div className="rounded-lg bg-slate-800/80 p-2 border border-slate-700">
                <span className="text-[9px] text-slate-400 block uppercase font-sans">
                  Mileage
                </span>
                <span className="font-bold text-white">
                  {formatMileage(vehicle.mileage)}
                </span>
              </div>
              <div className="rounded-lg bg-slate-800/80 p-2 border border-slate-700">
                <span className="text-[9px] text-slate-400 block uppercase font-sans">
                  Fuel / Powertrain
                </span>
                <span className="font-bold text-white truncate block">
                  {vehicle.fuelType}
                </span>
              </div>
              <div className="rounded-lg bg-slate-800/80 p-2 border border-slate-700">
                <span className="text-[9px] text-slate-400 block uppercase font-sans">
                  Transmission
                </span>
                <span className="font-bold text-white truncate block">
                  {vehicle.transmission}
                </span>
              </div>
              <div className="rounded-lg bg-slate-800/80 p-2 border border-slate-700">
                <span className="text-[9px] text-slate-400 block uppercase font-sans">
                  Steering
                </span>
                <span className="font-bold text-white">
                  {vehicle.steering.split(" ")[0]}
                </span>
              </div>
              <div className="rounded-lg bg-slate-800/80 p-2 border border-slate-700">
                <span className="text-[9px] text-slate-400 block uppercase font-sans">
                  Drivetrain
                </span>
                <span className="font-bold text-white">{vehicle.driveType}</span>
              </div>
              <div className="rounded-lg bg-slate-800/80 p-2 border border-slate-700">
                <span className="text-[9px] text-slate-400 block uppercase font-sans">
                  Customs Port
                </span>
                <span className="font-bold text-emerald-400">Islam Qala Cleared</span>
              </div>
            </div>

            {/* Dealership Footer Stamp & QR simulation */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-400">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-200 block">
                  Sadozai Motors Lot: Bagh-e-Azadi Avenue, Herat
                </span>
                <span>Tel / WhatsApp: +93 799 102030 • VIN: {vehicle.vin}</span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white text-slate-900">
                <QrCode className="h-6 w-6 text-slate-900" />
                <span className="text-[8px] font-mono font-bold leading-tight uppercase block">
                  SCAN FOR
                  <br />
                  TITLE
                </span>
              </div>
            </div>
          </div>
        </DialogContent>

        <DialogActions className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyFlyerLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {copiedFlyerLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Share WhatsApp</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <MuiButton
              onClick={() => window.print()}
              variant="contained"
              color="primary"
              size="small"
              startIcon={<Printer className="h-4 w-4" />}
            >
              Print / Save PDF
            </MuiButton>
            <MuiButton
              onClick={() => setIsFlyerOpen(false)}
              variant="outlined"
              color="inherit"
              size="small"
            >
              Close
            </MuiButton>
          </div>
        </DialogActions>
      </Dialog>
    </div>
  );
}
