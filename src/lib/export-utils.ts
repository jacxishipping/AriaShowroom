/**
 * Data Export Utilities for Aria Motors Dealership ERP
 * Exports lot inventory and sales ledger to Excel/CSV with UTF-8 BOM
 * to ensure Dari/Pashto Arabic script renders properly in Microsoft Excel,
 * while neutralizing CSV formula injection (=, +, -, @).
 */

import { VehicleItem, SaleRecord, CustomerRecord, InvoiceRecord } from "./mock-data";
import { useShowroomStore } from "@/store/useShowroomStore";

/**
 * Escapes double quotes and neutralizes leading spreadsheet formula characters
 * (=, +, -, @, \t, \r) in text cells so exported CSVs are safe in Excel/Sheets.
 */
export function safeCsvText(value: unknown): string {
  const raw = String(value ?? "");
  const trimmedStart = raw.replace(/^[\t\r\n ]+/, "");
  const formulaSafe =
    trimmedStart.length > 0 && /^[=+\-@]/.test(trimmedStart) && !/^\+\d[\d\s\-()]+$/.test(trimmedStart)
      ? `'${raw}`
      : raw;
  return `"${formulaSafe.replace(/"/g, '""')}"`;
}

function getLiveExportDefaults() {
  try {
    const state = useShowroomStore.getState();
    const rate = Number(state.exchangeRate) || 70.5;
    const slug = (state.branding?.dealershipShortCode || "aria").toLowerCase();
    return { rate, slug };
  } catch {
    return { rate: 70.5, slug: "aria" };
  }
}

export function exportCustomersToCSV(
  customers: CustomerRecord[],
  vehicles: VehicleItem[] = [],
  filename?: string
) {
  const { rate: exchangeRate, slug } = getLiveExportDefaults();
  const targetFilename = filename || `${slug}_crm_leads.csv`;

  const headers = [
    "Customer ID",
    "Full Name (نام مشتری)",
    "Tazkira Number (نمبر تذکره)",
    "Phone (شماره تماس)",
    "WhatsApp (واتساپ)",
    "City (ولایت)",
    "Lead Stage (مرحله پیگیری)",
    "Budget USD (بودجه دالر)",
    "Budget AFN (بودجه افغانی)",
    "Interested Vehicle (موتر مورد نظر)",
    "Trade-In Record (موتر تبادله)",
    "Notes (یادداشت)",
    "Created Date (تاریخ ثبت)",
  ];

  const rows = customers.map((c) => {
    const matchedVehicle = vehicles.find((v) => v.id === c.interestedInVehicleId);
    const vehicleLabel = matchedVehicle
      ? `${matchedVehicle.year} ${matchedVehicle.make} ${matchedVehicle.model} (#${matchedVehicle.stockNumber})`
      : "General Inquiry";
    const budgetAfn = Math.round((c.budget || 0) * exchangeRate);

    return [
      safeCsvText(c.id),
      safeCsvText(c.fullName),
      safeCsvText(c.tazkiraNumber),
      safeCsvText(c.phone),
      safeCsvText(c.whatsapp || c.phone),
      safeCsvText(c.city),
      safeCsvText(c.leadStage),
      Number(c.budget) || 0,
      budgetAfn,
      safeCsvText(vehicleLabel),
      safeCsvText(c.tradeInRecord),
      safeCsvText(c.notes),
      safeCsvText(c.createdAt),
    ].join(",");
  });

  const csvContent = "\uFEFF" + [headers.map(safeCsvText).join(","), ...rows].join("\r\n");
  downloadBlob(csvContent, targetFilename, "text/csv;charset=utf-8;");
}

export function exportInventoryToCSV(vehicles: VehicleItem[], filename?: string) {
  const { rate: exchangeRate, slug } = getLiveExportDefaults();
  const targetFilename = filename || `${slug}_lot_inventory.csv`;

  const headers = [
    "Stock Number (نمبر استاک)",
    "Make (کمپنی)",
    "Model (مودل)",
    "Year (سال تولید)",
    "Trim (تیپ)",
    "VIN / Chassis (نمبر شاسی)",
    "Status (حالت)",
    "Origin (کشور وارداتی)",
    "Steering (اشترنگ)",
    "Fuel Type (نوع تیل)",
    "Mileage (مایل)",
    "Purchase Price USD (قیمت خرید)",
    "Freight Cost USD (کرایه انتقال)",
    "Customs Duty USD (محصول گمرک)",
    "Detailing Cost USD (ترمیمات)",
    "Total Landed Cost USD (قیمت تمام شد)",
    "Min Target Price USD (حداقل قیمت فروش)",
    "Selling Price USD (قیمت فروش دالر)",
    "Selling Price AFN (قیمت فروش افغانی)",
    "Net Margin USD (فایده خالص)",
    "Margin % (فیصدی مفاد)",
    "Customs Clearance (اسناد گمرک اسلام قلعه)",
    "Yard Location (موقعیت پارکینگ)",
  ];

  const rows = vehicles.map((v) => {
    const priceAfn = Math.round(v.sellingPrice * exchangeRate);
    const marginUsd = v.sellingPrice - v.landedCost;
    const marginPct = v.landedCost > 0 ? ((marginUsd / v.landedCost) * 100).toFixed(1) : "0";
    const yard = v.yardLocation || "Main Showroom - Bagh-e-Azadi";

    return [
      safeCsvText(v.stockNumber),
      safeCsvText(v.make),
      safeCsvText(v.model),
      Number(v.year) || 0,
      safeCsvText(v.trim),
      safeCsvText(v.vin),
      safeCsvText(v.status),
      safeCsvText(v.originCountry),
      safeCsvText(v.steering),
      safeCsvText(v.fuelType),
      Number(v.mileage) || 0,
      Number(v.purchasePrice) || 0,
      Number(v.freightCost) || 0,
      Number(v.customsDuty) || 0,
      Number(v.repairCost) || 0,
      Number(v.landedCost) || 0,
      Number(v.minTargetPrice) || 0,
      Number(v.sellingPrice) || 0,
      priceAfn,
      marginUsd,
      safeCsvText(`${marginPct}%`),
      safeCsvText(v.customsClearance),
      safeCsvText(yard),
    ].join(",");
  });

  const csvContent = "\uFEFF" + [headers.map(safeCsvText).join(","), ...rows].join("\r\n");
  downloadBlob(csvContent, targetFilename, "text/csv;charset=utf-8;");
}

export function exportSalesLedgerToCSV(sales: SaleRecord[], filename?: string) {
  const { slug } = getLiveExportDefaults();
  const targetFilename = filename || `${slug}_sales_ledger.csv`;

  const headers = [
    "Contract Number (نمبر قرارداد)",
    "Sale Date (تاریخ معامله)",
    "Vehicle (واسطه نقلیه)",
    "Stock Number (نمبر استاک)",
    "Customer Name (نام خریدار)",
    "Tazkira Number (نمبر تذکره)",
    "Customer Phone (شماره تماس)",
    "Sale Price USD (قیمت معامله دالر)",
    "Exchange Rate (نرخ اسعار)",
    "Sale Price AFN (معادل افغانی)",
    "Payment Type (نوع پرداخت)",
    "Down Payment USD (پیش‌پرداخت)",
    "Contract Status (حالت)",
  ];

  const rows = sales.map((s) => {
    const priceAfn = Math.round(s.salePriceUSD * (s.exchangeRate || 70.5));

    return [
      safeCsvText(s.contractNumber),
      safeCsvText(s.saleDate),
      safeCsvText(s.vehicleName),
      safeCsvText(s.stockNumber),
      safeCsvText(s.customerName),
      safeCsvText(s.customerTazkira),
      safeCsvText(s.customerPhone),
      Number(s.salePriceUSD) || 0,
      Number(s.exchangeRate) || 70.5,
      priceAfn,
      safeCsvText(s.paymentType),
      Number(s.downPaymentUSD) || 0,
      safeCsvText(s.status),
    ].join(",");
  });

  const csvContent = "\uFEFF" + [headers.map(safeCsvText).join(","), ...rows].join("\r\n");
  downloadBlob(csvContent, targetFilename, "text/csv;charset=utf-8;");
}

export function exportInvoicesToCSV(
  invoices: InvoiceRecord[],
  filename?: string
) {
  const { slug } = getLiveExportDefaults();
  const targetFilename = filename || `${slug}_commercial_invoices.csv`;

  const headers = [
    "Invoice Number (نمبر فاکتور)",
    "Issue Date (تاریخ صدور)",
    "Customer Name (نام خریدار)",
    "Customer Phone (شماره تماس)",
    "Tazkira Number (نمبر تذکره)",
    "Vehicle (شرح موتر)",
    "Stock Number (نمبر استاک)",
    "VIN / Chassis (نمبر شاسی)",
    "Subtotal USD (مجموع)",
    "Customs Fee USD (محصول گمرک)",
    "Registration Fee USD (ثبت ترافیک)",
    "Discount USD (تخفیف)",
    "Total USD (مجموع نهایی دالر)",
    "Exchange Rate (نرخ اسعار)",
    "Total AFN (مجموع نهایی افغانی)",
    "Status (حالت فاکتور)",
    "Payment Method (روش پرداخت)",
  ];

  const rows = invoices.map((inv) => {
    return [
      safeCsvText(inv.invoiceNumber),
      safeCsvText(inv.issueDate),
      safeCsvText(inv.customerName),
      safeCsvText(inv.customerPhone),
      safeCsvText(inv.customerTazkira),
      safeCsvText(inv.vehicleDesc),
      safeCsvText(inv.vehicleStock),
      safeCsvText(inv.vin),
      Number(inv.subtotalUSD) || 0,
      Number(inv.customsFeeUSD) || 0,
      Number(inv.registrationFeeUSD) || 0,
      Number(inv.discountUSD) || 0,
      Number(inv.totalUSD) || 0,
      Number(inv.exchangeRate) || 70.5,
      Number(inv.totalAFN) || 0,
      safeCsvText(inv.status),
      safeCsvText(inv.paymentMethod),
    ].join(",");
  });

  const csvContent = "\uFEFF" + [headers.map(safeCsvText).join(","), ...rows].join("\r\n");
  downloadBlob(csvContent, targetFilename, "text/csv;charset=utf-8;");
}

export { downloadCommercialInvoicePDF } from "./invoice-pdf";

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
