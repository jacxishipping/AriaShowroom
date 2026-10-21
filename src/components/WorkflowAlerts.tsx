"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Clock3, CreditCard } from "lucide-react";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";

interface AlertData {
  transit: { id: string; stockNumber: string; make: string; model: string; statusChangedAt: string }[];
  followUps: { id: string; fullName: string; phone: string; leadStage: string; updatedAt: string }[];
  installments: { id: string; dueDate: string; amount: number; contractNumber: string; customerName: string }[];
}

export function WorkflowAlerts() {
  const { currentRole, language } = useShowroomStore();
  const t = translations[language];
  const [data, setData] = useState<AlertData>({ transit: [], followUps: [], installments: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentRole === "SalesAgent") return;
    let cancelled = false;
    setLoading(true);
    fetch("/api/alerts")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || t.alertsUnavailable);
        }
        if (!cancelled) {
          setData(result.data);
          setError("");
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : t.alertsUnavailable);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentRole, t.alertsUnavailable]);

  if (currentRole === "SalesAgent") return null;
  const total = data.transit.length + data.followUps.length + data.installments.length;
  const locale = language === "fa" ? "fa-AF" : language === "ps" ? "ps-AF" : "en-US";
  const daysSince = (value: string) =>
    Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86400000));

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-[#262F40] dark:bg-[#161B26]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          {t.alertsTitle}
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 font-mono text-xs text-amber-600">
            {total}
          </span>
        </h2>
        <Link href="/admin/audit" className="text-xs font-semibold text-[#1A73E8] hover:underline">
          {t.alertsViewAudit}
        </Link>
      </div>
      {loading ? (
        <p className="text-xs text-slate-500">{t.alertsLoading}</p>
      ) : error ? (
        <p role="alert" className="text-xs text-rose-600">{error}</p>
      ) : total === 0 ? (
        <p className="text-xs text-slate-500">{t.alertsNoItems}</p>
      ) : (
        <div className="grid gap-3 lg:grid-cols-3">
          <AlertGroup
            icon={<Clock3 className="h-3.5 w-3.5" />}
            title={t.alertsTransit}
            items={data.transit.map((item) => ({
              id: item.id,
              label: `${item.stockNumber} · ${item.make} ${item.model}`,
              detail: t.alertsDays.replace("{days}", String(daysSince(item.statusChangedAt))),
            }))}
          />
          <AlertGroup
            icon={<AlertTriangle className="h-3.5 w-3.5" />}
            title={t.alertsFollowUps}
            items={data.followUps.map((item) => ({
              id: item.id,
              label: `${item.fullName} · ${item.phone}`,
              detail: t.alertsDays.replace("{days}", String(daysSince(item.updatedAt))),
            }))}
          />
          <AlertGroup
            icon={<CreditCard className="h-3.5 w-3.5" />}
            title={t.alertsInstallments}
            items={data.installments.map((item) => ({
              id: item.id,
              label: `${item.customerName} · ${item.contractNumber}`,
              detail: `${new Intl.DateTimeFormat(locale).format(new Date(item.dueDate))} · $${item.amount.toLocaleString()}`,
            }))}
          />
        </div>
      )}
    </section>
  );
}

function AlertGroup({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: { id: string; label: string; detail: string }[];
}) {
  return (
    <div className="min-w-0 rounded-md bg-slate-50 p-3 dark:bg-[#121722]">
      <h3 className="flex items-center gap-1.5 text-xs font-semibold">{icon}{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-xs text-slate-400">—</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {items.slice(0, 5).map((item) => (
            <li key={item.id} className="truncate text-xs">
              <span className="block truncate font-medium">{item.label}</span>
              <span className="text-[11px] text-slate-500">{item.detail}</span>
            </li>
          ))}
          {items.length > 5 && (
            <li className="text-[11px] text-slate-500">+{items.length - 5}</li>
          )}
        </ul>
      )}
    </div>
  );
}
