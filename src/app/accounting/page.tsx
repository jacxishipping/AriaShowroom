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
        <MuiCard elevation={1} className="border border-slate-200/80 dark:border-slate-800">
          <MuiCardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>{language === "ps" ? "مجموعي عواید" : language === "fa" ? "مجموع عواید فروش" : "Gross Revenue"}</span>
              <span className="p-1 rounded-md bg-blue-500/10 text-blue-500">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {formatCurrency(totalRevenueUSD, currency, exchangeRate)}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              {sales.length} {language === "ps" ? "بشپړ شوي پلورونه" : language === "fa" ? "موتر فروخته شده" : "units liquidated"}
            </span>
          </MuiCardContent>
        </MuiCard>

        <MuiCard elevation={1} className="border border-slate-200/80 dark:border-slate-800">
          <MuiCardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>{language === "ps" ? "خالصه ګټه" : language === "fa" ? "سود خالص عملیاتی" : "Net Showroom Profit"}</span>
              <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-500">
                <Scale className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {formatCurrency(netProfitUSD, currency, exchangeRate)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">
              {totalRevenueUSD > 0 ? ((netProfitUSD / totalRevenueUSD) * 100).toFixed(1) : 0}% net showroom margin
            </span>
          </MuiCardContent>
        </MuiCard>

        <MuiCard elevation={1} className="border border-slate-200/80 dark:border-slate-800">
          <MuiCardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>{language === "ps" ? "د صرافۍ او نغدو موجودي" : language === "fa" ? "موجودی صرافی و صندوق" : "Sarrafi & Liquid Cash"}</span>
              <span className="p-1 rounded-md bg-amber-500/10 text-amber-500">
                <Wallet className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {formatCurrency(totalCashUSD, currency, exchangeRate)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">
              Khorasan Sarrafi + Vault Reserves
            </span>
          </MuiCardContent>
        </MuiCard>

        <MuiCard elevation={1} className="border border-slate-200/80 dark:border-slate-800">
          <MuiCardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>{language === "ps" ? "د ګمرک او اداري لګښتونه" : language === "fa" ? "مجموع مصارف و گمرکات" : "Customs & Overheads"}</span>
              <span className="p-1 rounded-md bg-rose-500/10 text-rose-500">
                <ArrowDownLeft className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {formatCurrency(totalExpensesUSD, currency, exchangeRate)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">
              {expenses.length} audited expense vouchers
            </span>
          </MuiCardContent>
        </MuiCard>
      </div>

      {/* Tabs Navigation */}
      <MuiCard elevation={1} className="border border-slate-200/80 dark:border-slate-800">
        <div className="border-b border-slate-200 dark:border-slate-800 px-4">
          <MuiTabs
            value={activeTab}
            onChange={(val) => setActiveTab(val)}
            tabs={tabsConfig.map((t, idx) => ({
              value: String(idx),
              label: t.label,
              icon: <t.icon className="h-4 w-4" />,
            }))}
          />
        </div>

        {/* Tab Content Panes */}
        <div className="p-4 sm:p-6">
          {activeTab === "0" && <AccountingTab />}
          {activeTab === "1" && <InvoicesTab />}
          {activeTab === "2" && <PaymentsTab />}
          {activeTab === "3" && <SuppliersTab />}
          {activeTab === "4" && <ExpensesTab />}
          {activeTab === "5" && <AccountingTab />}
        </div>
      </MuiCard>
    </div>
  );
}
