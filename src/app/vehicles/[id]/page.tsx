"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useShowroomStore } from "@/store/useShowroomStore";
import { formatCurrency, formatMileage } from "@/lib/utils";
import { translations } from "@/lib/translations";
import { VehicleDeedModal } from "@/components/VehicleDeedModal";
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
} from "lucide-react";

export default function VehicleDetailsPage() {
  const params = useParams();
  const vehicleId = params?.id as string;
  const { vehicles, currency, exchangeRate, language } = useShowroomStore();
  const t = translations[language];

  const vehicle = vehicles.find((v) => v.id === vehicleId) || vehicles[0];

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isDeedModalOpen, setIsDeedModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isAllPhotosModalOpen, setIsAllPhotosModalOpen] = useState(false);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setActivePhotoIndex((prev) => (prev === vehicle.images.length - 1 ? 0 : prev + 1));
      } else if (e.key === "ArrowLeft") {
        setActivePhotoIndex((prev) => (prev === 0 ? vehicle.images.length - 1 : prev - 1));
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
        <Link href="/inventory" className="text-gold underline mt-4 inline-block">
          Return to Inventory
        </Link>
      </div>
    );
  }

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/inventory"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-gold dark:text-slate-400 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Showroom Inventory</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-gold bg-gold/10 px-2.5 py-1 rounded-lg">
            Stock #{vehicle.stockNumber}
          </span>
          <span className="font-mono text-xs text-slate-500 bg-slate-100 dark:bg-navy-800 px-2.5 py-1 rounded-lg">
            VIN: {vehicle.vin}
          </span>
        </div>
      </div>

      {/* Main Grid: Gallery on Left (7 cols), Overview & CTAs on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Gallery Carousel & Condition */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Photo Viewport */}
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-slate-200 bg-black shadow-lg dark:border-slate-800">
            <Image
              src={vehicle.images[activePhotoIndex] || vehicle.images[0]}
              alt={`${vehicle.make} ${vehicle.model}`}
              fill
              priority
              className="object-cover"
            />

            {/* Badges on Image */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-bold text-white shadow-md backdrop-blur-md">
                {vehicle.status}
              </span>
              <span className="rounded-full bg-navy/90 px-3 py-1 text-xs font-bold text-gold-light shadow-md backdrop-blur-md">
                {vehicle.originCountry} Direct Import
              </span>
            </div>

            {/* Photo Counter Pill & Lightbox trigger */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="rounded-xl bg-black/60 px-3 py-1.5 text-xs font-mono font-bold text-white backdrop-blur-md">
                {activePhotoIndex + 1} / {vehicle.images.length} Photos
              </span>
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="rounded-xl bg-black/60 p-2 text-white backdrop-blur-md hover:bg-black/80 transition-colors"
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
                  className="pointer-events-auto rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() =>
                    setActivePhotoIndex((prev) =>
                      prev === vehicle.images.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="pointer-events-auto rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Bottom Floating Bar: View All 40+ Photos Button */}
            <div className="absolute bottom-4 right-4">
              <button
                onClick={() => setIsAllPhotosModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-gold/90 px-3.5 py-1.5 text-xs font-bold text-slate-950 backdrop-blur-md hover:bg-gold transition-colors shadow-lg"
              >
                <Grid className="h-3.5 w-3.5" />
                <span>View All {vehicle.images.length} 4K Photos</span>
              </button>
            </div>
          </div>

          {/* Thumbnail Track with 40+ Photos Support */}
          {vehicle.images.length > 1 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                  <Camera className="h-3.5 w-3.5 text-gold" />
                  <span>Album Gallery ({vehicle.images.length} Photos)</span>
                </span>
                <button
                  onClick={() => setIsAllPhotosModalOpen(true)}
                  className="text-gold hover:underline font-bold"
                >
                  Browse Full Grid →
                </button>
              </div>

              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                {vehicle.images.slice(0, 15).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`relative aspect-[16/10] w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      activePhotoIndex === idx
                        ? "border-gold scale-105 shadow-md"
                        : "border-transparent opacity-60 hover:opacity-100"
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
                    className="relative aspect-[16/10] w-20 shrink-0 overflow-hidden rounded-xl border-2 border-dashed border-gold/60 bg-gold/10 flex flex-col items-center justify-center text-gold font-bold text-xs hover:bg-gold/20 transition-colors"
                  >
                    <span>+{vehicle.images.length - 15}</span>
                    <span className="text-[9px]">More</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Condition Breakdown */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-navy-900 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gold dark:text-gold-light mb-4 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Sadozai Certified Condition & Inspection Report
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-navy-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  Exterior & Paint:
                </span>
                <span className="text-slate-600 dark:text-slate-300">
                  {vehicle.conditionNotes.exterior}
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 dark:bg-navy-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  Interior & Upholstery:
                </span>
                <span className="text-slate-600 dark:text-slate-300">
                  {vehicle.conditionNotes.interior}
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 dark:bg-navy-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  Engine & Powertrain:
                </span>
                <span className="text-slate-600 dark:text-slate-300">
                  {vehicle.conditionNotes.engine}
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 dark:bg-navy-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  Tires & Suspension:
                </span>
                <span className="text-slate-600 dark:text-slate-300">
                  {vehicle.conditionNotes.tires}
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 dark:bg-navy-800 sm:col-span-2">
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

        {/* Right Column: Key Details, Pricing & Action Center */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Info Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-navy-900 shadow-md">
            <span className="text-xs font-bold uppercase tracking-wider text-gold dark:text-gold-light">
              {vehicle.make} • {vehicle.originCountry} Import
            </span>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {vehicle.year} {vehicle.model}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {vehicle.trim}
            </p>

            {/* ERP Pricing & Margin Box */}
            <div className="mt-6 rounded-2xl bg-slate-50 p-4 dark:bg-navy-800 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Lot Selling Price
                </span>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="text-3xl font-black text-slate-950 dark:text-white">
                    {formatCurrency(vehicle.sellingPrice, currency, exchangeRate)}
                  </span>
                  {currency === "AFN" && (
                    <span className="text-sm font-semibold text-slate-500">
                      (${vehicle.sellingPrice.toLocaleString()} USD)
                    </span>
                  )}
                </div>
              </div>

              {/* Landed Cost vs Margin Breakdown */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs font-mono">
                <div className="rounded-lg bg-white dark:bg-navy-900 p-2 border border-slate-200/60 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block uppercase font-sans">Total Landed Cost</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    ${vehicle.landedCost.toLocaleString()} USD
                  </span>
                </div>
                <div className="rounded-lg bg-white dark:bg-navy-900 p-2 border border-slate-200/60 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block uppercase font-sans">Net Target Margin</span>
                  <span className="font-bold text-emerald-500">
                    +${(vehicle.sellingPrice - vehicle.landedCost).toLocaleString()} ({vehicle.landedCost > 0 ? (((vehicle.sellingPrice - vehicle.landedCost) / vehicle.landedCost) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Customs duty settled at Herat Islam Qala Port
              </p>
            </div>

            {/* Core Specs Pills */}
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 dark:bg-navy-800">
                <Gauge className="h-4 w-4 text-gold shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Mileage</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {formatMileage(vehicle.mileage)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 dark:bg-navy-800">
                <Fuel className="h-4 w-4 text-gold shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Fuel Type</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {vehicle.fuelType}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 dark:bg-navy-800">
                <Compass className="h-4 w-4 text-gold shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Drivetrain</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {vehicle.driveType} • {vehicle.transmission}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 dark:bg-navy-800">
                <Car className="h-4 w-4 text-gold shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Steering</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {vehicle.steering.split(" ")[0]}
                  </span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-8 space-y-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-colors"
              >
                <Send className="h-4 w-4" />
                <span>Inquire directly on WhatsApp (واتساپ)</span>
              </a>

              <button
                onClick={() => setIsDeedModalOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3 text-xs font-bold text-slate-950 shadow-md hover:bg-gold-light transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>{t.generateDeed}</span>
              </button>

              <button
                onClick={handlePrintSpecs}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-navy-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <Printer className="h-4 w-4" />
                <span>{t.printSpecSheet}</span>
              </button>
            </div>
          </div>

          {/* Description & Features Box */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-navy-900">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold dark:text-gold-light mb-3">
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
                <span className="font-bold text-gold block mb-1">د موټر پښتو تشریح:</span>
                {vehicle.descriptionPashto}
              </p>
            ) : vehicle.descriptionDari ? (
              <p
                dir="rtl"
                className="mt-3 text-xs font-dari text-slate-600 dark:text-slate-300 leading-relaxed border-t pt-3 dark:border-slate-800"
              >
                <span className="font-bold text-gold block mb-1">معلومات موتر به دری:</span>
                {vehicle.descriptionDari}
              </p>
            ) : null}

            <div className="mt-4 pt-3 border-t dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider block mb-2">
                Factory Options & Packages:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                {vehicle.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-gold shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bilingual Sales Deed & Contract Modal */}
      <VehicleDeedModal
        vehicle={vehicle}
        isOpen={isDeedModalOpen}
        onClose={() => setIsDeedModalOpen(false)}
      />

      {/* Fullscreen Lightbox Modal with 40+ Navigation */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/95 p-4 backdrop-blur-md">
          {/* Top Bar */}
          <div className="flex w-full items-center justify-between text-white border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm text-gold">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </span>
              <span className="rounded-full bg-slate-800 px-3 py-0.5 text-xs font-mono text-slate-300">
                Photo {activePhotoIndex + 1} of {vehicle.images.length}
              </span>
            </div>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="rounded-full bg-slate-800 p-2 text-white hover:bg-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Center Image with Next / Prev Controls */}
          <div className="relative flex-1 w-full flex items-center justify-center my-4">
            <div className="relative aspect-[16/10] max-h-[75vh] w-full max-w-5xl">
              <Image
                src={vehicle.images[activePhotoIndex]}
                alt={`Photo ${activePhotoIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>

            {/* Lightbox Navigation Buttons */}
            {vehicle.images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActivePhotoIndex((prev) =>
                      prev === 0 ? vehicle.images.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-3 text-white hover:bg-black transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() =>
                    setActivePhotoIndex((prev) =>
                      prev === vehicle.images.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-3 text-white hover:bg-black transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails Strip in Lightbox */}
          <div className="w-full max-w-4xl overflow-x-auto py-2 flex gap-2 justify-center">
            {vehicle.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhotoIndex(idx)}
                className={`relative aspect-[16/10] w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                  activePhotoIndex === idx
                    ? "border-gold scale-110"
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
          <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-navy-950 sm:p-8">
            <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Full 4K Photo Gallery ({vehicle.images.length} High-Resolution Angles)
                </h3>
                <p className="text-xs text-slate-500">
                  {vehicle.year} {vehicle.make} {vehicle.model} • Stock #{vehicle.stockNumber}
                </p>
              </div>
              <button
                onClick={() => setIsAllPhotosModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
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
                  className={`group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl border-2 transition-all hover:scale-105 hover:border-gold ${
                    activePhotoIndex === idx ? "border-gold ring-2 ring-gold/40" : "border-slate-200 dark:border-slate-800"
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
                  <div className="absolute inset-0 bg-gold/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
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
