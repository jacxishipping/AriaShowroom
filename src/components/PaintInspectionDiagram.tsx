"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, CheckCircle2, Crosshair, RotateCcw } from "lucide-react";
import { useShowroomStore } from "@/store/useShowroomStore";

export type PanelCondition = "original" | "respray" | "replaced";
export type StoredPaintCondition = "original" | "repaint" | "putty" | "replaced";

export interface PanelZoneState {
  id: string;
  label: string;
  labelDari: string;
  labelPashto: string;
  microns: number;
  condition: PanelCondition;
  notes: string;
}

export const DEFAULT_PANEL_ZONES: PanelZoneState[] = [
  {
    id: "hood",
    label: "Engine Hood (Bonnet)",
    labelDari: "کاپوت جلو",
    labelPashto: "مخکینی بانټ",
    microns: 112,
    condition: "original",
    notes: "Factory OEM clearcoat, zero stone-chip respray.",
  },
  {
    id: "roof",
    label: "Roof & Sunroof Frame",
    labelDari: "سقف و چارچوب سانروف",
    labelPashto: "چت او سنروف چوکاټ",
    microns: 108,
    condition: "original",
    notes: "Original factory pillar & roof weld seams verified.",
  },
  {
    id: "trunk",
    label: "Rear Tailgate / Trunk",
    labelDari: "درب صندوق عقب",
    labelPashto: "شا ډاله / صندوق",
    microns: 115,
    condition: "original",
    notes: "Factory seal intact, original tailgate glass.",
  },
  {
    id: "front_bumper",
    label: "Front Bumper & Grille",
    labelDari: "سپر و جلوپنجره",
    labelPashto: "مخکینی بمپر او جالۍ",
    microns: 118,
    condition: "original",
    notes: "OEM sensors & radar emblem calibrated.",
  },
  {
    id: "rear_bumper",
    label: "Rear Bumper & Tow Hitch",
    labelDari: "سپر عقب",
    labelPashto: "شا بمپر",
    microns: 120,
    condition: "original",
    notes: "Factory paint, no rear impact.",
  },
  {
    id: "lf_fender",
    label: "Left Front Fender",
    labelDari: "گلگیر جلو چپ",
    labelPashto: "مخکینی چپ مډګارډ",
    microns: 110,
    condition: "original",
    notes: "Factory bolts unturned.",
  },
  {
    id: "rf_fender",
    label: "Right Front Fender",
    labelDari: "گلگیر جلو راست",
    labelPashto: "مخکینی ښی مډګارډ",
    microns: 114,
    condition: "original",
    notes: "Factory bolts unturned.",
  },
  {
    id: "lf_door",
    label: "Left Front Door (Driver)",
    labelDari: "درب جلو چپ (راننده)",
    labelPashto: "مخکینۍ چپه دروازه (چلوونکی)",
    microns: 112,
    condition: "original",
    notes: "VIN sticker intact on B-pillar.",
  },
  {
    id: "rf_door",
    label: "Right Front Door (Passenger)",
    labelDari: "درب جلو راست (شاگرد)",
    labelPashto: "مخکینۍ ښۍ دروازه",
    microns: 116,
    condition: "original",
    notes: "Original acoustic glass & seam sealer.",
  },
  {
    id: "lr_door",
    label: "Left Rear Door",
    labelDari: "درب عقب چپ",
    labelPashto: "شا چپه دروازه",
    microns: 111,
    condition: "original",
    notes: "Factory paint thickness.",
  },
  {
    id: "rr_door",
    label: "Right Rear Door",
    labelDari: "درب عقب راست",
    labelPashto: "شا ښۍ دروازه",
    microns: 185,
    condition: "respray",
    notes: "Minor port scratch cosmetic clearcoat blend (no putty).",
  },
  {
    id: "lr_quarter",
    label: "Left Rear Quarter Panel",
    labelDari: "گلگیر عقب چپ",
    labelPashto: "شا چپ مډګارډ",
    microns: 115,
    condition: "original",
    notes: "Factory spot welds verified inside wheel arch.",
  },
  {
    id: "rr_quarter",
    label: "Right Rear Quarter Panel",
    labelDari: "گلگیر عقب راست",
    labelPashto: "شا ښی مډګارډ",
    microns: 118,
    condition: "original",
    notes: "Factory spot welds verified.",
  },
];

function buildZones(
  cleanTitle: boolean,
  initialZones?: PanelZoneState[],
  savedZoneMap?: Record<string, StoredPaintCondition>
): PanelZoneState[] {
  if (initialZones && initialZones.length > 0) return initialZones;

  return DEFAULT_PANEL_ZONES.map((z) => {
    const saved = savedZoneMap?.[z.id];
    if (saved) {
      const cond: PanelCondition =
        saved === "original" ? "original" : saved === "replaced" ? "replaced" : "respray";
      const microns = cond === "original" ? 112 : cond === "respray" ? 210 : 340;
      const notes =
        cond === "original"
          ? "Factory OEM paint verified with Elcometer digital gauge."
          : cond === "respray"
          ? "Cosmetic second-layer respray recorded during PDI."
          : "Replaced panel / body filler detected (>300 µm).";
      return { ...z, condition: cond, microns, notes };
    }

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
}

export function zonesToStoredMap(
  zones: PanelZoneState[]
): Record<string, StoredPaintCondition> {
  const map: Record<string, StoredPaintCondition> = {};
  for (const z of zones) {
    map[z.id] =
      z.condition === "original"
        ? "original"
        : z.condition === "respray"
        ? "repaint"
        : "replaced";
  }
  return map;
}

interface PaintInspectionDiagramProps {
  vin?: string;
  cleanTitle?: boolean;
  editable?: boolean;
  initialZones?: PanelZoneState[];
  savedZoneMap?: Record<string, StoredPaintCondition>;
  onChangeZones?: (
    zones: PanelZoneState[],
    zoneMap: Record<string, StoredPaintCondition>
  ) => void;
}

export function PaintInspectionDiagram({
  vin,
  cleanTitle = true,
  editable = false,
  initialZones,
  savedZoneMap,
  onChangeZones,
}: PaintInspectionDiagramProps) {
  const { language } = useShowroomStore();

  const [zones, setZones] = useState<PanelZoneState[]>(() =>
    buildZones(cleanTitle, initialZones, savedZoneMap)
  );
  const [selectedId, setSelectedId] = useState<string>("hood");

  const serializedMap = savedZoneMap ? JSON.stringify(savedZoneMap) : "";

  useEffect(() => {
    setZones(buildZones(cleanTitle, initialZones, savedZoneMap));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vin, cleanTitle, serializedMap]);

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
    onChangeZones?.(nextZones, zonesToStoredMap(nextZones));
  };

  const handleResetAllOriginal = () => {
    const reset = DEFAULT_PANEL_ZONES.map((z) => ({
      ...z,
      condition: "original" as PanelCondition,
      microns: 110 + (z.id.length % 9),
      notes: "Factory OEM paint verified with Elcometer digital gauge.",
    }));
    setZones(reset);
    onChangeZones?.(reset, zonesToStoredMap(reset));
  };

  const getPanelA11yProps = (zoneId: string) => {
    const zone = zones.find((z) => z.id === zoneId);
    const zoneName =
      language === "ps"
        ? zone?.labelPashto || zone?.label
        : language === "fa"
        ? zone?.labelDari || zone?.label
        : zone?.label || zoneId;
    return {
      role: "button" as const,
      tabIndex: 0,
      "aria-label": `${zoneName}: ${zone?.condition || "original"} (${zone?.microns || 112} µm)`,
      onClick: () => handleCycleCondition(zoneId),
      onKeyDown: (e: React.KeyboardEvent<SVGElement>) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCycleCondition(zoneId);
        }
      },
      className: `cursor-pointer transition-colors focus:outline-none focus-visible:stroke-[#1A73E8] ${getZoneFill(
        zoneId
      )}`,
    };
  };

  const originalCount = zones.filter((z) => z.condition === "original").length;
  const resprayCount = zones.filter((z) => z.condition === "respray").length;
  const replacedCount = zones.filter((z) => z.condition === "replaced").length;

  return (
    <div className="rounded-lg border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] overflow-hidden">
      {/* Header Bar */}
      <div className="px-4 py-2.5 border-b border-slate-200 dark:border-[#262F40] bg-slate-50/80 dark:bg-[#121722] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Crosshair className="h-3.5 w-3.5 text-[#1A73E8] dark:text-[#8AB4F8]" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            {language === "ps"
              ? "د موټر رنګ او شاسي معاینه"
              : language === "fa"
              ? "گزارش معاینه رنگ، شاسی و ایربگ‌ها"
              : "Ultrasonic Paint & Chassis Dossier"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-mono tabular-nums text-[10px]">
          <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
            <span className="h-2 w-2 rounded-xs bg-emerald-500" />
            {language === "ps" ? "اصلي" : language === "fa" ? "فابریک" : "OEM"}: {originalCount}
          </span>
          <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold">
            <span className="h-2 w-2 rounded-xs bg-amber-500" />
            {language === "ps" ? "رنګ شوی" : language === "fa" ? "رنگ‌شده" : "Respray"}: {resprayCount}
          </span>
          <span className="inline-flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-semibold">
            <span className="h-2 w-2 rounded-xs bg-rose-500" />
            {language === "ps" ? "تبدیل" : language === "fa" ? "تعویض" : "Replaced"}: {replacedCount}
          </span>
          {editable && (
            <button
              type="button"
              onClick={handleResetAllOriginal}
              className="ms-2 inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-200 dark:border-[#262F40] hover:border-[#1A73E8] text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              <span>{language === "ps" ? "ټول اصلي" : language === "fa" ? "همه فابریک" : "ALL OEM"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-[#262F40] rtl:divide-x-reverse">
        {/* Left 7 Cols: Interactive Top-Down Vehicle Blueprint */}
        <div className="lg:col-span-7 p-4 bg-slate-50/50 dark:bg-[#0F141C] flex flex-col items-center justify-center">
          <div className="w-full max-w-md" dir="ltr">
            <svg
              viewBox="0 0 360 220"
              className="w-full h-auto select-none"
              role="group"
              aria-label="Top-down vehicle body panel inspection diagram"
            >
              <line x1="0" y1="110" x2="360" y2="110" className="stroke-slate-300/50 dark:stroke-slate-800" strokeDasharray="3 3" />
              <line x1="180" y1="0" x2="180" y2="220" className="stroke-slate-300/50 dark:stroke-slate-800" strokeDasharray="3 3" />

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
              <path d="M 42 56 Q 32 110 42 164 L 56 160 L 56 60 Z" {...getPanelA11yProps("front_bumper")} />

              {/* 2. Engine Hood */}
              <rect x="60" y="62" width="68" height="96" rx="4" {...getPanelA11yProps("hood")} />
              <text x="94" y="113" textAnchor="middle" className="fill-current text-[9px] font-mono font-bold pointer-events-none opacity-80">
                HOOD
              </text>

              {/* Windshield */}
              <polygon
                points="132,64 150,72 150,148 132,156"
                className="fill-slate-300/50 dark:fill-slate-800/80 stroke-slate-400/50 dark:stroke-slate-700"
              />

              {/* 3. Roof */}
              <rect x="154" y="72" width="92" height="76" rx="3" {...getPanelA11yProps("roof")} />
              <text x="200" y="113" textAnchor="middle" className="fill-current text-[9px] font-mono font-bold pointer-events-none opacity-80">
                ROOF
              </text>

              {/* Rear Glass */}
              <polygon
                points="250,72 266,66 266,154 250,148"
                className="fill-slate-300/50 dark:fill-slate-800/80 stroke-slate-400/50 dark:stroke-slate-700"
              />

              {/* 4. Rear Tailgate / Trunk */}
              <rect x="270" y="64" width="32" height="92" rx="3" {...getPanelA11yProps("trunk")} />
              <text x="286" y="113" textAnchor="middle" className="fill-current text-[8px] font-mono font-bold pointer-events-none opacity-80">
                TAIL
              </text>

              {/* 5. Rear Bumper */}
              <path d="M 306 60 L 318 64 Q 324 110 318 156 L 306 160 Z" {...getPanelA11yProps("rear_bumper")} />

              {/* 6. Left Front Fender */}
              <rect x="60" y="36" width="68" height="22" rx="3" {...getPanelA11yProps("lf_fender")} />
              <text x="94" y="50" textAnchor="middle" className="fill-current text-[7px] font-mono font-bold pointer-events-none opacity-80">
                LF FENDER
              </text>

              {/* 7. Left Front Door */}
              <rect x="132" y="36" width="58" height="24" rx="2" {...getPanelA11yProps("lf_door")} />
              <text x="161" y="51" textAnchor="middle" className="fill-current text-[7px] font-mono font-bold pointer-events-none opacity-80">
                LF DOOR
              </text>

              {/* 8. Left Rear Door */}
              <rect x="194" y="36" width="54" height="24" rx="2" {...getPanelA11yProps("lr_door")} />
              <text x="221" y="51" textAnchor="middle" className="fill-current text-[7px] font-mono font-bold pointer-events-none opacity-80">
                LR DOOR
              </text>

              {/* 9. Left Rear Quarter */}
              <rect x="252" y="36" width="50" height="24" rx="3" {...getPanelA11yProps("lr_quarter")} />
              <text x="277" y="51" textAnchor="middle" className="fill-current text-[7px] font-mono font-bold pointer-events-none opacity-80">
                LR QTR
              </text>

              {/* 10. Right Front Fender */}
              <rect x="60" y="162" width="68" height="22" rx="3" {...getPanelA11yProps("rf_fender")} />
              <text x="94" y="176" textAnchor="middle" className="fill-current text-[7px] font-mono font-bold pointer-events-none opacity-80">
                RF FENDER
              </text>

              {/* 11. Right Front Door */}
              <rect x="132" y="160" width="58" height="24" rx="2" {...getPanelA11yProps("rf_door")} />
              <text x="161" y="175" textAnchor="middle" className="fill-current text-[7px] font-mono font-bold pointer-events-none opacity-80">
                RF DOOR
              </text>

              {/* 12. Right Rear Door */}
              <rect x="194" y="160" width="54" height="24" rx="2" {...getPanelA11yProps("rr_door")} />
              <text x="221" y="175" textAnchor="middle" className="fill-current text-[7px] font-mono font-bold pointer-events-none opacity-80">
                RR DOOR
              </text>

              {/* 13. Right Rear Quarter */}
              <rect x="252" y="160" width="50" height="24" rx="3" {...getPanelA11yProps("rr_quarter")} />
              <text x="277" y="175" textAnchor="middle" className="fill-current text-[7px] font-mono font-bold pointer-events-none opacity-80">
                RR QTR
              </text>
            </svg>
          </div>

          <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1 text-center">
            {editable
              ? language === "ps"
                ? "په هره برخه کلیک وکړئ ترڅو وضعیت بدل شي (اصلي / رنګ / تبدیل)"
                : language === "fa"
                ? "روی هر قطعه کلیک کنید تا وضعیت رنگ تغییر کند (فابریک / رنگ / تعویض)"
                : "Click or press Enter on any panel to cycle condition (OEM -> Respray -> Replaced)"
              : language === "ps"
              ? "د رنګ ضخامت لیدلو لپاره په برخه کلیک وکړئ"
              : language === "fa"
              ? "برای مشاهده ضخامت رنگ روی هر قطعه کلیک کنید"
              : "Click any body panel to inspect ultrasonic micron gauge reading"}
          </p>
        </div>

        {/* Right 5 Cols: Selected Zone Readout + Structural Matrix */}
        <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-slate-200 dark:divide-[#262F40]">
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                  {language === "ps"
                    ? "ټاکل شوې برخه"
                    : language === "fa"
                    ? "قطعه انتخاب‌شده"
                    : "SELECTED PANEL TELEMETRY"}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {language === "ps"
                    ? selectedZone.labelPashto
                    : language === "fa"
                    ? selectedZone.labelDari
                    : selectedZone.label}
                </h4>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                  {language === "en" ? selectedZone.labelDari : selectedZone.label}
                </span>
              </div>

              <div className="text-end font-mono">
                <span className="text-xl font-bold tabular-nums text-slate-900 dark:text-white block">
                  {selectedZone.microns} µm
                </span>
                <span
                  className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                    selectedZone.condition === "original"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                      : selectedZone.condition === "respray"
                      ? "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30"
                      : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                  }`}
                >
                  {selectedZone.condition === "original"
                    ? language === "ps"
                      ? "اصلي فابریک رنګ"
                      : language === "fa"
                      ? "رنگ فابریک کارخانه"
                      : "FACTORY OEM PAINT"
                    : selectedZone.condition === "respray"
                    ? language === "ps"
                      ? "دوهم لاس رنګ"
                      : language === "fa"
                      ? "رنگ‌شدگی جزئی"
                      : "COSMETIC RESPRAY"
                    : language === "ps"
                    ? "برخه بدله شوې"
                    : language === "fa"
                    ? "قطعه تعویضی"
                    : "PANEL REPLACED"}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#121722] p-2.5 rounded border border-slate-200 dark:border-[#262F40]">
              {selectedZone.notes}
            </p>

            {editable && (
              <div className="flex items-center gap-2 pt-1">
                <label
                  htmlFor="paint-micron-slider"
                  className="text-[10px] font-mono uppercase text-slate-400"
                >
                  {language === "ps" ? "ضخامت:" : language === "fa" ? "ضخامت:" : "SET MICRONS:"}
                </label>
                <input
                  id="paint-micron-slider"
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
                    onChangeZones?.(updated, zonesToStoredMap(updated));
                  }}
                  className="flex-1 accent-[#1A73E8] cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* 4-Cell Structural Integrity & Airbag Guarantee Grid */}
          <div className="grid grid-cols-2 gap-px bg-slate-200 dark:bg-[#262F40] font-mono text-[11px]">
            <div className="bg-white dark:bg-[#161B26] p-3">
              <span className="text-[9px] text-slate-400 uppercase block">
                {language === "ps" ? "شاسي (CHASSIS)" : language === "fa" ? "شاسی (CHASSIS)" : "CHASSIS RAILS"}
              </span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="h-3 w-3 shrink-0" />
                <span>{language === "ps" ? "۱۰۰٪ سالم" : language === "fa" ? "۱۰۰٪ پلمپ" : "100% UNTOUCHED"}</span>
              </span>
            </div>
            <div className="bg-white dark:bg-[#161B26] p-3">
              <span className="text-[9px] text-slate-400 uppercase block">
                {language === "ps" ? "ستونونه (PILLARS)" : language === "fa" ? "ستون‌ها (PILLARS)" : "A / B / C PILLARS"}
              </span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="h-3 w-3 shrink-0" />
                <span>{language === "ps" ? "فابریک ویلډینګ" : language === "fa" ? "جوش کارخانه" : "FACTORY WELDS"}</span>
              </span>
            </div>
            <div className="bg-white dark:bg-[#161B26] p-3">
              <span className="text-[9px] text-slate-400 uppercase block">
                {language === "ps" ? "ایربګونه (AIRBAGS)" : language === "fa" ? "ایربگ‌ها (AIRBAGS)" : "SRS AIRBAGS"}
              </span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="h-3 w-3 shrink-0" />
                <span>{language === "ps" ? "ټول فعال" : language === "fa" ? "سالم و فعال" : "ALL OEM INTACT"}</span>
              </span>
            </div>
            <div className="bg-white dark:bg-[#161B26] p-3">
              <span className="text-[9px] text-slate-400 uppercase block">
                {language === "ps" ? "زنګ / اوبه" : language === "fa" ? "زنگ‌زدگی / سیلاب" : "FLOOD / RUST AUDIT"}
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                <span>{language === "ps" ? "تایید شوی" : language === "fa" ? "بدون پوسیدگی" : "PASS · DRY EXPORT"}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
