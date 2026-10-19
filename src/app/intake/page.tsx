"use client";

import React, { useState, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShowroomStore } from "@/store/useShowroomStore";
import { SAMPLE_VEHICLE_PHOTOS_40 } from "@/lib/sample-photos";
import { processAndWatermarkImage } from "@/lib/watermark-utils";
import { translations } from "@/lib/translations";
import { decodeVin } from "@/lib/vin-decoder";
import { PaintInspectionDiagram } from "@/components/PaintInspectionDiagram";
import {
  MuiButton,
  MuiTextField,
  MuiChip,
  MuiCard,
  MuiCardContent,
  MenuItem,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  InputAdornment,
  Alert,
  AlertTitle,
  LinearProgress,
  Divider,
} from "@/components/mui";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  Trash2,
  Star,
  Sparkles,
  Link as LinkIcon,
  ShieldCheck,
  CheckCircle2,
  Car,
  DollarSign,
  Truck,
  Building2,
  Zap,
  Check,
  FileText,
  RotateCcw,
  Gauge,
  Fuel,
  Compass,
  AlertCircle,
  Key,
  Globe,
  Languages,
  Info,
  Layers,
  TrendingUp,
} from "lucide-react";

// Predefined available luxury and 4WD options for Afghan market
const PRESET_VEHICLE_FEATURES = [
  "Center Console Cool Box",
  "Front & Rear Diff-Lock",
  "Panoramic Sunroof",
  "Premium Leather Seats",
  "Push Button Start / Smart Key",
  "360° Surround View Camera",
  "Adaptive Radar Cruise Control",
  "Heated & Ventilated Seats",
  "Power Electric Tailgate",
  "Blind Spot Monitor (BSM)",
  "JBL / Mark Levinson Premium Audio",
  "Head-Up Display (HUD)",
  "Wireless Phone Charger",
  "Apple CarPlay & Android Auto",
  "Crawl Control / Multi-Terrain Select",
  "Active Height Control (AHC) Suspension",
];

export default function VehicleIntakePage() {
  const router = useRouter();
  const { addVehicle, addToast, language, exchangeRate } = useShowroomStore();
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  const [isDecoding, setIsDecoding] = useState(false);

  // Core vehicle form data state
  const [formData, setFormData] = useState({
    stockNumber: `ARI-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    vin: "JTMBW0RJ" + Math.random().toString(36).substring(2, 11).toUpperCase(),
    make: "Toyota",
    model: "Land Cruiser 300",
    year: 2024,
    trim: "GR-Sport Twin-Turbo 3.5L V6",
    bodyType: "SUV" as const,
    originCountry: "UAE" as const,
    steering: "Left-Hand Drive (LHD)" as const,
    customsClearance: "Islam Qala Gomrok - Cleared via Maktoub #IQ-2026-9902",
    cleanTitle: true,
    mileage: 12500,
    fuelType: "Petrol" as const,
    transmission: "Automatic" as const,
    driveType: "4WD" as const,
    color: "Pearl White Metallic",
    status: "Available on Lot" as const,
    yardLocation: "Main Showroom - Bagh-e-Azadi",
    purchasePrice: 72000,
    freightCost: 2400,
    customsDuty: 8200,
    repairCost: 400,
    sellingPrice: 94500,
    features:
      "Center Console Cool Box, Front & Rear Diff-Lock, Panoramic Sunroof, Premium Leather Seats, 360° Surround View Camera, Adaptive Radar Cruise Control",
    description:
      "2024 Toyota Land Cruiser 300 GR-Sport GCC specification. Direct Jebel Ali Port import, fully cleared at Islam Qala Dry Port. Pristine condition with zero accident history.",
    descriptionDari:
      "تویوتا لندکروزر ۳۰۰ مدل ۲۰۲۴ جی‌آر اسپورت فول آپشن وارداتی مستقیم دبی، محصول شده کامل گمرک اسلام قلعه هرات، بدون رنگ و خط و خش.",
    descriptionPashto:
      "تویوټا لینډکروزر ۳۰۰ ماډل ۲۰۲۴ جی آر سپورټ د دوبۍ مستقیم واردات، د هرات اسلام قلعه ګمرک محصول شوی او په بشپړ ډول پاک.",
  });

  // Images state
  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1400&q=85",
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
  ]);
  const [bulkUrlInput, setBulkUrlInput] = useState("");
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [applyWatermark, setApplyWatermark] = useState(true);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  // Features parsing
  const currentFeaturesArray = useMemo(() => {
    return formData.features
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);
  }, [formData.features]);

  const toggleFeature = (feature: string) => {
    let updated: string[];
    if (currentFeaturesArray.includes(feature)) {
      updated = currentFeaturesArray.filter((f) => f !== feature);
    } else {
      updated = [...currentFeaturesArray, feature];
    }
    setFormData((prev) => ({ ...prev, features: updated.join(", ") }));
  };

  // Real-time calculation of total landed cost & margin
  const totalLandedCost = useMemo(() => {
    return (
      Number(formData.purchasePrice || 0) +
      Number(formData.freightCost || 0) +
      Number(formData.customsDuty || 0) +
      Number(formData.repairCost || 0)
    );
  }, [formData.purchasePrice, formData.freightCost, formData.customsDuty, formData.repairCost]);

  const estimatedProfit = useMemo(() => {
    return Number(formData.sellingPrice || 0) - totalLandedCost;
  }, [formData.sellingPrice, totalLandedCost]);

  const marginPercent = useMemo(() => {
    if (totalLandedCost <= 0) return "0.0";
    return ((estimatedProfit / totalLandedCost) * 100).toFixed(1);
  }, [estimatedProfit, totalLandedCost]);

  // VIN Auto-Decoder Engine
  const handleAutoDecode = async () => {
    const rawVin = formData.vin.trim();
    if (!rawVin || rawVin.length < 11) {
      addToast("Please provide a valid 17-character VIN chassis string", "warning");
      return;
    }

    setIsDecoding(true);
    try {
      const decoded = await decodeVin(rawVin);
      if (decoded) {
        setFormData((prev) => ({
          ...prev,
          make: decoded.make || prev.make,
          model: decoded.model || prev.model,
          year: decoded.year || prev.year,
          bodyType: (decoded.bodyType as any) || prev.bodyType,
          fuelType: (decoded.fuelType as any) || prev.fuelType,
          transmission: (decoded.transmission as any) || prev.transmission,
          driveType: (decoded.driveType as any) || prev.driveType,
          trim: decoded.trim || prev.trim,
        }));
        addToast(
          `⚡ Decoded ${decoded.year || ""} ${decoded.make || ""} ${decoded.model || ""} (${decoded.bodyType || ""})`,
          "success"
        );
      } else {
        addToast("VIN not found in online decoder database. Manual entry is supported.", "info");
      }
    } catch (err: any) {
      addToast(
        err?.message || "Could not automatically decode this VIN. Manual entry is supported.",
        "error"
      );
    } finally {
      setIsDecoding(false);
    }
  };

  // Stock ID Generator
  const handleGenerateStockNumber = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100 + Math.random() * 900);
    const newStock = `ARI-${year}-${randomNum}`;
    setFormData((prev) => ({
      ...prev,
      stockNumber: newStock,
    }));
    addToast(`Generated stock ID: ${newStock}`, "info");
  };

  // Quick Demo Auto-Fill
  const handleQuickPopulateSample = () => {
    setFormData({
      stockNumber: `ARI-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      vin: "JTMBW0RJ3R" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      make: "Toyota",
      model: "Land Cruiser 300",
      year: 2024,
      trim: "VXR Twin-Turbo 3.5L V6 Full Option",
      bodyType: "SUV",
      originCountry: "UAE",
      steering: "Left-Hand Drive (LHD)",
      customsClearance: "Islam Qala Gomrok - Cleared via Maktoub #IQ-2026-9902",
      cleanTitle: true,
      mileage: 8200,
      fuelType: "Petrol",
      transmission: "Automatic",
      driveType: "4WD",
      color: "Pearl White Crystal",
      status: "Available on Lot",
      yardLocation: "Main Showroom - Bagh-e-Azadi",
      purchasePrice: 84000,
      freightCost: 2600,
      customsDuty: 9500,
      repairCost: 500,
      sellingPrice: 108000,
      features:
        "Center Console Cool Box, Front & Rear Diff-Lock, Panoramic Sunroof, Premium Leather Seats, 360° Surround View Camera, Adaptive Radar Cruise Control, Heated & Ventilated Seats, Head-Up Display (HUD), Power Electric Tailgate",
      description:
        "2024 Toyota Land Cruiser 300 VXR Twin Turbo direct Dubai import. Immaculate showroom lot condition with verified customs clearance, original paint, and clean title.",
      descriptionDari:
        "تویوتا لندکروزر ۳۰۰ مدل ۲۰۲۴ فول آپشن وارداتی خلیج، بدون رنگ و خط و خش، محصول کامل گمرک اسلام قلعه.",
      descriptionPashto:
        "تویوټا لینډکروزر ۳۰۰ ماډل ۲۰۲۴ فول آفشن خلیجي واردات، بې رنګه او بې ټکره د هرات اسلام قلعه ګمرک محصول شوی.",
    });
    setImages(SAMPLE_VEHICLE_PHOTOS_40);
    addToast("⚡ Sample 2024 Toyota Land Cruiser 300 VXR loaded into intake dossier!", "success");
  };

  // Photo Upload Handler with Watermarking
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = e.target.files;
    if (!rawFiles || rawFiles.length === 0) return;

    setIsUploading(true);
    setUploadNotice(`Watermarking & processing ${rawFiles.length} photos...`);

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
      addToast(`Added ${urls.length} vehicle photo URLs to vault`, "success");
    }
  };

  const handleLoadSample40Photos = () => {
    setImages(SAMPLE_VEHICLE_PHOTOS_40);
    addToast("Loaded 40+ curated high-res showcase photos", "success");
  };

  const handleSetPrimaryPhoto = (index: number) => {
    if (index === 0) return;
    const selected = images[index];
    const remaining = images.filter((_, i) => i !== index);
    setImages([selected, ...remaining]);
    addToast("Set as primary showroom showcase photo", "info");
  };

  const handleRemovePhoto = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    addToast("Photo removed from vehicle vault", "info");
  };

  // Step Validation Logic
  const validateStep = (stepIndex: number): boolean => {
    if (stepIndex === 0) {
      if (!formData.stockNumber.trim()) {
        addToast("Stock ID is required", "error");
        return false;
      }
      if (!formData.vin.trim() || formData.vin.length < 11) {
        addToast("A valid 17-character VIN is required", "error");
        return false;
      }
      if (!formData.make.trim() || !formData.model.trim()) {
        addToast("Vehicle Make and Model are required", "error");
        return false;
      }
      return true;
    }
    if (stepIndex === 1) {
      if (formData.mileage < 0) {
        addToast("Mileage must be a positive number", "error");
        return false;
      }
      if (!formData.customsClearance.trim()) {
        addToast("Customs clearance reference is required", "error");
        return false;
      }
      return true;
    }
    if (stepIndex === 2) {
      if (!formData.purchasePrice || formData.purchasePrice <= 0) {
        addToast("Purchase FOB Cost is required", "error");
        return false;
      }
      if (!formData.sellingPrice || formData.sellingPrice <= 0) {
        addToast("Target Selling Price is required", "error");
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(steps.length - 1, prev + 1));
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(0, prev - 1));
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex < activeStep || validateStep(activeStep)) {
      setActiveStep(stepIndex);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) {
      return;
    }

    try {
      await addVehicle({
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
      features: formData.features.split(",").map((f) => f.trim()).filter(Boolean),
      description: formData.description,
      descriptionDari: formData.descriptionDari,
      descriptionPashto: formData.descriptionPashto,
      conditionNotes: {
        exterior: "10/10 - Inspected on Herat Showroom Lot",
        interior: "Pristine Factory Leather & Upholstery",
        engine: "Zero-Hour Certified Powertrain Diagnostic",
        tires: "Original Factory Tires (95% Tread)",
        accidentHistory: "Clean Title Guaranteed (No Accidents)",
      },
      images: images.length > 0 ? images : [SAMPLE_VEHICLE_PHOTOS_40[0]],
      documents: [],
      });
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Unable to save vehicle intake", "error");
      return;
    }

    addToast(
      `✓ Successfully registered ${formData.make} ${formData.model} (${formData.stockNumber}) into showroom inventory!`,
      "success"
    );
    router.push("/inventory");
  };

  // Stepper Step configuration
  const steps = [
    {
      title: "Identification & VIN",
      desc: "Stock ID, VIN & Origin",
      icon: <Key className="h-4 w-4" />,
    },
    {
      title: "Technical Specs & Customs",
      desc: "Powertrain, Gomrok & Options",
      icon: <Truck className="h-4 w-4" />,
    },
    {
      title: "Landed Cost & Margins",
      desc: "FOB, Tariffs, Duties & Retail",
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      title: "Photo Vault & Final Dossier",
      desc: "40+ Gallery & Pre-Commit Review",
      icon: <ImageIcon className="h-4 w-4" />,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 space-y-5 pb-16">
      {/* Architectural Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-3 border-b border-[#D8D5CD] dark:border-[#242A38]">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[#9A7515] dark:text-[#D4AF37] mb-1">
            <Link href="/" className="hover:underline">
              COCKPIT
            </Link>
            <span>/</span>
            <Link href="/inventory" className="hover:underline">
              INVENTORY
            </Link>
            <span>/</span>
            <span>NEW CHASSIS INTAKE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Vehicle Stock Intake & 4-Step Dossier Studio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Register new arrivals, run ultrasonic paint & chassis diagnostics, calculate landed Gomrok tariffs, and attach watermarked showroom photography.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleQuickPopulateSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#C59B27]/50 bg-[#C59B27]/10 hover:bg-[#C59B27]/20 text-[11px] font-mono font-bold uppercase tracking-wider text-[#9A7515] dark:text-[#D4AF37] transition-colors cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Load Sample LC300 VXR
          </button>

          <Link
            href="/inventory"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#D8D5CD] dark:border-[#242A38] bg-white dark:bg-[#141821] text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:border-slate-400 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Cancel
          </Link>
        </div>
      </div>

      {/* Architectural 1px Hairline 4-Step Progress Matrix */}
      <div className="rounded-md border border-[#D8D5CD] dark:border-[#242A38] bg-[#D8D5CD] dark:bg-[#242A38] grid grid-cols-1 sm:grid-cols-4 gap-px overflow-hidden">
        {steps.map((step, index) => {
          const isCompleted = index < activeStep;
          const isCurrent = index === activeStep;

          return (
            <button
              key={step.title}
              type="button"
              onClick={() => handleStepClick(index)}
              className={`p-3.5 text-left transition-colors flex items-center justify-between cursor-pointer ${
                isCurrent
                  ? "bg-[#111318] text-white dark:bg-[#181D28]"
                  : isCompleted
                  ? "bg-[#FAF9F6] dark:bg-[#141821] text-slate-900 dark:text-white hover:bg-white"
                  : "bg-white dark:bg-[#11141B] text-slate-400 hover:bg-[#FAF9F6] dark:hover:bg-[#141821]"
              }`}
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-widest ${
                      isCurrent
                        ? "text-[#D4AF37]"
                        : isCompleted
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-400"
                    }`}
                  >
                    STEP 0{index + 1}
                  </span>
                  {isCompleted && <Check className="h-3 w-3 text-emerald-500 shrink-0" />}
                </div>
                <div
                  className={`text-xs font-bold truncate mt-0.5 ${
                    isCurrent
                      ? "text-white"
                      : isCompleted
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-500"
                  }`}
                >
                  {step.title}
                </div>
                <div
                  className={`text-[10px] truncate ${
                    isCurrent ? "text-slate-300" : "text-slate-400"
                  }`}
                >
                  {step.desc}
                </div>
              </div>
              <div
                className={`h-7 w-7 rounded flex items-center justify-center font-mono text-xs font-bold shrink-0 border ${
                  isCurrent
                    ? "bg-[#C59B27] text-[#0A0C10] border-[#C59B27]"
                    : isCompleted
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    : "bg-[#F4F3EF] dark:bg-[#161B24] text-slate-400 border-[#D8D5CD] dark:border-[#242A38]"
                }`}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : `0${index + 1}`}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Step Content Form Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Active Step Form (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* STEP 0: Vehicle Identification & Auto-VIN Decoder */}
          {activeStep === 0 && (
            <div className="rounded-md border border-[#D8D5CD] dark:border-[#242A38] bg-white dark:bg-[#11141B] p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E4DD] dark:border-[#1E2330]">
                <div className="flex items-center gap-2.5">
                  <span className="h-6 w-6 rounded bg-[#111318] text-[#D4AF37] dark:bg-[#C59B27] dark:text-[#0A0C10] flex items-center justify-center font-mono font-bold text-xs">
                    01
                  </span>
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Vehicle Identification & Optical VIN Decoder
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Chassis verification, stock allocation, and showroom lot registry.
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#F4F3EF] dark:bg-[#181D28] text-slate-700 dark:text-slate-300 border border-[#D8D5CD] dark:border-[#242A38]">
                  Step 01 / 04
                </span>
              </div>

              {/* Stock ID, VIN & Yard Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <MuiTextField
                  label="Stock Inventory ID"
                  sizeVariant="small"
                  value={formData.stockNumber}
                  onChange={(e) => setFormData({ ...formData, stockNumber: e.target.value })}
                  helperText="Showroom internal tracking code"
                  endAdornment={
                    <IconButton
                      size="small"
                      onClick={handleGenerateStockNumber}
                      title="Generate new stock ID"
                      sx={{ p: 0.5 }}
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-blue-600" />
                    </IconButton>
                  }
                  required
                />

                <MuiTextField
                  label="Chassis VIN Number"
                  sizeVariant="small"
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                  helperText="17-character ISO chassis number"
                  startAdornment={<Key className="h-3.5 w-3.5 text-slate-400" />}
                  endAdornment={
                    <button
                      type="button"
                      onClick={handleAutoDecode}
                      disabled={isDecoding}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer disabled:opacity-50"
                    >
                      <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      {isDecoding ? "..." : "Decode"}
                    </button>
                  }
                  required
                />

                <MuiTextField
                  select
                  label="Showroom Yard Bay"
                  sizeVariant="small"
                  value={formData.yardLocation}
                  onChange={(e) => setFormData({ ...formData, yardLocation: e.target.value })}
                  helperText="Current physical parking position"
                >
                  <MenuItem value="Main Showroom - Bagh-e-Azadi">Main Showroom - Bagh-e-Azadi</MenuItem>
                  <MenuItem value="VIP Covered Bay - Showroom 1">VIP Covered Bay - Showroom 1</MenuItem>
                  <MenuItem value="Holding Yard - Islam Qala Border">Holding Yard - Islam Qala Border</MenuItem>
                  <MenuItem value="Herat Customs Dry Port (Gomrok)">Herat Customs Dry Port (Gomrok)</MenuItem>
                  <MenuItem value="Detailing & PDI Wash Bay">Detailing & PDI Wash Bay</MenuItem>
                </MuiTextField>
              </div>

              {/* Make, Model, Year, Trim */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                <MuiTextField
                  select
                  label="Make / Manufacturer"
                  sizeVariant="small"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  required
                >
                  <MenuItem value="Toyota">Toyota (تویوتا)</MenuItem>
                  <MenuItem value="Lexus">Lexus (لکسس)</MenuItem>
                  <MenuItem value="Mercedes-Benz">Mercedes-Benz (مرسدس)</MenuItem>
                  <MenuItem value="Land Rover">Land Rover (لندروور)</MenuItem>
                  <MenuItem value="Hyundai">Hyundai (هیوندای)</MenuItem>
                  <MenuItem value="Kia">Kia (کیا)</MenuItem>
                  <MenuItem value="Nissan">Nissan (نیسان)</MenuItem>
                  <MenuItem value="BMW">BMW (بی‌ام‌و)</MenuItem>
                </MuiTextField>

                <MuiTextField
                  label="Model"
                  sizeVariant="small"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="e.g. Land Cruiser 300"
                  required
                />

                <MuiTextField
                  label="Model Year"
                  type="number"
                  sizeVariant="small"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                  required
                />

                <MuiTextField
                  label="Trim / Edition"
                  sizeVariant="small"
                  value={formData.trim}
                  onChange={(e) => setFormData({ ...formData, trim: e.target.value })}
                  placeholder="e.g. VXR / GR-Sport"
                  required
                />
              </div>

              {/* Body Style, Origin Country, Paint Color, Initial Status */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                <MuiTextField
                  select
                  label="Body Style"
                  sizeVariant="small"
                  value={formData.bodyType}
                  onChange={(e) => setFormData({ ...formData, bodyType: e.target.value as any })}
                >
                  <MenuItem value="SUV">SUV (شاسی بلند)</MenuItem>
                  <MenuItem value="Sedan">Sedan (سدان)</MenuItem>
                  <MenuItem value="Pickup Truck">Pickup Truck (پیک‌آپ)</MenuItem>
                  <MenuItem value="Coupe">Coupe (کوپه)</MenuItem>
                  <MenuItem value="Van">Van / Microbus</MenuItem>
                </MuiTextField>

                <MuiTextField
                  select
                  label="Country of Origin"
                  sizeVariant="small"
                  value={formData.originCountry}
                  onChange={(e) => setFormData({ ...formData, originCountry: e.target.value as any })}
                >
                  <MenuItem value="UAE">🇦🇪 UAE / Dubai (Jebel Ali)</MenuItem>
                  <MenuItem value="Japan">🇯🇵 Japan (Yokohama)</MenuItem>
                  <MenuItem value="USA">🇺🇸 USA (Houston/Savannah)</MenuItem>
                  <MenuItem value="Canada">🇨🇦 Canada</MenuItem>
                  <MenuItem value="Germany">🇩🇪 Germany (Hamburg)</MenuItem>
                  <MenuItem value="Korea">🇰🇷 South Korea (Incheon)</MenuItem>
                </MuiTextField>

                <MuiTextField
                  label="Exterior Paint Color"
                  sizeVariant="small"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="e.g. Pearl White"
                  required
                />

                <MuiTextField
                  select
                  label="Inventory Status"
                  sizeVariant="small"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <MenuItem value="Available on Lot">Available on Lot</MenuItem>
                  <MenuItem value="In Transit">In Transit</MenuItem>
                  <MenuItem value="Under Prep/Maintenance">Under Prep</MenuItem>
                  <MenuItem value="Reserved/Deposit Paid">Reserved</MenuItem>
                </MuiTextField>
              </div>
            </div>
          )}

          {/* STEP 1: Technical Specs, Customs Maktoub, Ultrasonic Paint & Bilingual Descriptions */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="rounded-md border border-[#D8D5CD] dark:border-[#242A38] bg-white dark:bg-[#11141B] p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E6E4DD] dark:border-[#1E2330]">
                  <div className="flex items-center gap-2.5">
                    <span className="h-6 w-6 rounded bg-[#111318] text-[#D4AF37] dark:bg-[#C59B27] dark:text-[#0A0C10] flex items-center justify-center font-mono font-bold text-xs">
                      02
                    </span>
                    <div>
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        Technical Specs, Customs Maktoub & Descriptions
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Powertrain specifications, Islam Qala clearance documents, and multilingual descriptions.
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#F4F3EF] dark:bg-[#181D28] text-slate-700 dark:text-slate-300 border border-[#D8D5CD] dark:border-[#242A38]">
                    Step 02 / 04
                  </span>
                </div>

                {/* Powertrain Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                  <MuiTextField
                    label="Odometer Mileage"
                    type="number"
                    sizeVariant="small"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: Number(e.target.value) })}
                    endAdornment={<InputAdornment position="end">KM</InputAdornment>}
                    required
                  />

                  <MuiTextField
                    select
                    label="Steering Configuration"
                    sizeVariant="small"
                    value={formData.steering}
                    onChange={(e) => setFormData({ ...formData, steering: e.target.value as any })}
                  >
                    <MenuItem value="Left-Hand Drive (LHD)">Left-Hand Drive (دست چپ)</MenuItem>
                    <MenuItem value="Right-Hand Drive (RHD Converted)">RHD Converted</MenuItem>
                  </MuiTextField>

                  <MuiTextField
                    select
                    label="Fuel Type"
                    sizeVariant="small"
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as any })}
                  >
                    <MenuItem value="Petrol">Petrol (بنزین)</MenuItem>
                    <MenuItem value="Diesel">Diesel (دیزل)</MenuItem>
                    <MenuItem value="Hybrid">Hybrid (هایبرید - ۳۰٪ تخفیف)</MenuItem>
                    <MenuItem value="Electric">Electric (برقی)</MenuItem>
                  </MuiTextField>

                  <MuiTextField
                    select
                    label="Transmission"
                    sizeVariant="small"
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value as any })}
                  >
                    <MenuItem value="Automatic">Automatic (اتومات)</MenuItem>
                    <MenuItem value="Manual">Manual (دستی)</MenuItem>
                  </MuiTextField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <MuiTextField
                    select
                    label="Drivetrain"
                    sizeVariant="small"
                    value={formData.driveType}
                    onChange={(e) => setFormData({ ...formData, driveType: e.target.value as any })}
                  >
                    <MenuItem value="4WD">4WD (چهار چرخ محرک)</MenuItem>
                    <MenuItem value="AWD">AWD (تمام چرخ محرک)</MenuItem>
                    <MenuItem value="RWD">RWD (دیفرنسیال عقب)</MenuItem>
                    <MenuItem value="FWD">FWD (دیفرنسیال جلو)</MenuItem>
                  </MuiTextField>

                  <div className="sm:col-span-2">
                    <MuiTextField
                      label="Islam Qala Customs Clearance Maktoub"
                      sizeVariant="small"
                      value={formData.customsClearance}
                      onChange={(e) => setFormData({ ...formData, customsClearance: e.target.value })}
                      helperText="Official Afghan MoF customs clearance document / maktoub ID"
                      required
                    />
                  </div>
                </div>

                {/* Interactive Features Chips */}
                <div className="space-y-2 pt-2 border-t border-[#E6E4DD] dark:border-[#1E2330]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Equipped Factory Features & Options:
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Click tag to toggle feature
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_VEHICLE_FEATURES.map((feat) => {
                      const isSelected = currentFeaturesArray.includes(feat);
                      return (
                        <button
                          key={feat}
                          type="button"
                          onClick={() => toggleFeature(feat)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
                            isSelected
                              ? "bg-[#111318] text-white border-[#111318] dark:bg-[#C59B27] dark:text-[#0A0C10] dark:border-[#C59B27] font-bold"
                              : "bg-[#FAF9F6] dark:bg-[#141821] text-slate-600 dark:text-slate-400 border-[#D8D5CD] dark:border-[#242A38] hover:border-slate-400"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 shrink-0" />}
                          <span>{feat}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Trilingual Afghan Descriptions */}
                <div className="space-y-3 pt-3 border-t border-[#E6E4DD] dark:border-[#1E2330]">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    <Languages className="h-4 w-4 text-[#C59B27]" />
                    <span>Trilingual Afghan Showroom Descriptions</span>
                  </div>

                  <MuiTextField
                    label="English Commercial Description"
                    sizeVariant="small"
                    multiline
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Official showroom catalog description..."
                  />

                  <MuiTextField
                    label="توضیحات موتر به زبان دری (جهت درج در قباله و استعلامات)"
                    sizeVariant="small"
                    multiline
                    rows={2}
                    dir="rtl"
                    value={formData.descriptionDari}
                    onChange={(e) => setFormData({ ...formData, descriptionDari: e.target.value })}
                    placeholder="مشخصات و آپشن‌ها به زبان دری..."
                  />

                  <MuiTextField
                    label="د موټر بشپړ معلومات په پښتو ژبه"
                    sizeVariant="small"
                    multiline
                    rows={2}
                    dir="rtl"
                    value={formData.descriptionPashto}
                    onChange={(e) => setFormData({ ...formData, descriptionPashto: e.target.value })}
                    placeholder="د موټر مشخصات په پښتو ژبه..."
                  />
                </div>
              </div>

              {/* Ultrasonic Paint & Body-Panel Inspection Diagram during Intake */}
              <PaintInspectionDiagram
                vin={formData.vin}
                cleanTitle={formData.cleanTitle}
                editable={true}
              />
            </div>
          )}

          {/* STEP 2: Landed Cost & Profit Margin Engine */}
          {activeStep === 2 && (
            <div className="rounded-md border border-[#D8D5CD] dark:border-[#242A38] bg-white dark:bg-[#11141B] p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E4DD] dark:border-[#1E2330]">
                <div className="flex items-center gap-2.5">
                  <span className="h-6 w-6 rounded bg-[#111318] text-[#D4AF37] dark:bg-[#C59B27] dark:text-[#0A0C10] flex items-center justify-center font-mono font-bold text-xs">
                    03
                  </span>
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Landed Cost & Profit Margin Engine
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      FOB purchase costs, ocean freight, customs tariffs, and target dealership margins.
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#F4F3EF] dark:bg-[#181D28] text-slate-700 dark:text-slate-300 border border-[#D8D5CD] dark:border-[#242A38]">
                  Step 03 / 04
                </span>
              </div>

              {/* 4 Cost Components Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <MuiTextField
                  label="FOB Purchase Price (USD Port)"
                  type="number"
                  sizeVariant="small"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                  startAdornment={<DollarSign className="h-3.5 w-3.5 text-slate-400" />}
                  helperText={`≈ ${(formData.purchasePrice * exchangeRate).toLocaleString()} AFN`}
                  required
                />

                <MuiTextField
                  label="Freight & Shipping Cost (USD)"
                  type="number"
                  sizeVariant="small"
                  value={formData.freightCost}
                  onChange={(e) => setFormData({ ...formData, freightCost: Number(e.target.value) })}
                  startAdornment={<DollarSign className="h-3.5 w-3.5 text-slate-400" />}
                  helperText={`≈ ${(formData.freightCost * exchangeRate).toLocaleString()} AFN`}
                  required
                />

                <MuiTextField
                  label="Islam Qala Customs Tariff / Gomrok (USD)"
                  type="number"
                  sizeVariant="small"
                  value={formData.customsDuty}
                  onChange={(e) => setFormData({ ...formData, customsDuty: Number(e.target.value) })}
                  startAdornment={<DollarSign className="h-3.5 w-3.5 text-slate-400" />}
                  helperText={`≈ ${(formData.customsDuty * exchangeRate).toLocaleString()} AFN`}
                  required
                />

                <MuiTextField
                  label="PDI Prep, Detailing & Repairs (USD)"
                  type="number"
                  sizeVariant="small"
                  value={formData.repairCost}
                  onChange={(e) => setFormData({ ...formData, repairCost: Number(e.target.value) })}
                  startAdornment={<DollarSign className="h-3.5 w-3.5 text-slate-400" />}
                  helperText={`≈ ${(formData.repairCost * exchangeRate).toLocaleString()} AFN`}
                  required
                />
              </div>

              {/* Selling Price Box */}
              <div className="p-4 rounded border border-[#D8D5CD] dark:border-[#242A38] bg-[#FAF9F6] dark:bg-[#141821] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block mb-0.5">
                      Target Showroom Selling Price (USD)
                    </label>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Equivalent to: ؋ {Math.round(formData.sellingPrice * exchangeRate).toLocaleString()} AFN
                    </span>
                  </div>
                  <div className="w-full sm:w-64">
                    <MuiTextField
                      type="number"
                      sizeVariant="small"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                      startAdornment={<DollarSign className="h-4 w-4 text-emerald-600 font-bold" />}
                      required
                    />
                  </div>
                </div>

                {/* Live Margin & Landed 1px Hairline Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#D8D5CD] dark:bg-[#242A38] border border-[#D8D5CD] dark:border-[#242A38] rounded overflow-hidden text-xs">
                  <div className="p-3 bg-white dark:bg-[#11141B]">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">
                      Total Landed Cost
                    </span>
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white tabular-nums mt-0.5 block">
                      ${totalLandedCost.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-[#11141B]">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">
                      Projected Profit
                    </span>
                    <span
                      className={`font-mono font-bold text-sm tabular-nums mt-0.5 block ${
                        estimatedProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"
                      }`}
                    >
                      {estimatedProfit >= 0 ? "+" : ""}${estimatedProfit.toLocaleString()} USD
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-[#11141B]">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">
                      Gross Margin (%)
                    </span>
                    <span
                      className={`font-mono font-bold text-sm tabular-nums mt-0.5 block ${
                        Number(marginPercent) >= 15
                          ? "text-emerald-600 dark:text-emerald-400"
                          : Number(marginPercent) > 0
                          ? "text-amber-600"
                          : "text-rose-600"
                      }`}
                    >
                      {marginPercent}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: 40+ Photo Vault & Final Dossier Review */}
          {activeStep === 3 && (
            <div className="space-y-5">
              {/* Photo Vault Card */}
              <div className="rounded-md border border-[#D8D5CD] dark:border-[#242A38] bg-white dark:bg-[#11141B] p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E6E4DD] dark:border-[#1E2330]">
                  <div className="flex items-center gap-2.5">
                    <span className="h-6 w-6 rounded bg-[#111318] text-[#D4AF37] dark:bg-[#C59B27] dark:text-[#0A0C10] flex items-center justify-center font-mono font-bold text-xs">
                      04
                    </span>
                    <div>
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        40+ Vehicle Photo Vault ({images.length} Loaded)
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Upload high-resolution photography with automatic dealer watermarks.
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    Final Step
                  </span>
                </div>

                {/* Upload Toolbar */}
                <div className="flex flex-wrap items-center gap-2">
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
                    sx={{ fontSize: "11px", py: "4px" }}
                  >
                    Upload Files
                  </MuiButton>

                  <MuiButton
                    type="button"
                    variant="outlined"
                    color="secondary"
                    size="small"
                    onClick={handleLoadSample40Photos}
                    startIcon={<Sparkles className="h-3.5 w-3.5" />}
                    sx={{ fontSize: "11px", py: "4px" }}
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
                    sx={{ fontSize: "11px", py: "4px" }}
                  >
                    Bulk URLs
                  </MuiButton>
                </div>

                {/* Watermark toggle */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={applyWatermark}
                      onChange={(e) => setApplyWatermark(e.target.checked)}
                      color="primary"
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontSize: "12px", color: "text.secondary" }}>
                      Watermark &apos;Sadozai Motors Herat&apos; showroom stamp on uploaded photos
                    </Typography>
                  }
                />

                {uploadNotice && (
                  <Alert severity="info" sx={{ py: 0.5, fontSize: "11px" }}>
                    {uploadNotice}
                  </Alert>
                )}

                {/* Bulk URL Panel */}
                {isBulkOpen && (
                  <div className="p-3 rounded bg-[#FAF9F6] dark:bg-[#141821] border border-[#D8D5CD] dark:border-[#242A38] space-y-2">
                    <MuiTextField
                      label="Paste photo image URLs (one per line)"
                      multiline
                      rows={3}
                      sizeVariant="small"
                      value={bulkUrlInput}
                      onChange={(e) => setBulkUrlInput(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <MuiButton
                        variant="contained"
                        size="small"
                        onClick={handleAddBulkUrls}
                        sx={{ fontSize: "11px", py: "2px" }}
                      >
                        Append URLs
                      </MuiButton>
                    </div>
                  </div>
                )}

                {/* Photo Grid Gallery */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-80 overflow-y-auto p-1">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative aspect-[16/10] rounded overflow-hidden border group ${
                        idx === 0
                          ? "border-[#C59B27] ring-2 ring-[#C59B27]/30"
                          : "border-[#D8D5CD] dark:border-[#242A38]"
                      }`}
                    >
                      <Image src={img} alt={`Photo ${idx + 1}`} fill className="object-cover" />

                      {idx === 0 && (
                        <div className="absolute top-1 left-1 bg-[#111318] text-[#D4AF37] px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase">
                          Cover
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        <IconButton
                          size="small"
                          onClick={() => handleSetPrimaryPhoto(idx)}
                          className="!text-white hover:!bg-white/20"
                          title="Set as Cover"
                        >
                          <Star className={`h-3.5 w-3.5 ${idx === 0 ? "fill-amber-400 text-amber-400" : ""}`} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRemovePhoto(idx)}
                          className="!text-white hover:!bg-red-500/50"
                          title="Remove Photo"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </IconButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pre-Submission Final Dossier Audit Card */}
              <div className="rounded-md border border-[#D8D5CD] dark:border-[#242A38] bg-white dark:bg-[#11141B] overflow-hidden">
                <div className="px-4 py-2.5 bg-[#FAF9F6] dark:bg-[#141821] border-b border-[#D8D5CD] dark:border-[#242A38] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="text-[11px] font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Pre-Submission Dossier Audit
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Ready for catalog publication</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#D8D5CD] dark:bg-[#242A38] text-xs">
                  <div className="p-3 bg-white dark:bg-[#11141B]">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Vehicle</span>
                    <span className="font-bold text-slate-900 dark:text-white truncate block mt-0.5">
                      {formData.year} {formData.make} {formData.model}
                    </span>
                  </div>
                  <div className="p-3 bg-white dark:bg-[#11141B]">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Chassis / VIN</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white truncate block mt-0.5">
                      {formData.vin}
                    </span>
                  </div>
                  <div className="p-3 bg-white dark:bg-[#11141B]">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Landed Cost</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white block mt-0.5 tabular-nums">
                      ${totalLandedCost.toLocaleString()} USD
                    </span>
                  </div>
                  <div className="p-3 bg-white dark:bg-[#11141B]">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Retail Price</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5 tabular-nums">
                      ${formData.sellingPrice.toLocaleString()} USD
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons Strip */}
          <div className="flex items-center justify-between pt-2">
            <MuiButton
              type="button"
              variant="outlined"
              color="inherit"
              size="small"
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<ArrowLeft className="h-4 w-4" />}
              sx={{ fontSize: "11px", py: "4px" }}
            >
              Back
            </MuiButton>

            {activeStep < steps.length - 1 ? (
              <MuiButton
                type="button"
                variant="contained"
                color="primary"
                size="small"
                onClick={handleNext}
                endIcon={<ArrowRight className="h-4 w-4" />}
                sx={{ fontSize: "11px", py: "4px", px: "16px" }}
              >
                Continue to {steps[activeStep + 1].title.split("&")[0]}
              </MuiButton>
            ) : (
              <MuiButton
                type="button"
                variant="contained"
                color="success"
                size="small"
                onClick={() => handleSubmit()}
                startIcon={<CheckCircle2 className="h-4 w-4" />}
                sx={{ fontSize: "11px", py: "5px", px: "20px" }}
              >
                Register Vehicle & Commit to Lot
              </MuiButton>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Live Dossier Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-md border border-[#D8D5CD] dark:border-[#242A38] bg-white dark:bg-[#11141B] p-4 space-y-3 sticky top-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E6E4DD] dark:border-[#1E2330]">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Live Preview Dossier
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                {formData.status}
              </span>
            </div>

            {/* Thumbnail */}
            <div className="relative aspect-[16/10] w-full rounded overflow-hidden border border-[#D8D5CD] dark:border-[#242A38] bg-slate-100 dark:bg-slate-800">
              <Image
                src={images[0] || SAMPLE_VEHICLE_PHOTOS_40[0]}
                alt={formData.model}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-1.5 left-1.5 bg-[#0D0F14]/85 text-white px-2 py-0.5 rounded text-[9px] font-mono font-bold">
                {formData.stockNumber}
              </div>
              <div className="absolute top-1.5 right-1.5 bg-[#0D0F14]/85 text-[#D4AF37] px-2 py-0.5 rounded text-[9px] font-mono font-bold">
                {images.length} Photos
              </div>
            </div>

            {/* Vehicle Title & Trim */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {formData.year} {formData.make} {formData.model}
              </h3>
              <p className="text-[11px] text-slate-500 truncate">{formData.trim}</p>
            </div>

            {/* 1px Hairline Spec Matrix */}
            <div className="grid grid-cols-2 gap-px bg-[#D8D5CD] dark:bg-[#242A38] border border-[#D8D5CD] dark:border-[#242A38] rounded overflow-hidden text-[11px] font-mono">
              <div className="p-2 bg-[#FAF9F6] dark:bg-[#141821] flex items-center gap-1.5 truncate text-slate-700 dark:text-slate-300">
                <Gauge className="h-3 w-3 text-[#C59B27] shrink-0" />
                <span>{formData.mileage.toLocaleString()} KM</span>
              </div>
              <div className="p-2 bg-[#FAF9F6] dark:bg-[#141821] flex items-center gap-1.5 truncate text-slate-700 dark:text-slate-300">
                <Fuel className="h-3 w-3 text-[#C59B27] shrink-0" />
                <span>{formData.fuelType}</span>
              </div>
              <div className="p-2 bg-[#FAF9F6] dark:bg-[#141821] flex items-center gap-1.5 truncate text-slate-700 dark:text-slate-300">
                <Compass className="h-3 w-3 text-[#C59B27] shrink-0" />
                <span>{formData.driveType}</span>
              </div>
              <div className="p-2 bg-[#FAF9F6] dark:bg-[#141821] flex items-center gap-1.5 truncate text-slate-700 dark:text-slate-300">
                <Globe className="h-3 w-3 text-[#C59B27] shrink-0" />
                <span>{formData.originCountry}</span>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-3 rounded bg-[#FAF9F6] dark:bg-[#141821] border border-[#D8D5CD] dark:border-[#242A38] space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Retail Selling Price:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  ${formData.sellingPrice.toLocaleString()} USD
                </span>
              </div>
              <div className="flex justify-between text-[11px] font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                <span>Sarrafi Price:</span>
                <span>؋ {(formData.sellingPrice * exchangeRate).toLocaleString()} AFN</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 tabular-nums">
                <span>Total Landed:</span>
                <span className="font-mono">${totalLandedCost.toLocaleString()}</span>
              </div>
              <div className="pt-1.5 border-t border-[#E6E4DD] dark:border-[#1E2330] flex justify-between text-xs font-bold tabular-nums">
                <span className="text-slate-700 dark:text-slate-300">Projected Margin:</span>
                <span
                  className={`font-mono ${
                    estimatedProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"
                  }`}
                >
                  +${estimatedProfit.toLocaleString()} ({marginPercent}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
