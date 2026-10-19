"use client";

import React, { useState } from "react";
import { ShieldCheck, AlertTriangle, CheckCircle2, Crosshair, RotateCcw } from "lucide-react";

export type PanelCondition = "original" | "respray" | "replaced";

export interface PanelZoneState {
  id: string;
  label: string;
  labelDari: string;
  microns: number;
  condition: PanelCondition;
  notes: string;
}

export const DEFAULT_PANEL_ZONES: PanelZoneState[] = [
  {
    id: "hood",
    label: "Engine Hood (Bonnet)",
    labelDari: "کاپوت جلو",
    microns: 112,
    condition: "original",
    notes: "Factory OEM clearcoat, zero stone-chip respray.",
  },
  {
    id: "roof",
    label: "Roof & Sunroof Frame",
    labelDari: "سقف و چارچوب سانروف",
    microns: 108,
    condition: "original",
    notes: "Original factory pillar & roof weld seams verified.",
  },
  {
    id: "trunk",
    label: "Rear Tailgate / Trunk",
    labelDari: "درب صندوق عقب",
    microns: 115,
    condition: "original",
    notes: "Factory seal intact, original tailgate glass.",
  },
  {
    id: "front_bumper",
    label: "Front Bumper & Grille",
    labelDari: "سپر و جلوپنجره",
    microns: 118,
    condition: "original",
    notes: "OEM sensors & radar emblem calibrated.",
  },
  {
    id: "rear_bumper",
    label: "Rear Bumper & Tow Hitch",
    labelDari: "سپر عقب",
    microns: 120,
    condition: "original",
    notes: "Factory paint, no rear impact.",
  },
  {
    id: "lf_fender",
    label: "Left Front Fender",
    labelDari: "گلگیر جلو چپ",
    microns: 110,
    condition: "original",
    notes: "Factory bolts unturned.",
  },
  {
    id: "rf_fender",
    label: "Right Front Fender",
    labelDari: "گلگیر جلو راست",
    microns: 114,
    condition: "original",
    notes: "Factory bolts unturned.",
  },
  {
    id: "lf_door",
    label: "Left Front Door (Driver)",
    labelDari: "درب جلو چپ (راننده)",
    microns: 112,
    condition: "original",
    notes: "VIN sticker intact on B-pillar.",
  },
  {
    id: "rf_door",
    label: "Right Front Door (Passenger)",
    labelDari: "درب جلو راست (شاگرد)",
    microns: 116,
    condition: "original",
    notes: "Original acoustic glass & seam sealer.",
  },
  {
    id: "lr_door",
    label: "Left Rear Door",
    labelDari: "درب عقب چپ",
    microns: 111,
    condition: "original",
    notes: "Factory paint thickness.",
  },
  {
    id: "rr_door",
    label: "Right Rear Door",
    labelDari: "درب عقب راست",
    microns: 185,
    condition: "respray",
    notes: "Minor port scratch cosmetic clearcoat blend (no putty).",
  },
  {
    id: "lr_quarter",
    label: "Left Rear Quarter Panel",
    labelDari: "گلگیر عقب چپ",
    microns: 115,
    condition: "original",
    notes: "Factory spot welds verified inside wheel arch.",
  },
  {
    id: "rr_quarter",
    label: "Right Rear Quarter Panel",
    labelDari: "گلگیر عقب راست",
    microns: 118,
    condition: "original",
    notes: "Factory spot welds verified.",
  },
];

interface PaintInspectionDiagramProps {
  vin?: string;
  cleanTitle?: boolean;
  editable?: boolean;
  initialZones?: PanelZoneState[];
  onChangeZones?: (zones: PanelZoneState[]) => void;
}

export function PaintInspectionDiagram({
  vin,
  cleanTitle = true,
  editable = false,
  initialZones,
  onChangeZones,
}: PaintInspectionDiagramProps) {
  const [zones, setZones] = useState<PanelZoneState[]>(() => {
    if (initialZones && initialZones.length > 0) return initialZones;
    // Deterministically vary 1 panel if not cleanTitle or based on VIN last char
    return DEFAULT_PANEL_ZONES.map((z) => {
      if (z.id === "rr_door" && cleanTitle) {
        return {
          ...z,
          microns: 113,
          condition: "original",
          notes: "Factory OEM paint verified with Elcometer digital gauge.",
        };
      }
      return z;
    });
  });

  const [selectedId, setSelectedId] = useState<string>("hood");

  const selectedZone = zones.find((z) => z.id === selectedId) || zones[0];

  const getZoneFill = (id: string) => {
    const z = zones.find((item) => item.id === id);
    const isSel = selectedId === id;
    if (!z) return "fill-emerald-500/15 stroke-emerald-600";

    if (z.condition === "original") {
      return isSel
        ? "fill-emerald-500/35 stroke-emerald-600 dark:stroke-emerald-400 stroke-[2.2]"
        : "fill-emerald-500/15 hover:fill-emerald-500/25 stroke-emerald-600/70 dark:stroke-emerald-500/60 stroke-[1.2]";
    }
    if (z.condition === "respray") {
      return isSel
        ? "fill-amber-500/40 stroke-amber-600 dark:stroke-amber-400 stroke-[2.2]"
        : "fill-amber-500/20 hover:fill-amber-500/30 stroke-amber-600/80 dark:stroke-amber-400/80 stroke-[1.5]";
    }
    return isSel
      ? "fill-rose-500/40 stroke-rose-600 dark:stroke-rose-400 stroke-[2.2]"
      : "fill-rose-500/20 hover:fill-rose-500/30 stroke-rose-600/80 dark:stroke-rose-400/80 stroke-[1.5]";
  };

  const handleCycleCondition = (zoneId: string) => {
    setSelectedId(zoneId);
    if (!editable) return;

    const order: PanelCondition[] = ["original", "respray", "replaced"];
    const nextZones = zones.map((z) => {
      if (z.id !== zoneId) return z;
      const nextCond = order[(order.indexOf(z.condition) + 1) % order.length];
      const nextMicrons =
        nextCond === "original" ? 112 : nextCond === "respray" ? 210 : 340;
      const nextNotes =
        nextCond === "original"
          ? "Factory OEM paint verified with Elcometer digital gauge."
          : nextCond === "respray"
          ? "Cosmetic second-layer respray recorded during PDI."
          : "Replaced panel / body filler detected (>300 µm).";
      return {
        ...z,
        condition: nextCond,
        microns: nextMicrons,
        notes: nextNotes,
      };
    });
    setZones(nextZones);
    onChangeZones?.(nextZones);
  };

  const handleResetAllOriginal = () => {
    const reset = DEFAULT_PANEL_ZONES.map((z) => ({
      ...z,
      condition: "original" as PanelCondition,
      microns: 110 + (z.id.length % 9),
      notes: "Factory OEM paint verified with Elcometer digital gauge.",
    }));
    setZones(reset);
    onChangeZones?.(reset);
  };

  const originalCount = zones.filter((z) => z.condition === "original").length;
  const resprayCount = zones.filter((z) => z.condition === "respray").length;
  const replacedCount = zones.filter((z) => z.condition === "replaced").length;

  return (
    <div className="rounded-md border border-[#D8D5CD] dark:border-[#242A38] bg-white dark:bg-[#11141B] overflow-hidden">
      {/* Header Bar */}
      <div className="px-4 py-2.5 border-b border-[#E2E0D8] dark:border-[#1F2430] bg-[#FAF9F6] dark:bg-[#0D1017] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Crosshair className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-[#111318] dark:text-white">
            ELCOMETER® ULTRASONIC PAINT & CHASSIS DOSSIER
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-[11px] font-dari text-slate-500 dark:text-slate-400">
            گزارش معاینه رنگ، شاسی و ایربگ‌ها (بدون تکر و رنگ‌شدگی)
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
            <span className="h-2 w-2 rounded-xs bg-emerald-500" />
            OEM (95–130µm): {originalCount}
          </span>
          <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold">
            <span className="h-2 w-2 rounded-xs bg-amber-500" />
            RESPRAY (160–250µm): {resprayCount}
          </span>
          <span className="inline-flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-semibold">
            <span className="h-2 w-2 rounded-xs bg-rose-500" />
            REPLACED (&gt;300µm): {replacedCount}
          </span>
          {editable && (
            <button
              type="button"
              onClick={handleResetAllOriginal}
              className="ms-2 inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[#D8D5CD] dark:border-[#242A38] hover:border-[#111318] dark:hover:border-amber-500 text-[#111318] dark:text-slate-200 cursor-pointer"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              <span>ALL OEM</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split Grid: Top-Down Blueprint SVG + Selected Panel Micron Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E2E0D8] dark:divide-[#1F2430] rtl:divide-x-reverse">
        {/* Left 7 Cols: Interactive Top-Down Vehicle Blueprint */}
        <div className="lg:col-span-7 p-4 bg-[#FAF9F6]/60 dark:bg-[#0B0E14] flex flex-col items-center justify-center">
          <div className="w-full max-w-md">
            <svg
              viewBox="0 0 360 220"
              className="w-full h-auto select-none"
              role="img"
              aria-label="Top-down vehicle body panel inspection diagram"
            >
              {/* Subtle Technical Blueprint Grid Lines */}
              <line x1="0" y1="110" x2="360" y2="110" className="stroke-slate-300/50 dark:stroke-slate-800" strokeDasharray="3 3" />
              <line x1="180" y1="0" x2="180" y2="220" className="stroke-slate-300/50 dark:stroke-slate-800" strokeDasharray="3 3" />

              {/* Direction Labels */}
              <text x="16" y="113" className="fill-slate-400 font-mono text-[8px] uppercase tracking-widest">
                FRONT
              </text>
              <text x="322" y="113" className="fill-slate-400 font-mono text-[8px] uppercase tracking-widest">
                REAR
              </text>
              <text x="180" y="12" textAnchor="middle" className="fill-slate-400 font-mono text-[8px] uppercase tracking-widest">
                LEFT SIDE (DRIVER LHD)
              </text>
              <text x="180" y="214" textAnchor="middle" className="fill-slate-400 font-mono text-[8px] uppercase tracking-widest">
                RIGHT SIDE (PASSENGER)
              </text>

              {/* Wheels */}
              <rect x="75" y="22" width="42" height="10" rx="3" className="fill-slate-800 dark:fill-slate-700" />
              <rect x="243" y="22" width="42" height="10" rx="3" className="fill-slate-800 dark:fill-slate-700" />
              <rect x="75" y="188" width="42" height="10" rx="3" className="fill-slate-800 dark:fill-slate-700" />
              <rect x="243" y="188" width="42" height="10" rx="3" className="fill-slate-800 dark:fill-slate-700" />

              {/* 1. Front Bumper */}
              <path
                d="M 42 56 Q 32 110 42 164 L 56 160 L 56 60 Z"
                onClick={() => handleCycleCondition("front_bumper")}
                className={`cursor-pointer transition-colors ${getZoneFill("front_bumper")}`}
              />

              {/* 2. Engine Hood */}
              <rect
                x="60"
                y="62"
                width="68"
                height="96"
                rx="4"
                onClick={() => handleCycleCondition("hood")}
                className={`cursor-pointer transition-colors ${getZoneFill("hood")}`}
              />
              <text x="94" y="113" textAnchor="middle" className="fill-current text-[9px] font-mono font-bold pointer-events-none opacity-80">
                HOOD
              </text>

              {/* Windshield (Non-painted glass) */}
              <polygon
                points="132,64 150,72 150,148 132,156"
                className="fill-slate-300/50 dark:fill-slate-800/80 stroke-slate-400/50 dark:stroke-slate-700"
              />

              {/* 3. Roof */}
              <rect
                x="154"
                y="72"
                width="92"
                height="76"
                rx="3"
                onClick={() => handleCycleCondition("roof")}
                className={`cursor-pointer transition-colors ${getZoneFill("roof")}`}
              />
              <text x="200" y="113" textAnchor="middle" className="fill-current text-[9px] font-mono font-bold pointer-events-none opacity-80">
                ROOF
              </text>

              {/* Rear Glass */}
              <polygon
                points="250,72 266,66 266,154 250,148"
                className="fill-slate-300/50 dark:fill-slate-800/80 stroke-slate-400/50 dark:stroke-slate-700"
              />

              {/* 4. Rear Tailgate / Trunk */}
              <rect
                x="270"
                y="64"
                width="32"
                height="92"
                rx="3"
                onClick={() => handleCycleCondition("trunk")}
                className={`cursor-pointer transition-colors ${getZoneFill("trunk")}`}
              />
              <text x="286" y="113" textAnchor="middle" className="fill-current text-[8px] font-mono font-bold pointer-events-none opacity-80">
                TAIL
              </text>

              {/* 5. Rear Bumper */}
              <path
                d="M 306 60 L 318 64 Q 324 110 318 156 L 306 160 Z"
                onClick={() => handleCycleCondition("rear_bumper")}
                className={`cursor-pointer transition-colors ${getZoneFill("rear_bumper")}`}
              />

              {/* 6. Left Front Fender */}
              <rect
                x="60"
                y="36"
                width="68"
                height="22"
                rx="3"
                onClick={() => handleCycleCondition("lf_fender")}
                className={`cursor-pointer transition-colors ${getZoneFill("lf_fender")}`}
              />
              <text x="94" y="50" textAnchor="middle" className="fill-current text-[7px] font-mono font-bold pointer-events-none opacity-80">
                LF FENDER
              </text>

              {/* 7. Left Front Door */}
              <rect
                x="132"
                y="36"
                width="58"
                height="24"
                rx="2"
                onClick={() => handleCycleCondition("lf_door")}
                className={`cursor-pointer transition-colors ${getZoneFill("lf_door")}`}
              />
              <text x="161" y="51" textAnchor="middle" className="fill-current text-[7px] font-mono font-bold pointer-events-none opacity-80">
                LF DOOR
              </text>

              {/* 8. Left Rear Door */}
              <rect
                x="194"
                y="36"
                width="54"
                height="24"
                rx="2"
                onClick={() => handleCycleCondition("lr_door")}
                className={`cursor-pointer transition-colors ${getZoneFill("lr_door")}`}
              />
              <text x="221" y="51" textAnchor="middle" className="fill-current text-[7px] font-mono font-bold pointer-events-none opacity-80">
                LR DOOR
              </text>

              {/* 9. Left Rear Quarter */}
              <rect
                x="252"
                y="36"
                width="50"
                height="24"
                rx="3"
                onClick={() => handleCycleCondition("lr_quarter")}
                className={`cursor-pointer transition-colors ${getZoneFill("lr_quarter")}`}
              />
              <text x="277" y="51" textAnchor="middle" className="fill-current text-[7px] font-mono font-bold pointer-events-none opacity-80">
                LR QTR
              </text>

              {/* 10. Right Front Fender */}
              <rect
                x="60"
                y="162"
                width="68"
                height="22"
                rx="3"
                onClick={() => handleCycleCondition("rf_fender")}
                className={`cursor-pointer transition-colors ${getZoneFill("rf_fender")}`}
              />
              <text x="94" y="176" textAnchor="middle" className="fill-current text-[7px] font-mono font-bold pointer-events-none opacity-80">
                RF FENDER
              </text>

              {/* 11. Right Front Door */}
              <rect
                x="132"
                y="160"
                width="58"
                height="24"
                rx="2"
                onClick={() => handleCycleCondition("rf_door")}
                className={`cursor-pointer transition-colors ${getZoneFill("rf_door")}`}
              />
              <text x="161" y="175" textAnchor="middle" className="fill-current text-[7px] font-mono font-bold pointer-events-none opacity-80">
                RF DOOR
              </text>

              {/* 12. Right Rear Door */}
              <rect
                x="194"
                y="160"
                width="54"
                height="24"
                rx="2"
                onClick={() => handleCycleCondition("rr_door")}
                className={`cursor-pointer transition-colors ${getZoneFill("rr_door")}`}
              />
              <text x="221" y="175" textAnchor="middle" className="fill-current text-[7px] font-mono font-bold pointer-events-none opacity-80">
                RR DOOR
              </text>

              {/* 13. Right Rear Quarter */}
              <rect
                x="252"
                y="160"
                width="50"
                height="24"
                rx="3"
                onClick={() => handleCycleCondition("rr_quarter")}
                className={`cursor-pointer transition-colors ${getZoneFill("rr_quarter")}`}
              />
              <text x="277" y="175" textAnchor="middle" className="fill-current text-[7px] font-mono font-bold pointer-events-none opacity-80">
                RR QTR
              </text>
            </svg>
          </div>

          <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">
            {editable
              ? "CLICK ANY BODY PANEL TO CYCLE CONDITION (OEM ➔ RESPRAY ➔ REPLACED)"
              : "CLICK ANY BODY PANEL TO INSPECT ULTRASONIC MICRON GAUGE READING"}
          </p>
        </div>

        {/* Right 5 Cols: Selected Zone Readout + Structural Pillar & Airbag Matrix */}
        <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-[#E2E0D8] dark:divide-[#1F2430]">
          {/* Active Panel Gauge Readout */}
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                  SELECTED PANEL TELEMETRY
                </span>
                <h4 className="text-sm font-bold text-[#111318] dark:text-white mt-0.5">
                  {selectedZone.label}
                </h4>
                <span className="text-xs font-dari text-slate-500 dark:text-slate-400 block">
                  {selectedZone.labelDari}
                </span>
              </div>

              <div className="text-end font-mono">
                <span className="text-xl font-bold tabular-nums text-[#111318] dark:text-amber-400 block">
                  {selectedZone.microns} µm
                </span>
                <span
                  className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider border ${
                    selectedZone.condition === "original"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                      : selectedZone.condition === "respray"
                      ? "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30"
                      : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                  }`}
                >
                  {selectedZone.condition === "original"
                    ? "FACTORY OEM PAINT"
                    : selectedZone.condition === "respray"
                    ? "COSMETIC RESPRAY"
                    : "PANEL REPLACED"}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 bg-[#FAF9F6] dark:bg-[#0D1017] p-2.5 rounded border border-[#E2E0D8] dark:border-[#1F2430]">
              {selectedZone.notes}
            </p>

            {editable && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] font-mono uppercase text-slate-400">
                  SET MICRONS:
                </span>
                <input
                  type="range"
                  min={85}
                  max={450}
                  value={selectedZone.microns}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const cond: PanelCondition =
                      val <= 145 ? "original" : val <= 260 ? "respray" : "replaced";
                    const updated = zones.map((z) =>
                      z.id === selectedZone.id
                        ? { ...z, microns: val, condition: cond }
                        : z
                    );
                    setZones(updated);
                    onChangeZones?.(updated);
                  }}
                  className="flex-1 accent-[#111318] dark:accent-amber-500 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* 4-Cell Structural Integrity & Airbag Guarantee Grid */}
          <div className="grid grid-cols-2 gap-px bg-[#E2E0D8] dark:bg-[#1F2430] font-mono text-[11px]">
            <div className="bg-white dark:bg-[#11141B] p-3">
              <span className="text-[9px] text-slate-400 uppercase block">
                CHASSIS RAILS (شاسی)
              </span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="h-3 w-3" />
                100% UNTOUCHED
              </span>
            </div>
            <div className="bg-white dark:bg-[#11141B] p-3">
              <span className="text-[9px] text-slate-400 uppercase block">
                A / B / C PILLARS (ستون‌ها)
              </span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="h-3 w-3" />
                FACTORY WELDS
              </span>
            </div>
            <div className="bg-white dark:bg-[#11141B] p-3">
              <span className="text-[9px] text-slate-400 uppercase block">
                SRS AIRBAGS (ایربگ)
              </span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="h-3 w-3" />
                ALL OEM INTACT
              </span>
            </div>
            <div className="bg-white dark:bg-[#11141B] p-3">
              <span className="text-[9px] text-slate-400 uppercase block">
                FLOOD / RUST AUDIT
              </span>
              <span className="font-bold text-[#111318] dark:text-slate-200 flex items-center gap-1 mt-0.5">
                PASS · DRY GCC/EXPORT
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
