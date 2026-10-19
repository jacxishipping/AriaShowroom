"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useShowroomStore } from "@/store/useShowroomStore";
import { InvoiceRecord } from "@/lib/mock-data";
import {
  MuiCard,
  MuiButton,
  MuiChip,
  MuiTable,
  MuiTableHead,
  MuiTableBody,
  MuiTableRow,
  MuiTableCell,
  MuiTextField,
  MenuItem,
  IconButton,
} from "@/components/mui";
import {
  FileCheck2,
  Plus,
  Search,
  Eye,
  Printer,
  DollarSign,
  Car,
  CheckCircle2,
} from "lucide-react";

interface InvoicesTabProps {
  onSelectInvoice?: (invoice: InvoiceRecord) => void;
}

export function InvoicesTab({ onSelectInvoice }: InvoicesTabProps) {
  const { invoices, vehicles, exchangeRate, addInvoice } = useShowroomStore();
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerTazkira, setCustomerTazkira] = useState("");
  const [customerAddress, setCustomerAddress] = useState("Herat City");
  const [selectedStock, setSelectedStock] = useState(vehicles[0]?.stockNumber || "");
  const [basePriceUSD, setBasePriceUSD] = useState<number>(vehicles[0]?.sellingPrice || 45000);
  const [customsFeeUSD, setCustomsFeeUSD] = useState<number>(2500);
  const [registrationFeeUSD, setRegistrationFeeUSD] = useState<number>(400);
  const [discountUSD, setDiscountUSD] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash (نقدی)");

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (inv.vehicleStock && inv.vehicleStock.toLowerCase().includes(search.toLowerCase()))
  );

  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.totalUSD, 0);
  const totalPaid = invoices
    .filter((inv) => inv.status === "Paid")
    .reduce((acc, inv) => acc + inv.totalUSD, 0);
  const totalPending = totalInvoiced - totalPaid;

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicleObj = vehicles.find((v) => v.stockNumber === selectedStock);
    const subtotal = Number(basePriceUSD);
    const customs = Number(customsFeeUSD);
    const reg = Number(registrationFeeUSD);
    const disc = Number(discountUSD);
    const totalUSD = subtotal + customs + reg - disc;
    const totalAFN = Math.round(totalUSD * exchangeRate);

    addInvoice({
      customerName,
      customerPhone,
      customerTazkira,
      customerAddress,
      vehicleStock: selectedStock,
      vehicleDesc: vehicleObj ? `${vehicleObj.year} ${vehicleObj.make} ${vehicleObj.model}` : "Vehicle Import",
      vin: vehicleObj?.vin,
      items: [
        {
          description: `${vehicleObj?.year || ""} ${vehicleObj?.make || ""} ${vehicleObj?.model || "Vehicle"} Base Price`,
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
      notes: "Commercial invoice generated from ERP Sales Desk",
    });

    setIsCreating(false);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerTazkira("");
    alert("Commercial Invoice generated successfully!");
  };

  return (
    <div className="space-y-4">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800/90 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Invoiced
            </span>
            <span className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
              <DollarSign className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-1.5 text-xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
            ${totalInvoiced.toLocaleString()} <span className="text-xs font-normal text-slate-400">USD</span>
          </p>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block mt-0.5">
            ؋{Math.round(totalInvoiced * exchangeRate).toLocaleString()} AFN
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800/90 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Settled / Collected (تسویه‌شده)
            </span>
            <span className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-1.5 text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
            ${totalPaid.toLocaleString()} <span className="text-xs font-normal text-slate-400">USD</span>
          </p>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block mt-0.5">
            ؋{Math.round(totalPaid * exchangeRate).toLocaleString()} AFN
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800/90 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Outstanding Balances
            </span>
            <span className="p-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40">
              <FileCheck2 className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-1.5 text-xl font-extrabold font-mono text-amber-600 dark:text-amber-400 tracking-tight">
            ${totalPending.toLocaleString()} <span className="text-xs font-normal text-slate-400">USD</span>
          </p>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block mt-0.5">
            ؋{Math.round(totalPending * exchangeRate).toLocaleString()} AFN
          </span>
        </div>
      </div>

      {/* Toolbar & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <MuiTextField
          size="small"
          placeholder="Search invoice #, buyer, stock..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          startAdornment={<Search className="h-3.5 w-3.5 text-slate-400" />}
          className="w-full sm:w-64"
        />

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

      {/* Invoice Generator Form */}
      {isCreating && (
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#121824] shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5 uppercase tracking-wider">
            <FileCheck2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Issue Official Commercial Invoice • صدور فاکتور رسمی تجارتی
          </h3>

          <form onSubmit={handleCreateInvoice} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
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
                if (sel) setBasePriceUSD(sel.sellingPrice);
              }}
            >
              {vehicles.map((v) => (
                <MenuItem key={v.id} value={v.stockNumber}>
                  {v.stockNumber} - {v.year} {v.make} {v.model} (${v.sellingPrice.toLocaleString()})
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
              <MenuItem value="Sarrafi Hawala (حواله صرافی)">Sarrafi Hawala (حواله صرافی)</MenuItem>
              <MenuItem value="Bank Transfer (حساب بانکی)">Bank Transfer (حساب بانکی)</MenuItem>
            </MuiTextField>

            <div className="sm:col-span-3 flex justify-end">
              <MuiButton type="submit" variant="contained" color="primary" size="small" sx={{ fontSize: "11px" }}>
                Generate & Save Commercial Invoice
              </MuiButton>
            </div>
          </form>
        </div>
      )}

      {/* Invoices Table */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#111827] shadow-xs overflow-hidden">
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
                <MuiTableCell header align="right">Actions</MuiTableCell>
              </MuiTableRow>
            </MuiTableHead>
            <MuiTableBody>
              {filteredInvoices.map((inv) => (
                <MuiTableRow key={inv.id}>
                  <MuiTableCell className="font-mono font-semibold text-blue-600 dark:text-blue-400 text-xs">
                    {inv.invoiceNumber}
                  </MuiTableCell>
                  <MuiTableCell className="font-mono text-slate-500 text-[11px]">
                    {inv.issueDate}
                  </MuiTableCell>
                  <MuiTableCell>
                    <div className="font-semibold text-slate-900 dark:text-white text-xs">{inv.customerName}</div>
                    <div className="text-[10px] font-mono text-slate-400">{inv.customerPhone}</div>
                  </MuiTableCell>
                  <MuiTableCell>
                    <div className="font-medium text-slate-800 dark:text-slate-200 text-xs">{inv.vehicleDesc}</div>
                    <div className="text-[10px] font-mono text-slate-400">{inv.vehicleStock}</div>
                  </MuiTableCell>
                  <MuiTableCell className="font-mono text-slate-600 dark:text-slate-300 text-xs">
                    ${inv.subtotalUSD.toLocaleString()}
                  </MuiTableCell>
                  <MuiTableCell>
                    <div className="font-mono font-semibold text-slate-900 dark:text-white text-xs">
                      ${inv.totalUSD.toLocaleString()}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
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
                    <IconButton
                      component={Link}
                      href={`/accounting/invoices/${inv.id}`}
                      size="small"
                      color="primary"
                      title="View & Print Official Invoice"
                      sx={{ p: "3px" }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </IconButton>
                  </MuiTableCell>
                </MuiTableRow>
              ))}
            </MuiTableBody>
          </MuiTable>
        </div>
      </div>
    </div>
  );
}
