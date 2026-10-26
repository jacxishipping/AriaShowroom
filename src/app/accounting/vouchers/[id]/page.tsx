"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import QRCode from "qrcode";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { MuiButton } from "@/components/mui";
import {
  Receipt,
  Printer,
  ArrowLeft,
  Share2,
  Car,
  QrCode,
  AlertTriangle,
} from "lucide-react";

export default function PaymentVoucherPage() {
  const params = useParams();
  const voucherId = params?.id as string;
  const { payments, language, addToast, branding } = useShowroomStore();
  const t = translations[language];

  // Exact match without fake fallback to payments[0]
  const voucher = payments.find(
    (v) => v.id === voucherId || v.voucherNumber === voucherId
  );

  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    if (!voucher) return;
    const qrData = JSON.stringify({
      voucher: voucher.voucherNumber,
      type: voucher.voucherType,
      party: voucher.partyName,
      usd: voucher.amountUSD,
      afn: voucher.amountAFN,
      date: voucher.date,
      sarrafi: voucher.sarrafiAccount || "Cash Safe",
      ref: voucher.referenceNumber,
      dealer: branding.dealershipName,
    });

    QRCode.toDataURL(qrData, { width: 120, margin: 1 })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error("QR Code error:", err));
  }, [voucher, branding.dealershipName]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      addToast("Voucher link copied to clipboard!", "success");
    }
  };

  if (!voucher) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center space-y-4">
        <div className="mx-auto h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Voucher Record Not Found
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          No payment or receipt voucher matching <span className="font-mono font-bold">{voucherId}</span> exists in the ledger.
        </p>
        <MuiButton
          component={Link}
          href="/accounting"
          variant="contained"
          color="primary"
          size="small"
          startIcon={<ArrowLeft className="h-4 w-4 rtl:rotate-180" />}
        >
          Back to Accounting Hub
        </MuiButton>
      </div>
    );
  }

  const isIncoming = voucher.voucherType === "CUSTOMER_PAYMENT";
  const voucherTitle = isIncoming
    ? "Official Cash & Hawala Receipt Voucher (سند رسید دریافت وجه)"
    : "Official Payment & Settlement Voucher (سند پرداخت و تسویه حساب)";

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header & Actions (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#262F40] print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/" className="hover:text-primary transition-colors">
              Cockpit
            </Link>
            <span>/</span>
            <Link href="/accounting" className="hover:text-primary transition-colors">
              Accounting & Sarrafi Hub
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium font-mono">
              Voucher #{voucher.voucherNumber}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" />
            {voucherTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            سند رسمی حواله صرافی و پرداخت نقدی — {branding.dealershipNameFa || branding.dealershipName}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <MuiButton
            component={Link}
            href="/accounting"
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<ArrowLeft className="h-4 w-4 rtl:rotate-180" />}
          >
            Back to Accounting
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
            size="small"
            onClick={handlePrint}
            startIcon={<Printer className="h-4 w-4" />}
          >
            {t.buttonPrintVoucher}
          </MuiButton>
        </div>
      </div>

      {/* Printable Voucher Sheet */}
      <div className="rounded-xl bg-white p-6 sm:p-10 shadow-lg border border-slate-200 dark:border-[#262F40] dark:bg-[#161B26] text-slate-900 dark:text-slate-100 print:bg-white print:text-black print:border-none print:shadow-none print:p-0 space-y-6">
        {/* Dealership Header */}
        <div className="text-center border-b border-slate-200 dark:border-[#262F40] pb-5 print:border-black">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-bold print:bg-black">
              <Car className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-wider text-slate-900 dark:text-white print:text-black">
              {branding.dealershipName}
            </h2>
          </div>
          <p className="text-xs font-dari text-slate-500 dark:text-slate-400 print:text-gray-600 font-bold">
            مدیریت مالی و حسابداری صرافی — {branding.dealershipNameFa}
          </p>
          <span className="inline-block mt-2 px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 print:bg-gray-100 print:text-black">
            VOUCHER #: {voucher.voucherNumber}
          </span>
        </div>

        {/* Key Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-[#0F141C] border border-slate-200 dark:border-[#262F40] print:border-gray-400">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Date (تاریخ)
            </span>
            <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200 print:text-black">
              {voucher.date}
            </span>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 dark:bg-[#0F141C] border border-slate-200 dark:border-[#262F40] print:border-gray-400">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Payment Method
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 print:text-black">
              {voucher.paymentMethod}
            </span>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 dark:bg-[#0F141C] border border-slate-200 dark:border-[#262F40] print:border-gray-400">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Sarrafi / Bank Safe
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 print:text-black truncate block">
              {voucher.sarrafiAccount || "Central Vault"}
            </span>
          </div>
        </div>

        {/* Amount Box */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-[#262F40] dark:bg-[#0F141C] flex flex-col sm:flex-row items-center justify-between gap-4 print:border-gray-400 print:bg-gray-50">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Settlement Amount (مبلغ معامله)
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-2xl font-black font-mono tabular-nums text-slate-900 dark:text-white print:text-black">
                ${voucher.amountUSD.toLocaleString()} USD
              </span>
              <span className="text-xs font-mono tabular-nums font-semibold text-emerald-600">
                (؋{voucher.amountAFN.toLocaleString()} AFN)
              </span>
            </div>
          </div>

          <div className="text-end text-[11px] font-mono tabular-nums text-slate-500 print:text-gray-700">
            <p>Exchange Rate: $1 = {voucher.exchangeRate} AFN</p>
            {voucher.referenceNumber && (
              <p className="font-bold text-slate-700 dark:text-slate-300 print:text-black">
                Ref / Hawala #: {voucher.referenceNumber}
              </p>
            )}
          </div>
        </div>

        {/* Particulars */}
        <div className="space-y-4 text-xs">
          <div className="border-b border-slate-100 dark:border-[#262F40] pb-3">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">
              {isIncoming
                ? "Received From (دریافت‌شده از):"
                : "Paid To (پرداخت‌شده به):"}
            </span>
            <span className="font-bold text-base text-slate-900 dark:text-white print:text-black">
              {voucher.partyName}
            </span>
            {voucher.partyPhone && (
              <span className="text-slate-500 font-mono tabular-nums ms-2">
                ({voucher.partyPhone})
              </span>
            )}
          </div>

          <div className="border-b border-slate-100 dark:border-[#262F40] pb-3">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">
              Purpose & Account Description (بابت / شرح سند):
            </span>
            <p className="font-medium text-slate-800 dark:text-slate-200 print:text-black mt-1 leading-relaxed">
              {voucher.purpose}
            </p>
          </div>

          {voucher.vehicleStock && (
            <div className="border-b border-slate-100 dark:border-[#262F40] pb-3">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">
                Linked Vehicle Stock ID:
              </span>
              <span className="font-mono font-bold text-primary print:text-black">
                {voucher.vehicleStock}
              </span>
            </div>
          )}
        </div>

        {/* Dynamic Verification QR */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-[#262F40] pt-5 print:border-black">
          <div className="flex items-center gap-3">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="Voucher Verification QR"
                className="h-20 w-20 rounded border border-slate-200 p-1 bg-white"
              />
            ) : (
              <div className="h-20 w-20 flex items-center justify-center bg-slate-100 text-slate-400">
                <QrCode className="h-8 w-8" />
              </div>
            )}
            <div className="text-[10px] text-slate-500 font-mono">
              <p className="font-bold text-slate-800 dark:text-slate-200 print:text-black">
                Official Financial Voucher
              </p>
              <p>Cryptographically logged in General Ledger.</p>
              <p>
                {branding.dealershipName} ({branding.licenseNumber})
              </p>
            </div>
          </div>
        </div>

        {/* Authorized Signatures & Seal */}
        <div className="grid grid-cols-3 gap-4 border-t border-slate-200 dark:border-[#262F40] pt-8 text-center text-xs print:border-black">
          <div>
            <div className="h-12" />
            <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-2 print:border-gray-400">
              <span className="font-bold text-slate-800 dark:text-slate-200 print:text-black">
                Prepared By
              </span>
              <p className="text-[10px] text-slate-400">تهیه‌کننده (حسابدار)</p>
            </div>
          </div>

          <div>
            <div className="h-12" />
            <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-2 print:border-gray-400">
              <span className="font-bold text-slate-800 dark:text-slate-200 print:text-black">
                {branding.authorizedSignatory}
              </span>
              <p className="text-[10px] text-slate-400">مدیریت مالی {branding.dealershipNameFa}</p>
            </div>
          </div>

          <div>
            <div className="h-12" />
            <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-2 print:border-gray-400">
              <span className="font-bold text-slate-800 dark:text-slate-200 print:text-black">
                {isIncoming ? "Payer (پرداخت‌کننده)" : "Beneficiary (گیرنده وجه)"}
              </span>
              <p className="text-[10px] text-slate-400">امضاء و اثر انگشت</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
