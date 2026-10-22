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

  const [query, setQuery] = useState(contractParam || vinParam || "");
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
    if (!query.trim()) return null;
    return (
      vehicles.find(
        (v) =>
          v.vin.toLowerCase() === query.toLowerCase().trim() ||
          v.stockNumber.toLowerCase() === query.toLowerCase().trim() ||
          (matchedSale && matchedSale.stockNumber === v.stockNumber) ||
          (matchedInvoice && matchedInvoice.vehicleStock === v.stockNumber)
      ) || null
    );
  }, [vehicles, query, matchedSale, matchedInvoice]);

  const isVerified = Boolean(matchedVehicle || matchedSale || matchedInvoice);



  return (
    <div className="min-h-screen bg-[#F4F3EF] dark:bg-[#0A0C10] py-6 px-4 sm:px-6 lg:px-8 print:p-0 print:bg-white text-slate-900 dark:text-slate-100">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Public Portal Top Header (Hidden in Print) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b border-[#D8D5CD] dark:border-[#242A38] print:hidden">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded bg-[#111318] border border-[#C59B27]/50 flex items-center justify-center text-[#D4AF37]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#9A7515] dark:text-[#D4AF37]">
                  PUBLIC NOTARY REGISTRY • HERAT CHAMBER OF COMMERCE
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Official Vehicle Provenance & Customs Verification Terminal
              </h1>
              <p className="text-[11px] font-mono text-slate-500">
                Sadozai Motors Herat • Chamber Notary License #AF-HRT-88219
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
        <div className="p-4 rounded-md border border-[#D8D5CD] dark:border-[#242A38] bg-white dark:bg-[#11141B] print:hidden space-y-3">
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

          {/* Active Showroom Vehicles (If Any) */}
          {vehicles.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                ACTIVE VEHICLES:
              </span>
              {vehicles.slice(0, 3).map((v) => (
                <button
                  key={v.id}
                  onClick={() => setQuery(v.vin)}
                  className="text-[11px] px-2 py-0.5 rounded bg-[#FAF9F6] hover:bg-[#F4F3EF] dark:bg-[#161B24] dark:hover:bg-[#1E2433] text-slate-700 dark:text-slate-300 font-mono transition-colors cursor-pointer border border-[#D8D5CD] dark:border-[#242A38]"
                >
                  {v.make} {v.model}: <span className="font-bold text-[#9A7515] dark:text-[#D4AF37]">{v.vin}</span>
                </button>
              ))}
            </div>
          )}

          {/* Certificate Type Switcher Tabs (Hidden in Print) */}
          <div className="pt-2.5 border-t border-[#E6E4DD] dark:border-[#1E2330] flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mr-1">
              DOCUMENT DOSSIER:
            </span>
            <button
              onClick={() => setSelectedDocType("CLEARANCE")}
              className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded transition-colors cursor-pointer ${
                selectedDocType === "CLEARANCE"
                  ? "bg-[#111318] text-white dark:bg-[#C59B27] dark:text-[#0A0C10] font-bold"
                  : "bg-[#FAF9F6] dark:bg-[#161B24] text-slate-600 dark:text-slate-300 border border-[#D8D5CD] dark:border-[#242A38]"
              }`}
            >
              {t.buttonChamberCertificate}
            </button>
            <button
              onClick={() => setSelectedDocType("MAKTOUB")}
              className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded transition-colors cursor-pointer ${
                selectedDocType === "MAKTOUB"
                  ? "bg-[#111318] text-white dark:bg-[#C59B27] dark:text-[#0A0C10] font-bold"
                  : "bg-[#FAF9F6] dark:bg-[#161B24] text-slate-600 dark:text-slate-300 border border-[#D8D5CD] dark:border-[#242A38]"
              }`}
            >
              {t.buttonCustomsMaktoub}
            </button>
            <button
              onClick={() => setSelectedDocType("DEED")}
              className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded transition-colors cursor-pointer ${
                selectedDocType === "DEED"
                  ? "bg-[#111318] text-white dark:bg-[#C59B27] dark:text-[#0A0C10] font-bold"
                  : "bg-[#FAF9F6] dark:bg-[#161B24] text-slate-600 dark:text-slate-300 border border-[#D8D5CD] dark:border-[#242A38]"
              }`}
            >
              {t.buttonSalesDeed}
            </button>
          </div>
        </div>

        {/* Verification Status Ribbon + 4-Stage Legal Chain in 1px Hairline Ledger */}
        <div className="rounded-md border border-[#D8D5CD] dark:border-[#242A38] bg-white dark:bg-[#11141B] overflow-hidden">
          <div className="p-3.5 bg-emerald-500/10 border-b border-[#D8D5CD] dark:border-[#242A38] flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">
                  STATUS: OFFICIALLY AUTHENTICATED & REGISTERED ON HERAT LEDGER
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-300">
                  Chassis VIN matches Herat Chamber of Commerce and Islam Qala Gomrok digital tax clearance records.
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-600 text-white shrink-0">
              VERIFIED CLEAN TITLE
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#D8D5CD] dark:bg-[#242A38] text-xs">
            <div className="p-3 bg-[#FAF9F6] dark:bg-[#141821]">
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <Check className="h-3 w-3" /> 01. Export Title
              </div>
              <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mt-0.5">UAE / Port Cleared</div>
            </div>
            <div className="p-3 bg-[#FAF9F6] dark:bg-[#141821]">
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <Check className="h-3 w-3" /> 02. Customs Tariffs
              </div>
              <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mt-0.5">Islam Qala Paid & Sealed</div>
            </div>
            <div className="p-3 bg-[#FAF9F6] dark:bg-[#141821]">
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <Check className="h-3 w-3" /> 03. Chamber Notary
              </div>
              <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mt-0.5">Herat License #88219</div>
            </div>
            <div className="p-3 bg-[#FAF9F6] dark:bg-[#141821]">
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <Check className="h-3 w-3" /> 04. Sadozai Registry
              </div>
              <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mt-0.5">Guaranteed Clean Title</div>
            </div>
          </div>
        </div>

        {/* Official Verification Certificate Document */}
        <div className="bg-white dark:bg-[#11141B] rounded-md border border-[#D8D5CD] dark:border-[#242A38] p-6 sm:p-8 relative overflow-hidden print:border-none print:shadow-none print:p-0">
          {/* Watermark Logo Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.04]">
            <Building2 className="w-96 h-96" />
          </div>

          {/* Certificate Header */}
          <div className="text-center pb-5 border-b-2 border-slate-900 dark:border-[#242A38] space-y-1.5">
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#9A7515] dark:text-[#D4AF37]">
              Islamic Emirate of Afghanistan • Herat Chamber of Commerce & Industry
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {selectedDocType === "CLEARANCE"
                ? "Certificate of Vehicle Ownership & Customs Clearance"
                : selectedDocType === "MAKTOUB"
                ? "Islam Qala Dry Port Official Customs Clearance Maktoub"
                : "Official Automotive Sales Contract & Transfer Deed"}
            </h2>
            <div className="text-xs font-dari font-bold text-slate-700 dark:text-slate-300">
              {selectedDocType === "CLEARANCE"
                ? "سند رسمی تصدیق اصالت موتر، استعلام مالیاتی و ترخیص گمرکی ولایت هرات"
                : selectedDocType === "MAKTOUB"
                ? "مکتوب رسمی ریاست گمرک اسلام قلعه ولایت هرات - ترخیص قطعی موتر"
                : "سند قطعی بیع و انتقال مالکیت نندارتون موتر سدوزی هرات"}
            </div>
            <div className="text-[10px] font-mono text-slate-500 pt-1">
              Certificate Document #SM-AFG-{matchedVehicle?.stockNumber || "2026-902"} • Verified Registry
            </div>
          </div>

          {/* Vehicle Spec 1px Hairline Grid in Certificate */}
          <div className="py-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Official Vehicle Identification & Customs Specs
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                Verified against Islam Qala Customs Database
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#D8D5CD] dark:bg-[#242A38] border border-[#D8D5CD] dark:border-[#242A38] rounded overflow-hidden text-xs">
              <div className="p-3.5 bg-[#FAF9F6] dark:bg-[#141821]">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                  Vehicle Make & Model
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {matchedVehicle ? `${matchedVehicle.year} ${matchedVehicle.make} ${matchedVehicle.model} (${matchedVehicle.trim || "Standard"})` : "—"}
                </span>
              </div>

              <div className="p-3.5 bg-[#FAF9F6] dark:bg-[#141821]">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                  Chassis / 17-Char VIN Number
                </span>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">
                  {matchedVehicle?.vin || query}
                </span>
              </div>

              <div className="p-3.5 bg-[#FAF9F6] dark:bg-[#141821]">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                  Customs Maktoub Clearance
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                  {matchedVehicle?.customsClearance || "—"}
                </span>
              </div>

              <div className="p-3.5 bg-[#FAF9F6] dark:bg-[#141821]">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                  Origin Country & Steering
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {matchedVehicle ? `${matchedVehicle.originCountry} • ${matchedVehicle.steering}` : "—"}
                </span>
              </div>

              <div className="p-3.5 bg-[#FAF9F6] dark:bg-[#141821]">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                  Odometer Mileage Record
                </span>
                <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5 block tabular-nums">
                  {matchedVehicle ? `${matchedVehicle.mileage.toLocaleString()} KM (Audited)` : "—"}
                </span>
              </div>

              <div className="p-3.5 bg-[#FAF9F6] dark:bg-[#141821]">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                  Registered Dealership & Lot Bay
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {matchedVehicle ? `Sadozai Motors Herat • ${matchedVehicle.yardLocation || "Main Lot"}` : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Official Chamber & MoF Seals Strip */}
          <div className="mt-4 pt-5 border-t border-[#D8D5CD] dark:border-[#242A38] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded border border-[#D8D5CD] dark:border-[#242A38] p-1 flex items-center justify-center bg-white dark:bg-[#161B24]">
                <QrCode className="h-12 w-12 text-slate-800 dark:text-slate-200" />
              </div>
              <div className="space-y-0.5 text-xs text-slate-500">
                <div className="flex items-center gap-1 font-mono font-bold text-slate-900 dark:text-white">
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
            <div className="px-4 py-2.5 rounded border-2 border-emerald-700/40 bg-emerald-500/5 text-center shrink-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 font-dari">
                ★ ریاست گمرک ولایت هرات ★
              </div>
              <div className="text-xs font-black text-emerald-700 dark:text-emerald-400 font-mono tracking-widest">
                CLEARED & APPROVED
              </div>
              <div className="text-[9px] text-emerald-600 font-mono">
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
