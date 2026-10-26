"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { VehicleItem } from "@/lib/mock-data";
import {
  MuiButton,
  MuiTextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@/components/mui";
import {
  Truck,
  Anchor,
  Compass,
  ShieldCheck,
  Calculator,
  ArrowRight,
  CheckCircle2,
  Building2,
  Search,
  Plus,
  Car,
  X,
} from "lucide-react";

export default function LogisticsAndCustomsPage() {
  const {
    vehicles,
    updateVehicle,
    addVehicle,
    addToast,
    exchangeRate,
    language,
    currentRole,
    clientPresentationMode,
    branding,
    setInspectedVehicleId,
  } = useShowroomStore();

  const t = translations[language];
  const showFinancialMargins =
    !clientPresentationMode &&
    (currentRole === "SuperAdmin" || currentRole === "Accountant");

  const dealershipTitle =
    language === "ps"
      ? branding?.dealershipNamePs || branding?.dealershipName || "Aria Motors"
      : language === "fa"
      ? branding?.dealershipNameFa || branding?.dealershipName || "آریا موتورز"
      : branding?.dealershipName || "Aria Motors";
  const customsTerminal = branding?.customsTerminalBranch || "Islam Qala Gomrok";

  // 5 Transit Pipeline Milestones bound to dynamic branding
  const pipelineMilestones = useMemo(
    () => [
      {
        id: 1,
        title: "Port of Origin (Dubai / Japan / USA)",
        titleDari: "بندر مبدأ (دبی / جاپان / امریکا)",
        titlePashto: "د پیل بندر (دوبۍ / جاپان / امریکا)",
        desc: "Export title verified, container stuffed, B/L issued.",
        icon: Anchor,
      },
      {
        id: 2,
        title: "High Seas Ocean Freight",
        titleDari: "حمل و نقل دریایی بین‌المللی",
        titlePashto: "نړیوال سمندري بار وړل",
        desc: "Vessel navigation across Arabian Sea to Gulf ports.",
        icon: Compass,
      },
      {
        id: 3,
        title: "Bandar Abbas / Chabahar Transit",
        titleDari: "ترانزیت بندر عباس / چابهار",
        titlePashto: "د بندر عباس / چابهار ترانزیت",
        desc: "Port discharge, TIR carnet escort convoy to border.",
        icon: Truck,
      },
      {
        id: 4,
        title: `${customsTerminal} Inspection`,
        titleDari: "گمرک اسلام قلعه و تفتیش مرزی",
        titlePashto: "د اسلام قلعه ګمرک او تفتیش",
        desc: "Physical chassis audit, MoF tariff appraisal & tax clearance.",
        icon: ShieldCheck,
      },
      {
        id: 5,
        title: `${branding?.dealershipName || "Aria Motors"} Lot Arrival`,
        titleDari: `ورود به محوطه ${branding?.dealershipNameFa || "نمایشگاه"}`,
        titlePashto: `د ${branding?.dealershipNamePs || branding?.dealershipName || "نمایشگاه"} محوطې ته رسیدل`,
        desc: "PDI detailing, photo gallery & client delivery ready.",
        icon: Building2,
      },
    ],
    [
      branding?.dealershipName,
      branding?.dealershipNameFa,
      branding?.dealershipNamePs,
      customsTerminal,
    ]
  );

  // Pipeline Filter Tab State
  const [activeStageFilter, setActiveStageFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Customs Duty Calculator State
  const [engineCC, setEngineCC] = useState("3500");
  const [vehicleValueUSD, setVehicleValueUSD] = useState("32000");
  const [calcFuelType, setCalcFuelType] = useState<"petrol" | "hybrid" | "electric">("petrol");
  const [selectedOrigin, setSelectedOrigin] = useState("UAE / Dubai");

  // Dispatch Transit Shipment Modal State
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [dispatchBusy, setDispatchBusy] = useState(false);
  const [dispatchForm, setDispatchForm] = useState({
    make: "Toyota",
    model: "Land Cruiser Prado",
    year: new Date().getFullYear(),
    trim: "TX.L V6 GCC",
    vin: "",
    color: "Pearl White",
    bodyType: "SUV" as VehicleItem["bodyType"],
    originCountry: "UAE" as VehicleItem["originCountry"],
    fuelType: "Petrol" as VehicleItem["fuelType"],
    initialStage: 1,
    purchasePrice: 42000,
    freightCost: 1800,
    customsDuty: 6400,
    sellingPrice: 54500,
  });

  const getVehicleStage = (veh: VehicleItem): number => {
    const saved = veh.conditionNotes?.logisticsStage;
    if (typeof saved === "number" && saved >= 1 && saved <= 5) {
      return veh.status === "Available on Lot" || veh.status === "Sold" ? 5 : saved;
    }
    return veh.status === "In Transit" ? 3 : 5;
  };

  // Calculate Afghan Gomrok Duty
  const baseValue = Number(vehicleValueUSD) || 0;
  const cc = Number(engineCC) || 2000;
  let tariffRate = 0.16;

  if (cc > 4000) {
    tariffRate = 0.25;
  } else if (cc > 2500) {
    tariffRate = 0.20;
  } else {
    tariffRate = 0.14;
  }

  if (calcFuelType === "hybrid") {
    tariffRate *= 0.7;
  } else if (calcFuelType === "electric") {
    tariffRate *= 0.5;
  }

  const estimatedDutyUSD = Math.round(baseValue * tariffRate);
  const portHandlingFeeUSD = 450;
  const transitEscortFeeUSD = 280;
  const municipalityRoadTaxUSD = 150;
  const redCrescentFeeUSD = 45;
  const totalClearanceUSD =
    estimatedDutyUSD +
    portHandlingFeeUSD +
    transitEscortFeeUSD +
    municipalityRoadTaxUSD +
    redCrescentFeeUSD;

  // Filter in-transit vs lot vehicles
  const inTransitVehicles = useMemo(
    () => vehicles.filter((v) => v.status === "In Transit"),
    [vehicles]
  );

  const lotVehicles = useMemo(
    () => vehicles.filter((v) => v.status === "Available on Lot"),
    [vehicles]
  );

  // Combined pipeline shipments
  const pipelineVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const stage = getVehicleStage(v);

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
  }, [vehicles, activeStageFilter, searchQuery]);

  // Aggregate Corridor Metrics
  const totalInTransitValueUSD = useMemo(
    () =>
      inTransitVehicles.reduce(
        (sum, v) =>
          sum +
          (showFinancialMargins
            ? v.landedCost || v.purchasePrice || 0
            : v.sellingPrice || 0),
        0
      ),
    [inTransitVehicles, showFinancialMargins]
  );

  const totalCustomsDuesUSD = useMemo(
    () => inTransitVehicles.reduce((sum, v) => sum + (v.customsDuty || 0), 0),
    [inTransitVehicles]
  );

  const vehiclesAtGomrokCount = useMemo(
    () => vehicles.filter((v) => getVehicleStage(v) === 4).length,
    [vehicles]
  );

  // Advance milestone & persist in conditionNotes.logisticsStage
  const handleAdvanceMilestone = async (vehicle: VehicleItem) => {
    const current = getVehicleStage(vehicle);
    if (current >= 5) return;
    const next = current + 1;
    const arrivingOnLot = next === 5;

    try {
      await updateVehicle(vehicle.id, {
        status: arrivingOnLot ? "Available on Lot" : "In Transit",
        customsClearance: arrivingOnLot
          ? `${customsTerminal} - Verified & Cleared`
          : vehicle.customsClearance,
        conditionNotes: {
          ...vehicle.conditionNotes,
          logisticsStage: next,
        },
      });
      addToast(
        arrivingOnLot
          ? `${vehicle.make} ${vehicle.model} cleared ${customsTerminal} and is now Available on Lot!`
          : `${vehicle.make} ${vehicle.model} advanced to: ${pipelineMilestones[next - 1].title}`,
        arrivingOnLot ? "success" : "info"
      );
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Unable to update transit stage",
        "error"
      );
    }
  };

  // Quick action: Clear Gomrok directly
  const handleDirectClearGomrok = async (vehicle: VehicleItem) => {
    try {
      await updateVehicle(vehicle.id, {
        status: "Available on Lot",
        customsClearance: `${customsTerminal} - Cleared via Official Maktoub`,
        conditionNotes: {
          ...vehicle.conditionNotes,
          logisticsStage: 5,
        },
      });
      addToast(
        `${vehicle.year} ${vehicle.make} ${vehicle.model} customs clearance finalized!`,
        "success"
      );
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Unable to update customs clearance",
        "error"
      );
    }
  };

  // Dispatch Real Transit Vehicle via Modal
  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchForm.make.trim() || !dispatchForm.model.trim() || !dispatchForm.vin.trim()) {
      addToast("Please enter Make, Model, and Chassis VIN.", "warning");
      return;
    }

    setDispatchBusy(true);
    const shortCode = branding?.dealershipShortCode || "ARIA";
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const stockNumber = `${shortCode}-TRN-${suffix}`;
    const purchasePrice = Number(dispatchForm.purchasePrice) || 0;
    const freightCost = Number(dispatchForm.freightCost) || 0;
    const customsDuty = Number(dispatchForm.customsDuty) || 0;
    const landedCost = purchasePrice + freightCost + customsDuty;
    const sellingPrice = Number(dispatchForm.sellingPrice) || landedCost;

    try {
      await addVehicle({
        stockNumber,
        vin: dispatchForm.vin.trim().toUpperCase(),
        make: dispatchForm.make.trim(),
        model: dispatchForm.model.trim(),
        year: Number(dispatchForm.year) || new Date().getFullYear(),
        trim: dispatchForm.trim.trim() || "Standard",
        bodyType: dispatchForm.bodyType,
        originCountry: dispatchForm.originCountry,
        steering: "Left-Hand Drive (LHD)",
        customsClearance: `In Transit - Pending ${customsTerminal}`,
        cleanTitle: true,
        mileage: 0,
        fuelType: dispatchForm.fuelType,
        transmission: "Automatic",
        driveType: "4WD",
        color: dispatchForm.color.trim() || "White",
        status: "In Transit",
        yardLocation: `In Transit (${dispatchForm.originCountry} Corridor)`,
        purchasePrice,
        freightCost,
        customsDuty,
        repairCost: 0,
        landedCost,
        minTargetPrice: Math.max(landedCost, Math.round(sellingPrice * 0.96)),
        sellingPrice,
        features: ["Export Certificate Verified", "TIR Bonded Transit"],
        description: `${dispatchForm.originCountry} direct import dispatched into transit corridor.`,
        descriptionDari: `واردات مستقیم از ${dispatchForm.originCountry} در مسیر ترانزیت.`,
        descriptionPashto: `له ${dispatchForm.originCountry} څخه مستقیم واردات په ترانزیت کې.`,
        conditionNotes: {
          interior: "Export Inspected",
          exterior: "Transit Protected",
          engine: "Verified at Port",
          tires: "OEM Standard",
          accidentHistory: "Clean Export Title",
          logisticsStage: dispatchForm.initialStage,
        },
        images: [],
        documents: [],
      });
      setIsDispatchOpen(false);
      setDispatchForm((prev) => ({ ...prev, vin: "" }));
      addToast(
        `Dispatched ${dispatchForm.year} ${dispatchForm.make} ${dispatchForm.model} (${stockNumber}) at Stage ${dispatchForm.initialStage}`,
        "success"
      );
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Unable to dispatch transit shipment",
        "error"
      );
    } finally {
      setDispatchBusy(false);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Corridor Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-[#E2E8F0] dark:border-[#262F40]">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-0.5">
            <span>{dealershipTitle}</span>
            <span>·</span>
            <span className="font-semibold text-[#1A73E8] dark:text-[#8AB4F8]">
              TIR Carnet &amp; {customsTerminal} Manifest
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white">
            {language === "ps"
              ? "د اسلام قلعه او ترانزیت لوژستیکي مدیریت"
              : language === "fa"
              ? "لوجستیک بندر، ترانزیت و گمرک اسلام قلعه"
              : "Port Logistics & Customs Corridor Tracker"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === "ps"
              ? `له نړیوالو بندرونو څخه تر ${customsTerminal} او د ${dealershipTitle} تر محوطې پورې د موټرو تعقیب`
              : language === "fa"
              ? `ردیابی موترها از بنادر بین‌المللی از طریق مرز تا محوطه ${dealershipTitle}`
              : `Real-time pipeline tracking from origin ports through ${customsTerminal} to ${dealershipTitle}`}
          </p>
        </div>

        {currentRole === "SuperAdmin" && (
          <div className="flex items-center gap-2 flex-wrap">
            <MuiButton
              variant="outlined"
              size="small"
              onClick={() => setIsDispatchOpen(true)}
              startIcon={<Plus className="h-4 w-4" />}
            >
              {language === "ps"
                ? "نوی ترانزیتي محموله"
                : language === "fa"
                ? "ثبت محموله ترانزیتی"
                : "Dispatch Transit Vehicle"}
            </MuiButton>
            <MuiButton
              component={Link}
              href="/intake"
              variant="contained"
              size="small"
              startIcon={<Truck className="h-4 w-4" />}
            >
              {language === "ps"
                ? "د نوي موټر ثبتول"
                : language === "fa"
                ? "ورود کامل موتر"
                : "Full Intake Wizard"}
            </MuiButton>
          </div>
        )}
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
            <span>{showFinancialMargins ? "Landed Basis" : "Retail Value"}</span>
            <span className="font-bold text-[#0F172A] dark:text-slate-200 tabular-nums">
              ${totalInTransitValueUSD.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#161B26] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{customsTerminal}</span>
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
            <span>{showFinancialMargins ? "Projected Tariffs" : "Cleared on Lot"}</span>
            <span className="font-mono text-[11px] text-[#1A73E8] dark:text-[#8AB4F8] font-bold">
              {showFinancialMargins ? "DUTY" : "READY"}
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-[#0F172A] dark:text-white">
            {showFinancialMargins
              ? `$${totalCustomsDuesUSD.toLocaleString()}`
              : `${lotVehicles.length} Units`}
          </div>
          <div className="mt-2 pt-2 border-t border-[#E2E8F0] dark:border-[#1E2636] flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>{showFinancialMargins ? "AFN Equiv" : "Status"}</span>
            <span className="tabular-nums text-[#0F172A] dark:text-slate-300">
              {showFinancialMargins
                ? `؋ ${(totalCustomsDuesUSD * exchangeRate).toLocaleString()}`
                : "Showroom Verified"}
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
          {pipelineMilestones.map((m) => {
            const inStageCount = vehicles.filter((v) => getVehicleStage(v) === m.id).length;

            const isSelectedStage =
              (activeStageFilter === "PORT" && (m.id === 1 || m.id === 2)) ||
              (activeStageFilter === "CHABAHAR" && m.id === 3) ||
              (activeStageFilter === "GOMROK" && m.id === 4) ||
              (activeStageFilter === "ARRIVED" && m.id === 5);

            return (
              <button
                type="button"
                key={m.id}
                onClick={() => {
                  if (m.id === 1 || m.id === 2) setActiveStageFilter("PORT");
                  else if (m.id === 3) setActiveStageFilter("CHABAHAR");
                  else if (m.id === 4) setActiveStageFilter("GOMROK");
                  else setActiveStageFilter("ARRIVED");
                }}
                className={`p-3.5 text-start transition-colors cursor-pointer relative ${
                  isSelectedStage
                    ? "bg-[#1A73E8]/[0.06] dark:bg-[#8AB4F8]/[0.1] border-t-2 border-t-[#1A73E8] dark:border-t-[#8AB4F8]"
                    : "bg-white dark:bg-[#161B26] hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center justify-between mb-2 font-mono">
                  <span className="text-[11px] font-semibold text-slate-400 tabular-nums">
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
                  {language === "ps"
                    ? m.titlePashto
                    : language === "fa"
                    ? m.titleDari
                    : m.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  {m.desc}
                </p>
              </button>
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
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                  activeStageFilter === "ALL"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                All ({vehicles.length})
              </button>
              <button
                onClick={() => setActiveStageFilter("IN_TRANSIT")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                  activeStageFilter === "IN_TRANSIT"
                    ? "bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-2xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                In Transit ({inTransitVehicles.length})
              </button>
              <button
                onClick={() => setActiveStageFilter("GOMROK")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                  activeStageFilter === "GOMROK"
                    ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                At Border ({vehiclesAtGomrokCount})
              </button>
              <button
                onClick={() => setActiveStageFilter("ARRIVED")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                  activeStageFilter === "ARRIVED"
                    ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-2xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                On Lot ({lotVehicles.length})
              </button>
            </div>

            <div className="relative min-w-[160px] sm:w-48">
              <Search className="h-3.5 w-3.5 absolute start-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                aria-label="Search VIN or model"
                placeholder="Search VIN or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full ps-8 pe-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Shipments List */}
          {pipelineVehicles.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#161B26]">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                No shipments found matching the active filter
              </h4>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
                Try switching the corridor filter above to view all vehicles.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pipelineVehicles.map((veh) => {
                const currentStage = getVehicleStage(veh);
                const milestoneInfo = pipelineMilestones[currentStage - 1];

                return (
                  <div
                    key={veh.id}
                    className="p-3.5 rounded-xl border border-slate-200/90 dark:border-[#262F40] bg-white dark:bg-[#161B26] shadow-xs hover:border-blue-500/40 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative h-14 w-20 shrink-0 rounded-lg overflow-hidden border border-slate-200/90 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          {veh.images[0] ? (
                            <Image
                              src={veh.images[0]}
                              alt={veh.model}
                              fill
                              unoptimized={veh.images[0].startsWith("data:")}
                              className="object-cover"
                            />
                          ) : (
                            <Car className="h-6 w-6 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Link
                              href={`/vehicles/${veh.id}`}
                              className="text-xs font-bold text-slate-900 dark:text-white hover:text-[#1A73E8] dark:hover:text-[#8AB4F8] truncate"
                            >
                              {veh.year} {veh.make} {veh.model}
                            </Link>
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
                          <div className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            VIN: {veh.vin} • Origin: {veh.originCountry} • Stock #{veh.stockNumber}
                          </div>
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 font-mono tabular-nums">
                            {showFinancialMargins
                              ? `Landed: $${(veh.landedCost || veh.purchasePrice).toLocaleString()} (Customs: $${(veh.customsDuty || 0).toLocaleString()})`
                              : `Retail Asking: $${veh.sellingPrice.toLocaleString()} USD`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center sm:flex-col sm:items-end gap-1.5 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setInspectedVehicleId(veh.id)}
                            className="px-2.5 py-1 rounded text-[11px] font-semibold border border-[#E2E8F0] dark:border-[#262F40] text-[#1A73E8] dark:text-[#8AB4F8] hover:bg-[#1A73E8]/10 transition-colors cursor-pointer"
                          >
                            Inspect
                          </button>
                          <MuiButton
                            component={Link}
                            href={`/vehicles/${veh.id}`}
                            variant="outlined"
                            size="small"
                            sx={{ fontSize: "11px", py: "2px", px: "8px" }}
                          >
                            Dossier
                          </MuiButton>
                        </div>
                        {veh.status === "In Transit" && currentRole !== "Accountant" && (
                          <MuiButton
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => void handleDirectClearGomrok(veh)}
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
                            {language === "ps"
                              ? milestoneInfo.titlePashto
                              : language === "fa"
                              ? milestoneInfo.titleDari
                              : milestoneInfo.title}
                          </span>
                        </div>
                        {currentStage < 5 && currentRole !== "Accountant" && (
                          <button
                            type="button"
                            onClick={() => void handleAdvanceMilestone(veh)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            Advance to {currentStage === 4 ? "Showroom Lot" : "Next Stage"}
                            <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-5 gap-1.5">
                        {pipelineMilestones.map((step) => {
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
                        <span>1. Origin Port</span>
                        <span>3. Chabahar Transit</span>
                        <span>4. {customsTerminal}</span>
                        <span>5. Showroom Lot</span>
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
          <div className="p-4 rounded-2xl border border-slate-200/90 dark:border-[#262F40] bg-white dark:bg-[#161B26] shadow-xs space-y-3 sticky top-4">
            <div className="pb-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {customsTerminal} Estimator
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
                    onChange={(e) =>
                      setCalcFuelType(e.target.value as "petrol" | "hybrid" | "electric")
                    }
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
                  <MenuItem value="Japan / Yokohama">Yokohama Port (Japan)</MenuItem>
                  <MenuItem value="USA / Houston">Houston / Savannah (USA)</MenuItem>
                  <MenuItem value="Germany / Hamburg">Hamburg Port (Europe)</MenuItem>
                </MuiTextField>
              </div>

              {/* Duty Breakdown Result Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 space-y-2 tabular-nums">
                <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                  <span>Customs Duty Tariff ({(tariffRate * 100).toFixed(0)}%):</span>
                  <span className="font-mono font-semibold">${estimatedDutyUSD.toLocaleString()} USD</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                  <span>Dry Port Handling:</span>
                  <span className="font-mono font-semibold">${portHandlingFeeUSD} USD</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                  <span>TIR Carnet &amp; Border Convoy Escort:</span>
                  <span className="font-mono font-semibold">${transitEscortFeeUSD} USD</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                  <span>Municipality Road Maintenance:</span>
                  <span className="font-mono font-semibold">${municipalityRoadTaxUSD} USD</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                  <span>Red Crescent Stamp Fee:</span>
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

              <div className="p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 text-[10px] text-blue-800 dark:text-blue-300 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                  Official Gomrok Maktoub Compliance
                </div>
                <p>
                  Tariff calculations match the Ministry of Finance customs scale. Clean chassis titles require official clearing documentation before showroom release.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dispatch Transit Shipment Modal */}
      <Dialog
        open={isDispatchOpen}
        onClose={() => !dispatchBusy && setIsDispatchOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-[#1A73E8]" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Dispatch Transit Shipment
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsDispatchOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogTitle>

        <form onSubmit={handleDispatchSubmit}>
          <DialogContent className="p-4 sm:p-6 space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <MuiTextField
                label="Make"
                required
                size="small"
                value={dispatchForm.make}
                onChange={(e) => setDispatchForm({ ...dispatchForm, make: e.target.value })}
              />
              <MuiTextField
                label="Model"
                required
                size="small"
                value={dispatchForm.model}
                onChange={(e) => setDispatchForm({ ...dispatchForm, model: e.target.value })}
              />
              <MuiTextField
                label="Year"
                type="number"
                required
                size="small"
                value={dispatchForm.year}
                onChange={(e) =>
                  setDispatchForm({ ...dispatchForm, year: Number(e.target.value) })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <MuiTextField
                label="Chassis VIN"
                required
                size="small"
                placeholder="JTEBU5JR8R50..."
                value={dispatchForm.vin}
                onChange={(e) => setDispatchForm({ ...dispatchForm, vin: e.target.value })}
              />
              <MuiTextField
                label="Trim / Spec"
                size="small"
                value={dispatchForm.trim}
                onChange={(e) => setDispatchForm({ ...dispatchForm, trim: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <MuiTextField
                select
                label="Origin Country"
                size="small"
                value={dispatchForm.originCountry}
                onChange={(e) =>
                  setDispatchForm({
                    ...dispatchForm,
                    originCountry: e.target.value as VehicleItem["originCountry"],
                  })
                }
              >
                <MenuItem value="UAE">UAE (Dubai)</MenuItem>
                <MenuItem value="Japan">Japan</MenuItem>
                <MenuItem value="USA">USA</MenuItem>
                <MenuItem value="Canada">Canada</MenuItem>
                <MenuItem value="Europe">Europe</MenuItem>
              </MuiTextField>

              <MuiTextField
                select
                label="Body Type"
                size="small"
                value={dispatchForm.bodyType}
                onChange={(e) =>
                  setDispatchForm({
                    ...dispatchForm,
                    bodyType: e.target.value as VehicleItem["bodyType"],
                  })
                }
              >
                <MenuItem value="SUV">SUV</MenuItem>
                <MenuItem value="Sedan">Sedan</MenuItem>
                <MenuItem value="Pickup">Pickup</MenuItem>
                <MenuItem value="Crossover">Crossover</MenuItem>
              </MuiTextField>

              <MuiTextField
                select
                label="Initial Stage"
                size="small"
                value={dispatchForm.initialStage}
                onChange={(e) =>
                  setDispatchForm({
                    ...dispatchForm,
                    initialStage: Number(e.target.value),
                  })
                }
              >
                <MenuItem value={1}>1. Origin Port</MenuItem>
                <MenuItem value={2}>2. Ocean Freight</MenuItem>
                <MenuItem value={3}>3. Chabahar Transit</MenuItem>
                <MenuItem value={4}>4. Border Gomrok</MenuItem>
              </MuiTextField>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MuiTextField
                label="FOB Price ($)"
                type="number"
                size="small"
                value={dispatchForm.purchasePrice}
                onChange={(e) =>
                  setDispatchForm({
                    ...dispatchForm,
                    purchasePrice: Number(e.target.value),
                  })
                }
              />
              <MuiTextField
                label="Freight ($)"
                type="number"
                size="small"
                value={dispatchForm.freightCost}
                onChange={(e) =>
                  setDispatchForm({
                    ...dispatchForm,
                    freightCost: Number(e.target.value),
                  })
                }
              />
              <MuiTextField
                label="Duty Est. ($)"
                type="number"
                size="small"
                value={dispatchForm.customsDuty}
                onChange={(e) =>
                  setDispatchForm({
                    ...dispatchForm,
                    customsDuty: Number(e.target.value),
                  })
                }
              />
              <MuiTextField
                label="Asking ($)"
                type="number"
                size="small"
                value={dispatchForm.sellingPrice}
                onChange={(e) =>
                  setDispatchForm({
                    ...dispatchForm,
                    sellingPrice: Number(e.target.value),
                  })
                }
              />
            </div>
          </DialogContent>

          <DialogActions className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <MuiButton
              variant="outlined"
              color="inherit"
              size="small"
              onClick={() => setIsDispatchOpen(false)}
              disabled={dispatchBusy}
            >
              Cancel
            </MuiButton>
            <MuiButton
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              disabled={dispatchBusy}
            >
              {dispatchBusy ? "Dispatching..." : "Dispatch Shipment"}
            </MuiButton>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
