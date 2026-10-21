"use client";

import React, { useState } from "react";
import QRCode from "qrcode";
import { PaymentVoucherRecord } from "@/lib/mock-data";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { MuiButton, IconButton } from "@/components/mui";
import {
  X,
  Printer,
  Receipt,
  CheckCircle2,
  Banknote,
  DollarSign,
  Building2,
  Calendar,
} from "lucide-react";

interface PaymentVoucherModalProps {
  voucher: PaymentVoucherRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentVoucherModal({
  voucher,
  isOpen,
  onClose,
}: PaymentVoucherModalProps) {
  const { language } = useShowroomStore();
  const t = translations[language];
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  React.useEffect(() => {
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
    });

    QRCode.toDataURL(qrData, { width: 120, margin: 1 })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error("QR Code error:", err));
  }, [voucher]);

  if (!isOpen || !voucher) return null;

  const handlePrint = () => {
    window.print();
  };

  const isIncoming = voucher.voucherType === "CUSTOMER_PAYMENT";
  const voucherTitle = isIncoming
    ? "Official Cash & Hawala Receipt Voucher (سند رسید دریافت وجه)"
    : "Official Payment & Settlement Voucher (سند پرداخت و تسویه حساب)";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-[#121824] dark:text-white border border-slate-200 dark:border-slate-800">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {voucherTitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <MuiButton
              variant="contained"
              color="primary"
              size="small"
              onClick={handlePrint}
              startIcon={<Printer className="h-3.5 w-3.5" />}
            >
              {t.buttonPrintVoucher}
            </MuiButton>
            <IconButton size="small" onClick={onClose}>
              <X className="h-5 w-5" />
            </IconButton>
          </div>
        </div>

        {/* Printable Voucher Form */}
        <div className="mt-6 space-y-6 text-slate-900 dark:text-slate-100 print:m-0 print:p-0">
          {/* Header */}
          <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-5">
            <h2 className="text-lg font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Sadozai Motors Herat
            </h2>
            <p className="text-xs font-dari text-slate-500 font-bold">
              مدیریت مالی و حسابداری صرافی نندارتون سدوزی هرات
            </p>
            <span className="inline-block mt-2 px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              VOUCHER #: {voucher.voucherNumber}
            </span>
          </div>

          {/* Key Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-md bg-slate-50 p-2.5 dark:bg-[#1A2234] border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Date (تاریخ)</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{voucher.date}</span>
            </div>

            <div className="rounded-md bg-slate-50 p-2.5 dark:bg-[#1A2234] border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Method</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{voucher.paymentMethod}</span>
            </div>

            <div className="rounded-md bg-slate-50 p-2.5 dark:bg-[#1A2234] border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Sarrafi / Bank Safe</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                {voucher.sarrafiAccount || "Central Vault"}
              </span>
            </div>
          </div>

          {/* Amount Box */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-[#1A2234] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Settlement Amount (مبلغ معامله)
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                  ${voucher.amountUSD.toLocaleString()} USD
                </span>
                <span className="text-xs font-mono font-semibold text-slate-500">
                  (؋{voucher.amountAFN.toLocaleString()} AFN)
                </span>
              </div>
            </div>

            <div className="text-right text-[11px] font-mono text-slate-500">
              <p>Exchange Rate: $1 = {voucher.exchangeRate} AFN</p>
              {voucher.referenceNumber && (
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  Ref / Hawala #: {voucher.referenceNumber}
                </p>
              )}
            </div>
          </div>

          {/* Particulars */}
          <div className="space-y-3 text-xs">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">
                {isIncoming ? "Received From (دریافت‌شده از):" : "Paid To (پرداخت‌شده به):"}
              </span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {voucher.partyName}
              </span>
              {voucher.partyPhone && (
                <span className="text-slate-500 font-mono ml-2">({voucher.partyPhone})</span>
              )}
            </div>

            <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">
                Purpose & Account Description (بابت / شرح سند):
              </span>
              <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                {voucher.purpose}
              </p>
            </div>

            {voucher.vehicleStock && (
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">
                  Linked Vehicle Stock ID:
                </span>
                <span className="font-mono font-bold text-primary">
                  {voucher.vehicleStock}
                </span>
              </div>
            )}
          </div>

          {/* QR Code & Signatures */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
            {qrCodeUrl && (
              <div className="flex items-center gap-2">
                <img src={qrCodeUrl} alt="Voucher QR" className="h-16 w-16 rounded border border-slate-200 dark:border-slate-800 p-0.5" />
                <div className="text-[10px] text-slate-400 font-mono">
                  <p>Certified Hawala Voucher</p>
                  <p>Sadozai ERP Finance</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6 text-center text-xs w-full sm:w-auto">
              <div>
                <div className="h-10"></div>
                <div className="border-t border-slate-300 dark:border-slate-700 pt-1 font-semibold text-slate-700 dark:text-slate-300">
                  {voucher.recordedBy}
                </div>
                <span className="text-[10px] text-slate-400">Finance & Accounting</span>
              </div>

              <div>
                <div className="h-10"></div>
                <div className="border-t border-slate-300 dark:border-slate-700 pt-1 font-semibold text-slate-700 dark:text-slate-300">
                  {voucher.partyName}
                </div>
                <span className="text-[10px] text-slate-400">Payer / Payee Signature</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
