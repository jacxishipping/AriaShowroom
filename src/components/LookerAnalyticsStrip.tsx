"use client";

import React, { useMemo } from "react";
import { useShowroomStore } from "@/store/useShowroomStore";
import { formatCurrency } from "@/lib/utils";
import { translations } from "@/lib/translations";
import { Filter, X, Globe2, Fuel, Layers } from "lucide-react";

export function LookerAnalyticsStrip() {
  const {
    vehicles,
    chartFilter,
    setChartFilter,
    currency,
    exchangeRate,
    language,
    clientPresentationMode,
    currentRole,
  } = useShowroomStore();
  const t = translations[language];

  const showMargins =
    !clientPresentationMode &&
    (currentRole === "SuperAdmin" || currentRole === "Accountant");

  const originStats = useMemo(() => {
    const map = new Map<string, { count: number; value: number; margin: number }>();
    vehicles.forEach((v) => {
      const prev = map.get(v.originCountry) || { count: 0, value: 0, margin: 0 };
      map.set(v.originCountry, {
        count: prev.count + 1,
        value: prev.value + v.sellingPrice,
        margin: prev.margin + (v.sellingPrice - v.landedCost),
      });
    });
    return Array.from(map.entries())
      .map(([country, data]) => ({
        country,
        ...data,
        share: vehicles.length > 0 ? Math.round((data.count / vehicles.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [vehicles]);

  const fuelStats = useMemo(() => {
    const map = new Map<string, { count: number; avgPrice: number; total: number }>();
    vehicles.forEach((v) => {
      const prev = map.get(v.fuelType) || { count: 0, avgPrice: 0, total: 0 };
      const nextCount = prev.count + 1;
      const nextTotal = prev.total + v.sellingPrice;
      map.set(v.fuelType, {
        count: nextCount,
        total: nextTotal,
        avgPrice: Math.round(nextTotal / nextCount),
      });
    });
    return Array.from(map.entries()).map(([fuel, d]) => ({
      fuel,
      ...d,
      share: vehicles.length > 0 ? Math.round((d.count / vehicles.length) * 100) : 0,
    }));
  }, [vehicles]);

  const bodyStats = useMemo(() => {
    const map = new Map<string, { count: number; totalMargin: number }>();
    vehicles.forEach((v) => {
      const prev = map.get(v.bodyType) || { count: 0, totalMargin: 0 };
      map.set(v.bodyType, {
        count: prev.count + 1,
        totalMargin: prev.totalMargin + (v.sellingPrice - v.landedCost),
      });
    });
    return Array.from(map.entries()).map(([body, d]) => ({
      body,
      ...d,
      share: vehicles.length > 0 ? Math.round((d.count / vehicles.length) * 100) : 0,
    }));
  }, [vehicles]);

  const toggleDimension = (
    dimension: "originCountry" | "fuelType" | "bodyType" | "make" | "status",
    value: string
  ) => {
    if (chartFilter?.dimension === dimension && chartFilter.value === value) {
      setChartFilter(null);
    } else {
      setChartFilter({ dimension, value });
    }
  };

  return (
    <div className="space-y-2.5">
      {/* Active Cross-Filter Callout Banner */}
      {chartFilter && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-lg border border-[var(--theme-primary)]/30 bg-[var(--theme-primary)]/[0.06] text-xs">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-[var(--theme-primary)]" />
            <span className="text-slate-600 dark:text-slate-300">
              {language === "ps"
                ? "فعال فلټر:"
                : language === "fa"
                ? "فیلتر تحلیلی فعال:"
                : "Cross-Filter Active:"}
            </span>
            <span className="font-mono font-bold text-[var(--theme-primary)]">
              {chartFilter.dimension} = {chartFilter.value}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setChartFilter(null)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--theme-primary)] hover:underline cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            <span>
              {language === "ps"
                ? "فلټر پاک کړئ"
                : language === "fa"
                ? "پاک کردن فیلتر"
                : "Clear Filter"}
            </span>
          </button>
        </div>
      )}

      {/* 3-Column Interactive Analytics Cohort Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-slate-200 dark:bg-[#262F40] border border-slate-200 dark:border-[#262F40] rounded-lg overflow-hidden">
        {/* Panel 1: Import Origin Corridors */}
        <div className="bg-white dark:bg-[#161B26] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <Globe2 className="h-3.5 w-3.5 text-[var(--theme-primary)]" />
              <span>
                {language === "ps"
                  ? "د وارداتو هیوادونه"
                  : language === "fa"
                  ? "مبادی وارداتی ناوگان"
                  : "Import Origin Corridors"}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              {language === "ps"
                ? "د فلټر لپاره کلیک وکړئ"
                : language === "fa"
                ? "کلیک برای فیلتر"
                : "Click bar to filter"}
            </span>
          </div>

          <div className="space-y-2">
            {originStats.map((item) => {
              const isSelected =
                chartFilter?.dimension === "originCountry" &&
                chartFilter.value === item.country;
              return (
                <button
                  key={item.country}
                  type="button"
                  onClick={() => toggleDimension("originCountry", item.country)}
                  className={`w-full text-start rounded-md p-1.5 transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[var(--theme-primary)]/10 ring-1 ring-[var(--theme-primary)]"
                      : "hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.country}
                    </span>
                    <span className="font-mono tabular-nums text-[11px] text-slate-500">
                      {item.count} {t.units} ·{" "}
                      {formatCurrency(item.value, currency, exchangeRate)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--theme-primary)] transition-all"
                      style={{ width: `${Math.max(item.share, 8)}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel 2: Powertrain & Fuel Telemetry */}
        <div className="bg-white dark:bg-[#161B26] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <Fuel className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>
                {language === "ps"
                  ? "د سونګ او انجن ډول"
                  : language === "fa"
                  ? "ترکیب سوخت و پیشرانه"
                  : "Powertrain & Tariff Cohorts"}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              {language === "ps"
                ? "متقابل انتخاب"
                : language === "fa"
                ? "بخش تعاملی"
                : "Interactive segment"}
            </span>
          </div>

          <div className="space-y-2">
            {fuelStats.map((item) => {
              const isSelected =
                chartFilter?.dimension === "fuelType" && chartFilter.value === item.fuel;
              return (
                <button
                  key={item.fuel}
                  type="button"
                  onClick={() => toggleDimension("fuelType", item.fuel)}
                  className={`w-full text-start rounded-md p-1.5 transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-emerald-500/10 ring-1 ring-emerald-600"
                      : "hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.fuel}
                    </span>
                    <span className="font-mono tabular-nums text-[11px] text-slate-500">
                      {item.count} {t.units} ({item.share}%) · Avg $
                      {item.avgPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-600 dark:bg-emerald-400 transition-all"
                      style={{ width: `${Math.max(item.share, 8)}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel 3: Body Class & Net Profit Contribution */}
        <div className="bg-white dark:bg-[#161B26] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <Layers className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>
                {language === "ps"
                  ? "د موټر بڼه او ګټه"
                  : language === "fa"
                  ? "کلاس بدنه و حاشیه سود"
                  : "Chassis Class & Net Margin"}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              {language === "ps"
                ? "کلیک وکړئ"
                : language === "fa"
                ? "تفکیک سریع"
                : "Click to isolate"}
            </span>
          </div>

          <div className="space-y-2">
            {bodyStats.map((item) => {
              const isSelected =
                chartFilter?.dimension === "bodyType" && chartFilter.value === item.body;
              return (
                <button
                  key={item.body}
                  type="button"
                  onClick={() => toggleDimension("bodyType", item.body)}
                  className={`w-full text-start rounded-md p-1.5 transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-amber-500/10 ring-1 ring-amber-600"
                      : "hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.body}
                    </span>
                    <span className="font-mono tabular-nums text-[11px] text-slate-500">
                      {item.count} {t.units}
                      {showMargins
                        ? ` · +$${item.totalMargin.toLocaleString()} ${t.dashboardNet}`
                        : ` · ${item.share}%`}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-600 dark:bg-amber-400 transition-all"
                      style={{ width: `${Math.max(item.share, 8)}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
