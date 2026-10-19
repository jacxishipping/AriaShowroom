"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { formatCurrency } from "@/lib/utils";
import { VehicleItem } from "@/lib/mock-data";
import {
  MuiCard,
  MuiCardContent,
  MuiButton,
  MuiChip,
  MuiTextField,
  MenuItem,
  MuiTable,
  MuiTableHead,
  MuiTableBody,
  MuiTableRow,
  MuiTableCell,
  IconButton,
  Stepper,
  Step,
  StepLabel,
} from "@/components/mui";
import {
  Truck,
  Anchor,
  Compass,
  MapPin,
  ShieldCheck,
  FileText,
  Calculator,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Search,
  Plus,
  RefreshCw,
  FileCheck2,
  Printer,
  DollarSign,
  Filter,
  ArrowUpRight,
  Check,
  Layers,
  ChevronDown,
} from "lucide-react";

// 5 Transit Pipeline Milestones
const PIPELINE_MILESTONES = [
  {
    id: 1,
    title: "Port of Origin (Dubai / Korea / USA)",
    titleDari: "بندر مبدأ (دبی / کوریا / امریکا)",
    desc: "Export title verified, container stuffed, B/L issued.",
    icon: Anchor,
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  },
  {
    id: 2,
    title: "High Seas Ocean Freight",
    titleDari: "حمل و نقل دریایی بین‌المللی",
    desc: "Vessel navigation across Arabian Sea to Gulf ports.",
    icon: Compass,
    color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
  },
  {
    id: 3,
    title: "Bandar Abbas / Chabahar Transit",
    titleDari: "ترانزیت بندر عباس / چابهار",
    desc: "Port discharge, TIR carnet escort convoy to border.",
    icon: Truck,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
  {
    id: 4,
    title: "Islam Qala Customs (Gomrok Herat)",
    titleDari: "گمرک اسلام قلعه و تفتیش هرات",
    desc: "Physical chassis audit, MoF tariff appraisal & tax clearance.",
    icon: ShieldCheck,
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    id: 5,
    title: "Sadozai Motors Herat Lot Arrival",
    titleDari: "ورود به نمایشگاه مرکزی هرات",
    desc: "PDI detailing, 40+ photo vault, client delivery ready.",
    icon: Building2,
    color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  },
];

export default function LogisticsAndCustomsPage() {
  const {
    vehicles,
    updateVehicle,
    addVehicle,
    addToast,
    currency,
    exchangeRate,
    language,
  } = useShowroomStore();

  const t = translations[language];

  // Pipeline Filter Tab State
  const [activeStageFilter, setActiveStageFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Customs Duty Calculator State
  const [engineCC, setEngineCC] = useState("3500");
  const [vehicleValueUSD, setVehicleValueUSD] = useState("32000");
  const [calcFuelType, setCalcFuelType] = useState<"petrol" | "hybrid" | "electric">("petrol");
  const [selectedOrigin, setSelectedOrigin] = useState("UAE / Dubai");

  // Track simulated transit milestones for vehicles in state (mapping vehicleId -> milestone 1..5)
  const [vehicleMilestones, setVehicleMilestones] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    vehicles.forEach((v, idx) => {
      if (v.status === "In Transit") {
        initial[v.id] = (idx % 3) + 2; // stage 2 (High Seas), 3 (Bandar Abbas), or 4 (Islam Qala)
      } else {
        initial[v.id] = 5; // Arrived
      }
    });
    return initial;
  });

  // Calculate Afghan Gomrok Duty
  const baseValue = Number(vehicleValueUSD) || 0;
  const cc = Number(engineCC) || 2000;
  let tariffRate = 0.16; // Standard base 16%

  if (cc > 4000) {
    tariffRate = 0.25; // 25% for high-displacement V8 (Land Cruiser 5.7 / LX570 / LX600)
  } else if (cc > 2500) {
    tariffRate = 0.20; // 20% for 2.5L - 4.0L
  } else {
    tariffRate = 0.14; // 14% for compact engines (<2.5L)
  }

  // Hybrid / EV green incentive discount
  if (calcFuelType === "hybrid") {
    tariffRate *= 0.70; // 30% reduction
  } else if (calcFuelType === "electric") {
    tariffRate *= 0.50; // 50% reduction
  }

  const estimatedDutyUSD = Math.round(baseValue * tariffRate);
  const portHandlingFeeUSD = 450;
  const transitEscortFeeUSD = 280;
  const municipalityRoadTaxUSD = 150;
  const redCrescentFeeUSD = 45;
  const totalClearanceUSD =
    estimatedDutyUSD + portHandlingFeeUSD + transitEscortFeeUSD + municipalityRoadTaxUSD + redCrescentFeeUSD;

  // Filter in-transit vs lot vehicles
  const inTransitVehicles = useMemo(() => {
    return vehicles.filter((v) => v.status === "In Transit");
  }, [vehicles]);

  const lotVehicles = useMemo(() => {
    return vehicles.filter((v) => v.status === "Available on Lot");
  }, [vehicles]);

  // Combined pipeline shipments
  const pipelineVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const stage = vehicleMilestones[v.id] || (v.status === "In Transit" ? 3 : 5);

      if (activeStageFilter === "IN_TRANSIT" && v.status !== "In Transit") return false;
      if (activeStageFilter === "GOMROK" && stage !== 4) return false;
      if (activeStageFilter === "PORT" && stage !== 1 && stage !== 2) return false;
      if (activeStageFilter === "CHABAHAR" && stage !== 3) return false;
      if (activeStageFilter === "ARRIVED" && v.status !== "Available on Lot") return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.vin.toLowerCase().includes(q) ||
          v.stockNumber.toLowerCase().includes(q) ||
          v.originCountry.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [vehicles, activeStageFilter, searchQuery, vehicleMilestones]);

  // Aggregate Corridor Metrics
  const totalInTransitValueUSD = useMemo(() => {
    return inTransitVehicles.reduce((sum, v) => sum + (v.landedCost || v.purchasePrice || 0), 0);
  }, [inTransitVehicles]);

  const totalCustomsDuesUSD = useMemo(() => {
    return inTransitVehicles.reduce((sum, v) => sum + (v.customsDuty || 0), 0);
  }, [inTransitVehicles]);

  const vehiclesAtGomrokCount = useMemo(() => {
    return vehicles.filter((v) => (vehicleMilestones[v.id] || 0) === 4).length;
  }, [vehicles, vehicleMilestones]);

  // Advance milestone for a vehicle
  const handleAdvanceMilestone = async (vehicle: VehicleItem) => {
    const current = vehicleMilestones[vehicle.id] || (vehicle.status === "In Transit" ? 3 : 5);
    if (current < 4) {
      const next = current + 1;
      setVehicleMilestones((prev) => ({ ...prev, [vehicle.id]: next }));
      addToast(
        `${vehicle.make} ${vehicle.model} advanced to: ${PIPELINE_MILESTONES[next - 1].title}`,
        "info"
      );
    } else if (current === 4) {
      // Move from Islam Qala to Lot
      try {
        await updateVehicle(vehicle.id, {
          status: "Available on Lot",
          customsClearance: "Islam Qala Gomrok - Verified & Cleared (Doc #MK-2026-8819)",
        });
      } catch (error) {
        addToast(error instanceof Error ? error.message : "Unable to update customs clearance", "error");
        return;
      }
      setVehicleMilestones((prev) => ({ ...prev, [vehicle.id]: 5 }));
      addToast(
        `🎉 ${vehicle.make} ${vehicle.model} cleared Islam Qala customs and is now Available on Lot!`,
        "success"
      );
    }
  };

  // Quick action: Clear Gomrok directly
  const handleDirectClearGomrok = async (vehicle: VehicleItem) => {
    try {
      await updateVehicle(vehicle.id, {
        status: "Available on Lot",
        customsClearance: "Islam Qala Gomrok - Cleared via Maktoub #IQ-GMRK-2026-904",
      });
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Unable to update customs clearance", "error");
      return;
    }
    setVehicleMilestones((prev) => ({ ...prev, [vehicle.id]: 5 }));
    addToast(
      `${vehicle.year} ${vehicle.make} ${vehicle.model} customs clearance finalized!`,
      "success"
    );
  };

  // Quick Action: Dispatch new Dubai Transit Demo Vehicle
  const handleDispatchDemoShipment = async () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newStock = `ARI-DXB-${randomSuffix}`;
    const newVin = `JTEBU5JR8R50${randomSuffix}`;

    const demoVehicle: VehicleItem = {
      id: `dxb-transit-${Date.now()}`,
      stockNumber: newStock,
      vin: newVin,
      make: "Lexus",
      model: "LX600",
      year: 2024,
      trim: "VIP 4-Seater Ultra Luxury",
      bodyType: "SUV",
      originCountry: "UAE",
      steering: "Left-Hand Drive (LHD)",
      customsClearance: "In Process - Maktoub pending at Islam Qala Gomrok",
      cleanTitle: true,
      mileage: 1200,
      fuelType: "Petrol",
      transmission: "Automatic",
      driveType: "4WD",
      color: "Sonic Titanium",
      status: "In Transit",
      yardLocation: "Islam Qala Border Compound - Bay 4",
      purchasePrice: 142000,
      freightCost: 3400,
      customsDuty: 24800,
      repairCost: 0,
      landedCost: 170200,
      minTargetPrice: 160000,
      sellingPrice: 168000,
      features: [
        "Executive VIP Seating",
        "Mark Levinson 25-Speaker Audio",
        "Active Height Control (AHC)",
        "Center Console Cool Box",
        "Rear Entertainment Screens",
        "360 Surround Monitor",
      ],
      description: "Dubai Port Free Zone direct import. GCC specification Lexus LX600 VIP currently in transit.",
      descriptionDari: "واردات مستقیم از منطقه آزاد دبی، مشخصات خلیجی لکسس LX600 VIP در حال ترانزیت.",
      descriptionPashto: "له دوبۍ څخه مستقیم وارد شوی، د خلیج مشخصاتو لکسس LX600 وی آی پی.",
      conditionNotes: {
        interior: "Pristine Factory Condition (New)",
        exterior: "Export Wrapped & Protected",
        engine: "Zero-Hour Tested",
        tires: "Original Dunlop Grandtrek",
        accidentHistory: "Clean Title (No Accidents)",
      },
      images: [
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1200&q=80",
      ],
      documents: [],
      viewsCount: 14,
      inquiriesCount: 2,
    };

    try {
      const savedVehicle = await addVehicle(demoVehicle);
      setVehicleMilestones((prev) => ({ ...prev, [savedVehicle.id]: 2 }));
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Unable to dispatch shipment", "error");
      return;
    }
    addToast(`Dispatched new transit shipment: 2024 Lexus LX600 (${newStock}) en route from Dubai!`, "success");
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Google Cloud Console Corridor Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-[#E2E8F0] dark:border-[#262F40]">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-0.5">
            <span>Dogharoun → Islam Qala Border Corridor</span>
            <span>·</span>
            <span className="font-semibold text-[#1A73E8] dark:text-[#8AB4F8]">
              TIR Carnet & Gomrok Manifest
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white">
            {language === "ps"
              ? "د اسلام قلعه او ترانزیت لوژستیکي مدیریت"
              : language === "fa"
              ? "لوجستیک بندر، ترانزیت و گمرک اسلام قلعه"
              : "Port Logistics & Islam Qala Customs Tracker"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === "ps"
              ? "له دوبۍ او نړیوالو بندرونو څخه تر اسلام قلعه او د سدوزي موټرو ګودام پورې د موټرونو تعقیب"
              : language === "fa"
              ? "ردیابی موترها از بنادر دبی و چابهار از طریق مرز اسلام قلعه تا نندارتون مرکزی هرات"
              : "Real-time pipeline tracking from Dubai / Chabahar ports through Islam Qala border to Herat lot"}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <MuiButton
            variant="outlined"
            size="small"
            onClick={handleDispatchDemoShipment}
            startIcon={<Plus className="h-4 w-4" />}
          >
            + Dispatch Dubai Transit
          </MuiButton>
          <Link href="/intake">
            <MuiButton
              variant="contained"
              size="small"
              startIcon={<Truck className="h-4 w-4" />}
            >
              {language === "ps" ? "د نوي موټر ثبتول" : language === "fa" ? "ثبت موتر ترانزیتی" : "Intake Transit Stock"}
            </MuiButton>
          </Link>
        </div>
      </div>

      {/* 1px Hairline Corridor Ledger Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#E2E8F0] dark:bg-[#262F40] border border-[#E2E8F0] dark:border-[#262F40] rounded-lg overflow-hidden">
        <div className="bg-white dark:bg-[#161B26] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>In-Transit Fleet</span>
            <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400 font-bold">TRANSIT</span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-[#0F172A] dark:text-white">
            {inTransitVehicles.length} Units
          </div>
          <div className="mt-2 pt-2 border-t border-[#E2E8F0] dark:border-[#1E2636] flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>FOB Value</span>
            <span className="font-bold text-[#0F172A] dark:text-slate-200 tabular-nums">
              ${totalInTransitValueUSD.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#161B26] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Islam Qala Gomrok</span>
            <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">BORDER</span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-[#0F172A] dark:text-white">
            {vehiclesAtGomrokCount} Units
          </div>
          <div className="mt-2 pt-2 border-t border-[#E2E8F0] dark:border-[#1E2636] flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Clearance</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              Appraisal Active
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#161B26] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Projected Tariffs</span>
            <span className="font-mono text-[11px] text-[#1A73E8] dark:text-[#8AB4F8] font-bold">DUTY</span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-[#0F172A] dark:text-white">
            ${totalCustomsDuesUSD.toLocaleString()}
          </div>
          <div className="mt-2 pt-2 border-t border-[#E2E8F0] dark:border-[#1E2636] flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>AFN Equiv</span>
            <span className="tabular-nums text-[#0F172A] dark:text-slate-300">
              ؋ {(totalCustomsDuesUSD * exchangeRate).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#161B26] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Corridor Lead Time</span>
            <span className="font-mono text-[11px] text-slate-500 font-bold">SLA</span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-[#0F172A] dark:text-white">
            12–16 Days
          </div>
          <div className="mt-2 pt-2 border-t border-[#E2E8F0] dark:border-[#1E2636] flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Route</span>
            <span className="text-[#0F172A] dark:text-slate-300">Jebel Ali → Herat</span>
          </div>
        </div>
      </div>

      {/* Connected 1px Hairline 5-Stage Supply Chain Matrix */}
      <div className="rounded-lg border border-[#E2E8F0] dark:border-[#262F40] bg-white dark:bg-[#161B26] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[#E2E8F0] dark:border-[#1E2636] bg-[#F8FAFC] dark:bg-[#121722] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#0F172A] dark:text-white">
              Supply Chain Checkpoints
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Click any stage to filter manifest
            </span>
          </div>
          <button
            onClick={() => setActiveStageFilter("ALL")}
            className="text-xs font-semibold text-[#1A73E8] dark:text-[#8AB4F8] hover:underline cursor-pointer"
          >
            Show All ({vehicles.length})
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-px bg-[#E2E8F0] dark:bg-[#1E2636]">
          {PIPELINE_MILESTONES.map((m) => {
            const inStageCount = vehicles.filter(
              (v) => (vehicleMilestones[v.id] || (v.status === "In Transit" ? 3 : 5)) === m.id
            ).length;

            const isSelectedStage =
              (activeStageFilter === "PORT" && (m.id === 1 || m.id === 2)) ||
              (activeStageFilter === "CHABAHAR" && m.id === 3) ||
              (activeStageFilter === "GOMROK" && m.id === 4) ||
              (activeStageFilter === "ARRIVED" && m.id === 5);

            return (
              <div
                key={m.id}
                onClick={() => {
                  if (m.id === 1 || m.id === 2) setActiveStageFilter("PORT");
                  else if (m.id === 3) setActiveStageFilter("CHABAHAR");
                  else if (m.id === 4) setActiveStageFilter("GOMROK");
                  else setActiveStageFilter("ARRIVED");
                }}
                className={`p-3.5 transition-colors cursor-pointer relative ${
                  isSelectedStage
                    ? "bg-[#1A73E8]/[0.06] dark:bg-[#8AB4F8]/[0.1] border-t-2 border-t-[#1A73E8] dark:border-t-[#8AB4F8]"
                    : "bg-white dark:bg-[#161B26] hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center justify-between mb-2 font-mono">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Stage 0{m.id}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold tabular-nums ${
                      inStageCount > 0
                        ? "bg-[#1A73E8] text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    }`}
                  >
                    {inStageCount} Units
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#0F172A] dark:text-white leading-snug">
                  {language === "fa" || language === "ps" ? m.titleDari : m.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  {m.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Shipments Pipeline & Gomrok Duty Estimator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Pipeline Shipments & Milestones (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Controls & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setActiveStageFilter("ALL")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  activeStageFilter === "ALL"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                All ({vehicles.length})
              </button>
              <button
                onClick={() => setActiveStageFilter("IN_TRANSIT")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  activeStageFilter === "IN_TRANSIT"
                    ? "bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-2xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                In Transit ({inTransitVehicles.length})
              </button>
              <button
                onClick={() => setActiveStageFilter("GOMROK")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  activeStageFilter === "GOMROK"
                    ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                At Islam Qala ({vehiclesAtGomrokCount})
              </button>
              <button
                onClick={() => setActiveStageFilter("ARRIVED")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  activeStageFilter === "ARRIVED"
                    ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-2xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                On Lot ({lotVehicles.length})
              </button>
            </div>

            <div className="relative min-w-[160px] sm:w-48">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search VIN or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Shipments List */}
          {pipelineVehicles.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#121824]">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                No shipments found matching the active filter
              </h4>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
                Try switching the corridor filter or dispatch a new Dubai transit test shipment above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pipelineVehicles.map((veh) => {
                const currentStage = vehicleMilestones[veh.id] || (veh.status === "In Transit" ? 3 : 5);
                const milestoneInfo = PIPELINE_MILESTONES[currentStage - 1];

                return (
                  <div
                    key={veh.id}
                    className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#121824] shadow-xs hover:border-blue-500/40 transition-all space-y-3"
                  >
                    {/* Header Strip: Vehicle Photo & Core Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative h-14 w-20 shrink-0 rounded-lg overflow-hidden border border-slate-200/90 dark:border-slate-750 bg-slate-100 dark:bg-slate-800">
                          <Image
                            src={
                              veh.images[0] ||
                              "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=600&q=80"
                            }
                            alt={veh.model}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {veh.year} {veh.make} {veh.model}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              ({veh.trim || "Standard"})
                            </span>
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${
                                veh.status === "In Transit"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              }`}
                            >
                              {veh.status}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            VIN: {veh.vin} • Origin: {veh.originCountry} • Stock #{veh.stockNumber}
                          </div>
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 font-mono">
                            Landed: ${veh.landedCost?.toLocaleString() || (veh.purchasePrice + 2000).toLocaleString()} (Customs: ${veh.customsDuty?.toLocaleString() || "N/A"})
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center sm:flex-col sm:items-end gap-1.5 shrink-0">
                        <Link href={`/vehicles/${veh.id}`}>
                          <MuiButton
                            variant="outlined"
                            size="small"
                            sx={{ fontSize: "11px", py: "2px", px: "8px" }}
                          >
                            Dossier
                          </MuiButton>
                        </Link>
                        {veh.status === "In Transit" && (
                          <MuiButton
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleDirectClearGomrok(veh)}
                            startIcon={<CheckCircle2 className="h-3 w-3" />}
                            sx={{ fontSize: "11px", py: "2px", px: "8px" }}
                          >
                            Clear Gomrok
                          </MuiButton>
                        )}
                      </div>
                    </div>

                    {/* Interactive Milestone Corridor Progress Bar */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Current Stage:
                          </span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {milestoneInfo.title}
                          </span>
                        </div>
                        {currentStage < 5 && (
                          <button
                            onClick={() => handleAdvanceMilestone(veh)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            Advance to {currentStage === 4 ? "Showroom Lot" : "Next Stage"}
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      {/* Visual 5-segment bar */}
                      <div className="grid grid-cols-5 gap-1.5">
                        {PIPELINE_MILESTONES.map((step) => {
                          const isCompleted = step.id < currentStage;
                          const isCurrent = step.id === currentStage;
                          return (
                            <div
                              key={step.id}
                              className={`h-2 rounded-full transition-all ${
                                isCompleted
                                  ? "bg-emerald-500"
                                  : isCurrent
                                  ? "bg-blue-600 animate-pulse"
                                  : "bg-slate-200 dark:bg-slate-800"
                              }`}
                              title={`${step.id}. ${step.title}`}
                            />
                          );
                        })}
                      </div>

                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                        <span>1. Dubai / Port</span>
                        <span>3. Chabahar Transit</span>
                        <span>4. Islam Qala Gomrok</span>
                        <span>5. Herat Lot</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Afghan Gomrok Customs Duty Estimator (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#121824] shadow-xs space-y-3 sticky top-4">
            <div className="pb-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Islam Qala Customs Estimator
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Official MoF Tariff</span>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Purchase Invoice / FOB Value (USD)
                </label>
                <MuiTextField
                  type="number"
                  size="small"
                  fullWidth
                  value={vehicleValueUSD}
                  onChange={(e) => setVehicleValueUSD(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Displacement (CC)
                  </label>
                  <MuiTextField
                    select
                    size="small"
                    fullWidth
                    value={engineCC}
                    onChange={(e) => setEngineCC(e.target.value)}
                  >
                    <MenuItem value="1800">1,800 cc (Compact)</MenuItem>
                    <MenuItem value="2500">2,500 cc (Camry / RAV4)</MenuItem>
                    <MenuItem value="3500">3,500 cc (Prado V6 / LX600)</MenuItem>
                    <MenuItem value="4000">4,000 cc (LC300 V6 TT)</MenuItem>
                    <MenuItem value="5700">5,700 cc (LC200 / LX570 V8)</MenuItem>
                  </MuiTextField>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Powertrain Tech
                  </label>
                  <MuiTextField
                    select
                    size="small"
                    fullWidth
                    value={calcFuelType}
                    onChange={(e) => setCalcFuelType(e.target.value as any)}
                  >
                    <MenuItem value="petrol">Standard Petrol</MenuItem>
                    <MenuItem value="hybrid">Hybrid (-30% Green Discount)</MenuItem>
                    <MenuItem value="electric">Electric (-50% Tariff)</MenuItem>
                  </MuiTextField>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Origin Shipping Port
                </label>
                <MuiTextField
                  select
                  size="small"
                  fullWidth
                  value={selectedOrigin}
                  onChange={(e) => setSelectedOrigin(e.target.value)}
                >
                  <MenuItem value="UAE / Dubai">Jebel Ali Port / Dubai (UAE)</MenuItem>
                  <MenuItem value="Korea / Incheon">Incheon Port (South Korea)</MenuItem>
                  <MenuItem value="USA / Houston">Houston / Savannah (USA)</MenuItem>
                  <MenuItem value="Germany / Hamburg">Hamburg Port (Germany)</MenuItem>
                </MuiTextField>
              </div>

              {/* Duty Breakdown Result Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                  <span>Customs Duty Tariff ({(tariffRate * 100).toFixed(0)}%):</span>
                  <span className="font-mono font-semibold">${estimatedDutyUSD.toLocaleString()} USD</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                  <span>Islam Qala Dry Port Handling:</span>
                  <span className="font-mono font-semibold">${portHandlingFeeUSD} USD</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                  <span>TIR Carnet & Border Convoy Escort:</span>
                  <span className="font-mono font-semibold">${transitEscortFeeUSD} USD</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                  <span>Herat Municipality Road Maintenance:</span>
                  <span className="font-mono font-semibold">${municipalityRoadTaxUSD} USD</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                  <span>Afghan Red Crescent Stamp Fee:</span>
                  <span className="font-mono font-semibold">${redCrescentFeeUSD} USD</span>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs font-bold text-slate-900 dark:text-white">
                  <span>Total Clearance Tariffs:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    ${totalClearanceUSD.toLocaleString()} USD
                  </span>
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-0.5">
                  <span>In Afghan Afghani (AFN):</span>
                  <span className="text-slate-900 dark:text-white font-bold">
                    {(totalClearanceUSD * exchangeRate).toLocaleString()} ؋
                  </span>
                </div>
              </div>

              {/* Informative Note Box */}
              <div className="p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 text-[10px] text-blue-800 dark:text-blue-300 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                  Official Gomrok Maktoub Compliance
                </div>
                <p>
                  Tariff calculations match the Afghan Ministry of Finance customs scale for Herat Dry Port. Clean chassis titles require official clearing documentation before lot release.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
