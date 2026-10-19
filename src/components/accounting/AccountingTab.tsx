"use client";

import React, { useState } from "react";
import { useShowroomStore } from "@/store/useShowroomStore";
import {
  MuiCard,
  MuiButton,
  MuiChip,
  MuiTable,
  MuiTableHead,
  MuiTableBody,
  MuiTableRow,
  MuiTableCell,
} from "@/components/mui";
import {
  Landmark,
  Scale,
  TrendingUp,
  BookOpen,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
} from "lucide-react";

export function AccountingTab({
  initialSubView = "pnl",
}: {
  initialSubView?: "pnl" | "coa" | "trial" | "journal";
} = {}) {
  const { accounts, journalEntries, sales, expenses, vehicles, exchangeRate } = useShowroomStore();
  const [subView, setSubView] = useState<"pnl" | "coa" | "trial" | "journal">(initialSubView);

  // Calculate live financial statements
  const totalRevenueUSD = sales.reduce((acc, s) => acc + s.salePriceUSD, 0);

  // Landed Cost of Goods Sold for sold vehicles (or standard 85% of price if mock)
  const totalCogsUSD = sales.reduce((acc, s) => {
    const matchedVehicle = vehicles.find((v) => v.stockNumber === s.stockNumber);
    return acc + (matchedVehicle ? matchedVehicle.landedCost : s.salePriceUSD * 0.86);
  }, 0);

  const grossProfitUSD = totalRevenueUSD - totalCogsUSD;
  const grossMarginPercent = totalRevenueUSD > 0 ? ((grossProfitUSD / totalRevenueUSD) * 100).toFixed(1) : "0.0";

  // Operating Expenses Breakdown
  const customsExpensesUSD = expenses
    .filter((e) => e.category === "Gomrok & Port Tariffs")
    .reduce((acc, e) => acc + e.amountUSD, 0);

  const transitExpensesUSD = expenses
    .filter((e) => e.category === "Transit & Ocean Freight")
    .reduce((acc, e) => acc + e.amountUSD, 0);

  const detailingExpensesUSD = expenses
    .filter((e) => e.category === "Vehicle Maintenance/Detailing")
    .reduce((acc, e) => acc + e.amountUSD, 0);

  const showroomOverheadUSD = expenses
    .filter((e) => e.category === "Showroom Overhead & Fuel" || e.category === "Staff Commissions")
    .reduce((acc, e) => acc + e.amountUSD, 0);

  const totalOperatingExpensesUSD = expenses.reduce((acc, e) => acc + e.amountUSD, 0);
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

  // Total Assets
  const totalAssets = accounts
    .filter((a) => a.type === "ASSET")
    .reduce((acc, a) => acc + a.balanceUSD, 0);

  // Total Liabilities
  const totalLiabilities = accounts
    .filter((a) => a.type === "LIABILITY")
    .reduce((acc, a) => acc + a.balanceUSD, 0);

  return (
    <div className="space-y-4">
      {/* Top Executive Balance Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800/90 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Assets (دارایی‌های کل)
            </span>
            <span className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
              <Landmark className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-1.5 text-xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
            ${totalAssets.toLocaleString()}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500 font-mono">
            ؋ {(totalAssets * exchangeRate).toLocaleString()} AFN
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800/90 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Accounts Payable (بدهی)
            </span>
            <span className="p-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-1.5 text-xl font-extrabold font-mono text-rose-600 dark:text-rose-400 tracking-tight">
            ${totalLiabilities.toLocaleString()}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500 font-mono">
            ؋ {(totalLiabilities * exchangeRate).toLocaleString()} AFN
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800/90 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Gross Sales (فروش ناخالص)
            </span>
            <span className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
              <TrendingUp className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-1.5 text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
            +${totalRevenueUSD.toLocaleString()}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {sales.length} title deeds executed
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800/90 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Net Profit (مفاد خالص)
            </span>
            <span className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
              <Scale className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-1.5 text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
            +${netOperatingProfitUSD.toLocaleString()}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500 font-mono">
            ؋ {netOperatingProfitAFN.toLocaleString()} AFN
          </p>
        </div>
      </div>

      {/* Sub-navigation Segmented Control */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1">
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 shrink-0">
          <button
            type="button"
            onClick={() => setSubView("pnl")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              subView === "pnl"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Income Statement (P&L)
          </button>
          <button
            type="button"
            onClick={() => setSubView("coa")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              subView === "coa"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Chart of Accounts
          </button>
          <button
            type="button"
            onClick={() => setSubView("trial")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              subView === "trial"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Trial Balance
          </button>
          <button
            type="button"
            onClick={() => setSubView("journal")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              subView === "journal"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            General Ledger Entries
          </button>
        </div>

        {/* Trial Balance Audit Indicator */}
        <div className="flex items-center gap-2">
          {isBalanced ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
              <CheckCircle2 className="h-3 w-3" />
              Books Balanced
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40">
              <AlertCircle className="h-3 w-3" />
              Imbalance Detected
            </span>
          )}
        </div>
      </div>

      {/* SUBVIEW 1: INCOME STATEMENT (P&L) */}
      {subView === "pnl" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#121824] shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Showroom Income Statement (صورت حساب سود و زیان)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Financial period covering realized sales, vehicle landed costs, and import overhead.
              </p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {/* Revenue Section */}
              <div className="py-2.5">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white text-xs mb-1.5">
                  <span>Operating Revenue (عواید عملیاتی)</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    ${totalRevenueUSD.toLocaleString()} USD
                  </span>
                </div>
                <div className="pl-3 space-y-1 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between text-[11px]">
                    <span>Vehicle Sales Inflow (فروش موترها)</span>
                    <span className="font-mono">${totalRevenueUSD.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* COGS Section */}
              <div className="py-2.5">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white text-xs mb-1.5">
                  <span>Cost of Goods Sold - COGS (بهای تمام‌شده)</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400">
                    -${totalCogsUSD.toLocaleString()} USD
                  </span>
                </div>
                <div className="pl-3 space-y-1 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between text-[11px]">
                    <span>Vehicle Landed Purchase Costs (قیمت خرید و ورود)</span>
                    <span className="font-mono">-${totalCogsUSD.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Gross Profit Subtotal */}
              <div className="py-2.5 bg-slate-50 dark:bg-[#101622] px-3 rounded-xl flex items-center justify-between font-bold text-slate-900 dark:text-white">
                <div>
                  <span className="text-xs">Gross Profit (سود ناخالص)</span>
                  <span className="ml-2 text-[10px] font-normal text-slate-400">
                    Margin: {grossMarginPercent}%
                  </span>
                </div>
                <span className="font-mono text-sm text-emerald-600 dark:text-emerald-400">
                  +${grossProfitUSD.toLocaleString()} USD
                </span>
              </div>

              {/* Operating Expenses Section */}
              <div className="py-2.5">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white text-xs mb-1.5">
                  <span>Operational & Import Overhead (مصارف عملیاتی)</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400">
                    -${totalOperatingExpensesUSD.toLocaleString()} USD
                  </span>
                </div>
                <div className="pl-3 space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                  <div className="flex justify-between">
                    <span>Islam Qala Customs Duty & Tariffs (گمرک)</span>
                    <span className="font-mono">-${customsExpensesUSD.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transit Trailers & Bandar Abbas Freight (ترانزیت)</span>
                    <span className="font-mono">-${transitExpensesUSD.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mechanical Tuning, Detailing Polish & Parts</span>
                    <span className="font-mono">-${detailingExpensesUSD.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Showroom Overhead, Solar Battery & Commissions</span>
                    <span className="font-mono">-${showroomOverheadUSD.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Net Operating Income Total */}
              <div className="pt-3 border-t-2 border-slate-200 dark:border-slate-700 flex items-center justify-between font-bold text-slate-900 dark:text-white">
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                    Net Operating Profit (سود خالص)
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    ؋ {netOperatingProfitAFN.toLocaleString()} AFN
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-lg text-emerald-600 dark:text-emerald-400">
                    +${netOperatingProfitUSD.toLocaleString()} USD
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick P&L Metrics Widget */}
          <div className="lg:col-span-4 space-y-3">
            <div className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#121824] shadow-xs space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Dealership Profitability Insights
              </h4>

              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between text-slate-500 mb-1 text-[11px]">
                    <span>Gross Profit Margin</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{grossMarginPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${Math.min(Number(grossMarginPercent) * 2, 100)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-500 mb-1 text-[11px]">
                    <span>Customs Tariff Burden</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {totalRevenueUSD > 0 ? ((customsExpensesUSD / totalRevenueUSD) * 100).toFixed(1) : 0}% of Rev
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: "24%" }} />
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500">Average Profit Per Vehicle:</div>
                  <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    +${sales.length > 0 ? Math.round(netOperatingProfitUSD / sales.length).toLocaleString() : 0} USD
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW 2: CHART OF ACCOUNTS (COA) */}
      {subView === "coa" && (
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#111827] shadow-xs overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-slate-200/90 dark:border-slate-800/90 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Chart of Accounts Master Registry (جدول کدینگ حسابات)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Standard double-entry accounting codes across Assets, Liabilities, Equity, Revenue, and Expenses.
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
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
                  <MuiTableCell header align="right">Debit (USD)</MuiTableCell>
                  <MuiTableCell header align="right">Credit (USD)</MuiTableCell>
                  <MuiTableCell header align="right">Net Balance</MuiTableCell>
                </MuiTableRow>
              </MuiTableHead>
              <MuiTableBody>
                {accounts.map((acc) => {
                  const isDebit = acc.type === "ASSET" || acc.type === "EXPENSE";
                  return (
                    <MuiTableRow key={acc.code}>
                      <MuiTableCell className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                        {acc.code}
                      </MuiTableCell>

                      <MuiTableCell>
                        <div className="font-semibold text-slate-900 dark:text-white text-xs">
                          {acc.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {acc.nameDari}
                        </div>
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

                      <MuiTableCell align="right" className="font-mono text-xs">
                        {isDebit ? `$${acc.balanceUSD.toLocaleString()}` : "—"}
                      </MuiTableCell>

                      <MuiTableCell align="right" className="font-mono text-xs">
                        {!isDebit ? `$${acc.balanceUSD.toLocaleString()}` : "—"}
                      </MuiTableCell>

                      <MuiTableCell align="right">
                        <div className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                          ${acc.balanceUSD.toLocaleString()} USD
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
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
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#111827] shadow-xs overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-slate-200/90 dark:border-slate-800/90 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Unadjusted Trial Balance (تراز آزمایشی کل)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Audit verification ensuring aggregate general ledger debits equal total credits.
              </p>
            </div>
            <div className="text-right">
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
                  <MuiTableCell header align="right">Debit (USD)</MuiTableCell>
                  <MuiTableCell header align="right">Credit (USD)</MuiTableCell>
                </MuiTableRow>
              </MuiTableHead>
              <MuiTableBody>
                {accounts.map((acc) => {
                  const isDebit = acc.type === "ASSET" || acc.type === "EXPENSE";
                  return (
                    <MuiTableRow key={acc.code}>
                      <MuiTableCell className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                        {acc.code}
                      </MuiTableCell>
                      <MuiTableCell className="font-medium text-xs text-slate-900 dark:text-white">
                        {acc.name} ({acc.nameDari})
                      </MuiTableCell>
                      <MuiTableCell>
                        <span className="text-[10px] text-slate-500">{acc.type}</span>
                      </MuiTableCell>
                      <MuiTableCell align="right" className="font-mono text-xs font-semibold">
                        {isDebit ? `$${acc.balanceUSD.toLocaleString()}` : "—"}
                      </MuiTableCell>
                      <MuiTableCell align="right" className="font-mono text-xs font-semibold">
                        {!isDebit ? `$${acc.balanceUSD.toLocaleString()}` : "—"}
                      </MuiTableCell>
                    </MuiTableRow>
                  );
                })}

                {/* Trial Balance Footer Row */}
                <MuiTableRow hover={false} className="bg-slate-100/70 dark:bg-[#1a2234] font-bold">
                  <MuiTableCell colSpan={3} className="text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                    Total Trial Balance Verification
                  </MuiTableCell>
                  <MuiTableCell align="right" className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">
                    ${totalDebits.toLocaleString()}
                  </MuiTableCell>
                  <MuiTableCell align="right" className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">
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
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#111827] shadow-xs overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-slate-200/90 dark:border-slate-800/90 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Journal Entries Audit Trail (دفتر روزنامه حسابداری)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Detailed transaction journal logging every vehicle sale, supplier payoff, and customs expense.
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
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
                  <MuiTableCell header align="right">Debit (USD)</MuiTableCell>
                  <MuiTableCell header align="right">Credit (USD)</MuiTableCell>
                </MuiTableRow>
              </MuiTableHead>
              <MuiTableBody>
                {journalEntries.map((je) => (
                  <React.Fragment key={je.id}>
                    {/* Debit Line */}
                    <MuiTableRow>
                      <MuiTableCell className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                        {je.entryNumber}
                      </MuiTableCell>
                      <MuiTableCell className="font-mono text-[11px] text-slate-500">
                        {je.date}
                      </MuiTableCell>
                      <MuiTableCell className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                        {je.description}
                      </MuiTableCell>
                      <MuiTableCell className="text-xs font-mono text-slate-900 dark:text-white font-semibold">
                        {je.debitAccount}
                      </MuiTableCell>
                      <MuiTableCell align="right" className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                        ${je.amountUSD.toLocaleString()}
                      </MuiTableCell>
                      <MuiTableCell align="right" className="font-mono text-xs text-slate-400">
                        —
                      </MuiTableCell>
                    </MuiTableRow>

                    {/* Credit Line */}
                    <MuiTableRow className="border-b border-slate-200 dark:border-slate-800">
                      <MuiTableCell></MuiTableCell>
                      <MuiTableCell></MuiTableCell>
                      <MuiTableCell className="text-[10px] text-slate-400 italic">
                        {je.reference && `Ref: ${je.reference}`}
                      </MuiTableCell>
                      <MuiTableCell className="text-xs font-mono text-slate-500 pl-4">
                        ↳ {je.creditAccount}
                      </MuiTableCell>
                      <MuiTableCell align="right" className="font-mono text-xs text-slate-400">
                        —
                      </MuiTableCell>
                      <MuiTableCell align="right" className="font-mono text-xs text-rose-600 dark:text-rose-400 font-bold">
                        ${je.amountUSD.toLocaleString()}
                      </MuiTableCell>
                    </MuiTableRow>
                  </React.Fragment>
                ))}
              </MuiTableBody>
            </MuiTable>
          </div>
        </div>
      )}
    </div>
  );
}
