"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { formatCurrency } from "@/lib/utils";
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
} from "lucide-react";

export default function LogisticsAndCustomsPage() {
  const { vehicles, updateVehicle, addToast, currency, exchangeRate, language } = useShowroomStore();
  const t = translations[language];

  const inTransitVehicles = vehicles.filter((v) => v.status === "In Transit");
  const lotVehicles = vehicles.filter((v) => v.status === "Available on Lot");

  // Customs Duty Calculator State
  const [engineCC, setEngineCC] = useState("3500");
  const [vehicleValueUSD, setVehicleValueUSD] = useState("32000");
  const [calcFuelType, setCalcFuelType] = useState<"petrol" | "hybrid" | "electric">("petrol");
  const [calcModelYear, setCalcModelYear] = useState("2022");

  // Calculate Afghan Gomrok Duty
  const baseValue = Number(vehicleValueUSD) || 0;
  const cc = Number(engineCC) || 2000;
  let tariffRate = 0.16; // Standard base 16%

  if (cc > 4000) {
    tariffRate = 0.25; // 25% for high-displacement V8 (Land Cruiser 5.7 / LX570)
  } else if (cc > 2500) {
    tariffRate = 0.20; // 20% for 2.5L - 4.0L
  } else {
    tariffRate = 0.14; // 14% for compact engines
  }

  // Hybrid / EV green incentive discount (30% tariff reduction)
  if (calcFuelType === "hybrid") {
    tariffRate *= 0.70;
  } else if (calcFuelType === "electric") {
    tariffRate *= 0.50;
  }

  const estimatedDutyUSD = Math.round(baseValue * tariffRate);
  const portHandlingFeeUSD = 450;
  const transitEscortFeeUSD = 280;
  const municipalityRoadTaxUSD = 150;
  const totalClearanceUSD = estimatedDutyUSD + portHandlingFeeUSD + transitEscortFeeUSD + municipalityRoadTaxUSD;

  // Transit pipeline milestones definition
  const milestones = [
    {
      id: 1,
      title: "Port of Origin (UAE / Korea / USA)",
      titleDari: "بندر مبدأ (دبی / کوریا / امریکا)",
      desc: "Purchased, export title verified, container stuffed & shipped.",
      icon: Anchor,
      color: "bg-blue-500",
    },
    {
      id: 2,
      title: "High Seas Ocean Freight",
      titleDari: "حمل و نقل دریایی بین‌المللی",
      desc: "Vessel transit to Arabian Sea / Persian Gulf terminals.",
      icon: Compass,
      color: "bg-indigo-500",
    },
    {
      id: 3,
      title: "Bandar Abbas / Chabahar Transit",
      titleDari: "ترانزیت بندر عباس / چابهار",
      desc: "Port unloading, TIR carnet escort to Dogharoun border.",
      icon: Truck,
      color: "bg-amber-500",
    },
    {
      id: 4,
      title: "Islam Qala Customs (Gomrok Herat)",
      titleDari: "گمرک اسلام قلعه و تفتیش هرات",
      desc: "Physical chassis inspection, customs duty appraisal & tax clearance.",
      icon: ShieldCheck,
      color: "bg-emerald-500",
    },
    {
      id: 5,
      title: "Sadozai Motors Herat Lot Arrival",
      titleDari: "ورود به نمایشگاه سدوزی هرات",
      desc: "Professional detailing, 40+ photo vault, ready for customer handover.",
      icon: Building2,
      color: "bg-purple-500",
    },
  ];

  const handleMarkArrived = (id: string, make: string, model: string) => {
    updateVehicle(id, {
      status: "Available on Lot",
      customsClearance: "Islam Qala Gomrok - Verified & Cleared",
    });
    addToast(
      `${make} ${model} successfully cleared Islam Qala customs and marked as Available on Lot!`,
      "success"
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              {language === "ps"
                ? "د اسلام قلعه او ترانزیت لوژستیکي مدیریت"
                : language === "fa"
                ? "لوجستیک بندر، ترانزیت و گمرک اسلام قلعه"
                : "Port Logistics & Islam Qala Customs Tracker"}
              <MuiChip label="Dry Port Herat" size="small" color="primary" />
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === "ps"
                ? "له دوبۍ او نړیوالو بندرونو څخه تر اسلام قلعه او د سدوزي موټرو ګودام پورې د موټرونو تعقیب"
                : language === "fa"
                ? "ردیابی موترها از بنادر دبی و چابهار از طریق مرز اسلام قلعه تا نندارتون مرکزی هرات"
                : "Real-time pipeline tracking from Dubai / Chabahar ports through Islam Qala border to Herat lot"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/intake">
            <MuiButton
              variant="contained"
              size="small"
              startIcon={<Sparkles className="h-4 w-4" />}
            >
              {language === "ps" ? "د نوي موټر ثبتول" : language === "fa" ? "ثبت موتر ترانزیتی" : "Intake Transit Stock"}
            </MuiButton>
          </Link>
        </div>
      </div>

      {/* Transit Pipeline Stepper */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#121824] shadow-xs">
        <div className="mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Automotive Supply Chain Corridor
          </span>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            {language === "ps"
              ? "له مبدأ څخه تر هرات نندارتون پورې ۵ لوژستیکي پړاوونه"
              : language === "fa"
              ? "مراحل ۵ گانه ترانزیت، بارگیری و ترخیص گمرکی موترها"
              : "5-Stage Port-to-Showroom Transit & Clearance Pipeline"}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
          {milestones.map((m) => (
            <div
              key={m.id}
              className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 relative group hover:border-blue-500/40 transition-all"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-mono font-bold flex items-center justify-center text-slate-700 dark:text-slate-300">
                  {m.id}
                </span>
                <span className="p-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <m.icon className="h-3.5 w-3.5" />
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {language === "fa" || language === "ps" ? m.titleDari : m.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                {m.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Active In-Transit Vehicles & Gomrok Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Active In-Transit Shipments (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Truck className="h-4 w-4 text-amber-500" />
              {language === "ps"
                ? `په ترانزیت کې موټرونه (${inTransitVehicles.length})`
                : language === "fa"
                ? `موترهای در حال ترانزیت به هرات (${inTransitVehicles.length})`
                : `Shipments En Route to Herat (${inTransitVehicles.length})`}
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Via Islam Qala Port Corridor
            </span>
          </div>

          {inTransitVehicles.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#121824]">
              <CheckCircle2 className="h-9 w-9 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                All Inventory Units Safely on Showroom Lot
              </h4>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
                There are no open transit shipments. Click "Intake Transit Stock" to record incoming vehicles from Dubai or Korea.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {inTransitVehicles.map((veh) => (
                <div
                  key={veh.id}
                  className="p-3 rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#121824] shadow-xs hover:border-blue-500/40 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative h-14 w-20 shrink-0 rounded-lg overflow-hidden border border-slate-200/90 dark:border-slate-750">
                        <Image
                          src={veh.images[0] || "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=600&q=80"}
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
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            In Transit
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          VIN: {veh.vin} • Origin: {veh.originCountry}
                        </div>
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 font-mono">
                          Landed: ${veh.landedCost.toLocaleString()} (Customs: ${veh.customsDuty.toLocaleString()})
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800/80 shrink-0">
                      <Link href={`/vehicles/${veh.id}`}>
                        <MuiButton variant="outlined" size="small" sx={{ fontSize: "11px", py: "3px", px: "8px" }}>
                          View Dossier
                        </MuiButton>
                      </Link>
                      <MuiButton
                        variant="contained"
                        color="success"
                        size="small"
                        sx={{ fontSize: "11px", py: "3px", px: "8px" }}
                        onClick={() => handleMarkArrived(veh.id, veh.make, veh.model)}
                        startIcon={<CheckCircle2 className="h-3 w-3" />}
                      >
                        Clear Gomrok
                      </MuiButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Afghan Gomrok Customs Duty Estimator (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#121824] shadow-xs space-y-3">
            <div className="pb-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Herat Gomrok Customs Estimator
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">MoF Tariff Scale</span>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Invoice / Purchase Value (USD)
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
                    <MenuItem value="3500">3,500 cc (Prado V6)</MenuItem>
                    <MenuItem value="4000">4,000 cc (LC300 V6 TT)</MenuItem>
                    <MenuItem value="5700">5,700 cc (LC200 / LX570)</MenuItem>
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
                    <MenuItem value="hybrid">Hybrid (-30% Tariff)</MenuItem>
                    <MenuItem value="electric">Electric (-50% Tariff)</MenuItem>
                  </MuiTextField>
                </div>
              </div>

              {/* Duty Breakdown Result Box */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                  <span>Customs Duty ({(tariffRate * 100).toFixed(0)}%):</span>
                  <span className="font-mono font-semibold">${estimatedDutyUSD.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                  <span>Islam Qala Dry Port Terminal Handling:</span>
                  <span className="font-mono font-semibold">${portHandlingFeeUSD}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                  <span>TIR Carnet & Border Escort:</span>
                  <span className="font-mono font-semibold">${transitEscortFeeUSD}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                  <span>Herat Municipality Road Maintenance:</span>
                  <span className="font-mono font-semibold">${municipalityRoadTaxUSD}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs font-bold text-slate-900 dark:text-white">
                  <span>Total Landed Tariffs:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    ${totalClearanceUSD.toLocaleString()} USD
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block text-right font-mono">
                  ≈ {(totalClearanceUSD * exchangeRate).toLocaleString()} AFN
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
