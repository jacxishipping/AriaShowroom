"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShowroomStore } from "@/store/useShowroomStore";
import { SAMPLE_VEHICLE_PHOTOS_40 } from "@/lib/sample-photos";
import { processAndWatermarkImage } from "@/lib/watermark-utils";
import { translations } from "@/lib/translations";
import { decodeVin } from "@/lib/vin-decoder";
import {
  MuiButton,
  MuiTextField,
  MuiChip,
  MenuItem,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepButton,
} from "@/components/mui";
import {
  ArrowLeft,
  ArrowRight,
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
  Zap,
  Check,
  FileText,
  RotateCcw,
  Gauge,
  Fuel,
  Compass,
  AlertCircle,
} from "lucide-react";

export default function VehicleIntakePage() {
  const router = useRouter();
  const { addVehicle, addToast, language, exchangeRate } = useShowroomStore();
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isDecoding, setIsDecoding] = useState(false);

  const [formData, setFormData] = useState({
    stockNumber: `SM-HRT-${Math.floor(110 + Math.random() * 890)}`,
    vin: "JTMCY" + Math.random().toString(36).substring(2, 10).toUpperCase(),
    make: "Toyota",
    model: "Land Cruiser Prado",
    year: 2022,
    trim: "TXL V6 4.0L",
    bodyType: "SUV" as any,
    originCountry: "UAE" as any,
    steering: "Left-Hand Drive (LHD)" as any,
    customsClearance: "Gomrok Herat (Islam Qala) - Cleared",
    cleanTitle: true,
    mileage: 26000,
    fuelType: "Petrol" as any,
    transmission: "Automatic" as any,
    driveType: "4WD" as any,
    color: "Pearl White",
    status: "Available on Lot" as any,
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

  // Common quick features presets
  const availableFeatures = [
    "Cool Box",
    "4WD Diff-Lock",
    "Sunroof",
    "Leather Seats",
    "Push Start",
    "360 Camera",
    "Radar Cruise Control",
    "Heated Seats",
    "Power Tailgate",
    "Blind Spot Monitor",
    "Wireless Charger",
    "Apple CarPlay",
  ];

  const currentFeaturesArray = formData.features
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);

  const toggleFeature = (feature: string) => {
    let updated: string[];
    if (currentFeaturesArray.includes(feature)) {
      updated = currentFeaturesArray.filter((f) => f !== feature);
    } else {
      updated = [...currentFeaturesArray, feature];
    }
    setFormData({ ...formData, features: updated.join(", ") });
  };

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
    setUploadNotice(`Watermarking & Optimizing ${rawFiles.length} photos...`);

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

  const handleAutoDecode = async () => {
    if (!formData.vin || formData.vin.trim().length < 11) {
      addToast("Please enter a valid 17-character VIN number to decode specifications", "error");
      return;
    }

    setIsDecoding(true);
    try {
      const decoded = await decodeVin(formData.vin);
      if (decoded) {
        setFormData((prev) => ({
          ...prev,
          make: decoded.make || prev.make,
          model: decoded.model || prev.model,
          year: decoded.year || prev.year,
          trim: decoded.trim || prev.trim,
          bodyType: (decoded.bodyType as any) || prev.bodyType,
          fuelType: (decoded.fuelType as any) || prev.fuelType,
          transmission: (decoded.transmission as any) || prev.transmission,
          originCountry: (decoded.originCountry as any) || prev.originCountry,
          driveType: decoded.driveType || prev.driveType,
          description: `${decoded.year} ${decoded.make} ${decoded.model} ${decoded.trim}. Factory verified specifications. Imported with clean title and verified customs documents.`,
        }));

        addToast(
          `⚡ Decoded: ${decoded.year} ${decoded.make} ${decoded.model} (${decoded.originCountry}) specifications auto-populated!`,
          "success"
        );
      }
    } catch (err: any) {
      addToast(
        err?.message || "Could not automatically decode this VIN. You can still input specifications manually.",
        "error"
      );
    } finally {
      setIsDecoding(false);
    }
  };

  const handleGenerateStockNumber = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    setFormData((prev) => ({
      ...prev,
      stockNumber: `SM-HRT-${randomNum}`,
    }));
    addToast(`Generated stock ID: SM-HRT-${randomNum}`, "info");
  };

  const handleQuickPopulateSample = () => {
    setFormData({
      stockNumber: `SM-HRT-${Math.floor(100 + Math.random() * 900)}`,
      vin: "JTMHY" + Math.random().toString(36).substring(2, 10).toUpperCase(),
      make: "Toyota",
      model: "Land Cruiser 300",
      year: 2023,
      trim: "VXR Twin-Turbo 3.5L",
      bodyType: "SUV",
      originCountry: "UAE",
      steering: "Left-Hand Drive (LHD)",
      customsClearance: "Gomrok Herat (Islam Qala) - Maktoub Cleared",
      cleanTitle: true,
      mileage: 18000,
      fuelType: "Petrol",
      transmission: "Automatic",
      driveType: "4WD",
      color: "Pearl White Crystal",
      status: "Available on Lot",
      yardLocation: "Main Showroom - Bagh-e-Azadi",
      purchasePrice: 78000,
      freightCost: 2200,
      customsDuty: 8500,
      repairCost: 500,
      sellingPrice: 99500,
      features: "Cool Box, 4WD Diff-Lock, Sunroof, Leather Seats, 360 Camera, Radar Cruise Control, Heated Seats, Power Tailgate",
      description: "2023 Toyota Land Cruiser 300 VXR Twin Turbo direct Dubai import. Immaculate showroom lot condition with verified customs clearance.",
      descriptionDari: "تویوتا لندکروزر ۳۰۰ مدل ۲۰۲۳ فول آپشن وارداتی خلیج، بدون رنگ و خط و خش، محصول کامل گمرک اسلام قلعه.",
      descriptionPashto: "تویوټا لینډکروزر ۳۰۰ ماډل ۲۰۲۳ فول آفشن خلیجي واردات، بې رنګه او بې ټکره د هرات اسلام قلعه ګمرک محصول شوی.",
    });
    setImages(SAMPLE_VEHICLE_PHOTOS_40);
    addToast("⚡ Sample Toyota Land Cruiser 300 VXR loaded into intake form!", "success");
  };

  const validateStep = (stepIndex: number): boolean => {
    if (stepIndex === 0) {
      if (!formData.stockNumber.trim()) {
        addToast("Stock Number is required", "error");
        return false;
      }
      if (!formData.vin.trim()) {
        addToast("VIN / Chassis number is required", "error");
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
      return true;
    }
    if (stepIndex === 2) {
      if (!formData.purchasePrice || formData.purchasePrice <= 0) {
        addToast("Purchase Price is required", "error");
        return false;
      }
      if (!formData.sellingPrice || formData.sellingPrice <= 0) {
        addToast("Selling Price is required", "error");
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

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) {
      return;
    }

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
      features: formData.features.split(",").map((f) => f.trim()).filter(Boolean),
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

  // Stepper Step configuration
  const steps = [
    {
      title: "Vehicle Identification",
      desc: "Stock ID, VIN & Model",
      icon: <ShieldCheck className="h-4 w-4" />,
    },
    {
      title: "Technical Specs & Customs",
      desc: "Chassis, Maktoub & Options",
      icon: <Truck className="h-4 w-4" />,
    },
    {
      title: "Landed Cost & Margins",
      desc: "FOB, Freight, Duties & Price",
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      title: "Photo Vault & Review",
      desc: "40+ Gallery & Final Dossier",
      icon: <ImageIcon className="h-4 w-4" />,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 space-y-5 pb-16">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200/90 dark:border-slate-800/90">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-0.5">
            <Link href="/" className="hover:text-primary transition-colors">
              Cockpit
            </Link>
            <span>/</span>
            <Link href="/inventory" className="hover:text-primary transition-colors">
              Inventory
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">
              Vehicle Intake
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            Vehicle Stock Intake & 40+ Photo Vault
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Register new arrival, calculate landed cost & customs tariffs, and attach watermarked showroom photography.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleQuickPopulateSample}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer"
            title="Pre-fill with Toyota Land Cruiser sample data"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Load Sample LC300</span>
          </button>

          <MuiButton
            component={Link}
            href="/inventory"
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<ArrowLeft className="h-3.5 w-3.5" />}
          >
            Cancel
          </MuiButton>
        </div>
      </div>

      {/* Modern Multi-Step Stepper Navigation Bar */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#121824] p-3 sm:p-4 shadow-xs">
        {/* MUI Stepper */}
        <Stepper activeStep={activeStep} alternativeLabel className="w-full">
          {steps.map((step, index) => {
            const isCompleted = index < activeStep;
            const isCurrent = index === activeStep;
            return (
              <Step key={step.title} completed={isCompleted}>
                <StepButton onClick={() => handleStepClick(index)}>
                  <StepLabel
                    icon={
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                          isCompleted
                            ? "bg-emerald-600 text-white shadow-xs"
                            : isCurrent
                            ? "bg-blue-600 text-white shadow-md ring-4 ring-blue-500/20"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                      </div>
                    }
                  >
                    <div className="text-center mt-1">
                      <div
                        className={`text-xs font-bold ${
                          isCurrent
                            ? "text-blue-600 dark:text-blue-400"
                            : isCompleted
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-400"
                        }`}
                      >
                        {step.title}
                      </div>
                      <div className="text-[10px] text-slate-400 hidden sm:block">
                        {step.desc}
                      </div>
                    </div>
                  </StepLabel>
                </StepButton>
              </Step>
            );
          })}
        </Stepper>

        {/* Step Progress Bar */}
        <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Step Content Form Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Active Step Form (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* STEP 0: Vehicle Identification & Auto-VIN Decoder */}
          {activeStep === 0 && (
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#121824] p-5 shadow-xs space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Vehicle Identification & VIN Decoder
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Chassis verification, stock allocation and showroom lot registry.
                    </p>
                  </div>
                </div>
                <MuiChip label="Step 1 of 4" size="small" color="primary" />
              </div>

              {/* Stock ID & VIN Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <MuiTextField
                    label="Stock Number"
                    sizeVariant="small"
                    value={formData.stockNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, stockNumber: e.target.value })
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={handleGenerateStockNumber}
                    className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    <span>Regenerate Stock ID</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <MuiTextField
                    label="Chassis / VIN Number"
                    sizeVariant="small"
                    fullWidth
                    value={formData.vin}
                    onChange={(e) =>
                      setFormData({ ...formData, vin: e.target.value.toUpperCase() })
                    }
                    required
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-mono">17-Char Standard</span>
                    <button
                      type="button"
                      onClick={handleAutoDecode}
                      disabled={isDecoding}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer disabled:opacity-50"
                    >
                      <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
                      {isDecoding ? "Decoding..." : "⚡ Auto-Decode"}
                    </button>
                  </div>
                </div>

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

              {/* Make, Model, Year, Trim */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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

              {/* Body, Origin, Color, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
                  label="Color / Paint Finish"
                  sizeVariant="small"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  required
                />

                <MuiTextField
                  select
                  label="Inventory Status"
                  sizeVariant="small"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as any })
                  }
                >
                  <MenuItem value="Available on Lot">Available on Lot</MenuItem>
                  <MenuItem value="In Transit">In Transit</MenuItem>
                  <MenuItem value="Under Prep/Maintenance">Under Prep</MenuItem>
                  <MenuItem value="Reserved/Deposit Paid">Reserved</MenuItem>
                </MuiTextField>
              </div>
            </div>
          )}

          {/* STEP 1: Technical Specs, Customs Maktoub & Bilingual Descriptions */}
          {activeStep === 1 && (
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#121824] p-5 shadow-xs space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Technical Specifications & Afghan Customs Maktoub
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Powertrain specifications, clearance documents, options and descriptions.
                    </p>
                  </div>
                </div>
                <MuiChip label="Step 2 of 4" size="small" color="success" />
              </div>

              {/* Powertrain & Mechanical Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
                  <MenuItem value="Left-Hand Drive (LHD)">Left-Hand Drive (دست چپ)</MenuItem>
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
                  <MenuItem value="Petrol">Petrol (بنزین)</MenuItem>
                  <MenuItem value="Diesel">Diesel (دیزل)</MenuItem>
                  <MenuItem value="Hybrid">Hybrid (هایبرید)</MenuItem>
                  <MenuItem value="Electric">Electric (برقی)</MenuItem>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

                <div className="sm:col-span-2">
                  <MuiTextField
                    label="Gomrok Customs Clearance Maktoub"
                    sizeVariant="small"
                    value={formData.customsClearance}
                    onChange={(e) =>
                      setFormData({ ...formData, customsClearance: e.target.value })
                    }
                    fullWidth
                    required
                  />
                </div>
              </div>

              {/* Standard & Luxury Options Picker */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Quick Options & Features Presets:
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Click to toggle equipped features
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {availableFeatures.map((feat) => {
                    const isSelected = currentFeaturesArray.includes(feat);
                    return (
                      <button
                        key={feat}
                        type="button"
                        onClick={() => toggleFeature(feat)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-2xs font-semibold"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {isSelected ? `✓ ${feat}` : `+ ${feat}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Trilingual Afghan Descriptions */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Trilingual Afghan Showroom Descriptions
                </h4>
                <MuiTextField
                  label="English Marketing Description"
                  sizeVariant="small"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  fullWidth
                />
                <MuiTextField
                  label="توضیحات موتر به زبان دری (جهت درج در قباله و اعلان)"
                  sizeVariant="small"
                  dir="rtl"
                  value={formData.descriptionDari}
                  onChange={(e) =>
                    setFormData({ ...formData, descriptionDari: e.target.value })
                  }
                  fullWidth
                />
                <MuiTextField
                  label="د موټر بشپړ معلومات په پښتو ژبه"
                  sizeVariant="small"
                  dir="rtl"
                  value={formData.descriptionPashto}
                  onChange={(e) =>
                    setFormData({ ...formData, descriptionPashto: e.target.value })
                  }
                  fullWidth
                />
              </div>
            </div>
          )}

          {/* STEP 2: Landed Cost & Profit Margin Engine */}
          {activeStep === 2 && (
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#121824] p-5 shadow-xs space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Landed Cost & Profit Margin Engine
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Calculate import transit tariffs, total landed investment, and target profit.
                    </p>
                  </div>
                </div>
                <MuiChip label="Step 3 of 4" size="small" color="secondary" />
              </div>

              {/* 4 Cost Components Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MuiTextField
                  label="FOB Purchase Cost (USD Dubai/Port)"
                  type="number"
                  sizeVariant="small"
                  value={formData.purchasePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, purchasePrice: Number(e.target.value) })
                  }
                  startAdornment={<DollarSign className="h-3.5 w-3.5 text-slate-400" />}
                  required
                />

                <MuiTextField
                  label="Ocean & Freight Shipping (USD)"
                  type="number"
                  sizeVariant="small"
                  value={formData.freightCost}
                  onChange={(e) =>
                    setFormData({ ...formData, freightCost: Number(e.target.value) })
                  }
                  startAdornment={<DollarSign className="h-3.5 w-3.5 text-slate-400" />}
                  required
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
                  required
                />

                <MuiTextField
                  label="PDI Prep, Detailing & Repairs (USD)"
                  type="number"
                  sizeVariant="small"
                  value={formData.repairCost}
                  onChange={(e) =>
                    setFormData({ ...formData, repairCost: Number(e.target.value) })
                  }
                  startAdornment={<DollarSign className="h-3.5 w-3.5 text-slate-400" />}
                  required
                />
              </div>

              {/* Selling Price Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block mb-1">
                      Target Showroom Selling Price (USD)
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Equivalent to ؋ {Math.round(formData.sellingPrice * exchangeRate).toLocaleString()} AFN
                    </span>
                  </div>
                  <div className="w-full sm:w-60">
                    <MuiTextField
                      type="number"
                      sizeVariant="small"
                      value={formData.sellingPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, sellingPrice: Number(e.target.value) })
                      }
                      startAdornment={<DollarSign className="h-4 w-4 text-emerald-600" />}
                      required
                    />
                  </div>
                </div>

                {/* Live Margin & Landed Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-[#151D2A] border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      Total Landed Cost
                    </span>
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      ${totalLandedCost.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-[#151D2A] border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      Estimated Profit
                    </span>
                    <span
                      className={`font-mono font-bold text-sm ${
                        estimatedProfit >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {estimatedProfit >= 0 ? "+" : ""}${estimatedProfit.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-[#151D2A] border border-slate-200/80 dark:border-slate-800 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      Gross Margin
                    </span>
                    <span
                      className={`font-mono font-bold text-sm ${
                        Number(marginPercent) >= 15
                          ? "text-emerald-600"
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
            <div className="space-y-5 animate-in fade-in">
              {/* Photo Vault Card */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#121824] p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
                      4
                    </span>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        40+ Vehicle Photo Vault ({images.length} Loaded)
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Upload high-resolution album photography with automatic dealer watermarks.
                      </p>
                    </div>
                  </div>
                  <MuiChip label="Final Step" size="small" color="secondary" />
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
                  >
                    Upload Files
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
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 max-h-64 overflow-y-auto p-1.5 border border-slate-100 dark:border-slate-800 rounded-xl">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900"
                    >
                      <Image
                        src={img}
                        alt={`Photo ${idx + 1}`}
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
                            title="Make primary photo"
                          >
                            <Star className="h-3.5 w-3.5" />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => handleRemovePhoto(idx)}
                          className="!text-rose-400 hover:!bg-black/40"
                          title="Remove photo"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </IconButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comprehensive Dossier Review Card before submission */}
              <div className="rounded-2xl border-2 border-blue-500/30 bg-blue-50/20 dark:bg-blue-950/20 p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-blue-200/50 dark:border-blue-900/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Intake Dossier Verification & Final Audit
                    </h3>
                  </div>
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    Ready to Save
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Vehicle</span>
                    <span className="font-bold text-slate-900 dark:text-white truncate block">
                      {formData.year} {formData.make} {formData.model}
                    </span>
                    <span className="text-[10px] text-slate-500">{formData.trim}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Stock & VIN</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block truncate">
                      {formData.stockNumber}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 truncate block">
                      {formData.vin}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Customs & Lot</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block truncate">
                      {formData.originCountry} Direct
                    </span>
                    <span className="text-[10px] text-slate-500 truncate block">
                      {formData.yardLocation.split("-")[0]}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Price & Margin</span>
                    <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white block">
                      ${formData.sellingPrice.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 block">
                      +${estimatedProfit.toLocaleString()} ({marginPercent}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-2">
            <MuiButton
              type="button"
              variant="outlined"
              color="inherit"
              size="medium"
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Previous
            </MuiButton>

            {activeStep < steps.length - 1 ? (
              <MuiButton
                type="button"
                variant="contained"
                color="primary"
                size="medium"
                onClick={handleNext}
                endIcon={<ArrowRight className="h-4 w-4" />}
              >
                Next: {steps[activeStep + 1].title}
              </MuiButton>
            ) : (
              <MuiButton
                type="button"
                variant="contained"
                color="success"
                size="medium"
                onClick={() => handleSubmit()}
                startIcon={<Save className="h-4 w-4" />}
              >
                Complete Intake & Save to Inventory
              </MuiButton>
            )}
          </div>
        </div>

        {/* Right Column: Live Sticky Summary Dossier (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Vehicle Profile Preview Card */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#121824] p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Live Intake Preview
              </span>
              <MuiChip
                label={formData.status}
                size="small"
                color={formData.status === "Available on Lot" ? "success" : "default"}
              />
            </div>

            {/* Thumbnail Preview */}
            <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-2xs">
              <Image
                src={images[0] || SAMPLE_VEHICLE_PHOTOS_40[0]}
                alt="Intake Preview"
                fill
                className="object-cover"
              />
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md">
                {formData.year} {formData.make}
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md">
                {images.length} Photos
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {formData.year} {formData.make} {formData.model}
              </h4>
              <p className="text-xs text-slate-500">{formData.trim}</p>
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400 mt-1">
                <span>{formData.stockNumber}</span>
                <span>•</span>
                <span className="truncate">{formData.vin}</span>
              </div>
            </div>

            {/* Specs Strip */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
                <span className="text-[9px] text-slate-400 block font-sans uppercase font-bold">Mileage</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formData.mileage.toLocaleString()} KM
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
                <span className="text-[9px] text-slate-400 block font-sans uppercase font-bold">Fuel & Drive</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                  {formData.fuelType} • {formData.driveType}
                </span>
              </div>
            </div>
          </div>

          {/* Real-Time Financial Margin Summary */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#121824] p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Calculator className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Margin Summary
                </span>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  estimatedProfit >= 0
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                    : "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                }`}
              >
                {marginPercent}% Margin
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-500">
                <span>Purchase FOB:</span>
                <span>${Number(formData.purchasePrice).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Freight:</span>
                <span>+${Number(formData.freightCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Customs Tariff:</span>
                <span>+${Number(formData.customsDuty).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Prep & Detailing:</span>
                <span>+${Number(formData.repairCost).toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between font-bold text-slate-900 dark:text-white">
                <span>Total Landed:</span>
                <span>${totalLandedCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-blue-600 dark:text-blue-400">
                <span>Selling Price:</span>
                <span>${Number(formData.sellingPrice).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400 pt-1 border-t border-dashed border-slate-200 dark:border-slate-800">
                <span>Net Gross Margin:</span>
                <span>+${estimatedProfit.toLocaleString()}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 text-center font-mono">
              ؋ {(Number(formData.sellingPrice) * exchangeRate).toLocaleString()} AFN Selling Target
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
