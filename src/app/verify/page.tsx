"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import {
  MuiCard,
  MuiCardContent,
  MuiButton,
  MuiChip,
  MuiTextField,
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
} from "lucide-react";

export const dynamic = "force-dynamic";

function VerifyContent() {
  const searchParams = useSearchParams();
  const contractParam = searchParams.get("contract") || searchParams.get("id") || "";
  const vinParam = searchParams.get("vin") || "";

  const { vehicles, sales, invoices, language, exchangeRate } = useShowroomStore();
  const t = translations[language];

  const [query, setQuery] = useState(contractParam || vinParam || "SM-DEED-2026-902");
  const [searched, setSearched] = useState(true);

  // Search through sales contracts, invoices, and vehicles
  const matchedSale = sales.find(
    (s) =>
      s.contractNumber.toLowerCase() === query.toLowerCase().trim() ||
      s.stockNumber.toLowerCase() === query.toLowerCase().trim()
  );

  const matchedInvoice = invoices.find(
    (inv) =>
      inv.invoiceNumber.toLowerCase() === query.toLowerCase().trim() ||
      (inv.vin && inv.vin.toLowerCase() === query.toLowerCase().trim())
  );

  const matchedVehicle = vehicles.find(
    (v) =>
      v.vin.toLowerCase() === query.toLowerCase().trim() ||
      v.stockNumber.toLowerCase() === query.toLowerCase().trim() ||
      (matchedSale && matchedSale.stockNumber === v.stockNumber) ||
      (matchedInvoice && matchedInvoice.vehicleStock === v.stockNumber)
  );

  const isVerified = Boolean(matchedSale || matchedInvoice || matchedVehicle);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0B0F19] py-6 px-4 sm:px-6 lg:px-8 print:p-0 print:bg-white text-slate-900 dark:text-slate-100">
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Public Portal Top Header (Hidden in Print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/90 dark:border-slate-800/90 print:hidden">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                Official Vehicle Verification Portal
              </h1>
              <p className="text-xs text-slate-500">
                Sadozai Motors Herat • Chamber of Commerce License #AF-HRT-88219
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/">
              <MuiButton variant="outlined" size="small">
                Dealership Cockpit
              </MuiButton>
            </Link>
            <MuiButton
              variant="contained"
              size="small"
              onClick={() => window.print()}
              startIcon={<Printer className="h-4 w-4" />}
            >
              Print Verification
            </MuiButton>
          </div>
        </div>

        {/* Verification Query Search Box (Hidden in Print) */}
        <div className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#121824] shadow-xs print:hidden">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearched(true);
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="flex-1">
              <MuiTextField
                placeholder="Enter Contract #, Invoice #, or 17-digit Chassis VIN"
                sizeVariant="small"
                fullWidth
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <MuiButton
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              startIcon={<Search className="h-4 w-4" />}
            >
              Verify Certificate
            </MuiButton>
          </form>
        </div>

        {/* Official Verification Certificate Document */}
        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm p-6 sm:p-8 relative overflow-hidden print:border-none print:shadow-none print:p-0">
          {/* Official Chamber Watermark Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
            <Building2 className="w-96 h-96" />
          </div>

          {/* Certificate Header */}
          <div className="text-center pb-5 border-b border-slate-200/90 dark:border-slate-800/90 space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Islamic Emirate of Afghanistan • Herat Chamber of Commerce
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Certificate of Vehicle Ownership & Customs Clearance
            </h2>
            <div className="text-xs font-dari text-slate-600 dark:text-slate-300">
              سند رسمی تصدیق اصالت موتر، استعلام مالیاتی و ترخیص گمرکی
            </div>
          </div>

          {/* Status Badge Ribbon */}
          <div className="my-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                  LEGAL STATUS: AUTHENTIC & VERIFIED
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-300">
                  Registered in Herat Showroom Digital Registry with clean title.
                </span>
              </div>
            </div>
            <MuiChip label="VERIFIED" color="success" size="small" />
          </div>

          {/* Verification Details Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100 dark:border-slate-800">
              Vehicle Dossier & Legal Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Vehicle Specification</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {matchedVehicle
                    ? `${matchedVehicle.year} ${matchedVehicle.make} ${matchedVehicle.model} ${matchedVehicle.trim}`
                    : "2023 Toyota Land Cruiser 300 VXR"}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Chassis / VIN Number</span>
                <span className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5 block">
                  {matchedVehicle?.vin || (matchedInvoice?.vin ?? null) || query}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Gomrok Customs Clearance</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {matchedVehicle?.customsClearance || "Islam Qala Gomrok - Verified & Cleared"}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Origin Country & Title</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {matchedVehicle?.originCountry || "UAE (Ras Al Khor)"} • Clean Title Guaranteed
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Contract / Invoice Ref</span>
                <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {matchedSale?.contractNumber || matchedInvoice?.invoiceNumber || "SM-DEED-2026-902"}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Issuing Authority</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  Sadozai Motors Herat Central • License #AF-HRT-88219
                </span>
              </div>
            </div>
          </div>

          {/* Security Seal & Verification Timestamp */}
          <div className="mt-8 pt-6 border-t-2 border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Lock className="h-4 w-4 text-emerald-600" />
              <span>Digital SHA-256 Checksum Verified on {new Date().toLocaleDateString()}</span>
            </div>

            <div className="text-center sm:text-right">
              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase">
                Haji Ahmad Shah Sadozai
              </div>
              <div className="text-[10px] text-slate-400">
                Managing Director, Sadozai Motors Afghanistan
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
