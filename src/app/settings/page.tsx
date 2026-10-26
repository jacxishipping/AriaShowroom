"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  useShowroomStore,
  THEME_PRESETS,
  DEFAULT_THEMING,
  BrandingSettings,
  ThemingSettings,
} from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import {
  Palette,
  Building2,
  Sparkles,
  MapPin,
  Check,
  RotateCcw,
  Sun,
  Moon,
  Laptop,
  ShieldCheck,
  Eye,
  HelpCircle,
  Lock,
  Type,
  Contrast,
} from "lucide-react";

const ACCENT_COLOR_OPTIONS = [
  { name: "Khorasan Blue", hex: "#1A73E8", group: "Classic" },
  { name: "Sadozai Gold", hex: "#D97706", group: "Luxury" },
  { name: "Herat Emerald", hex: "#059669", group: "Nature" },
  { name: "Midnight Purple", hex: "#7C3AED", group: "Executive" },
  { name: "Imperial Crimson", hex: "#DC2626", group: "Sport" },
  { name: "Persian Turquoise", hex: "#0891B2", group: "Classic" },
  { name: "Warm Amber", hex: "#EA580C", group: "Luxury" },
  { name: "Stealth Slate", hex: "#475569", group: "Minimal" },
];

const SEAL_STYLES = [
  {
    id: "official_gold" as const,
    name: "Royal Gold Seal",
    nameFa: "مهر طلایی شاهی",
    desc: "Circular gold insignia with Arabic calligraphy & license ring",
    color: "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30",
  },
  {
    id: "chamber_blue" as const,
    name: "Chamber Blue Stamp",
    nameFa: "مهر آبی اتاق تجارت",
    desc: "Official commercial stamp of Herat Chamber of Commerce & Investment",
    color: "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/30",
  },
  {
    id: "customs_red" as const,
    name: "Customs Red Wax",
    nameFa: "مهر سرخ گمرک اسلام قلعه",
    desc: "Official border dry port customs transit validation stamp",
    color: "border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/30",
  },
  {
    id: "minimal_black" as const,
    name: "Modern Monogram Seal",
    nameFa: "مهر اداری مدرن",
    desc: "Clean geometric minimalist seal for modern digital contracts",
    color: "border-slate-500 text-slate-700 bg-slate-50 dark:bg-slate-800",
  },
];

const FONT_FAMILY_OPTIONS: {
  id: ThemingSettings["fontFamily"];
  label: string;
  desc: string;
}[] = [
  { id: "jakarta", label: "Plus Jakarta Sans", desc: "Enterprise console geometric" },
  { id: "inter", label: "Inter UI", desc: "High-legibility data tables" },
  { id: "serif-luxury", label: "Editorial Serif", desc: "Executive showroom elegance" },
  { id: "mono", label: "Technical Mono", desc: "Precision VIN & ledger focus" },
];

export default function SettingsThemingPage() {
  const {
    branding,
    theming,
    updateBranding,
    updateTheming,
    applyThemePreset,
    resetBrandingToDefault,
    resetThemingToDefault,
    language,
    currentRole,
    darkMode,
    toggleDarkMode,
    addToast,
    setIsTutorialOpen,
  } = useShowroomStore();

  const t = translations[language];
  const isSuperAdmin = currentRole === "SuperAdmin";

  const [activeTab, setActiveTab] = useState<
    "theming" | "branding" | "watermark" | "branches"
  >("theming");

  // Local state for instant feedback before saving
  const [tempColor, setTempColor] = useState(theming.primaryColor);

  const handleBrandingUpdate = (patch: Partial<BrandingSettings>) => {
    if (!isSuperAdmin) return;
    updateBranding(patch);
  };

  const handleColorChange = (hex: string) => {
    setTempColor(hex);
    updateTheming({ primaryColor: hex });
    addToast(`Applied accent color: ${hex}`, "info");
  };

  const handleSaveAll = () => {
    addToast(t.settingsSaveSuccess || "Settings saved successfully", "success");
  };

  const handleReset = () => {
    if (isSuperAdmin) {
      resetBrandingToDefault();
    }
    resetThemingToDefault();
    setTempColor(DEFAULT_THEMING.primaryColor);
    addToast(
      isSuperAdmin
        ? "Reset all branding and theming to defaults"
        : "Reset personal theming preferences to defaults",
      "info"
    );
  };

  const adminOnlyBannerText =
    language === "fa"
      ? "حالت فقط خواندنی: تغییر هویت تجاری، مهر رسمی، واترمارک و شعبات فقط برای مدیر ارشد (SuperAdmin) مجاز است."
      : language === "ps"
      ? "یوازې د لوستلو حالت: د نندارتون نوم، رسمي مهر، واټرمارک او څانګو بدلون یوازې د عمومي مدیر (SuperAdmin) لپاره مجاز دی."
      : "Read-Only View: Dealership identity, official seals, watermarks, and branch details can only be modified by a SuperAdmin.";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#262F40] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm"
              style={{ backgroundColor: theming.primaryColor }}
            >
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t.settingsTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {t.settingsSubtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsTutorialOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="h-3.5 w-3.5" style={{ color: theming.primaryColor }} />
            <span>{t.tutorialButtonOpen}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span>{t.settingsResetConfirm}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition cursor-pointer"
            style={{ backgroundColor: theming.primaryColor }}
          >
            <Check className="h-3.5 w-3.5" />
            <span>
              {language === "fa"
                ? "ذخیره و اعمال"
                : language === "ps"
                ? "خوندي او پلي کړئ"
                : "Save & Apply"}
            </span>
          </button>
        </div>
      </div>

      {/* Main Grid: Tabs + Form (Left 8 cols) & Live Preview (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Configuration (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">
          {/* Tabs Navigation */}
          <div className="flex border-b border-slate-200 dark:border-[#262F40] gap-1 overflow-x-auto pb-px">
            {[
              { id: "theming" as const, label: t.settingsTabTheming, icon: Palette, restricted: false },
              { id: "branding" as const, label: t.settingsTabBranding, icon: Building2, restricted: !isSuperAdmin },
              { id: "watermark" as const, label: t.settingsTabWatermark, icon: Sparkles, restricted: !isSuperAdmin },
              { id: "branches" as const, label: t.settingsTabBranches, icon: MapPin, restricted: !isSuperAdmin },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "border-b-2 text-slate-900 dark:text-white"
                      : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                  style={
                    isActive
                      ? {
                          borderBottomColor: theming.primaryColor,
                          color: theming.primaryColor,
                        }
                      : {}
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.restricted && <Lock className="h-3 w-3 opacity-60" />}
                </button>
              );
            })}
          </div>

          {activeTab !== "theming" && !isSuperAdmin && (
            <div
              role="status"
              className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs font-medium text-amber-800 dark:text-amber-200"
            >
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>{adminOnlyBannerText}</span>
            </div>
          )}

          {/* TAB 1: THEMING & VISUAL STYLING (Editable by all roles) */}
          {activeTab === "theming" && (
            <div className="space-y-6">
              {/* Luxury Theme Presets */}
              <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" style={{ color: theming.primaryColor }} />
                      <span>{t.settingsThemePresets}</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      One-click professionally curated dealership aesthetic palettes.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {THEME_PRESETS.map((preset) => {
                    const isSelected = theming.accentPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          applyThemePreset(preset.id);
                          setTempColor(preset.primaryColor);
                          addToast(`Applied theme preset: ${preset.name}`, "info");
                        }}
                        className={`text-start p-3 rounded-xl border transition relative overflow-hidden cursor-pointer ${
                          isSelected
                            ? "border-2 shadow-xs bg-slate-50 dark:bg-white/[0.04]"
                            : "border-slate-200 dark:border-[#262F40] hover:border-slate-400 bg-white dark:bg-[#121722]"
                        }`}
                        style={isSelected ? { borderColor: preset.primaryColor } : {}}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="h-3.5 w-3.5 rounded-full shadow-xs"
                              style={{ backgroundColor: preset.primaryColor }}
                            />
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {language === "ps"
                                ? preset.namePs
                                : language === "fa"
                                ? preset.nameFa
                                : preset.name}
                            </span>
                          </div>
                          {isSelected && (
                            <Check
                              className="h-3.5 w-3.5"
                              style={{ color: preset.primaryColor }}
                            />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {preset.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mode Selection: Light vs Dark vs System */}
              <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {t.settingsThemeMode}
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Select daylight showroom display or dark console mode.
                </p>

                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: "light" as const, label: "Daylight Mode", icon: Sun },
                    { id: "dark" as const, label: "Obsidian Dark", icon: Moon },
                    { id: "system" as const, label: "System Sync", icon: Laptop },
                  ].map((modeItem) => {
                    const Icon = modeItem.icon;
                    const isSelected = theming.themeMode === modeItem.id;
                    return (
                      <button
                        key={modeItem.id}
                        type="button"
                        onClick={() => {
                          updateTheming({ themeMode: modeItem.id });
                          if (modeItem.id === "dark" && !darkMode) toggleDarkMode();
                          if (modeItem.id === "light" && darkMode) toggleDarkMode();
                        }}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs font-semibold transition cursor-pointer ${
                          isSelected
                            ? "border-2 bg-slate-50 dark:bg-white/[0.04] shadow-xs"
                            : "border-slate-200 dark:border-[#262F40] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                        }`}
                        style={isSelected ? { borderColor: theming.primaryColor } : {}}
                      >
                        <Icon
                          className="h-5 w-5"
                          style={isSelected ? { color: theming.primaryColor } : {}}
                        />
                        <span>{modeItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color Palette & Custom Hex */}
              <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t.settingsPrimaryColor}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Changes buttons, active links, tabs, and brand highlights across all modules.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      {theming.primaryColor}
                    </span>
                    <span
                      className="h-6 w-6 rounded-md border border-slate-200 shadow-xs"
                      style={{ backgroundColor: theming.primaryColor }}
                    />
                  </div>
                </div>

                {/* Preset Swatches */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-4">
                  {ACCENT_COLOR_OPTIONS.map((c) => {
                    const isSelected = theming.primaryColor.toLowerCase() === c.hex.toLowerCase();
                    return (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => handleColorChange(c.hex)}
                        className={`h-11 rounded-lg border-2 flex items-center justify-center transition cursor-pointer relative ${
                          isSelected ? "scale-105 shadow-md" : "hover:scale-102"
                        }`}
                        style={{
                          backgroundColor: c.hex,
                          borderColor: isSelected ? "#FFFFFF" : "transparent",
                        }}
                        title={`${c.name} (${c.hex})`}
                        aria-label={`${c.name} (${c.hex})`}
                      >
                        {isSelected && <Check className="h-4 w-4 text-white drop-shadow" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Color Input */}
                <div className="pt-3 border-t border-slate-100 dark:border-[#262F40] flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {t.settingsCustomColor}:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      aria-label={t.settingsCustomColor}
                      value={theming.primaryColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="h-8 w-10 rounded border border-slate-200 dark:border-[#262F40] cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      aria-label="Hex color code"
                      value={tempColor}
                      onChange={(e) => setTempColor(e.target.value)}
                      onBlur={() => {
                        if (/^#[0-9A-Fa-f]{6}$/.test(tempColor)) {
                          handleColorChange(tempColor);
                        }
                      }}
                      placeholder="#1A73E8"
                      className="w-28 rounded border border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#0F141C] px-2.5 py-1 text-xs font-mono uppercase font-bold text-slate-800 dark:text-white outline-none focus:border-[var(--primary-color,#1A73E8)]"
                    />
                  </div>
                </div>
              </div>

              {/* UI Density & Corner Radius */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Border Radius */}
                <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] p-4 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                    {t.settingsBorderRadius}
                  </h4>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Corner curvature of buttons, cards, and modal windows.
                  </p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { r: 4, label: "4px" },
                      { r: 8, label: "8px" },
                      { r: 12, label: "12px" },
                      { r: 16, label: "16px" },
                    ].map((item) => (
                      <button
                        key={item.r}
                        type="button"
                        onClick={() => updateTheming({ borderRadius: item.r })}
                        className={`py-2 text-xs font-semibold border transition cursor-pointer text-center tabular-nums ${
                          theming.borderRadius === item.r
                            ? "border-2 bg-slate-100 dark:bg-white/[0.05] shadow-xs font-bold"
                            : "border-slate-200 dark:border-[#262F40] text-slate-600 dark:text-slate-400"
                        }`}
                        style={{
                          borderRadius: `${item.r}px`,
                          borderColor:
                            theming.borderRadius === item.r
                              ? theming.primaryColor
                              : undefined,
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* UI Density Mode */}
                <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] p-4 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                    {t.settingsUiDensity}
                  </h4>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Comfortable showroom browsing or compact accountant tables.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateTheming({ uiDensity: "comfortable" })}
                      className={`p-2 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                        theming.uiDensity === "comfortable"
                          ? "border-2 bg-slate-100 dark:bg-white/[0.05] shadow-xs font-bold"
                          : "border-slate-200 dark:border-[#262F40] text-slate-600 dark:text-slate-400"
                      }`}
                      style={{
                        borderColor:
                          theming.uiDensity === "comfortable"
                            ? theming.primaryColor
                            : undefined,
                      }}
                    >
                      {t.settingsDensityComfortable}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateTheming({ uiDensity: "compact" })}
                      className={`p-2 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                        theming.uiDensity === "compact"
                          ? "border-2 bg-slate-100 dark:bg-white/[0.05] shadow-xs font-bold"
                          : "border-slate-200 dark:border-[#262F40] text-slate-600 dark:text-slate-400"
                      }`}
                      style={{
                        borderColor:
                          theming.uiDensity === "compact"
                            ? theming.primaryColor
                            : undefined,
                      }}
                    >
                      {t.settingsDensityCompact}
                    </button>
                  </div>
                </div>
              </div>

              {/* Typography & Contrast Accessibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] p-4 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                    <Type className="h-3.5 w-3.5" style={{ color: theming.primaryColor }} />
                    <span>
                      {language === "fa"
                        ? "فونت رابط کاربری"
                        : language === "ps"
                        ? "د کارن بڼې لیکبڼه"
                        : "Console Typography"}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Primary Latin typeface paired with Vazirmatn for Dari & Pashto.
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {FONT_FAMILY_OPTIONS.map((font) => {
                      const isSelected = theming.fontFamily === font.id;
                      return (
                        <button
                          key={font.id}
                          type="button"
                          onClick={() => updateTheming({ fontFamily: font.id })}
                          className={`p-2 rounded-lg border text-start transition cursor-pointer ${
                            isSelected
                              ? "border-2 bg-slate-100 dark:bg-white/[0.05] shadow-xs"
                              : "border-slate-200 dark:border-[#262F40] text-slate-600 dark:text-slate-400"
                          }`}
                          style={{
                            borderColor: isSelected ? theming.primaryColor : undefined,
                          }}
                        >
                          <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">
                            {font.label}
                          </span>
                          <span className="block text-[10px] text-slate-500 truncate">
                            {font.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] p-4 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                    <Contrast className="h-3.5 w-3.5" style={{ color: theming.primaryColor }} />
                    <span>
                      {language === "fa"
                        ? "کنتراست و خوانایی"
                        : language === "ps"
                        ? "لوړ تباین او روښانتیا"
                        : "Contrast & Legibility"}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Boost border sharpness and text contrast for bright outdoor lots.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        id: "standard" as const,
                        label:
                          language === "fa"
                            ? "استاندارد"
                            : language === "ps"
                            ? "معیاري"
                            : "Standard",
                      },
                      {
                        id: "high-contrast" as const,
                        label:
                          language === "fa"
                            ? "کنتراست بالا"
                            : language === "ps"
                            ? "لوړ تباین"
                            : "High Contrast",
                      },
                    ].map((opt) => {
                      const isSelected = theming.contrastMode === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => updateTheming({ contrastMode: opt.id })}
                          className={`p-2 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                            isSelected
                              ? "border-2 bg-slate-100 dark:bg-white/[0.05] shadow-xs font-bold"
                              : "border-slate-200 dark:border-[#262F40] text-slate-600 dark:text-slate-400"
                          }`}
                          style={{
                            borderColor: isSelected ? theming.primaryColor : undefined,
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHOWROOM IDENTITY & BRANDING (SuperAdmin Only Mutations) */}
          {activeTab === "branding" && (
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] p-5 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t.settingsTabBranding}
                </h3>

                {/* Showroom Name Across Languages */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Dealership Name (English)
                    </label>
                    <input
                      type="text"
                      disabled={!isSuperAdmin}
                      value={branding.dealershipName}
                      onChange={(e) => handleBrandingUpdate({ dealershipName: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#0F141C] p-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-[var(--primary-color,#1A73E8)] disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      نام نمایشگاه (دری)
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      disabled={!isSuperAdmin}
                      value={branding.dealershipNameFa}
                      onChange={(e) => handleBrandingUpdate({ dealershipNameFa: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#0F141C] p-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-[var(--primary-color,#1A73E8)] disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      د نندارتون نوم (پښتو)
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      disabled={!isSuperAdmin}
                      value={branding.dealershipNamePs}
                      onChange={(e) => handleBrandingUpdate({ dealershipNamePs: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#0F141C] p-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-[var(--primary-color,#1A73E8)] disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Tagline & Monogram */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {t.settingsTagline}
                    </label>
                    <input
                      type="text"
                      disabled={!isSuperAdmin}
                      value={branding.dealershipTagline}
                      onChange={(e) => handleBrandingUpdate({ dealershipTagline: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#0F141C] p-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[var(--primary-color,#1A73E8)] disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {t.settingsShortCode}
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      disabled={!isSuperAdmin}
                      value={branding.dealershipShortCode}
                      onChange={(e) =>
                        handleBrandingUpdate({ dealershipShortCode: e.target.value.toUpperCase() })
                      }
                      className="w-full rounded-lg border border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#0F141C] p-2 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-[var(--primary-color,#1A73E8)] disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* License & Tax ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-[#262F40]">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {t.settingsLicenseNumber}
                    </label>
                    <input
                      type="text"
                      disabled={!isSuperAdmin}
                      value={branding.licenseNumber}
                      onChange={(e) => handleBrandingUpdate({ licenseNumber: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#0F141C] p-2 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-[var(--primary-color,#1A73E8)] disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {t.settingsTinNumber}
                    </label>
                    <input
                      type="text"
                      disabled={!isSuperAdmin}
                      value={branding.tinNumber}
                      onChange={(e) => handleBrandingUpdate({ tinNumber: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#0F141C] p-2 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-[var(--primary-color,#1A73E8)] disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Official Seal / Qabala Stamp Style */}
              <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {t.settingsSealStyle}
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  This official watermark seal is embedded into computer-generated legal sales deeds (Qabala).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SEAL_STYLES.map((seal) => {
                    const isSelected = branding.sealStyle === seal.id;
                    return (
                      <button
                        key={seal.id}
                        type="button"
                        disabled={!isSuperAdmin}
                        onClick={() => handleBrandingUpdate({ sealStyle: seal.id })}
                        className={`p-3 rounded-xl border text-start transition cursor-pointer relative disabled:opacity-60 disabled:cursor-not-allowed ${
                          isSelected
                            ? "border-2 shadow-xs bg-slate-50 dark:bg-white/[0.04]"
                            : "border-slate-200 dark:border-[#262F40] hover:border-slate-400"
                        }`}
                        style={isSelected ? { borderColor: theming.primaryColor } : {}}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {language === "fa" || language === "ps" ? seal.nameFa : seal.name}
                          </span>
                          {isSelected && (
                            <Check
                              className="h-4 w-4"
                              style={{ color: theming.primaryColor }}
                            />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">{seal.desc}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Signatory Names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-[#262F40]">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {t.settingsAuthorizedSignatory}
                    </label>
                    <input
                      type="text"
                      disabled={!isSuperAdmin}
                      value={branding.authorizedSignatory}
                      onChange={(e) =>
                        handleBrandingUpdate({ authorizedSignatory: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#0F141C] p-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-[var(--primary-color,#1A73E8)] disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {t.settingsSignatoryTitle}
                    </label>
                    <input
                      type="text"
                      disabled={!isSuperAdmin}
                      value={branding.signatoryTitle}
                      onChange={(e) => handleBrandingUpdate({ signatoryTitle: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#0F141C] p-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-[var(--primary-color,#1A73E8)] disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WATERMARK & PHOTO INSPECTIONS (SuperAdmin Only Mutations) */}
          {activeTab === "watermark" && (
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] p-5 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t.settingsTabWatermark}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Client-side automated stamp applied to vehicle intake photos to protect inventory copyright.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {t.settingsWatermarkText}
                  </label>
                  <input
                    type="text"
                    disabled={!isSuperAdmin}
                    value={branding.watermarkText}
                    onChange={(e) => handleBrandingUpdate({ watermarkText: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#0F141C] p-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-[var(--primary-color,#1A73E8)] disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {t.settingsWatermarkPosition}
                    </label>
                    <select
                      disabled={!isSuperAdmin}
                      value={branding.watermarkPosition}
                      onChange={(e) =>
                        handleBrandingUpdate({
                          watermarkPosition: e.target.value as BrandingSettings["watermarkPosition"],
                        })
                      }
                      className="w-full rounded-lg border border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#0F141C] p-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-[var(--primary-color,#1A73E8)] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="bottom-right">Bottom Right Corner</option>
                      <option value="bottom-left">Bottom Left Corner</option>
                      <option value="center">Centered Stamp</option>
                      <option value="diagonal">Full Diagonal Protective Band</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {t.settingsWatermarkOpacity}
                      </label>
                      <span
                        className="text-xs font-mono font-bold tabular-nums"
                        style={{ color: theming.primaryColor }}
                      >
                        {Math.round(branding.watermarkOpacity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      disabled={!isSuperAdmin}
                      min={0.1}
                      max={0.8}
                      step={0.05}
                      value={branding.watermarkOpacity}
                      onChange={(e) =>
                        handleBrandingUpdate({ watermarkOpacity: parseFloat(e.target.value) })
                      }
                      className="w-full cursor-pointer mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ accentColor: theming.primaryColor }}
                    />
                  </div>
                </div>

                {/* Real-time Interactive Photo Watermark Demo */}
                <div className="pt-3 border-t border-slate-100 dark:border-[#262F40]">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                    Live Photo Watermark Simulation:
                  </span>
                  <div className="relative h-48 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-[#262F40]">
                    <Image
                      src="https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80"
                      alt="Sample Vehicle"
                      fill
                      className="object-cover opacity-90"
                    />

                    {/* Watermark Overlay Element */}
                    <div
                      className={`absolute pointer-events-none transition-all ${
                        branding.watermarkPosition === "bottom-right"
                          ? "bottom-3 end-3"
                          : branding.watermarkPosition === "bottom-left"
                          ? "bottom-3 start-3"
                          : branding.watermarkPosition === "center"
                          ? "inset-0 flex items-center justify-center"
                          : "inset-0 flex items-center justify-center -rotate-12"
                      }`}
                    >
                      <div
                        className="px-3 py-1.5 rounded bg-black/60 backdrop-blur-xs text-white border border-white/20 font-mono text-xs font-bold tracking-wider uppercase shadow-xl flex items-center gap-2"
                        style={{ opacity: branding.watermarkOpacity }}
                      >
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        <span>{branding.watermarkText}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BRANCHES & CONTACT (SuperAdmin Only Mutations) */}
          {activeTab === "branches" && (
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] p-5 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t.settingsTabBranches}
                </h3>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {t.settingsAddress}
                  </label>
                  <input
                    type="text"
                    disabled={!isSuperAdmin}
                    value={branding.address}
                    onChange={(e) => handleBrandingUpdate({ address: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#0F141C] p-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[var(--primary-color,#1A73E8)] disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {t.settingsCustomsBranch}
                  </label>
                  <input
                    type="text"
                    disabled={!isSuperAdmin}
                    value={branding.customsTerminalBranch}
                    onChange={(e) =>
                      handleBrandingUpdate({ customsTerminalBranch: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#0F141C] p-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[var(--primary-color,#1A73E8)] disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-[#262F40]">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {t.settingsPhone}
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      disabled={!isSuperAdmin}
                      value={branding.phone}
                      onChange={(e) => handleBrandingUpdate({ phone: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#0F141C] p-2 text-xs font-mono tabular-nums text-slate-900 dark:text-white outline-none focus:border-[var(--primary-color,#1A73E8)] disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {t.settingsWhatsapp}
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      disabled={!isSuperAdmin}
                      value={branding.whatsapp}
                      onChange={(e) => handleBrandingUpdate({ whatsapp: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#0F141C] p-2 text-xs font-mono tabular-nums text-slate-900 dark:text-white outline-none focus:border-[var(--primary-color,#1A73E8)] disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {t.settingsEmail}
                    </label>
                    <input
                      type="email"
                      dir="ltr"
                      disabled={!isSuperAdmin}
                      value={branding.email}
                      onChange={(e) => handleBrandingUpdate({ email: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#0F141C] p-2 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-[var(--primary-color,#1A73E8)] disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Interactive Preview Panel (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          <div className="sticky top-20 space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] p-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#262F40] mb-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Eye className="h-4 w-4" style={{ color: theming.primaryColor }} />
                  {t.settingsLivePreview}
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  SYNCED
                </span>
              </div>

              {/* 1. Header Bar Mini Preview */}
              <div className="mb-4">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  {t.settingsPreviewHeader}
                </span>
                <div
                  className="rounded-lg border border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#121722] p-2.5 flex items-center justify-between shadow-2xs"
                  style={{ borderRadius: `${theming.borderRadius}px` }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-6 w-6 rounded flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: theming.primaryColor }}
                    >
                      {branding.dealershipShortCode || "ARI"}
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[130px]">
                      {language === "ps"
                        ? branding.dealershipNamePs || branding.dealershipName
                        : language === "fa"
                        ? branding.dealershipNameFa || branding.dealershipName
                        : branding.dealershipName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className="text-[10px] font-bold text-white px-2 py-0.5 rounded"
                      style={{ backgroundColor: theming.primaryColor }}
                    >
                      USD
                    </span>
                    <span className="text-[10px] font-mono tabular-nums text-slate-400">؋70.5</span>
                  </div>
                </div>
              </div>

              {/* 2. Branded Vehicle Card Mini Preview */}
              <div className="mb-4">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  {t.settingsPreviewCard}
                </span>
                <div
                  className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#0F141C] overflow-hidden shadow-sm"
                  style={{ borderRadius: `${theming.borderRadius}px` }}
                >
                  <div className="relative h-28 w-full bg-slate-800">
                    <Image
                      src="https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=600&q=80"
                      alt="Land Cruiser"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 start-2">
                      <span className="text-[10px] font-bold text-white bg-emerald-600 px-2 py-0.5 rounded shadow">
                        Available on Lot
                      </span>
                    </div>
                    <div className="absolute bottom-2 end-2">
                      <span className="text-[10px] font-mono tabular-nums font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
                        #ARI-1092
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      2024 Toyota Land Cruiser 300 VXR
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span
                        className="text-xs font-bold tabular-nums"
                        style={{ color: theming.primaryColor }}
                      >
                        $115,000 USD
                      </span>
                      <button
                        type="button"
                        className="px-2.5 py-1 text-[11px] font-bold text-white shadow-xs cursor-pointer"
                        style={{
                          backgroundColor: theming.primaryColor,
                          borderRadius: `${Math.max(theming.borderRadius - 2, 4)}px`,
                        }}
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Official Deed Header Preview */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  {t.settingsPreviewDeed}
                </span>
                <div
                  className="rounded-lg border border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#121722] p-3 text-[11px] space-y-1.5"
                  style={{ borderRadius: `${theming.borderRadius}px` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {branding.dealershipName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {branding.licenseNumber}
                      </span>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border"
                      style={{
                        borderColor: theming.primaryColor,
                        color: theming.primaryColor,
                      }}
                    >
                      {branding.sealStyle.replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {branding.address}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
