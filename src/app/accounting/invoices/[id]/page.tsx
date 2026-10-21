"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import QRCode from "qrcode";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import {
  MuiCard,
  MuiButton,
  MuiChip,
  IconButton,
} from "@/components/mui";
import {
  FileCheck2,
  Printer,
  ArrowLeft,
  Car,
  QrCode,
  DollarSign,
  Building2,
  Phone,
  Calendar,
  CheckCircle2,
  Share2,
  Download,
  Loader2,
} from "lucide-react";
import { downloadCommercialInvoicePDF } from "@/lib/invoice-pdf";

export default function CommercialInvoicePage() {
  const params = useParams();
  const invoiceId = params?.id as string;
  const { invoices, exchangeRate, language, addToast } = useShowroomStore();
  const t = translations[language];

  const invoice =
    invoices.find((inv) => inv.id === invoiceId || inv.invoiceNumber === invoiceId) ||
    invoices[0];

  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isDownloadingPDF, setIsDownloadingPDF] = useState<boolean>(false);

  useEffect(() => {
    if (!invoice) return;
    const qrData = JSON.stringify({
      inv: invoice.invoiceNumber,
      buyer: invoice.customerName,
      tazkira: invoice.customerTazkira,
      vin: invoice.vin,
      totalUSD: invoice.totalUSD,
      totalAFN: invoice.totalAFN,
      date: invoice.issueDate,
      dealer: "Sadozai Motors Herat",
    });

    QRCode.toDataURL(qrData, { width: 140, margin: 1 })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error("QR Code error:", err));
  }, [invoice]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    setIsDownloadingPDF(true);
    addToast("Generating commercial invoice PDF...", "info");
    try {
      await downloadCommercialInvoicePDF(invoice, "commercial-invoice-document");
      addToast(`Commercial invoice ${invoice.invoiceNumber} downloaded as PDF`, "success");
    } catch (err) {
      console.error("PDF generation failed:", err);
      addToast("Failed to generate PDF. Please try again.", "error");
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      addToast("Invoice link copied to clipboard!", "success");
    }
  };

  if (!invoice) {
    return (
      <div className="p-8 text-center text-slate-500">
        Invoice record not found.{" "}
        <Link href="/admin" className="text-primary underline">
          Return to Dealership ERP
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header & Actions (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/" className="hover:text-primary transition-colors">
              Cockpit
            </Link>
            <span>/</span>
            <Link href="/admin" className="hover:text-primary transition-colors">
              Dealership ERP Hub
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">
              Invoice #{invoice.invoiceNumber}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck2 className="h-6 w-6 text-primary" />
            Official Commercial Tax Invoice
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            فاکتور رسمی تجارتی و سند قطعی فروش موتر نندارتون موتر سدوزی هرات
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <MuiButton
            component={Link}
            href="/admin"
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to ERP Hub
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
            variant="outlined"
            color="inherit"
            size="small"
            onClick={handlePrint}
            startIcon={<Printer className="h-4 w-4" />}
          >
            {t.buttonPrint}
          </MuiButton>
          <MuiButton
            variant="contained"
            color="primary"
            size="small"
            onClick={handleDownloadPDF}
            disabled={isDownloadingPDF}
            startIcon={
              isDownloadingPDF ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )
            }
          >
            {isDownloadingPDF ? t.buttonGeneratingPdf : t.buttonDownloadPdf}
          </MuiButton>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div
        id="commercial-invoice-document"
        className="rounded-2xl bg-white p-6 sm:p-10 shadow-lg border border-slate-200 dark:border-slate-800 dark:bg-[#111827] text-slate-900 dark:text-slate-100 print:bg-white print:text-black print:border-none print:shadow-none print:p-0 space-y-6"
      >
        {/* Dealership Header & Invoice ID */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 print:border-black">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white font-bold print:bg-black">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white print:text-black">
                  Sadozai Motors Herat
                </h1>
                <span className="text-xs font-dari text-slate-500 dark:text-slate-400 print:text-gray-600 block font-bold">
                  نندارتون و شرکت وارداتی اتومبیل سدوزی هرات
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 print:text-gray-600 max-w-sm">
              Main Boulevard, Bagh-e-Azadi, Herat, Afghanistan • Registered Dealership License #49912
            </p>
            <p className="text-xs text-slate-500 font-mono print:text-gray-600">
              Tel: +93 79 910 2030 | WhatsApp: +93 79 912 3456
            </p>
          </div>

          <div className="text-right sm:self-auto self-end">
            <span className="inline-block px-3 py-1 text-xs font-bold font-mono uppercase tracking-wider rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 print:bg-gray-100 print:text-black">
              {invoice.invoiceNumber}
            </span>
            <div className="mt-2 space-y-0.5 text-xs text-slate-500 print:text-gray-600">
              <p>Date: <span className="font-mono font-medium text-slate-800 dark:text-slate-200 print:text-black">{invoice.issueDate}</span></p>
              {invoice.dueDate && (
                <p>Due Date: <span className="font-mono font-medium text-slate-800 dark:text-slate-200 print:text-black">{invoice.dueDate}</span></p>
              )}
              <p>Status: <span className="font-semibold text-emerald-600 print:text-black">{invoice.status}</span></p>
            </div>
          </div>
        </div>

        {/* Bill To & Vehicle Spec Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 print:border-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Billed To (مشخصات خریدار / مشتری)
            </span>
            <p className="font-bold text-sm text-slate-900 dark:text-white print:text-black">
              {invoice.customerName}
            </p>
            <p className="text-slate-600 dark:text-slate-300 font-mono mt-0.5 print:text-gray-700">
              Phone: {invoice.customerPhone}
            </p>
            {invoice.customerTazkira && (
              <p className="text-slate-500 font-mono print:text-gray-600">
                Tazkira ID: {invoice.customerTazkira}
              </p>
            )}
            {invoice.customerAddress && (
              <p className="text-slate-500 print:text-gray-600">{invoice.customerAddress}</p>
            )}
          </div>

          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 print:border-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Vehicle Details (مشخصات موتر معامله‌شده)
            </span>
            <p className="font-bold text-sm text-slate-900 dark:text-white print:text-black">
              {invoice.vehicleDesc || "Vehicle Direct Import"}
            </p>
            <p className="text-slate-600 dark:text-slate-300 font-mono mt-0.5 print:text-gray-700">
              Stock #: {invoice.vehicleStock || "N/A"}
            </p>
            <p className="text-slate-500 font-mono print:text-gray-600">
              Chassis / VIN: {invoice.vin || "N/A"}
            </p>
            <p className="text-slate-500 font-medium print:text-gray-600">
              Payment Method: {invoice.paymentMethod}
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 print:border-gray-400">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 font-bold border-b border-slate-200 dark:border-slate-800 print:bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-slate-700 dark:text-slate-300 print:text-black">#</th>
                <th className="py-3 px-4 text-slate-700 dark:text-slate-300 print:text-black">Description (شرح خدمات و موتر)</th>
                <th className="py-3 px-4 text-slate-700 dark:text-slate-300 print:text-black text-right">Amount (USD)</th>
                <th className="py-3 px-4 text-slate-700 dark:text-slate-300 print:text-black text-right">Amount (AFN)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 print:divide-gray-300">
              {invoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 print:text-black">
                    {item.description}
                  </td>
                  <td className="py-3 px-4 font-mono text-right text-slate-900 dark:text-white print:text-black">
                    ${item.amountUSD.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-right text-slate-500 print:text-gray-700">
                    ؋ {Math.round(item.amountUSD * (invoice.exchangeRate || exchangeRate)).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Subtotal, Grand Total & Dynamic QR Code */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-slate-200 dark:border-slate-800 pt-5 print:border-black">
          {/* QR Code and Tax Notice */}
          <div className="flex items-center gap-3">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="Invoice QR Verification"
                className="h-24 w-24 rounded-lg border border-slate-200 p-1 dark:border-slate-700 bg-white"
              />
            ) : (
              <div className="h-24 w-24 rounded-lg border border-slate-200 flex items-center justify-center bg-slate-50 text-slate-400">
                <QrCode className="h-8 w-8" />
              </div>
            )}
            <div className="text-[11px] text-slate-500 print:text-gray-600 space-y-0.5">
              <p className="font-bold text-slate-800 dark:text-slate-200 print:text-black">
                Official Herat Customs Registered
              </p>
              <p>Scan to verify authenticity & tax compliance.</p>
              <p className="font-mono text-[10px]">
                Exchange Rate: 1 USD = {invoice.exchangeRate || exchangeRate} AFN
              </p>
            </div>
          </div>

          {/* Totals */}
          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-300 print:text-gray-700">
              <span>Subtotal (مجموع اقلام):</span>
              <span className="font-mono font-medium">${invoice.subtotalUSD.toLocaleString()}</span>
            </div>

            {invoice.customsFeeUSD > 0 && (
              <div className="flex justify-between text-slate-600 dark:text-slate-300 print:text-gray-700">
                <span>Customs Tariff / Maktoub:</span>
                <span className="font-mono font-medium">${invoice.customsFeeUSD.toLocaleString()}</span>
              </div>
            )}

            {invoice.registrationFeeUSD > 0 && (
              <div className="flex justify-between text-slate-600 dark:text-slate-300 print:text-gray-700">
                <span>Traffic Registration:</span>
                <span className="font-mono font-medium">${invoice.registrationFeeUSD.toLocaleString()}</span>
              </div>
            )}

            {invoice.discountUSD > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Special Discount:</span>
                <span className="font-mono font-medium">-${invoice.discountUSD.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2 text-sm font-bold text-slate-900 dark:text-white print:text-black">
              <span>Grand Total (USD):</span>
              <span className="font-mono text-base font-black text-primary print:text-black">
                ${invoice.totalUSD.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between text-xs font-mono text-emerald-600 font-bold">
              <span>Grand Total (AFN):</span>
              <span>؋ {invoice.totalAFN.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Authorized Signatures & Seal */}
        <div className="grid grid-cols-2 gap-8 border-t border-slate-200 dark:border-slate-800 pt-8 text-center text-xs print:border-black">
          <div>
            <div className="h-14" />
            <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-2 print:border-gray-400">
              <span className="font-bold text-slate-800 dark:text-slate-200 print:text-black">
                Customer Signature & Fingerprint
              </span>
              <p className="text-[10px] text-slate-400 font-dari">امضاء و شست خریدار محترم</p>
            </div>
          </div>

          <div>
            <div className="h-14" />
            <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-2 print:border-gray-400">
              <span className="font-bold text-slate-800 dark:text-slate-200 print:text-black">
                Authorized Showroom Seal & Sign
              </span>
              <p className="text-[10px] text-slate-400 font-dari">مهر و امضاء مدیریت نمایشگاه سدوزی</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
