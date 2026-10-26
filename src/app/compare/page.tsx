"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useShowroomStore } from "@/store/useShowroomStore";
import { formatMileage } from "@/lib/utils";
import { translations } from "@/lib/translations";
import { VehicleItem } from "@/lib/mock-data";
import {
  MuiTable,
  MuiTableHead,
  MuiTableBody,
  MuiTableRow,
  MuiTableCell,
  MuiButton,
  MuiChip,
  MuiTextField,
  MenuItem,
  IconButton,
} from "@/components/mui";
import {
  Layers,
  ArrowLeft,
  X,
  Check,
  ShieldCheck,
  Car,
  Plus,
  Trash2,
  Eye,
  Printer,
  Sparkles,
  Award,
} from "lucide-react";

type SpecCategory = "ALL" | "FINANCIAL" | "MECHANICAL" | "CUSTOMS" | "FEATURES";

export default function VehicleComparePage() {
  const {
    vehicles,
    compareIds,
    toggleCompare,
    clearCompare,
    language,
    exchangeRate,
    clientPresentationMode,
    currentRole,
    addToast,
  } = useShowroomStore();
  const t = translations[language];

  const showFinancialMargins =
    !clientPresentationMode &&
    (currentRole === "SuperAdmin" || currentRole === "Accountant");

  const [activeCategory, setActiveCategory] = useState<SpecCategory>("ALL");
  const [highlightDiffsOnly, setHighlightDiffsOnly] = useState(false);

  const comparedVehicles = useMemo(() => {
    return vehicles.filter((v) => compareIds.includes(v.id));
  }, [vehicles, compareIds]);

  const unselectedVehicles = useMemo(() => {
    return vehicles.filter((v) => !compareIds.includes(v.id));
  }, [vehicles, compareIds]);

  const hasDiff = (getter: (v: VehicleItem) => string | number) => {
    if (comparedVehicles.length < 2) return false;
    return new Set(comparedVehicles.map(getter)).size > 1;
  };

  const diffRowClass = (isDifferent: boolean) => {
    if (!highlightDiffsOnly) return "";
    return isDifferent
      ? "bg-amber-500/[0.08] dark:bg-amber-500/[0.12]"
      : "opacity-45 transition-opacity";
  };

  // Calculations for best-in-class highlights
  const minPrice = useMemo(() => {
    if (comparedVehicles.length === 0) return 0;
    return Math.min(...comparedVehicles.map((v) => v.sellingPrice));
  }, [comparedVehicles]);

  const minMileage = useMemo(() => {
    if (comparedVehicles.length === 0) return 0;
    return Math.min(...comparedVehicles.map((v) => v.mileage));
  }, [comparedVehicles]);

  const maxMargin = useMemo(() => {
    if (comparedVehicles.length === 0) return 0;
    return Math.max(
      ...comparedVehicles.map((v) => v.sellingPrice - (v.landedCost || 0))
    );
  }, [comparedVehicles]);

  // Handle swapping a vehicle in an existing slot
  const handleSwapVehicle = (currentId: string, newId: string) => {
    if (currentId === newId) return;
    toggleCompare(currentId);
    toggleCompare(newId);
    addToast("Vehicle replaced in comparison slot", "info");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 space-y-4 pb-16">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#262F40] print:hidden">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-0.5">
            <Link href="/" className="hover:text-[var(--theme-primary)] transition-colors">
              {t.tabShowroom}
            </Link>
            <span>/</span>
            <Link
              href="/inventory"
              className="hover:text-[var(--theme-primary)] transition-colors"
            >
              {t.tabInventory}
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">
              {language === "ps"
                ? "د موټرونو پرتله"
                : language === "fa"
                ? "مقایسه مشخصات موترها"
                : "Fleet Comparison"}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-[var(--theme-primary)]" />
            <span>
              {language === "ps"
                ? `د موټرونو مخامخ پرتله (${comparedVehicles.length} له 3)`
                : language === "fa"
                ? `مقایسه تخصصی مشخصات ناوگان (${comparedVehicles.length} از ۳)`
                : `Side-by-Side Fleet Specification Audit (${comparedVehicles.length} of 3)`}
            </span>
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {language === "ps"
              ? "تخنیکي مشخصات، قیمتونه، د اسلام قلعه ګمرک او اسانتیاوې پرتله کړئ."
              : language === "fa"
              ? "مقایسه دقیق مشخصات فنی، قیمت نمایشگاه، اسناد گمرکی اسلام قلعه و آپشن‌های فابریک."
              : "Head-to-head comparison of mechanical specs, showroom pricing, Islam Qala customs clearance, and equipment."}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <MuiButton
            variant="outlined"
            size="small"
            onClick={() => window.print()}
            startIcon={<Printer className="h-3.5 w-3.5" />}
            sx={{ fontSize: "11px", py: "3px" }}
          >
            {language === "ps"
              ? "چاپ کړئ"
              : language === "fa"
              ? "چاپ جدول مقایسه"
              : "Print Comparison Dossier"}
          </MuiButton>

          {comparedVehicles.length > 0 && (
            <MuiButton
              variant="outlined"
              color="error"
              size="small"
              onClick={clearCompare}
              startIcon={<Trash2 className="h-3.5 w-3.5" />}
              sx={{ fontSize: "11px", py: "3px" }}
            >
              {t.filterClear}
            </MuiButton>
          )}

          <MuiButton
            component={Link}
            href="/inventory"
            variant="contained"
            color="primary"
            size="small"
            startIcon={<ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />}
            sx={{ fontSize: "11px", py: "3px" }}
          >
            {t.tabInventory}
          </MuiButton>
        </div>
      </div>

      {/* Main Comparison Area */}
      {comparedVehicles.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-[#262F40] bg-white dark:bg-[#161B26] space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] flex items-center justify-center">
            <Layers className="h-6 w-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {language === "ps"
                ? "د پرتله کولو لپاره هیڅ موټر ندی ټاکل شوی"
                : language === "fa"
                ? "هیچ موتری برای مقایسه انتخاب نشده است"
                : "No vehicles currently selected for comparison"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {language === "ps"
                ? "تر ۳ پورې موټرونه وټاکئ ترڅو مشخصات او قیمتونه یو بل سره پرتله کړئ."
                : language === "fa"
                ? "حداکثر تا ۳ موتر را انتخاب کنید تا مشخصات فنی و قیمت‌ها را کنار هم بررسی نمایید."
                : "Pick up to 3 vehicles to analyze specifications, customs clearance, and pricing side-by-side."}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-2">
            {vehicles.slice(0, 3).map((v) => (
              <MuiButton
                key={v.id}
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => toggleCompare(v.id)}
                startIcon={<Plus className="h-3 w-3" />}
                sx={{ fontSize: "11px", py: "3px" }}
              >
                + {v.year} {v.make} {v.model}
              </MuiButton>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Controls Bar: Category Filter & Difference Highlighter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2 rounded-xl bg-slate-100/80 dark:bg-[#121722] border border-slate-200 dark:border-[#262F40] print:hidden">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {[
                {
                  id: "ALL",
                  label:
                    language === "ps"
                      ? "ټول مشخصات"
                      : language === "fa"
                      ? "همه مشخصات"
                      : "All Specifications",
                },
                {
                  id: "FINANCIAL",
                  label:
                    language === "ps"
                      ? "بیه او ارزښت"
                      : language === "fa"
                      ? "قیمت و ارزش"
                      : "Pricing & Valuation",
                },
                {
                  id: "MECHANICAL",
                  label:
                    language === "ps"
                      ? "انجن او تخنیکي"
                      : language === "fa"
                      ? "فنی و پیشرانه"
                      : "Powertrain & Mechanical",
                },
                {
                  id: "CUSTOMS",
                  label:
                    language === "ps"
                      ? "ګمرک او اسناد"
                      : language === "fa"
                      ? "گمرک و اصالت"
                      : "Gomrok & Provenance",
                },
                {
                  id: "FEATURES",
                  label:
                    language === "ps"
                      ? "آپشنونه"
                      : language === "fa"
                      ? "آپشن‌ها و تجهیزات"
                      : "Features & Options",
                },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id as SpecCategory)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    activeCategory === cat.id
                      ? "bg-white dark:bg-[#161B26] text-[var(--theme-primary)] shadow-2xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHighlightDiffsOnly(!highlightDiffsOnly)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border cursor-pointer ${
                  highlightDiffsOnly
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/40"
                    : "bg-white dark:bg-[#161B26] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#262F40]"
                }`}
              >
                <Sparkles className="h-3 w-3" />
                <span>
                  {language === "ps"
                    ? "توپیرونه روښانه کړئ"
                    : language === "fa"
                    ? "برجسته‌سازی تفاوت‌ها"
                    : "Highlight Differences"}
                </span>
              </button>
            </div>
          </div>

          {/* Quick Picker Bar for remaining slots */}
          {comparedVehicles.length < 3 && unselectedVehicles.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto p-2.5 rounded-xl bg-slate-50 dark:bg-[#121722] border border-slate-200 dark:border-[#262F40] print:hidden">
              <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap ps-1">
                {language === "ps"
                  ? "+ بل موټر اضافه کړئ:"
                  : language === "fa"
                  ? "+ افزودن موتر به مقایسه:"
                  : "+ Add vehicle to comparison:"}
              </span>
              {unselectedVehicles.slice(0, 6).map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => toggleCompare(v.id)}
                  className="flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-lg bg-white dark:bg-[#161B26] border border-slate-200 dark:border-[#262F40] text-slate-700 dark:text-slate-200 hover:border-[var(--theme-primary)] transition-colors shrink-0 cursor-pointer shadow-2xs"
                >
                  <Plus className="h-3 w-3 text-[var(--theme-primary)]" />
                  <span>
                    {v.year} {v.make} {v.model}
                  </span>
                  <span className="font-mono tabular-nums text-slate-400 text-[10px]">
                    ${v.sellingPrice.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Side-by-Side Comparison Matrix */}
          <div className="rounded-2xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] shadow-xs overflow-hidden print:border-none print:shadow-none">
            <div className="overflow-x-auto">
              <MuiTable dense size="small" className="w-full">
                <MuiTableHead>
                  <MuiTableRow className="bg-slate-50/70 dark:bg-[#121722]">
                    <MuiTableCell className="w-56 font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                      Vehicle & Specification
                    </MuiTableCell>
                    {comparedVehicles.map((v) => (
                      <MuiTableCell key={v.id} className="min-w-[240px] pb-3 align-top">
                        <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden mb-2 border border-slate-200 dark:border-[#262F40] shadow-xs bg-slate-100 dark:bg-slate-800">
                          {v.images[0] ? (
                            <Image
                              src={v.images[0]}
                              alt={v.model}
                              fill
                              referrerPolicy="no-referrer"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Car className="h-8 w-8 opacity-40" />
                            </div>
                          )}
                          <IconButton
                            size="small"
                            aria-label="Remove from comparison"
                            onClick={() => toggleCompare(v.id)}
                            className="!absolute !top-1.5 !end-1.5 !bg-black/60 !text-white hover:!bg-black/80 !p-1 print:hidden"
                            title="Remove from comparison"
                          >
                            <X className="h-3.5 w-3.5" />
                          </IconButton>
                          <div className="absolute bottom-1.5 start-1.5">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[var(--theme-primary)] text-white">
                              {v.status}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {v.year} {v.make} {v.model}
                          </h4>
                          <div className="text-[11px] text-slate-500 truncate">
                            {v.trim || "GCC Spec"}
                          </div>
                          <div className="font-mono text-[10px] text-slate-400">
                            Stock: {v.stockNumber}
                          </div>
                        </div>

                        {/* Quick Swap Dropdown */}
                        <div className="mt-2 print:hidden">
                          <MuiTextField
                            select
                            size="small"
                            fullWidth
                            aria-label="Swap comparison vehicle"
                            value={v.id}
                            onChange={(e) => handleSwapVehicle(v.id, e.target.value)}
                            sx={{
                              fontSize: "11px",
                              "& .MuiSelect-select": { py: "2px", fontSize: "11px" },
                            }}
                          >
                            <MenuItem value={v.id}>
                              Active: {v.year} {v.make} {v.model}
                            </MenuItem>
                            {unselectedVehicles.map((u) => (
                              <MenuItem key={u.id} value={u.id}>
                                Swap with: {u.year} {u.make} {u.model} ($
                                {u.sellingPrice.toLocaleString()})
                              </MenuItem>
                            ))}
                          </MuiTextField>
                        </div>

                        <div className="mt-2 flex gap-1.5 print:hidden">
                          <MuiButton
                            component={Link}
                            href={`/vehicles/${v.id}`}
                            variant="contained"
                            color="primary"
                            size="small"
                            fullWidth
                            sx={{ fontSize: "11px", py: "3px" }}
                            startIcon={<Eye className="h-3 w-3" />}
                          >
                            {t.viewDetails}
                          </MuiButton>
                          <MuiButton
                            component={Link}
                            href={`/verify?vin=${v.vin}`}
                            variant="outlined"
                            color="inherit"
                            size="small"
                            sx={{ py: "3px", px: "6px" }}
                            title="Verify Certificate"
                          >
                            <ShieldCheck className="h-3 w-3 text-[var(--theme-primary)]" />
                          </MuiButton>
                        </div>
                      </MuiTableCell>
                    ))}
                  </MuiTableRow>
                </MuiTableHead>

                <MuiTableBody>
                  {/* SECTION 1: FINANCIAL & PRICING */}
                  {(activeCategory === "ALL" || activeCategory === "FINANCIAL") && (
                    <>
                      <MuiTableRow className="bg-slate-100/50 dark:bg-slate-800/30">
                        <MuiTableCell
                          colSpan={comparedVehicles.length + 1}
                          className="py-1.5 text-[10px] text-[var(--theme-primary)] uppercase font-bold tracking-wider"
                        >
                          Financial & Valuation Audit
                        </MuiTableCell>
                      </MuiTableRow>

                      <MuiTableRow className={diffRowClass(hasDiff((v) => v.sellingPrice))}>
                        <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                          {t.sellingPrice} (USD)
                        </MuiTableCell>
                        {comparedVehicles.map((v) => (
                          <MuiTableCell key={v.id}>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono tabular-nums font-bold text-base text-slate-900 dark:text-white">
                                ${v.sellingPrice.toLocaleString()} USD
                              </span>
                              {v.sellingPrice === minPrice && comparedVehicles.length > 1 && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                  <Award className="h-2.5 w-2.5" /> Best Price
                                </span>
                              )}
                            </div>
                            <div className="font-mono tabular-nums text-xs text-emerald-600 dark:text-emerald-400">
                              ؋ {(v.sellingPrice * exchangeRate).toLocaleString()} AFN
                            </div>
                          </MuiTableCell>
                        ))}
                      </MuiTableRow>

                      {showFinancialMargins && (
                        <>
                          <MuiTableRow className={diffRowClass(hasDiff((v) => v.landedCost))}>
                            <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                              Landed Cost (Customs + Freight)
                            </MuiTableCell>
                            {comparedVehicles.map((v) => (
                              <MuiTableCell
                                key={v.id}
                                className="font-mono tabular-nums text-xs text-slate-600 dark:text-slate-300"
                              >
                                ${v.landedCost?.toLocaleString() || "N/A"} USD
                              </MuiTableCell>
                            ))}
                          </MuiTableRow>

                          <MuiTableRow
                            className={diffRowClass(
                              hasDiff((v) => v.sellingPrice - (v.landedCost || 0))
                            )}
                          >
                            <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                              Gross Margin Spread
                            </MuiTableCell>
                            {comparedVehicles.map((v) => {
                              const margin =
                                v.sellingPrice - (v.landedCost || v.purchasePrice || 0);
                              const marginPct = (
                                (margin / (v.landedCost || v.purchasePrice || 1)) *
                                100
                              ).toFixed(1);

                              return (
                                <MuiTableCell key={v.id}>
                                  <div className="flex items-center gap-1 flex-wrap">
                                    <MuiChip
                                      label={`+$${margin.toLocaleString()} (${marginPct}%)`}
                                      color="success"
                                      size="small"
                                    />
                                    {margin === maxMargin && comparedVehicles.length > 1 && (
                                      <span className="text-[10px] text-emerald-600 font-bold">
                                        ★ Top Margin
                                      </span>
                                    )}
                                  </div>
                                </MuiTableCell>
                              );
                            })}
                          </MuiTableRow>

                          <MuiTableRow className={diffRowClass(hasDiff((v) => v.purchasePrice))}>
                            <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                              FOB Purchase Price
                            </MuiTableCell>
                            {comparedVehicles.map((v) => (
                              <MuiTableCell
                                key={v.id}
                                className="font-mono tabular-nums text-xs text-slate-500"
                              >
                                ${v.purchasePrice?.toLocaleString() || "N/A"} USD
                              </MuiTableCell>
                            ))}
                          </MuiTableRow>
                        </>
                      )}
                    </>
                  )}

                  {/* SECTION 2: MECHANICAL & POWERTRAIN */}
                  {(activeCategory === "ALL" || activeCategory === "MECHANICAL") && (
                    <>
                      <MuiTableRow className="bg-slate-100/50 dark:bg-slate-800/30">
                        <MuiTableCell
                          colSpan={comparedVehicles.length + 1}
                          className="py-1.5 text-[10px] text-[var(--theme-primary)] uppercase font-bold tracking-wider"
                        >
                          Mechanical Specifications & Powertrain
                        </MuiTableCell>
                      </MuiTableRow>

                      <MuiTableRow className={diffRowClass(hasDiff((v) => v.mileage))}>
                        <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                          {t.mileage}
                        </MuiTableCell>
                        {comparedVehicles.map((v) => (
                          <MuiTableCell
                            key={v.id}
                            className="font-mono tabular-nums text-xs font-semibold"
                          >
                            <div className="flex items-center gap-1.5">
                              <span>{formatMileage(v.mileage)}</span>
                              {v.mileage === minMileage && comparedVehicles.length > 1 && (
                                <span className="text-[9px] font-bold text-[var(--theme-primary)] bg-[var(--theme-primary)]/10 px-1 rounded">
                                  Lowest KM
                                </span>
                              )}
                            </div>
                          </MuiTableCell>
                        ))}
                      </MuiTableRow>

                      <MuiTableRow
                        className={diffRowClass(
                          hasDiff((v) => `${v.fuelType}-${v.transmission}`)
                        )}
                      >
                        <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                          Fuel Type & Transmission
                        </MuiTableCell>
                        {comparedVehicles.map((v) => (
                          <MuiTableCell key={v.id} className="text-xs">
                            <span className="font-semibold">{v.fuelType}</span> •{" "}
                            {v.transmission}
                          </MuiTableCell>
                        ))}
                      </MuiTableRow>

                      <MuiTableRow
                        className={diffRowClass(
                          hasDiff((v) => `${v.driveType}-${v.steering}`)
                        )}
                      >
                        <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                          Drivetrain & Steering
                        </MuiTableCell>
                        {comparedVehicles.map((v) => (
                          <MuiTableCell key={v.id} className="text-xs">
                            <span className="font-mono font-semibold">{v.driveType}</span> •{" "}
                            {v.steering}
                          </MuiTableCell>
                        ))}
                      </MuiTableRow>

                      <MuiTableRow className={diffRowClass(hasDiff((v) => v.color))}>
                        <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                          {t.color}
                        </MuiTableCell>
                        {comparedVehicles.map((v) => (
                          <MuiTableCell key={v.id} className="text-xs font-medium">
                            {v.color}
                          </MuiTableCell>
                        ))}
                      </MuiTableRow>
                    </>
                  )}

                  {/* SECTION 3: CUSTOMS & PROVENANCE */}
                  {(activeCategory === "ALL" || activeCategory === "CUSTOMS") && (
                    <>
                      <MuiTableRow className="bg-slate-100/50 dark:bg-slate-800/30">
                        <MuiTableCell
                          colSpan={comparedVehicles.length + 1}
                          className="py-1.5 text-[10px] text-[var(--theme-primary)] uppercase font-bold tracking-wider"
                        >
                          Customs Clearance & Afghan Legal Status
                        </MuiTableCell>
                      </MuiTableRow>

                      <MuiTableRow className={diffRowClass(hasDiff((v) => v.originCountry))}>
                        <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                          Country of Origin
                        </MuiTableCell>
                        {comparedVehicles.map((v) => (
                          <MuiTableCell key={v.id} className="text-xs font-semibold">
                            {v.originCountry}
                          </MuiTableCell>
                        ))}
                      </MuiTableRow>

                      <MuiTableRow
                        className={diffRowClass(hasDiff((v) => v.customsClearance))}
                      >
                        <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                          Islam Qala Gomrok Clearance
                        </MuiTableCell>
                        {comparedVehicles.map((v) => (
                          <MuiTableCell key={v.id} className="text-xs">
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                              <Check className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{v.customsClearance}</span>
                            </div>
                          </MuiTableCell>
                        ))}
                      </MuiTableRow>

                      <MuiTableRow className={diffRowClass(hasDiff((v) => v.vin))}>
                        <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                          {t.vinNumber}
                        </MuiTableCell>
                        {comparedVehicles.map((v) => (
                          <MuiTableCell key={v.id} className="font-mono text-xs text-slate-500">
                            {v.vin}
                          </MuiTableCell>
                        ))}
                      </MuiTableRow>

                      <MuiTableRow
                        className={diffRowClass(
                          hasDiff((v) => v.yardLocation || "Bagh-e-Azadi")
                        )}
                      >
                        <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                          Showroom Lot Bay
                        </MuiTableCell>
                        {comparedVehicles.map((v) => (
                          <MuiTableCell
                            key={v.id}
                            className="text-xs text-slate-600 dark:text-slate-300"
                          >
                            {v.yardLocation || "Bagh-e-Azadi"}
                          </MuiTableCell>
                        ))}
                      </MuiTableRow>
                    </>
                  )}

                  {/* SECTION 4: EQUIPPED FEATURES */}
                  {(activeCategory === "ALL" || activeCategory === "FEATURES") && (
                    <>
                      <MuiTableRow className="bg-slate-100/50 dark:bg-slate-800/30">
                        <MuiTableCell
                          colSpan={comparedVehicles.length + 1}
                          className="py-1.5 text-[10px] text-[var(--theme-primary)] uppercase font-bold tracking-wider"
                        >
                          Factory Equipment & Options
                        </MuiTableCell>
                      </MuiTableRow>

                      <MuiTableRow
                        className={diffRowClass(
                          hasDiff((v) => [...v.features].sort().join("|"))
                        )}
                      >
                        <MuiTableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                          Features List
                        </MuiTableCell>
                        {comparedVehicles.map((v) => (
                          <MuiTableCell key={v.id}>
                            <div className="flex flex-wrap gap-1 max-w-[280px]">
                              {v.features.map((f, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#262F40] font-medium"
                                >
                                  {f}
                                </span>
                              ))}
                            </div>
                          </MuiTableCell>
                        ))}
                      </MuiTableRow>
                    </>
                  )}
                </MuiTableBody>
              </MuiTable>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
