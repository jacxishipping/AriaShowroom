"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import {
  MuiCard,
  MuiButton,
  MuiChip,
  MuiTextField,
  MenuItem,
  IconButton,
  MuiTable,
  MuiTableContainer,
  MuiTableHead,
  MuiTableBody,
  MuiTableRow,
  MuiTableCell,
  MuiPaper,
} from "@/components/mui";
import {
  Building2,
  Printer,
  ArrowLeft,
  Phone,
  DollarSign,
  Plus,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  Share2,
  Landmark,
  MessageCircle,
} from "lucide-react";

export default function SupplierLedgerPage() {
  const params = useParams();
  const supplierId = params?.id as string;
  const { suppliers, exchangeRate, recordSupplierPayment, addSupplierBill, addToast, language } =
    useShowroomStore();
  const t = translations[language];

  const supplier =
    suppliers.find((s) => s.id === supplierId || s.id.toLowerCase() === supplierId?.toLowerCase()) ||
    suppliers[0];

  const [isPaying, setIsPaying] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState("Sarrafi Hawala (حواله صرافی)");
  const [payRef, setPayRef] = useState("");
  const [paySarrafi, setPaySarrafi] = useState("Sarrafi Haji Qayoum Khorasan Market");

  const [isBilling, setIsBilling] = useState(false);
  const [billStock, setBillStock] = useState("");
  const [billDesc, setBillDesc] = useState("");
  const [billAmount, setBillAmount] = useState<number>(0);

  if (!supplier) {
    return (
      <div className="p-8 text-center text-slate-500">
        Supplier record not found.{" "}
        <Link href="/admin" className="text-primary underline">
          Return to Dealership ERP Hub
        </Link>
      </div>
    );
  }

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) return;

    try {
      await recordSupplierPayment(
        supplier.id,
        Number(payAmount),
        payMethod,
        payRef,
        paySarrafi
      );
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Unable to record supplier payment", "error");
      return;
    }

    setIsPaying(false);
    setPayAmount(0);
    setPayRef("");
    addToast(`Payment of $${payAmount.toLocaleString()} recorded for ${supplier.companyName}!`, "success");
  };

  const handleBillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (billAmount <= 0) return;

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    try {
      await addSupplierBill({
      billNumber: `BILL-${supplier.country.includes("UAE") ? "DXB" : supplier.country.includes("Japan") ? "TYO" : "HRT"}-${randomNum}`,
      supplierId: supplier.id,
      stockNumber: billStock,
      vehicleDescription: billDesc,
      amountUSD: Number(billAmount),
      status: "Unpaid",
      issueDate: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Unable to record supplier bill", "error");
      return;
    }

    setIsBilling(false);
    setBillStock("");
    setBillDesc("");
    setBillAmount(0);
    addToast("New purchase bill booked to supplier ledger!", "success");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      addToast("Supplier ledger link copied to clipboard!", "success");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
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
              Supplier Statement
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Supplier Statement of Account • صورتحساب تفصیلی واردکننده
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Itemized bills, Sarrafi Hawala settlements, and running balance ledger
          </p>
        </div>

        <div className="flex items-center gap-3">
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
            variant="contained"
            color="primary"
            size="medium"
            onClick={handlePrint}
            startIcon={<Printer className="h-4 w-4" />}
          >
            Print Statement (چاپ صورتحساب)
          </MuiButton>
        </div>
      </div>

      {/* Main Statement Paper */}
      <div className="rounded-2xl bg-white p-6 sm:p-10 shadow-lg border border-slate-200 dark:border-slate-800 dark:bg-[#111827] text-slate-900 dark:text-slate-100 print:bg-white print:text-black print:border-none print:shadow-none print:p-0 space-y-6">
        {/* Supplier Profile Header & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800 print:border-black">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded print:text-black">
                {supplier.id.toUpperCase()}
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white print:text-black">
                {supplier.companyName}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 print:text-gray-600">
              Key Account Representative: <strong className="text-slate-800 dark:text-slate-200 print:text-black">{supplier.contactName}</strong> • {supplier.country}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 font-mono print:text-gray-600">
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                {supplier.phone}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Landmark className="h-3.5 w-3.5 text-slate-400" />
                {supplier.bankOrSarrafiAccount || "Khorasan Market Sarrafi Safe"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <MuiButton
              variant={isPaying ? "contained" : "outlined"}
              color="primary"
              size="small"
              onClick={() => {
                setIsPaying(!isPaying);
                setIsBilling(false);
              }}
              startIcon={<DollarSign className="h-4 w-4" />}
            >
              {isPaying ? "Close Payment Form" : "Record Settlement / Pay"}
            </MuiButton>

            <MuiButton
              variant={isBilling ? "contained" : "outlined"}
              color="secondary"
              size="small"
              onClick={() => {
                setIsBilling(!isBilling);
                setIsPaying(false);
              }}
              startIcon={<Plus className="h-4 w-4" />}
            >
              {isBilling ? "Close Bill Form" : "Book New Bill"}
            </MuiButton>
          </div>
        </div>

        {/* Running Balance KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 print:border-gray-400">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Total Invoiced Purchases
            </span>
            <p className="mt-1 text-xl font-bold font-mono text-slate-900 dark:text-white print:text-black">
              ${supplier.totalPurchasedUSD.toLocaleString()} USD
            </p>
            <span className="text-[11px] text-slate-500 font-mono">
              {supplier.bills.length} Invoices to date
            </span>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 print:border-gray-400">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Total Hawala Settled (پرداخت شده)
            </span>
            <p className="mt-1 text-xl font-bold font-mono text-emerald-600 print:text-black">
              ${supplier.totalPaidUSD.toLocaleString()} USD
            </p>
            <span className="text-[11px] text-slate-500 font-mono">
              {((supplier.totalPaidUSD / (supplier.totalPurchasedUSD || 1)) * 100).toFixed(0)}% cleared
            </span>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 print:border-gray-400">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Net Outstanding Balance (باقیداری)
            </span>
            <p className={`mt-1 text-xl font-bold font-mono ${supplier.balanceUSD > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-800 dark:text-slate-200"} print:text-black`}>
              ${supplier.balanceUSD.toLocaleString()} USD
            </p>
            <span className="text-[11px] text-slate-500 font-mono">
              ؋{Math.round(supplier.balanceUSD * exchangeRate).toLocaleString()} AFN
            </span>
          </div>
        </div>

        {/* Payment Recording Form Dropdown */}
        {isPaying && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 dark:border-primary/20 dark:bg-primary/10 space-y-4 print:hidden">
            <h4 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Receipt className="h-4 w-4" />
              Issue Supplier Settlement Voucher (صدور حواله و سند پرداخت)
            </h4>

            <form onSubmit={handlePaySubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <MuiTextField
                label="Amount (USD)"
                type="number"
                sizeVariant="small"
                value={payAmount}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                required
              />

              <MuiTextField
                select
                label="Payment Method"
                sizeVariant="small"
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
              >
                <MenuItem value="Sarrafi Hawala (حواله صرافی)">Sarrafi Hawala (حواله صرافی)</MenuItem>
                <MenuItem value="Cash Safe (صندوق مرکزی)">Cash Safe (صندوق مرکزی)</MenuItem>
                <MenuItem value="Bank Wire (انتقال بانکی)">Bank Wire (انتقال بانکی)</MenuItem>
              </MuiTextField>

              <MuiTextField
                label="Hawala / Ref Code"
                sizeVariant="small"
                placeholder="e.g. HWL-DXB-9982"
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
              />

              <div className="sm:col-span-2">
                <MuiTextField
                  label="Sarrafi Account / Market Location"
                  sizeVariant="small"
                  value={paySarrafi}
                  onChange={(e) => setPaySarrafi(e.target.value)}
                  fullWidth
                />
              </div>

              <div className="flex items-end">
                <MuiButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="medium"
                >
                  Confirm Settlement
                </MuiButton>
              </div>
            </form>
          </div>
        )}

        {/* New Purchase Bill Form Dropdown */}
        {isBilling && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-[#1A2234] space-y-4 print:hidden">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-primary" />
              Book Purchase Bill / Import Consignment
            </h4>

            <form onSubmit={handleBillSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <MuiTextField
                label="Linked Stock # (Optional)"
                sizeVariant="small"
                placeholder="e.g. SM-HRT-107"
                value={billStock}
                onChange={(e) => setBillStock(e.target.value)}
              />

              <div className="sm:col-span-2">
                <MuiTextField
                  label="Vehicle Description / Consignment Particulars"
                  sizeVariant="small"
                  placeholder="e.g. 2023 Toyota Hilux GR Sport 4.0L V6"
                  value={billDesc}
                  onChange={(e) => setBillDesc(e.target.value)}
                  required
                  fullWidth
                />
              </div>

              <MuiTextField
                label="Purchased Bill Amount (USD)"
                type="number"
                sizeVariant="small"
                value={billAmount}
                onChange={(e) => setBillAmount(Number(e.target.value))}
                required
              />

              <div className="sm:col-span-2 flex items-end">
                <MuiButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="medium"
                >
                  Book Bill into Supplier Ledger
                </MuiButton>
              </div>
            </form>
          </div>
        )}

        {/* Itemized Bills Table */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
            Itemized Invoices & Purchase Bills ({supplier.bills.length} Records)
          </h4>

          <MuiTableContainer component={MuiPaper} elevation={1}>
            <MuiTable size="small">
              <MuiTableHead>
                <MuiTableRow className="bg-slate-50 dark:bg-slate-900/60">
                  <MuiTableCell className="font-bold text-slate-500 uppercase text-[10px]">
                    Bill #
                  </MuiTableCell>
                  <MuiTableCell className="font-bold text-slate-500 uppercase text-[10px]">
                    Issue Date
                  </MuiTableCell>
                  <MuiTableCell className="font-bold text-slate-500 uppercase text-[10px]">
                    Vehicle Description / Particulars
                  </MuiTableCell>
                  <MuiTableCell className="font-bold text-slate-500 uppercase text-[10px]">
                    Linked Stock
                  </MuiTableCell>
                  <MuiTableCell className="font-bold text-slate-500 uppercase text-[10px] text-right">
                    Amount (USD)
                  </MuiTableCell>
                  <MuiTableCell className="font-bold text-slate-500 uppercase text-[10px] text-right">
                    Amount (AFN)
                  </MuiTableCell>
                  <MuiTableCell className="font-bold text-slate-500 uppercase text-[10px] text-center">
                    Status
                  </MuiTableCell>
                </MuiTableRow>
              </MuiTableHead>
              <MuiTableBody>
                {supplier.bills.map((bill) => (
                  <MuiTableRow key={bill.id}>
                    <MuiTableCell className="font-mono font-semibold text-primary">
                      {bill.billNumber}
                    </MuiTableCell>
                    <MuiTableCell className="font-mono text-xs text-slate-500">
                      {bill.issueDate}
                    </MuiTableCell>
                    <MuiTableCell className="font-medium text-slate-800 dark:text-slate-200">
                      {bill.vehicleDescription}
                    </MuiTableCell>
                    <MuiTableCell className="font-mono text-xs text-slate-500">
                      {bill.stockNumber || "—"}
                    </MuiTableCell>
                    <MuiTableCell className="font-mono font-bold text-right text-slate-900 dark:text-white">
                      ${bill.amountUSD.toLocaleString()}
                    </MuiTableCell>
                    <MuiTableCell className="font-mono text-xs text-right text-slate-500">
                      ؋{Math.round(bill.amountUSD * exchangeRate).toLocaleString()}
                    </MuiTableCell>
                    <MuiTableCell align="center">
                      <MuiChip
                        label={bill.status}
                        size="small"
                        color={bill.status === "Paid" ? "success" : "warning"}
                      />
                    </MuiTableCell>
                  </MuiTableRow>
                ))}
              </MuiTableBody>
            </MuiTable>
          </MuiTableContainer>
        </div>
      </div>
    </div>
  );
}
