"use client";

import React, { useState, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShowroomStore } from "@/store/useShowroomStore";
import { processAndWatermarkImage } from "@/lib/watermark-utils";
import { translations } from "@/lib/translations";
import { decodeVin } from "@/lib/vin-decoder";
import {
  PaintInspectionDiagram,
  StoredPaintCondition,
} from "@/components/PaintInspectionDiagram";
import { VehicleItem } from "@/lib/mock-data";
import {
  MuiButton,
  MuiTextField,
  MenuItem,
  IconButton,
  Switch,
  FormControlLabel,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  StepButton,
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
  DollarSign,
  Building2,
  Zap,
  Check,
  RotateCcw,
  Fuel,
  AlertCircle,
  Key,
  Languages,
  Layers,
  TrendingUp,
} from "lucide-react";

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

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function VehicleIntakePage() {
  const router = useRouter();
  const {
    addVehicle,
    addToast,
    language,
    exchangeRate,
    theming,
    branding,
    currentRole,
  } = useShowroomStore();
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const shortCode = branding?.dealershipShortCode || "ARI";

  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  const [isDecoding, setIsDecoding] = useState(false);

  // Core vehicle form data state
  const [formData, setFormData] = useState<{
    stockNumber: string;
    vin: string;
    make: string;
    model: string;
    year: number;
    trim: string;
    bodyType: VehicleItem["bodyType"];
    originCountry: VehicleItem["originCountry"];
    steering: VehicleItem["steering"];
    customsClearance: string;
    cleanTitle: boolean;
    mileage: number;
    fuelType: VehicleItem["fuelType"];
    transmission: VehicleItem["transmission"];
    driveType: VehicleItem["driveType"];
    color: string;
    status: VehicleItem["status"];
    yardLocation: string;
    purchasePrice: number;
    freightCost: number;
    customsDuty: number;
    repairCost: number;
    sellingPrice: number;
    features: string;
    description: string;
    descriptionDari: string;
    descriptionPashto: string;
  }>({
    stockNumber: `${shortCode}-${new Date().getFullYear()}-${Math.floor(
      100 + Math.random() * 900
    )}`,
    vin: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    trim: "",
    bodyType: "SUV",
    originCountry: "UAE",
    steering: "Left-Hand Drive (LHD)",
    customsClearance: "",
    cleanTitle: true,
    mileage: 0,
    fuelType: "Petrol",
    transmission: "Automatic",
    driveType: "4WD",
    color: "",
    status: "Available on Lot",
    yardLocation: "Main Showroom - Bagh-e-Azadi",
    purchasePrice: 0,
    freightCost: 0,
    customsDuty: 0,
    repairCost: 0,
    sellingPrice: 0,
    features: "",
    description: "",
    descriptionDari: "",
    descriptionPashto: "",
  });

  // Paint map state persisted to conditionNotes.paintZones
  const [paintZones, setPaintZones] = useState<
    Record<string, StoredPaintCondition> | undefined
  >(undefined);

  // Images state
  const [images, setImages] = useState<string[]>([]);
  const [bulkUrlInput, setBulkUrlInput] = useState("");
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [applyWatermark, setApplyWatermark] = useState(true);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

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
  }, [
    formData.purchasePrice,
    formData.freightCost,
    formData.customsDuty,
    formData.repairCost,
  ]);

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
          bodyType: (decoded.bodyType as VehicleItem["bodyType"]) || prev.bodyType,
          fuelType: (decoded.fuelType as VehicleItem["fuelType"]) || prev.fuelType,
          transmission:
            (decoded.transmission as VehicleItem["transmission"]) || prev.transmission,
          driveType: (decoded.driveType as VehicleItem["driveType"]) || prev.driveType,
          trim: decoded.trim || prev.trim,
        }));
        addToast(
          `Decoded ${decoded.year || ""} ${decoded.make || ""} ${decoded.model || ""} (${
            decoded.bodyType || ""
          })`,
          "success"
        );
      } else {
        addToast(
          "VIN not found in online decoder database. Manual entry is supported.",
          "info"
        );
      }
    } catch (err: unknown) {
      addToast(
        err instanceof Error
          ? err.message
          : "Could not automatically decode this VIN. Manual entry is supported.",
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
    const newStock = `${shortCode}-${year}-${randomNum}`;
    setFormData((prev) => ({
      ...prev,
      stockNumber: newStock,
    }));
    addToast(`Generated stock ID: ${newStock}`, "info");
  };

  // Durable Photo Upload Handler (/api/upload + Base64 Data URL fallback — no ephemeral blob: URLs)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadNotice(
      `Processing ${files.length} vehicle showcase photo(s) with ${
        branding?.dealershipName || "Aria Motors"
      } watermarks...`
    );

    const processedFiles: File[] = [];

    try {
      const watermarkLabel =
        branding?.watermarkText ||
        `${(branding?.dealershipName || "ARIA MOTORS").toUpperCase()} • HERAT`;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (applyWatermark) {
          const stamped = await processAndWatermarkImage(file, {
            stockNumber: formData.stockNumber,
            showroomName: watermarkLabel,
            applyWatermark: true,
          });
          processedFiles.push(stamped);
        } else {
          processedFiles.push(file);
        }
      }

      let persistedUrls: string[] = [];
      try {
        const uploadData = new FormData();
        processedFiles.forEach((pf) => uploadData.append("files", pf));
        const res = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });
        if (res.ok) {
          const payload = await res.json();
          if (Array.isArray(payload.urls) && payload.urls.length > 0) {
            persistedUrls = payload.urls;
          }
        }
      } catch {
        // Fallback to durable Base64 Data URLs below
      }

      if (persistedUrls.length === 0) {
        persistedUrls = await Promise.all(processedFiles.map((pf) => fileToDataUrl(pf)));
      }

      setImages((prev) => [...prev, ...persistedUrls]);
      addToast(
        `Added ${persistedUrls.length} persistent photo(s) to vehicle vault`,
        "success"
      );
    } catch (err) {
      console.error("Image upload processing failed:", err);
      const fallbackUrls = await Promise.all(
        Array.from(files).map((f) => fileToDataUrl(f))
      );
      setImages((prev) => [...prev, ...fallbackUrls]);
      addToast("Added photos via local data persistence", "info");
    } finally {
      setIsUploading(false);
      setUploadNotice(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddBulkUrls = () => {
    if (!bulkUrlInput.trim()) return;
    const urls = bulkUrlInput
      .split(/\r?\n|,/)
      .map((u) => u.trim())
      .filter((u) => u.startsWith("http://") || u.startsWith("https://"));

    if (urls.length > 0) {
      setImages((prev) => [...prev, ...urls]);
      setBulkUrlInput("");
      setIsBulkOpen(false);
      addToast(`Added ${urls.length} vehicle photo URLs to vault`, "success");
    }
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

  // Step-specific Validation
  const validateStep = (stepIndex: number): boolean => {
    if (stepIndex === 0) {
      if (!formData.vin.trim()) {
        addToast("Please provide a valid 17-digit Chassis VIN", "warning");
        return false;
      }
      if (!formData.make.trim() || !formData.model.trim()) {
        addToast("Make and Model fields are required", "warning");
        return false;
      }
      if (!formData.color.trim()) {
        addToast("Exterior Paint Color is required", "warning");
        return false;
      }
    }

    if (stepIndex === 1) {
      if (formData.mileage < 0) {
        addToast("Please provide a valid odometer mileage reading", "warning");
        return false;
      }
      if (!formData.customsClearance.trim()) {
        addToast(
          "Customs clearance / Islam Qala Gomrok documentation is required",
          "warning"
        );
        return false;
      }
    }

    if (stepIndex === 2) {
      if (formData.sellingPrice <= 0) {
        addToast("Please specify an intended target selling price in USD", "warning");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepClick = (index: number) => {
    if (index < activeStep) {
      setActiveStep(index);
      return;
    }
    if (index > activeStep) {
      for (let s = activeStep; s < index; s++) {
        if (!validateStep(s)) {
          setActiveStep(s);
          return;
        }
      }
      setActiveStep(index);
    }
  };

  // Final Submission Handler
  const handleSubmit = async () => {
    if (currentRole !== "SuperAdmin") {
      addToast("Only SuperAdmin can commit new vehicle stock to inventory.", "error");
      return;
    }

    for (let s = 0; s <= 2; s++) {
      if (!validateStep(s)) {
        setActiveStep(s);
        return;
      }
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
        yardLocation: formData.yardLocation,
        purchasePrice: Number(formData.purchasePrice),
        freightCost: Number(formData.freightCost),
        customsDuty: Number(formData.customsDuty),
        repairCost: Number(formData.repairCost),
        landedCost: totalLandedCost,
        minTargetPrice: totalLandedCost + 2000,
        sellingPrice: Number(formData.sellingPrice),
        features: currentFeaturesArray,
        description: formData.description,
        descriptionDari: formData.descriptionDari,
        descriptionPashto: formData.descriptionPashto,
        conditionNotes: {
          exterior: "10/10 - Inspected on Showroom Lot",
          interior: "Pristine Factory Leather & Upholstery",
          engine: "Zero-Hour Certified Powertrain Diagnostic",
          tires: "Original Factory Tires (95% Tread)",
          accidentHistory: formData.cleanTitle
            ? "Clean Title Guaranteed (No Accidents)"
            : "Disclosed Cosmetic Reconditioning",
          yardLocation: formData.yardLocation,
          paintZones,
        },
        images: images,
        documents: [],
      });
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Unable to save vehicle intake",
        "error"
      );
      return;
    }

    addToast(
      `Successfully registered ${formData.make} ${formData.model} (${formData.stockNumber}) into showroom inventory!`,
      "success"
    );
    router.push("/inventory");
  };

  const steps = [
    {
      title:
        language === "ps"
          ? "شاسي او پیژندنه"
          : language === "fa"
          ? "شاسی و مشخصات پایه"
          : "Chassis & Identification",
      desc: "Stock code, VIN chassis & basic model classification",
      icon: <Building2 className="h-4 w-4" />,
    },
    {
      title:
        language === "ps"
          ? "تخنیکي معاینه او رنګ"
          : language === "fa"
          ? "معاینه فنی، رنگ و گمرک"
          : "Condition & Diagnostics",
      desc: "Powertrain, customs maktoub, ultrasonic paint & options",
      icon: <ShieldCheck className="h-4 w-4" />,
    },
    {
      title:
        language === "ps"
          ? "تمام شوی لګښت او بیه"
          : language === "fa"
          ? "هزینه تمام‌شده و قیمت‌گذاری"
          : "Landed Tariffs & Pricing",
      desc: "FOB purchase, Islam Qala tariffs & profit margins",
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      title:
        language === "ps"
          ? "تصویرونه او ثبت"
          : language === "fa"
          ? "گالری تصاویر و ثبت نهایی"
          : "Photography & Vault",
      desc: "Multi-angle photo album & final dossier verification",
      icon: <ImageIcon className="h-4 w-4" />,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 space-y-5 pb-16">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#262F40]">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[var(--theme-primary)] mb-1">
            <Link href="/" className="hover:underline">
              {t.tabShowroom}
            </Link>
            <span>/</span>
            <Link href="/inventory" className="hover:underline">
              {t.tabInventory}
            </Link>
            <span>/</span>
            <span>{t.addNewVehicle}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            {language === "ps"
              ? "د نوي موټر ثبت او ۴-مرحله‌یی دوسیه"
              : language === "fa"
              ? "ثبت موتر جدید و تشکیل پرونده ۴ مرحله‌ای"
              : "Vehicle Stock Intake & 4-Step Dossier Studio"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Register new arrivals, run ultrasonic paint & chassis diagnostics, calculate landed Gomrok tariffs, and attach watermarked showroom photography.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Link
            href="/inventory"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-[var(--theme-primary)] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            <span>{t.inventoryCancel}</span>
          </Link>
        </div>
      </div>

      {/* Role Notice if not SuperAdmin */}
      {currentRole !== "SuperAdmin" && (
        <div
          role="alert"
          className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 flex items-center gap-3 text-xs text-amber-800 dark:text-amber-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            {t.importNotAuthorized} — Only SuperAdmin accounts can commit new vehicle stock to inventory.
          </span>
        </div>
      )}

      {/* MUI Stepper Form Progress Header */}
      <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] p-4 sm:p-6 shadow-xs">
        <Stepper
          activeStep={activeStep}
          nonLinear
          alternativeLabel
          sx={{
            "& .MuiStepConnector-line": {
              borderColor: "divider",
              borderTopWidth: 2,
            },
            "& .MuiStepConnector-root.Mui-active .MuiStepConnector-line": {
              borderColor: theming?.primaryColor || "#1A73E8",
            },
            "& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line": {
              borderColor: "#16A34A",
            },
            "& .MuiStepIcon-root": {
              width: 34,
              height: 34,
              color: "action.disabledBackground",
              "&.Mui-active": {
                color: theming?.primaryColor || "#1A73E8",
              },
              "&.Mui-completed": {
                color: "#16A34A",
              },
            },
            "& .MuiStepIcon-text": {
              fontWeight: 700,
              fontSize: "0.85rem",
              fill: "#FFFFFF",
            },
            "& .MuiStepButton-root": {
              p: 0.5,
              borderRadius: 2,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                bgcolor: "action.hover",
              },
            },
            "& .MuiStepLabel-label": {
              mt: 1,
              fontWeight: 600,
              fontSize: "0.8125rem",
              letterSpacing: "-0.01em",
              "&.Mui-active": {
                color: "text.primary",
                fontWeight: 700,
              },
              "&.Mui-completed": {
                color: "text.secondary",
                fontWeight: 600,
              },
            },
          }}
        >
          {steps.map((step, index) => {
            const isCompleted = index < activeStep;
            return (
              <Step key={step.title} completed={isCompleted}>
                <StepButton
                  onClick={() => handleStepClick(index)}
                  title={`Step ${index + 1}: ${step.title}`}
                >
                  <StepLabel
                    optional={
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:block mt-0.5 line-clamp-1">
                        {step.desc}
                      </span>
                    }
                  >
                    <span className="block font-bold text-slate-900 dark:text-white text-xs sm:text-[13px]">
                      {step.title}
                    </span>
                  </StepLabel>
                </StepButton>
              </Step>
            );
          })}
        </Stepper>
      </div>

      {/* Main Step Content */}
      <div className="space-y-5">
        {/* STEP 0: Vehicle Identification & Classification */}
        {activeStep === 0 && (
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#262F40]">
                <div className="flex items-center gap-2.5">
                  <span className="h-7 w-7 rounded-lg bg-[var(--theme-primary)] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs">
                    01
                  </span>
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Chassis & Stock Identification
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Chassis verification, automated VIN decoding, inventory status, and parking bay.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 dark:bg-[#121722] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#262F40]">
                  Identity
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MuiTextField
                  label="Stock Inventory ID"
                  sizeVariant="small"
                  value={formData.stockNumber}
                  onChange={(e) => setFormData({ ...formData, stockNumber: e.target.value })}
                  helperText="Internal showroom tracking code"
                  endAdornment={
                    <IconButton
                      size="small"
                      aria-label="Generate new stock ID"
                      onClick={handleGenerateStockNumber}
                      title="Generate new stock ID"
                      sx={{ p: 0.5 }}
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-[var(--theme-primary)]" />
                    </IconButton>
                  }
                  required
                />

                <MuiTextField
                  label="Chassis VIN Number"
                  sizeVariant="small"
                  value={formData.vin}
                  onChange={(e) =>
                    setFormData({ ...formData, vin: e.target.value.toUpperCase() })
                  }
                  helperText="17-character ISO chassis number"
                  startAdornment={<Key className="h-3.5 w-3.5 text-slate-400" />}
                  endAdornment={
                    <button
                      type="button"
                      onClick={handleAutoDecode}
                      disabled={isDecoding}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--theme-primary)] cursor-pointer disabled:opacity-50"
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
                  helperText="Physical lot position in Herat"
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
                  <MenuItem value="Detailing & PDI Wash Bay">
                    Detailing & PDI Wash Bay
                  </MenuItem>
                </MuiTextField>

                <MuiTextField
                  select
                  label="Inventory Status"
                  sizeVariant="small"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as VehicleItem["status"],
                    })
                  }
                  helperText="Current commercial availability"
                >
                  <MenuItem value="Available on Lot">Available on Lot</MenuItem>
                  <MenuItem value="In Transit">In Transit to Herat</MenuItem>
                  <MenuItem value="Under Prep/Maintenance">Under Prep</MenuItem>
                  <MenuItem value="Reserved/Deposit Paid">Reserved</MenuItem>
                </MuiTextField>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#262F40]">
                <div className="flex items-center gap-2.5">
                  <span className="h-7 w-7 rounded-lg bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs border border-[var(--theme-primary)]/20">
                    <Layers className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Make, Model & Classification
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Brand manufacturer, model line, trim level, and body classification.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 dark:bg-[#121722] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#262F40]">
                  Specifications
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <MuiTextField
                  select
                  label="Body Style"
                  sizeVariant="small"
                  value={formData.bodyType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bodyType: e.target.value as VehicleItem["bodyType"],
                    })
                  }
                >
                  <MenuItem value="SUV">SUV (شاسی بلند)</MenuItem>
                  <MenuItem value="Sedan">Sedan (سدان)</MenuItem>
                  <MenuItem value="Pickup">Pickup (پیک‌آپ)</MenuItem>
                  <MenuItem value="Crossover">Crossover (کراس‌اوور)</MenuItem>
                </MuiTextField>

                <MuiTextField
                  select
                  label="Country of Origin"
                  sizeVariant="small"
                  value={formData.originCountry}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      originCountry: e.target.value as VehicleItem["originCountry"],
                    })
                  }
                >
                  <MenuItem value="UAE">UAE / Dubai (Jebel Ali)</MenuItem>
                  <MenuItem value="Japan">Japan (Yokohama)</MenuItem>
                  <MenuItem value="USA">USA (Houston/Savannah)</MenuItem>
                  <MenuItem value="Canada">Canada</MenuItem>
                  <MenuItem value="Europe">Europe (Hamburg/Bremerhaven)</MenuItem>
                </MuiTextField>

                <MuiTextField
                  label="Exterior Paint Color"
                  sizeVariant="small"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="e.g. Pearl White Metallic"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: Powertrain, Customs Maktoub, Options & Paint Inspection */}
        {activeStep === 1 && (
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#262F40]">
                <div className="flex items-center gap-2.5">
                  <span className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs border border-amber-500/20">
                    <Fuel className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Powertrain & Mechanical Configuration
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Odometer reading, transmission, fuel, drivetrain, and steering configuration.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 dark:bg-[#121722] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#262F40]">
                  Mechanical
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      steering: e.target.value as VehicleItem["steering"],
                    })
                  }
                >
                  <MenuItem value="Left-Hand Drive (LHD)">Left-Hand Drive (دست چپ)</MenuItem>
                  <MenuItem value="Right-Hand Drive (RHD Converted)">RHD Converted</MenuItem>
                </MuiTextField>

                <MuiTextField
                  select
                  label="Fuel Type"
                  sizeVariant="small"
                  value={formData.fuelType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fuelType: e.target.value as VehicleItem["fuelType"],
                    })
                  }
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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      transmission: e.target.value as VehicleItem["transmission"],
                    })
                  }
                >
                  <MenuItem value="Automatic">Automatic (اتومات)</MenuItem>
                  <MenuItem value="Manual">Manual (دستی)</MenuItem>
                </MuiTextField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <MuiTextField
                  select
                  label="Drivetrain"
                  sizeVariant="small"
                  value={formData.driveType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      driveType: e.target.value as VehicleItem["driveType"],
                    })
                  }
                >
                  <MenuItem value="4WD">4WD (چهار چرخ محرک)</MenuItem>
                  <MenuItem value="AWD">AWD (تمام چرخ محرک)</MenuItem>
                  <MenuItem value="RWD">RWD (دیفرنسیال عقب)</MenuItem>
                  <MenuItem value="FWD">FWD (دیفرنسیال جلو)</MenuItem>
                </MuiTextField>

                <MuiTextField
                  label="Islam Qala Customs Clearance Maktoub"
                  sizeVariant="small"
                  value={formData.customsClearance}
                  onChange={(e) =>
                    setFormData({ ...formData, customsClearance: e.target.value })
                  }
                  helperText="Official Afghan MoF customs clearance document / maktoub ID"
                  placeholder="e.g. Maktoub #IQ-2026-9902"
                  required
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#262F40]">
                <div className="flex items-center gap-2.5">
                  <span className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs border border-emerald-500/20">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Equipped Factory Features & Options
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Select all factory luxury packages and 4WD equipment included with this unit.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 dark:bg-[#121722] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#262F40]">
                  Equipment
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {PRESET_VEHICLE_FEATURES.map((feat) => {
                  const isSelected = currentFeaturesArray.includes(feat);
                  return (
                    <button
                      key={feat}
                      type="button"
                      onClick={() => toggleFeature(feat)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                        isSelected
                          ? "bg-[var(--theme-primary)] text-white border-[var(--theme-primary)] font-bold shadow-xs"
                          : "bg-slate-50/80 dark:bg-[#121722] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#262F40] hover:border-slate-400"
                      }`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                      <span>{feat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#262F40]">
                <div className="flex items-center gap-2.5">
                  <span className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs border border-indigo-500/20">
                    <Languages className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Trilingual Showroom Descriptions
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Catalog and official deed (Qabala) vehicle descriptions in English, Dari, and Pashto.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 dark:bg-[#121722] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#262F40]">
                  Multilingual
                </span>
              </div>

              <div className="space-y-4">
                <MuiTextField
                  label="English Commercial Catalog Description"
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
                  onChange={(e) =>
                    setFormData({ ...formData, descriptionDari: e.target.value })
                  }
                  placeholder="مشخصات و آپشن‌ها به زبان دری..."
                />

                <MuiTextField
                  label="د موټر بشپړ معلومات په پښتو ژبه"
                  sizeVariant="small"
                  multiline
                  rows={2}
                  dir="rtl"
                  value={formData.descriptionPashto}
                  onChange={(e) =>
                    setFormData({ ...formData, descriptionPashto: e.target.value })
                  }
                  placeholder="د موټر مشخصات په پښتو ژبه..."
                />
              </div>
            </div>

            {/* Persisted Ultrasonic Paint & Body Diagnostics */}
            <PaintInspectionDiagram
              vin={formData.vin}
              cleanTitle={formData.cleanTitle}
              editable={true}
              savedZoneMap={paintZones}
              onChangeZones={(_zones, map) => setPaintZones(map)}
            />
          </div>
        )}

        {/* STEP 2: Landed Cost & Target Pricing */}
        {activeStep === 2 && (
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#262F40]">
                <div className="flex items-center gap-2.5">
                  <span className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs border border-amber-500/20">
                    <DollarSign className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Landed Cost Components (USD)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      FOB purchase costs, ocean freight, customs tariffs, and preparation expenses.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 dark:bg-[#121722] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#262F40]">
                  Cost Accounting
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MuiTextField
                  label="FOB Purchase Price (USD Port)"
                  type="number"
                  sizeVariant="small"
                  value={formData.purchasePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, purchasePrice: Number(e.target.value) })
                  }
                  startAdornment={<DollarSign className="h-3.5 w-3.5 text-slate-400" />}
                  helperText={`≈ ${(formData.purchasePrice * exchangeRate).toLocaleString()} AFN`}
                  required
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
                  helperText={`≈ ${(formData.freightCost * exchangeRate).toLocaleString()} AFN`}
                  required
                />

                <MuiTextField
                  label="Islam Qala Customs Tariff / Gomrok (USD)"
                  type="number"
                  sizeVariant="small"
                  value={formData.customsDuty}
                  onChange={(e) =>
                    setFormData({ ...formData, customsDuty: Number(e.target.value) })
                  }
                  startAdornment={<DollarSign className="h-3.5 w-3.5 text-slate-400" />}
                  helperText={`≈ ${(formData.customsDuty * exchangeRate).toLocaleString()} AFN`}
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
                  helperText={`≈ ${(formData.repairCost * exchangeRate).toLocaleString()} AFN`}
                  required
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#262F40]">
                <div className="flex items-center gap-2.5">
                  <span className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs border border-emerald-500/20">
                    <TrendingUp className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Target Selling Price & Real-Time Margins
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Determine showroom retail price and verify gross profitability.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  Valuation
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-[#262F40] bg-slate-50/70 dark:bg-[#121722] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block mb-0.5">
                      Target Showroom Selling Price (USD)
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                      Equivalent to: ؋{" "}
                      {Math.round(formData.sellingPrice * exchangeRate).toLocaleString()} AFN
                    </span>
                  </div>
                  <div className="w-full sm:w-72">
                    <MuiTextField
                      type="number"
                      sizeVariant="small"
                      aria-label="Target Showroom Selling Price"
                      value={formData.sellingPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, sellingPrice: Number(e.target.value) })
                      }
                      startAdornment={
                        <DollarSign className="h-4 w-4 text-emerald-600 font-bold" />
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-200 dark:bg-[#262F40] border border-slate-200 dark:border-[#262F40] rounded-lg overflow-hidden text-xs">
                  <div className="p-3.5 bg-white dark:bg-[#161B26]">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">
                      Total Landed Cost
                    </span>
                    <span className="font-mono font-bold text-base text-slate-900 dark:text-white tabular-nums mt-0.5 block">
                      ${totalLandedCost.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3.5 bg-white dark:bg-[#161B26]">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">
                      Projected Profit
                    </span>
                    <span
                      className={`font-mono font-bold text-base tabular-nums mt-0.5 block ${
                        estimatedProfit >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600"
                      }`}
                    >
                      {estimatedProfit >= 0 ? "+" : ""}${estimatedProfit.toLocaleString()} USD
                    </span>
                  </div>

                  <div className="p-3.5 bg-white dark:bg-[#161B26]">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">
                      Gross Margin (%)
                    </span>
                    <span
                      className={`font-mono font-bold text-base tabular-nums mt-0.5 block ${
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
          </div>
        )}

        {/* STEP 3: Photography Vault & Final Dossier Verification */}
        {activeStep === 3 && (
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#262F40]">
                <div className="flex items-center gap-2.5">
                  <span className="h-7 w-7 rounded-lg bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs border border-[var(--theme-primary)]/20">
                    <ImageIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Vehicle Photo Vault ({images.length} Loaded)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Upload high-resolution photography with automatic{" "}
                      {branding?.dealershipName || "Aria Motors"} dealer watermarks.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  Photography
                </span>
              </div>

              {/* Upload Toolbar */}
              <div className="flex flex-wrap items-center gap-2.5">
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
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  startIcon={<Upload className="h-3.5 w-3.5" />}
                  sx={{ fontSize: "11px", py: "5px", px: "14px" }}
                >
                  Upload Files
                </MuiButton>

                <MuiButton
                  type="button"
                  variant="outlined"
                  color="inherit"
                  size="small"
                  onClick={() => setIsBulkOpen(!isBulkOpen)}
                  startIcon={<LinkIcon className="h-3.5 w-3.5" />}
                  sx={{ fontSize: "11px", py: "4px" }}
                >
                  Bulk URLs
                </MuiButton>

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
                    <span className="text-xs text-slate-600 dark:text-slate-300">
                      Auto-apply {branding?.dealershipName || "Aria Motors"} Watermark
                    </span>
                  }
                  sx={{ ms: 1 }}
                />
              </div>

              {isBulkOpen && (
                <div className="p-3.5 rounded-lg border border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#121722] space-y-2">
                  <label
                    htmlFor="intake-bulk-urls"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 block"
                  >
                    Paste Direct Image URLs (separated by newlines or commas):
                  </label>
                  <textarea
                    id="intake-bulk-urls"
                    rows={3}
                    value={bulkUrlInput}
                    onChange={(e) => setBulkUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-1..."
                    className="w-full text-xs font-mono p-2.5 rounded border border-slate-300 dark:border-[#262F40] bg-white dark:bg-[#0F141C] text-slate-900 dark:text-white outline-none focus:border-[var(--theme-primary)]"
                  />
                  <div className="flex justify-end gap-2">
                    <MuiButton
                      type="button"
                      variant="text"
                      size="small"
                      onClick={() => setIsBulkOpen(false)}
                      sx={{ fontSize: "10px" }}
                    >
                      {t.inventoryCancel}
                    </MuiButton>
                    <MuiButton
                      type="button"
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={handleAddBulkUrls}
                      sx={{ fontSize: "10px" }}
                    >
                      Add URLs to Vault
                    </MuiButton>
                  </div>
                </div>
              )}

              {uploadNotice && (
                <div className="p-2.5 rounded bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 text-xs text-[var(--theme-primary)] flex items-center gap-2">
                  <div className="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full shrink-0" />
                  <span>{uploadNotice}</span>
                </div>
              )}

              {images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-2">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 dark:border-[#262F40] bg-slate-100 dark:bg-slate-800"
                    >
                      <Image
                        src={img}
                        alt={`Photo ${idx + 1}`}
                        fill
                        unoptimized={img.startsWith("data:")}
                        className="object-cover"
                      />

                      {idx === 0 && (
                        <div className="absolute top-1 start-1 bg-slate-900/90 text-amber-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-1">
                          <Star className="h-2.5 w-2.5 fill-amber-400" />
                          Primary
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                        {idx !== 0 && (
                          <button
                            type="button"
                            aria-label="Set as primary showcase photo"
                            onClick={() => handleSetPrimaryPhoto(idx)}
                            className="p-1 rounded bg-white text-slate-900 hover:bg-slate-200 cursor-pointer"
                            title="Set as primary showcase photo"
                          >
                            <Star className="h-3 w-3" />
                          </button>
                        )}
                        <button
                          type="button"
                          aria-label="Remove photo"
                          onClick={() => handleRemovePhoto(idx)}
                          className="p-1 rounded bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                          title="Remove photo"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-[#262F40] bg-slate-50/50 dark:bg-[#121722] text-slate-400">
                  <ImageIcon className="h-10 w-10 mx-auto opacity-30 mb-2" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    No Showcase Photos Uploaded Yet
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click &ldquo;Upload Files&rdquo; to add high-resolution vehicle photos with automated dealer watermarks.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#262F40]">
                <div className="flex items-center gap-2.5">
                  <span className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs border border-emerald-500/20">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Pre-Submission Dossier Audit & Commitment
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Verify entered specifications before committing this vehicle into live showroom inventory.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  Commitment
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-[#262F40] bg-slate-50/60 dark:bg-[#121722]">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">
                    Vehicle Unit
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5 block truncate">
                    {formData.year} {formData.make} {formData.model}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-[#262F40] bg-slate-50/60 dark:bg-[#121722]">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">
                    Stock & VIN
                  </span>
                  <span className="font-mono font-bold text-[var(--theme-primary)] mt-0.5 block truncate">
                    {formData.stockNumber}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-[#262F40] bg-slate-50/60 dark:bg-[#121722]">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">
                    Landed Cost
                  </span>
                  <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white mt-0.5 block">
                    ${totalLandedCost.toLocaleString()} USD
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-[#262F40] bg-slate-50/60 dark:bg-[#121722]">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">
                    Target Retail
                  </span>
                  <span className="font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    ${formData.sellingPrice.toLocaleString()} USD
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Toolbar Card */}
        <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] p-4 shadow-xs flex items-center justify-between">
          <MuiButton
            type="button"
            variant="outlined"
            color="inherit"
            size="small"
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<ArrowLeft className="h-4 w-4 rtl:rotate-180" />}
            sx={{ fontSize: "11px", py: "5px", px: "16px" }}
          >
            {language === "ps" ? "شاته" : language === "fa" ? "مرحله قبل" : "Back"}
          </MuiButton>

          {activeStep < steps.length - 1 ? (
            <MuiButton
              type="button"
              variant="contained"
              color="primary"
              size="small"
              onClick={handleNext}
              endIcon={<ArrowRight className="h-4 w-4 rtl:rotate-180" />}
              sx={{ fontSize: "11px", py: "5px", px: "18px" }}
            >
              {language === "ps"
                ? "بل ګام"
                : language === "fa"
                ? "ادامه به مرحله بعد"
                : `Continue to ${steps[activeStep + 1].title.split("&")[0]}`}
            </MuiButton>
          ) : (
            <MuiButton
              type="button"
              variant="contained"
              color="success"
              size="small"
              disabled={currentRole !== "SuperAdmin"}
              onClick={() => void handleSubmit()}
              startIcon={<CheckCircle2 className="h-4 w-4" />}
              sx={{ fontSize: "11px", py: "6px", px: "22px" }}
            >
              {language === "ps"
                ? "موټر په موجودۍ کې ثبت کړئ"
                : language === "fa"
                ? "ثبت نهایی موتر در موجودی"
                : "Register Vehicle & Commit to Lot"}
            </MuiButton>
          )}
        </div>
      </div>
    </div>
  );
}
