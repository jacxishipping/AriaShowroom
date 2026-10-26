"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useShowroomStore } from "@/store/useShowroomStore";
import { PaymentVoucherRecord } from "@/lib/mock-data";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@/components/mui";
import {
  Banknote,
  Plus,
  Search,
  X,
  Printer,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  FileCheck2,
  Pencil,
  Trash2,
} from "lucide-react";

interface PaymentsTabProps {
  onSelectVoucher?: (voucher: PaymentVoucherRecord) => void;
}

export function PaymentsTab({ onSelectVoucher: _onSelectVoucher }: PaymentsTabProps) {
  const { data: session } = useSession();
  const {
    payments,
    vehicles,
    exchangeRate,
    language,
    addPaymentVoucher,
    updatePaymentVoucher,
    deletePaymentVoucher,
    addToast,
  } = useShowroomStore();
  const [editingVoucher, setEditingVoucher] = useState<PaymentVoucherRecord | null>(null);
  const [deletingVoucher, setDeletingVoucher] = useState<PaymentVoucherRecord | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [isCreating, setIsCreating] = useState(false);

  const [voucherType, setVoucherType] = useState<
    "CUSTOMER_PAYMENT" | "SUPPLIER_PAYMENT" | "EXPENSE_PAYMENT"
  >("CUSTOMER_PAYMENT");
  const [partyName, setPartyName] = useState("");
  const [partyPhone, setPartyPhone] = useState("");
  const [partyTazkira, setPartyTazkira] = useState("");
  const [amountUSD, setAmountUSD] = useState<number>(5000);
  const [paymentMethod, setPaymentMethod] = useState<
    "Cash (صندوق)" | "Sarrafi Hawala (حواله صرافی)" | "Bank Transfer (حساب بانکی)"
  >("Cash (صندوق)");
  const [sarrafiAccount, setSarrafiAccount] = useState(
    "Showroom Central Vault (صندوق مرکزی)"
  );
  const [referenceNumber, setReferenceNumber] = useState("");
  const [vehicleStock, setVehicleStock] = useState("");
  const [purpose, setPurpose] = useState("Vehicle down payment receipt");

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.voucherNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.partyName.toLowerCase().includes(search.toLowerCase()) ||
      (p.referenceNumber &&
        p.referenceNumber.toLowerCase().includes(search.toLowerCase())) ||
      (p.purpose && p.purpose.toLowerCase().includes(search.toLowerCase()));

    const matchesType = typeFilter === "all" || p.voucherType === typeFilter;
    const matchesMethod =
      methodFilter === "all" ||
      p.paymentMethod.toLowerCase().includes(methodFilter.toLowerCase());

    return matchesSearch && matchesType && matchesMethod;
  });

  const totalInflowsUSD = payments
    .filter((p) => p.voucherType === "CUSTOMER_PAYMENT")
    .reduce((acc, p) => acc + p.amountUSD, 0);

  const totalOutflowsUSD = payments
    .filter((p) => p.voucherType !== "CUSTOMER_PAYMENT")
    .reduce((acc, p) => acc + p.amountUSD, 0);

  const netCashflowUSD = totalInflowsUSD - totalOutflowsUSD;
  const netCashflowAFN = Math.round(netCashflowUSD * exchangeRate);

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmountUSD = Number(amountUSD);
    const amountAFN = Math.round(numAmountUSD * exchangeRate);

    try {
      await addPaymentVoucher({
        voucherType,
        partyName,
        partyPhone: partyPhone || undefined,
        partyTazkira: partyTazkira || undefined,
        amountUSD: numAmountUSD,
        amountAFN,
        exchangeRate,
        date: new Date().toISOString().split("T")[0],
        paymentMethod,
        sarrafiAccount: sarrafiAccount || undefined,
        referenceNumber: referenceNumber || undefined,
        vehicleStock: vehicleStock || undefined,
        purpose,
        recordedBy: session?.user?.name || "Accounting Desk",
      });
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Unable to save payment voucher",
        "error"
      );
      return;
    }

    setPartyName("");
    setPartyPhone("");
    setPartyTazkira("");
    setReferenceNumber("");
    setIsCreating(false);
    addToast("Payment voucher recorded", "success");
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "CUSTOMER_PAYMENT":
        return {
          label: "Customer Receipt (دریافتی)",
          color: "success" as const,
        };
      case "SUPPLIER_PAYMENT":
        return {
          label: "Supplier Hawala (پرداختی تامین‌کننده)",
          color: "info" as const,
        };
      case "EXPENSE_PAYMENT":
        return {
          label: "Operational Outlay (مصرفی)",
          color: "warning" as const,
        };
      default:
        return { label: type, color: "default" as const };
    }
  };

  const handleUpdateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVoucher) return;
    try {
      const amount = Number(editingVoucher.amountUSD);
      await updatePaymentVoucher(editingVoucher.id, {
        partyName: editingVoucher.partyName,
        partyPhone: editingVoucher.partyPhone,
        partyTazkira: editingVoucher.partyTazkira,
        amountUSD: amount,
        amountAFN: Math.round(amount * exchangeRate),
        paymentMethod: editingVoucher.paymentMethod,
        sarrafiAccount: editingVoucher.sarrafiAccount,
        referenceNumber: editingVoucher.referenceNumber,
        purpose: editingVoucher.purpose,
        vehicleStock: editingVoucher.vehicleStock || undefined,
      });
      addToast("Payment voucher updated", "success");
      setEditingVoucher(null);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to update voucher", "error");
    }
  };

  const handleDeleteVoucher = async () => {
    if (!deletingVoucher) return;
    try {
      await deletePaymentVoucher(deletingVoucher.id);
      addToast("Payment voucher deleted", "success");
      setDeletingVoucher(null);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to delete voucher", "error");
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Cashflow Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#161B26] border border-slate-200 dark:border-[#262F40] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {language === "fa"
                ? "مجموع دریافتی‌ها"
                : language === "ps"
                ? "ټول راغلي وجوه"
                : "Total Inflows"}
            </span>
            <span className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
              <ArrowDownLeft className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-1.5 text-xl font-extrabold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 tracking-tight">
            +${totalInflowsUSD.toLocaleString()}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500 font-mono tabular-nums">
            ؋ {(totalInflowsUSD * exchangeRate).toLocaleString()} AFN
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#161B26] border border-slate-200 dark:border-[#262F40] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {language === "fa"
                ? "مجموع پرداختی‌ها"
                : language === "ps"
                ? "ټول تادیات"
                : "Total Outflows"}
            </span>
            <span className="p-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-1.5 text-xl font-extrabold font-mono tabular-nums text-rose-600 dark:text-rose-400 tracking-tight">
            -${totalOutflowsUSD.toLocaleString()}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500 font-mono tabular-nums">
            ؋ {(totalOutflowsUSD * exchangeRate).toLocaleString()} AFN
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#161B26] border border-slate-200 dark:border-[#262F40] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {language === "fa"
                ? "جریان نقدی خالص"
                : language === "ps"
                ? "خالص نغدي جریان"
                : "Net Cashflow"}
            </span>
            <span className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
              <DollarSign className="h-3.5 w-3.5" />
            </span>
          </div>
          <p
            className={`mt-1.5 text-xl font-extrabold font-mono tabular-nums tracking-tight ${
              netCashflowUSD >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {netCashflowUSD >= 0 ? "+" : ""}${netCashflowUSD.toLocaleString()}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500 font-mono tabular-nums">
            ؋ {netCashflowAFN.toLocaleString()} AFN
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#161B26] border border-slate-200 dark:border-[#262F40] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {language === "fa"
                ? "اسناد ثبت‌شده"
                : language === "ps"
                ? "ثبت شوي واوچرونه"
                : "Audited Vouchers"}
            </span>
            <span className="p-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40">
              <FileCheck2 className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-1.5 text-xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white tracking-tight">
            {payments.length}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">Cash, Hawala & Sarrafi vouchers</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              aria-label="Search payment vouchers"
              placeholder={
                language === "fa"
                  ? "جستجوی شماره سند، طرف حساب، حواله..."
                  : language === "ps"
                  ? "د واوچر یا حوالې پلټنه..."
                  : "Search voucher #, party, hawala..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 sm:w-60 ps-7 pe-6 py-1 text-xs rounded-lg border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#0F141C] text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-primary h-8"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute end-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                aria-label="Clear voucher search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <select
            aria-label="Filter vouchers by type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-8 ps-2.5 pe-6 py-1 text-xs rounded-lg border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#0F141C] text-slate-800 dark:text-slate-200 font-medium outline-none focus:border-primary cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="CUSTOMER_PAYMENT">Customer Receipts (دریافتی)</option>
            <option value="SUPPLIER_PAYMENT">Supplier Hawala (تامین‌کننده)</option>
            <option value="EXPENSE_PAYMENT">Expense Outlays (مصارف)</option>
          </select>

          <select
            aria-label="Filter vouchers by payment channel"
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="h-8 ps-2.5 pe-6 py-1 text-xs rounded-lg border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#0F141C] text-slate-800 dark:text-slate-200 font-medium outline-none focus:border-primary cursor-pointer"
          >
            <option value="all">All Channels</option>
            <option value="cash">Cash Safe (نقدی)</option>
            <option value="hawala">Sarrafi (حواله)</option>
            <option value="bank">Bank Wire (بانک)</option>
          </select>

          {(search || typeFilter !== "all" || methodFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setTypeFilter("all");
                setMethodFilter("all");
              }}
              className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline px-1 cursor-pointer"
            >
              Reset
            </button>
          )}

          <span className="text-[11px] font-mono tabular-nums text-slate-400">
            ({filteredPayments.length})
          </span>
        </div>

        <MuiButton
          variant={isCreating ? "outlined" : "contained"}
          color="primary"
          size="small"
          onClick={() => setIsCreating(!isCreating)}
          startIcon={isCreating ? undefined : <Plus className="h-3.5 w-3.5" />}
          sx={{ fontSize: "11px", py: "5px" }}
        >
          {isCreating ? "Cancel" : "Record Voucher"}
        </MuiButton>
      </div>

      {/* Expandable Voucher Creation Form */}
      {isCreating && (
        <MuiCard
          elevation={2}
          className="p-5 rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26]"
        >
          <div className="flex items-center gap-2 mb-4">
            <Banknote className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Issue Official Cash / Hawala Payment Voucher (سند ثبت پرداخت / دریافت)
            </h3>
          </div>

          <form onSubmit={handleCreateVoucher} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <MuiTextField
                select
                label="Voucher Nature (نوع سند)"
                value={voucherType}
                onChange={(e) => {
                  const vt = e.target.value as any;
                  setVoucherType(vt);
                  if (vt === "CUSTOMER_PAYMENT")
                    setPurpose("Customer vehicle down payment receipt");
                  if (vt === "SUPPLIER_PAYMENT")
                    setPurpose("Sarrafi Hawala supplier vehicle settlement");
                  if (vt === "EXPENSE_PAYMENT")
                    setPurpose("Customs / Freight clearance disbursement");
                }}
              >
                <MenuItem value="CUSTOMER_PAYMENT">
                  Customer Receipt / Inward (سند دریافت مشتری)
                </MenuItem>
                <MenuItem value="SUPPLIER_PAYMENT">
                  Supplier Hawala / Outward (حواله پرداخت تامین‌کننده)
                </MenuItem>
                <MenuItem value="EXPENSE_PAYMENT">
                  Expense Outlay / Outward (سند مصارف گمرکی و حمل)
                </MenuItem>
              </MuiTextField>

              <MuiTextField
                label="Party / Recipient / Payer Name"
                required
                placeholder={
                  voucherType === "SUPPLIER_PAYMENT"
                    ? "e.g. Al-Baraka Global Motors"
                    : "e.g. Haji Abdul Qadir Alokozai"
                }
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
              />

              <MuiTextField
                label="Phone (شماره تماس)"
                placeholder="+93 79 912 3456"
                value={partyPhone}
                onChange={(e) => setPartyPhone(e.target.value)}
              />

              <MuiTextField
                label="Tazkira / License ID"
                placeholder="1400-0402-88912"
                value={partyTazkira}
                onChange={(e) => setPartyTazkira(e.target.value)}
              />

              <MuiTextField
                label="Amount (USD)"
                type="number"
                required
                value={amountUSD}
                onChange={(e) => setAmountUSD(Number(e.target.value))}
                startAdornment={<DollarSign className="h-3.5 w-3.5 text-slate-400" />}
                helperText={`Equivalent: ؋ ${(amountUSD * exchangeRate).toLocaleString()} AFN (@ ${exchangeRate})`}
              />

              <MuiTextField
                select
                label="Settlement Method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
              >
                <MenuItem value="Cash (صندوق)">Cash Safe (صندوق نقدی صرافی)</MenuItem>
                <MenuItem value="Sarrafi Hawala (حواله صرافی)">
                  Sarrafi Hawala (حواله صرافی مارکت خراسان)
                </MenuItem>
                <MenuItem value="Bank Transfer (حساب بانکی)">
                  Bank Transfer (انتقال بانکی AIB / Ghazanfar)
                </MenuItem>
              </MuiTextField>

              <MuiTextField
                label="Sarrafi Safe / Bank Account"
                placeholder="e.g. Sarrafi Haji Qayoum Khorasan Market Herat"
                value={sarrafiAccount}
                onChange={(e) => setSarrafiAccount(e.target.value)}
              />

              <MuiTextField
                label="Sarrafi Reference / Receipt # (شماره حواله / قبض)"
                placeholder="e.g. HWL-HRT-2026-881"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />

              <MuiTextField
                select
                label="Related Vehicle Stock # (اختصاصی)"
                value={vehicleStock}
                onChange={(e) => setVehicleStock(e.target.value)}
              >
                <MenuItem value="">General Transaction (None)</MenuItem>
                {vehicles.map((v) => (
                  <MenuItem key={v.id} value={v.stockNumber}>
                    {v.stockNumber} - {v.year} {v.make} {v.model}
                  </MenuItem>
                ))}
              </MuiTextField>
            </div>

            <MuiTextField
              label="Transaction Purpose / Settlement Note"
              required
              placeholder="e.g. Down payment received for 2024 Toyota Land Cruiser VXR"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />

            <div className="flex justify-end gap-3 pt-2">
              <MuiButton
                type="button"
                variant="outlined"
                color="inherit"
                size="small"
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </MuiButton>
              <MuiButton type="submit" variant="contained" color="primary" size="small">
                Issue Voucher
              </MuiButton>
            </div>
          </form>
        </MuiCard>
      )}

      {/* Payment Vouchers Table */}
      <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-[#262F40] flex items-center justify-between bg-slate-50/70 dark:bg-[#121722]">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Payment & Receipt Vouchers (اسناد دریافت و پرداخت صرافی)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Dual-currency accounting audit trail with verified QR codes and Sarrafi Hawala tracking.
            </p>
          </div>
          <span className="text-[11px] font-mono tabular-nums text-slate-400">
            {filteredPayments.length} vouchers
          </span>
        </div>

        <div className="overflow-x-auto">
          <MuiTable dense size="small" className="w-full">
            <MuiTableHead>
              <MuiTableRow hover={false}>
                <MuiTableCell header>Voucher #</MuiTableCell>
                <MuiTableCell header>Type</MuiTableCell>
                <MuiTableCell header>Party / Recipient</MuiTableCell>
                <MuiTableCell header>Method & Account</MuiTableCell>
                <MuiTableCell header>Purpose / Ref</MuiTableCell>
                <MuiTableCell header>Date</MuiTableCell>
                <MuiTableCell header align="right">
                  Amount (USD & AFN)
                </MuiTableCell>
                <MuiTableCell header align="center">
                  Action
                </MuiTableCell>
              </MuiTableRow>
            </MuiTableHead>
            <MuiTableBody>
              {filteredPayments.map((vch) => {
                const badge = getTypeBadge(vch.voucherType);
                return (
                  <MuiTableRow key={vch.id}>
                    <MuiTableCell className="font-mono tabular-nums font-bold text-xs text-primary">
                      <Link
                        href={`/accounting/vouchers/${vch.id}`}
                        className="hover:underline"
                      >
                        {vch.voucherNumber}
                      </Link>
                    </MuiTableCell>

                    <MuiTableCell>
                      <MuiChip label={badge.label} color={badge.color} size="small" />
                    </MuiTableCell>

                    <MuiTableCell>
                      <div className="font-semibold text-slate-900 dark:text-white text-xs">
                        {vch.partyName}
                      </div>
                      {vch.partyPhone && (
                        <div className="text-[10px] font-mono tabular-nums text-slate-400">
                          {vch.partyPhone}
                        </div>
                      )}
                    </MuiTableCell>

                    <MuiTableCell>
                      <div className="text-xs text-slate-800 dark:text-slate-200">
                        {vch.paymentMethod}
                      </div>
                      <div
                        className="text-[10px] text-slate-400 truncate max-w-[150px]"
                        title={vch.sarrafiAccount}
                      >
                        {vch.sarrafiAccount || "Central Cash Safe"}
                      </div>
                    </MuiTableCell>

                    <MuiTableCell>
                      <div
                        className="text-xs text-slate-700 dark:text-slate-300 truncate max-w-[170px]"
                        title={vch.purpose}
                      >
                        {vch.purpose}
                      </div>
                      {vch.referenceNumber && (
                        <div className="text-[10px] font-mono text-slate-400">
                          Ref: {vch.referenceNumber}
                        </div>
                      )}
                    </MuiTableCell>

                    <MuiTableCell className="font-mono tabular-nums text-[11px] text-slate-500">
                      {vch.date}
                    </MuiTableCell>

                    <MuiTableCell align="right">
                      <div
                        className={`font-mono tabular-nums font-bold text-xs ${
                          vch.voucherType === "CUSTOMER_PAYMENT"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {vch.voucherType === "CUSTOMER_PAYMENT" ? "+" : "-"}$
                        {vch.amountUSD.toLocaleString()} USD
                      </div>
                      <div className="text-[10px] font-mono tabular-nums text-slate-400">
                        ؋ {vch.amountAFN.toLocaleString()} AFN
                      </div>
                    </MuiTableCell>

                    <MuiTableCell align="center">
                      <div className="flex items-center justify-center gap-1">
                        <MuiButton
                          component={Link}
                          href={`/accounting/vouchers/${vch.id}`}
                          variant="outlined"
                          size="small"
                          color="primary"
                          sx={{ fontSize: "10px", py: "2px", px: "6px" }}
                          startIcon={<Printer className="h-3 w-3" />}
                        >
                          Print
                        </MuiButton>
                        <IconButton
                          size="small"
                          color="primary"
                          title="Edit Voucher"
                          aria-label={`Edit voucher ${vch.voucherNumber}`}
                          onClick={() => setEditingVoucher({ ...vch })}
                          sx={{ p: "3px" }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          title="Delete Voucher"
                          aria-label={`Delete voucher ${vch.voucherNumber}`}
                          onClick={() => setDeletingVoucher(vch)}
                          sx={{ p: "3px" }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </IconButton>
                      </div>
                    </MuiTableCell>
                  </MuiTableRow>
                );
              })}
            </MuiTableBody>
          </MuiTable>
        </div>
      </div>

      {/* Edit Payment Voucher Dialog */}
      <Dialog
        open={Boolean(editingVoucher)}
        onClose={() => setEditingVoucher(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem" }}>
          Edit Payment Voucher ({editingVoucher?.voucherNumber})
        </DialogTitle>
        {editingVoucher && (
          <form onSubmit={handleUpdateVoucher}>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MuiTextField
                  label="Party Name (طرف حساب)"
                  value={editingVoucher.partyName}
                  onChange={(e) =>
                    setEditingVoucher({ ...editingVoucher, partyName: e.target.value })
                  }
                  required
                />
                <MuiTextField
                  label="Phone / WhatsApp"
                  value={editingVoucher.partyPhone || ""}
                  onChange={(e) =>
                    setEditingVoucher({ ...editingVoucher, partyPhone: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MuiTextField
                  label="Amount (USD $)"
                  type="number"
                  value={editingVoucher.amountUSD}
                  onChange={(e) =>
                    setEditingVoucher({
                      ...editingVoucher,
                      amountUSD: Number(e.target.value),
                    })
                  }
                  required
                />
                <MuiTextField
                  select
                  label="Payment Channel"
                  value={editingVoucher.paymentMethod}
                  onChange={(e) =>
                    setEditingVoucher({
                      ...editingVoucher,
                      paymentMethod: e.target.value as any,
                    })
                  }
                  required
                >
                  <MenuItem value="Cash (صندوق)">Cash (صندوق نقدی)</MenuItem>
                  <MenuItem value="Sarrafi Hawala (حواله صرافی)">
                    Sarrafi Hawala (حواله صرافی)
                  </MenuItem>
                  <MenuItem value="Bank Transfer (حساب بانکی)">
                    Bank Transfer (حساب بانکی)
                  </MenuItem>
                </MuiTextField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MuiTextField
                  label="Sarrafi / Vault Account"
                  value={editingVoucher.sarrafiAccount || ""}
                  onChange={(e) =>
                    setEditingVoucher({
                      ...editingVoucher,
                      sarrafiAccount: e.target.value,
                    })
                  }
                />
                <MuiTextField
                  label="Reference No. / Hawala ID"
                  value={editingVoucher.referenceNumber || ""}
                  onChange={(e) =>
                    setEditingVoucher({
                      ...editingVoucher,
                      referenceNumber: e.target.value,
                    })
                  }
                />
              </div>

              <MuiTextField
                label="Purpose / Memo (بابت)"
                value={editingVoucher.purpose}
                onChange={(e) =>
                  setEditingVoucher({ ...editingVoucher, purpose: e.target.value })
                }
                required
              />

              <MuiTextField
                select
                label="Vehicle Stock Allocation (Optional)"
                value={editingVoucher.vehicleStock || ""}
                onChange={(e) =>
                  setEditingVoucher({ ...editingVoucher, vehicleStock: e.target.value })
                }
              >
                <MenuItem value="">None / General Settlement</MenuItem>
                {vehicles.map((v) => (
                  <MenuItem key={v.id} value={v.stockNumber}>
                    {v.stockNumber} — {v.year} {v.make} {v.model}
                  </MenuItem>
                ))}
              </MuiTextField>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
              <MuiButton
                variant="outlined"
                color="inherit"
                onClick={() => setEditingVoucher(null)}
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

      {/* Delete Payment Voucher Dialog */}
      <Dialog
        open={Boolean(deletingVoucher)}
        onClose={() => setDeletingVoucher(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem" }}>
          Delete Payment Voucher
        </DialogTitle>
        <DialogContent>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to permanently delete voucher{" "}
            <strong className="text-slate-900 dark:text-white">
              {deletingVoucher?.voucherNumber}
            </strong>{" "}
            for party{" "}
            <strong className="text-slate-900 dark:text-white">
              {deletingVoucher?.partyName}
            </strong>{" "}
            (${deletingVoucher?.amountUSD?.toLocaleString()} USD)? This action cannot be undone.
          </p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <MuiButton
            variant="outlined"
            color="inherit"
            onClick={() => setDeletingVoucher(null)}
          >
            Cancel
          </MuiButton>
          <MuiButton variant="contained" color="error" onClick={handleDeleteVoucher}>
            Delete Voucher
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
