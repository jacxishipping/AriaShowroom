"use client";

import React, { useRef, useState, useEffect } from "react";
import QRCode from "qrcode";
import { VehicleItem } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { useShowroomStore } from "@/store/useShowroomStore";
import { Printer, X, ShieldCheck, FileCheck, Stamp, CheckCircle2, QrCode } from "lucide-react";

interface VehicleDeedModalProps {
  vehicle: VehicleItem;
  isOpen: boolean;
  onClose: () => void;
}

export function VehicleDeedModal({ vehicle, isOpen, onClose }: VehicleDeedModalProps) {
  const deedRef = useRef<HTMLDivElement>(null);
  const { language } = useShowroomStore();

  const [buyerName, setBuyerName] = useState("Haji Abdul Qadir Karimi");
  const [buyerTazkira, setBuyerTazkira] = useState("HRT-1402-984210");
  const [buyerPhone, setBuyerPhone] = useState("+93 79 988 7766");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  const exchangeRate = 70.5;
  const priceAfn = Math.round(vehicle.sellingPrice * exchangeRate);
  const contractNumber = `SM-DEED-2026-${vehicle.stockNumber.replace("SM-HRT-", "")}`;
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Generate dynamic QR code
  useEffect(() => {
    if (!isOpen) return;

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
      width: 140,
      margin: 1,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error("QR Code error:", err));
  }, [isOpen, vehicle, contractNumber, priceAfn, buyerTazkira]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-navy-950 sm:p-8 print:w-full print:max-w-none print:shadow-none print:p-6 print:text-black">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-gold" />
            <span className="font-bold text-slate-900 dark:text-white">
              Official Bilingual Vehicle Sales Deed & Deposit Deed (قباله رسمی و خط بیعانه)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-navy px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-navy-800 dark:bg-gold dark:text-slate-950 dark:hover:bg-gold-light transition-colors cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save PDF (چاپ قباله)</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Live Buyer Input Strip (Hidden in Print) */}
        <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-navy-900 border border-slate-200 dark:border-slate-800 print:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Quick Buyer Data Entry (مشخصات خریدار جهت درج در قباله):
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Changes update deed & QR code in real-time</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Buyer Full Name (نام خریدار)</label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2.5 py-1 text-xs dark:bg-navy-950 dark:border-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Tazkira / National ID (نمبر تذکره)</label>
              <input
                type="text"
                value={buyerTazkira}
                onChange={(e) => setBuyerTazkira(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2.5 py-1 text-xs dark:bg-navy-950 dark:border-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Phone Number (شماره تماس)</label>
              <input
                type="text"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2.5 py-1 text-xs dark:bg-navy-950 dark:border-slate-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Printable Deed Document Container */}
        <div ref={deedRef} className="mt-6 space-y-6 text-slate-900 dark:text-slate-100 print:text-black print:mt-0 font-sans">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-slate-900 pb-5 gap-4">
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
          <div className="rounded-lg bg-slate-100 p-2 text-center text-xs font-bold uppercase tracking-wider text-slate-800 dark:bg-navy-900 dark:text-gold print:bg-gray-100 print:text-black">
            {language === "ps"
              ? "VEHICLE SALES CONTRACT & TITLE DEED / د موټر د پلور او واک سپارلو رسمي شرعي قباله"
              : "BILINGUAL VEHICLE SALES CONTRACT & TITLE CONVEYANCE DEED / قباله شرعی و رسمی فروش موتر"}
          </div>

          {/* Parties Particulars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-800 print:border-gray-300">
              <span className="font-bold text-slate-900 dark:text-white uppercase block mb-1">
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

            <div className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-800 print:border-gray-300">
              <span className="font-bold text-slate-900 dark:text-white uppercase block mb-1">
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
              <thead className="bg-slate-100 font-bold dark:bg-navy-900 print:bg-gray-100">
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
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-navy-900/40 print:bg-gray-50 print:border-gray-400">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Agreed Sale Price (USD)
                </span>
                <p className="mt-1 text-xl font-black text-slate-950 dark:text-white print:text-black font-mono">
                  ${vehicle.sellingPrice.toLocaleString()} USD
                </p>
                <span className="text-[10px] text-slate-500 font-dari">قیمت نهایی به دالر آمریکایی</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Exchange Rate (Sarrafi Herat)
                </span>
                <p className="mt-1 text-xl font-black text-slate-950 dark:text-white print:text-black font-mono">
                  1 USD = {exchangeRate} AFN
                </p>
                <span className="text-[10px] text-slate-500 font-dari">نرخ روز صرافی هرات</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total in Afghani (AFN)
                </span>
                <p className="mt-1 text-xl font-black text-gold print:text-black font-mono">
                  {priceAfn.toLocaleString()} AFN
                </p>
                <span className="text-[10px] text-slate-500 font-dari">مبلغ کل قابل پرداخت به افغانی</span>
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
          <div className="grid grid-cols-4 gap-4 pt-2 text-center text-xs">
            {/* Merchant Signature */}
            <div className="rounded-xl border border-dashed border-slate-300 p-3 dark:border-slate-700 print:border-gray-400">
              <p className="font-bold text-slate-900 dark:text-white print:text-black text-[11px]">Seller / Merchant</p>
              <p className="text-[10px] text-slate-400 font-dari">
                {language === "ps" ? "پلورونکی (سدوزی موټرز)" : "فروشنده (سدوزی موترز)"}
              </p>
              <div className="h-10" />
              <div className="border-t border-slate-300 pt-1 text-[10px] font-medium text-slate-500 font-dari">
                {language === "ps" ? "لاسلیک او د ګوتې نښه" : "امضاء و شست"}
              </div>
            </div>

            {/* Buyer Signature */}
            <div className="rounded-xl border border-dashed border-slate-300 p-3 dark:border-slate-700 print:border-gray-400">
              <p className="font-bold text-slate-900 dark:text-white print:text-black text-[11px]">Buyer / Purchaser</p>
              <p className="text-[10px] text-slate-400 font-dari">
                {language === "ps" ? "پیرودونکی (د تابعیت تذکره)" : "خریدار محترم (تذکره)"}
              </p>
              <div className="h-10" />
              <div className="border-t border-slate-300 pt-1 text-[10px] font-medium text-slate-500 font-dari">
                {language === "ps" ? "لاسلیک او د ګوتې نښه" : "امضاء و شست"}
              </div>
            </div>

            {/* Official Stamp Seal */}
            <div className="rounded-xl border border-dashed border-slate-300 p-3 dark:border-slate-700 print:border-gray-400 flex flex-col items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white print:text-black text-[11px]">Official Stamp</p>
                <p className="text-[10px] text-slate-400 font-dari">
                  {language === "ps" ? "د نندارتون رسمي ټاپه" : "مهر رسمی نمایشگاه"}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gold/40 text-gold print:border-gray-400 print:text-gray-600">
                <Stamp className="h-5 w-5" />
              </div>
              <div className="border-t border-slate-300 w-full pt-1 text-[9px] font-mono text-slate-400">
                VERIFIED LOT
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
