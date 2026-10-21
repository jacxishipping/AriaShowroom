"use client";

import React, { useState } from "react";
import QRCode from "qrcode";
import { InvoiceRecord } from "@/lib/mock-data";
import { useShowroomStore } from "@/store/useShowroomStore";
import { formatCurrency } from "@/lib/utils";
import { MuiButton, MuiChip, IconButton } from "@/components/mui";
import {
  X,
  Printer,
  FileCheck2,
  DollarSign,
  Building2,
  Phone,
  Calendar,
  CheckCircle2,
  Car,
  Download,
  Loader2,
} from "lucide-react";
import { downloadCommercialInvoicePDF } from "@/lib/invoice-pdf";

interface CommercialInvoiceModalProps {
  invoice: InvoiceRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CommercialInvoiceModal({
  invoice,
  isOpen,
  onClose,
}: CommercialInvoiceModalProps) {
  const { exchangeRate, addToast } = useShowroomStore();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isDownloadingPDF, setIsDownloadingPDF] = useState<boolean>(false);

  React.useEffect(() => {
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

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    setIsDownloadingPDF(true);
    addToast("Generating commercial invoice PDF...", "info");
    try {
      await downloadCommercialInvoicePDF(invoice, "commercial-invoice-modal-content");
      addToast(`Commercial invoice ${invoice.invoiceNumber} downloaded as PDF`, "success");
    } catch (err) {
      console.error("PDF generation failed:", err);
      addToast("Failed to generate PDF. Please try again.", "error");
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-[#121824] dark:text-white border border-slate-200 dark:border-slate-800">
        {/* Top Action Bar (hidden when printing) */}
        <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              Official Commercial Tax Invoice • فاکتور رسمی تجارتی
            </span>
          </div>

          <div className="flex items-center gap-2">
            <MuiButton
              variant="outlined"
              color="inherit"
              size="small"
              onClick={handlePrint}
              startIcon={<Printer className="h-3.5 w-3.5" />}
            >
              Print (چاپ)
            </MuiButton>
            <MuiButton
              variant="contained"
              color="primary"
              size="small"
              onClick={handleDownloadPDF}
              disabled={isDownloadingPDF}
              startIcon={
                isDownloadingPDF ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )
              }
            >
              {isDownloadingPDF ? "Generating PDF..." : "Download PDF (دانلود PDF)"}
            </MuiButton>
            <IconButton size="small" onClick={onClose}>
              <X className="h-5 w-5" />
            </IconButton>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div
          id="commercial-invoice-modal-content"
          className="mt-6 space-y-6 text-slate-900 dark:text-slate-100 print:m-0 print:p-0"
        >
          {/* Header & Logo */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white font-bold">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                    Sadozai Motors Herat
                  </h1>
                  <span className="text-xs font-dari text-slate-500 dark:text-slate-400 block font-bold">
                    نندارتون و شرکت وارداتی اتومبیل سدوزی هرات
                  </span>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                Main Boulevard, Bagh-e-Azadi, Herat, Afghanistan • Registered Dealership License #49912
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Tel: +93 79 910 2030 | WhatsApp: +93 79 912 3456
              </p>
            </div>

            <div className="text-right sm:self-auto self-end">
              <span className="inline-block px-3 py-1 text-xs font-bold font-mono uppercase tracking-wider rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                {invoice.invoiceNumber}
              </span>
              <div className="mt-2 space-y-0.5 text-xs text-slate-500">
                <p>Date: <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{invoice.issueDate}</span></p>
                {invoice.dueDate && (
                  <p>Due Date: <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{invoice.dueDate}</span></p>
                )}
                <p>Status: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{invoice.status}</span></p>
              </div>
            </div>
          </div>

          {/* Bill To & Vehicle Spec Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="rounded-lg bg-slate-50/80 p-3.5 dark:bg-[#1A2234] border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Billed To (مشخصات خریدار / مشتری)
              </span>
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                {invoice.customerName}
              </p>
              <p className="text-slate-600 dark:text-slate-300 font-mono mt-0.5">
                Phone: {invoice.customerPhone}
              </p>
              {invoice.customerTazkira && (
                <p className="text-slate-500 font-mono">
                  Tazkira ID: {invoice.customerTazkira}
                </p>
              )}
              {invoice.customerAddress && (
                <p className="text-slate-500">{invoice.customerAddress}</p>
              )}
            </div>

            <div className="rounded-lg bg-slate-50/80 p-3.5 dark:bg-[#1A2234] border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Vehicle Details (مشخصات موتر معامله‌شده)
              </span>
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                {invoice.vehicleDesc || "Vehicle Direct Import"}
              </p>
              <p className="text-slate-600 dark:text-slate-300 font-mono mt-0.5">
                Stock #: {invoice.vehicleStock || "N/A"}
              </p>
              <p className="text-slate-500 font-mono">
                Chassis / VIN: {invoice.vin || "N/A"}
              </p>
              <p className="text-slate-500 font-medium">
                Payment Method: {invoice.paymentMethod}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-300">#</th>
                  <th className="py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-300">Description (شرح خدمات و موتر)</th>
                  <th className="py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Amount (USD)</th>
                  <th className="py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Amount (AFN)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {item.description}
                      </div>
                      <div className="text-[11px] font-dari text-slate-500">
                        {item.descriptionDari}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900 dark:text-white">
                      ${item.amountUSD.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                      ؋{Math.round(item.amountUSD * invoice.exchangeRate).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & QR Code Verification */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-2">
            <div className="flex items-center gap-3">
              {qrCodeUrl && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-1 bg-white">
                  <img src={qrCodeUrl} alt="Invoice QR" className="h-20 w-20" />
                </div>
              )}
              <div className="text-[11px] text-slate-500 space-y-0.5">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Digitally Verified ERP Invoice
                </p>
                <p>Islam Qala Port Customs Cleared</p>
                <p className="font-mono">Rate: $1 = {invoice.exchangeRate} AFN</p>
              </div>
            </div>

            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal (مجموع):</span>
                <span className="font-mono font-medium">${invoice.subtotalUSD.toLocaleString()} USD</span>
              </div>
              {invoice.discountUSD > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Special Discount (تخفیف):</span>
                  <span className="font-mono font-medium">-${invoice.discountUSD.toLocaleString()} USD</span>
                </div>
              )}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  Total Payable:
                </span>
                <div className="text-right">
                  <span className="font-black font-mono text-base text-slate-950 dark:text-white block">
                    ${invoice.totalUSD.toLocaleString()} USD
                  </span>
                  <span className="font-mono text-xs text-slate-500 block">
                    ؋{invoice.totalAFN.toLocaleString()} AFN
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Authorized Signature Block */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-dashed border-slate-200 dark:border-slate-800 text-xs text-center">
            <div>
              <div className="h-12 flex items-center justify-center">
                <span className="text-[11px] text-slate-400 italic">Official Showroom Stamp & Signature</span>
              </div>
              <div className="border-t border-slate-300 dark:border-slate-700 pt-1 font-semibold text-slate-800 dark:text-slate-200">
                Haji Ahmad Shah (Sadozai Motors CEO)
              </div>
            </div>

            <div>
              <div className="h-12 flex items-center justify-center">
                <span className="text-[11px] text-slate-400 italic">Buyer Acceptance (امضاء و شصت خریدار)</span>
              </div>
              <div className="border-t border-slate-300 dark:border-slate-700 pt-1 font-semibold text-slate-800 dark:text-slate-200">
                {invoice.customerName}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
