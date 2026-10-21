"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Download, FileBarChart2 } from "lucide-react";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";

interface ReportData {
  summary: {
    salesRevenueUSD: number;
    grossProfitUSD: number;
    receivablesUSD: number;
    expensesUSD: number;
    activeInventoryCount: number;
    averageInventoryAgeDays: number;
  };
  sales: {
    id: string;
    contractNumber: string;
    saleDate: string;
    customerName: string;
    vehicle: string;
    salePriceUSD: number;
    grossProfitUSD: number;
  }[];
  receivables: {
    id: string;
    contractNumber: string;
    customerName: string;
    dueDate: string;
    amountUSD: number;
    status: string;
  }[];
  inventory: {
    id: string;
    stockNumber: string;
    make: string;
    model: string;
    year: number;
    createdAt: string;
    originCountry: string;
    ageDays: number;
  }[];
  sourcing: { originCountry: string; count: number }[];
}

const defaultFrom = () => new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
const defaultTo = () => new Date().toISOString().slice(0, 10);
const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export default function ReportsPage() {
  const { language, currentRole } = useShowroomStore();
  const t = translations[language];
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({
        from: new Date(`${from}T00:00:00`).toISOString(),
        to: new Date(`${to}T23:59:59.999`).toISOString(),
      });
      const response = await fetch(`/api/reports?${query}`);
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || t.reportsError);
      }
      setReport(result.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.reportsError);
    } finally {
      setLoading(false);
    }
  }, [from, to, t.reportsError]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  const exportCsv = () => {
    if (!report) return;
    const rows: string[][] = [
      [t.reportsTitle, `${from} - ${to}`],
      [t.reportsSales, String(report.summary.salesRevenueUSD)],
      [t.reportsProfit, String(report.summary.grossProfitUSD)],
      [t.reportsReceivables, String(report.summary.receivablesUSD)],
      [t.reportsInventoryAge, String(report.summary.averageInventoryAgeDays)],
      [],
      [t.reportsContract, t.reportsCustomer, t.reportsVehicle, t.reportsDate, t.reportsAmount, t.reportsProfitColumn],
      ...report.sales.map((sale) => [
        sale.contractNumber,
        sale.customerName,
        sale.vehicle,
        new Date(sale.saleDate).toISOString(),
        String(sale.salePriceUSD),
        String(sale.grossProfitUSD),
      ]),
      [],
      [t.reportsContract, t.reportsCustomer, t.reportsDueDate, t.reportsAmount],
      ...report.receivables.map((item) => [
        item.contractNumber,
        item.customerName,
        new Date(item.dueDate).toISOString(),
        String(item.amountUSD),
      ]),
      [],
      [t.reportsOrigin, t.reportsUnits],
      ...report.sourcing.map((item) => [item.originCountry, String(item.count)]),
    ];
    const content = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `dealership-report-${from}-${to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (currentRole === "SalesAgent") {
    return <p role="alert" className="p-4 text-sm text-rose-600">{t.reportsNotAuthorized}</p>;
  }

  const number = (value: number) =>
    new Intl.NumberFormat(language === "fa" ? "fa-AF" : language === "ps" ? "ps-AF" : "en-US", {
      maximumFractionDigits: 1,
    }).format(value);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <FileBarChart2 className="mt-1 h-6 w-6 text-[#1A73E8]" />
          <div>
            <h1 className="text-2xl font-bold">{t.reportsTitle}</h1>
            <p className="mt-1 text-sm text-slate-500">{t.reportsDescription}</p>
          </div>
        </div>
        <button
          type="button"
          disabled={!report}
          onClick={exportCsv}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold disabled:opacity-50 dark:border-slate-700"
        >
          <Download className="h-4 w-4" />
          {t.reportsExport}
        </button>
      </header>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void loadReport();
        }}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-[#262F40] dark:bg-[#161B26]"
      >
        <label className="grid gap-1 text-xs font-medium">
          <span>{t.reportsFrom}</span>
          <input required type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="rounded border border-slate-300 bg-transparent px-2 py-1.5 dark:border-slate-700" />
        </label>
        <label className="grid gap-1 text-xs font-medium">
          <span>{t.reportsTo}</span>
          <input required type="date" min={from} value={to} onChange={(event) => setTo(event.target.value)} className="rounded border border-slate-300 bg-transparent px-2 py-1.5 dark:border-slate-700" />
        </label>
        <button type="submit" className="rounded bg-[#1A73E8] px-3 py-2 text-xs font-semibold text-white">
          {t.reportsApply}
        </button>
      </form>
      {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
      {loading ? <p className="text-sm text-slate-500">{t.reportsLoading}</p> : report ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label={t.reportsSales} value={`$${number(report.summary.salesRevenueUSD)}`} />
            <Metric label={t.reportsProfit} value={`$${number(report.summary.grossProfitUSD)}`} />
            <Metric label={t.reportsReceivables} value={`$${number(report.summary.receivablesUSD)}`} />
            <Metric label={t.reportsAverageDays} value={number(report.summary.averageInventoryAgeDays)} />
          </section>
          <section className="grid gap-4 lg:grid-cols-2">
            <ReportTable
              title={t.reportsSales}
              headers={[t.reportsContract, t.reportsCustomer, t.reportsVehicle, t.reportsAmount, t.reportsProfitColumn]}
              rows={report.sales.map((sale) => [
                sale.contractNumber,
                sale.customerName,
                sale.vehicle,
                `$${number(sale.salePriceUSD)}`,
                `$${number(sale.grossProfitUSD)}`,
              ])}
              empty={t.reportsNoData}
            />
            <ReportTable
              title={t.reportsReceivables}
              headers={[t.reportsContract, t.reportsCustomer, t.reportsDueDate, t.reportsAmount]}
              rows={report.receivables.map((item) => [
                item.contractNumber,
                item.customerName,
                new Intl.DateTimeFormat(language === "fa" ? "fa-AF" : language === "ps" ? "ps-AF" : "en-US").format(new Date(item.dueDate)),
                `$${number(item.amountUSD)}`,
              ])}
              empty={t.reportsNoData}
            />
            <ReportTable
              title={t.reportsInventoryAge}
              headers={[t.reportsVehicle, t.reportsOrigin, t.reportsDays]}
              rows={report.inventory.map((vehicle) => [
                `${vehicle.year} ${vehicle.make} ${vehicle.model} · ${vehicle.stockNumber}`,
                vehicle.originCountry,
                number(vehicle.ageDays),
              ])}
              empty={t.reportsNoData}
            />
            <ReportTable
              title={t.reportsSourcing}
              headers={[t.reportsOrigin, t.reportsUnits]}
              rows={report.sourcing.map((item) => [item.originCountry, number(item.count)])}
              empty={t.reportsNoData}
            />
          </section>
        </>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-[#262F40] dark:bg-[#161B26]">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 font-mono text-xl font-bold">{value}</p>
    </div>
  );
}

function ReportTable({
  title,
  headers,
  rows,
  empty,
}: {
  title: string;
  headers: string[];
  rows: string[][];
  empty: string;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-[#262F40] dark:bg-[#161B26]">
      <h2 className="border-b border-slate-200 px-3 py-2 text-sm font-semibold dark:border-[#262F40]">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-xs">
          <thead><tr>{headers.map((header) => <th key={header} className="bg-slate-50 px-3 py-2 text-start font-semibold dark:bg-[#121722]">{header}</th>)}</tr></thead>
          <tbody>{rows.length === 0 ? (
            <tr><td colSpan={headers.length} className="p-4 text-center text-slate-500">{empty}</td></tr>
          ) : rows.map((row, index) => (
            <tr key={index} className="border-t border-slate-100 dark:border-slate-800">
              {row.map((cell, cellIndex) => <td key={cellIndex} className="max-w-xs truncate px-3 py-2">{cell}</td>)}
            </tr>
          ))}</tbody>
        </table>
      </div>
    </section>
  );
}
