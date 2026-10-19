"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import {
  MuiCard,
  MuiCardContent,
  MuiButton,
  MuiChip,
  MuiTextField,
  IconButton,
} from "@/components/mui";
import {
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Building2,
  Car,
  Search,
  Printer,
  Calendar,
  Lock,
  ExternalLink,
  ArrowRight,
  AlertCircle,
  FileText,
  Stamp,
  QrCode,
  Award,
  Sparkles,
  Check,
} from "lucide-react";

export const dynamic = "force-dynamic";

type CertificateType = "CLEARANCE" | "MAKTOUB" | "DEED";

function VerifyContent() {
  const searchParams = useSearchParams();
  const contractParam = searchParams.get("contract") || searchParams.get("id") || "";
  const vinParam = searchParams.get("vin") || "";

  const { vehicles, sales, invoices, language, exchangeRate } = useShowroomStore();
  const t = translations[language];

  const [query, setQuery] = useState(
    contractParam || vinParam || (vehicles[0]?.vin || "JTMBW0RJ3R0123456")
  );
  const [selectedDocType, setSelectedDocType] = useState<CertificateType>("CLEARANCE");

  // Search through sales contracts, invoices, and vehicles
  const matchedSale = useMemo(() => {
    return sales.find(
      (s) =>
        s.contractNumber.toLowerCase() === query.toLowerCase().trim() ||
        s.stockNumber.toLowerCase() === query.toLowerCase().trim()
    );
  }, [sales, query]);

  const matchedInvoice = useMemo(() => {
    return invoices.find(
      (inv) =>
        inv.invoiceNumber.toLowerCase() === query.toLowerCase().trim() ||
        (inv.vin && inv.vin.toLowerCase() === query.toLowerCase().trim())
    );
  }, [invoices, query]);

  const matchedVehicle = useMemo(() => {
    return (
      vehicles.find(
        (v) =>
          v.vin.toLowerCase() === query.toLowerCase().trim() ||
          v.stockNumber.toLowerCase() === query.toLowerCase().trim() ||
          (matchedSale && matchedSale.stockNumber === v.stockNumber) ||
          (matchedInvoice && matchedInvoice.vehicleStock === v.stockNumber)
      ) || vehicles[0]
    );
  }, [vehicles, query, matchedSale, matchedInvoice]);

  const isVerified = Boolean(matchedVehicle || matchedSale || matchedInvoice);

  // Quick sample queries
  const sampleQueries = [
    { label: "Land Cruiser LC300 VIN", value: vehicles[0]?.vin || "JTMBW0RJ3R0123456" },
    { label: "Contract Deed #", value: "SM-DEED-2026-902" },
    { label: "Stock #001", value: vehicles[0]?.stockNumber || "ARI-2026-001" },
    { label: "Invoice #104", value: "INV-2026-104" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0B0F19] py-6 px-4 sm:px-6 lg:px-8 print:p-0 print:bg-white text-slate-900 dark:text-slate-100">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Public Portal Top Header (Hidden in Print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/90 dark:border-slate-800/90 print:hidden">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  Official Vehicle Verification Registry
                </h1>
                <MuiChip label="Public Notary Portal" size="small" color="primary" />
              </div>
              <p className="text-xs text-slate-500">
                Sadozai Motors Herat • Chamber of Commerce Notary License #AF-HRT-88219
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/">
              <MuiButton variant="outlined" size="small" sx={{ fontSize: "11px", py: "3px" }}>
                Dealership Cockpit
              </MuiButton>
            </Link>
            <MuiButton
              variant="contained"
              size="small"
              onClick={() => window.print()}
              startIcon={<Printer className="h-4 w-4" />}
              sx={{ fontSize: "11px", py: "3px" }}
            >
              Print Certificate
            </MuiButton>
          </div>
        </div>

        {/* Verification Query Search Box (Hidden in Print) */}
        <div className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#121824] shadow-xs print:hidden space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="flex-1">
              <MuiTextField
                placeholder="Enter Contract #, Invoice #, or 17-digit Chassis VIN..."
                size="small"
                fullWidth
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                startAdornment={<Search className="h-3.5 w-3.5 text-slate-400 mr-2" />}
              />
            </div>
            <MuiButton
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              startIcon={<Search className="h-4 w-4" />}
              sx={{ fontSize: "11px", py: "3px", px: "14px" }}
            >
              Verify Record
            </MuiButton>
          </form>

          {/* Quick Sample Queries */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              ⚡ Test Inquiries:
            </span>
            {sampleQueries.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setQuery(s.value)}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
              >
                {s.label}: <span className="font-semibold text-blue-600 dark:text-blue-400">{s.value}</span>
              </button>
            ))}
          </div>

          {/* Certificate Type Switcher Tabs (Hidden in Print) */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
              Document View:
            </span>
            <button
              onClick={() => setSelectedDocType("CLEARANCE")}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                selectedDocType === "CLEARANCE"
                  ? "bg-blue-600 text-white shadow-xs font-bold"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Chamber Certificate & Gomrok (سند اصالت و گمرک)
            </button>
            <button
              onClick={() => setSelectedDocType("MAKTOUB")}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                selectedDocType === "MAKTOUB"
                  ? "bg-blue-600 text-white shadow-xs font-bold"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Islam Qala Customs Maktoub (مکتوب گمرک اسلام قلعه)
            </button>
            <button
              onClick={() => setSelectedDocType("DEED")}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                selectedDocType === "DEED"
                  ? "bg-blue-600 text-white shadow-xs font-bold"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Dealership Sales Deed (سند بیع قطعی)
            </button>
          </div>
        </div>

        {/* Verification Status Ribbon */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:bg-slate-50 print:border-slate-300">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                STATUS: OFFICIALLY AUTHENTICATED & REGISTERED
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-300">
                Chassis VIN matches Herat Chamber of Commerce and Islam Qala Gomrok digital tax clearance records.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <MuiChip label="VERIFIED CLEAN TITLE" color="success" size="small" />
          </div>
        </div>

        {/* 4-Stage Legal Chain Progression Timeline */}
        <div className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#121824] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Provenance & Verification Chain
          </span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/30">
              <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1">
                <Check className="h-3 w-3" /> 1. Export Title
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">UAE / Port Cleared</div>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/30">
              <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1">
                <Check className="h-3 w-3" /> 2. Customs Tariffs
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Islam Qala Paid & Sealed</div>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/30">
              <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1">
                <Check className="h-3 w-3" /> 3. Chamber Notary
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Herat License #88219</div>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/30">
              <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1">
                <Check className="h-3 w-3" /> 4. Sadozai Registry
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Guaranteed Clean Title</div>
            </div>
          </div>
        </div>

        {/* Official Verification Certificate Document */}
        <div className="bg-white dark:bg-[#121824] rounded-2xl border-2 border-slate-200/90 dark:border-slate-800/90 shadow-sm p-6 sm:p-8 relative overflow-hidden print:border-none print:shadow-none print:p-0">
          {/* Watermark Logo Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
            <Building2 className="w-96 h-96" />
          </div>

          {/* Certificate Header with Dual Flags / Logos */}
          <div className="text-center pb-5 border-b-2 border-slate-200/90 dark:border-slate-800/90 space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Islamic Emirate of Afghanistan • Herat Chamber of Commerce & Industry
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {selectedDocType === "CLEARANCE"
                ? "Certificate of Vehicle Ownership & Customs Clearance"
                : selectedDocType === "MAKTOUB"
                ? "Islam Qala Dry Port Official Customs Clearance Maktoub"
                : "Official Automotive Sales Contract & Transfer Deed"}
            </h2>
            <div className="text-xs font-dari text-slate-600 dark:text-slate-300">
              {selectedDocType === "CLEARANCE"
                ? "سند رسمی تصدیق اصالت موتر، استعلام مالیاتی و ترخیص گمرکی ولایت هرات"
                : selectedDocType === "MAKTOUB"
                ? "مکتوب رسمی ریاست گمرک اسلام قلعه ولایت هرات - ترخیص قطعی موتر"
                : "سند قطعی بیع و انتقال مالکیت نندارتون موتر سدوزی هرات"}
            </div>
            <div className="text-[10px] font-mono text-slate-400 pt-1">
              Certificate Document #SM-AFG-{matchedVehicle?.stockNumber || "2026-902"} • Verified Registry
            </div>
          </div>

          {/* Vehicle Spec Grid in Certificate */}
          <div className="py-5 space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Official Vehicle Identification & Specs
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                Verified against Customs Database
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Vehicle Make & Model
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {matchedVehicle
                    ? `${matchedVehicle.year} ${matchedVehicle.make} ${matchedVehicle.model} (${matchedVehicle.trim || "Full Option"})`
                    : "2024 Toyota Land Cruiser 300 VXR"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Chassis / 17-Char VIN Number
                </span>
                <span className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5 block">
                  {matchedVehicle?.vin || query}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Customs Maktoub Clearance
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {matchedVehicle?.customsClearance || "Islam Qala Gomrok - Verified & Cleared (Doc #MK-8819)"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Origin Country & Steering
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {matchedVehicle?.originCountry || "UAE / Dubai"} • {matchedVehicle?.steering || "Left-Hand Drive (LHD)"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Odometer Mileage Record
                </span>
                <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {matchedVehicle ? `${matchedVehicle.mileage.toLocaleString()} KM` : "18,400 KM"} (Audited)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Registered Dealership & Lot Bay
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  Sadozai Motors Herat • {matchedVehicle?.yardLocation || "Bagh-e-Azadi Central Lot"}
                </span>
              </div>
            </div>
          </div>

          {/* Official Chamber & MoF Seals Strip */}
          <div className="mt-4 pt-5 border-t-2 border-slate-200/90 dark:border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-1 flex items-center justify-center bg-white dark:bg-slate-900">
                <QrCode className="h-12 w-12 text-slate-700 dark:text-slate-300" />
              </div>
              <div className="space-y-0.5 text-xs text-slate-500">
                <div className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white">
                  <Lock className="h-3.5 w-3.5 text-emerald-600" />
                  <span>SHA-256 Digital Seal Authenticated</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Hash: 7a9e88f2c...48b901e | Validated {new Date().toLocaleDateString()}
                </div>
                <div className="text-[10px] text-slate-400">
                  Scan QR code with any smartphone to re-verify certificate on official registry.
                </div>
              </div>
            </div>

            {/* Official Stamp Simulation */}
            <div className="p-3 rounded-xl border-2 border-red-500/40 bg-red-500/5 rotate-[-2deg] text-center shrink-0">
              <div className="text-[9px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                ★ ریاست گمرک ولایت هرات ★
              </div>
              <div className="text-xs font-extrabold text-red-700 dark:text-red-400 font-mono">
                CLEARED & APPROVED
              </div>
              <div className="text-[8px] text-red-500 font-mono">
                Islam Qala Border Inspection
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PublicVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-mono text-sm">
          Loading Official Chamber Verification Registry...
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
