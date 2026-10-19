"use client";

import React, { useState } from "react";
import { SupplierRecord } from "@/lib/mock-data";
import { useShowroomStore } from "@/store/useShowroomStore";
import {
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
  X,
  Printer,
  Building2,
  Phone,
  DollarSign,
  Plus,
  Receipt,
  FileSpreadsheet,
} from "lucide-react";

interface SupplierLedgerModalProps {
  supplier: SupplierRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SupplierLedgerModal({
  supplier,
  isOpen,
  onClose,
}: SupplierLedgerModalProps) {
  const { exchangeRate, recordSupplierPayment, addSupplierBill, addToast } = useShowroomStore();

  const [isPaying, setIsPaying] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState("Sarrafi Hawala (حواله صرافی)");
  const [payRef, setPayRef] = useState("");
  const [paySarrafi, setPaySarrafi] = useState("Sarrafi Haji Qayoum Khorasan Market");

  const [isBilling, setIsBilling] = useState(false);
  const [billStock, setBillStock] = useState("");
  const [billDesc, setBillDesc] = useState("");
  const [billAmount, setBillAmount] = useState<number>(0);

  if (!isOpen || !supplier) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-[#121824] dark:text-white border border-slate-200 dark:border-slate-800">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2.5">
            <Building2 className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Supplier Statement of Account • صورتحساب تفصیلی واردکننده
              </h3>
              <p className="text-xs text-slate-500">
                Detailed purchase bills, Hawala settlements, and running payable balance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MuiButton
              variant="contained"
              color="primary"
              size="small"
              onClick={handlePrint}
              startIcon={<Printer className="h-3.5 w-3.5" />}
            >
              Print Statement
            </MuiButton>
            <IconButton size="small" onClick={onClose}>
              <X className="h-5 w-5" />
            </IconButton>
          </div>
        </div>

        {/* Statement Body */}
        <div className="mt-6 space-y-6">
          {/* Supplier Info & KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {supplier.id.toUpperCase()}
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {supplier.companyName}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Contact: <span className="text-slate-800 dark:text-slate-200 font-medium">{supplier.contactName}</span> • {supplier.country}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3 text-slate-400" />
                  {supplier.phone}
                </span>
                <span>•</span>
                <span>{supplier.bankOrSarrafiAccount || "Sarrafi Settled"}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 print:hidden">
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

          {/* Running Balance Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-[#1A2234] border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Total Invoiced Purchases
              </span>
              <p className="mt-1 text-xl font-bold font-mono text-slate-900 dark:text-white">
                ${supplier.totalPurchasedUSD.toLocaleString()} USD
              </p>
              <span className="text-[11px] text-slate-500 font-mono">
                {supplier.bills.length} Invoices to date
              </span>
            </div>

            <div className="rounded-lg bg-slate-50 p-4 dark:bg-[#1A2234] border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Total Hawala Settled (پرداخت شده)
              </span>
              <p className="mt-1 text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                ${supplier.totalPaidUSD.toLocaleString()} USD
              </p>
              <span className="text-[11px] text-slate-500 font-mono">
                {((supplier.totalPaidUSD / (supplier.totalPurchasedUSD || 1)) * 100).toFixed(0)}% cleared
              </span>
            </div>

            <div className="rounded-lg bg-slate-50 p-4 dark:bg-[#1A2234] border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Net Outstanding Payable (باقیداری)
              </span>
              <p className={`mt-1 text-xl font-bold font-mono ${supplier.balanceUSD > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-800 dark:text-slate-200"}`}>
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

          {/* Transaction Ledger Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Itemized Invoices & Purchase Bills ({supplier.bills.length} Records)
            </h4>

            <MuiTableContainer>
              <MuiTable size="small">
                <MuiTableHead>
                  <MuiTableRow>
                    <MuiTableCell>Bill #</MuiTableCell>
                    <MuiTableCell>Date</MuiTableCell>
                    <MuiTableCell>Stock / Vehicle Particulars</MuiTableCell>
                    <MuiTableCell align="right">Amount (USD)</MuiTableCell>
                    <MuiTableCell align="right">Status</MuiTableCell>
                  </MuiTableRow>
                </MuiTableHead>
                <MuiTableBody>
                  {supplier.bills.map((bill) => (
                    <MuiTableRow key={bill.id} hover>
                      <MuiTableCell className="font-mono font-semibold text-primary">
                        {bill.billNumber}
                      </MuiTableCell>
                      <MuiTableCell className="font-mono text-slate-500">
                        {bill.issueDate}
                      </MuiTableCell>
                      <MuiTableCell>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {bill.vehicleDescription || "Vehicle Consignment"}
                        </span>
                        {bill.stockNumber && (
                          <span className="font-mono text-slate-400 ml-2">
                            ({bill.stockNumber})
                          </span>
                        )}
                      </MuiTableCell>
                      <MuiTableCell align="right" className="font-mono font-bold text-slate-900 dark:text-white">
                        ${bill.amountUSD.toLocaleString()}
                      </MuiTableCell>
                      <MuiTableCell align="right">
                        <MuiChip
                          label={bill.status}
                          color={bill.status === "Paid" ? "success" : "default"}
                          size="small"
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
    </div>
  );
}
