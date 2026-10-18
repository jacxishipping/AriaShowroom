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
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Top Navigation & Action Toolbar (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/" className="hover:text-primary transition-colors">
              Cockpit
            </Link>
            <span>/</span>
            <Link href="/inventory" className="hover:text-primary transition-colors">
              Inventory
            </Link>
            <span>/</span>
            <Link href={`/vehicles/${vehicle.id}`} className="hover:text-primary transition-colors">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">
              Sales Deed
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Official Bilingual Sales Deed & Title Contract
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            قباله رسمی و خط بیعانه معامله موتر نندارتون موتر سدوزی هرات (مطابق اصول شرعی و مکتوب رسمی گمرک اسلام قلعه)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <MuiButton
            component={Link}
            href={`/vehicles/${vehicle.id}`}
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Vehicle
          </MuiButton>
          <MuiButton
            variant="outlined"
            color="inherit"
            size="small"
            onClick={handleCopyLink}
            startIcon={<Share2 className="h-4 w-4" />}
          >
            Copy Link
          </MuiButton>
          <MuiButton
            variant="contained"
            color="primary"
            size="medium"
            onClick={handlePrint}
            startIcon={<Printer className="h-4 w-4" />}
          >
            Print Official Deed (چاپ قباله)
          </MuiButton>
        </div>
      </div>

      {/* Live Buyer Data Entry Strip (Hidden in Print) */}
      <MuiCard elevation={1} className="p-4 bg-slate-50/80 dark:bg-slate-900/60 print:hidden space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Live Contract Data Entry (مشخصات خریدار و بیعانه جهت درج در قباله):
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Changes update contract layout & QR code in real-time
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <MuiTextField
            label="Buyer Full Name (نام خریدار)"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            sizeVariant="small"
          />
          <MuiTextField
            label="Tazkira / National ID (نمبر تذکره)"
            value={buyerTazkira}
            onChange={(e) => setBuyerTazkira(e.target.value)}
            sizeVariant="small"
          />
          <MuiTextField
            label="Phone Number (شماره تماس)"
            value={buyerPhone}
            onChange={(e) => setBuyerPhone(e.target.value)}
            sizeVariant="small"
          />
          <MuiTextField
            label="Deposit Paid (USD بیعانه)"
            type="number"
            value={downPaymentUSD}
            onChange={(e) => setDownPaymentUSD(Number(e.target.value))}
            sizeVariant="small"
          />
        </div>
      </MuiCard>

      {/* Printable Deed Certificate (Clean white background for physical printing) */}
      <div className="rounded-2xl bg-white p-6 sm:p-10 shadow-lg border border-slate-200 dark:border-slate-800 dark:bg-[#111827] text-slate-900 dark:text-slate-100 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-slate-900 dark:border-slate-100 pb-5 gap-4 print:border-black">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white print:text-black uppercase">
                Sadozai Motors Herat
              </h2>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 print:text-gray-700">
                Registered Luxury Automotive Merchant • Bagh-e-Azadi, Herat, Afghanistan
              </p>
              <p className="text-[11px] font-mono text-slate-500 print:text-gray-600">
                Tax & License ID: HRT-AUTO-8921 | Customs Islam Qala Verified
              </p>
            </div>

            <div className="text-center sm:text-right" dir="rtl">
              <h2 className="text-2xl font-bold font-dari text-slate-950 dark:text-white print:text-black">
                {language === "ps" ? "سدوزی موټرز هرات" : "موتر فروشی سدوزی هرات"}
              </h2>
              <p className="text-xs font-medium font-dari text-slate-600 dark:text-slate-300 print:text-gray-700">
                {language === "ps"
                  ? "د موټر د پلور او واک سپارلو رسمي قباله (د اسلام قلعه او هرات ګمرک محصول شوی)"
                  : "قباله رسمی معامله و سند واگذاری موتر (با محصول قطعی گمرک هرات)"}
              </p>
              <p className="text-[11px] font-mono text-slate-500 print:text-gray-600">
                {language === "ps" ? "د تړون شمیره:" : "نمبر قرارداد:"} {contractNumber} | {language === "ps" ? "نیټه:" : "تاریخ:"} {today}
              </p>
            </div>
          </div>

          {/* Bilingual Title */}
          <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2.5 text-center text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white print:bg-gray-100 print:text-black border border-slate-200 dark:border-slate-700 print:border-gray-300">
            {language === "ps"
              ? "VEHICLE SALES CONTRACT & TITLE DEED / د موټر د پلور او واک سپارلو رسمي شرعي قباله"
              : "BILINGUAL VEHICLE SALES CONTRACT & TITLE CONVEYANCE DEED / قباله شرعی و رسمی فروش موتر"}
          </div>

          {/* Parties Particulars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 print:border-gray-400">
              <span className="font-bold text-slate-900 dark:text-white uppercase block mb-1.5">
                First Party / Merchant (طرف اول - فروشنده):
              </span>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Business Name:</strong> Sadozai Motors (Haji Ahmad Shah Sadozai)
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Address:</strong> Bagh-e-Azadi Commercial Blvd, Herat
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Contact:</strong> +93 79 910 2030 | info@sadozaimotors.af
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 print:border-gray-400">
              <span className="font-bold text-slate-900 dark:text-white uppercase block mb-1.5">
                Second Party / Buyer (طرف دوم - خریدار محترم):
              </span>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Full Name:</strong> {buyerName}
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Tazkira ID / Passport:</strong> {buyerTazkira}
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Contact Phone:</strong> {buyerPhone}
              </p>
            </div>
          </div>

          {/* Vehicle Particulars Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 print:border-gray-400">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold print:bg-gray-100">
                <tr>
                  <th className="p-3">Make & Model (کمپنی و نوعیت)</th>
                  <th className="p-3">Year / Trim (سال و تیپ)</th>
                  <th className="p-3">VIN / Chassis # (نمبر شاسی)</th>
                  <th className="p-3">Color / Steering (رنگ و اشترنگ)</th>
                  <th className="p-3">Customs Clearance (اسناد گمرکی)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 print:divide-gray-300 font-mono text-[11px]">
                <tr>
                  <td className="p-3 font-bold font-sans">
                    {vehicle.make} {vehicle.model}
                  </td>
                  <td className="p-3 font-sans">
                    {vehicle.year} • {vehicle.trim}
                  </td>
                  <td className="p-3 font-bold text-slate-950 dark:text-white print:text-black">
                    {vehicle.vin}
                  </td>
                  <td className="p-3 font-sans">
                    {vehicle.color} ({vehicle.steering.split(" ")[0]})
                  </td>
                  <td className="p-3 font-sans text-emerald-600 dark:text-emerald-400 font-semibold print:text-black">
                    {vehicle.customsClearance}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Settlement & Terms */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 p-4 print:bg-gray-50 print:border-gray-400">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Agreed Sale Price (USD)
                </span>
                <p className="mt-1 text-xl font-black text-slate-950 dark:text-white print:text-black font-mono">
                  ${vehicle.sellingPrice.toLocaleString()}
                </p>
                <span className="text-[10px] text-slate-500 font-dari">قیمت نهایی به دالر</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Sarrafi Market Rate
                </span>
                <p className="mt-1 text-xl font-black text-slate-950 dark:text-white print:text-black font-mono">
                  1 USD = {exchangeRate} AFN
                </p>
                <span className="text-[10px] text-slate-500 font-dari">نرخ روز صرافی هرات</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Deposit Paid (بیعانه)
                </span>
                <p className="mt-1 text-xl font-black text-emerald-600 print:text-black font-mono">
                  ${downPaymentUSD.toLocaleString()} USD
                </p>
                <span className="text-[10px] text-slate-500 font-dari">مبلغ پیش‌پرداخت تسلیم شده</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Remaining Payable
                </span>
                <p className="mt-1 text-xl font-black text-primary print:text-black font-mono">
                  ${remainingBalanceUSD.toLocaleString()} USD
                </p>
                <span className="text-[10px] text-slate-500 font-dari">
                  (؋ {(remainingBalanceUSD * exchangeRate).toLocaleString()} AFN)
                </span>
              </div>
            </div>
          </div>

          {/* Legal Warranties & Terms (Bilingual) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] leading-relaxed">
            <div>
              <p className="font-bold uppercase tracking-wider text-slate-900 dark:text-white print:text-black mb-1">
                English Legal Terms:
              </p>
              <p className="text-slate-600 dark:text-slate-300 print:text-gray-700">
                Sadozai Motors warrants that the vehicle designated above is free from all claims, liens, and disputes. Customs duties have been legally settled at Herat / Islam Qala Port. All vehicle keys, export titles, and original documents are conveyed unconditionally upon receipt of full funds.
              </p>
            </div>
            <div dir="rtl" className="font-dari">
              <p className="font-bold text-slate-900 dark:text-white print:text-black mb-1">
                {language === "ps"
                  ? "شرعي او قانوني مقررات (پښتو):"
                  : "مقررات و شرایط شرعی و قانونی (دری):"}
              </p>
              <p className="text-slate-600 dark:text-slate-300 print:text-gray-700">
                {language === "ps"
                  ? "د سدوزی موټرز نندارتون تضمین کوي چې یاد موټر بې‌ټکره، پاک، د هرات او اسلام قلعه د ګمرک بشپړ محصول شوی او ټول قانوني اسناد یې چمتو دي. د بشپړې بیې په تر لاسه کولو سره، د موټر ټول حقوق او اصلي اسناد پیرودونکي ته سپارل کیږي او معامله په رضایت ترسره شوه."
                  : "نمایشگاه موتر سدوزی تضمین می‌نماید که واسطه فوق‌الذکر پاک، بدون تکر شدید، محصول شده قطعی گمرک اسلام قلعه و دارای اسناد قانونی معتبر می‌باشد. با پرداخت کامل بها، کلیه حقوق و اسناد واسطه نقلیه به خریدار تسلیم گردیده و طرفین با رضایت کامل ایجاب و قبول نمودند."}
              </p>
            </div>
          </div>

          {/* Signatures, Official Stamp & Scannable QR Code */}
          <div className="grid grid-cols-4 gap-4 pt-4 text-center text-xs">
            {/* Merchant Signature */}
            <div className="rounded-xl border border-dashed border-slate-300 p-3.5 dark:border-slate-700 print:border-gray-400">
              <p className="font-bold text-slate-900 dark:text-white print:text-black text-[11px]">Seller / Merchant</p>
              <p className="text-[10px] text-slate-400 font-dari">
                {language === "ps" ? "پلورونکی (سدوزی موټرز)" : "فروشنده (سدوزی موترز)"}
              </p>
              <div className="h-12" />
              <div className="border-t border-slate-300 pt-1 text-[10px] font-medium text-slate-500 font-dari">
                {language === "ps" ? "لاسلیک او د ګوتې نښه" : "امضاء و شست"}
              </div>
            </div>

            {/* Buyer Signature */}
            <div className="rounded-xl border border-dashed border-slate-300 p-3.5 dark:border-slate-700 print:border-gray-400">
              <p className="font-bold text-slate-900 dark:text-white print:text-black text-[11px]">Buyer / Purchaser</p>
              <p className="text-[10px] text-slate-400 font-dari">
                {language === "ps" ? "پیرودونکی (د تابعیت تذکره)" : "خریدار محترم (تذکره)"}
              </p>
              <div className="h-12" />
              <div className="border-t border-slate-300 pt-1 text-[10px] font-medium text-slate-500 font-dari">
                {language === "ps" ? "لاسلیک او د ګوتې نښه" : "امضاء و شست"}
              </div>
            </div>

            {/* Official Stamp Seal */}
            <div className="rounded-xl border border-dashed border-slate-300 p-3.5 dark:border-slate-700 print:border-gray-400 flex flex-col items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white print:text-black text-[11px]">Official Stamp</p>
                <p className="text-[10px] text-slate-400 font-dari">
                  {language === "ps" ? "د نندارتون رسمي ټاپه" : "مهر رسمی نمایشگاه"}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary/40 text-primary print:border-gray-400 print:text-gray-600">
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
                  className="h-20 w-20 object-contain my-1"
                />
              ) : (
                <div className="h-20 w-20 flex items-center justify-center bg-slate-100 text-slate-400">
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
    </div>
  );
}
