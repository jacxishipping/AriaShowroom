"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import QRCode from "qrcode";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { MuiButton, MuiTextField } from "@/components/mui";
import {
  Printer,
  ArrowLeft,
  Stamp,
  QrCode,
  Share2,
  Download,
  PenTool,
  RotateCcw,
  Check,
  Building2,
  Loader2,
  Save,
  X,
} from "lucide-react";
import { InvoiceRecord } from "@/lib/mock-data";
import { downloadCommercialInvoicePDF } from "@/lib/invoice-pdf";

export default function VehicleDeedPage() {
  const params = useParams();
  const vehicleId = params?.id as string;
  const { data: session } = useSession();
  const {
    vehicles,
    sales,
    customers,
    invoices,
    exchangeRate,
    language,
    currentRole,
    branding,
    addSale,
    updateSale,
    addToast,
  } = useShowroomStore();
  const t = translations[language];

  const vehicle = vehicles.find((v) => v.id === vehicleId);
  const existingSale = sales.find(
    (s) => vehicle && s.stockNumber === vehicle.stockNumber
  );
  const matchedCustomer = customers.find(
    (c) =>
      (vehicle && c.interestedInVehicleId === vehicle.id) ||
      (existingSale &&
        (c.fullName.toLowerCase() === existingSale.customerName.toLowerCase() ||
          c.phone === existingSale.customerPhone))
  );

  const [buyerName, setBuyerName] = useState("");
  const [buyerTazkira, setBuyerTazkira] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [agreedPriceUSD, setAgreedPriceUSD] = useState<number>(0);
  const [downPaymentUSD, setDownPaymentUSD] = useState<number>(0);
  const [initializedFromRecords, setInitializedFromRecords] = useState(false);

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const [isSavingDeed, setIsSavingDeed] = useState(false);

  // Digital Signature Pad States (multi-stroke enabled, explicit lock)
  const [buyerSignatureUrl, setBuyerSignatureUrl] = useState<string | null>(null);
  const [sellerSignatureUrl, setSellerSignatureUrl] = useState<string | null>(null);
  const [isSigningBuyer, setIsSigningBuyer] = useState(false);
  const [isSigningSeller, setIsSigningSeller] = useState(false);
  const [hasBuyerStrokes, setHasBuyerStrokes] = useState(false);
  const [hasSellerStrokes, setHasSellerStrokes] = useState(false);
  const [deedLayoutMode, setDeedLayoutMode] = useState<"BILINGUAL" | "RTL_QABALA">(
    language === "fa" || language === "ps" ? "RTL_QABALA" : "BILINGUAL"
  );

  const buyerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sellerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  // Pre-fill deed fields from live SaleRecord / CustomerRecord once available
  useEffect(() => {
    if (!vehicle || initializedFromRecords) return;
    setAgreedPriceUSD(existingSale?.salePriceUSD || vehicle.sellingPrice);
    if (existingSale) {
      setBuyerName(existingSale.customerName || "");
      setBuyerTazkira(existingSale.customerTazkira || "");
      setBuyerPhone(existingSale.customerPhone || "");
      setDownPaymentUSD(existingSale.downPaymentUSD ?? existingSale.salePriceUSD);
      setInitializedFromRecords(true);
    } else if (matchedCustomer) {
      setBuyerName(matchedCustomer.fullName || "");
      setBuyerTazkira(matchedCustomer.tazkiraNumber || "");
      setBuyerPhone(matchedCustomer.phone || "");
      setDownPaymentUSD(vehicle.sellingPrice);
      setInitializedFromRecords(true);
    } else {
      setDownPaymentUSD(vehicle.sellingPrice);
      setInitializedFromRecords(true);
    }
  }, [existingSale, initializedFromRecords, matchedCustomer, vehicle]);

  // Escape key closes QR modal
  useEffect(() => {
    if (!isQrModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsQrModalOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isQrModalOpen]);

  const shortCode = branding?.dealershipShortCode || "ARIA";
  const dealershipName = branding?.dealershipName || "Aria Motors";
  const dealershipNameFa = branding?.dealershipNameFa || "آریا موتورز";
  const licenseNumber = branding?.licenseNumber || "AF-HRT-88219";
  const dealershipAddress = branding?.address || "Bagh-e-Azadi Avenue, Herat, Afghanistan";
  const signatoryName = branding?.authorizedSignatory || "Authorized Signatory";
  const signatoryTitle = branding?.signatoryTitle || "Managing Director";
  const customsTerminal = branding?.customsTerminalBranch || "Islam Qala Port";

  const effectivePriceUSD = agreedPriceUSD || vehicle?.sellingPrice || 0;
  const priceAfn = Math.round(effectivePriceUSD * exchangeRate);
  const contractNumber =
    existingSale?.contractNumber ||
    `${shortCode}-DEED-2026-${(vehicle?.stockNumber || "001")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(-6)}`;
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Generate dynamic QR code pointing to real /verify?vin=... endpoint
  useEffect(() => {
    if (!vehicle) return;

    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://ariamotors.af";
    const verificationUrl = `${origin}/verify?vin=${encodeURIComponent(vehicle.vin)}`;

    QRCode.toDataURL(verificationUrl, {
      width: 180,
      margin: 1,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error("QR Code error:", err));
  }, [vehicle]);

  // Multi-stroke Drawing Canvas Handlers
  const getCanvasPoint = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    type: "buyer" | "seller"
  ) => {
    const canvas = type === "buyer" ? buyerCanvasRef.current : sellerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    isDrawingRef.current = true;

    const { x, y } = getCanvasPoint(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0F172A";

    if (type === "buyer") setHasBuyerStrokes(true);
    else setHasSellerStrokes(true);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement | null
  ) => {
    if (!isDrawingRef.current || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasPoint(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // End current stroke ONLY — lets user draw multiple strokes before locking!
  const endStroke = () => {
    isDrawingRef.current = false;
  };

  const lockSignature = (type: "buyer" | "seller") => {
    isDrawingRef.current = false;
    const canvas = type === "buyer" ? buyerCanvasRef.current : sellerCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    if (type === "buyer") {
      setBuyerSignatureUrl(dataUrl);
      setIsSigningBuyer(false);
    } else {
      setSellerSignatureUrl(dataUrl);
      setIsSigningSeller(false);
    }
    addToast(
      `${type === "buyer" ? "Buyer" : "Seller"} signature locked onto deed!`,
      "success"
    );
  };

  const clearCanvas = (type: "buyer" | "seller") => {
    const canvas = type === "buyer" ? buyerCanvasRef.current : sellerCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (type === "buyer") {
      setBuyerSignatureUrl(null);
      setHasBuyerStrokes(false);
    } else {
      setSellerSignatureUrl(null);
      setHasSellerStrokes(false);
    }
  };

  const handleSaveDeedToLedger = async () => {
    if (!vehicle) return;
    if (!buyerName.trim() || !buyerPhone.trim()) {
      addToast("Please enter Buyer Full Name and Phone before saving contract.", "warning");
      return;
    }

    setIsSavingDeed(true);
    const paid = Math.min(Math.max(0, Number(downPaymentUSD) || 0), effectivePriceUSD);
    const isInstallment = paid < effectivePriceUSD;

    try {
      if (existingSale) {
        await updateSale(existingSale.id, {
          salePriceUSD: effectivePriceUSD,
          downPaymentUSD: paid,
          paymentType: isInstallment ? "Installment Plan" : existingSale.paymentType,
          installmentsRemaining: isInstallment
            ? Math.max(1, existingSale.installmentsRemaining || 3)
            : 0,
          status: isInstallment ? "Pending Installments" : "Completed",
        });
        addToast(`Updated Sale Contract ${existingSale.contractNumber}`, "success");
      } else {
        await addSale({
          stockNumber: vehicle.stockNumber,
          vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          customerName: buyerName.trim(),
          customerPhone: buyerPhone.trim(),
          customerTazkira: buyerTazkira.trim() || "PENDING",
          salesAgent: session?.user?.name || signatoryName,
          salePriceUSD: effectivePriceUSD,
          exchangeRate,
          paymentType: isInstallment ? "Installment Plan" : "Full Cash",
          downPaymentUSD: paid,
          installmentsRemaining: isInstallment ? 3 : 0,
          status: isInstallment ? "Pending Installments" : "Completed",
        });
        addToast("Saved official Sales Deed to showroom contract ledger!", "success");
      }
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Failed to save deed to ledger",
        "error"
      );
    } finally {
      setIsSavingDeed(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      addToast("Contract link copied to clipboard!", "success");
    }
  };

  const handleDownloadInvoice = async () => {
    if (!vehicle) return;
    setIsDownloadingInvoice(true);
    addToast("Generating commercial invoice PDF for vehicle...", "info");
    try {
      const existing = invoices.find((inv) => inv.vehicleStock === vehicle.stockNumber);
      const customsDutyIncluded = vehicle.customsDuty || 0;
      const invoiceData: InvoiceRecord = existing || {
        id: `inv-${vehicle.id}`,
        invoiceNumber: `INV-${contractNumber.replace(/[^a-zA-Z0-9-]/g, "")}`,
        customerName: buyerName || "Walk-In Purchaser",
        customerPhone: buyerPhone,
        customerTazkira: buyerTazkira,
        vehicleStock: vehicle.stockNumber,
        vehicleDesc: `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`,
        vin: vehicle.vin,
        items: [
          {
            description: `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.customsClearance})${
              customsDutyIncluded > 0
                ? ` — Includes $${customsDutyIncluded.toLocaleString()} Paid Duty`
                : ""
            }`,
            descriptionDari: "قیمت معامله قطعی موتر وارداتی (محصول شده گمرک)",
            amountUSD: effectivePriceUSD,
          },
        ],
        subtotalUSD: effectivePriceUSD,
        customsFeeUSD: 0,
        registrationFeeUSD: 0,
        discountUSD: 0,
        totalUSD: effectivePriceUSD,
        totalAFN: Math.round(effectivePriceUSD * exchangeRate),
        exchangeRate,
        status: downPaymentUSD >= effectivePriceUSD ? "Paid" : "Partially Paid",
        paymentMethod:
          downPaymentUSD >= effectivePriceUSD ? "Cash / Direct Hawala" : "Installment Plan",
        issueDate: new Date().toISOString().split("T")[0],
      };

      await downloadCommercialInvoicePDF(invoiceData);
      addToast(`Commercial invoice for ${vehicle.stockNumber} downloaded as PDF`, "success");
    } catch (err) {
      console.error("PDF generation failed:", err);
      addToast("Failed to download PDF invoice. Please try again.", "error");
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  if (!vehicle) {
    return (
      <div className="p-8 text-center text-slate-500">
        Vehicle not found.{" "}
        <Link href="/inventory" className="text-primary underline">
          Return to inventory
        </Link>
      </div>
    );
  }

  const remainingBalanceUSD = Math.max(0, effectivePriceUSD - downPaymentUSD);

  const sealColorClass =
    branding?.sealStyle === "chamber_blue"
      ? "border-blue-600/50 text-blue-700"
      : branding?.sealStyle === "official_gold"
      ? "border-amber-600/60 text-amber-700"
      : branding?.sealStyle === "minimal_black"
      ? "border-slate-800/60 text-slate-800"
      : "border-red-600/50 text-red-600";

  return (
    <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8 space-y-4 pb-16">
      {/* Top Navigation & Action Toolbar (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-3 border-b border-[#E2E8F0] dark:border-[#262F40] print:hidden">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.14em] text-[#1A73E8] dark:text-[#8AB4F8] mb-1">
            <Link href="/" className="hover:underline">
              COCKPIT
            </Link>
            <span>/</span>
            <Link href="/inventory" className="hover:underline">
              INVENTORY
            </Link>
            <span>/</span>
            <Link href={`/vehicles/${vehicle.id}`} className="hover:underline">
              {vehicle.stockNumber}
            </Link>
            <span>/</span>
            <span>SALES DEED (قباله شرعی)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Official Bilingual Sales Deed &amp; Title Contract
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-dari">
            قباله رسمی و خط بیعانه معامله موتر {dealershipNameFa} (مطابق اصول شرعی و مکتوب رسمی {customsTerminal})
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Print Layout Mode Switcher */}
          <div className="inline-flex rounded-lg border border-[#E2E8F0] dark:border-[#262F40] bg-[#F8FAFC] dark:bg-[#121722] p-0.5">
            <button
              type="button"
              onClick={() => setDeedLayoutMode("BILINGUAL")}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer ${
                deedLayoutMode === "BILINGUAL"
                  ? "bg-[#1A73E8] text-white"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {t.buttonBilingualLayout}
            </button>
            <button
              type="button"
              onClick={() => setDeedLayoutMode("RTL_QABALA")}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer ${
                deedLayoutMode === "RTL_QABALA"
                  ? "bg-[#1A73E8] text-white"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {t.buttonRtlDeedLayout}
            </button>
          </div>

          <MuiButton
            component={Link}
            href={`/vehicles/${vehicle.id}`}
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<ArrowLeft className="h-4 w-4 rtl:rotate-180" />}
            sx={{ fontSize: "11px", py: "3px" }}
          >
            Back
          </MuiButton>
          <MuiButton
            variant="outlined"
            color="inherit"
            size="small"
            onClick={handleCopyLink}
            startIcon={<Share2 className="h-3.5 w-3.5" />}
            sx={{ fontSize: "11px", py: "3px" }}
          >
            Copy Link
          </MuiButton>
          {currentRole !== "Accountant" && (
            <MuiButton
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => void handleSaveDeedToLedger()}
              disabled={isSavingDeed}
              startIcon={
                isSavingDeed ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )
              }
              sx={{ fontSize: "11px", py: "3px" }}
            >
              {existingSale ? "Sync Sale Record" : "Save Deed to Ledger"}
            </MuiButton>
          )}
          <MuiButton
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => void handleDownloadInvoice()}
            disabled={isDownloadingInvoice}
            startIcon={
              isDownloadingInvoice ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <Download className="h-4 w-4" />
              )
            }
            sx={{ fontSize: "11px", py: "3px" }}
          >
            {isDownloadingInvoice ? "Generating..." : "Invoice PDF"}
          </MuiButton>
          <MuiButton
            variant="contained"
            color="primary"
            size="small"
            onClick={handlePrint}
            startIcon={<Printer className="h-4 w-4" />}
            sx={{ fontSize: "11px", py: "3px" }}
          >
            Print Official Deed
          </MuiButton>
        </div>
      </div>

      {/* Contract Configuration Strip (Hidden in Print) */}
      <div className="rounded-xl border border-[#E2E8F0] dark:border-[#262F40] bg-white dark:bg-[#161B26] p-4 print:hidden space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Contract Parties &amp; Settlement Terms:
          </span>
          {existingSale && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              Linked to Sale Contract #{existingSale.contractNumber}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <MuiTextField
            label="Buyer Full Name (نام خریدار)"
            sizeVariant="small"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
          />
          <MuiTextField
            label="Buyer Tazkira ID (شماره تذکره)"
            sizeVariant="small"
            value={buyerTazkira}
            onChange={(e) => setBuyerTazkira(e.target.value)}
          />
          <MuiTextField
            label="Buyer WhatsApp / Phone"
            sizeVariant="small"
            value={buyerPhone}
            onChange={(e) => setBuyerPhone(e.target.value)}
          />
          <MuiTextField
            label="Agreed Price (USD)"
            type="number"
            sizeVariant="small"
            disabled={currentRole !== "SuperAdmin" && Boolean(existingSale)}
            value={effectivePriceUSD}
            onChange={(e) => setAgreedPriceUSD(Number(e.target.value))}
          />
          <MuiTextField
            label="Deposit Paid (USD)"
            type="number"
            sizeVariant="small"
            value={downPaymentUSD}
            onChange={(e) => setDownPaymentUSD(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Official Deed Printable Document (Archival Seal & Paper Aesthetic) */}
      <div
        dir={deedLayoutMode === "RTL_QABALA" ? "rtl" : "ltr"}
        className="rounded-md border border-[#D8D5CD] bg-[#FFFEFA] p-6 sm:p-10 dark:border-[#2A3241] dark:bg-[#141821] print:border-none print:shadow-none print:p-0 text-slate-900 dark:text-slate-100 print:text-black print:bg-white space-y-6 relative overflow-hidden shadow-xs"
      >
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.04] print:opacity-[0.04]">
          <Building2 className="w-96 h-96" />
        </div>

        {/* Certificate Header Banner */}
        <div className="border-b-2 border-slate-900 dark:border-slate-600 pb-4 text-center space-y-1 relative">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 print:text-black">
            <span>{dealershipName}</span>
            <span>•</span>
            <span>Chamber of Commerce Commercial Registry</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white print:text-black">
            Official Automotive Bill of Sale &amp; Transfer Deed
          </h2>
          <p className="text-sm font-dari font-bold text-slate-700 dark:text-slate-300 print:text-black">
            سند رسمی بیع قطعی، استعلام اصالت، تسلیم و انتقال مالکیت واسطه نقلیه
          </p>
          <div className="flex items-center justify-center gap-3 pt-1 text-[11px] font-mono tabular-nums text-slate-500 flex-wrap">
            <span>Contract #{contractNumber}</span>
            <span>•</span>
            <span>Execution Date: {today}</span>
            <span>•</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
              Reg #{licenseNumber}
            </span>
          </div>
        </div>

        {/* Transaction Parties Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs relative">
          {/* Seller / Showroom Info */}
          <div className="rounded-xl border border-[#D8D5CD] bg-[#FAF9F5] p-3.5 dark:border-slate-800 dark:bg-slate-900/60 print:bg-white print:border-gray-300 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Party A: Seller / Dealership (فروشنده)
            </span>
            <p className="font-bold text-slate-900 dark:text-white print:text-black text-sm">
              {dealershipName}
            </p>
            <p className="text-slate-600 dark:text-slate-300 font-dari">
              {dealershipNameFa} — {signatoryName} ({signatoryTitle})
            </p>
            <p className="font-mono text-slate-500 text-[11px]">
              License: {licenseNumber} • TIN: {branding?.tinNumber || "9004128810"}
            </p>
            <p className="text-slate-500">Address: {dealershipAddress}</p>
          </div>

          {/* Buyer Info */}
          <div className="rounded-xl border border-[#D8D5CD] bg-[#FAF9F5] p-3.5 dark:border-slate-800 dark:bg-slate-900/60 print:bg-white print:border-gray-300 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Party B: Buyer / Purchaser (خریدار)
            </span>
            <p className="font-bold text-slate-900 dark:text-white print:text-black text-sm">
              {buyerName || "—"}
            </p>
            <p className="text-slate-600 dark:text-slate-300 font-dari">
              محترم خریدار قانونی موتر با مشخصات ذیل
            </p>
            <p className="font-mono tabular-nums text-slate-500 text-[11px]">
              Tazkira ID: {buyerTazkira || "—"}
            </p>
            <p className="text-slate-500 font-mono tabular-nums">
              Phone / WhatsApp: {buyerPhone || "—"}
            </p>
          </div>
        </div>

        {/* Vehicle Specification Grid */}
        <div className="space-y-2 relative">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Vehicle Specification &amp; Legal Identification
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#FAF9F5] dark:bg-slate-900/60 border border-[#D8D5CD] dark:border-slate-800 print:border-gray-300">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Vehicle Make &amp; Model
              </span>
              <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#FAF9F5] dark:bg-slate-900/60 border border-[#D8D5CD] dark:border-slate-800 print:border-gray-300">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Trim Level / Color
              </span>
              <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                {vehicle.trim} ({vehicle.color})
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#FAF9F5] dark:bg-slate-900/60 border border-[#D8D5CD] dark:border-slate-800 print:border-gray-300">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Chassis / VIN
              </span>
              <span className="font-mono font-bold text-blue-700 dark:text-blue-400 mt-0.5 block break-all">
                {vehicle.vin}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#FAF9F5] dark:bg-slate-900/60 border border-[#D8D5CD] dark:border-slate-800 print:border-gray-300">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Gomrok Customs Clearance
              </span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                {vehicle.customsClearance}
              </span>
            </div>
          </div>
        </div>

        {/* Financial Consideration Block */}
        <div className="rounded-xl border border-[#D8D5CD] bg-[#FAF9F5] p-4 dark:border-slate-800 dark:bg-slate-900/60 print:bg-white print:border-gray-300 space-y-3 relative">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
            Financial Consideration &amp; Agreed Settlement (ثمن معامله)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center tabular-nums">
            <div className="p-2.5 rounded-lg bg-white dark:bg-[#151D2A] border border-slate-200 dark:border-slate-800 print:border-gray-300">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Total Purchase Price
              </span>
              <p className="mt-1 text-lg font-black text-slate-900 dark:text-white font-mono">
                ${effectivePriceUSD.toLocaleString()} USD
              </p>
              <span className="text-[10px] text-slate-500 font-mono">
                (؋ {priceAfn.toLocaleString()} AFN)
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white dark:bg-[#151D2A] border border-slate-200 dark:border-slate-800 print:border-gray-300">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Paid / Deposit Received
              </span>
              <p className="mt-1 text-lg font-black text-emerald-600 font-mono">
                ${downPaymentUSD.toLocaleString()} USD
              </p>
              <span className="text-[10px] text-slate-500 font-mono">
                (؋ {(downPaymentUSD * exchangeRate).toLocaleString()} AFN)
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white dark:bg-[#151D2A] border border-slate-200 dark:border-slate-800 print:border-gray-300">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Remaining Balance
              </span>
              <p className="mt-1 text-lg font-black text-blue-600 dark:text-blue-400 font-mono">
                ${remainingBalanceUSD.toLocaleString()} USD
              </p>
              <span className="text-[10px] text-slate-500 font-mono">
                (؋ {(remainingBalanceUSD * exchangeRate).toLocaleString()} AFN)
              </span>
            </div>
          </div>
        </div>

        {/* Legal Terms & Warranties */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-3 relative">
          <div>
            <p className="font-bold uppercase tracking-wider text-slate-900 dark:text-white print:text-black mb-1">
              English Legal Warranty:
            </p>
            <p className="text-slate-600 dark:text-slate-300 print:text-gray-700">
              {dealershipName} warrants that the vehicle designated above is free from all undisclosed claims, liens, and disputes. Customs duties have been settled via {customsTerminal}. All keys, export titles, and original customs Maktoub documents are conveyed upon receipt of agreed funds.
            </p>
          </div>
          <div dir="rtl" className="font-dari">
            <p className="font-bold text-slate-900 dark:text-white print:text-black mb-1">
              مقررات و شرایط شرعی و قانونی (دری):
            </p>
            <p className="text-slate-600 dark:text-slate-300 print:text-gray-700">
              {dealershipNameFa} تضمین می‌نماید که واسطه فوق‌الذکر پاک، محصول شده گمرک و دارای اسناد قانونی معتبر می‌باشد. با پرداخت کامل وجه معامله، کلیه حقوق و اسناد واسطه نقلیه به خریدار تسلیم گردیده و طرفین با رضایت کامل ایجاب و قبول نمودند.
            </p>
          </div>
        </div>

        {/* Digital Signatures Canvas & Notary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-3 text-center text-xs border-t-2 border-slate-900 dark:border-slate-700 relative">
          {/* Seller / Merchant Signature Canvas */}
          <div className="rounded-xl border border-dashed border-slate-300 p-3 dark:border-slate-700 print:border-gray-400 flex flex-col justify-between">
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-[11px]">
                Seller / Merchant
              </p>
              <p className="text-[10px] text-slate-400 truncate">{signatoryName}</p>
            </div>

            <div className="my-1.5 flex items-center justify-center min-h-[68px] relative">
              {sellerSignatureUrl ? (
                <div className="flex flex-col items-center gap-1">
                  <img
                    src={sellerSignatureUrl}
                    alt="Seller Signature"
                    className="h-12 object-contain bg-white rounded px-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      clearCanvas("seller");
                      setIsSigningSeller(true);
                    }}
                    className="print:hidden inline-flex items-center gap-0.5 text-[9px] text-slate-400 hover:text-blue-600 cursor-pointer"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    <span>Re-sign</span>
                  </button>
                </div>
              ) : isSigningSeller ? (
                <div className="space-y-1.5 w-full">
                  <canvas
                    ref={sellerCanvasRef}
                    width={220}
                    height={64}
                    className="border border-slate-300 rounded bg-white w-full touch-none cursor-crosshair"
                    onMouseDown={(e) => startDrawing(e, "seller")}
                    onMouseMove={(e) => draw(e, sellerCanvasRef.current)}
                    onMouseUp={endStroke}
                    onMouseLeave={endStroke}
                    onTouchStart={(e) => startDrawing(e, "seller")}
                    onTouchMove={(e) => draw(e, sellerCanvasRef.current)}
                    onTouchEnd={endStroke}
                  />
                  <div className="flex justify-center gap-2 print:hidden">
                    <button
                      type="button"
                      onClick={() => clearCanvas("seller")}
                      className="px-2 py-0.5 rounded border border-slate-200 text-[9px] text-slate-500 hover:text-rose-600 cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      disabled={!hasSellerStrokes}
                      onClick={() => lockSignature("seller")}
                      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-bold disabled:opacity-40 cursor-pointer"
                    >
                      <Check className="h-2.5 w-2.5" />
                      <span>Lock &amp; Apply</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSigningSeller(true)}
                  className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline print:hidden cursor-pointer"
                >
                  <PenTool className="h-3 w-3" />
                  <span>Sign Digitally</span>
                </button>
              )}
            </div>

            <div className="border-t border-slate-300 pt-1 text-[10px] text-slate-500 font-dari">
              امضاء و شست فروشنده
            </div>
          </div>

          {/* Buyer Signature Canvas */}
          <div className="rounded-xl border border-dashed border-slate-300 p-3 dark:border-slate-700 print:border-gray-400 flex flex-col justify-between">
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-[11px]">
                Buyer / Purchaser
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {buyerName || "Buyer Signature"}
              </p>
            </div>

            <div className="my-1.5 flex items-center justify-center min-h-[68px] relative">
              {buyerSignatureUrl ? (
                <div className="flex flex-col items-center gap-1">
                  <img
                    src={buyerSignatureUrl}
                    alt="Buyer Signature"
                    className="h-12 object-contain bg-white rounded px-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      clearCanvas("buyer");
                      setIsSigningBuyer(true);
                    }}
                    className="print:hidden inline-flex items-center gap-0.5 text-[9px] text-slate-400 hover:text-blue-600 cursor-pointer"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    <span>Re-sign</span>
                  </button>
                </div>
              ) : isSigningBuyer ? (
                <div className="space-y-1.5 w-full">
                  <canvas
                    ref={buyerCanvasRef}
                    width={220}
                    height={64}
                    className="border border-slate-300 rounded bg-white w-full touch-none cursor-crosshair"
                    onMouseDown={(e) => startDrawing(e, "buyer")}
                    onMouseMove={(e) => draw(e, buyerCanvasRef.current)}
                    onMouseUp={endStroke}
                    onMouseLeave={endStroke}
                    onTouchStart={(e) => startDrawing(e, "buyer")}
                    onTouchMove={(e) => draw(e, buyerCanvasRef.current)}
                    onTouchEnd={endStroke}
                  />
                  <div className="flex justify-center gap-2 print:hidden">
                    <button
                      type="button"
                      onClick={() => clearCanvas("buyer")}
                      className="px-2 py-0.5 rounded border border-slate-200 text-[9px] text-slate-500 hover:text-rose-600 cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      disabled={!hasBuyerStrokes}
                      onClick={() => lockSignature("buyer")}
                      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-bold disabled:opacity-40 cursor-pointer"
                    >
                      <Check className="h-2.5 w-2.5" />
                      <span>Lock &amp; Apply</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSigningBuyer(true)}
                  className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline print:hidden cursor-pointer"
                >
                  <PenTool className="h-3 w-3" />
                  <span>Sign Digitally</span>
                </button>
              )}
            </div>

            <div className="border-t border-slate-300 pt-1 text-[10px] text-slate-500 font-dari">
              امضاء و شست خریدار
            </div>
          </div>

          {/* Official Showroom Stamp Seal */}
          <div className="rounded-xl border border-dashed border-slate-300 p-3 dark:border-slate-700 print:border-gray-400 flex flex-col items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-[11px]">
                Official Stamp
              </p>
              <p className="text-[10px] text-slate-400 font-dari">مهر رسمی نمایشگاه</p>
            </div>
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${sealColorClass}`}
            >
              <Stamp className="h-6 w-6" />
            </div>
            <div className="border-t border-slate-300 w-full pt-1 text-[9px] font-mono text-slate-400 truncate">
              {shortCode} • {licenseNumber}
            </div>
          </div>

          {/* Scannable Traffic & Notary QR Code */}
          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            title="Click to enlarge Verification QR"
            className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-white flex flex-col items-center justify-between shadow-2xs print:border-gray-400 print:shadow-none cursor-pointer hover:border-blue-500 transition-colors"
          >
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-900 uppercase block tracking-wider">
                Verification QR
              </span>
              <span className="text-[9px] text-slate-500 block font-dari">
                استعلام اصالت سند
              </span>
            </div>
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="Contract Verification QR"
                className="h-16 w-16 object-contain my-1"
              />
            ) : (
              <div className="h-16 w-16 flex items-center justify-center bg-slate-100 text-slate-400">
                <QrCode className="h-8 w-8 animate-pulse" />
              </div>
            )}
            <span className="text-[8px] font-mono tabular-nums text-slate-600 truncate max-w-full">
              {contractNumber}
            </span>
          </button>
        </div>
      </div>

      {/* Enlarged Verification QR Modal (Dismissible via Escape or Backdrop) */}
      {isQrModalOpen && qrCodeDataUrl && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsQrModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs print:hidden"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs rounded-2xl bg-white dark:bg-[#161B26] border border-slate-200 dark:border-[#262F40] p-5 text-center space-y-3 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Public Certificate QR
              </span>
              <button
                type="button"
                aria-label="Close QR modal"
                onClick={() => setIsQrModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="inline-block p-3 rounded-xl bg-white border border-slate-200">
              <img
                src={qrCodeDataUrl}
                alt="Enlarged Verification QR"
                className="h-44 w-44 object-contain"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Scan to verify VIN <strong className="font-mono">{vehicle.vin}</strong> on the public authenticity portal.
            </p>
            <Link
              href={`/verify?vin=${encodeURIComponent(vehicle.vin)}`}
              className="inline-block text-xs font-semibold text-[#1A73E8] dark:text-[#8AB4F8] hover:underline"
            >
              Open Verification Certificate →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
