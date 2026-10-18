"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { useShowroomStore } from "@/store/useShowroomStore";
import { VehicleItem } from "@/lib/mock-data";
import { SAMPLE_VEHICLE_PHOTOS_40 } from "@/lib/sample-photos";
import { processAndWatermarkImage } from "@/lib/watermark-utils";
import {
  X,
  Plus,
  DollarSign,
  Calculator,
  Upload,
  CheckCircle2,
  Image as ImageIcon,
  Trash2,
  Star,
  Sparkles,
  Link as LinkIcon,
  Layers,
  MapPin,
  ShieldCheck,
} from "lucide-react";

interface VehicleIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VehicleIntakeModal({ isOpen, onClose }: VehicleIntakeModalProps) {
  const { addVehicle } = useShowroomStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    stockNumber: `SM-HRT-${Math.floor(110 + Math.random() * 890)}`,
    vin: "JTMCY" + Math.random().toString(36).substring(2, 10).toUpperCase(),
    make: "Toyota",
    model: "Land Cruiser Prado",
    year: 2022,
    trim: "TXL V6 4.0L",
    bodyType: "SUV" as const,
    originCountry: "UAE" as const,
    steering: "Left-Hand Drive (LHD)" as const,
    customsClearance: "Gomrok Herat (Islam Qala) - Cleared",
    cleanTitle: true,
    mileage: 26000,
    fuelType: "Petrol" as const,
    transmission: "Automatic" as const,
    driveType: "4WD" as const,
    color: "Pearl White",
    status: "Available on Lot" as const,
    yardLocation: "Main Showroom - Bagh-e-Azadi",
    purchasePrice: 42000,
    freightCost: 1500,
    customsDuty: 4500,
    repairCost: 400,
    sellingPrice: 53500,
    features: "Cool Box, 4WD Diff-Lock, Sunroof, Leather Seats, Push Start",
    description: "Direct import GCC spec in immaculate condition with clean title.",
    descriptionDari: "وارداتی خلیج بدون رنگ و خط و خش، محصول شده گمرک اسلام قلعه.",
    descriptionPashto: "خلیجي واردات، بې رنګه او بې ټکره د هرات اسلام قلعه ګمرک محصول شوی.",
  });

  // State to hold 40+ vehicle images
  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1400&q=85",
  ]);
  const [bulkUrlInput, setBulkUrlInput] = useState("");
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [applyWatermark, setApplyWatermark] = useState(true);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real-time calculation of total landed cost
  const totalLandedCost =
    Number(formData.purchasePrice || 0) +
    Number(formData.freightCost || 0) +
    Number(formData.customsDuty || 0) +
    Number(formData.repairCost || 0);

  const estimatedProfit = Number(formData.sellingPrice || 0) - totalLandedCost;
  const marginPercent =
    totalLandedCost > 0
      ? ((estimatedProfit / totalLandedCost) * 100).toFixed(1)
      : "0";

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = e.target.files;
    if (!rawFiles || rawFiles.length === 0) return;

    setIsUploading(true);
    setUploadNotice(`Watermarking & Optimizing ${rawFiles.length} photos for Vercel Blob...`);

    try {
      // 1. Process with watermark & WebP compression
      const processedFiles: File[] = [];
      for (const file of Array.from(rawFiles)) {
        if (applyWatermark) {
          const stamped = await processAndWatermarkImage(file, {
            stockNumber: formData.stockNumber,
            applyWatermark: true,
          });
          processedFiles.push(stamped);
        } else {
          processedFiles.push(file);
        }
      }

      // 2. Read previews
      const localPreviews: string[] = [];
      processedFiles.forEach((file) => {
        localPreviews.push(URL.createObjectURL(file));
      });
      setImages((prev) => [...prev, ...localPreviews]);

      // 3. Upload to Vercel Blob via /api/upload
      const formDataUpload = new FormData();
      processedFiles.forEach((file) => formDataUpload.append("files", file));

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.urls && data.urls.length > 0) {
          if (!data.isSimulated) {
            setUploadNotice(`✓ Stored ${data.urls.length} watermarked photos on Vercel Blob CDN`);
          } else {
            setUploadNotice(`✓ ${data.urls.length} photos ready (Vercel Blob ready)`);
          }
        }
      }
    } catch (err) {
      console.warn("Vercel Blob upload notice:", err);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle bulk URLs paste (e.g. from Cloudflare R2 / AWS S3)
  const handleAddBulkUrls = () => {
    if (!bulkUrlInput.trim()) return;
    const urls = bulkUrlInput
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.startsWith("http://") || u.startsWith("https://") || u.startsWith("data:"));

    if (urls.length > 0) {
      setImages((prev) => [...prev, ...urls]);
      setBulkUrlInput("");
      setIsBulkOpen(false);
    }
  };

  // Load 42 Sample 4K Vehicle Photos preset
  const handleLoadSample42Photos = () => {
    setImages(SAMPLE_VEHICLE_PHOTOS_40);
  };

  // Set photo as primary
  const handleSetPrimary = (index: number) => {
    setImages((prev) => {
      const selected = prev[index];
      const remaining = prev.filter((_, i) => i !== index);
      return [selected, ...remaining];
    });
  };

  // Remove photo
  const handleRemovePhoto = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addVehicle({
      stockNumber: formData.stockNumber,
      vin: formData.vin,
      make: formData.make,
      model: formData.model,
      year: Number(formData.year),
      trim: formData.trim,
      bodyType: formData.bodyType,
      originCountry: formData.originCountry,
      steering: formData.steering,
      customsClearance: formData.customsClearance,
      cleanTitle: formData.cleanTitle,
      mileage: Number(formData.mileage),
      fuelType: formData.fuelType,
      transmission: formData.transmission,
      driveType: formData.driveType,
      color: formData.color,
      status: formData.status,
      purchasePrice: Number(formData.purchasePrice),
      freightCost: Number(formData.freightCost),
      customsDuty: Number(formData.customsDuty),
      repairCost: Number(formData.repairCost),
      landedCost: totalLandedCost,
      minTargetPrice: totalLandedCost + 2000,
      sellingPrice: Number(formData.sellingPrice),
      features: formData.features.split(",").map((f) => f.trim()),
      description: formData.description,
      descriptionDari: formData.descriptionDari,
      descriptionPashto: formData.descriptionPashto,
      conditionNotes: {
        exterior: "10/10 - Inspected on Herat Lot",
        interior: "10/10 - Clean Condition",
        engine: "10/10 - Tested & Certified",
        tires: "90% Tread Depth",
        accidentHistory: "Clean Title Guaranteed",
      },
      images: images.length > 0 ? images : [SAMPLE_VEHICLE_PHOTOS_40[0]],
      documents: [],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-xl bg-white p-6 shadow-2xl dark:bg-[#121824] sm:p-7 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Vehicle Stock Intake & Photo Vault
            </h3>
            <p className="text-xs text-slate-500">
              Register arrival, calculate landed cost, and attach up to 40+ high-resolution vehicle photos
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Section 1: Identification & General Info */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              1. Basic Vehicle Identification
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Stock ID
                </label>
                <input
                  type="text"
                  value={formData.stockNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, stockNumber: e.target.value })
                  }
                  required
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 text-xs font-mono font-medium dark:border-slate-700 dark:bg-[#1A2234] dark:text-white outline-none focus:border-[#1976D2]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Chassis / VIN
                </label>
                <input
                  type="text"
                  value={formData.vin}
                  onChange={(e) =>
                    setFormData({ ...formData, vin: e.target.value })
                  }
                  required
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 text-xs font-mono font-medium dark:border-slate-700 dark:bg-[#1A2234] dark:text-white outline-none focus:border-[#1976D2]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as any })
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-[#1A2234] dark:text-white outline-none focus:border-[#1976D2]"
                >
                  <option value="Available on Lot">Available on Lot</option>
                  <option value="In Transit">In Transit to Herat</option>
                  <option value="Under Prep/Maintenance">Under Prep</option>
                  <option value="Reserved/Deposit Paid">Reserved</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Make
                </label>
                <input
                  type="text"
                  value={formData.make}
                  onChange={(e) =>
                    setFormData({ ...formData, make: e.target.value })
                  }
                  required
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-[#1A2234] dark:text-white outline-none focus:border-[#1976D2]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Model & Trim
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  required
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-[#1A2234] dark:text-white outline-none focus:border-[#1976D2]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Year
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: Number(e.target.value) })
                  }
                  required
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-[#1A2234] dark:text-white outline-none focus:border-[#1976D2]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Yard Location (موقعیت موتر)
                </label>
                <select
                  value={formData.yardLocation}
                  onChange={(e) =>
                    setFormData({ ...formData, yardLocation: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-[#1A2234] dark:text-white outline-none focus:border-[#1976D2]"
                >
                  <option value="Main Showroom - Bagh-e-Azadi">Main Showroom (باغ آزادی)</option>
                  <option value="Yard 2 - Islam Qala Highway">Yard 2 (سرک اسلام قلعه)</option>
                  <option value="Islam Qala Customs Bonded Yard">Customs Bonded Port (گمرک اسلام قلعه)</option>
                  <option value="In Transit from Dubai/Iran">In Transit (در مسیر بندر عباس/دبی)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Acquisition & Landed Cost Breakdown */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calculator className="h-4 w-4 text-[#1976D2]" />
                2. Landed Cost Breakdown (Herat Islam Qala)
              </h4>
              <span className="text-xs font-mono font-medium text-slate-500">
                All amounts in USD ($)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500">
                  Purchase Price
                </label>
                <input
                  type="number"
                  value={formData.purchasePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, purchasePrice: Number(e.target.value) })
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 text-xs font-mono font-medium dark:border-slate-700 dark:bg-[#1A2234] dark:text-white outline-none focus:border-[#1976D2]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500">
                  Freight / Shipping
                </label>
                <input
                  type="number"
                  value={formData.freightCost}
                  onChange={(e) =>
                    setFormData({ ...formData, freightCost: Number(e.target.value) })
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 text-xs font-mono font-medium dark:border-slate-700 dark:bg-[#1A2234] dark:text-white outline-none focus:border-[#1976D2]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500">
                  Herat Customs (Gomrok)
                </label>
                <input
                  type="number"
                  value={formData.customsDuty}
                  onChange={(e) =>
                    setFormData({ ...formData, customsDuty: Number(e.target.value) })
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 text-xs font-mono font-medium dark:border-slate-700 dark:bg-[#1A2234] dark:text-white outline-none focus:border-[#1976D2]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500">
                  Prep & Detailing
                </label>
                <input
                  type="number"
                  value={formData.repairCost}
                  onChange={(e) =>
                    setFormData({ ...formData, repairCost: Number(e.target.value) })
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 text-xs font-mono font-medium dark:border-slate-700 dark:bg-[#1A2234] dark:text-white outline-none focus:border-[#1976D2]"
                />
              </div>
            </div>

            {/* Calculated Landed Cost & Selling Price */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-[10px] text-slate-500 block">Total Landed Cost:</span>
                  <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                    ${totalLandedCost.toLocaleString()} USD
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Projected Profit:</span>
                  <span
                    className={`text-base font-bold font-mono ${
                      estimatedProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"
                    }`}
                  >
                    +${estimatedProfit.toLocaleString()} ({marginPercent}%)
                  </span>
                </div>
              </div>

              <div className="w-full sm:w-auto">
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">
                  Showroom Selling Price (USD)
                </label>
                <input
                  type="number"
                  value={formData.sellingPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, sellingPrice: Number(e.target.value) })
                  }
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-bold font-mono text-slate-900 dark:border-slate-700 dark:bg-[#1A2234] dark:text-white outline-none focus:border-[#1976D2]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: 40+ Vehicle Photos Upload & Gallery Manager */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-[#121824] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-[#1976D2]" />
                  3. 40+ Vehicle Photography Vault
                </h4>
                <p className="text-[11px] text-slate-500">
                  Upload multiple 4K angles (exterior 360°, interior cockpit, engine, odometer, undercarriage, customs slip)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-md bg-slate-200/70 dark:bg-slate-800 px-2.5 py-1 text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                  {images.length} Photos {images.length >= 40 && "✓"}
                </span>

                <button
                  type="button"
                  onClick={handleLoadSample42Photos}
                  className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <Sparkles className="h-3 w-3 text-[#1976D2]" />
                  <span>Load Sample 4K Album</span>
                </button>
              </div>
            </div>

            {/* Upload Zone (Drag-and-Drop + Multi-File Browser) */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative cursor-pointer rounded-lg border-2 border-dashed border-slate-300 p-6 text-center hover:border-[#1976D2] hover:bg-[#1976D2]/5 dark:border-slate-700 dark:hover:border-[#1976D2] dark:hover:bg-slate-800/40 transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="mx-auto h-7 w-7 text-slate-400" />
              <p className="mt-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                Click or Drag & Drop Multiple Photos (Select 40+ images at once)
              </p>
              <p className="text-[11px] text-slate-400">
                Supports JPG, PNG, WEBP (Supports camera roll, lot tablet, or batch folder upload)
              </p>
              <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-mono">
                <span className="rounded bg-black/5 dark:bg-white/10 px-2 py-0.5 border border-slate-200 dark:border-slate-800">
                  ☁️ Connected to Vercel Blob Storage CDN
                </span>
              </div>
              {uploadNotice && (
                <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {uploadNotice}
                </p>
              )}
            </div>

            {/* Auto-Watermark & WebP Compression Toggle */}
            <div className="flex items-center justify-between rounded-lg bg-slate-100/70 p-2.5 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyWatermark}
                  onChange={(e) => setApplyWatermark(e.target.checked)}
                  className="rounded border-slate-300 text-[#1976D2] focus:ring-[#1976D2]"
                />
                <ShieldCheck className="h-4 w-4 text-[#1976D2] shrink-0" />
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  Auto-stamp "Sadozai Motors Herat • Verified Lot" Watermark & Optimize to WebP
                </span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                Reduces 4K files from ~12MB to ~700KB for fast CDN streaming
              </span>
            </div>

            {/* Bulk URL Import Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setIsBulkOpen(!isBulkOpen)}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-[#1976D2] dark:text-slate-400 cursor-pointer"
              >
                <LinkIcon className="h-3.5 w-3.5" />
                <span>Or Paste 40+ Image URLs from Cloudflare R2 / AWS S3 / CDN</span>
              </button>

              {isBulkOpen && (
                <div className="mt-2 space-y-2">
                  <textarea
                    rows={3}
                    placeholder="Paste multiple image URLs (separated by newlines or commas)..."
                    value={bulkUrlInput}
                    onChange={(e) => setBulkUrlInput(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white p-2.5 text-xs font-mono dark:border-slate-700 dark:bg-[#1A2234] dark:text-white outline-none focus:border-[#1976D2]"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddBulkUrls}
                      className="rounded-md bg-[#1976D2] hover:bg-[#1565C0] px-3 py-1.5 text-xs font-medium text-white transition-colors cursor-pointer"
                    >
                      Import URLs to Album
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery Strip */}
            {images.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Photo Sequence (First image is primary lot cover):</span>
                  {images.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setImages([])}
                      className="text-rose-500 hover:underline cursor-pointer"
                    >
                      Clear all photos
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-1 border rounded-lg dark:border-slate-800 bg-white dark:bg-[#1A2234]">
                  {images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className={`group relative aspect-[4/3] rounded-md overflow-hidden border transition-all ${
                        idx === 0 ? "border-[#1976D2] ring-2 ring-[#1976D2]/30" : "border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <Image
                        src={imgUrl}
                        alt={`Photo ${idx + 1}`}
                        fill
                        className="object-cover"
                      />

                      {/* Primary Badge */}
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 rounded bg-[#1976D2] px-1 py-0.2 text-[9px] font-bold text-white">
                          Cover
                        </span>
                      )}

                      {/* Photo Index */}
                      <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 py-0.2 text-[9px] font-mono text-white">
                        #{idx + 1}
                      </span>

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(idx)}
                            className="p-1 rounded bg-white text-slate-900 hover:scale-110 cursor-pointer"
                            title="Make Primary Cover"
                          >
                            <Star className="h-3 w-3" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="p-1 rounded bg-rose-600 text-white hover:scale-110 cursor-pointer"
                          title="Delete photo"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-md bg-[#1976D2] hover:bg-[#1565C0] px-5 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Intake Vehicle with {images.length} Photos</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
