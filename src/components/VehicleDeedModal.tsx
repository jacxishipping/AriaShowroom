"use client";

import React, { useRef } from "react";
import { VehicleItem } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { useShowroomStore } from "@/store/useShowroomStore";
import { Printer, X, ShieldCheck, FileCheck, Stamp, CheckCircle2 } from "lucide-react";

interface VehicleDeedModalProps {
  vehicle: VehicleItem;
  isOpen: boolean;
  onClose: () => void;
}

export function VehicleDeedModal({ vehicle, isOpen, onClose }: VehicleDeedModalProps) {
  const deedRef = useRef<HTMLDivElement>(null);
  const { language } = useShowroomStore();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const exchangeRate = 70.5;
  const priceAfn = Math.round(vehicle.sellingPrice * exchangeRate);
  const contractNumber = `SM-DEED-2026-${vehicle.stockNumber.replace("SM-HRT-", "")}`;
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
              className="flex items-center gap-1.5 rounded-lg bg-navy px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-navy-800 dark:bg-gold dark:text-slate-950 dark:hover:bg-gold-light transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save PDF (چاپ قباله)</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
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

          {/* Vehicle Particulars Table */}
          <div>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gold dark:text-gold-light print:text-black">
              {language === "ps"
                ? "۱. د موټر تخنیکي او ګمرکي مشخصات / 1. Vehicle Particulars & Customs Identity"
                : "1. Vehicle Particulars & Customs Identity / مشخصات تخنیکی و گمرکی موتر"}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs dark:border-slate-800 dark:bg-navy-900/50 print:border-gray-300 print:bg-white">
              <div>
                <span className="text-slate-400 print:text-gray-500 block text-[10px] uppercase">Make & Model</span>
                <span className="font-bold">{vehicle.make} {vehicle.model}</span>
              </div>
              <div>
                <span className="text-slate-400 print:text-gray-500 block text-[10px] uppercase">Year & Trim</span>
                <span className="font-bold">{vehicle.year} - {vehicle.trim}</span>
              </div>
              <div>
                <span className="text-slate-400 print:text-gray-500 block text-[10px] uppercase">Chassis (VIN) Number</span>
                <span className="font-mono font-bold tracking-wider">{vehicle.vin}</span>
              </div>
              <div>
                <span className="text-slate-400 print:text-gray-500 block text-[10px] uppercase">Stock ID</span>
                <span className="font-mono font-bold">{vehicle.stockNumber}</span>
              </div>

              <div>
                <span className="text-slate-400 print:text-gray-500 block text-[10px] uppercase">Odometer (Mileage)</span>
                <span className="font-bold">{vehicle.mileage.toLocaleString()} km</span>
              </div>
              <div>
                <span className="text-slate-400 print:text-gray-500 block text-[10px] uppercase">Color & Engine</span>
                <span className="font-bold">{vehicle.color} ({vehicle.fuelType})</span>
              </div>
              <div>
                <span className="text-slate-400 print:text-gray-500 block text-[10px] uppercase">Steering Specification</span>
                <span className="font-bold">{vehicle.steering}</span>
              </div>
              <div>
                <span className="text-slate-400 print:text-gray-500 block text-[10px] uppercase">Customs Clearance</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 print:text-black">{vehicle.customsClearance}</span>
              </div>
            </div>
          </div>

          {/* Pricing & Financial Consideration */}
          <div>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gold dark:text-gold-light print:text-black">
              {language === "ps"
                ? "۲. د معاملې بیه او تادیه / 2. Agreed Financial Consideration & Currency"
                : "2. Agreed Financial Consideration & Currency / مبلغ معامله و تسویه حساب"}
            </h4>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-navy-900/50 print:border-gray-300 print:bg-white text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-slate-500 print:text-gray-600">Total Purchase Price (USD):</p>
                  <p className="text-xl font-black text-slate-950 dark:text-white print:text-black">
                    ${vehicle.sellingPrice.toLocaleString()} USD
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 print:text-gray-600">Equivalent in Afghan Afghani (AFN):</p>
                  <p className="text-xl font-black text-gold dark:text-gold-light print:text-black">
                    ؋ {priceAfn.toLocaleString()} AFN
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Fixing Rate: 1 USD = {exchangeRate} AFN
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 print:text-gray-600">Title Status & Guarantee:</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 print:text-black flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Clean Title, Free of Encumbrance
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bilingual Legal Clauses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] leading-relaxed border-t border-b border-slate-200 py-4 dark:border-slate-800 print:border-gray-300">
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

          {/* Signatures & Official Stamp Grid */}
          <div className="grid grid-cols-3 gap-6 pt-2 text-center text-xs">
            <div className="rounded-xl border border-dashed border-slate-300 p-4 dark:border-slate-700 print:border-gray-400">
              <p className="font-bold text-slate-900 dark:text-white print:text-black">Seller / Merchant</p>
              <p className="text-[10px] text-slate-400 font-dari">
                {language === "ps" ? "پلورونکی (سدوزی موټرز)" : "فروشنده (سدوزی موترز)"}
              </p>
              <div className="h-12" />
              <div className="border-t border-slate-300 pt-1 text-[11px] font-medium text-slate-500 font-dari">
                {language === "ps" ? "لاسلیک او د ګوتې نښه" : "امضاء و شست"}
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-slate-300 p-4 dark:border-slate-700 print:border-gray-400">
              <p className="font-bold text-slate-900 dark:text-white print:text-black">Buyer / Purchaser</p>
              <p className="text-[10px] text-slate-400 font-dari">
                {language === "ps" ? "پیرودونکی (د تابعیت تذکره)" : "خریدار محترم (تذکره تابعیت)"}
              </p>
              <div className="h-12" />
              <div className="border-t border-slate-300 pt-1 text-[11px] font-medium text-slate-500 font-dari">
                {language === "ps" ? "لاسلیک او د ګوتې نښه" : "امضاء و شست"}
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-slate-300 p-4 dark:border-slate-700 print:border-gray-400 flex flex-col items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white print:text-black">Official Stamp</p>
                <p className="text-[10px] text-slate-400 font-dari">
                  {language === "ps" ? "د نندارتون رسمي ټاپه" : "مهر رسمی نمایشگاه هرات"}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gold/40 text-gold print:border-gray-400 print:text-gray-600">
                <Stamp className="h-6 w-6" />
              </div>
              <div className="border-t border-slate-300 w-full pt-1 text-[11px] font-mono text-slate-400">
                VERIFIED LOT
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
