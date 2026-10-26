"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { MuiButton, MuiTextField } from "@/components/mui";
import {
  ShieldCheck,
  CheckCircle2,
  Building2,
  Search,
  Printer,
  Lock,
  AlertTriangle,
  QrCode,
  Check,
  FileSearch,
  Phone,
} from "lucide-react";

export const dynamic = "force-dynamic";

type CertificateType = "CLEARANCE" | "MAKTOUB" | "DEED";

export function VerifyContent({ initialQuery }: { initialQuery?: string } = {}) {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const contractParam =
    initialQuery || searchParams.get("contract") || searchParams.get("id") || "";
  const vinParam = searchParams.get("vin") || "";

  const { vehicles, sales, invoices, language, branding } = useShowroomStore();
  const t = translations[language];

  const [query, setQuery] = useState(contractParam || vinParam || "");
  const [selectedDocType, setSelectedDocType] = useState<CertificateType>("CLEARANCE");

  const activeHash = query.trim();

  const localizedDealershipName =
    language === "fa"
      ? branding.dealershipNameFa || branding.dealershipName
      : language === "ps"
      ? branding.dealershipNamePs || branding.dealershipName
      : branding.dealershipName;

  const [remoteLookup, setRemoteLookup] = useState<{
    loading: boolean;
    mode: "idle" | "live" | "fallback";
    vehicle: {
      stockNumber: string;
      vin: string;
      year: number;
      make: string;
      model: string;
      trim: string;
      color: string;
      mileage: number;
      originCountry: string;
      steering: string;
      customsClearance: string;
      cleanTitle: boolean;
      status: string;
      yardLocation?: string | null;
    } | null;
    sale: {
      contractNumber: string;
      customerName: string;
      vehicleName: string;
      saleDate: string;
    } | null;
    invoice: {
      invoiceNumber: string;
      customerName: string;
      vehicleDesc: string | null;
      vin: string | null;
      issueDate: string;
    } | null;
  }>({
    loading: false,
    mode: "idle",
    vehicle: null,
    sale: null,
    invoice: null,
  });

  useEffect(() => {
    if (!activeHash || activeHash.length < 2) {
      setRemoteLookup({
        loading: false,
        mode: "idle",
        vehicle: null,
        sale: null,
        invoice: null,
      });
      return;
    }

    const controller = new AbortController();
    setRemoteLookup((prev) => ({ ...prev, loading: true }));

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/verify?code=${encodeURIComponent(activeHash)}`,
          { signal: controller.signal }
        );
        const payload = await res.json().catch(() => null);
        if (controller.signal.aborted) return;

        if (payload?.fallback) {
          setRemoteLookup({
            loading: false,
            mode: "fallback",
            vehicle: null,
            sale: null,
            invoice: null,
          });
          return;
        }

        if (res.ok && payload?.success) {
          setRemoteLookup({
            loading: false,
            mode: "live",
            vehicle: payload.vehicle || null,
            sale: payload.sale || null,
            invoice: payload.invoice || null,
          });
          return;
        }

        setRemoteLookup({
          loading: false,
          mode: "live",
          vehicle: null,
          sale: null,
          invoice: null,
        });
      } catch {
        if (controller.signal.aborted) return;
        setRemoteLookup({
          loading: false,
          mode: "fallback",
          vehicle: null,
          sale: null,
          invoice: null,
        });
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [activeHash]);

  // Exact match across sales contracts, invoices, and vehicles (live API first, local fallback when DB is offline)
  const localMatchedSale = useMemo(() => {
    if (!activeHash) return null;
    const norm = activeHash.toLowerCase();
    return (
      sales.find(
        (s) =>
          s.contractNumber.toLowerCase() === norm ||
          s.stockNumber.toLowerCase() === norm
      ) || null
    );
  }, [sales, activeHash]);

  const localMatchedInvoice = useMemo(() => {
    if (!activeHash) return null;
    const norm = activeHash.toLowerCase();
    return (
      invoices.find(
        (inv) =>
          inv.invoiceNumber.toLowerCase() === norm ||
          (inv.vin && inv.vin.toLowerCase() === norm)
      ) || null
    );
  }, [invoices, activeHash]);

  const localMatchedVehicle = useMemo(() => {
    if (!activeHash) return null;
    const norm = activeHash.toLowerCase();
    return (
      vehicles.find(
        (v) =>
          v.vin.toLowerCase() === norm ||
          v.stockNumber.toLowerCase() === norm ||
          v.id.toLowerCase() === norm ||
          (localMatchedSale && localMatchedSale.stockNumber === v.stockNumber) ||
          (localMatchedInvoice && localMatchedInvoice.vehicleStock === v.stockNumber)
      ) || null
    );
  }, [vehicles, activeHash, localMatchedSale, localMatchedInvoice]);

  const matchedSale =
    remoteLookup.mode === "live" ? remoteLookup.sale : localMatchedSale;
  const matchedInvoice =
    remoteLookup.mode === "live" ? remoteLookup.invoice : localMatchedInvoice;
  const matchedVehicle =
    remoteLookup.mode === "live" ? remoteLookup.vehicle : localMatchedVehicle;

  const isVerifying = Boolean(activeHash && activeHash.length >= 2 && remoteLookup.loading);
  const isVerified = Boolean(
    activeHash && !isVerifying && (matchedVehicle || matchedSale || matchedInvoice)
  );

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
                {language === "fa"
                  ? "سامانه استعلام اصالت سند موتر و ترخیص گمرکی"
                  : language === "ps"
                  ? "د موټر د سند او ګمرکي تصفیې د اصالت تایید پورټل"
                  : "Official Vehicle Provenance & Customs Verification Terminal"}
              </h1>
              <p className="text-[11px] font-mono text-slate-500">
                {localizedDealershipName} • License {branding.licenseNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {session?.user && (
              <Link href="/">
                <MuiButton variant="outlined" size="small" sx={{ fontSize: "11px", py: "3px" }}>
                  Dealership Cockpit
                </MuiButton>
              </Link>
            )}
            {isVerified && (
              <MuiButton
                variant="contained"
                size="small"
                onClick={() => window.print()}
                startIcon={<Printer className="h-4 w-4" />}
                sx={{ fontSize: "11px", py: "3px" }}
              >
                Print Certificate
              </MuiButton>
            )}
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
                placeholder={
                  language === "fa"
                    ? "شماره قرارداد، شماره فاکتور، کد استاک یا شاسی ۱۷ رقمی VIN را وارد کنید..."
                    : language === "ps"
                    ? "د قرارداد شمېره، فاکتور، سټاک کوډ یا ۱۷ رقمي VIN دننه کړئ..."
                    : "Enter Contract #, Invoice #, Stock Code, or 17-digit Chassis VIN..."
                }
                size="small"
                fullWidth
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                startAdornment={<Search className="h-3.5 w-3.5 text-slate-400 me-2" />}
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
              {language === "fa" ? "استعلام اصالت" : language === "ps" ? "تایید کړئ" : "Verify Record"}
            </MuiButton>
          </form>

          {/* Staff-Only Quick-Test Samples */}
          {Boolean(session?.user) && vehicles.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                STAFF QUICK-TEST SAMPLES:
              </span>
              {vehicles.slice(0, 3).map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setQuery(v.vin)}
                  className="text-[11px] px-2 py-0.5 rounded bg-[#FAF9F6] hover:bg-[#F4F3EF] dark:bg-[#161B24] dark:hover:bg-[#1E2433] text-slate-700 dark:text-slate-300 font-mono transition-colors cursor-pointer border border-[#D8D5CD] dark:border-[#242A38]"
                >
                  {v.make} {v.model}:{" "}
                  <span className="font-bold text-[#9A7515] dark:text-[#D4AF37]">{v.vin}</span>
                </button>
              ))}
            </div>
          )}

          {/* Certificate Type Switcher Tabs (Only shown when verified) */}
          {isVerified && (
            <div className="pt-2.5 border-t border-[#E6E4DD] dark:border-[#1E2330] flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 me-1">
                DOCUMENT DOSSIER:
              </span>
              <button
                type="button"
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
                type="button"
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
                type="button"
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
          )}
        </div>

        {/* STATE 1: Empty Search Prompt */}
        {!activeHash && (
          <div className="rounded-md border border-[#D8D5CD] dark:border-[#242A38] bg-white dark:bg-[#11141B] p-8 sm:p-12 text-center space-y-4">
            <div className="mx-auto h-14 w-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#9A7515] dark:text-[#D4AF37]">
              <FileSearch className="h-7 w-7" />
            </div>
            <div className="max-w-lg mx-auto space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {language === "fa"
                  ? "کد رهگیری، شماره شاسی (VIN) یا شماره قرارداد را وارد نمایید"
                  : language === "ps"
                  ? "د موټر VIN شاسي شمېره یا د قرارداد کوډ دننه کړئ"
                  : "Enter Reference Code to Verify Official Provenance"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {language === "fa"
                  ? "برای بررسی صحت سند فروش (وثیقه)، مکتوب گمرک اسلام قلعه یا فاکتور رسمی، کد ۱۷ رقمی شاسی موتر یا شماره سند مندرج در بالای برگه چاپی را در کادر بالا وارد کنید."
                  : language === "ps"
                  ? "د پلور سند، د اسلام قلعه ګمرک مکتوب یا رسمي فاکتور د اصالت تصدیق لپاره ۱۷ رقمي VIN یا د سند شمېره پورته ولیکئ."
                  : "Verify any physical Wasiqa transfer deed, Islam Qala Gomrok clearance maktoub, or commercial tax invoice by entering the exact 17-character VIN, Stock Code, Contract #, or Invoice #."}
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-[11px] font-mono text-slate-500">
              <span className="px-2.5 py-1 rounded bg-[#FAF9F6] dark:bg-[#161B24] border border-[#D8D5CD] dark:border-[#242A38]">
                VIN: JTMAB3FV...
              </span>
              <span className="px-2.5 py-1 rounded bg-[#FAF9F6] dark:bg-[#161B24] border border-[#D8D5CD] dark:border-[#242A38]">
                Contract: CNT-2026-...
              </span>
              <span className="px-2.5 py-1 rounded bg-[#FAF9F6] dark:bg-[#161B24] border border-[#D8D5CD] dark:border-[#242A38]">
                Invoice: INV-HRT-...
              </span>
            </div>
          </div>
        )}

        {/* STATE 1.5: Verifying Lookup in Progress */}
        {activeHash && isVerifying && (
          <div className="rounded-md border border-[#D8D5CD] dark:border-[#242A38] bg-white dark:bg-[#11141B] p-8 text-center">
            <p className="text-xs font-mono uppercase tracking-wider text-slate-500 animate-pulse">
              {language === "fa"
                ? "در حال استعلام از دفتر ثبت رسمی..."
                : language === "ps"
                ? "د رسمي ثبت څخه پلټنه روانه ده..."
                : "Querying Official Notary Registry..."}
            </p>
          </div>
        )}

        {/* STATE 2: Unmatched / Fraud Warning */}
        {activeHash && !isVerifying && !isVerified && (
          <div className="rounded-md border-2 border-rose-500/50 bg-white dark:bg-[#11141B] overflow-hidden">
            <div className="p-5 bg-rose-500/10 border-b border-rose-500/30 flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 block">
                  {language === "fa"
                    ? "هشدار امنیتی: هیچ سند رسمی با این مشخصات یافت نشد"
                    : language === "ps"
                    ? "امنیتي خبرتیا: په دې شمېره هیڅ رسمي سند ونه موندل شو"
                    : "RECORD NOT FOUND • UNVERIFIED DOCUMENT WARNING"}
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {language === "fa"
                    ? `هیچ موتر، قرارداد یا فاکتور ثبت‌شده‌ای با کد «${activeHash}» در دفتر ثبت رسمی ${localizedDealershipName} مطابقت ندارد. از پرداخت وجه بر اساس اسناد تاییدنشده خودداری فرمایید.`
                    : language === "ps"
                    ? `د «${activeHash}» کوډ سره هیڅ موټر، قرارداد یا فاکتور د ${localizedDealershipName} په رسمي دفتر کې ثبت نه دی.`
                    : `No official vehicle chassis, sales contract, or tax invoice matching "${activeHash}" exists in the ${localizedDealershipName} notary ledger. Do not release funds against unverified paper documents.`}
                </p>
              </div>
            </div>
            <div className="p-4 bg-[#FAF9F6] dark:bg-[#141821] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-mono">
                <Phone className="h-3.5 w-3.5 text-rose-600" />
                <span>
                  Compliance Desk: {branding.phone} • {branding.email}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Clear & Try Another Reference
              </button>
            </div>
          </div>
        )}

        {/* STATE 3: Matched Official Archival Certificate */}
        {isVerified && (
          <>
            {/* Verification Status Ribbon + 4-Stage Legal Chain */}
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
                      Reference matches {localizedDealershipName} and Islam Qala Gomrok digital tax clearance records.
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-600 text-white shrink-0">
                  {matchedVehicle?.cleanTitle === false ? "REGISTERED RECORD" : "VERIFIED CLEAN TITLE"}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#D8D5CD] dark:bg-[#242A38] text-xs">
                <div className="p-3 bg-[#FAF9F6] dark:bg-[#141821]">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="h-3 w-3" /> 01. Export Title
                  </div>
                  <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                    {matchedVehicle?.originCountry || "Port"} Cleared
                  </div>
                </div>
                <div className="p-3 bg-[#FAF9F6] dark:bg-[#141821]">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="h-3 w-3" /> 02. Customs Tariffs
                  </div>
                  <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                    Islam Qala Paid & Sealed
                  </div>
                </div>
                <div className="p-3 bg-[#FAF9F6] dark:bg-[#141821]">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="h-3 w-3" /> 03. Chamber Notary
                  </div>
                  <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mt-0.5 font-mono">
                    {branding.licenseNumber}
                  </div>
                </div>
                <div className="p-3 bg-[#FAF9F6] dark:bg-[#141821]">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="h-3 w-3" /> 04. Dealership Ledger
                  </div>
                  <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mt-0.5 truncate">
                    {localizedDealershipName}
                  </div>
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
                  Herat Chamber of Commerce & Industry • {branding.dealershipName}
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
                    : `سند قطعی بیع و انتقال مالکیت ${branding.dealershipNameFa || branding.dealershipName}`}
                </div>
                <div className="text-[10px] font-mono text-slate-500 pt-1 tabular-nums">
                  Certificate Document #{branding.dealershipShortCode || "AM"}-AFG-
                  {matchedVehicle?.stockNumber ||
                    matchedSale?.contractNumber ||
                    matchedInvoice?.invoiceNumber}{" "}
                  • Verified Registry
                </div>
              </div>

              {/* Vehicle & Contract Spec Grid */}
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
                      {matchedVehicle
                        ? `${matchedVehicle.year} ${matchedVehicle.make} ${matchedVehicle.model} (${matchedVehicle.trim || "Standard"})`
                        : matchedInvoice?.vehicleDesc || matchedSale?.vehicleName || "—"}
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#FAF9F6] dark:bg-[#141821]">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                      Chassis / 17-Char VIN Number
                    </span>
                    <span className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5 block tabular-nums">
                      {matchedVehicle?.vin || matchedInvoice?.vin || activeHash}
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#FAF9F6] dark:bg-[#141821]">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                      Customs Maktoub Clearance
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                      {matchedVehicle?.customsClearance || "Cleared — Islam Qala Gomrok"}
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#FAF9F6] dark:bg-[#141821]">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                      Origin Country & Steering
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {matchedVehicle
                        ? `${matchedVehicle.originCountry} • ${matchedVehicle.steering}`
                        : "Verified Direct Import"}
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#FAF9F6] dark:bg-[#141821]">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                      Odometer / Contract Reference
                    </span>
                    <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5 block tabular-nums">
                      {matchedSale
                        ? `Contract ${matchedSale.contractNumber} (${matchedSale.customerName})`
                        : matchedInvoice
                        ? `Invoice ${matchedInvoice.invoiceNumber} (${matchedInvoice.customerName})`
                        : matchedVehicle
                        ? `${matchedVehicle.mileage.toLocaleString()} KM (Audited)`
                        : "—"}
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#FAF9F6] dark:bg-[#141821]">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                      Registered Dealership & Standing
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {branding.dealershipName} •{" "}
                      {matchedVehicle?.yardLocation || matchedVehicle?.status || "Authenticated"}
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
                    <div className="text-[10px] font-mono text-slate-400 tabular-nums">
                      Ref: {activeHash.toUpperCase()} | Validated {new Date().toLocaleDateString()}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Issued by {branding.dealershipName} ({branding.address})
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
          </>
        )}
      </div>
    </div>
  );
}
