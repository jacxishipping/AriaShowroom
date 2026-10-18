"use client";

import React, { useState } from "react";
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
} from "@/components/mui";
import {
  Banknote,
  Plus,
  Search,
  Eye,
  Printer,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  FileCheck2,
  Phone,
  Calendar,
} from "lucide-react";

interface PaymentsTabProps {
  onSelectVoucher: (voucher: PaymentVoucherRecord) => void;
}

export function PaymentsTab({ onSelectVoucher }: PaymentsTabProps) {
  const { payments, suppliers, vehicles, exchangeRate, addPaymentVoucher } = useShowroomStore();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [isCreating, setIsCreating] = useState(false);

  // New Voucher Form State
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
  const [sarrafiAccount, setSarrafiAccount] = useState("Showroom Central Vault (صندوق مرکزی)");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [vehicleStock, setVehicleStock] = useState("");
  const [purpose, setPurpose] = useState("Vehicle down payment receipt");

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.voucherNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.partyName.toLowerCase().includes(search.toLowerCase()) ||
      (p.referenceNumber && p.referenceNumber.toLowerCase().includes(search.toLowerCase())) ||
      (p.purpose && p.purpose.toLowerCase().includes(search.toLowerCase()));

    const matchesType = typeFilter === "all" || p.voucherType === typeFilter;
    const matchesMethod = methodFilter === "all" || p.paymentMethod.toLowerCase().includes(methodFilter.toLowerCase());

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

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmountUSD = Number(amountUSD);
    const amountAFN = Math.round(numAmountUSD * exchangeRate);

    addPaymentVoucher({
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
      recordedBy: "Mirwais Saljuqi (Accountant)",
    });

    // Reset Form
    setPartyName("");
    setPartyPhone("");
    setPartyTazkira("");
    setReferenceNumber("");
    setIsCreating(false);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "CUSTOMER_PAYMENT":
        return { label: "Customer Receipt (دریافتی)", color: "success" as const, icon: <ArrowDownLeft className="h-3 w-3 mr-1 text-emerald-600" /> };
      case "SUPPLIER_PAYMENT":
        return { label: "Supplier Hawala (پرداختی تامین‌کننده)", color: "info" as const, icon: <ArrowUpRight className="h-3 w-3 mr-1 text-rose-600" /> };
      case "EXPENSE_PAYMENT":
        return { label: "Operational Outlay (مصرفی)", color: "warning" as const, icon: <ArrowUpRight className="h-3 w-3 mr-1 text-amber-600" /> };
      default:
        return { label: type, color: "default" as const, icon: null };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Cashflow Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MuiCard elevation={1} className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Inflows (مجموع عواید دریافتی)
            </span>
            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 p-1.5 text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            +${totalInflowsUSD.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-mono">
            ؋ {(totalInflowsUSD * exchangeRate).toLocaleString()} AFN
          </p>
        </MuiCard>

        <MuiCard elevation={1} className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Outflows (مجموع پرداختی‌ها)
            </span>
            <span className="rounded-full bg-rose-50 dark:bg-rose-950/40 p-1.5 text-rose-600 dark:text-rose-400">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
            -${totalOutflowsUSD.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-mono">
            ؋ {(totalOutflowsUSD * exchangeRate).toLocaleString()} AFN
          </p>
        </MuiCard>

        <MuiCard elevation={1} className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Net Showroom Cashflow (خالص نقدی)
            </span>
            <span className="rounded-full bg-blue-50 dark:bg-blue-950/40 p-1.5 text-blue-600 dark:text-blue-400">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <p className={`mt-2 text-2xl font-bold font-mono ${netCashflowUSD >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
            {netCashflowUSD >= 0 ? "+" : ""}${netCashflowUSD.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-mono">
            ؋ {netCashflowAFN.toLocaleString()} AFN
          </p>
        </MuiCard>

        <MuiCard elevation={1} className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Vouchers Audited
            </span>
            <span className="rounded-full bg-purple-50 dark:bg-purple-950/40 p-1.5 text-purple-600 dark:text-purple-400">
              <FileCheck2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {payments.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Cash, Hawala & Sarrafi vouchers
          </p>
        </MuiCard>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <MuiTextField
            size="small"
            placeholder="Search voucher #, party, hawala ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startAdornment={<Search className="h-4 w-4 text-slate-400" />}
            sx={{ minWidth: 200, maxWidth: 320 }}
          />

          <MuiTextField
            select
            size="small"
            label="Voucher Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            sx={{ minWidth: 170 }}
          >
            <MenuItem value="all">All Voucher Types</MenuItem>
            <MenuItem value="CUSTOMER_PAYMENT">Customer Receipts (دریافتی)</MenuItem>
            <MenuItem value="SUPPLIER_PAYMENT">Supplier Hawala (تامین‌کننده)</MenuItem>
            <MenuItem value="EXPENSE_PAYMENT">Expense Outlays (مصارف)</MenuItem>
          </MuiTextField>

          <MuiTextField
            select
            size="small"
            label="Payment Channel"
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            sx={{ minWidth: 170 }}
          >
            <MenuItem value="all">All Channels</MenuItem>
            <MenuItem value="cash">Cash Safe (نقدی صندوق)</MenuItem>
            <MenuItem value="hawala">Sarrafi Hawala (حواله صرافی)</MenuItem>
            <MenuItem value="bank">Bank Transfer (بانک)</MenuItem>
          </MuiTextField>
        </div>

        <MuiButton
          variant={isCreating ? "outlined" : "contained"}
          color="primary"
          size="small"
          onClick={() => setIsCreating(!isCreating)}
          startIcon={isCreating ? undefined : <Plus className="h-4 w-4" />}
        >
          {isCreating ? "Cancel" : "Record Payment / Receipt Voucher"}
        </MuiButton>
      </div>

      {/* Expandable Voucher Creation Form */}
      {isCreating && (
        <MuiCard elevation={2} className="p-6 border border-blue-200 dark:border-blue-900/50 bg-blue-50/20 dark:bg-[#121b2d]">
          <div className="flex items-center gap-2 mb-4">
            <Banknote className="h-5 w-5 text-[#1976D2]" />
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
                  if (vt === "CUSTOMER_PAYMENT") setPurpose("Customer vehicle down payment receipt");
                  if (vt === "SUPPLIER_PAYMENT") setPurpose("Sarrafi Hawala supplier vehicle settlement");
                  if (vt === "EXPENSE_PAYMENT") setPurpose("Customs / Freight clearance disbursement");
                }}
              >
                <MenuItem value="CUSTOMER_PAYMENT">Customer Receipt / Inward (سند دریافت مشتری)</MenuItem>
                <MenuItem value="SUPPLIER_PAYMENT">Supplier Hawala / Outward (حواله پرداخت تامین‌کننده)</MenuItem>
                <MenuItem value="EXPENSE_PAYMENT">Expense Outlay / Outward (سند مصارف گمرکی و حمل)</MenuItem>
              </MuiTextField>

              <MuiTextField
                label="Party / Recipient / Payer Name"
                required
                placeholder={voucherType === "SUPPLIER_PAYMENT" ? "e.g. Al-Baraka Global Motors" : "e.g. Haji Abdul Qadir Alokozai"}
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
                <MenuItem value="Sarrafi Hawala (حواله صرافی)">Sarrafi Hawala (حواله صرافی مارکت خراسان)</MenuItem>
                <MenuItem value="Bank Transfer (حساب بانکی)">Bank Transfer (انتقال بانکی AIB / Ghazanfar)</MenuItem>
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
              <MuiButton
                type="submit"
                variant="contained"
                color="primary"
                size="small"
              >
                Issue Voucher & Print Preview
              </MuiButton>
            </div>
          </form>
        </MuiCard>
      )}

      {/* Payment Vouchers Table */}
      <MuiCard elevation={1} className="overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Official Payment & Receipt Vouchers (اسناد دریافت و پرداخت صرافی)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dual-currency accounting audit trail with verified QR codes and Sarrafi Hawala tracking.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {filteredPayments.length} vouchers
          </span>
        </div>

        <div className="overflow-x-auto">
          <MuiTable dense>
            <MuiTableHead>
              <MuiTableRow hover={false}>
                <MuiTableCell header>Voucher #</MuiTableCell>
                <MuiTableCell header>Type</MuiTableCell>
                <MuiTableCell header>Party / Recipient</MuiTableCell>
                <MuiTableCell header>Method & Account</MuiTableCell>
                <MuiTableCell header>Reference / Purpose</MuiTableCell>
                <MuiTableCell header>Date</MuiTableCell>
                <MuiTableCell header align="right">Amount (USD & AFN)</MuiTableCell>
                <MuiTableCell header align="center">Actions</MuiTableCell>
              </MuiTableRow>
            </MuiTableHead>
            <MuiTableBody>
              {filteredPayments.map((vch) => {
                const badge = getTypeBadge(vch.voucherType);
                return (
                  <MuiTableRow key={vch.id}>
                    <MuiTableCell className="font-mono font-bold text-xs text-[#1976D2] dark:text-[#42A5F5]">
                      {vch.voucherNumber}
                    </MuiTableCell>

                    <MuiTableCell>
                      <MuiChip
                        label={badge.label}
                        color={badge.color}
                        size="small"
                      />
                    </MuiTableCell>

                    <MuiTableCell>
                      <div className="font-semibold text-slate-900 dark:text-white text-xs">
                        {vch.partyName}
                      </div>
                      {vch.partyPhone && (
                        <div className="text-[11px] font-mono text-slate-400">
                          {vch.partyPhone}
                        </div>
                      )}
                    </MuiTableCell>

                    <MuiTableCell>
                      <div className="text-xs text-slate-800 dark:text-slate-200">
                        {vch.paymentMethod}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[180px]" title={vch.sarrafiAccount}>
                        {vch.sarrafiAccount || "Central Cash Safe"}
                      </div>
                    </MuiTableCell>

                    <MuiTableCell>
                      <div className="text-xs text-slate-700 dark:text-slate-300">
                        {vch.purpose}
                      </div>
                      {vch.referenceNumber && (
                        <div className="text-[10px] font-mono text-slate-400">
                          Ref: {vch.referenceNumber}
                        </div>
                      )}
                    </MuiTableCell>

                    <MuiTableCell className="font-mono text-xs text-slate-500">
                      {vch.date}
                    </MuiTableCell>

                    <MuiTableCell align="right">
                      <div
                        className={`font-mono font-bold text-sm ${
                          vch.voucherType === "CUSTOMER_PAYMENT"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {vch.voucherType === "CUSTOMER_PAYMENT" ? "+" : "-"}${vch.amountUSD.toLocaleString()} USD
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        ؋ {vch.amountAFN.toLocaleString()} AFN
                      </div>
                    </MuiTableCell>

                    <MuiTableCell align="center">
                      <MuiButton
                        variant="outlined"
                        size="small"
                        color="primary"
                        onClick={() => onSelectVoucher(vch)}
                        startIcon={<Printer className="h-3 w-3" />}
                      >
                        Print Voucher
                      </MuiButton>
                    </MuiTableCell>
                  </MuiTableRow>
                );
              })}
            </MuiTableBody>
          </MuiTable>
        </div>
      </MuiCard>
    </div>
  );
}
