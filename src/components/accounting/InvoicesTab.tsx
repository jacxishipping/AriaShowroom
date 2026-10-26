"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useShowroomStore } from "@/store/useShowroomStore";
import { InvoiceRecord } from "@/lib/mock-data";
import { translations } from "@/lib/translations";
import {
  MuiButton,
  MuiTable,
  MuiTableHead,
  MuiTableBody,
  MuiTableRow,
  MuiTableCell,
  MuiTextField,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@/components/mui";
import {
  FileCheck2,
  Plus,
  Search,
  X,
  Eye,
  DollarSign,
  CheckCircle2,
  Download,
  Loader2,
  FileText,
  Pencil,
  Trash2,
} from "lucide-react";
import { CommercialInvoiceModal } from "@/components/CommercialInvoiceModal";
import { downloadCommercialInvoicePDF } from "@/lib/invoice-pdf";
import { exportInvoicesToCSV } from "@/lib/export-utils";

interface InvoicesTabProps {
  onSelectInvoice?: (invoice: InvoiceRecord) => void;
}

export function InvoicesTab({ onSelectInvoice: _onSelectInvoice }: InvoicesTabProps) {
  const {
    invoices,
    vehicles,
    exchangeRate,
    language,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    addToast,
  } = useShowroomStore();
  const t = translations[language];
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceRecord | null>(null);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<any | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<any | null>(null);

  const handleDownloadInvoicePDF = async (inv: InvoiceRecord) => {
    setDownloadingInvoiceId(inv.id);
    addToast(`Generating PDF for ${inv.invoiceNumber}...`, "info");
    try {
      await downloadCommercialInvoicePDF(inv);
      addToast(`Invoice ${inv.invoiceNumber} downloaded as PDF`, "success");
    } catch (err) {
      console.error("PDF download error:", err);
      addToast("Failed to generate PDF. Please try again.", "error");
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerTazkira, setCustomerTazkira] = useState("");
  const [customerAddress, setCustomerAddress] = useState("Herat City");
  const [selectedStock, setSelectedStock] = useState(vehicles[0]?.stockNumber || "");
  const [basePriceUSD, setBasePriceUSD] = useState<number>(
    vehicles[0]?.sellingPrice || 45000
  );
  const [customsFeeUSD, setCustomsFeeUSD] = useState<number>(
    vehicles[0]?.customsDuty || 0
  );
  const [registrationFeeUSD, setRegistrationFeeUSD] = useState<number>(400);
  const [discountUSD, setDiscountUSD] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash (نقدی)");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter !== "ALL" && inv.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.customerName.toLowerCase().includes(q) ||
      (inv.vehicleStock && inv.vehicleStock.toLowerCase().includes(q))
    );
  });

  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.totalUSD, 0);
  const totalPaid = invoices
    .filter((inv) => inv.status === "Paid")
    .reduce((acc, inv) => acc + inv.totalUSD, 0);
  const totalPending = totalInvoiced - totalPaid;

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const vehicleObj = vehicles.find((v) => v.stockNumber === selectedStock);
    const subtotal = Number(basePriceUSD);
    const customs = Number(customsFeeUSD);
    const reg = Number(registrationFeeUSD);
    const disc = Number(discountUSD);
    const totalUSD = subtotal + customs + reg - disc;
    const totalAFN = Math.round(totalUSD * exchangeRate);

    try {
      await addInvoice({
        customerName,
        customerPhone,
        customerTazkira,
        customerAddress,
        vehicleStock: selectedStock,
        vehicleDesc: vehicleObj
          ? `${vehicleObj.year} ${vehicleObj.make} ${vehicleObj.model}`
          : "Vehicle Import",
        vin: vehicleObj?.vin,
        items: [
          {
            description: `${vehicleObj?.year || ""} ${vehicleObj?.make || ""} ${
              vehicleObj?.model || "Vehicle"
            } Base Price`,
            descriptionDari: "قیمت موتر وارداتی",
            amountUSD: subtotal,
          },
          {
            description: "Islam Qala Port Customs Duty & Legal Maktoub Clearance",
            descriptionDari: "تعرفه و محصول گمرک اسلام قلعه",
            amountUSD: customs,
          },
          {
            description: "Herat Traffic Directorate Official Plate & Registration",
            descriptionDari: "هزینه ثبت پلاک و انتقال سند ترافیک",
            amountUSD: reg,
          },
        ],
        subtotalUSD: subtotal,
        customsFeeUSD: customs,
        registrationFeeUSD: reg,
        discountUSD: disc,
        totalUSD,
        totalAFN,
        exchangeRate,
        status: "Paid",
        paymentMethod,
        issueDate: new Date().toISOString().split("T")[0],
        notes: "Commercial invoice generated from ERP Accounting Hub",
      });
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Unable to save invoice", "error");
      return;
    }

    setIsCreating(false);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerTazkira("");
    addToast("Commercial invoice generated", "success");
  };

  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;
    try {
      const totalUSD = Number(editingInvoice.totalUSD || editingInvoice.subtotalUSD || 0);
      await updateInvoice(editingInvoice.id, {
        customerName: editingInvoice.customerName,
        customerPhone: editingInvoice.customerPhone,
        customerAddress: editingInvoice.customerAddress,
        totalUSD,
        totalAFN: Math.round(totalUSD * exchangeRate),
        discountUSD: Number(editingInvoice.discountUSD || 0),
        status: editingInvoice.status,
        paymentMethod: editingInvoice.paymentMethod,
        notes: editingInvoice.notes,
      });
      addToast("Invoice updated successfully", "success");
      setEditingInvoice(null);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to update invoice", "error");
    }
  };

  const handleDeleteInvoice = async () => {
    if (!deletingInvoice) return;
    try {
      await deleteInvoice(deletingInvoice.id);
      addToast("Invoice deleted successfully", "success");
      setDeletingInvoice(null);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to delete invoice", "error");
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#161B26] border border-slate-200 dark:border-[#262F40] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {language === "fa"
                ? "مجموع فاکتورها"
                : language === "ps"
                ? "ټول فاکتورونه"
                : "Total Invoiced"}
            </span>
            <span className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
              <DollarSign className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-1.5 text-xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white tracking-tight">
            ${totalInvoiced.toLocaleString()}{" "}
            <span className="text-xs font-normal text-slate-400">USD</span>
          </p>
          <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 block mt-0.5">
            ؋{Math.round(totalInvoiced * exchangeRate).toLocaleString()} AFN
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#161B26] border border-slate-200 dark:border-[#262F40] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {language === "fa"
                ? "تسویه‌شده / دریافتی"
                : language === "ps"
                ? "تصفیه شوي"
                : "Settled / Collected"}
            </span>
            <span className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-1.5 text-xl font-extrabold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 tracking-tight">
            ${totalPaid.toLocaleString()}{" "}
            <span className="text-xs font-normal text-slate-400">USD</span>
          </p>
          <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 block mt-0.5">
            ؋{Math.round(totalPaid * exchangeRate).toLocaleString()} AFN
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#161B26] border border-slate-200 dark:border-[#262F40] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {language === "fa"
                ? "مطالبات باقی‌مانده"
                : language === "ps"
                ? "پاتې حسابونه"
                : "Outstanding Balances"}
            </span>
            <span className="p-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40">
              <FileCheck2 className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-1.5 text-xl font-extrabold font-mono tabular-nums text-amber-600 dark:text-amber-400 tracking-tight">
            ${totalPending.toLocaleString()}{" "}
            <span className="text-xs font-normal text-slate-400">USD</span>
          </p>
          <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 block mt-0.5">
            ؋{Math.round(totalPending * exchangeRate).toLocaleString()} AFN
          </span>
        </div>
      </div>

      {/* Toolbar & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              aria-label="Search commercial invoices"
              placeholder={
                language === "fa"
                  ? "جستجوی شماره فاکتور، خریدار، استاک..."
                  : language === "ps"
                  ? "د فاکتور شمېره یا پیرودونکی..."
                  : "Search invoice #, buyer, stock..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-52 sm:w-64 ps-7 pe-6 py-1 text-xs rounded-lg border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#0F141C] text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-primary h-8"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute end-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                aria-label="Clear invoice search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <select
            aria-label="Filter invoices by payment status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 ps-2.5 pe-6 py-1 text-xs rounded-lg border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#0F141C] text-slate-800 dark:text-slate-200 font-medium outline-none focus:border-primary cursor-pointer"
          >
            <option value="ALL">All Invoices</option>
            <option value="Paid">Paid / Settled (تسویه‌شده)</option>
            <option value="Pending">Pending (در انتظار پرداخت)</option>
            <option value="Overdue">Overdue (معوقه)</option>
          </select>

          {(search || statusFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
              }}
              className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline px-1 cursor-pointer"
            >
              Reset
            </button>
          )}

          <span className="text-[11px] font-mono tabular-nums text-slate-400">
            ({filteredInvoices.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <MuiButton
            variant="outlined"
            color="inherit"
            size="small"
            onClick={() => {
              exportInvoicesToCSV(filteredInvoices);
              addToast(`Exported ${filteredInvoices.length} invoices to CSV`, "success");
            }}
            startIcon={<Download className="h-3.5 w-3.5" />}
            sx={{ fontSize: "11px", py: "5px" }}
          >
            Export CSV
          </MuiButton>
          <MuiButton
            variant="contained"
            color="primary"
            size="small"
            onClick={() => setIsCreating(!isCreating)}
            startIcon={<Plus className="h-3.5 w-3.5" />}
            sx={{ fontSize: "11px", py: "5px" }}
          >
            {isCreating ? "Close Form" : "Generate Commercial Invoice"}
          </MuiButton>
        </div>
      </div>

      {/* Invoice Generator Form */}
      {isCreating && (
        <div className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5 uppercase tracking-wider">
            <FileCheck2 className="h-4 w-4 text-primary" />
            Issue Official Commercial Invoice • صدور فاکتور رسمی تجارتی
          </h3>

          <form
            onSubmit={handleCreateInvoice}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs"
          >
            <MuiTextField
              label="Buyer Full Name (نام خریدار)"
              required
              placeholder="e.g. Haji Mohammad Ishaq"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />

            <MuiTextField
              label="Phone Number (شماره تماس)"
              required
              placeholder="+93 79 912 3456"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />

            <MuiTextField
              label="Tazkira ID (تذکره)"
              placeholder="1400-0912-88120"
              value={customerTazkira}
              onChange={(e) => setCustomerTazkira(e.target.value)}
            />

            <MuiTextField
              select
              label="Select Stock Vehicle"
              value={selectedStock}
              onChange={(e) => {
                setSelectedStock(e.target.value);
                const sel = vehicles.find((v) => v.stockNumber === e.target.value);
                if (sel) {
                  setBasePriceUSD(sel.sellingPrice);
                  setCustomsFeeUSD(sel.customsDuty || 0);
                }
              }}
            >
              {vehicles.map((v) => (
                <MenuItem key={v.id} value={v.stockNumber}>
                  {v.stockNumber} - {v.year} {v.make} {v.model} ($
                  {v.sellingPrice.toLocaleString()})
                </MenuItem>
              ))}
            </MuiTextField>

            <MuiTextField
              label="Base Vehicle Price (USD)"
              type="number"
              required
              value={basePriceUSD}
              onChange={(e) => setBasePriceUSD(Number(e.target.value))}
              startAdornment={<DollarSign className="h-3.5 w-3.5 text-slate-400" />}
            />

            <MuiTextField
              label="Customs Duty Fee (USD)"
              type="number"
              value={customsFeeUSD}
              onChange={(e) => setCustomsFeeUSD(Number(e.target.value))}
              startAdornment={<DollarSign className="h-3.5 w-3.5 text-slate-400" />}
            />

            <MuiTextField
              label="Traffic Plate & Transfer (USD)"
              type="number"
              value={registrationFeeUSD}
              onChange={(e) => setRegistrationFeeUSD(Number(e.target.value))}
              startAdornment={<DollarSign className="h-3.5 w-3.5 text-slate-400" />}
            />

            <MuiTextField
              label="Special Discount (USD)"
              type="number"
              value={discountUSD}
              onChange={(e) => setDiscountUSD(Number(e.target.value))}
              startAdornment={<DollarSign className="h-3.5 w-3.5 text-slate-400" />}
            />

            <MuiTextField
              select
              label="Payment Channel"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <MenuItem value="Cash (نقدی)">Cash Safe (نقدی - صندوق)</MenuItem>
              <MenuItem value="Sarrafi Hawala (حواله صرافی)">
                Sarrafi Hawala (حواله صرافی)
              </MenuItem>
              <MenuItem value="Bank Transfer (حساب بانکی)">
                Bank Transfer (حساب بانکی)
              </MenuItem>
            </MuiTextField>

            <div className="sm:col-span-3 flex justify-end">
              <MuiButton
                type="submit"
                variant="contained"
                color="primary"
                size="small"
                sx={{ fontSize: "11px" }}
              >
                Generate & Save Commercial Invoice
              </MuiButton>
            </div>
          </form>
        </div>
      )}

      {/* Invoices Table */}
      <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <MuiTable dense size="small" className="w-full">
            <MuiTableHead>
              <MuiTableRow hover={false}>
                <MuiTableCell header>Invoice #</MuiTableCell>
                <MuiTableCell header>Date</MuiTableCell>
                <MuiTableCell header>Customer & Contact</MuiTableCell>
                <MuiTableCell header>Vehicle & Stock</MuiTableCell>
                <MuiTableCell header>Subtotal</MuiTableCell>
                <MuiTableCell header>Total (USD / AFN)</MuiTableCell>
                <MuiTableCell header>Status</MuiTableCell>
                <MuiTableCell header align="right">
                  Actions
                </MuiTableCell>
              </MuiTableRow>
            </MuiTableHead>
            <MuiTableBody>
              {filteredInvoices.map((inv) => (
                <MuiTableRow key={inv.id}>
                  <MuiTableCell className="font-mono tabular-nums font-semibold text-primary text-xs">
                    <Link
                      href={`/accounting/invoices/${inv.id}`}
                      className="hover:underline"
                    >
                      {inv.invoiceNumber}
                    </Link>
                  </MuiTableCell>
                  <MuiTableCell className="font-mono tabular-nums text-slate-500 text-[11px]">
                    {inv.issueDate}
                  </MuiTableCell>
                  <MuiTableCell>
                    <div className="font-semibold text-slate-900 dark:text-white text-xs">
                      {inv.customerName}
                    </div>
                    <div className="text-[10px] font-mono tabular-nums text-slate-400">
                      {inv.customerPhone}
                    </div>
                  </MuiTableCell>
                  <MuiTableCell>
                    <div className="font-medium text-slate-800 dark:text-slate-200 text-xs">
                      {inv.vehicleDesc}
                    </div>
                    <div className="text-[10px] font-mono tabular-nums text-slate-400">
                      {inv.vehicleStock}
                    </div>
                  </MuiTableCell>
                  <MuiTableCell className="font-mono tabular-nums text-slate-600 dark:text-slate-300 text-xs">
                    ${inv.subtotalUSD.toLocaleString()}
                  </MuiTableCell>
                  <MuiTableCell>
                    <div className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white text-xs">
                      ${inv.totalUSD.toLocaleString()}
                    </div>
                    <div className="text-[10px] font-mono tabular-nums text-slate-400">
                      ؋{inv.totalAFN.toLocaleString()}
                    </div>
                  </MuiTableCell>
                  <MuiTableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        inv.status === "Paid"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </MuiTableCell>
                  <MuiTableCell align="right">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton
                        size="small"
                        color="primary"
                        title={t.buttonDownloadInvoice}
                        aria-label={`Download PDF for invoice ${inv.invoiceNumber}`}
                        onClick={() => handleDownloadInvoicePDF(inv)}
                        disabled={downloadingInvoiceId === inv.id}
                        sx={{ p: "3px" }}
                      >
                        {downloadingInvoiceId === inv.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                      </IconButton>
                      <IconButton
                        size="small"
                        color="inherit"
                        title="Quick Preview Invoice Modal"
                        aria-label={`Preview invoice ${inv.invoiceNumber}`}
                        onClick={() => setPreviewInvoice(inv)}
                        sx={{ p: "3px" }}
                      >
                        <FileText className="h-3.5 w-3.5 text-slate-500" />
                      </IconButton>
                      <IconButton
                        component={Link}
                        href={`/accounting/invoices/${inv.id}`}
                        size="small"
                        color="primary"
                        title="View & Print Official Invoice Page"
                        aria-label={`Open full invoice ${inv.invoiceNumber}`}
                        sx={{ p: "3px" }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        title="Edit Invoice"
                        aria-label={`Edit invoice ${inv.invoiceNumber}`}
                        onClick={() => setEditingInvoice({ ...inv })}
                        sx={{ p: "3px" }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        title="Delete Invoice"
                        aria-label={`Delete invoice ${inv.invoiceNumber}`}
                        onClick={() => setDeletingInvoice(inv)}
                        sx={{ p: "3px" }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </IconButton>
                    </div>
                  </MuiTableCell>
                </MuiTableRow>
              ))}
            </MuiTableBody>
          </MuiTable>
        </div>
      </div>

      {/* Quick View Commercial Invoice Modal */}
      <CommercialInvoiceModal
        invoice={previewInvoice}
        isOpen={Boolean(previewInvoice)}
        onClose={() => setPreviewInvoice(null)}
      />

      {/* Edit Invoice Dialog */}
      <Dialog
        open={Boolean(editingInvoice)}
        onClose={() => setEditingInvoice(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem" }}>
          Edit Commercial Invoice ({editingInvoice?.invoiceNumber})
        </DialogTitle>
        {editingInvoice && (
          <form onSubmit={handleUpdateInvoice}>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MuiTextField
                  label="Customer / Buyer Name"
                  value={editingInvoice.customerName}
                  onChange={(e) =>
                    setEditingInvoice({ ...editingInvoice, customerName: e.target.value })
                  }
                  required
                />
                <MuiTextField
                  label="Customer Phone"
                  value={editingInvoice.customerPhone || ""}
                  onChange={(e) =>
                    setEditingInvoice({ ...editingInvoice, customerPhone: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MuiTextField
                  label="Customer Address / Location"
                  value={editingInvoice.customerAddress || ""}
                  onChange={(e) =>
                    setEditingInvoice({
                      ...editingInvoice,
                      customerAddress: e.target.value,
                    })
                  }
                />
                <MuiTextField
                  select
                  label="Invoice Status"
                  value={editingInvoice.status}
                  onChange={(e) =>
                    setEditingInvoice({ ...editingInvoice, status: e.target.value })
                  }
                  required
                >
                  <MenuItem value="Paid">Paid (تسویه کامل)</MenuItem>
                  <MenuItem value="Partially Paid">Partially Paid (باقیدار)</MenuItem>
                  <MenuItem value="Draft">Draft (پیش‌نویس)</MenuItem>
                  <MenuItem value="Overdue">Overdue (به تعویق افتاده)</MenuItem>
                </MuiTextField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MuiTextField
                  label="Total (USD $)"
                  type="number"
                  value={editingInvoice.totalUSD}
                  onChange={(e) =>
                    setEditingInvoice({
                      ...editingInvoice,
                      totalUSD: Number(e.target.value),
                    })
                  }
                  required
                />
                <MuiTextField
                  label="Discount (USD $)"
                  type="number"
                  value={editingInvoice.discountUSD || 0}
                  onChange={(e) =>
                    setEditingInvoice({
                      ...editingInvoice,
                      discountUSD: Number(e.target.value),
                    })
                  }
                />
                <MuiTextField
                  label="Payment Channel"
                  value={editingInvoice.paymentMethod || "Cash (نقدی)"}
                  onChange={(e) =>
                    setEditingInvoice({
                      ...editingInvoice,
                      paymentMethod: e.target.value,
                    })
                  }
                />
              </div>

              <MuiTextField
                label="Invoice Notes & Terms"
                value={editingInvoice.notes || ""}
                onChange={(e) =>
                  setEditingInvoice({ ...editingInvoice, notes: e.target.value })
                }
                multiline
                rows={2}
              />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
              <MuiButton
                variant="outlined"
                color="inherit"
                onClick={() => setEditingInvoice(null)}
              >
                Cancel
              </MuiButton>
              <MuiButton type="submit" variant="contained" color="primary">
                Save Changes
              </MuiButton>
            </DialogActions>
          </form>
        )}
      </Dialog>

      {/* Delete Invoice Dialog */}
      <Dialog
        open={Boolean(deletingInvoice)}
        onClose={() => setDeletingInvoice(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem" }}>
          Delete Invoice Record
        </DialogTitle>
        <DialogContent>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to permanently delete invoice{" "}
            <strong className="text-slate-900 dark:text-white">
              {deletingInvoice?.invoiceNumber}
            </strong>{" "}
            for buyer{" "}
            <strong className="text-slate-900 dark:text-white">
              {deletingInvoice?.customerName}
            </strong>
            ? This action cannot be undone.
          </p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <MuiButton
            variant="outlined"
            color="inherit"
            onClick={() => setDeletingInvoice(null)}
          >
            Cancel
          </MuiButton>
          <MuiButton variant="contained" color="error" onClick={handleDeleteInvoice}>
            Delete Invoice
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
