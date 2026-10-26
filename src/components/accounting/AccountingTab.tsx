"use client";

import React, { useState } from "react";
import { useShowroomStore } from "@/store/useShowroomStore";
import {
  MuiButton,
  MuiChip,
  MuiTable,
  MuiTableHead,
  MuiTableBody,
  MuiTableRow,
  MuiTableCell,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@/components/mui";
import {
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";

export function AccountingTab({
  initialSubView = "pnl",
}: {
  initialSubView?: "pnl" | "coa" | "trial" | "journal";
} = {}) {
  const {
    accounts,
    journalEntries,
    sales,
    expenses,
    vehicles,
    exchangeRate,
    language,
    currentRole,
    deleteJournalEntry,
    addToast,
  } = useShowroomStore();
  const [deletingEntry, setDeletingEntry] = useState<any | null>(null);
  const [subView, setSubView] = useState<"pnl" | "coa" | "trial" | "journal">(initialSubView);

  const canManageRecords = currentRole === "SuperAdmin";

  // Calculate live financial statements using actual vehicle landed costs (no fabricated 0.86 fallback)
  const totalRevenueUSD = sales.reduce((acc, s) => acc + s.salePriceUSD, 0);

  const totalCogsUSD = sales.reduce((acc, s) => {
    const matchedVehicle = vehicles.find(
      (v) => v.stockNumber === s.stockNumber
    );
    if (!matchedVehicle) return acc;
    const computedCost =
      matchedVehicle.landedCost ||
      matchedVehicle.purchasePrice +
        matchedVehicle.freightCost +
        matchedVehicle.customsDuty +
        matchedVehicle.repairCost;
    return acc + computedCost;
  }, 0);

  const grossProfitUSD = totalRevenueUSD - totalCogsUSD;
  const grossMarginPercent =
    totalRevenueUSD > 0 ? ((grossProfitUSD / totalRevenueUSD) * 100).toFixed(1) : "0.0";

  // Operating Expenses Breakdown
  const operatingExpenses = expenses.filter((expense) => !expense.vehicleStock);

  const customsExpensesUSD = operatingExpenses
    .filter((e) => e.category === "Gomrok & Port Tariffs")
    .reduce((acc, e) => acc + e.amountUSD, 0);

  const transitExpensesUSD = operatingExpenses
    .filter((e) => e.category === "Transit & Ocean Freight")
    .reduce((acc, e) => acc + e.amountUSD, 0);

  const detailingExpensesUSD = operatingExpenses
    .filter((e) => e.category === "Vehicle Maintenance/Detailing")
    .reduce((acc, e) => acc + e.amountUSD, 0);

  const showroomOverheadUSD = operatingExpenses
    .filter(
      (e) =>
        e.category === "Showroom Overhead & Fuel" || e.category === "Staff Commissions"
    )
    .reduce((acc, e) => acc + e.amountUSD, 0);

  const totalOperatingExpensesUSD = operatingExpenses.reduce(
    (acc, e) => acc + e.amountUSD,
    0
  );
  const netOperatingProfitUSD = grossProfitUSD - totalOperatingExpensesUSD;
  const netOperatingProfitAFN = Math.round(netOperatingProfitUSD * exchangeRate);

  // Trial Balance Totals
  const totalDebits = accounts
    .filter((a) => a.type === "ASSET" || a.type === "EXPENSE")
    .reduce((acc, a) => acc + a.balanceUSD, 0);

  const totalCredits = accounts
    .filter((a) => a.type === "LIABILITY" || a.type === "EQUITY" || a.type === "REVENUE")
    .reduce((acc, a) => acc + a.balanceUSD, 0);

  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  const totalAssets = accounts
    .filter((a) => a.type === "ASSET")
    .reduce((acc, a) => acc + a.balanceUSD, 0);

  const totalLiabilities = accounts
    .filter((a) => a.type === "LIABILITY")
    .reduce((acc, a) => acc + a.balanceUSD, 0);

  const fxGainLossAFN = sales.reduce((acc, s) => {
    const lockedRate = s.exchangeRate || 70.5;
    return acc + Math.round(s.salePriceUSD * (exchangeRate - lockedRate));
  }, 0);
  const fxGainLossUSD = Math.round(fxGainLossAFN / (exchangeRate || 70.5));
  const avgLockedRate =
    sales.length > 0
      ? (sales.reduce((acc, s) => acc + (s.exchangeRate || 70.5), 0) / sales.length).toFixed(2)
      : exchangeRate.toFixed(2);

  const handleDeleteJournalEntry = async () => {
    if (!deletingEntry) return;
    try {
      await deleteJournalEntry(deletingEntry.id);
      addToast("Journal entry voided and removed", "success");
      setDeletingEntry(null);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Failed to void journal entry",
        "error"
      );
    }
  };

  const subViews = [
    {
      id: "pnl" as const,
      label:
        language === "fa"
          ? "صورت سود و زیان (P&L)"
          : language === "ps"
          ? "د ګټې او تاوان حساب"
          : "Income Statement (P&L)",
    },
    {
      id: "coa" as const,
      label:
        language === "fa"
          ? "کدینگ حساب‌ها"
          : language === "ps"
          ? "د حسابونو جدول"
          : "Chart of Accounts",
    },
    {
      id: "trial" as const,
      label:
        language === "fa"
          ? "تراز آزمایشی"
          : language === "ps"
          ? "ازمایښتي تراز"
          : "Trial Balance",
    },
    {
      id: "journal" as const,
      label:
        language === "fa"
          ? "دفتر روزنامه کل"
          : language === "ps"
          ? "عمومي ژورنال"
          : "General Ledger Entries",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Unified Enterprise Console Sub-navigation & Audit Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-200 dark:border-[#262F40]">
        <div className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 dark:border-[#262F40] bg-slate-50/80 dark:bg-[#0F141C] p-1">
          {subViews.map((sv) => (
            <button
              key={sv.id}
              type="button"
              onClick={() => setSubView(sv.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                subView === sv.id
                  ? "bg-primary text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {sv.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 font-mono">
          {isBalanced ? (
            <span className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
              <CheckCircle2 className="h-3 w-3" />
              DOUBLE-ENTRY BOOKS BALANCED
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/25">
              <AlertCircle className="h-3 w-3" />
              IMBALANCE DETECTED
            </span>
          )}
        </div>
      </div>

      {/* SUBVIEW 1: INCOME STATEMENT (P&L) */}
      {subView === "pnl" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-[#262F40] bg-slate-50/70 dark:bg-[#121722] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  {language === "fa"
                    ? "صورت حساب سود و زیان حسابرسی‌شده"
                    : language === "ps"
                    ? "تفتیش شوی د ګټې او تاوان راپور"
                    : "Audited Income Statement (P&L)"}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Realized vehicle sales, actual landed cost of goods sold, and Islam Qala customs overhead
                </p>
              </div>
              <span className="text-[10px] font-mono tabular-nums text-slate-400">
                RATE: 1 USD = {exchangeRate} AFN
              </span>
            </div>

            <div className="p-4 sm:p-5 divide-y divide-slate-200 dark:divide-[#262F40] text-xs">
              {/* Revenue Section */}
              <div className="py-2.5">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white text-xs mb-1.5">
                  <span>Operating Revenue (عواید عملیاتی)</span>
                  <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                    ${totalRevenueUSD.toLocaleString()} USD
                  </span>
                </div>
                <div className="ps-3 space-y-1 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between text-[11px]">
                    <span>Vehicle Sales Inflow ({sales.length} Executed Contracts)</span>
                    <span className="font-mono tabular-nums">
                      ${totalRevenueUSD.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* COGS Section */}
              <div className="py-2.5">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white text-xs mb-1.5">
                  <span>Cost of Goods Sold · COGS (بهای تمام‌شده)</span>
                  <span className="font-mono tabular-nums text-rose-600 dark:text-rose-400">
                    -${totalCogsUSD.toLocaleString()} USD
                  </span>
                </div>
                <div className="ps-3 space-y-1 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between text-[11px]">
                    <span>Actual Vehicle Landed Purchase Costs (قیمت خرید و ورود)</span>
                    <span className="font-mono tabular-nums">
                      -${totalCogsUSD.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Gross Profit Subtotal */}
              <div className="py-2.5 bg-slate-50 dark:bg-[#0F141C] px-3 rounded-lg border border-slate-200 dark:border-[#262F40] flex items-center justify-between font-bold text-slate-900 dark:text-white">
                <div>
                  <span className="text-xs">Gross Profit (سود ناخالص)</span>
                  <span className="ms-2 text-[10px] font-mono tabular-nums text-slate-400">
                    MARGIN: {grossMarginPercent}%
                  </span>
                </div>
                <span className="font-mono tabular-nums text-sm text-emerald-600 dark:text-emerald-400">
                  {grossProfitUSD >= 0 ? "+" : ""}${grossProfitUSD.toLocaleString()} USD
                </span>
              </div>

              {/* Operating Expenses Section */}
              <div className="py-2.5">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white text-xs mb-1.5">
                  <span>Operational & Import Overhead (مصارف عملیاتی)</span>
                  <span className="font-mono tabular-nums text-rose-600 dark:text-rose-400">
                    -${totalOperatingExpensesUSD.toLocaleString()} USD
                  </span>
                </div>
                <div className="ps-3 space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                  <div className="flex justify-between">
                    <span>Islam Qala Customs Duty & Tariffs (گمرک)</span>
                    <span className="font-mono tabular-nums">
                      -${customsExpensesUSD.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transit Trailers & Bandar Abbas Freight (ترانزیت)</span>
                    <span className="font-mono tabular-nums">
                      -${transitExpensesUSD.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mechanical Tuning, Detailing Polish & Parts</span>
                    <span className="font-mono tabular-nums">
                      -${detailingExpensesUSD.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Showroom Overhead, Solar Battery & Commissions</span>
                    <span className="font-mono tabular-nums">
                      -${showroomOverheadUSD.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Operating Income Total */}
              <div className="pt-3 border-t-2 border-primary/50 flex items-center justify-between font-bold text-slate-900 dark:text-white">
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                    NET OPERATING PROFIT (سود خالص)
                  </div>
                  <div className="text-[11px] font-mono tabular-nums text-slate-500">
                    ؋ {netOperatingProfitAFN.toLocaleString()} AFN
                  </div>
                </div>
                <div className="text-end">
                  <span
                    className={`font-mono tabular-nums text-lg ${
                      netOperatingProfitUSD >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {netOperatingProfitUSD >= 0 ? "+" : ""}$
                    {netOperatingProfitUSD.toLocaleString()} USD
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Balance Sheet & Sarrafi FX Rate Lock Analytics */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] shadow-xs overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-200 dark:border-[#262F40] bg-slate-50/70 dark:bg-[#121722]">
                <h4 className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider">
                  Balance Sheet Position (ترازنامه)
                </h4>
              </div>
              <div className="grid grid-cols-1 divide-y divide-slate-200 dark:divide-[#262F40] font-mono text-xs">
                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">
                      TOTAL ASSETS
                    </span>
                    <span className="text-[11px] text-slate-500 tabular-nums">
                      ؋ {(totalAssets * exchangeRate).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-base font-bold tabular-nums text-slate-900 dark:text-white">
                    ${totalAssets.toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">
                      ACCOUNTS PAYABLE (AP)
                    </span>
                    <span className="text-[11px] text-slate-500 tabular-nums">
                      ؋ {(totalLiabilities * exchangeRate).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-base font-bold tabular-nums text-rose-600 dark:text-rose-400">
                    ${totalLiabilities.toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 flex items-center justify-between bg-slate-50/70 dark:bg-[#121722]">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">
                    AVG PROFIT / UNIT
                  </span>
                  <span className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    +$
                    {sales.length > 0
                      ? Math.round(netOperatingProfitUSD / sales.length).toLocaleString()
                      : 0}{" "}
                    USD
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] shadow-xs overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-200 dark:border-[#262F40] bg-slate-50/70 dark:bg-[#121722] flex items-center justify-between">
                <span className="font-bold text-primary text-[11px] uppercase tracking-wider">
                  Sarrafi FX Rate Lock & Variance
                </span>
                <span className="text-[10px] font-mono text-slate-400">USD / AFN</span>
              </div>
              <div className="p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Avg Contract Rate Locked:</span>
                  <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                    {avgLockedRate} AFN
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Live Khorasan Desk Rate:</span>
                  <span className="font-bold text-primary tabular-nums">
                    {exchangeRate.toFixed(2)} AFN
                  </span>
                </div>
                <div className="pt-2.5 border-t border-slate-200 dark:border-[#262F40] flex items-center justify-between">
                  <span className="text-[10px] uppercase text-slate-400">
                    FX REVALUATION DELTA:
                  </span>
                  <span
                    className={`font-bold tabular-nums ${
                      fxGainLossAFN >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {fxGainLossAFN >= 0 ? "+" : ""}
                    {fxGainLossAFN.toLocaleString()} AFN ({fxGainLossUSD >= 0 ? "+" : ""}$
                    {fxGainLossUSD})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW 2: CHART OF ACCOUNTS (COA) — Fixed 6-column alignment */}
      {subView === "coa" && (
        <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-[#262F40] flex items-center justify-between bg-slate-50/70 dark:bg-[#121722]">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Chart of Accounts Master Registry (جدول کدینگ حسابات)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Standard double-entry accounting codes across Assets, Liabilities, Equity, Revenue, and Expenses.
              </p>
            </div>
            <span className="text-[11px] font-mono tabular-nums text-slate-400">
              {accounts.length} accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <MuiTable dense size="small" className="w-full">
              <MuiTableHead>
                <MuiTableRow hover={false}>
                  <MuiTableCell header>Code</MuiTableCell>
                  <MuiTableCell header>Account Name (EN & Dari)</MuiTableCell>
                  <MuiTableCell header>Type</MuiTableCell>
                  <MuiTableCell header align="right">
                    Debit (USD)
                  </MuiTableCell>
                  <MuiTableCell header align="right">
                    Credit (USD)
                  </MuiTableCell>
                  <MuiTableCell header align="right">
                    Net Balance
                  </MuiTableCell>
                </MuiTableRow>
              </MuiTableHead>
              <MuiTableBody>
                {accounts.map((acc) => {
                  const isDebit = acc.type === "ASSET" || acc.type === "EXPENSE";
                  return (
                    <MuiTableRow key={acc.code}>
                      <MuiTableCell className="font-mono font-bold text-xs text-primary tabular-nums">
                        {acc.code}
                      </MuiTableCell>

                      <MuiTableCell>
                        <div className="font-semibold text-slate-900 dark:text-white text-xs">
                          {acc.name}
                        </div>
                        <div className="text-[10px] text-slate-400">{acc.nameDari}</div>
                      </MuiTableCell>

                      <MuiTableCell>
                        <MuiChip
                          label={acc.type}
                          color={
                            acc.type === "ASSET"
                              ? "primary"
                              : acc.type === "LIABILITY"
                              ? "error"
                              : acc.type === "REVENUE"
                              ? "success"
                              : acc.type === "EXPENSE"
                              ? "warning"
                              : "info"
                          }
                          size="small"
                        />
                      </MuiTableCell>

                      <MuiTableCell align="right" className="font-mono tabular-nums text-xs">
                        {isDebit ? `$${acc.balanceUSD.toLocaleString()}` : "—"}
                      </MuiTableCell>

                      <MuiTableCell align="right" className="font-mono tabular-nums text-xs">
                        {!isDebit ? `$${acc.balanceUSD.toLocaleString()}` : "—"}
                      </MuiTableCell>

                      <MuiTableCell align="right">
                        <div className="font-mono tabular-nums font-bold text-xs text-slate-900 dark:text-white">
                          ${acc.balanceUSD.toLocaleString()} USD
                        </div>
                        <div className="text-[10px] font-mono tabular-nums text-slate-400">
                          ؋ {Math.round(acc.balanceUSD * exchangeRate).toLocaleString()} AFN
                        </div>
                      </MuiTableCell>
                    </MuiTableRow>
                  );
                })}
              </MuiTableBody>
            </MuiTable>
          </div>
        </div>
      )}

      {/* SUBVIEW 3: TRIAL BALANCE */}
      {subView === "trial" && (
        <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-[#262F40] flex items-center justify-between bg-slate-50/70 dark:bg-[#121722]">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Unadjusted Trial Balance (تراز آزمایشی کل)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Audit verification ensuring aggregate general ledger debits equal total credits.
              </p>
            </div>
            <div className="text-end">
              <span className="font-mono text-[11px] text-slate-400">
                Audit Status: {isBalanced ? "BALANCED" : "OUT OF BALANCE"}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <MuiTable dense size="small" className="w-full">
              <MuiTableHead>
                <MuiTableRow hover={false}>
                  <MuiTableCell header>Account Code</MuiTableCell>
                  <MuiTableCell header>Title</MuiTableCell>
                  <MuiTableCell header>Classification</MuiTableCell>
                  <MuiTableCell header align="right">
                    Debit (USD)
                  </MuiTableCell>
                  <MuiTableCell header align="right">
                    Credit (USD)
                  </MuiTableCell>
                </MuiTableRow>
              </MuiTableHead>
              <MuiTableBody>
                {accounts.map((acc) => {
                  const isDebit = acc.type === "ASSET" || acc.type === "EXPENSE";
                  return (
                    <MuiTableRow key={acc.code}>
                      <MuiTableCell className="font-mono tabular-nums font-bold text-xs text-primary">
                        {acc.code}
                      </MuiTableCell>
                      <MuiTableCell className="font-medium text-xs text-slate-900 dark:text-white">
                        {acc.name} ({acc.nameDari})
                      </MuiTableCell>
                      <MuiTableCell>
                        <span className="text-[10px] text-slate-500">{acc.type}</span>
                      </MuiTableCell>
                      <MuiTableCell
                        align="right"
                        className="font-mono tabular-nums text-xs font-semibold"
                      >
                        {isDebit ? `$${acc.balanceUSD.toLocaleString()}` : "—"}
                      </MuiTableCell>
                      <MuiTableCell
                        align="right"
                        className="font-mono tabular-nums text-xs font-semibold"
                      >
                        {!isDebit ? `$${acc.balanceUSD.toLocaleString()}` : "—"}
                      </MuiTableCell>
                    </MuiTableRow>
                  );
                })}

                <MuiTableRow
                  hover={false}
                  className="bg-slate-50 dark:bg-[#121722] font-bold"
                >
                  <MuiTableCell
                    colSpan={3}
                    className="text-xs uppercase tracking-wider text-slate-900 dark:text-white"
                  >
                    Total Trial Balance Verification
                  </MuiTableCell>
                  <MuiTableCell
                    align="right"
                    className="font-mono tabular-nums text-xs text-primary font-bold"
                  >
                    ${totalDebits.toLocaleString()}
                  </MuiTableCell>
                  <MuiTableCell
                    align="right"
                    className="font-mono tabular-nums text-xs text-primary font-bold"
                  >
                    ${totalCredits.toLocaleString()}
                  </MuiTableCell>
                </MuiTableRow>
              </MuiTableBody>
            </MuiTable>
          </div>
        </div>
      )}

      {/* SUBVIEW 4: GENERAL LEDGER JOURNAL ENTRIES */}
      {subView === "journal" && (
        <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-[#262F40] flex items-center justify-between bg-slate-50/70 dark:bg-[#121722]">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Journal Entries Audit Trail (دفتر روزنامه حسابداری)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Detailed transaction journal logging every vehicle sale, supplier payoff, and customs expense.
              </p>
            </div>
            <span className="text-[11px] font-mono tabular-nums text-slate-400">
              {journalEntries.length} postings
            </span>
          </div>

          <div className="overflow-x-auto">
            <MuiTable dense size="small" className="w-full">
              <MuiTableHead>
                <MuiTableRow hover={false}>
                  <MuiTableCell header>Entry #</MuiTableCell>
                  <MuiTableCell header>Date</MuiTableCell>
                  <MuiTableCell header>Memo / Description</MuiTableCell>
                  <MuiTableCell header>Account</MuiTableCell>
                  <MuiTableCell header align="right">
                    Debit (USD)
                  </MuiTableCell>
                  <MuiTableCell header align="right">
                    Credit (USD)
                  </MuiTableCell>
                  {canManageRecords && (
                    <MuiTableCell header align="center">
                      Action
                    </MuiTableCell>
                  )}
                </MuiTableRow>
              </MuiTableHead>
              <MuiTableBody>
                {journalEntries.map((je) => (
                  <React.Fragment key={je.id}>
                    <MuiTableRow>
                      <MuiTableCell className="font-mono tabular-nums font-bold text-xs text-primary">
                        {je.entryNumber}
                      </MuiTableCell>
                      <MuiTableCell className="font-mono tabular-nums text-[11px] text-slate-500">
                        {je.date}
                      </MuiTableCell>
                      <MuiTableCell className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                        {je.description}
                      </MuiTableCell>
                      <MuiTableCell className="text-xs font-mono text-slate-900 dark:text-white font-semibold">
                        {je.debitAccount}
                      </MuiTableCell>
                      <MuiTableCell
                        align="right"
                        className="font-mono tabular-nums text-xs text-emerald-600 dark:text-emerald-400 font-bold"
                      >
                        ${je.amountUSD.toLocaleString()}
                      </MuiTableCell>
                      <MuiTableCell align="right" className="font-mono text-xs text-slate-400">
                        —
                      </MuiTableCell>
                      {canManageRecords && (
                        <MuiTableCell align="center">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeletingEntry(je)}
                            title="Void Journal Entry"
                            aria-label={`Void journal entry ${je.entryNumber}`}
                            sx={{ p: "3px" }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </IconButton>
                        </MuiTableCell>
                      )}
                    </MuiTableRow>

                    <MuiTableRow className="border-b border-slate-200 dark:border-[#262F40]">
                      <MuiTableCell />
                      <MuiTableCell />
                      <MuiTableCell className="text-[10px] text-slate-400 italic">
                        {je.reference && `Ref: ${je.reference}`}
                      </MuiTableCell>
                      <MuiTableCell className="text-xs font-mono text-slate-500 ps-4">
                        ↳ {je.creditAccount}
                      </MuiTableCell>
                      <MuiTableCell align="right" className="font-mono text-xs text-slate-400">
                        —
                      </MuiTableCell>
                      <MuiTableCell
                        align="right"
                        className="font-mono tabular-nums text-xs text-rose-600 dark:text-rose-400 font-bold"
                      >
                        ${je.amountUSD.toLocaleString()}
                      </MuiTableCell>
                      {canManageRecords && <MuiTableCell />}
                    </MuiTableRow>
                  </React.Fragment>
                ))}
              </MuiTableBody>
            </MuiTable>
          </div>
        </div>
      )}

      {/* Delete/Void Journal Entry Dialog */}
      <Dialog
        open={Boolean(deletingEntry)}
        onClose={() => setDeletingEntry(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem" }}>
          Void Journal Entry ({deletingEntry?.entryNumber})
        </DialogTitle>
        <DialogContent>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to void and delete journal entry{" "}
            <strong className="text-slate-900 dark:text-white">
              {deletingEntry?.entryNumber}
            </strong>{" "}
            ({deletingEntry?.description} — ${deletingEntry?.amountUSD?.toLocaleString()}{" "}
            USD)? This action cannot be undone.
          </p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <MuiButton
            variant="outlined"
            color="inherit"
            onClick={() => setDeletingEntry(null)}
          >
            Cancel
          </MuiButton>
          <MuiButton
            variant="contained"
            color="error"
            onClick={handleDeleteJournalEntry}
          >
            Void Entry
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
