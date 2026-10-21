"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";

interface SearchResults {
  vehicles: {
    id: string; stockNumber: string; vin: string; make: string; model: string;
    year: number; status: string; createdAt: string;
    sales: { id: string; contractNumber: string; saleDate: string; salePrice?: number; customer: { id: string; fullName: string; phone: string } }[];
  }[];
  customers: {
    id: string; fullName: string; phone: string; leadStage: string;
    createdAt: string; updatedAt: string;
    sales: { id: string; contractNumber: string; saleDate: string; salePrice?: number; vehicle: { id: string; stockNumber: string; make: string; model: string; year: number } }[];
  }[];
  payments: { id: string; voucherNumber: string; voucherType: string; date: string; partyName: string; amountUSD: number; vehicleStock: string | null; purpose: string }[];
}

export default function HistoryPage() {
  const { language } = useShowroomStore();
  const t = translations[language];
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const locale = language === "fa" ? "fa-AF" : language === "ps" ? "ps-AF" : "en-US";
  const date = (value: string) => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (query.trim().length < 2) {
      setError(t.historyMinQuery);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/history?q=${encodeURIComponent(query.trim())}`);
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || t.historySearchError);
      setResults(result.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.historySearchError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <header>
        <h1 className="text-2xl font-bold">{t.historyTitle}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.historyDescription}</p>
      </header>
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.historySearchPlaceholder}
          className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-[#262F40] dark:bg-[#161B26]"
        />
        <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-md bg-[#1A73E8] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <Search className="h-4 w-4" /> {t.historySearch}
        </button>
      </form>
      {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
      {loading && <p className="text-sm text-slate-500">{t.reportsLoading}</p>}
      {results && !loading && (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">{t.historyVehicles} ({results.vehicles.length})</h2>
            {results.vehicles.map((vehicle) => (
              <article key={vehicle.id} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-[#262F40] dark:bg-[#161B26]">
                <h3 className="font-semibold">
                  <Link className="text-[#1A73E8] hover:underline" href={`/vehicles/${vehicle.id}`}>
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </Link>
                  <span className="ms-2 font-mono text-xs text-slate-500">{vehicle.stockNumber}</span>
                </h3>
                <p className="mt-1 text-xs text-slate-500">VIN: {vehicle.vin} · {vehicle.status}</p>
                <p className="mt-1 text-xs text-slate-500">{t.historyCreated}: {date(vehicle.createdAt)}</p>
                <Timeline title={t.historySales} items={vehicle.sales.map((sale) => ({
                  id: sale.id,
                  title: `${sale.contractNumber} · ${sale.customer.fullName}`,
                  detail: `${sale.customer.phone} · ${date(sale.saleDate)}${sale.salePrice === undefined ? "" : ` · $${sale.salePrice.toLocaleString()}`}`,
                }))} empty={t.historyNoResults} />
              </article>
            ))}
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">{t.historyCustomers} ({results.customers.length})</h2>
            {results.customers.map((customer) => (
              <article key={customer.id} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-[#262F40] dark:bg-[#161B26]">
                <h3 className="font-semibold">{customer.fullName}</h3>
                <p className="mt-1 text-xs text-slate-500">{customer.phone} · {t.historyLeadStage}: {customer.leadStage}</p>
                <p className="mt-1 text-xs text-slate-500">{t.historyCreated}: {date(customer.createdAt)} · {t.historyUpdated}: {date(customer.updatedAt)}</p>
                <Timeline title={t.historySales} items={customer.sales.map((sale) => ({
                  id: sale.id,
                  title: `${sale.contractNumber} · ${sale.vehicle.year} ${sale.vehicle.make} ${sale.vehicle.model}`,
                  detail: `${sale.vehicle.stockNumber} · ${date(sale.saleDate)}${sale.salePrice === undefined ? "" : ` · $${sale.salePrice.toLocaleString()}`}`,
                }))} empty={t.historyNoResults} />
              </article>
            ))}
            <h2 className="pt-2 text-lg font-semibold">{t.historyPayments} ({results.payments.length})</h2>
            {results.payments.map((payment) => (
              <article key={payment.id} className="rounded-lg border border-slate-200 bg-white p-4 text-sm dark:border-[#262F40] dark:bg-[#161B26]">
                <h3 className="font-semibold">{payment.voucherNumber} · {payment.partyName}</h3>
                <p className="mt-1 text-xs text-slate-500">{payment.voucherType} · {date(payment.date)} · {payment.vehicleStock || payment.purpose}</p>
                <p className="mt-1 font-mono text-xs">${payment.amountUSD.toLocaleString()}</p>
              </article>
            ))}
          </section>
          {results.vehicles.length + results.customers.length + results.payments.length === 0 && (
            <p className="text-sm text-slate-500">{t.historyNoResults}</p>
          )}
        </div>
      )}
    </div>
  );
}

function Timeline({
  title,
  items,
  empty,
}: {
  title: string;
  items: { id: string; title: string; detail: string }[];
  empty: string;
}) {
  return (
    <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
      <h4 className="text-xs font-semibold">{title}</h4>
      {items.length ? (
        <ul className="mt-2 space-y-2">
          {items.map((item) => (
            <li key={item.id} className="border-s-2 border-[#1A73E8]/40 ps-2 text-xs">
              <p className="font-medium">{item.title}</p>
              <p className="text-slate-500">{item.detail}</p>
            </li>
          ))}
        </ul>
      ) : <p className="mt-1 text-xs text-slate-400">{empty}</p>}
    </div>
  );
}
