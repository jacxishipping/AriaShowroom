"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { ClipboardList } from "lucide-react";

interface AuditEntry {
  id: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: unknown;
  createdAt: string;
}

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export default function AuditHistoryPage() {
  const { language } = useShowroomStore();
  const t = translations[language];
  const [from, setFrom] = useState(() => isoDate(new Date(Date.now() - 30 * 86400000)));
  const [to, setTo] = useState(() => isoDate(new Date()));
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        from: new Date(`${from}T00:00:00`).toISOString(),
        to: new Date(`${to}T23:59:59.999`).toISOString(),
      });
      const response = await fetch(`/api/audit?${params}`);
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || t.auditLoadError);
      }
      setEntries(result.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.auditLoadError);
    } finally {
      setLoading(false);
    }
  }, [from, to, t.auditLoadError]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <header className="flex items-start gap-3">
        <ClipboardList className="mt-1 h-6 w-6 text-[#1A73E8]" />
        <div>
          <h1 className="text-2xl font-bold">{t.auditTitle}</h1>
          <p className="mt-1 text-sm text-slate-500">{t.auditDescription}</p>
        </div>
      </header>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void load();
        }}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-[#262F40] dark:bg-[#161B26]"
      >
        <label className="grid gap-1 text-xs font-medium">
          <span>{t.auditFrom}</span>
          <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="rounded border border-slate-300 bg-transparent px-2 py-1.5 dark:border-slate-700" />
        </label>
        <label className="grid gap-1 text-xs font-medium">
          <span>{t.auditTo}</span>
          <input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="rounded border border-slate-300 bg-transparent px-2 py-1.5 dark:border-slate-700" />
        </label>
        <button type="submit" className="rounded bg-[#1A73E8] px-3 py-2 text-xs font-semibold text-white">
          {t.auditApply}
        </button>
      </form>
      {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-[#262F40] dark:bg-[#161B26]">
        <table className="w-full min-w-[760px] text-start text-xs">
          <thead className="bg-slate-50 dark:bg-[#121722]">
            <tr>
              {[t.auditTime, t.auditActor, t.auditAction, t.auditEntity, t.auditChanges].map((label) => (
                <th key={label} className="px-3 py-2 text-start font-semibold">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!loading && entries.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-slate-500">{t.auditEmpty}</td></tr>
            ) : entries.map((entry) => (
              <tr key={entry.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="whitespace-nowrap px-3 py-2">{new Intl.DateTimeFormat(language === "fa" ? "fa-AF" : language === "ps" ? "ps-AF" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(entry.createdAt))}</td>
                <td className="px-3 py-2">{entry.actorEmail}</td>
                <td className="px-3 py-2 font-mono">{entry.action}</td>
                <td className="px-3 py-2 font-mono">{entry.entityType} · {entry.entityId}</td>
                <td className="max-w-lg px-3 py-2"><pre className="whitespace-pre-wrap break-words font-mono text-[10px]">{JSON.stringify(entry.changes ?? {}, null, 2)}</pre></td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="p-4 text-center text-xs text-slate-500">{t.alertsLoading}</p>}
      </div>
    </div>
  );
}
