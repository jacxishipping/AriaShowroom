"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ClipboardCheck,
  Search,
  Download,
  Trash2,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  ScanLine,
  Zap,
  Camera,
} from "lucide-react";
import {
  MuiButton,
  IconButton,
  MuiTable,
  MuiTableHead,
  MuiTableBody,
  MuiTableRow,
  MuiTableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@/components/mui";
import { useShowroomStore } from "@/store/useShowroomStore";
import { safeCsvText } from "@/lib/export-utils";

export interface ScanAuditEntry {
  id: string;
  vin: string;
  vehicleId?: string;
  stockNumber?: string;
  make?: string;
  model?: string;
  year?: number;
  trim?: string;
  sellingPrice?: number;
  image?: string;
  bayLocation: string;
  timestamp: string;
  scannedAt: Date;
  isAudited: boolean;
  scanMethod: "OPTICAL_CAMERA" | "LASER_GUN" | "MANUAL_ENTRY" | "QUICK_CHIP";
  status?: string;
  notes?: string;
}

export interface ScanAuditHistoryProps {
  entries: ScanAuditEntry[];
  currentVehicleId?: string;
  onSelectEntry: (entry: ScanAuditEntry) => void;
  onToggleAudited?: (entryId: string) => void;
  onClearHistory?: () => void;
  onDeleteEntry?: (entryId: string) => void;
}

export function ScanAuditHistory({
  entries,
  currentVehicleId,
  onSelectEntry,
  onToggleAudited,
  onClearHistory,
  onDeleteEntry,
}: ScanAuditHistoryProps) {
  const { branding } = useShowroomStore();
  const [search, setSearch] = useState("");
  const [bayFilter, setBayFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "AUDITED" | "PENDING">("ALL");
  const [viewMode, setViewMode] = useState<"table" | "stream">("table");
  const [copiedVin, setCopiedVin] = useState<string | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const bayOptions = useMemo(() => {
    const bays = new Set<string>();
    entries.forEach((e) => {
      if (e.bayLocation) bays.add(e.bayLocation);
    });
    return Array.from(bays);
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (bayFilter !== "ALL" && e.bayLocation !== bayFilter) return false;
      if (statusFilter === "AUDITED" && !e.isAudited) return false;
      if (statusFilter === "PENDING" && e.isAudited) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        e.vin.toLowerCase().includes(q) ||
        (e.stockNumber && e.stockNumber.toLowerCase().includes(q)) ||
        (e.make && e.make.toLowerCase().includes(q)) ||
        (e.model && e.model.toLowerCase().includes(q)) ||
        (e.bayLocation && e.bayLocation.toLowerCase().includes(q))
      );
    });
  }, [entries, bayFilter, statusFilter, search]);

  const auditedCount = entries.filter((e) => e.isAudited).length;
  const uniqueBaysVisited = new Set(entries.map((e) => e.bayLocation)).size;

  const handleCopyVin = (vin: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(vin);
      setCopiedVin(vin);
      setTimeout(() => setCopiedVin(null), 1800);
    }
  };

  const handleExportCSV = () => {
    if (filteredEntries.length === 0) return;

    const headers = [
      "Scan ID",
      "Timestamp",
      "VIN / Chassis",
      "Stock Number",
      "Make & Model",
      "Year",
      "Bay Location",
      "Scan Method",
      "Audit Reconciled",
      "Selling Price USD",
    ];

    const rows = filteredEntries.map((e) => [
      safeCsvText(e.id),
      safeCsvText(e.timestamp),
      safeCsvText(e.vin),
      safeCsvText(e.stockNumber || "N/A"),
      safeCsvText(`${e.year || ""} ${e.make || ""} ${e.model || ""}`.trim()),
      e.year || "",
      safeCsvText(e.bayLocation || ""),
      safeCsvText(e.scanMethod),
      e.isAudited ? "YES" : "NO",
      e.sellingPrice || 0,
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const slug = (branding.dealershipName || "aria_motors")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slug || "aria_motors"}_lot_scan_audit_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#121824] shadow-xs overflow-hidden">
      {/* Top Header Strip */}
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#0E131E] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
            <ClipboardCheck className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Scan Audit History
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Lot Walk Session
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              سابقه ثبت و تفتیش بارکدها • Real-time audit log of all VINs scanned during current walk
            </p>
          </div>
        </div>

        {/* Live Metrics Counters */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#161C2A] border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300">
            <span className="text-[10px] text-slate-400 block font-medium">Scanned VINs</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {entries.length} units
            </span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#161C2A] border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300">
            <span className="text-[10px] text-slate-400 block font-medium">Reconciled</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {auditedCount} / {entries.length}
            </span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#161C2A] border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300">
            <span className="text-[10px] text-slate-400 block font-medium">Bays Visited</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
              {uniqueBaysVisited} bays
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Action Toolbar */}
      <div className="p-3 border-b border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-[#121824] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search VIN, stock, bay..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 sm:w-60 ps-8 pe-3 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 h-8"
            />
          </div>

          <select
            value={bayFilter}
            onChange={(e) => setBayFilter(e.target.value)}
            className="h-8 ps-2.5 pe-6 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">All Bays ({bayOptions.length})</option>
            {bayOptions.map((bay) => (
              <option key={bay} value={bay}>
                {bay}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "ALL" | "AUDITED" | "PENDING")}
            className="h-8 ps-2.5 pe-6 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="AUDITED">Reconciled / Audited ✓</option>
            <option value="PENDING">Pending Verification</option>
          </select>

          {(search || bayFilter !== "ALL" || statusFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setBayFilter("ALL");
                setStatusFilter("ALL");
              }}
              className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline px-1 cursor-pointer"
            >
              Reset
            </button>
          )}

          <span className="text-[11px] font-mono text-slate-400">
            ({filteredEntries.length} scans)
          </span>
        </div>

        {/* View mode toggle & Export / Clear buttons */}
        <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-auto">
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Table View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("stream")}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                viewMode === "stream"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Timeline Stream
            </button>
          </div>

          <MuiButton
            variant="outlined"
            color="inherit"
            size="small"
            onClick={handleExportCSV}
            disabled={filteredEntries.length === 0}
            startIcon={<Download className="h-3 w-3" />}
            sx={{ fontSize: "11px", py: "3px" }}
          >
            Export Log
          </MuiButton>

          {onClearHistory && entries.length > 0 && (
            <MuiButton
              variant="outlined"
              color="inherit"
              size="small"
              onClick={() => setConfirmClearOpen(true)}
              startIcon={<Trash2 className="h-3 w-3 text-rose-500" />}
              sx={{ fontSize: "11px", py: "3px" }}
            >
              Clear Session
            </MuiButton>
          )}
        </div>
      </div>

      {/* Main Content: Table View vs Timeline Stream */}
      {filteredEntries.length === 0 ? (
        <div className="p-8 text-center space-y-2 text-slate-400">
          <div className="mx-auto h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <ScanLine className="h-5 w-5" />
          </div>
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
            No Scanned VINs Match Filter
          </h4>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            {entries.length === 0
              ? "Start scanning vehicle barcodes with the optical camera, handheld laser gun, or quick-pick chips above to record scans in this lot walk session."
              : "Try adjusting your search query, target bay filter, or status filter."}
          </p>
        </div>
      ) : viewMode === "table" ? (
        <div className="overflow-x-auto">
          <MuiTable dense size="small" className="w-full">
            <MuiTableHead>
              <MuiTableRow hover={false}>
                <MuiTableCell header>Timestamp & Scan Method</MuiTableCell>
                <MuiTableCell header>VIN / Chassis</MuiTableCell>
                <MuiTableCell header>Vehicle Specification</MuiTableCell>
                <MuiTableCell header>Bay Location</MuiTableCell>
                <MuiTableCell header>Lot Audit Status</MuiTableCell>
                <MuiTableCell header align="right">Actions</MuiTableCell>
              </MuiTableRow>
            </MuiTableHead>
            <MuiTableBody>
              {filteredEntries.map((entry, idx) => {
                const isSelected = currentVehicleId === entry.vehicleId;

                return (
                  <MuiTableRow
                    key={entry.id}
                    onClick={() => onSelectEntry(entry)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50/70 dark:bg-blue-950/30"
                        : idx % 2 === 0
                        ? "bg-white dark:bg-[#121824]"
                        : "bg-slate-50/40 dark:bg-slate-900/40"
                    }`}
                  >
                    <MuiTableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                        <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>{entry.timestamp}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 font-mono">
                        {entry.scanMethod === "OPTICAL_CAMERA" ? (
                          <span className="inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400">
                            <Camera className="h-2.5 w-2.5" /> Camera Scan
                          </span>
                        ) : entry.scanMethod === "LASER_GUN" ? (
                          <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                            <Zap className="h-2.5 w-2.5" /> Laser Gun
                          </span>
                        ) : entry.scanMethod === "QUICK_CHIP" ? (
                          <span className="inline-flex items-center gap-0.5 text-purple-600 dark:text-purple-400">
                            <ScanLine className="h-2.5 w-2.5" /> Quick Chip
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-slate-500">
                            Manual Search
                          </span>
                        )}
                      </div>
                    </MuiTableCell>

                    <MuiTableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wide">
                          {entry.vin}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyVin(entry.vin, e)}
                          title="Copy VIN"
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {copiedVin === entry.vin ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                      {entry.stockNumber && (
                        <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                          Stock Lot: <strong>{entry.stockNumber}</strong>
                        </div>
                      )}
                    </MuiTableCell>

                    <MuiTableCell>
                      <div className="flex items-center gap-2">
                        {entry.image && (
                          <div className="relative h-8 w-11 rounded overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100">
                            <Image
                              src={entry.image}
                              alt={entry.model || "Vehicle"}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {entry.year} {entry.make} {entry.model}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {entry.trim || "GCC Spec Direct Import"}
                            {entry.sellingPrice && (
                              <span className="ms-1.5 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                                · ${entry.sellingPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </MuiTableCell>

                    <MuiTableCell>
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80">
                        <MapPin className="h-3 w-3 text-blue-500 shrink-0" />
                        <span className="truncate max-w-[180px]">{entry.bayLocation}</span>
                      </div>
                    </MuiTableCell>

                    <MuiTableCell>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleAudited) onToggleAudited(entry.id);
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                          entry.isAudited
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
                        }`}
                        title="Click to toggle physical audit reconciliation"
                      >
                        {entry.isAudited ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            <span>Reconciled ✓</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 text-amber-500" />
                            <span>Needs Audit</span>
                          </>
                        )}
                      </button>
                    </MuiTableCell>

                    <MuiTableCell align="right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {entry.vehicleId && (
                          <IconButton
                            component={Link}
                            href={`/vehicles/${entry.vehicleId}`}
                            size="small"
                            color="inherit"
                            title="Open Full Vehicle Dossier"
                            sx={{ p: "3px" }}
                          >
                            <ExternalLink className="h-3.5 w-3.5 text-slate-500 hover:text-blue-600" />
                          </IconButton>
                        )}
                        {onDeleteEntry && (
                          <IconButton
                            size="small"
                            color="inherit"
                            title="Remove scan from audit history"
                            onClick={() => onDeleteEntry(entry.id)}
                            sx={{ p: "3px" }}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-rose-600" />
                          </IconButton>
                        )}
                      </div>
                    </MuiTableCell>
                  </MuiTableRow>
                );
              })}
            </MuiTableBody>
          </MuiTable>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ms-3 space-y-4">
            {filteredEntries.map((entry) => {
              const isSelected = currentVehicleId === entry.vehicleId;

              return (
                <div
                  key={entry.id}
                  onClick={() => onSelectEntry(entry)}
                  className="relative ps-6 group cursor-pointer transition-all"
                >
                  <div
                    className={`absolute -start-[11px] top-1 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      entry.isAudited
                        ? "bg-emerald-500 border-white text-white dark:border-slate-900"
                        : "bg-blue-600 border-white text-white dark:border-slate-900"
                    }`}
                  >
                    {entry.isAudited ? (
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    ) : (
                      <ScanLine className="h-2.5 w-2.5" />
                    )}
                  </div>

                  <div
                    className={`p-3 rounded-xl border transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs"
                        : "border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {entry.timestamp}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({entry.scanMethod.replace("_", " ")})
                        </span>
                        <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded border border-blue-200/50 dark:border-blue-900/50">
                          {entry.vin}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            entry.isAudited
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          }`}
                        >
                          {entry.isAudited ? "Reconciled ✓" : "Logged in Session"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        {entry.image && (
                          <div className="relative h-9 w-14 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100">
                            <Image
                              src={entry.image}
                              alt={entry.model || "Vehicle"}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="truncate">
                          <div className="font-bold text-slate-900 dark:text-white truncate">
                            {entry.year} {entry.make} {entry.model}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            Stock #{entry.stockNumber || "N/A"} · {entry.trim || "Full Option"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                          <MapPin className="h-3 w-3 text-blue-500" />
                          {entry.bayLocation}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Summary Strip */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#0E131E] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
        <div>
          <span>Showing </span>
          <strong className="text-slate-800 dark:text-slate-200 font-mono">
            {filteredEntries.length}
          </strong>
          <span> of </span>
          <strong className="text-slate-800 dark:text-slate-200 font-mono">
            {entries.length}
          </strong>
          <span> scanned VIN records in active lot session</span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[10px] text-slate-400">
          <span>
            Target Dealership: {branding.dealershipName} · {branding.address}
          </span>
          <span>•</span>
          <span>Last Scan: {entries[0]?.timestamp || "N/A"}</span>
        </div>
      </div>

      {/* Clear Lot Walk Session Confirmation Dialog */}
      <Dialog
        open={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle className="font-bold text-sm">
          Clear Lot Scan Audit Session?
        </DialogTitle>
        <DialogContent>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            This will remove all <strong>{entries.length}</strong> scanned VIN log entries from the active lot walk session. Export the CSV log first if you need an archival copy.
          </p>
        </DialogContent>
        <DialogActions>
          <MuiButton
            variant="outlined"
            color="inherit"
            size="small"
            onClick={() => setConfirmClearOpen(false)}
          >
            Cancel
          </MuiButton>
          <MuiButton
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              setConfirmClearOpen(false);
              if (onClearHistory) onClearHistory();
            }}
          >
            Clear Session
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
