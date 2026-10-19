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
  const netProfitUSD = grossProfitUSD - totalExpensesUSD;

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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Scale className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                {language === "ps"
                  ? "د نندارتون د محاسبې او مالي چارو مرکز"
                  : language === "fa"
                  ? "مرکز جامع حسابداری، صرافی و امور مالی"
                  : "Dealership Accounting & Sarrafi Finance Hub"}
                <MuiChip label="Bilingual GAAP" size="small" color="primary" />
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === "ps"
                  ? "د هرات صرافۍ مارکېټ حوالې، د اسلام قلعه ګمرکي لګښتونه، او د موټرونو ګټه او تاوان"
                  : language === "fa"
                  ? "مدیریت حواله‌های مارکیت صرافی خراسان، گمرکات اسلام قلعه و صورت سود و زیان نمایشگاه"
                  : "Multi-currency Hawala settlements, Islam Qala customs tariffs & audited vehicle profitability"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
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

      {/* Top 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Gross Revenue */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800/90 shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 end-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {language === "ps" ? "مجموعي عواید" : language === "fa" ? "مجموع عواید فروش" : "Gross Revenue"}
            </span>
            <span className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalRevenueUSD, currency, exchangeRate)}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium flex items-center gap-1 font-mono">
            <TrendingUp className="h-3 w-3" />
            <span>{sales.length} {language === "ps" ? "پلورل شوي موټرونه" : language === "fa" ? "موتر فروخته شده" : "units liquidated"}</span>
          </div>
        </div>

        {/* Card 2: Net Profit */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800/90 shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 end-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {language === "ps" ? "خالصه ګټه" : language === "fa" ? "سود خالص عملیاتی" : "Net Showroom Profit"}
            </span>
            <span className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
              <Scale className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatCurrency(netProfitUSD, currency, exchangeRate)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            {totalRevenueUSD > 0 ? ((netProfitUSD / totalRevenueUSD) * 100).toFixed(1) : 0}% net showroom margin
          </div>
        </div>

        {/* Card 3: Sarrafi Cash */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800/90 shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 end-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {language === "ps" ? "د صرافۍ او نغدو موجودي" : language === "fa" ? "موجودی صرافی و صندوق" : "Sarrafi & Liquid Cash"}
            </span>
            <span className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40">
              <Wallet className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalCashUSD, currency, exchangeRate)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            Khorasan Sarrafi + Vault Safe
          </div>
        </div>

        {/* Card 4: Customs & Expenses */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800/90 shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 end-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {language === "ps" ? "د ګمرک او اداري لګښتونه" : language === "fa" ? "مجموع مصارف و گمرکات" : "Customs & Overheads"}
            </span>
            <span className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
              <ArrowDownLeft className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-rose-600 dark:text-rose-400 tracking-tight">
            {formatCurrency(totalExpensesUSD, currency, exchangeRate)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            {expenses.length} audited expense vouchers
          </div>
        </div>
      </div>

      {/* Tabs Container */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#111827] shadow-sm overflow-hidden">
        {/* Dense Segmented Tab Strip */}
        <div className="p-2 sm:p-3 border-b border-slate-200/90 dark:border-slate-800/90 bg-slate-50/60 dark:bg-slate-900/40 overflow-x-auto scrollbar-none">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 shrink-0">
            {tabsConfig.map((t, idx) => {
              const isActive = activeTab === String(idx);
              const Icon = t.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveTab(String(idx))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
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
