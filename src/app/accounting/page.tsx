"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { formatCurrency } from "@/lib/utils";
import { InvoicesTab } from "@/components/accounting/InvoicesTab";
import { SuppliersTab } from "@/components/accounting/SuppliersTab";
import { PaymentsTab } from "@/components/accounting/PaymentsTab";
import { ExpensesTab } from "@/components/accounting/ExpensesTab";
import { AccountingTab } from "@/components/accounting/AccountingTab";
import {
  MuiCard,
  MuiCardContent,
  MuiButton,
  MuiChip,
  MuiTabs,
} from "@/components/mui";
import {
  Scale,
  Landmark,
  Receipt,
  FileCheck2,
  Building2,
  DollarSign,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Printer,
  FileSpreadsheet,
  Plus,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function AccountingHubPage() {
  const {
    sales,
    expenses,
    vehicles,
    suppliers,
    invoices,
    payments,
    accounts,
    currency,
    exchangeRate,
    language,
    currentRole,
  } = useShowroomStore();

  const t = translations[language];
  const [activeTab, setActiveTab] = useState("0");

  // Financial aggregates
  const totalRevenueUSD = sales.reduce((acc, s) => acc + s.salePriceUSD, 0);
  const totalCogsUSD = sales.reduce((acc, s) => {
    const matchedVehicle = vehicles.find((v) => v.stockNumber === s.stockNumber);
    return acc + (matchedVehicle ? matchedVehicle.landedCost : s.salePriceUSD * 0.86);
  }, 0);
  const grossProfitUSD = totalRevenueUSD - totalCogsUSD;
  const totalExpensesUSD = expenses.reduce((acc, e) => acc + e.amountUSD, 0);
  const operatingExpensesUSD = expenses
    .filter((expense) => !expense.vehicleStock)
    .reduce((acc, expense) => acc + expense.amountUSD, 0);
  const netProfitUSD = grossProfitUSD - operatingExpensesUSD;

  // Sarrafi Hawala Balance & Cash In Hand
  const cashAccounts = accounts.filter((a) => a.code.startsWith("101") || a.code.startsWith("102"));
  const totalCashUSD = cashAccounts.reduce((acc, a) => acc + a.balanceUSD, 0);

  const tabsConfig = [
    { label: language === "ps" ? "مالي عمومي راپور (P&L)" : language === "fa" ? "صورت مالی و سود و زیان" : "P&L & Financial Cockpit", icon: Scale },
    { label: language === "ps" ? "رسمي فاکتورونه" : language === "fa" ? "فاکتورهای تجاری" : "Commercial Invoices", icon: Receipt },
    { label: language === "ps" ? "د صرافۍ حوالې او واوچرونه" : language === "fa" ? "حواله‌های صرافی و پرداخت" : "Payment & Sarrafi Vouchers", icon: FileCheck2 },
    { label: language === "ps" ? "سپلایران او عرضه کوونکي" : language === "fa" ? "حساب‌های تأمین‌کنندگان" : "Suppliers & Car Importers", icon: Building2 },
    { label: language === "ps" ? "مصارف او ګمرک" : language === "fa" ? "مصارف جاری و گمرکات" : "Operating & Customs Expenses", icon: DollarSign },
    { label: language === "ps" ? "د حسابونو لارښود او ژورنال" : language === "fa" ? "دفتر کل و ژورنال دوبل" : "General Ledger & CoA", icon: Landmark },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Architectural Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-[#D8D5CD] dark:border-[#242A38]">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-1">
            <span>KHORASAN SARRAFI MARKET · DESK #14</span>
            <span>·</span>
            <span className="text-[#111318] dark:text-amber-400 font-bold">
              BILINGUAL DOUBLE-ENTRY LEDGER
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111318] dark:text-white">
            {language === "ps"
              ? "د نندارتون د محاسبې او مالي چارو مرکز"
              : language === "fa"
              ? "مرکز جامع حسابداری، صرافی و امور مالی"
              : "Dealership Accounting & Sarrafi Finance Hub"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === "ps"
              ? "د هرات صرافۍ مارکېټ حوالې، د اسلام قلعه ګمرکي لګښتونه، او د موټرونو ګټه او تاوان"
              : language === "fa"
              ? "مدیریت حواله‌های مارکیت صرافی خراسان، گمرکات اسلام قلعه و صورت سود و زیان نمایشگاه"
              : "Multi-currency Hawala settlements, Islam Qala customs tariffs & audited vehicle profitability"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <MuiButton
            variant="outlined"
            size="small"
            onClick={() => window.print()}
            startIcon={<Printer className="h-4 w-4" />}
          >
            {language === "ps" ? "چاپ / پرنټ" : language === "fa" ? "چاپ گزارش" : "Print Report"}
          </MuiButton>
          <Link href="/intake">
            <MuiButton
              variant="contained"
              size="small"
              startIcon={<Plus className="h-4 w-4" />}
            >
              {language === "ps" ? "نوی موټر ثبت کړئ" : language === "fa" ? "ثبت موتر جدید" : "Intake Stock"}
            </MuiButton>
          </Link>
        </div>
      </div>

      {/* Architectural 1px Hairline Financial Ledger Strip (Replaces Generic Blurred-Orb KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#D8D5CD] dark:bg-[#242A38] border border-[#D8D5CD] dark:border-[#242A38] rounded-md overflow-hidden">
        {/* Cell 1: Gross Revenue */}
        <div className="bg-white dark:bg-[#11141B] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            <span>{language === "ps" ? "مجموعي عواید" : language === "fa" ? "مجموع عواید فروش" : "01 / GROSS REVENUE"}</span>
            <span className="text-[#111318] dark:text-amber-400 font-bold">REV</span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-[#111318] dark:text-white tracking-tight">
            {formatCurrency(totalRevenueUSD, currency, exchangeRate)}
          </div>
          <div className="mt-2 pt-2 border-t border-[#E2E0D8] dark:border-[#1F2430] flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>LIQUIDATED UNITS</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {sales.length} SOLD
            </span>
          </div>
        </div>

        {/* Cell 2: Net Profit */}
        <div className="bg-white dark:bg-[#11141B] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            <span>{language === "ps" ? "خالصه ګټه" : language === "fa" ? "سود خالص عملیاتی" : "02 / NET OPERATING PROFIT"}</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">EBITDA</span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400 tracking-tight">
            {formatCurrency(netProfitUSD, currency, exchangeRate)}
          </div>
          <div className="mt-2 pt-2 border-t border-[#E2E0D8] dark:border-[#1F2430] flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>NET MARGIN RATIO</span>
            <span className="font-bold text-[#111318] dark:text-white tabular-nums">
              {totalRevenueUSD > 0 ? ((netProfitUSD / totalRevenueUSD) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>

        {/* Cell 3: Sarrafi Cash */}
        <div className="bg-white dark:bg-[#11141B] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            <span>{language === "ps" ? "د صرافۍ او نغدو موجودي" : language === "fa" ? "موجودی صرافی و صندوق" : "03 / SARRAFI & VAULT LIQUIDITY"}</span>
            <span className="text-amber-700 dark:text-amber-400 font-bold">CASH</span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-[#111318] dark:text-white tracking-tight">
            {formatCurrency(totalCashUSD, currency, exchangeRate)}
          </div>
          <div className="mt-2 pt-2 border-t border-[#E2E0D8] dark:border-[#1F2430] flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>DESK SETTLEMENT</span>
            <span className="text-[#111318] dark:text-slate-300">KHORASAN + SAFE</span>
          </div>
        </div>

        {/* Cell 4: Customs & Overheads */}
        <div className="bg-white dark:bg-[#11141B] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            <span>{language === "ps" ? "د ګمرک او اداري لګښتونه" : language === "fa" ? "مجموع مصارف و گمرکات" : "04 / CUSTOMS & OVERHEADS"}</span>
            <span className="text-rose-700 dark:text-rose-400 font-bold">OPEX</span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-rose-700 dark:text-rose-400 tracking-tight">
            {formatCurrency(totalExpensesUSD, currency, exchangeRate)}
          </div>
          <div className="mt-2 pt-2 border-t border-[#E2E0D8] dark:border-[#1F2430] flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>AUDITED VOUCHERS</span>
            <span className="font-bold text-[#111318] dark:text-white tabular-nums">
              {expenses.length} ENTRIES
            </span>
          </div>
        </div>
      </div>

      {/* Institutional Ledger Container */}
      <div className="rounded-md border border-[#D8D5CD] dark:border-[#242A38] bg-white dark:bg-[#11141B] overflow-hidden">
        {/* Underlined Architectural Tab Strip */}
        <div className="px-3 sm:px-5 border-b border-[#E2E0D8] dark:border-[#1F2430] bg-[#FAF9F6] dark:bg-[#0D1017] overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-5 shrink-0">
            {tabsConfig.map((t, idx) => {
              const isActive = activeTab === String(idx);
              const Icon = t.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveTab(String(idx))}
                  className={`py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isActive
                      ? "border-[#111318] dark:border-amber-500 text-[#111318] dark:text-white"
                      : "border-transparent text-slate-500 hover:text-[#111318] dark:hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Panes */}
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
