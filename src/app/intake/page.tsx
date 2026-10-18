"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShowroomStore } from "@/store/useShowroomStore";
import { SAMPLE_VEHICLE_PHOTOS_40 } from "@/lib/sample-photos";
import { processAndWatermarkImage } from "@/lib/watermark-utils";
import { translations } from "@/lib/translations";
import {
  MuiCard,
  MuiButton,
  MuiTextField,
  MuiChip,
  MenuItem,
  IconButton,
} from "@/components/mui";
import {
  ArrowLeft,
  Calculator,
  Upload,
  Image as ImageIcon,
  Trash2,
  Star,
  Sparkles,
  Link as LinkIcon,
  ShieldCheck,
  CheckCircle2,
  Save,
  Car,
  DollarSign,
  Truck,
  Building2,
} from "lucide-react";

export default function VehicleIntakePage() {
  const router = useRouter();
  const { addVehicle, addToast, language, exchangeRate } = useShowroomStore();
  const t = translations[language];
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
    features: "Cool Box, 4WD Diff-Lock, Sunroof, Leather Seats, Push Start, 360 Camera",
    description: "Direct import GCC spec in immaculate condition with clean title.",
    descriptionDari: "وارداتی خلیج بدون رنگ و خط و خش، محصول شده گمرک اسلام قلعه.",
    descriptionPashto: "خلیجي واردات، بې رنګه او بې ټکره د هرات اسلام قلعه ګمرک محصول شوی.",
  });

  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1400&q=85",
  ]);
  const [bulkUrlInput, setBulkUrlInput] = useState("");
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [applyWatermark, setApplyWatermark] = useState(true);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

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

      const localPreviews: string[] = [];
      processedFiles.forEach((file) => {
        localPreviews.push(URL.createObjectURL(file));
      });
      setImages((prev) => [...prev, ...localPreviews]);

      const formDataUpload = new FormData();
      processedFiles.forEach((file) => formDataUpload.append("files", file));

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.urls && data.urls.length > 0) {
          setUploadNotice(`✓ Stored ${data.urls.length} watermarked photos on CDN`);
        }
      }
    } catch (err) {
      console.warn("Upload notice:", err);
    } finally {
      setIsUploading(false);
    }
  };

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
      addToast(`Added ${urls.length} vehicle photo URLs`, "success");
    }
  };

  const handleLoadSample42Photos = () => {
    setImages(SAMPLE_VEHICLE_PHOTOS_40);
    addToast("Loaded 40+ high-resolution vehicle photo vault!", "info");
  };

  const handleSetPrimary = (index: number) => {
    setImages((prev) => {
      const selected = prev[index];
      const remaining = prev.filter((_, i) => i !== index);
      return [selected, ...remaining];
    });
  };

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

    addToast(`Successfully registered ${formData.make} ${formData.model} (${formData.stockNumber}) into inventory!`, "success");
    router.push("/inventory");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/" className="hover:text-primary transition-colors">
              Cockpit
            </Link>
            <span>/</span>
            <Link href="/inventory" className="hover:text-primary transition-colors">
              Inventory
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">
              New Vehicle Intake
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Car className="h-6 w-6 text-primary" />
            Vehicle Stock Intake & 40+ Photo Vault
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Register new arrival, calculate landed cost & customs tariffs, and attach watermarked showroom photography.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <MuiButton
            component={Link}
            href="/inventory"
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Cancel & Back
          </MuiButton>
          <MuiButton
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            size="medium"
            startIcon={<Save className="h-4 w-4" />}
          >
            Save Vehicle to Lot
          </MuiButton>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Details (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Core Identification */}
          <MuiCard elevation={1} className="p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                1. Vehicle Identification & Lot Registry
              </h3>
              <MuiChip label="Stock Active" size="small" color="primary" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MuiTextField
                label="Stock Number"
                sizeVariant="small"
                value={formData.stockNumber}
                onChange={(e) =>
                  setFormData({ ...formData, stockNumber: e.target.value })
                }
                required
              />
              <MuiTextField
                label="Chassis / VIN Number"
                sizeVariant="small"
                value={formData.vin}
                onChange={(e) =>
                  setFormData({ ...formData, vin: e.target.value.toUpperCase() })
                }
                required
              />
              <MuiTextField
                select
                label="Lot Location"
                sizeVariant="small"
                value={formData.yardLocation}
                onChange={(e) =>
                  setFormData({ ...formData, yardLocation: e.target.value })
                }
              >
                <MenuItem value="Main Showroom - Bagh-e-Azadi">
                  Main Showroom - Bagh-e-Azadi
                </MenuItem>
                <MenuItem value="VIP Covered Bay - Showroom 1">
                  VIP Covered Bay - Showroom 1
                </MenuItem>
                <MenuItem value="Holding Yard - Islam Qala Border">
                  Holding Yard - Islam Qala Border
                </MenuItem>
                <MenuItem value="Herat Customs Dry Port (Gomrok)">
                  Herat Customs Dry Port (Gomrok)
                </MenuItem>
              </MuiTextField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <MuiTextField
                select
                label="Make"
                sizeVariant="small"
                value={formData.make}
                onChange={(e) =>
                  setFormData({ ...formData, make: e.target.value })
                }
              >
                <MenuItem value="Toyota">Toyota</MenuItem>
                <MenuItem value="Lexus">Lexus</MenuItem>
                <MenuItem value="Mercedes-Benz">Mercedes-Benz</MenuItem>
                <MenuItem value="Land Rover">Land Rover</MenuItem>
                <MenuItem value="Hyundai">Hyundai</MenuItem>
                <MenuItem value="Kia">Kia</MenuItem>
                <MenuItem value="Nissan">Nissan</MenuItem>
                <MenuItem value="BMW">BMW</MenuItem>
              </MuiTextField>

              <MuiTextField
                label="Model"
                sizeVariant="small"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                required
              />

              <MuiTextField
                label="Model Year"
                type="number"
                sizeVariant="small"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: Number(e.target.value) })
                }
                required
              />

              <MuiTextField
                label="Trim / Edition"
                sizeVariant="small"
                value={formData.trim}
                onChange={(e) =>
                  setFormData({ ...formData, trim: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MuiTextField
                select
                label="Body Style"
                sizeVariant="small"
                value={formData.bodyType}
                onChange={(e) =>
                  setFormData({ ...formData, bodyType: e.target.value as any })
                }
              >
                <MenuItem value="SUV">SUV (شاسی بلند)</MenuItem>
                <MenuItem value="Sedan">Sedan (سدان)</MenuItem>
                <MenuItem value="Pickup Truck">Pickup Truck (پیک‌آپ)</MenuItem>
                <MenuItem value="Coupe">Coupe</MenuItem>
                <MenuItem value="Van">Van / Microbus</MenuItem>
              </MuiTextField>

              <MuiTextField
                select
                label="Origin / Import Country"
                sizeVariant="small"
                value={formData.originCountry}
                onChange={(e) =>
                  setFormData({ ...formData, originCountry: e.target.value as any })
                }
              >
                <MenuItem value="UAE">UAE (Dubai Ras Al Khor)</MenuItem>
                <MenuItem value="Canada">Canada</MenuItem>
                <MenuItem value="USA">USA</MenuItem>
                <MenuItem value="Japan">Japan (Yokohama)</MenuItem>
                <MenuItem value="Germany">Germany</MenuItem>
                <MenuItem value="Korea">South Korea</MenuItem>
              </MuiTextField>

              <MuiTextField
                select
                label="Inventory Status"
                sizeVariant="small"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
              >
                <MenuItem value="Available on Lot">Available on Lot (موجود در نندارتون)</MenuItem>
                <MenuItem value="In Transit">In Transit (در حال انتقال از بندر)</MenuItem>
                <MenuItem value="Under Prep/Maintenance">Under Prep/Maintenance</MenuItem>
                <MenuItem value="Reserved/Deposit Paid">Reserved / Deposit Paid</MenuItem>
              </MuiTextField>
            </div>
          </MuiCard>

          {/* Card 2: Technical Specifications & Customs */}
          <MuiCard elevation={1} className="p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-600" />
              2. Technical Specifications & Customs Maktoub
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <MuiTextField
                label="Mileage (KM)"
                type="number"
                sizeVariant="small"
                value={formData.mileage}
                onChange={(e) =>
                  setFormData({ ...formData, mileage: Number(e.target.value) })
                }
                required
              />

              <MuiTextField
                select
                label="Steering Configuration"
                sizeVariant="small"
                value={formData.steering}
                onChange={(e) =>
                  setFormData({ ...formData, steering: e.target.value as any })
                }
              >
                <MenuItem value="Left-Hand Drive (LHD)">Left-Hand Drive (دست چپ افغانستان)</MenuItem>
                <MenuItem value="Right-Hand Drive (RHD)">Right-Hand Drive (دست راست)</MenuItem>
                <MenuItem value="Converted LHD">Converted LHD</MenuItem>
              </MuiTextField>

              <MuiTextField
                select
                label="Fuel Type"
                sizeVariant="small"
                value={formData.fuelType}
                onChange={(e) =>
                  setFormData({ ...formData, fuelType: e.target.value as any })
                }
              >
                <MenuItem value="Petrol">Petrol (پترول)</MenuItem>
                <MenuItem value="Diesel">Diesel (دیزل)</MenuItem>
                <MenuItem value="Hybrid">Hybrid</MenuItem>
                <MenuItem value="Electric">Electric</MenuItem>
              </MuiTextField>

              <MuiTextField
                select
                label="Transmission"
                sizeVariant="small"
                value={formData.transmission}
                onChange={(e) =>
                  setFormData({ ...formData, transmission: e.target.value as any })
                }
              >
                <MenuItem value="Automatic">Automatic (اتومات)</MenuItem>
                <MenuItem value="Manual">Manual (دستی)</MenuItem>
              </MuiTextField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MuiTextField
                select
                label="Drivetrain"
                sizeVariant="small"
                value={formData.driveType}
                onChange={(e) =>
                  setFormData({ ...formData, driveType: e.target.value as any })
                }
              >
                <MenuItem value="4WD">4WD (چهار چرخ محرک)</MenuItem>
                <MenuItem value="AWD">AWD</MenuItem>
                <MenuItem value="RWD">RWD</MenuItem>
                <MenuItem value="FWD">FWD</MenuItem>
              </MuiTextField>

              <MuiTextField
                label="Color / Paint Finish"
                sizeVariant="small"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                required
              />

              <MuiTextField
                label="Gomrok Customs Clearance Maktoub"
                sizeVariant="small"
                value={formData.customsClearance}
                onChange={(e) =>
                  setFormData({ ...formData, customsClearance: e.target.value })
                }
                required
              />
            </div>

            <MuiTextField
              label="Standard Features (comma separated)"
              sizeVariant="small"
              value={formData.features}
              onChange={(e) =>
                setFormData({ ...formData, features: e.target.value })
              }
              helperText="E.g. Cool Box, Sunroof, Leather Seats, 360 Camera, 4WD Diff-Lock"
            />
          </MuiCard>

          {/* Card 3: Bilingual Afghan Descriptions */}
          <MuiCard elevation={1} className="p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 pb-2 border-b border-slate-100 dark:border-slate-800">
              3. Bilingual Showroom Descriptions (دری / پښتو / English)
            </h3>

            <div className="space-y-3">
              <MuiTextField
                label="English Marketing Description"
                sizeVariant="small"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              <MuiTextField
                label="توضیحات موتر به زبان دری (برای قرارداد و اعلان)"
                sizeVariant="small"
                dir="rtl"
                value={formData.descriptionDari}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionDari: e.target.value })
                }
              />
              <MuiTextField
                label="د موټر بشپړ معلومات په پښتو ژبه"
                sizeVariant="small"
                dir="rtl"
                value={formData.descriptionPashto}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionPashto: e.target.value })
                }
              />
            </div>
          </MuiCard>
        </div>

        {/* Right Column: Landed Cost & Photo Vault (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Landed Cost Financial Engine */}
          <MuiCard elevation={2} className="p-5 border-t-4 border-t-primary space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Landed Cost & Profit Calculator
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded font-bold">
                Live Margin
              </span>
            </div>

            <div className="space-y-3">
              <MuiTextField
                label="Purchase Cost (FOB Dubai/Port USD)"
                type="number"
                sizeVariant="small"
                value={formData.purchasePrice}
                onChange={(e) =>
                  setFormData({ ...formData, purchasePrice: Number(e.target.value) })
                }
                startAdornment={<DollarSign className="h-3.5 w-3.5 text-slate-400" />}
              />

              <MuiTextField
                label="Freight & Shipping Cost (USD)"
                type="number"
                sizeVariant="small"
                value={formData.freightCost}
                onChange={(e) =>
                  setFormData({ ...formData, freightCost: Number(e.target.value) })
                }
                startAdornment={<DollarSign className="h-3.5 w-3.5 text-slate-400" />}
              />

              <MuiTextField
                label="Islam Qala Customs Tariff / Duty (USD)"
                type="number"
                sizeVariant="small"
                value={formData.customsDuty}
                onChange={(e) =>
                  setFormData({ ...formData, customsDuty: Number(e.target.value) })
                }
                startAdornment={<DollarSign className="h-3.5 w-3.5 text-slate-400" />}
              />

              <MuiTextField
                label="Refurbishment & Lot Prep (USD)"
                type="number"
                sizeVariant="small"
                value={formData.repairCost}
                onChange={(e) =>
                  setFormData({ ...formData, repairCost: Number(e.target.value) })
                }
                startAdornment={<DollarSign className="h-3.5 w-3.5 text-slate-400" />}
              />
            </div>

            {/* Calculated Landed Cost Summary */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Total Landed Cost:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  ${totalLandedCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Equivalent in AFN:</span>
                <span className="font-mono text-slate-600 dark:text-slate-300">
                  ؋ {(totalLandedCost * exchangeRate).toLocaleString()}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <MuiTextField
                  label="Target Showroom Selling Price (USD)"
                  type="number"
                  sizeVariant="small"
                  value={formData.sellingPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, sellingPrice: Number(e.target.value) })
                  }
                  startAdornment={<DollarSign className="h-3.5 w-3.5 text-slate-400" />}
                />
              </div>

              <div className="flex justify-between items-center pt-2 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Net Expected Profit:
                </span>
                <span
                  className={`font-mono font-bold ${
                    estimatedProfit >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  ${estimatedProfit.toLocaleString()} ({marginPercent}%)
                </span>
              </div>
            </div>
          </MuiCard>

          {/* 40+ Photo Vault & Watermarking Card */}
          <MuiCard elevation={1} className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  40+ Photo Vault ({images.length} Loaded)
                </h3>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <MuiButton
                type="button"
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                startIcon={<Upload className="h-3.5 w-3.5" />}
              >
                Upload Photos
              </MuiButton>

              <MuiButton
                type="button"
                variant="outlined"
                color="secondary"
                size="small"
                onClick={handleLoadSample42Photos}
                startIcon={<Sparkles className="h-3.5 w-3.5" />}
              >
                Load 40 Sample Photos
              </MuiButton>

              <MuiButton
                type="button"
                variant="text"
                color="inherit"
                size="small"
                onClick={() => setIsBulkOpen(!isBulkOpen)}
                startIcon={<LinkIcon className="h-3.5 w-3.5" />}
              >
                Bulk URLs
              </MuiButton>
            </div>

            {/* Watermark toggle */}
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={applyWatermark}
                onChange={(e) => setApplyWatermark(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Watermark &apos;Sadozai Motors Herat&apos; on high-res upload</span>
            </label>

            {uploadNotice && (
              <div className="text-[11px] p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-mono">
                {uploadNotice}
              </div>
            )}

            {/* Bulk URL Panel */}
            {isBulkOpen && (
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-2">
                <textarea
                  value={bulkUrlInput}
                  onChange={(e) => setBulkUrlInput(e.target.value)}
                  placeholder="Paste multiple image URLs (separated by new line or commas)"
                  rows={3}
                  className="w-full text-xs p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <div className="flex justify-end gap-2">
                  <MuiButton
                    type="button"
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={handleAddBulkUrls}
                  >
                    Add URLs
                  </MuiButton>
                </div>
              </div>
            )}

            {/* Thumbnail Matrix */}
            <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-xl">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900"
                >
                  <Image
                    src={img}
                    alt={`Vehicle Photo ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                  {idx === 0 && (
                    <div className="absolute top-1 left-1 bg-amber-500 text-white p-0.5 rounded shadow">
                      <Star className="h-3 w-3 fill-current" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    {idx !== 0 && (
                      <IconButton
                        size="small"
                        onClick={() => handleSetPrimary(idx)}
                        className="!text-amber-400 hover:!bg-black/40"
                        title="Set as Main Cover Photo"
                      >
                        <Star className="h-3 w-3" />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleRemovePhoto(idx)}
                      className="!text-rose-400 hover:!bg-black/40"
                      title="Remove Photo"
                    >
                      <Trash2 className="h-3 w-3" />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-slate-400 text-center">
              Photo 1 is the primary showroom cover photo. Hover to change order or delete.
            </p>
          </MuiCard>

          {/* Submit Action */}
          <MuiButton
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            className="w-full !py-3 font-bold"
            startIcon={<CheckCircle2 className="h-5 w-5" />}
          >
            Complete Intake & Save to Inventory
          </MuiButton>
        </div>
      </form>
    </div>
  );
}
