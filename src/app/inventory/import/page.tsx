"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileUp } from "lucide-react";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";

interface ImportIssue {
  row: number;
  field?: string;
  message: string;
}

interface PreviewRow {
  sourceRow: number;
  stockNumber: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  color: string;
  purchasePrice: number;
  sellingPrice: number;
  status: string;
}

interface ImportResult {
  count: number;
  issueCount: number;
  issues: ImportIssue[];
  preview: PreviewRow[];
  committed: boolean;
}

const template = [
  "stockNumber,vin,make,model,year,mileage,color,purchasePrice,freightCost,customsDuty,repairCost,sellingPrice,minTargetPrice,bodyType,originCountry,fuelType,transmission,steering,status,description",
  "SM-2026-001,JT1234567890123456,Toyota,Land Cruiser,2022,25000,White,45000,1500,2500,0,56000,50000,SUV,UAE,PETROL,AUTOMATIC,LEFT_HAND,AVAILABLE,Example vehicle",
].join("\r\n");

export default function VehicleImportPage() {
  const { language, currentRole, addToast } = useShowroomStore();
  const t = translations[language];
  const [csv, setCsv] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const chooseFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setResult(null);
    if (file.size > 2 * 1024 * 1024) {
      setError(t.importError);
      return;
    }
    setCsv(await file.text());
  };

  const submit = async (commit: boolean) => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/import/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv, commit }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        setResult({
          count: payload.count || 0,
          issueCount: payload.issues?.length || 0,
          issues: payload.issues || [],
          preview: [],
          committed: false,
        });
        throw new Error(payload.error || t.importError);
      }
      setResult(payload);
      if (payload.committed) {
        addToast(t.importSuccess, "success");
        setCsv("");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.importError);
    } finally {
      setBusy(false);
    }
  };

  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob(["\uFEFF", template], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "vehicle-import-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (currentRole !== "SuperAdmin") {
    return <p role="alert" className="p-4 text-sm text-rose-600">{t.importNotAuthorized}</p>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <Link href="/inventory" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A73E8] hover:underline">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t.tabInventory}
      </Link>
      <header className="flex items-start gap-3">
        <FileUp className="mt-1 h-6 w-6 text-[#1A73E8]" />
        <div>
          <h1 className="text-2xl font-bold">{t.importTitle}</h1>
          <p className="mt-1 text-sm text-slate-500">{t.importDescription}</p>
        </div>
      </header>
      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-[#262F40] dark:bg-[#161B26]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="grid gap-1 text-xs font-medium">
            <span>{t.importChooseFile}</span>
            <input type="file" accept=".csv,text/csv" onChange={(event) => void chooseFile(event)} />
          </label>
          <button type="button" onClick={downloadTemplate} className="text-xs font-semibold text-[#1A73E8] hover:underline">
            {t.importTemplate}
          </button>
        </div>
        <textarea
          value={csv}
          onChange={(event) => {
            setCsv(event.target.value);
            setResult(null);
          }}
          rows={9}
          spellCheck={false}
          placeholder={t.importEmpty}
          className="w-full rounded-md border border-slate-300 bg-transparent p-3 font-mono text-xs dark:border-slate-700"
        />
        <button
          type="button"
          disabled={busy || csv.trim().length === 0}
          onClick={() => void submit(false)}
          className="rounded-md bg-[#1A73E8] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {t.importPreview}
        </button>
      </section>
      {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
      {result && (
        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-[#262F40] dark:bg-[#161B26]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">
              {t.importRows}: {result.count} · {t.importIssues}: {result.issueCount}
              {result.issueCount === 0 && <span className="ms-2 text-emerald-600">{t.importNoIssues}</span>}
            </p>
            {!result.committed && result.issueCount === 0 && result.count > 0 && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void submit(true)}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {t.importApply}
              </button>
            )}
          </div>
          {result.issues.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr>{[t.importRow, t.importField, t.importIssue].map((heading) => <th key={heading} className="px-2 py-2 text-start">{heading}</th>)}</tr></thead>
                <tbody>{result.issues.map((issue, index) => (
                  <tr key={`${issue.row}-${issue.field}-${index}`} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="px-2 py-2">{issue.row}</td>
                    <td className="px-2 py-2">{issue.field || "—"}</td>
                    <td className="px-2 py-2 text-rose-600">{issue.message}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          {result.preview.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-xs">
                <thead><tr>{[t.importRow, "Stock", "VIN", "Vehicle", "Year", "Mileage", "Color", "Purchase", "Selling", "Status"].map((heading) => <th key={heading} className="px-2 py-2 text-start">{heading}</th>)}</tr></thead>
                <tbody>{result.preview.map((row) => (
                  <tr key={row.sourceRow} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="px-2 py-2">{row.sourceRow}</td>
                    <td className="px-2 py-2">{row.stockNumber}</td>
                    <td className="px-2 py-2 font-mono">{row.vin}</td>
                    <td className="px-2 py-2">{row.make} {row.model}</td>
                    <td className="px-2 py-2">{row.year}</td>
                    <td className="px-2 py-2">{row.mileage.toLocaleString()}</td>
                    <td className="px-2 py-2">{row.color}</td>
                    <td className="px-2 py-2">${row.purchasePrice.toLocaleString()}</td>
                    <td className="px-2 py-2">${row.sellingPrice.toLocaleString()}</td>
                    <td className="px-2 py-2">{row.status}</td>
                  </tr>
                ))}</tbody>
              </table>
              {result.count > result.preview.length && (
                <p className="mt-2 text-xs text-slate-500">Showing first {result.preview.length} rows</p>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
