"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useShowroomStore } from "@/store/useShowroomStore";
import { formatCurrency } from "@/lib/utils";
import { InvoicesTab } from "@/components/accounting/InvoicesTab";
import { SuppliersTab } from "@/components/accounting/SuppliersTab";
import { PaymentsTab } from "@/components/accounting/PaymentsTab";
import { ExpensesTab } from "@/components/accounting/ExpensesTab";
import { AccountingTab } from "@/components/accounting/AccountingTab";
import { MuiButton } from "@/components/mui";
import {
  Scale,
  Landmark,
  Receipt,
  FileCheck2,
  Building2,
  DollarSign,
  Printer,
  Plus,
} from "lucide-react";

export default function AccountingHubPage() {
  const {
    sales,
    expenses,
    vehicles,
    accounts,
    currency,
    exchangeRate,
    language,
    currentRole,
    branding,
  } = useShowroomStore();

  const [activeTab, setActiveTab] = useState("0");

  const localizedDealershipName =
    language === "fa"
      ? branding.dealershipNameFa || branding.dealershipName
      : language === "ps"
      ? branding.dealershipNamePs || branding.dealershipName
      : branding.dealershipName;

  // Financial aggregates using actual vehicle landed costs (no fabricated 0.86 fallback)
  const totalRevenueUSD = sales.reduce((acc, s) => acc + s.salePriceUSD, 0);
  const totalCogsUSD = sales.reduce((acc, s) => {
    const matchedVehicle = vehicles.find(
      (v) => v.stockNumber === s.stockNumber
    );
    if (!matchedVehicle) return acc;
    const cost =
      matchedVehicle.landedCost ||
      matchedVehicle.purchasePrice +
        matchedVehicle.freightCost +
        matchedVehicle.customsDuty +
        matchedVehicle.repairCost;
    return acc + cost;
  }, 0);
  const grossProfitUSD = totalRevenueUSD - totalCogsUSD;
  const totalExpensesUSD = expenses.reduce((acc, e) => acc + e.amountUSD, 0);
  const operatingExpensesUSD = expenses
    .filter((expense) => !expense.vehicleStock)
    .reduce((acc, expense) => acc + expense.amountUSD, 0);
  const netProfitUSD = grossProfitUSD - operatingExpensesUSD;

  const cashAccounts = accounts.filter(
    (a) => a.code.startsWith("101") || a.code.startsWith("102")
  );
  const totalCashUSD = cashAccounts.reduce((acc, a) => acc + a.balanceUSD, 0);

  const tabsConfig = [
    {
      label:
        language === "ps"
          ? "مالي عمومي راپور (P&L)"
          : language === "fa"
          ? "صورت مالی و سود و زیان"
          : "P&L & Financial Cockpit",
      icon: Scale,
    },
    {
      label:
        language === "ps"
          ? "رسمي فاکتورونه"
          : language === "fa"
          ? "فاکتورهای تجاری"
          : "Commercial Invoices",
      icon: Receipt,
    },
    {
      label:
        language === "ps"
          ? "د صرافۍ حوالې او واوچرونه"
          : language === "fa"
          ? "حواله‌های صرافی و پرداخت"
          : "Payment & Sarrafi Vouchers",
      icon: FileCheck2,
    },
    {
      label:
        language === "ps"
          ? "سپلایران او عرضه کوونکي"
          : language === "fa"
          ? "حساب‌های تأمین‌کنندگان"
          : "Suppliers & Car Importers",
      icon: Building2,
    },
    {
      label:
        language === "ps"
          ? "مصارف او ګمرک"
          : language === "fa"
          ? "مصارف جاری و گمرکات"
          : "Operating & Customs Expenses",
      icon: DollarSign,
    },
    {
      label:
        language === "ps"
          ? "د حسابونو لارښود او ژورنال"
          : language === "fa"
          ? "دفتر کل و ژورنال دوبل"
          : "General Ledger & CoA",
      icon: Landmark,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Enterprise Accounting Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-slate-200 dark:border-[#262F40]">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>{localizedDealershipName} · Khorasan Sarrafi Desk</span>
            <span>·</span>
            <span className="font-mono text-primary font-semibold">
              Bilingual Double-Entry Ledger
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {language === "ps"
              ? "د نندارتون د محاسبې او مالي چارو مرکز"
              : language === "fa"
              ? "مرکز جامع حسابداری، صرافی و امور مالی"
              : "Dealership Accounting & Sarrafi Finance Hub"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Multi-currency Hawala settlements, Islam Qala customs tariffs & audited vehicle profitability
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <MuiButton
            variant="outlined"
            size="small"
            onClick={() => window.print()}
            startIcon={<Printer className="h-4 w-4" />}
          >
            {language === "fa"
              ? "چاپ گزارش"
              : language === "ps"
              ? "راپور چاپ"
              : "Print Report"}
          </MuiButton>
          {currentRole === "SuperAdmin" && (
            <Link href="/intake">
              <MuiButton
                variant="contained"
                size="small"
                startIcon={<Plus className="h-4 w-4" />}
              >
                {language === "fa"
                  ? "ثبت موتر جدید"
                  : language === "ps"
                  ? "نوی موټر"
                  : "Intake Stock"}
              </MuiButton>
            </Link>
          )}
        </div>
      </div>

      {/* 1px Hairline Financial Ledger Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 dark:bg-[#262F40] border border-slate-200 dark:border-[#262F40] rounded-xl overflow-hidden">
        {/* Cell 1: Gross Revenue */}
        <div className="bg-white dark:bg-[#161B26] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>
              {language === "fa"
                ? "۰۱. عواید ناخالص فروش"
                : language === "ps"
                ? "۰۱. ناخالص عواید"
                : "01. Gross Revenue"}
            </span>
            <span className="font-mono text-[11px] text-primary">REV</span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalRevenueUSD, currency, exchangeRate)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#262F40] flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Liquidated units</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {sales.length} sold
            </span>
          </div>
        </div>

        {/* Cell 2: Net Profit */}
        <div className="bg-white dark:bg-[#161B26] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>
              {language === "fa"
                ? "۰۲. سود خالص عملیاتی"
                : language === "ps"
                ? "۰۲. خالصه عملیاتي ګټه"
                : "02. Net Operating Profit"}
            </span>
            <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
              EBITDA
            </span>
          </div>
          <div
            className={`mt-2 text-2xl font-bold font-mono tabular-nums tracking-tight ${
              netProfitUSD >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {formatCurrency(netProfitUSD, currency, exchangeRate)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#262F40] flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Net margin ratio</span>
            <span className="font-bold text-slate-900 dark:text-white tabular-nums">
              {totalRevenueUSD > 0 ? ((netProfitUSD / totalRevenueUSD) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>

        {/* Cell 3: Sarrafi Cash */}
        <div className="bg-white dark:bg-[#161B26] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>
              {language === "fa"
                ? "۰۳. موجودی صرافی و صندوق"
                : language === "ps"
                ? "۰۳. د صرافۍ او خزانې نغدې"
                : "03. Sarrafi & Vault Liquidity"}
            </span>
            <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400">
              CASH
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalCashUSD, currency, exchangeRate)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#262F40] flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Desk settlement</span>
            <span className="text-slate-700 dark:text-slate-300">Khorasan + Safe</span>
          </div>
        </div>

        {/* Cell 4: Customs & Overheads */}
        <div className="bg-white dark:bg-[#161B26] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>
              {language === "fa"
                ? "۰۴. مصارف گمرکی و جاری"
                : language === "ps"
                ? "۰۴. ګمرکي او جاري مصارف"
                : "04. Customs & Overheads"}
            </span>
            <span className="font-mono text-[11px] text-rose-600 dark:text-rose-400">
              OPEX
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400 tracking-tight">
            {formatCurrency(totalExpensesUSD, currency, exchangeRate)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#262F40] flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Audited vouchers</span>
            <span className="font-bold text-slate-900 dark:text-white tabular-nums">
              {expenses.length} entries
            </span>
          </div>
        </div>
      </div>

      {/* Institutional Ledger Container */}
      <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] overflow-hidden">
        <div className="px-3 sm:px-5 border-b border-slate-200 dark:border-[#262F40] bg-slate-50/70 dark:bg-[#121722] overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-5 shrink-0">
            {tabsConfig.map((tab, idx) => {
              const isActive = activeTab === String(idx);
              const Icon = tab.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveTab(String(idx))}
                  className={`py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-3 sm:p-5">
          {activeTab === "0" && <AccountingTab initialSubView="pnl" />}
          {activeTab === "1" && <InvoicesTab />}
          {activeTab === "2" && <PaymentsTab />}
          {activeTab === "3" && <SuppliersTab />}
          {activeTab === "4" && <ExpensesTab />}
          {activeTab === "5" && <AccountingTab initialSubView="coa" />}
        </div>
      </div>
    </div>
  );
}
