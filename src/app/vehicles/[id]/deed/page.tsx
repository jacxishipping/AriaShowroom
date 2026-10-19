"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import QRCode from "qrcode";
import { useShowroomStore } from "@/store/useShowroomStore";
import { formatCurrency } from "@/lib/utils";
import { translations } from "@/lib/translations";
import {
  MuiCard,
  MuiButton,
  MuiTextField,
  MuiChip,
  IconButton,
  Switch,
  FormControlLabel,
} from "@/components/mui";
import {
  Printer,
  ArrowLeft,
  ShieldCheck,
  FileCheck,
  Stamp,
  QrCode,
  CheckCircle2,
  Share2,
  Car,
  Download,
  PenTool,
  RotateCcw,
  Check,
  FileText,
  Building2,
  Upload,
} from "lucide-react";

export default function VehicleDeedPage() {
  const params = useParams();
  const vehicleId = params?.id as string;
  const { vehicles, exchangeRate, language, addToast } = useShowroomStore();
  const t = translations[language];

  const vehicle = vehicles.find((v) => v.id === vehicleId) || vehicles[0];

  const [buyerName, setBuyerName] = useState("Haji Abdul Qadir Karimi");
  const [buyerTazkira, setBuyerTazkira] = useState("HRT-1402-984210");
  const [buyerPhone, setBuyerPhone] = useState("+93 79 988 7766");
  const [downPaymentUSD, setDownPaymentUSD] = useState<number>(10000);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  // Digital Signature Pad States
  const [buyerSignatureUrl, setBuyerSignatureUrl] = useState<string | null>(null);
  const [sellerSignatureUrl, setSellerSignatureUrl] = useState<string | null>(null);
  const [isSigningBuyer, setIsSigningBuyer] = useState(false);
  const [isSigningSeller, setIsSigningSeller] = useState(false);

  const buyerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sellerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  const priceAfn = Math.round((vehicle?.sellingPrice || 45000) * exchangeRate);
  const contractNumber = `SM-DEED-2026-${(vehicle?.stockNumber || "SM-HRT-882").replace("SM-HRT-", "")}`;
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Generate dynamic QR code
  useEffect(() => {
    if (!vehicle) return;

    const payload = JSON.stringify({
      issuer: "Sadozai Motors Herat",
      contract: contractNumber,
      stockNumber: vehicle.stockNumber,
      vin: vehicle.vin,
      makeModel: `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`,
      priceUsd: vehicle.sellingPrice,
      priceAfn: priceAfn,
      buyerTazkira: buyerTazkira,
      customsMaktoub: vehicle.customsClearance,
      verifiedAt: new Date().toISOString(),
      validationUrl: `https://ariashowroom.af/verify?contract=${contractNumber}&vin=${vehicle.vin}`,
    });

    QRCode.toDataURL(payload, {
      width: 160,
      margin: 1,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error("QR Code error:", err));
  }, [vehicle, contractNumber, priceAfn, buyerTazkira]);

  // Drawing Canvas Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    isDrawingRef.current = true;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1e293b";
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement | null) => {
    if (!isDrawingRef.current || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (type: "buyer" | "seller") => {
    isDrawingRef.current = false;
    const canvas = type === "buyer" ? buyerCanvasRef.current : sellerCanvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      if (type === "buyer") {
        setBuyerSignatureUrl(dataUrl);
        setIsSigningBuyer(false);
      } else {
        setSellerSignatureUrl(dataUrl);
        setIsSigningSeller(false);
      }
      addToast(`${type === "buyer" ? "Buyer" : "Seller"} signature captured!`, "success");
    }
  };

  const clearCanvas = (type: "buyer" | "seller") => {
    const canvas = type === "buyer" ? buyerCanvasRef.current : sellerCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      if (type === "buyer") setBuyerSignatureUrl(null);
      else setSellerSignatureUrl(null);
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

  const remainingBalanceUSD = vehicle.sellingPrice - downPaymentUSD;

  return (
    <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8 space-y-4 pb-16">
      {/* Top Navigation & Action Toolbar (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-200/90 dark:border-slate-800/90 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Cockpit
            </Link>
            <span>/</span>
            <Link href="/inventory" className="hover:text-blue-600 transition-colors">
              Inventory
            </Link>
            <span>/</span>
            <Link href={`/vehicles/${vehicle.id}`} className="hover:text-blue-600 transition-colors">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">Sales Deed</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Official Bilingual Sales Deed & Title Contract
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            قباله رسمی و خط بیعانه معامله موتر نندارتون موتر سدوزی هرات (مطابق اصول شرعی و مکتوب رسمی گمرک اسلام قلعه)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <MuiButton
            component={Link}
            href={`/vehicles/${vehicle.id}`}
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<ArrowLeft className="h-4 w-4" />}
            sx={{ fontSize: "11px", py: "3px" }}
          >
            Back to Vehicle
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
          <MuiButton
            variant="contained"
            color="primary"
            size="small"
            onClick={handlePrint}
            startIcon={<Printer className="h-4 w-4" />}
            sx={{ fontSize: "11px", py: "3px" }}
          >
            Print Deed
          </MuiButton>
        </div>
      </div>

      {/* Contract Configuration Strip (Hidden in Print) */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#121824] p-4 shadow-xs print:hidden space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
          Contract Parties & Settlement Terms:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
            label="Deposit Received (USD)"
            type="number"
            sizeVariant="small"
            value={downPaymentUSD}
            onChange={(e) => setDownPaymentUSD(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Official Deed Printable Document */}
      <div className="rounded-2xl border-2 border-slate-200/90 bg-white p-6 sm:p-10 shadow-sm dark:border-slate-800/90 dark:bg-[#111827] print:border-none print:shadow-none print:p-0 text-slate-900 dark:text-slate-100 print:text-black print:bg-white space-y-6 relative overflow-hidden">
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.05] print:opacity-[0.04]">
          <Building2 className="w-96 h-96" />
        </div>

        {/* Certificate Header Banner */}
        <div className="border-b-2 border-slate-900 dark:border-slate-700 pb-4 text-center space-y-1">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 print:text-black">
            <span>Islamic Emirate of Afghanistan</span>
            <span>•</span>
            <span>Herat Municipality & Chamber of Commerce</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white print:text-black">
            Official Automotive Bill of Sale & Transfer Deed
          </h2>
          <p className="text-sm font-dari font-bold text-slate-700 dark:text-slate-300 print:text-black">
            سند رسمی بیع قطعی، استعلام اصالت، تسلیم و انتقال مالکیت واسطه نقلیه
          </p>
          <div className="flex items-center justify-center gap-3 pt-1 text-[11px] font-mono text-slate-500">
            <span>Contract #{contractNumber}</span>
            <span>•</span>
            <span>Execution Date: {today}</span>
            <span>•</span>
            <span className="text-emerald-600 font-semibold">Chamber Notary Reg #AF-HRT-88219</span>
          </div>
        </div>

        {/* Transaction Parties Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Seller / Showroom Info */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60 print:bg-white print:border-gray-300 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Party A: Seller / Dealership (فروشنده)
            </span>
            <p className="font-bold text-slate-900 dark:text-white print:text-black text-sm">
              Sadozai Motors Herat Central Showroom
            </p>
            <p className="text-slate-600 dark:text-slate-300 font-dari">
              نندارتون موتر سدوزی هرات - مدیریت محترم حاجی احمد شاه سدوزی
            </p>
            <p className="font-mono text-slate-500 text-[11px]">
              License: #AF-HRT-88219 • Herat Chamber of Commerce Notary
            </p>
            <p className="text-slate-500">Showroom Address: Bagh-e-Azadi Avenue, Herat, Afghanistan</p>
          </div>

          {/* Buyer Info */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60 print:bg-white print:border-gray-300 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Party B: Buyer / Purchaser (خریدار)
            </span>
            <p className="font-bold text-slate-900 dark:text-white print:text-black text-sm">
              {buyerName}
            </p>
            <p className="text-slate-600 dark:text-slate-300 font-dari">
              محترم خریدار: دارای تذکره الکترونیکی صادره ولایت هرات
            </p>
            <p className="font-mono text-slate-500 text-[11px]">
              Tazkira ID: {buyerTazkira}
            </p>
            <p className="text-slate-500 font-mono">Phone / WhatsApp: {buyerPhone}</p>
          </div>
        </div>

        {/* Vehicle Specification Grid */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Vehicle Specification & Legal Identification
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 print:border-gray-300">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Vehicle Make & Model</span>
              <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 print:border-gray-300">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Trim Level / Package</span>
              <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{vehicle.trim}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 print:border-gray-300">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Chassis / VIN</span>
              <span className="font-mono font-bold text-blue-600 mt-0.5 block">{vehicle.vin}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 print:border-gray-300">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Gomrok Customs Clearance</span>
              <span className="font-semibold text-emerald-600 mt-0.5 block">{vehicle.customsClearance}</span>
            </div>
          </div>
        </div>

        {/* Financial Consideration Block */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60 print:bg-white print:border-gray-300 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
            Financial Consideration & Agreed Settlement (ثمن معامله)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="p-2.5 rounded-lg bg-white dark:bg-[#151D2A] border border-slate-200 dark:border-slate-800 print:border-gray-300">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Purchase Price</span>
              <p className="mt-1 text-lg font-black text-slate-900 dark:text-white font-mono">
                ${vehicle.sellingPrice.toLocaleString()} USD
              </p>
              <span className="text-[10px] text-slate-500 font-mono">
                (؋ {priceAfn.toLocaleString()} AFN)
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white dark:bg-[#151D2A] border border-slate-200 dark:border-slate-800 print:border-gray-300">
              <span className="text-[10px] uppercase font-bold text-slate-400">Initial Deposit Paid</span>
              <p className="mt-1 text-lg font-black text-emerald-600 font-mono">
                ${downPaymentUSD.toLocaleString()} USD
              </p>
              <span className="text-[10px] text-slate-500 font-mono">
                (؋ {(downPaymentUSD * exchangeRate).toLocaleString()} AFN)
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white dark:bg-[#151D2A] border border-slate-200 dark:border-slate-800 print:border-gray-300">
              <span className="text-[10px] uppercase font-bold text-slate-400">Remaining Balance</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-3">
          <div>
            <p className="font-bold uppercase tracking-wider text-slate-900 dark:text-white print:text-black mb-1">
              English Legal Warranty:
            </p>
            <p className="text-slate-600 dark:text-slate-300 print:text-gray-700">
              Sadozai Motors warrants that the vehicle designated above is free from all claims, liens, and disputes. Customs duties have been legally settled at Herat / Islam Qala Port. All vehicle keys, export titles, and original documents are conveyed unconditionally upon receipt of full funds.
            </p>
          </div>
          <div dir="rtl" className="font-dari">
            <p className="font-bold text-slate-900 dark:text-white print:text-black mb-1">
              مقررات و شرایط شرعی و قانونی (دری):
            </p>
            <p className="text-slate-600 dark:text-slate-300 print:text-gray-700">
              نمایشگاه موتر سدوزی تضمین می‌نماید که واسطه فوق‌الذکر پاک، بدون تکر شدید، محصول شده قطعی گمرک اسلام قلعه و دارای اسناد قانونی معتبر می‌باشد. با پرداخت کامل بها، کلیه حقوق و اسناد واسطه نقلیه به خریدار تسلیم گردیده و طرفین با رضایت کامل ایجاب و قبول نمودند.
            </p>
          </div>
        </div>

        {/* Digital Signatures Canvas & Notary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-3 text-center text-xs border-t-2 border-slate-900 dark:border-slate-700">
          {/* Seller / Merchant Signature Canvas */}
          <div className="rounded-xl border border-dashed border-slate-300 p-3 dark:border-slate-700 print:border-gray-400 flex flex-col justify-between">
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-[11px]">Seller / Merchant</p>
              <p className="text-[10px] text-slate-400 font-dari">مدیر عمومی (حاجی احمد شاه)</p>
            </div>

            <div className="my-1 flex items-center justify-center min-h-[56px] relative">
              {sellerSignatureUrl ? (
                <img src={sellerSignatureUrl} alt="Seller Signature" className="h-12 object-contain" />
              ) : isSigningSeller ? (
                <div className="space-y-1 w-full">
                  <canvas
                    ref={sellerCanvasRef}
                    width={180}
                    height={50}
                    className="border border-slate-300 rounded bg-white w-full touch-none cursor-crosshair"
                    onMouseDown={(e) => startDrawing(e, sellerCanvasRef.current)}
                    onMouseMove={(e) => draw(e, sellerCanvasRef.current)}
                    onMouseUp={() => stopDrawing("seller")}
                    onTouchStart={(e) => startDrawing(e, sellerCanvasRef.current)}
                    onTouchMove={(e) => draw(e, sellerCanvasRef.current)}
                    onTouchEnd={() => stopDrawing("seller")}
                  />
                  <div className="flex justify-center gap-1 print:hidden">
                    <button
                      type="button"
                      onClick={() => clearCanvas("seller")}
                      className="text-[9px] text-slate-400 hover:text-red-500"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => stopDrawing("seller")}
                      className="text-[9px] text-blue-600 font-bold"
                    >
                      Done
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
              <p className="font-bold text-slate-900 dark:text-white text-[11px]">Buyer / Purchaser</p>
              <p className="text-[10px] text-slate-400 font-dari">خریدار محترم (تذکره)</p>
            </div>

            <div className="my-1 flex items-center justify-center min-h-[56px] relative">
              {buyerSignatureUrl ? (
                <img src={buyerSignatureUrl} alt="Buyer Signature" className="h-12 object-contain" />
              ) : isSigningBuyer ? (
                <div className="space-y-1 w-full">
                  <canvas
                    ref={buyerCanvasRef}
                    width={180}
                    height={50}
                    className="border border-slate-300 rounded bg-white w-full touch-none cursor-crosshair"
                    onMouseDown={(e) => startDrawing(e, buyerCanvasRef.current)}
                    onMouseMove={(e) => draw(e, buyerCanvasRef.current)}
                    onMouseUp={() => stopDrawing("buyer")}
                    onTouchStart={(e) => startDrawing(e, buyerCanvasRef.current)}
                    onTouchMove={(e) => draw(e, buyerCanvasRef.current)}
                    onTouchEnd={() => stopDrawing("buyer")}
                  />
                  <div className="flex justify-center gap-1 print:hidden">
                    <button
                      type="button"
                      onClick={() => clearCanvas("buyer")}
                      className="text-[9px] text-slate-400 hover:text-red-500"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => stopDrawing("buyer")}
                      className="text-[9px] text-blue-600 font-bold"
                    >
                      Done
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
              <p className="font-bold text-slate-900 dark:text-white text-[11px]">Official Stamp</p>
              <p className="text-[10px] text-slate-400 font-dari">مهر رسمی نمایشگاه</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-red-500/40 text-red-600">
              <Stamp className="h-6 w-6" />
            </div>
            <div className="border-t border-slate-300 w-full pt-1 text-[9px] font-mono text-slate-400">
              HERAT AUTHENTIC LOT
            </div>
          </div>

          {/* Scannable Traffic & Notary QR Code */}
          <div className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-white flex flex-col items-center justify-between shadow-2xs print:border-gray-400 print:shadow-none">
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-900 uppercase block tracking-wider">
                Verification QR
              </span>
              <span className="text-[9px] text-slate-500 block font-dari">تاییدیه مدیریت ترافیک</span>
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
            <span className="text-[8px] font-mono text-slate-600 truncate max-w-full">
              {contractNumber}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
