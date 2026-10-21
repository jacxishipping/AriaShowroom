/**
 * Data Export Utilities for Aria / Sadozai Motors Dealership ERP
 * Exports lot inventory and sales ledger to Excel/CSV with UTF-8 BOM
 * to ensure Dari/Pashto Arabic script renders properly in Microsoft Excel.
 */

import { VehicleItem, SaleRecord, CustomerRecord, InvoiceRecord } from "./mock-data";

export function exportCustomersToCSV(
  customers: CustomerRecord[],
  vehicles: VehicleItem[] = [],
  filename = "sadozai_crm_leads.csv"
) {
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

  const exchangeRate = 70.5;

  const rows = customers.map((c) => {
    const matchedVehicle = vehicles.find((v) => v.id === c.interestedInVehicleId);
    const vehicleLabel = matchedVehicle
      ? `${matchedVehicle.year} ${matchedVehicle.make} ${matchedVehicle.model} (#${matchedVehicle.stockNumber})`
      : "General Inquiry";
    const budgetAfn = Math.round((c.budget || 0) * exchangeRate);

    return [
      `"${c.id}"`,
      `"${(c.fullName || "").replace(/"/g, '""')}"`,
      `"${(c.tazkiraNumber || "").replace(/"/g, '""')}"`,
      `"${(c.phone || "").replace(/"/g, '""')}"`,
      `"${(c.whatsapp || c.phone || "").replace(/"/g, '""')}"`,
      `"${(c.city || "").replace(/"/g, '""')}"`,
      `"${c.leadStage}"`,
      c.budget || 0,
      budgetAfn,
      `"${vehicleLabel.replace(/"/g, '""')}"`,
      `"${(c.tradeInRecord || "").replace(/"/g, '""')}"`,
      `"${(c.notes || "").replace(/"/g, '""')}"`,
      `"${c.createdAt || ""}"`,
    ].join(",");
  });

  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  downloadBlob(csvContent, filename, "text/csv;charset=utf-8;");
}

export function exportInventoryToCSV(vehicles: VehicleItem[], filename = "sadozai_lot_inventory.csv") {
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
    const exchangeRate = 70.5;
    const priceAfn = Math.round(v.sellingPrice * exchangeRate);
    const marginUsd = v.sellingPrice - v.landedCost;
    const marginPct = v.landedCost > 0 ? ((marginUsd / v.landedCost) * 100).toFixed(1) : "0";
    const yard = (v as any).yardLocation || "Main Showroom - Bagh-e-Azadi";

    return [
      `"${v.stockNumber}"`,
      `"${v.make}"`,
      `"${v.model}"`,
      v.year,
      `"${v.trim}"`,
      `"${v.vin}"`,
      `"${v.status}"`,
      `"${v.originCountry}"`,
      `"${v.steering}"`,
      `"${v.fuelType}"`,
      v.mileage,
      v.purchasePrice,
      v.freightCost,
      v.customsDuty,
      v.repairCost,
      v.landedCost,
      v.minTargetPrice,
      v.sellingPrice,
      priceAfn,
      marginUsd,
      `"${marginPct}%"`,
      `"${v.customsClearance.replace(/"/g, '""')}"`,
      `"${yard}"`,
    ].join(",");
  });

  // \uFEFF is UTF-8 Byte Order Mark (BOM) needed by Excel to display Dari/Pashto correctly
  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  downloadBlob(csvContent, filename, "text/csv;charset=utf-8;");
}

export function exportSalesLedgerToCSV(sales: SaleRecord[], filename = "sadozai_sales_ledger.csv") {
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
    "Sarrafi / Hawala Ref (حواله صرافی)",
    "Contract Status (حالت)",
  ];

  const rows = sales.map((s) => {
    const priceAfn = Math.round(s.salePriceUSD * s.exchangeRate);
    const sarrafRef = (s as any).sarrafReference || "Cash at Showroom Desk";

    return [
      `"${s.contractNumber}"`,
      `"${s.saleDate}"`,
      `"${s.vehicleName}"`,
      `"${s.stockNumber}"`,
      `"${s.customerName}"`,
      `"${s.customerTazkira}"`,
      `"${s.customerPhone}"`,
      s.salePriceUSD,
      s.exchangeRate,
      priceAfn,
      `"${s.paymentType}"`,
      `"${sarrafRef}"`,
      `"${s.status}"`,
    ].join(",");
  });

  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  downloadBlob(csvContent, filename, "text/csv;charset=utf-8;");
}

export function exportInvoicesToCSV(
  invoices: InvoiceRecord[],
  filename = "sadozai_commercial_invoices.csv"
) {
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
      `"${inv.invoiceNumber}"`,
      `"${inv.issueDate}"`,
      `"${(inv.customerName || "").replace(/"/g, '""')}"`,
      `"${inv.customerPhone || ""}"`,
      `"${inv.customerTazkira || ""}"`,
      `"${(inv.vehicleDesc || "").replace(/"/g, '""')}"`,
      `"${inv.vehicleStock || ""}"`,
      `"${inv.vin || ""}"`,
      inv.subtotalUSD || 0,
      inv.customsFeeUSD || 0,
      inv.registrationFeeUSD || 0,
      inv.discountUSD || 0,
      inv.totalUSD || 0,
      inv.exchangeRate || 70.5,
      inv.totalAFN || 0,
      `"${inv.status}"`,
      `"${(inv.paymentMethod || "").replace(/"/g, '""')}"`,
    ].join(",");
  });

  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  downloadBlob(csvContent, filename, "text/csv;charset=utf-8;");
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
