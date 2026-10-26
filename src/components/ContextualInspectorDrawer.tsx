"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useShowroomStore } from "@/store/useShowroomStore";
import { formatCurrency, formatMileage } from "@/lib/utils";
import { translations } from "@/lib/translations";
import {
  PaintInspectionDiagram,
  StoredPaintCondition,
} from "@/components/PaintInspectionDiagram";
import { VehicleItem } from "@/lib/mock-data";
import {
  X,
  ExternalLink,
  FileText,
  Calculator,
  Send,
  ShieldCheck,
  Car,
  Sliders,
  Truck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Layers,
  Heart,
  Edit3,
  Check,
} from "lucide-react";

export function ContextualInspectorDrawer() {
  const {
    vehicles,
    inspectedVehicleId,
    setInspectedVehicleId,
    currency,
    exchangeRate,
    language,
    clientPresentationMode,
    currentRole,
    setVehicleStatus,
    updateVehicle,
    favoriteIds,
    toggleFavorite,
    compareIds,
    toggleCompare,
    addToast,
    branding,
  } = useShowroomStore();

  const t = translations[language];
  const vehicle = vehicles.find((v) => v.id === inspectedVehicleId) || null;

  const [activeTab, setActiveTab] = useState<"overview" | "paint" | "customs">("overview");
  const [photoIdx, setPhotoIdx] = useState(0);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [priceDraft, setPriceDraft] = useState("");

  useEffect(() => {
    if (vehicle) {
      setPhotoIdx(0);
      setIsEditingPrice(false);
      setPriceDraft(String(vehicle.sellingPrice));
    }
  }, [vehicle?.id, vehicle?.sellingPrice]);

  useEffect(() => {
    if (!inspectedVehicleId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setInspectedVehicleId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inspectedVehicleId, setInspectedVehicleId]);

  if (!vehicle) return null;

  const showFinancialMargins =
    !clientPresentationMode &&
    (currentRole === "SuperAdmin" || currentRole === "Accountant");

  const canEditPrice = !clientPresentationMode && currentRole === "SuperAdmin";
  const canEditOperational =
    !clientPresentationMode &&
    (currentRole === "SuperAdmin" || currentRole === "SalesAgent");

  const marginAmount = vehicle.sellingPrice - vehicle.landedCost;
  const marginPct =
    vehicle.landedCost > 0
      ? ((marginAmount / vehicle.landedCost) * 100).toFixed(1)
      : "0.0";

  const isFavorite = favoriteIds.includes(vehicle.id);
  const isCompared = compareIds.includes(vehicle.id);

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditPrice) return;
    const parsed = Number(priceDraft);
    if (!isNaN(parsed) && parsed > 0) {
      try {
        await updateVehicle(vehicle.id, { sellingPrice: parsed });
        setIsEditingPrice(false);
        addToast(
          `Updated ${vehicle.stockNumber} price to $${parsed.toLocaleString()}`,
          "success"
        );
      } catch (err) {
        addToast(
          err instanceof Error ? err.message : "Unable to update selling price",
          "error"
        );
      }
    }
  };

  const handlePaintChange = async (
    _zones: unknown,
    zoneMap: Record<string, StoredPaintCondition>
  ) => {
    try {
      await updateVehicle(vehicle.id, {
        conditionNotes: {
          ...vehicle.conditionNotes,
          paintZones: zoneMap,
        },
      });
      addToast(
        language === "ps"
          ? "د موټر رنګ معاینه ثبت شوه"
          : language === "fa"
          ? "نقشه معاینه رنگ ذخیره شد"
          : "Saved ultrasonic chassis inspection map",
        "info"
      );
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Failed to save paint map",
        "error"
      );
    }
  };

  const dealerName = branding?.dealershipName || "Aria Motors";
  const waNumber = (branding?.whatsapp || "93799102030").replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${waNumber || "93799102030"}?text=${encodeURIComponent(
    `${dealerName} — Vehicle Dossier:\n${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.trim})\nStock: ${vehicle.stockNumber} · VIN: ${vehicle.vin}\nPrice: $${vehicle.sellingPrice.toLocaleString()} USD`
  )}`;

  const activePhoto = vehicle.images[photoIdx] || vehicle.images[0] || "";

  return (
    <div className="fixed inset-0 z-50 flex justify-end pointer-events-none print:hidden">
      {/* Subtle Scrim on Mobile/Tablet */}
      <div
        onClick={() => setInspectedVehicleId(null)}
        className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 backdrop-blur-[1px] pointer-events-auto transition-opacity"
      />

      {/* Contextual Inspector Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Vehicle Contextual Inspector"
        className="relative z-10 pointer-events-auto flex h-full w-full max-w-[480px] flex-col border-s border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] text-slate-900 dark:text-slate-100 shadow-2xl"
      >
        {/* Top Inspector Header Bar */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-[#262F40] px-4 py-3 bg-slate-50/80 dark:bg-[#121722]">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-[var(--theme-primary)]">
                {vehicle.stockNumber}
              </span>
              <span>·</span>
              <span>{vehicle.originCountry}</span>
              <span>·</span>
              <span className="truncate">{vehicle.vin}</span>
            </div>
            <h2 className="truncate text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {vehicle.year} {vehicle.make} {vehicle.model}{" "}
              <span className="font-normal text-slate-500">{vehicle.trim}</span>
            </h2>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => toggleCompare(vehicle.id)}
              aria-label={isCompared ? t.cardRemoveComparison : t.cardAddComparison}
              className={`h-8 w-8 rounded-md flex items-center justify-center border transition-colors cursor-pointer ${
                isCompared
                  ? "bg-[var(--theme-primary)] text-white border-[var(--theme-primary)]"
                  : "border-slate-200 dark:border-[#262F40] text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
              title={isCompared ? t.cardRemoveComparison : t.cardAddComparison}
            >
              <Layers className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => toggleFavorite(vehicle.id)}
              aria-label={isFavorite ? t.cardRemoveSaved : t.cardSaveVehicle}
              className={`h-8 w-8 rounded-md flex items-center justify-center border transition-colors cursor-pointer ${
                isFavorite
                  ? "bg-rose-600 text-white border-rose-600"
                  : "border-slate-200 dark:border-[#262F40] text-slate-500 hover:text-rose-600"
              }`}
              title={isFavorite ? t.cardRemoveSaved : t.cardSaveVehicle}
            >
              <Heart className={`h-3.5 w-3.5 ${isFavorite ? "fill-white" : ""}`} />
            </button>
            <Link
              href={`/vehicles/${vehicle.id}`}
              onClick={() => setInspectedVehicleId(null)}
              className="h-8 px-2.5 rounded-md border border-slate-200 dark:border-[#262F40] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] flex items-center gap-1 whitespace-nowrap"
              title={t.viewDetails}
            >
              <span>{t.viewDetails}</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
            <button
              type="button"
              onClick={() => setInspectedVehicleId(null)}
              aria-label="Close Inspector"
              className="h-8 w-8 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              title="Close Inspector (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Underlined Tab Strip */}
        <div className="flex items-center border-b border-slate-200 dark:border-[#262F40] px-4 bg-white dark:bg-[#161B26] overflow-x-auto scrollbar-none">
          {[
            {
              id: "overview",
              label:
                language === "ps"
                  ? "لنډیز او بیه"
                  : language === "fa"
                  ? "مشخصات و قیمت"
                  : "Overview & Pricing",
              icon: Car,
            },
            {
              id: "paint",
              label:
                language === "ps"
                  ? "د رنګ او شاسي نقشه"
                  : language === "fa"
                  ? "نقشه رنگ و شاسی"
                  : "Paint & Chassis Map",
              icon: Sliders,
            },
            {
              id: "customs",
              label:
                language === "ps"
                  ? "ګمرک او بندر"
                  : language === "fa"
                  ? "گمرک و ترانزیت"
                  : "Customs & Port",
              icon: Truck,
            },
          ].map((tabItem) => {
            const Icon = tabItem.icon;
            const isActive = activeTab === tabItem.id;
            return (
              <button
                key={tabItem.id}
                type="button"
                onClick={() => setActiveTab(tabItem.id as "overview" | "paint" | "customs")}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "border-[var(--theme-primary)] text-[var(--theme-primary)]"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tabItem.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Inspector Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === "overview" && (
            <>
              {/* High-Resolution Interactive Gallery Preview */}
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-slate-200 dark:border-[#262F40] bg-slate-100 dark:bg-slate-900">
                {activePhoto ? (
                  <Image
                    src={activePhoto}
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    fill
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Car className="h-10 w-10 opacity-40" />
                  </div>
                )}
                {vehicle.images.length > 1 && (
                  <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between">
                    <button
                      type="button"
                      aria-label={t.cardPreviousPhoto}
                      onClick={() =>
                        setPhotoIdx((p) => (p === 0 ? vehicle.images.length - 1 : p - 1))
                      }
                      className="h-7 w-7 rounded-md bg-black/70 text-white flex items-center justify-center hover:bg-black cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                    </button>
                    <button
                      type="button"
                      aria-label={t.cardNextPhoto}
                      onClick={() =>
                        setPhotoIdx((p) => (p === vehicle.images.length - 1 ? 0 : p + 1))
                      }
                      className="h-7 w-7 rounded-md bg-black/70 text-white flex items-center justify-center hover:bg-black cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                    </button>
                  </div>
                )}
                {vehicle.images.length > 0 && (
                  <div className="absolute bottom-2 end-2 px-2 py-0.5 rounded bg-black/75 font-mono tabular-nums text-[10px] text-white">
                    {photoIdx + 1} / {vehicle.images.length}
                  </div>
                )}
              </div>

              {/* Status & Quick Price Control Surface */}
              <div className="rounded-lg border border-slate-200 dark:border-[#262F40] bg-slate-50/60 dark:bg-[#121722] p-3.5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">
                      {t.sellingPrice}
                    </div>
                    {isEditingPrice && canEditPrice ? (
                      <form onSubmit={handleSavePrice} className="mt-1 flex items-center gap-1.5">
                        <input
                          type="number"
                          aria-label={t.sellingPrice}
                          value={priceDraft}
                          onChange={(e) => setPriceDraft(e.target.value)}
                          className="h-7 w-28 rounded border border-[var(--theme-primary)] bg-white dark:bg-[#0F141C] px-2 font-mono text-xs font-bold tabular-nums outline-none"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="h-7 px-2 rounded bg-[var(--theme-primary)] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="h-3 w-3" /> Save
                        </button>
                      </form>
                    ) : (
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                          {formatCurrency(vehicle.sellingPrice, currency, exchangeRate)}
                        </span>
                        {canEditPrice && (
                          <button
                            type="button"
                            onClick={() => setIsEditingPrice(true)}
                            aria-label="Quick edit selling price"
                            className="text-slate-400 hover:text-[var(--theme-primary)] p-1 cursor-pointer"
                            title="Quick edit selling price"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    )}
                    <div className="text-[11px] font-mono tabular-nums text-slate-500">
                      {currency === "USD"
                        ? `؋ ${(vehicle.sellingPrice * exchangeRate).toLocaleString()} AFN`
                        : `$${vehicle.sellingPrice.toLocaleString()} USD`}
                    </div>
                  </div>

                  <div className="text-end">
                    <label
                      htmlFor="inspector-vehicle-status"
                      className="block text-[11px] font-medium text-slate-500 mb-1"
                    >
                      {t.dashboardStatus}
                    </label>
                    <select
                      id="inspector-vehicle-status"
                      disabled={!canEditOperational}
                      value={vehicle.status}
                      onChange={(e) =>
                        void setVehicleStatus(
                          vehicle.id,
                          e.target.value as VehicleItem["status"]
                        ).catch((err) =>
                          addToast(
                            err instanceof Error ? err.message : "Failed to update status",
                            "error"
                          )
                        )
                      }
                      className="h-8 rounded-md border border-slate-300 dark:border-[#262F40] bg-white dark:bg-[#161B26] px-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-[var(--theme-primary)] disabled:opacity-60"
                    >
                      <option value="Available on Lot">{t.inventoryOnLot}</option>
                      <option value="In Transit">{t.inventoryInTransit}</option>
                      <option value="Reserved/Deposit Paid">{t.inventoryReserved}</option>
                      <option value="Under Prep/Maintenance">{t.inventoryPrep}</option>
                      <option value="Sold">{t.inventorySold}</option>
                    </select>
                  </div>
                </div>

                {/* Landed Cost & Margin Waterfall (Confidential — Admin/Accountant Only) */}
                {showFinancialMargins && (
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200 dark:border-[#262F40] font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">PURCHASE + PORT</span>
                      <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                        ${(vehicle.purchasePrice + vehicle.freightCost).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">{t.totalLanded}</span>
                      <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                        ${vehicle.landedCost.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-end">
                      <span className="text-[10px] text-slate-400 block">{t.cardNetMargin}</span>
                      <span className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                        +${marginAmount.toLocaleString()} ({marginPct}%)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Structured Key-Value Resource Metadata Table */}
              <div className="rounded-lg border border-slate-200 dark:border-[#262F40] divide-y divide-slate-200 dark:divide-[#262F40] text-xs">
                <div className="px-3.5 py-2 bg-slate-50/70 dark:bg-[#121722] font-semibold text-slate-700 dark:text-slate-300">
                  {language === "ps"
                    ? "تخنیکي مشخصات"
                    : language === "fa"
                    ? "مشخصات فنی موتر"
                    : "Technical Resource Properties"}
                </div>
                {[
                  {
                    label: "Chassis VIN",
                    value: vehicle.vin,
                    mono: true,
                    copyable: true,
                  },
                  {
                    label: "Powertrain & Engine",
                    value: `${vehicle.conditionNotes.engine || "Factory Certified"} · ${vehicle.fuelType} · ${vehicle.transmission}`,
                  },
                  {
                    label: "Drivetrain & Steering",
                    value: `${vehicle.driveType} · ${vehicle.steering}`,
                  },
                  {
                    label: "Verified Odometer",
                    value: formatMileage(vehicle.mileage),
                    mono: true,
                  },
                  {
                    label: "Exterior / Interior",
                    value: `${vehicle.color} / ${vehicle.conditionNotes.interior || "OEM Leather"}`,
                  },
                  {
                    label: "Customs Clearance",
                    value: vehicle.customsClearance.split("-")[0].trim(),
                  },
                  {
                    label: "Yard Slot Location",
                    value: vehicle.yardLocation || branding?.address || "Herat Main Lot",
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between px-3.5 py-2 gap-4"
                  >
                    <span className="text-slate-500 dark:text-slate-400 shrink-0">
                      {row.label}
                    </span>
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className={`truncate font-medium text-slate-900 dark:text-slate-200 ${
                          row.mono ? "font-mono tabular-nums" : ""
                        }`}
                      >
                        {row.value}
                      </span>
                      {row.copyable && (
                        <button
                          type="button"
                          aria-label="Copy VIN"
                          onClick={() => {
                            navigator.clipboard.writeText(row.value);
                            addToast("Copied VIN to clipboard", "info");
                          }}
                          className="text-slate-400 hover:text-[var(--theme-primary)] cursor-pointer"
                          title="Copy VIN"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "paint" && (
            <div className="space-y-3">
              <PaintInspectionDiagram
                vin={vehicle.vin}
                cleanTitle={vehicle.cleanTitle}
                editable={canEditOperational}
                savedZoneMap={vehicle.conditionNotes?.paintZones}
                onChangeZones={handlePaintChange}
              />
            </div>
          )}

          {activeTab === "customs" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 dark:border-[#262F40] p-3.5 space-y-2 bg-slate-50/60 dark:bg-[#121722]">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span>
                    {language === "ps"
                      ? "د ګمرک تصفیې ریکارډ"
                      : language === "fa"
                      ? "سابقه ترخیص گمرکی"
                      : "Gomrok Clearance Record"}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-700 dark:text-slate-300">
                  {vehicle.customsClearance}
                </p>
                {showFinancialMargins && (
                  <div className="pt-2 border-t border-slate-200 dark:border-[#262F40] grid grid-cols-2 gap-2 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">CUSTOMS DUTY PAID</span>
                      <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                        ${vehicle.customsDuty.toLocaleString()} USD
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">SHIPPING & ESCORT</span>
                      <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                        ${vehicle.freightCost.toLocaleString()} USD
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-[#262F40] divide-y divide-slate-200 dark:divide-[#262F40] text-xs">
                <div className="px-3.5 py-2 bg-slate-50/70 dark:bg-[#121722] font-semibold text-slate-700 dark:text-slate-300">
                  {language === "ps"
                    ? "د وارداتو مرحلې"
                    : language === "fa"
                    ? "مراحل ترانزیت و گمرک"
                    : "Import Corridor Checkpoints"}
                </div>
                {[
                  { step: "01. Origin Export Inspection", port: vehicle.originCountry, done: true },
                  { step: "02. Ocean Bill of Lading", port: "Jebel Ali / Bandar Abbas", done: true },
                  { step: "03. TIR Border Escort Convoy", port: "Dogharoun — Islam Qala", done: true },
                  {
                    step: "04. Herat Gomrok Maktoub Audit",
                    port: branding?.customsTerminalBranch || "ACD Tariff Assessed",
                    done: vehicle.status !== "In Transit",
                  },
                  {
                    step: `05. ${dealerName} Showroom Lot`,
                    port: "Herat HQ",
                    done: vehicle.status === "Available on Lot" || vehicle.status === "Sold",
                  },
                ].map((cp) => (
                  <div key={cp.step} className="flex items-center justify-between px-3.5 py-2.5">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">{cp.step}</div>
                      <div className="text-[11px] text-slate-500">{cp.port}</div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-mono font-semibold ${
                        cp.done
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {cp.done ? t.dashboardVerified : t.dashboardTransit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="border-t border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#121722] p-3 grid grid-cols-3 gap-2">
          <Link
            href={`/vehicles/${vehicle.id}/deed`}
            onClick={() => setInspectedVehicleId(null)}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-md border border-slate-300 dark:border-[#262F40] bg-white dark:bg-[#161B26] hover:border-[var(--theme-primary)] text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors whitespace-nowrap"
          >
            <FileText className="h-3.5 w-3.5 text-[var(--theme-primary)]" />
            <span>{language === "ps" ? "قباله" : language === "fa" ? "قباله شرعی" : "Qabala Deed"}</span>
          </Link>

          <Link
            href={`/vehicles/${vehicle.id}/settlement`}
            onClick={() => setInspectedVehicleId(null)}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-md border border-slate-300 dark:border-[#262F40] bg-white dark:bg-[#161B26] hover:border-[var(--theme-primary)] text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors whitespace-nowrap"
          >
            <Calculator className="h-3.5 w-3.5 text-emerald-600" />
            <span>{language === "ps" ? "صرافي" : language === "fa" ? "تسویه صرافی" : "Sarrafi Deal"}</span>
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-md bg-[var(--theme-primary)] hover:opacity-90 text-xs font-semibold text-white transition-opacity whitespace-nowrap"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{t.buttonInquireWhatsApp}</span>
          </a>
        </div>
      </aside>
    </div>
  );
}
