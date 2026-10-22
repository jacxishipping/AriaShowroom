"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useShowroomStore } from "@/store/useShowroomStore";
import { formatCurrency, formatMileage } from "@/lib/utils";
import { PaintInspectionDiagram } from "@/components/PaintInspectionDiagram";
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
    clientPresentationMode,
    currentRole,
    setVehicleStatus,
    updateVehicle,
    favoriteIds,
    toggleFavorite,
    compareIds,
    toggleCompare,
    addToast,
  } = useShowroomStore();

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
  }, [vehicle?.id]);

  if (!vehicle) return null;

  const showFinancialMargins =
    !clientPresentationMode &&
    (currentRole === "SuperAdmin" || currentRole === "Accountant");

  const marginAmount = vehicle.sellingPrice - vehicle.landedCost;
  const marginPct =
    vehicle.landedCost > 0
      ? ((marginAmount / vehicle.landedCost) * 100).toFixed(1)
      : "0.0";

  const isFavorite = favoriteIds.includes(vehicle.id);
  const isCompared = compareIds.includes(vehicle.id);

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(priceDraft);
    if (!isNaN(parsed) && parsed > 0) {
      await updateVehicle(vehicle.id, { sellingPrice: parsed });
      setIsEditingPrice(false);
      addToast(`Updated ${vehicle.stockNumber} price to $${parsed.toLocaleString()}`, "success");
    }
  };

  const handlePaintChange = () => {
    addToast("Saved ultrasonic chassis inspection map", "info");
  };

  const waNumber = (useShowroomStore.getState().branding?.whatsapp || "93799102030").replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${waNumber || "93799102030"}?text=${encodeURIComponent(
    `Sadozai Motors Herat — Vehicle Dossier:\n${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.trim})\nStock: ${vehicle.stockNumber} · VIN: ${vehicle.vin}\nPrice: $${vehicle.sellingPrice.toLocaleString()} USD`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
      {/* Subtle Scrim on Mobile/Tablet */}
      <div
        onClick={() => setInspectedVehicleId(null)}
        className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 backdrop-blur-[1px] pointer-events-auto transition-opacity"
      />

      {/* Right-Hand Google Cloud / Drive Contextual Inspector Panel */}
      <aside
        aria-label="Vehicle Contextual Inspector"
        className="relative z-10 pointer-events-auto flex h-full w-full max-w-[480px] flex-col border-s border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] text-slate-900 dark:text-slate-100 shadow-2xl"
      >
        {/* Top Inspector Header Bar */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-[#262F40] px-4 py-3 bg-slate-50/80 dark:bg-[#121722]">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-[#1A73E8] dark:text-[#8AB4F8]">
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
              onClick={() => toggleCompare(vehicle.id)}
              className={`h-8 w-8 rounded-md flex items-center justify-center border transition-colors ${
                isCompared
                  ? "bg-[#1A73E8] text-white border-[#1A73E8]"
                  : "border-slate-200 dark:border-[#262F40] text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Toggle comparison"
            >
              <Layers className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => toggleFavorite(vehicle.id)}
              className={`h-8 w-8 rounded-md flex items-center justify-center border transition-colors ${
                isFavorite
                  ? "bg-rose-600 text-white border-rose-600"
                  : "border-slate-200 dark:border-[#262F40] text-slate-500 hover:text-rose-600"
              }`}
              title="Bookmark vehicle"
            >
              <Heart className={`h-3.5 w-3.5 ${isFavorite ? "fill-white" : ""}`} />
            </button>
            <Link
              href={`/vehicles/${vehicle.id}`}
              onClick={() => setInspectedVehicleId(null)}
              className="h-8 px-2.5 rounded-md border border-slate-200 dark:border-[#262F40] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#1A73E8] hover:text-[#1A73E8] flex items-center gap-1 whitespace-nowrap"
              title="Open full page dossier"
            >
              <span>Full Page</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
            <button
              onClick={() => setInspectedVehicleId(null)}
              className="h-8 w-8 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              title="Close Inspector (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Google Cloud Console Underlined Tab Strip */}
        <div className="flex items-center border-b border-slate-200 dark:border-[#262F40] px-4 bg-white dark:bg-[#161B26]">
          {[
            { id: "overview", label: "Overview & Pricing", icon: Car },
            { id: "paint", label: "11-Zone Paint Map", icon: Sliders },
            { id: "customs", label: "Customs & Port", icon: Truck },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "border-[#1A73E8] dark:border-[#8AB4F8] text-[#1A73E8] dark:text-[#8AB4F8]"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
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
                <Image
                  src={vehicle.images[photoIdx] || vehicle.images[0]}
                  alt={vehicle.model}
                  fill
                  referrerPolicy="no-referrer"
                  className="object-cover"
                />
                {vehicle.images.length > 1 && (
                  <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between">
                    <button
                      onClick={() =>
                        setPhotoIdx((p) => (p === 0 ? vehicle.images.length - 1 : p - 1))
                      }
                      className="h-7 w-7 rounded-md bg-black/70 text-white flex items-center justify-center hover:bg-black"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        setPhotoIdx((p) => (p === vehicle.images.length - 1 ? 0 : p + 1))
                      }
                      className="h-7 w-7 rounded-md bg-black/70 text-white flex items-center justify-center hover:bg-black"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <div className="absolute bottom-2 end-2 px-2 py-0.5 rounded bg-black/75 font-mono tabular-nums text-[10px] text-white">
                  {photoIdx + 1} / {vehicle.images.length}
                </div>
              </div>

              {/* Status & Quick Price Control Surface */}
              <div className="rounded-lg border border-slate-200 dark:border-[#262F40] bg-slate-50/60 dark:bg-[#121722] p-3.5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">
                      Listed Showroom Price
                    </div>
                    {isEditingPrice ? (
                      <form onSubmit={handleSavePrice} className="mt-1 flex items-center gap-1.5">
                        <input
                          type="number"
                          value={priceDraft}
                          onChange={(e) => setPriceDraft(e.target.value)}
                          className="h-7 w-28 rounded border border-[#1A73E8] bg-white dark:bg-[#0F141C] px-2 font-mono text-xs font-bold tabular-nums outline-none"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="h-7 px-2 rounded bg-[#1A73E8] text-white text-xs font-semibold flex items-center gap-1"
                        >
                          <Check className="h-3 w-3" /> Save
                        </button>
                      </form>
                    ) : (
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                          {formatCurrency(vehicle.sellingPrice, currency, exchangeRate)}
                        </span>
                        <button
                          onClick={() => setIsEditingPrice(true)}
                          className="text-slate-400 hover:text-[#1A73E8] p-1"
                          title="Quick edit selling price"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    <div className="text-[11px] font-mono tabular-nums text-slate-500">
                      {currency === "USD"
                        ? `؋ ${(vehicle.sellingPrice * exchangeRate).toLocaleString()} AFN`
                        : `$${vehicle.sellingPrice.toLocaleString()} USD`}
                    </div>
                  </div>

                  <div className="text-end">
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Operational Status
                    </label>
                    <select
                      value={vehicle.status}
                      onChange={(e) =>
                        void setVehicleStatus(
                          vehicle.id,
                          e.target.value as VehicleItem["status"]
                        )
                      }
                      className="h-8 rounded-md border border-slate-300 dark:border-[#262F40] bg-white dark:bg-[#161B26] px-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-[#1A73E8]"
                    >
                      <option value="Available on Lot">Available on Lot</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Reserved/Deposit Paid">Reserved / Deposit</option>
                      <option value="Under Prep/Maintenance">Under Prep</option>
                      <option value="Sold">Sold</option>
                    </select>
                  </div>
                </div>

                {/* Landed Cost & Margin Waterfall (Staff Only) */}
                {showFinancialMargins && (
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200 dark:border-[#262F40] font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">PURCHASE + PORT</span>
                      <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                        ${(vehicle.purchasePrice + vehicle.freightCost).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">TOTAL LANDED</span>
                      <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                        ${vehicle.landedCost.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-end">
                      <span className="text-[10px] text-slate-400 block">NET MARGIN</span>
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
                  Technical Resource Properties
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
                    label: "Plate & Registration",
                    value: vehicle.customsClearance.split("-")[0].trim(),
                  },
                  {
                    label: "Yard Slot Location",
                    value: vehicle.yardLocation || "Bay A-04 · Herat Main Lot",
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
                          onClick={() => {
                            navigator.clipboard.writeText(row.value);
                            addToast("Copied VIN to clipboard", "info");
                          }}
                          className="text-slate-400 hover:text-[#1A73E8]"
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
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Click any exterior body zone below to cycle its ultrasonic micrometer status (Original Factory Paint, Cosmetic Repaint, or Replaced Panel).
              </div>
              <PaintInspectionDiagram
                vin={vehicle.vin}
                cleanTitle={vehicle.cleanTitle}
                editable={true}
                onChangeZones={handlePaintChange}
              />
            </div>
          )}

          {activeTab === "customs" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 dark:border-[#262F40] p-3.5 space-y-2 bg-slate-50/60 dark:bg-[#121722]">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Gomrok Clearance Record</span>
                </div>
                <p className="text-xs font-mono text-slate-700 dark:text-slate-300">
                  {vehicle.customsClearance}
                </p>
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
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-[#262F40] divide-y divide-slate-200 dark:divide-[#262F40] text-xs">
                <div className="px-3.5 py-2 bg-slate-50/70 dark:bg-[#121722] font-semibold text-slate-700 dark:text-slate-300">
                  Import Corridor Checkpoints
                </div>
                {[
                  { step: "01. Origin Export Inspection", port: vehicle.originCountry, done: true },
                  { step: "02. Ocean Bill of Lading", port: "Jebel Ali / Bandar Abbas", done: true },
                  { step: "03. TIR Border Escort Convoy", port: "Dogharoun — Islam Qala", done: true },
                  {
                    step: "04. Herat Gomrok Maktoub Audit",
                    port: "ACD Tariff Assessed",
                    done: vehicle.status !== "In Transit",
                  },
                  {
                    step: "05. Bagh-e-Azadi Showroom Lot",
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
                      {cp.done ? "Verified" : "In Progress"}
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
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-md border border-slate-300 dark:border-[#262F40] bg-white dark:bg-[#161B26] hover:border-[#1A73E8] text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors whitespace-nowrap"
          >
            <FileText className="h-3.5 w-3.5 text-[#1A73E8] dark:text-[#8AB4F8]" />
            <span>Qabala Deed</span>
          </Link>

          <Link
            href={`/vehicles/${vehicle.id}/settlement`}
            onClick={() => setInspectedVehicleId(null)}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-md border border-slate-300 dark:border-[#262F40] bg-white dark:bg-[#161B26] hover:border-[#1A73E8] text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors whitespace-nowrap"
          >
            <Calculator className="h-3.5 w-3.5 text-emerald-600" />
            <span>Sarrafi Deal</span>
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-md bg-[#1A73E8] hover:bg-[#1557B0] text-xs font-semibold text-white transition-colors whitespace-nowrap"
          >
            <Send className="h-3.5 w-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>
      </aside>
    </div>
  );
}
