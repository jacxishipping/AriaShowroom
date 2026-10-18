"use client";

import React, { useState } from "react";
import { SupplierRecord } from "@/lib/mock-data";
import { useShowroomStore } from "@/store/useShowroomStore";
import { MuiButton, MuiChip, MuiTextField } from "@/components/mui";
import {
  X,
  Printer,
  Building2,
  Phone,
  DollarSign,
  Plus,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
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

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) return;

    recordSupplierPayment(
      supplier.id,
      Number(payAmount),
      payMethod,
      payRef,
      paySarrafi
    );

    setIsPaying(false);
    setPayAmount(0);
    setPayRef("");
    addToast(`Payment of $${payAmount.toLocaleString()} recorded for ${supplier.companyName}!`, "success");
  };

  const handleBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (billAmount <= 0) return;

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    addSupplierBill({
      billNumber: `BILL-${supplier.country.includes("UAE") ? "DXB" : supplier.country.includes("Japan") ? "TYO" : "HRT"}-${randomNum}`,
      supplierId: supplier.id,
      stockNumber: billStock,
      vehicleDescription: billDesc,
      amountUSD: Number(billAmount),
      status: "Unpaid",
      issueDate: new Date().toISOString().split("T")[0],
    });

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
            <Building2 className="h-5 w-5 text-[#1976D2]" />
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
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Supplier Profile & KPI Cards */}
        <div className="mt-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {supplier.companyName}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Contact: <span className="font-semibold">{supplier.contactName}</span> • {supplier.country}
              </p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Phone / WhatsApp: {supplier.phone} {supplier.whatsapp && `| ${supplier.whatsapp}`}
              </p>
              {supplier.bankOrSarrafiAccount && (
                <p className="text-xs text-slate-500 font-mono">
                  Settlement Account: {supplier.bankOrSarrafiAccount}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 print:hidden">
              <MuiButton
                variant="contained"
                color="primary"
                size="small"
                onClick={() => {
                  setIsPaying(!isPaying);
                  setIsBilling(false);
                  setPayAmount(supplier.balanceUSD > 0 ? supplier.balanceUSD : 5000);
                }}
                startIcon={<Receipt className="h-3.5 w-3.5" />}
              >
                Record Payment (ثبت پرداخت)
              </MuiButton>

              <MuiButton
                variant="outlined"
                size="small"
                onClick={() => {
                  setIsBilling(!isBilling);
                  setIsPaying(false);
                }}
                startIcon={<Plus className="h-3.5 w-3.5" />}
              >
                Add Purchase Bill
              </MuiButton>
            </div>
          </div>

          {/* Quick Balance Summary Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-[#1A2234] border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Total Purchased Vehicles
              </span>
              <p className="mt-1 text-xl font-bold font-mono text-slate-900 dark:text-white">
                ${supplier.totalPurchasedUSD.toLocaleString()} USD
              </p>
              <span className="text-[11px] text-slate-500 font-mono">
                ؋{Math.round(supplier.totalPurchasedUSD * exchangeRate).toLocaleString()} AFN
              </span>
            </div>

            <div className="rounded-lg bg-slate-50 p-4 dark:bg-[#1A2234] border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Total Settled & Paid
              </span>
              <p className="mt-1 text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                ${supplier.totalPaidUSD.toLocaleString()} USD
              </p>
              <span className="text-[11px] text-slate-500 font-mono">
                ؋{Math.round(supplier.totalPaidUSD * exchangeRate).toLocaleString()} AFN
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
            <div className="rounded-xl border border-[#1976D2]/30 bg-[#1976D2]/5 p-5 dark:border-[#1976D2]/20 dark:bg-[#1976D2]/10 space-y-4 print:hidden">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#1976D2] flex items-center gap-1.5">
                <Receipt className="h-4 w-4" />
                Issue Supplier Settlement Voucher (صدور حواله و سند پرداخت)
              </h4>

              <form onSubmit={handlePaySubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount (USD)
                  </label>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    required
                    className="w-full rounded-md border border-slate-300 bg-white p-2 font-mono font-bold dark:border-slate-700 dark:bg-[#1A2234] dark:text-white outline-none focus:border-[#1976D2]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-[#1A2234] dark:text-white outline-none focus:border-[#1976D2]"
                  >
                    <option value="Sarrafi Hawala (حواله صرافی)">Sarrafi Hawala (حواله صرافی)</option>
                    <option value="Cash Safe (صندوق مرکزی)">Cash Safe (صندوق مرکزی)</option>
                    <option value="Bank Wire (انتقال بانکی)">Bank Wire (انتقال بانکی)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hawala / Ref Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HWL-DXB-9982"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white p-2 font-mono dark:border-slate-700 dark:bg-[#1A2234] dark:text-white outline-none focus:border-[#1976D2]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sarrafi Account / Market Location
                  </label>
                  <input
                    type="text"
                    value={paySarrafi}
                    onChange={(e) => setPaySarrafi(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-[#1A2234] dark:text-white outline-none focus:border-[#1976D2]"
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
                <Plus className="h-4 w-4 text-[#1976D2]" />
                Book Purchase Bill / Import Consignment
              </h4>

              <form onSubmit={handleBillSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Linked Stock # (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SM-HRT-107"
                    value={billStock}
                    onChange={(e) => setBillStock(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white p-2 font-mono dark:border-slate-700 dark:bg-[#121824] dark:text-white outline-none focus:border-[#1976D2]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Vehicle Description / Consignment Particulars
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2023 Toyota Hilux GR Sport 4.0L V6"
                    value={billDesc}
                    onChange={(e) => setBillDesc(e.target.value)}
                    required
                    className="w-full rounded-md border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-[#121824] dark:text-white outline-none focus:border-[#1976D2]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Purchased Bill Amount (USD)
                  </label>
                  <input
                    type="number"
                    value={billAmount}
                    onChange={(e) => setBillAmount(Number(e.target.value))}
                    required
                    className="w-full rounded-md border border-slate-300 bg-white p-2 font-mono font-bold dark:border-slate-700 dark:bg-[#121824] dark:text-white outline-none focus:border-[#1976D2]"
                  />
                </div>

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

            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-300">Bill #</th>
                    <th className="py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-300">Date</th>
                    <th className="py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-300">Stock / Vehicle Particulars</th>
                    <th className="py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Amount (USD)</th>
                    <th className="py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {supplier.bills.map((bill) => (
                    <tr key={bill.id}>
                      <td className="py-2.5 px-4 font-mono font-semibold text-[#1976D2]">
                        {bill.billNumber}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-500">
                        {bill.issueDate}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {bill.vehicleDescription || "Vehicle Consignment"}
                        </span>
                        {bill.stockNumber && (
                          <span className="font-mono text-slate-400 ml-2">
                            ({bill.stockNumber})
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        ${bill.amountUSD.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <MuiChip
                          label={bill.status}
                          color={bill.status === "Paid" ? "success" : bill.status === "Partial" ? "default" : "default"}
                          size="small"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
