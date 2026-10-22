"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useShowroomStore, RoleType } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { Dialog, DialogContent } from "@/components/mui";
import {
  Sparkles,
  Compass,
  Car,
  Search,
  Truck,
  Banknote,
  Eye,
  EyeOff,
  Keyboard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  RotateCcw,
  ShieldCheck,
  FileText,
  ScanLine,
  SlidersHorizontal,
  Zap,
  Building2,
  Check,
  PanelRightOpen,
  Calculator,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

export function FirstTimeTutorialModal() {
  const router = useRouter();
  const {
    isTutorialOpen,
    setIsTutorialOpen,
    tutorialStep,
    setTutorialStep,
    hasCompletedTutorial,
    completeTutorial,
    resetTutorial,
    language,
    currentRole,
    setCurrentRole,
    currency,
    setCurrency,
    exchangeRate,
    clientPresentationMode,
    toggleClientPresentationMode,
    addToast,
    setFilter,
  } = useShowroomStore();

  const t = translations[language];
  const isRtl = language === "fa" || language === "ps";

  const [activeTab, setActiveTab] = useState<"tour" | "matrix">("tour");
  const [dontShowAgain, setDontShowAgain] = useState(true);

  // Interactive step mini-states
  const [demoRole, setDemoRole] = useState<RoleType>(currentRole);
  const [demoVehicleStatus, setDemoVehicleStatus] = useState<
    "Available on Lot" | "In Transit" | "Reserved" | "Sold"
  >("Available on Lot");
  const [demoPresentationActive, setDemoPresentationActive] = useState(false);
  const [demoCustomsDoc, setDemoCustomsDoc] = useState<"maktoub" | "chamber" | "tariff">("maktoub");
  const [demoFxUsd, setDemoFxUsd] = useState(65000);
  const [demoToken, setDemoToken] = useState<string>("status:available");

  // Auto-launch tutorial on first time visit
  useEffect(() => {
    if (!hasCompletedTutorial) {
      const timer = setTimeout(() => {
        setIsTutorialOpen(true);
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedTutorial, setIsTutorialOpen]);

  // Handle keyboard navigation when dialog is open
  useEffect(() => {
    if (!isTutorialOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        completeTutorial(dontShowAgain);
        return;
      }
      if (e.key === "ArrowRight") {
        if (isRtl) {
          handlePrev();
        } else {
          handleNext();
        }
      }
      if (e.key === "ArrowLeft") {
        if (isRtl) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTutorialOpen, tutorialStep, isRtl, dontShowAgain]);

  const totalSteps = 8;

  const handleNext = () => {
    if (tutorialStep < totalSteps - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      completeTutorial(dontShowAgain);
      addToast(
        language === "ps"
          ? "تاسو په بریا سره لارښود بشپړ کړ!"
          : language === "fa"
          ? "شما با موفقیت راهنمای سیستم را به پایان رساندید!"
          : "Tutorial completed! Welcome to Sadozai Motors ERP.",
        "success"
      );
    }
  };

  const handlePrev = () => {
    if (tutorialStep > 0) {
      setTutorialStep(tutorialStep - 1);
    }
  };

  const handleFinishAndNavigate = (path: string) => {
    completeTutorial(dontShowAgain);
    router.push(path);
  };

  const stepsMeta = useMemo(() => {
    return [
      {
        id: "welcome",
        icon: Sparkles,
        title: t.tutorialSlide1Title,
        subtitle: t.tutorialSlide1Subtitle,
      },
      {
        id: "cockpit",
        icon: Car,
        title: t.tutorialSlide2Title,
        subtitle: t.tutorialSlide2Subtitle,
      },
      {
        id: "search",
        icon: Search,
        title: t.tutorialSlide3Title,
        subtitle: t.tutorialSlide3Subtitle,
      },
      {
        id: "customs",
        icon: Truck,
        title: t.tutorialSlide4Title,
        subtitle: t.tutorialSlide4Subtitle,
      },
      {
        id: "sarrafi",
        icon: Banknote,
        title: t.tutorialSlide5Title,
        subtitle: t.tutorialSlide5Subtitle,
      },
      {
        id: "presentation",
        icon: EyeOff,
        title: t.tutorialSlide6Title,
        subtitle: t.tutorialSlide6Subtitle,
      },
      {
        id: "shortcuts",
        icon: Keyboard,
        title: t.tutorialSlide7Title,
        subtitle: t.tutorialSlide7Subtitle,
      },
      {
        id: "ready",
        icon: CheckCircle2,
        title: t.tutorialSlide8Title,
        subtitle: t.tutorialSlide8Subtitle,
      },
    ];
  }, [t]);

  return (
    <Dialog
      open={isTutorialOpen}
      onClose={() => completeTutorial(dontShowAgain)}
      maxWidth="md"
      fullWidth
    >
      <DialogContent className="p-0 overflow-hidden flex flex-col bg-white dark:bg-[#161B26] text-slate-900 dark:text-white">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-[#262F40] bg-slate-50/80 dark:bg-[#121722]/80 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A73E8]/10 text-[#1A73E8] dark:bg-[#1A73E8]/20 dark:text-[#8AB4F8]">
              <Compass className="h-5 w-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight">
                  {t.tutorialModalTitle}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#1A73E8]/10 px-2 py-0.5 text-[10px] font-semibold text-[#1A73E8] dark:bg-[#1A73E8]/20 dark:text-[#8AB4F8]">
                  <Sparkles className="h-3 w-3" />
                  {t.tutorialBadgeFirstTime}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                {t.tutorialModalSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="hidden sm:flex rounded-lg border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#0F141C] p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("tour")}
                className={`rounded px-2.5 py-1 font-medium transition ${
                  activeTab === "tour"
                    ? "bg-[#1A73E8] text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {t.tutorialTabTour}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("matrix")}
                className={`rounded px-2.5 py-1 font-medium transition ${
                  activeTab === "matrix"
                    ? "bg-[#1A73E8] text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {t.tutorialTabSummary}
              </button>
            </div>

            <button
              onClick={() => completeTutorial(dontShowAgain)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition"
              title="Close Tutorial (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tab 1: Guided Step-by-Step Tour */}
        {activeTab === "tour" && (
          <div className="p-5 sm:p-7 min-h-[440px] flex flex-col justify-between overflow-y-auto max-h-[75vh]">
            {/* Current Step Header */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1.5">
                <span className="uppercase tracking-wider flex items-center gap-1.5">
                  {React.createElement(stepsMeta[tutorialStep].icon, {
                    className: "h-4 w-4 text-[#1A73E8] dark:text-[#8AB4F8]",
                  })}
                  {t.tutorialStepCount} {tutorialStep + 1} {t.tutorialOf} {totalSteps}
                </span>
                <span className="font-mono tabular-nums">
                  {Math.round(((tutorialStep + 1) / totalSteps) * 100)}%
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {stepsMeta[tutorialStep].title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                {stepsMeta[tutorialStep].subtitle}
              </p>
            </div>

            {/* Slide Body Content */}
            <div className="flex-1 py-1">
              {/* SLIDE 0: Welcome & Dealership Platform Overview */}
              {tutorialStep === 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-slate-50/60 dark:bg-[#121722]/60 p-3.5">
                      <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white mb-1">
                        <Building2 className="h-4 w-4 text-[#1A73E8]" />
                        <span>{language === "ps" ? "هرات مرکزي نندارتون" : language === "fa" ? "نمایشگاه مرکزی هرات" : "Herat Central Showroom"}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {language === "ps"
                          ? "د آزادۍ باغ واټ کې د لوکسو موټرونو (لندکروزر او لکسس) بشپړ کنټرول او مدیریت."
                          : language === "fa"
                          ? "مدیریت و نمایش زنده موجودی موترهای لوکس (لندکروزر، لکسس و هایلوکس) در سرک باغ آزادی هرات."
                          : "Full control over luxury Land Cruisers, Lexus LX, and Hilux inventory at Bagh-e-Azadi Boulevard."}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-slate-50/60 dark:bg-[#121722]/60 p-3.5">
                      <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white mb-1">
                        <Truck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{language === "ps" ? "د اسلام قلعه وچ بندر" : language === "fa" ? "بندر خشک اسلام قلعه" : "Islam Qala Dry Port"}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {language === "ps"
                          ? "د دوبۍ او جاپان څخه د وارداتي موټرو ګمرکي پړاوونه او د مکتوب تصدیق په ژوندۍ بڼه."
                          : language === "fa"
                          ? "ردیابی ورود موترها از دبی و جاپان، محاسبات تعرفه گمرک هرات و مکتوب‌های رسمی."
                          : "Direct import tracking from UAE and Japan with automated Afghan customs tariff calculations."}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-slate-50/60 dark:bg-[#121722]/60 p-3.5">
                      <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white mb-1">
                        <Banknote className="h-4 w-4 text-amber-500" />
                        <span>{language === "ps" ? "د صرافۍ خزانه او حوالې" : language === "fa" ? "خزانه‌داری صرافی و اسعار" : "Sarrafi Treasury"}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {language === "ps"
                          ? "د ډالرو او افغانیو سمدستي بدلون، اقساط، د پېرودونکو تړونونه او د صرافۍ رسیدونه."
                          : language === "fa"
                          ? "تبدیل آنی دالر به افغانی، مدیریت اقساط خریداران، حواله‌جات صرافی و تسویه‌حساب تامین‌کنندگان."
                          : "Real-time AFN ⇄ USD conversion, Sarrafi Hawala accounts, customer installments, and supplier ledgers."}
                      </p>
                    </div>
                  </div>

                  {/* Interactive Role Switcher Demo */}
                  <div className="rounded-xl border border-[#1A73E8]/20 bg-[#1A73E8]/[0.03] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-[#1A73E8]" />
                        <span>
                          {language === "ps"
                            ? "د کارونکي درې ګوني رولونه و ازمویئ"
                            : language === "fa"
                            ? "سه نقش کاربری در سیستم را آزمایش کنید"
                            : "Explore Role-Based Access Perspectives"}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {language === "ps" ? "فعلي رول:" : language === "fa" ? "نقش کنونی:" : "Active Role:"}{" "}
                        <span className="font-bold text-[#1A73E8] dark:text-[#8AB4F8]">{demoRole}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        {
                          role: "SuperAdmin" as RoleType,
                          title: t.roleSuperAdmin,
                          desc: t.tutorialRoleSuperAdminDesc,
                          color: "border-blue-500/40 bg-blue-50/50 dark:bg-blue-950/20",
                        },
                        {
                          role: "SalesAgent" as RoleType,
                          title: t.roleSalesAgent,
                          desc: t.tutorialRoleSalesAgentDesc,
                          color: "border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20",
                        },
                        {
                          role: "Accountant" as RoleType,
                          title: t.roleAccountant,
                          desc: t.tutorialRoleAccountantDesc,
                          color: "border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20",
                        },
                      ].map((item) => (
                        <button
                          key={item.role}
                          type="button"
                          onClick={() => {
                            setDemoRole(item.role);
                            setCurrentRole(item.role);
                            addToast(`Switched active role to ${item.role}`, "info");
                          }}
                          className={`text-start p-2.5 rounded-lg border transition ${
                            demoRole === item.role
                              ? "border-[#1A73E8] bg-white dark:bg-[#1A2234] shadow-sm ring-2 ring-[#1A73E8]/20"
                              : "border-slate-200 dark:border-[#262F40] bg-white/50 dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {item.title}
                            </span>
                            {demoRole === item.role && (
                              <Check className="h-3.5 w-3.5 text-[#1A73E8] shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                            {item.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 1: Fleet Cockpit & Vehicle Pipeline */}
              {tutorialStep === 1 && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-slate-50/50 dark:bg-[#121722]/50 p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                          Interactive Vehicle Simulator · Stock #HD-1092
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          2024 Toyota Land Cruiser 300 VXR (Twin Turbo 3.5L V6)
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ${(115000).toLocaleString()} USD
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          (؋ {(115000 * exchangeRate).toLocaleString()})
                        </span>
                      </div>
                    </div>

                    {/* Status Pill Toggle Simulator */}
                    <div className="mb-3">
                      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
                        <span>
                          {language === "ps"
                            ? "د موټر وضعیت و ازمویئ (کښیکاږئ):"
                            : language === "fa"
                            ? "آزمایش تغییر وضعیت موتر (کلیک کنید):"
                            : "Click a stage below to simulate status transition:"}
                        </span>
                        <span className="text-[10px] font-mono text-[#1A73E8] dark:text-[#8AB4F8]">
                          {demoVehicleStatus}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: "Available on Lot", color: "bg-emerald-500 text-white" },
                          { label: "In Transit", color: "bg-amber-500 text-white" },
                          { label: "Reserved", color: "bg-purple-500 text-white" },
                          { label: "Sold", color: "bg-slate-600 text-white" },
                        ].map((st) => (
                          <button
                            key={st.label}
                            type="button"
                            onClick={() => setDemoVehicleStatus(st.label as any)}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                              demoVehicleStatus === st.label
                                ? `${st.color} shadow-sm font-bold`
                                : "border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] text-slate-600 dark:text-slate-300 hover:border-slate-400"
                            }`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Inspector Drawer Trigger Callout */}
                    <div className="rounded-lg border border-blue-200 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20 p-3 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200">
                      <PanelRightOpen className="h-4 w-4 text-[#1A73E8] shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold">
                          {language === "ps"
                            ? "د موټر د ۳۶۰ درجې کتنې کړکۍ:"
                            : language === "fa"
                            ? "کشوی بازرسی همه‌جانبه موتر:"
                            : "Right-Hand Contextual Inspector Drawer:"}
                        </strong>{" "}
                        {language === "ps"
                          ? "په جدول یا کارتونو کې د هر موټر په کلیک کولو سره، د موټر رسمي مشخصات، د رنګ او باډۍ دیاګرام، او د ګمرک اسناد له ښي اړخه راښکاره کیږي."
                          : language === "fa"
                          ? "با کلیک بر روی هر موتر در جدول یا کارت‌ها، کشوی بازرسی از سمت راست باز شده و مشخصات فنی، عکاسی ۳۶۰ درجه، دیاگرام آسیب بافت بدنه و مکتوب گمرک را نشان می‌دهد."
                          : "Clicking any vehicle or pressing 'j' / 'k' slides open the right inspector with factory VIN decode, 11-zone paint condition blueprint, and Islam Qala customs paperwork."}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 2: Smart Omnibox Search & Pinned Views */}
              {tutorialStep === 2 && (
                <div className="space-y-4">
                  {/* Omnibox Visual Mock */}
                  <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-slate-50/50 dark:bg-[#121722]/50 p-4">
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#0F141C] px-3 py-2 shadow-sm mb-3">
                      <Search className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="font-mono text-xs font-semibold text-[#1A73E8] dark:text-[#8AB4F8]">
                        {demoToken}
                      </span>
                      <span className="text-xs text-slate-400">|</span>
                      <div className="ms-auto flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-500">
                          /
                        </kbd>
                        <span className="text-[10px] text-slate-400">or</span>
                        <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-500">
                          ⌘K
                        </kbd>
                      </div>
                    </div>

                    {/* Interactive Filter Tokens */}
                    <div className="mb-2">
                      <div className="text-[11px] font-semibold text-slate-500 mb-1.5">
                        {language === "ps"
                          ? "دا ټوکنونه کښیکاږئ او چټکه پلټنه و ازمویئ:"
                          : language === "fa"
                          ? "روی پیشوندهای فیلتر زیر کلیک کنید:"
                          : "Click structured filter tokens to test syntax:"}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { token: "status:available", desc: "Available on Lot" },
                          { token: "status:transit", desc: "Border In-Transit" },
                          { token: "make:Toyota", desc: "Toyota Fleet" },
                          { token: "make:Lexus", desc: "Lexus Fleet" },
                          { token: "fuel:Hybrid", desc: "Hybrid & Eco" },
                          { token: "origin:UAE", desc: "Dubai GCC" },
                          { token: "origin:Japan", desc: "Japan Imports" },
                        ].map((t) => (
                          <button
                            key={t.token}
                            type="button"
                            onClick={() => {
                              setDemoToken(t.token);
                              addToast(`Simulated Omnibox filter: ${t.token}`, "info");
                            }}
                            className={`px-2 py-1 rounded border text-xs font-mono transition cursor-pointer ${
                              demoToken === t.token
                                ? "border-[#1A73E8] bg-[#1A73E8]/10 text-[#1A73E8] dark:text-[#8AB4F8] font-bold"
                                : "border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] text-slate-600 dark:text-slate-300 hover:border-slate-400"
                            }`}
                          >
                            {t.token}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="rounded border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] p-2.5">
                        <strong className="text-slate-900 dark:text-white font-semibold flex items-center gap-1 mb-0.5">
                          <SlidersHorizontal className="h-3 w-3 text-[#1A73E8]" />
                          {language === "ps" ? "ثابت شوي لیدونه (Pinned Views)" : language === "fa" ? "لیدهای سنجاق‌شده (Pinned Views)" : "Pinned Views Bar"}
                        </strong>
                        <p className="text-slate-500">
                          {language === "ps"
                            ? "د موټرونو لست په یوه کلیک سره د 'اسلام قلعه ترانزیت'، 'هایبرډ موټرونه' یا 'د دوبۍ واردات' ته واړوئ."
                            : language === "fa"
                            ? "دسترسی فوری به دسته‌بندی‌های کلیدی مثل موترهای در حال ترانزیت مرزی، هیبرید و موترهای آماده تحویل."
                            : "One-click filter presets across the top of the fleet registry for instant segmentation."}
                        </p>
                      </div>

                      <div className="rounded border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] p-2.5">
                        <strong className="text-slate-900 dark:text-white font-semibold flex items-center gap-1 mb-0.5">
                          <Calculator className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          {language === "ps" ? "په پلټنه کې د صرافۍ حساب" : language === "fa" ? "ماشین‌حساب صرافی درون جستجو" : "Inline Sarrafi FX Calc"}
                        </strong>
                        <p className="text-slate-500">
                          {language === "ps"
                            ? "که په پلټنه کې یوازې شمیره ولیکئ (لکه 45000)، سمدستي به یې په افغانیو تبادله درته وښیي."
                            : language === "fa"
                            ? "اگر در کادر جستجو هر عددی بنویسید (مثلاً 50000)، به طور آنی معادل افغانی آن با نرخ روز محاسبه می‌شود."
                            : "Type any number like '50000' in search to get instant USD ⇄ AFN conversion preview."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 3: Islam Qala Customs Logistics & Port Vault */}
              {tutorialStep === 3 && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-slate-50/50 dark:bg-[#121722]/50 p-4">
                    {/* 3 Step Timeline */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                      <div className="p-2.5 rounded-lg border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26]">
                        <span className="text-[10px] font-mono text-[#1A73E8] font-bold">STAGE 1</span>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">Port Arrival & Dubai Bill</h5>
                        <p className="text-[10px] text-slate-500 mt-0.5">Bandar Abbas dry transit & initial manifests.</p>
                      </div>
                      <div className="p-2.5 rounded-lg border border-[#1A73E8] bg-[#1A73E8]/[0.05] dark:bg-[#1A73E8]/10 shadow-sm">
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">STAGE 2 (ACTIVE)</span>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">Islam Qala Clearance</h5>
                        <p className="text-[10px] text-slate-500 mt-0.5">Customs Maktoub, tariff evaluation & duty payment.</p>
                      </div>
                      <div className="p-2.5 rounded-lg border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26]">
                        <span className="text-[10px] font-mono text-slate-400 font-bold">STAGE 3</span>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">Herat Lot Placement</h5>
                        <p className="text-[10px] text-slate-500 mt-0.5">Physical check, detailing, barcode stickers.</p>
                      </div>
                    </div>

                    {/* Interactive Document Vault Tabs */}
                    <div className="rounded-lg border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#0F141C] p-3">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#262F40] pb-2 mb-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-[#1A73E8]" />
                          {language === "ps" ? "د ګمرک رسمي اسناد:" : language === "fa" ? "اسناد گمرکی معتبر:" : "Customs Document Vault Preview:"}
                        </span>
                        <div className="flex gap-1">
                          {[
                            { key: "maktoub", label: "Customs Maktoub" },
                            { key: "chamber", label: "Chamber Cert" },
                            { key: "tariff", label: "Tariff Sheet" },
                          ].map((tab) => (
                            <button
                              key={tab.key}
                              type="button"
                              onClick={() => setDemoCustomsDoc(tab.key as any)}
                              className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                                demoCustomsDoc === tab.key
                                  ? "bg-[#1A73E8] text-white"
                                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                              }`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-600 dark:text-slate-300 font-mono space-y-1">
                        {demoCustomsDoc === "maktoub" && (
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Maktoub Ref:</span>
                              <span className="font-bold text-slate-900 dark:text-white">IQ-2024-HER-8942-B</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Islam Qala Post:</span>
                              <span>Terminal 3 Commercial Customs Yard</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Clearance Status:</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">VERIFIED & STAMPED</span>
                            </div>
                          </div>
                        )}
                        {demoCustomsDoc === "chamber" && (
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Origin Authority:</span>
                              <span className="font-bold text-slate-900 dark:text-white">Dubai Chamber of Commerce & Industry</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Shipper / Exporter:</span>
                              <span>Al-Futtaim Auto Motors LLC (Dubai)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Consignee:</span>
                              <span>Sadozai Motors Herat (Lic #49912)</span>
                            </div>
                          </div>
                        )}
                        {demoCustomsDoc === "tariff" && (
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-400">HS Customs Code:</span>
                              <span className="font-bold text-slate-900 dark:text-white">8703.23 (3.5L V6 Petrol/Twin-Turbo)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Customs Tariff Rate:</span>
                              <span>16% Ad Valorem + 2.5% Municipality Port Levy</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Calculated Gomrok Duty:</span>
                              <span className="text-slate-900 dark:text-white font-bold">$18,400 USD (؋ 1,297,200 AFN)</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 4: Sarrafi Treasury & AFN/USD Dual Currency */}
              {tutorialStep === 4 && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-slate-50/50 dark:bg-[#121722]/50 p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Banknote className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          {language === "ps" ? "د صرافۍ د نرخ او اسعارو تبادله:" : language === "fa" ? "تبدیل اسعار با نرخ زنده سرای شهزاده/خراسان:" : "Live Sarrafi Rate & Dual Currency Sandbox:"}
                        </span>
                        <p className="text-[11px] text-slate-500">
                          {language === "ps"
                            ? `د هرات اوسنی نرخ: ۱ ډالر = ${exchangeRate} افغانۍ`
                            : language === "fa"
                            ? `نرخ روز صرافی هرات: ۱ دالر = ${exchangeRate} افغانی`
                            : `Herat Khorasan Market Rate: $1 USD = ${exchangeRate} AFN`}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 bg-white dark:bg-[#0F141C] p-1 rounded-lg border border-slate-200 dark:border-[#262F40]">
                        <button
                          type="button"
                          onClick={() => setCurrency("USD")}
                          className={`px-2 py-0.5 text-xs font-mono font-bold rounded ${
                            currency === "USD" ? "bg-[#1A73E8] text-white" : "text-slate-500"
                          }`}
                        >
                          USD ($)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrency("AFN")}
                          className={`px-2 py-0.5 text-xs font-mono font-bold rounded ${
                            currency === "AFN" ? "bg-[#1A73E8] text-white" : "text-slate-500"
                          }`}
                        >
                          AFN (؋)
                        </button>
                      </div>
                    </div>

                    {/* Interactive Amount Clicker */}
                    <div className="mb-3">
                      <div className="text-[11px] font-semibold text-slate-500 mb-1.5">
                        {language === "ps" ? "د موټر بیه وټاکئ:" : language === "fa" ? "قیمت دلخواه را انتخاب کنید:" : "Select or type vehicle price to test live conversion:"}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {[35000, 52000, 75000, 98000, 125000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setDemoFxUsd(amt)}
                            className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition cursor-pointer ${
                              demoFxUsd === amt
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            ${amt.toLocaleString()}
                          </button>
                        ))}
                      </div>

                      {/* Result Box */}
                      <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.05] flex items-center justify-between text-xs font-mono">
                        <div>
                          <span className="text-slate-500 text-[11px] block">Price in US Dollars:</span>
                          <span className="text-base font-bold text-slate-900 dark:text-white">
                            ${demoFxUsd.toLocaleString()} USD
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <div className="text-end">
                          <span className="text-slate-500 text-[11px] block">Equivalent in Afghan Afghani:</span>
                          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                            ؋ {Math.round(demoFxUsd * exchangeRate).toLocaleString()} AFN
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      {language === "ps"
                        ? "د سیسټم په ټولو برخو کې لکه قباله، فاکتورونه او لګښتونه، تاسو کولای شئ هر وخت د پورتنۍ برخې څخه اسعار بدل کړئ."
                        : language === "fa"
                        ? "در تمامی بخش‌ها شامل صدور قباله، فاکتور تجاری و پرداخت‌های تامین‌کنندگان، مبالغ به صورت لحظه‌ای با نرخ تعیین‌شده به‌روز می‌شوند."
                        : "Across the entire ERP, invoices, vouchers, and customer sales deeds automatically convert between USD and AFN with one click in the header."}
                    </p>
                  </div>
                </div>
              )}

              {/* SLIDE 5: Client Presentation Mode (Walk-in Customer Privacy) */}
              {tutorialStep === 5 && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-slate-50/50 dark:bg-[#121722]/50 p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {demoPresentationActive ? (
                            <EyeOff className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-[#1A73E8]" />
                          )}
                          {language === "ps"
                            ? "مشتري ته د پردې ښودلو حالت (محرمیت):"
                            : language === "fa"
                            ? "حالت نمایش به خریدار (محرمیت تجاری):"
                            : "Walk-in Buyer Privacy Demonstration:"}
                        </span>
                        <p className="text-[11px] text-slate-500">
                          {language === "ps"
                            ? "کله چې مراجعین نندارتون ته راځي، په یوه کلیک سره د ګټې فیصدي او تمامه شوې بیه پټه کړئ."
                            : language === "fa"
                            ? "هنگام نمایش صفحه مانیتور یا تبلت به مشتری، قیمت تمام‌شده و مفاد خالص پنهان می‌شود."
                            : "Prevents walk-in buyers from seeing dealer wholesale purchase costs and profit margins."}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setDemoPresentationActive(!demoPresentationActive);
                          addToast(
                            demoPresentationActive
                              ? "Presentation mode disabled in demo"
                              : "Presentation mode activated in demo",
                            "info"
                          );
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                          demoPresentationActive
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-[#1A73E8] text-white hover:bg-[#1557B0]"
                        }`}
                      >
                        {demoPresentationActive ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5" />
                            <span>Client View Active (Costs Hidden)</span>
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5" />
                            <span>Test Hide Costs Mode</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Comparison Table */}
                    <div className="rounded-lg border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#0F141C] overflow-hidden text-xs">
                      <div className="grid grid-cols-3 bg-slate-100 dark:bg-[#161B26] p-2.5 font-bold text-slate-700 dark:text-slate-300">
                        <div>Metric</div>
                        <div className="text-center">Staff Mode</div>
                        <div className="text-end">Client Presentation Mode</div>
                      </div>

                      <div className="divide-y divide-slate-100 dark:divide-[#262F40]">
                        <div className="grid grid-cols-3 p-2.5 items-center">
                          <span className="font-medium text-slate-900 dark:text-white">Lot Selling Price</span>
                          <span className="text-center font-mono font-bold text-slate-900 dark:text-white">
                            $92,000
                          </span>
                          <span className="text-end font-mono font-bold text-slate-900 dark:text-white">
                            $92,000 (Visible)
                          </span>
                        </div>

                        <div className="grid grid-cols-3 p-2.5 items-center bg-slate-50/50 dark:bg-white/[0.01]">
                          <span className="font-medium text-slate-900 dark:text-white">Dealer Landed Cost</span>
                          <span className="text-center font-mono text-slate-500">
                            $78,400
                          </span>
                          <span className="text-end">
                            {demoPresentationActive ? (
                              <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-mono font-bold">
                                [HIDDEN FROM CLIENT]
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px] font-mono">
                                Click button above to hide
                              </span>
                            )}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 p-2.5 items-center">
                          <span className="font-medium text-slate-900 dark:text-white">Projected Net Margin</span>
                          <span className="text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            +$13,600 (14.8%)
                          </span>
                          <span className="text-end">
                            {demoPresentationActive ? (
                              <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-mono font-bold">
                                [HIDDEN FROM CLIENT]
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px] font-mono">
                                Click button above to hide
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 6: Pro Shortcuts & Barcode Scanner */}
              {tutorialStep === 6 && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-slate-50/50 dark:bg-[#121722]/50 p-4">
                    <div className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Keyboard className="h-4 w-4 text-[#1A73E8]" />
                        {language === "ps" ? "ګړندي شارټ کټونه (Shortcuts):" : language === "fa" ? "کلیدهای میانبر سریع سیستم:" : "Two-Key Global Navigation Chords:"}
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        Press key 1, then key 2
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                      {[
                        { keys: ["g", "d"], label: "Operations Cockpit (Home)", path: "/" },
                        { keys: ["g", "i"], label: "Vehicle Inventory Registry", path: "/inventory" },
                        { keys: ["g", "a"], label: "Sarrafi Accounting Hub", path: "/accounting" },
                        { keys: ["g", "l"], label: "Islam Qala Customs Desk", path: "/logistics" },
                        { keys: ["g", "n"], label: "Register New Vehicle Intake", path: "/intake" },
                        { keys: ["g", "t"], label: "Open This Tutorial Anytime", path: "#" },
                      ].map((sc) => (
                        <div
                          key={sc.label}
                          className="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26]"
                        >
                          <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                            {sc.label}
                          </span>
                          <div className="flex items-center gap-1">
                            {sc.keys.map((k, i) => (
                              <React.Fragment key={k}>
                                <kbd className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
                                  {k}
                                </kbd>
                                {i < sc.keys.length - 1 && (
                                  <span className="text-[9px] text-slate-400">then</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Barcode Scanner Highlight */}
                    <div className="p-3 rounded-lg border border-purple-200 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20 flex items-start gap-2.5 text-xs text-purple-950 dark:text-purple-200">
                      <ScanLine className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold">
                          {language === "ps"
                            ? "د بارکوډ او کیو آر کوډ سکنر:"
                            : language === "fa"
                            ? "اسکنر بارکد شیشه و کیو‌آر قباله:"
                            : "Physical VIN & Sales Deed QR Scanner (/scanner):"}
                        </strong>{" "}
                        {language === "ps"
                          ? "د موبایل یا بارکوډ خوان په واسطه د موټرو د ښیښې بارکوډ یا د چاپ شوې قبالې QR کوډ سکن کړئ ترڅو اصليت یې تثبیت شي."
                          : language === "fa"
                          ? "با استفاده از کمره مبایل یا بارکدخوان فیزیکی، استیکر بارکد روی موتر یا QR کد چاپ‌شده روی قباله را اسکن کنید تا پرونده موتر یا صحت قباله فوراً تایید شود."
                          : "Use your smartphone camera or hardware wedge scanner to scan windshield barcodes or verify sales deeds with zero typing."}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 7: Ready to Roll! (Dealership Launchpad) */}
              {tutorialStep === 7 && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 dark:border-[#262F40] bg-slate-50/50 dark:bg-[#121722]/50 p-5 text-center">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {language === "ps"
                        ? "تاسو د کار پیلولو ته چمتو یاست!"
                        : language === "fa"
                        ? "تبریک! شما آماده کار با سیستم هستید"
                        : "You're All Set & Ready to Work!"}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-5">
                      {language === "ps"
                        ? "تاسو اوس کولی شئ موټرونه وڅارئ، ګمرکي اسناد وڅېړئ، صرافي حوالې تنظیم کړئ او رسمې قبالې صادرې کړئ."
                        : language === "fa"
                        ? "اکنون می‌توانید واردات موتر، ترخیص گمرکی، صدور قباله رسمی و حسابداری صرافی را به آسانی مدیریت نمایید."
                        : "Select where you want to jump in first, or close this tutorial to begin working."}
                    </p>

                    {/* Launchpad Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => handleFinishAndNavigate("/")}
                        className="p-3 rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] hover:border-[#1A73E8] transition text-center group cursor-pointer"
                      >
                        <Car className="h-5 w-5 mx-auto mb-1 text-[#1A73E8] group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-slate-900 dark:text-white block">Cockpit</span>
                        <span className="text-[10px] text-slate-400">Operations Hub</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFinishAndNavigate("/inventory")}
                        className="p-3 rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] hover:border-[#1A73E8] transition text-center group cursor-pointer"
                      >
                        <Search className="h-5 w-5 mx-auto mb-1 text-emerald-600 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-slate-900 dark:text-white block">Inventory</span>
                        <span className="text-[10px] text-slate-400">All Vehicles</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFinishAndNavigate("/logistics")}
                        className="p-3 rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] hover:border-[#1A73E8] transition text-center group cursor-pointer"
                      >
                        <Truck className="h-5 w-5 mx-auto mb-1 text-amber-500 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-slate-900 dark:text-white block">Logistics</span>
                        <span className="text-[10px] text-slate-400">Islam Qala Port</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFinishAndNavigate("/accounting")}
                        className="p-3 rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] hover:border-[#1A73E8] transition text-center group cursor-pointer"
                      >
                        <Banknote className="h-5 w-5 mx-auto mb-1 text-purple-600 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-slate-900 dark:text-white block">Sarrafi Hub</span>
                        <span className="text-[10px] text-slate-400">Treasury & Deeds</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Slide Navigation Controls */}
            <div className="pt-4 border-t border-slate-200 dark:border-[#262F40] flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
              {/* Checkbox: Don't show again on startup */}
              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="rounded border-slate-300 text-[#1A73E8] focus:ring-[#1A73E8]"
                />
                <span>{t.tutorialDontShowAgain}</span>
              </label>

              {/* Progress Dots & Buttons */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 me-2">
                  {stepsMeta.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTutorialStep(idx)}
                      className={`h-2 rounded-full transition-all ${
                        tutorialStep === idx
                          ? "w-6 bg-[#1A73E8]"
                          : "w-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300"
                      }`}
                      title={`Jump to step ${idx + 1}`}
                    />
                  ))}
                </div>

                {tutorialStep > 0 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition flex items-center gap-1 cursor-pointer"
                  >
                    {isRtl ? <ArrowRight className="h-3.5 w-3.5" /> : <ArrowLeft className="h-3.5 w-3.5" />}
                    <span>{t.tutorialButtonPrev}</span>
                  </button>
                )}

                {tutorialStep < totalSteps - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-4 py-1.5 rounded-lg bg-[#1A73E8] text-xs font-semibold text-white hover:bg-[#1557B0] transition flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <span>{t.tutorialButtonNext}</span>
                    {isRtl ? <ArrowLeft className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => completeTutorial(dontShowAgain)}
                    className="px-5 py-1.5 rounded-lg bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 transition flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>{t.tutorialButtonFinish}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Feature Matrix & Cheatsheet */}
        {activeTab === "matrix" && (
          <div className="p-5 sm:p-7 overflow-y-auto max-h-[75vh] space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.tutorialTabSummary}
              </h3>
              <p className="text-xs text-slate-500">
                Quick reference guide to all dealership modules, shortcuts, and capabilities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-200 dark:border-[#262F40] p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Car className="h-4 w-4 text-[#1A73E8]" />
                    Fleet Registry & Inspector
                  </span>
                  <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                    g + i
                  </kbd>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Faceted filter by make, origin (UAE/Japan), production year, fuel type (Hybrid/Petrol), and customs clearance status.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-[#262F40] p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Islam Qala Customs Desk
                  </span>
                  <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                    g + l
                  </kbd>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Track dry port border shipments, Chamber of commerce certificates, Maktoub declarations, and calculate duty in AFN.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-[#262F40] p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Banknote className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    Sarrafi Treasury & FX
                  </span>
                  <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                    g + a
                  </kbd>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Dual currency USD/AFN accounting, Khorasan Sarrafi exchange rate adjustments, payment vouchers, and customer installments.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-[#262F40] p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ScanLine className="h-4 w-4 text-amber-500" />
                    Lot & Deed Barcode Scanner
                  </span>
                  <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                    /scanner
                  </kbd>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Scan vehicle windshield tags, VIN chassis plates, or official sales deed QR codes using your camera or hardware scanner.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-[#262F40] flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("tour");
                  setTutorialStep(0);
                }}
                className="text-xs text-[#1A73E8] dark:text-[#8AB4F8] hover:underline flex items-center gap-1"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{t.tutorialButtonRestart}</span>
              </button>

              <button
                type="button"
                onClick={() => completeTutorial(dontShowAgain)}
                className="px-4 py-1.5 rounded-lg bg-[#1A73E8] text-xs font-semibold text-white hover:bg-[#1557B0]"
              >
                {t.tutorialButtonFinish}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
