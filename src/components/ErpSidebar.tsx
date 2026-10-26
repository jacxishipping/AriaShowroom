"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import {
  LayoutDashboard,
  Car,
  Users,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Plus,
  Truck,
  Layers,
  ScanLine,
  X,
  Bookmark,
  Keyboard,
  HelpCircle,
  SlidersHorizontal,
  Upload,
  KeyRound,
  History,
  ShieldCheck,
  BarChart3,
} from "lucide-react";

interface ErpSidebarProps {
  onOpenIntake?: () => void;
}

export function ErpSidebar({ onOpenIntake: _onOpenIntake }: ErpSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const {
    vehicles,
    customers,
    invoices,
    exchangeRate,
    language,
    currentRole,
    compareIds,
    mobileDrawerOpen,
    setMobileDrawerOpen,
    pinnedViews,
    activePinnedViewId,
    applyPinnedView,
    setIsShortcutsModalOpen,
    setIsTutorialOpen,
    branding,
  } = useShowroomStore();
  const [collapsed, setCollapsed] = useState(false);

  const t = translations[language];
  const inTransitCount = vehicles.filter((v) => v.status === "In Transit").length;

  const localizedBrandName =
    language === "fa"
      ? branding.dealershipNameFa || branding.dealershipName
      : language === "ps"
      ? branding.dealershipNamePs || branding.dealershipName
      : branding.dealershipName;

  const shortCode = branding.dealershipShortCode || "AM";

  const fleetItems = [
    {
      title:
        language === "ps"
          ? "د نندارتون ډشبورډ"
          : language === "fa"
          ? "داشبورد عملیاتی"
          : "Operations Cockpit",
      href: "/",
      icon: LayoutDashboard,
      count: null as number | null,
      shortcut: "g d",
    },
    {
      title:
        language === "ps"
          ? "د موټرونو ګودام او سټاک"
          : language === "fa"
          ? "گدام و موجودی موترها"
          : "Vehicle Inventory",
      href: "/inventory",
      icon: Car,
      count: vehicles.length,
      shortcut: "g i",
    },
    ...(currentRole === "SuperAdmin"
      ? [
          {
            title:
              language === "ps"
                ? "د موټر ثبت او عکاسي"
                : language === "fa"
                ? "ثبت موتر و عکاسی"
                : "Vehicle Intake",
            href: "/intake",
            icon: Plus,
            count: null,
            shortcut: "g n",
          },
          {
            title:
              language === "ps"
                ? "د CSV ډله ایز واردات"
                : language === "fa"
                ? "واردات دسته‌ای CSV"
                : "Batch CSV Import",
            href: "/inventory/import",
            icon: Upload,
            count: null,
            shortcut: null,
          },
        ]
      : []),
    {
      title:
        language === "ps"
          ? "د موټرونو مقایسه"
          : language === "fa"
          ? "مقایسه موترها"
          : "Fleet Comparison",
      href: "/compare",
      icon: Layers,
      count: compareIds.length > 0 ? compareIds.length : null,
      shortcut: null,
    },
    {
      title:
        language === "ps"
          ? "د بارکوډ او شاسي سکنر"
          : language === "fa"
          ? "اسکنر بارکد و شاسی"
          : "Lot VIN Scanner",
      href: "/scanner",
      icon: ScanLine,
      count: null,
      shortcut: null,
    },
  ];

  const treasuryItems = [
    ...(currentRole === "SuperAdmin" || currentRole === "Accountant"
      ? [
          {
            title:
              language === "ps"
                ? "د محاسبې او صرافۍ مرکز"
                : language === "fa"
                ? "حسابداری، صرافی و فاکتور"
                : "Accounting & Sarrafi",
            href: "/accounting",
            icon: Receipt,
            count: invoices.length,
            shortcut: "g a",
          },
        ]
      : []),
    {
      title:
        language === "ps"
          ? "د اسلام قلعه او ترانزیت لوژستیک"
          : language === "fa"
          ? "لوجستیک و گمرک اسلام قلعه"
          : "Customs & Port Logistics",
      href: "/logistics",
      icon: Truck,
      count: inTransitCount > 0 ? inTransitCount : null,
      shortcut: "g l",
    },
  ];

  const navSections = [
    {
      label:
        language === "ps"
          ? "سټاک او موټرونه"
          : language === "fa"
          ? "گدام و موجودی"
          : "Fleet & Inventory",
      items: fleetItems,
    },
    {
      label:
        language === "ps"
          ? "پلور او مراجعین"
          : language === "fa"
          ? "فروشات و قرارداد"
          : "Commercial Desk",
      items: [
        {
          title:
            language === "ps"
              ? "د مراجعینو او پلور مرکز"
              : language === "fa"
              ? "مشتریان و قراردادها"
              : "CRM & Sales Desk",
          href: "/admin",
          icon: Users,
          count: customers.length,
          shortcut: "g c",
        },
        {
          title: t.historyTitle,
          href: "/history",
          icon: History,
          count: null,
          shortcut: null,
        },
      ],
    },
    {
      label:
        language === "ps"
          ? "مالي او ګمرک"
          : language === "fa"
          ? "خزانه، صرافی و گمرک"
          : "Treasury & Port",
      items: treasuryItems,
    },
  ];

  if (currentRole === "SuperAdmin" || currentRole === "Accountant") {
    navSections.push({
      label: t.reportsTitle,
      items: [
        {
          title: t.reportsTitle,
          href: "/reports",
          icon: BarChart3,
          count: null,
          shortcut: null,
        },
      ],
    });
  }

  if (currentRole === "SuperAdmin") {
    navSections.push({
      label: t.adminStaffTitle,
      items: [
        {
          title: t.adminStaffTitle,
          href: "/admin/users",
          icon: Users,
          count: null,
          shortcut: null,
        },
        {
          title: t.auditTitle,
          href: "/admin/audit",
          icon: ShieldCheck,
          count: null,
          shortcut: null,
        },
      ],
    });
  }

  navSections.push({
    label:
      language === "ps"
        ? "سیسټم او ترتیبات"
        : language === "fa"
        ? "تنظیمات و سیستم"
        : "System & Settings",
    items: [
      {
        title:
          language === "ps"
            ? "د نندارتون ترتیبات او رنګونه"
            : language === "fa"
            ? "تنظیمات و برندینگ نمایشگاه"
            : "Settings & Theming",
        href: "/settings",
        icon: SlidersHorizontal,
        count: null,
        shortcut: "g s",
      },
      {
        title:
          language === "ps"
            ? "پټنوم بدلول"
            : language === "fa"
            ? "تغییر رمز عبور"
            : "Change Password",
        href: "/account/security/password",
        icon: KeyRound,
        count: null,
        shortcut: null,
      },
    ],
  });

  const fallbackUserName =
    currentRole === "SuperAdmin"
      ? "Haji Ahmad Shah"
      : currentRole === "SalesAgent"
      ? "Farhad Timori"
      : "Mirwais Saljuqi";
  const displayUserName = session?.user?.name || fallbackUserName;
  const displayInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : currentRole === "SuperAdmin"
    ? "HA"
    : currentRole === "SalesAgent"
    ? "FT"
    : "MS";

  const renderSidebarContent = (isMobile = false) => (
    <>
      {/* Enterprise Console Brand Header */}
      <div className="flex h-14 items-center justify-between border-b border-slate-200 dark:border-[#262F40] px-4">
        {(!collapsed || isMobile) && (
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden group">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white font-display text-xs font-bold tracking-tight">
              {shortCode}
            </div>
            <div className="truncate">
              <div className="text-sm font-bold tracking-tight text-slate-900 dark:text-white truncate">
                {localizedBrandName}
              </div>
              <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {t.sidebarCloudConsole} · Herat
              </div>
            </div>
          </Link>
        )}

        {collapsed && !isMobile && (
          <Link
            href="/"
            className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-display text-xs font-bold"
            title={localizedBrandName}
          >
            {shortCode}
          </Link>
        )}

        {isMobile ? (
          <button
            onClick={() => setMobileDrawerOpen(false)}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
            title={t.sidebarCloseDrawer}
            aria-label={t.sidebarCloseDrawer}
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
            title={collapsed ? t.sidebarExpandNavigation : t.sidebarCollapseNavigation}
            aria-label={collapsed ? t.sidebarExpandNavigation : t.sidebarCollapseNavigation}
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            )}
          </button>
        )}
      </div>

      {/* Primary Action Button (+ New Vehicle — SuperAdmin only) */}
      {currentRole === "SuperAdmin" && (
        <div className="px-3 pt-3 pb-1">
          <Link
            href="/intake"
            onClick={() => isMobile && setMobileDrawerOpen(false)}
            className={`flex items-center justify-center gap-2 rounded-lg bg-primary hover:opacity-95 px-3 py-2 text-xs font-semibold text-white transition whitespace-nowrap shadow-2xs ${
              collapsed && !isMobile ? "h-9 w-9 p-0 mx-auto" : "w-full"
            }`}
            title={t.addNewVehicle}
          >
            <Plus className="h-4 w-4 shrink-0" />
            {(!collapsed || isMobile) && <span>{t.addNewVehicle}</span>}
          </Link>
        </div>
      )}

      {/* Sectioned Navigation Rail */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-2.5 py-3">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-0.5">
            {(!collapsed || isMobile) && (
              <div className="px-2.5 pb-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                {section.label}
              </div>
            )}
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              const IconComponent = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => isMobile && setMobileDrawerOpen(false)}
                  className={`group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs transition ${
                    isActive
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-slate-200"
                  } ${collapsed && !isMobile ? "justify-center px-0" : ""}`}
                  title={collapsed && !isMobile ? item.title : undefined}
                >
                  <span
                    className={`shrink-0 ${
                      isActive
                        ? "text-primary"
                        : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                  </span>

                  {(!collapsed || isMobile) && (
                    <>
                      <span className="flex-1 truncate">{item.title}</span>
                      {item.count !== null && (
                        <span
                          className={`font-mono tabular-nums text-[11px] px-1.5 py-0.2 rounded ${
                            isActive
                              ? "text-primary font-bold"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        ))}

        {/* Pinned Workspace Views Section */}
        {(!collapsed || isMobile) && (
          <div className="space-y-0.5 pt-2 border-t border-slate-200 dark:border-[#262F40]">
            <div className="px-2.5 pb-1 flex items-center justify-between text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              <span>{t.sidebarPinnedViews}</span>
              <Bookmark className="h-3 w-3 text-primary" />
            </div>
            {pinnedViews.slice(0, 5).map((view) => {
              const isSelected = activePinnedViewId === view.id && pathname === "/inventory";
              return (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => {
                    applyPinnedView(view.id);
                    if (pathname !== "/inventory" && pathname !== "/") {
                      router.push("/inventory");
                    }
                    if (isMobile) setMobileDrawerOpen(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-start transition cursor-pointer ${
                    isSelected
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="truncate">
                    {language === "fa" && view.nameFa
                      ? view.nameFa
                      : language === "ps" && view.namePs
                      ? view.namePs
                      : view.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Sarrafi FX Telemetry & Keyboard Shortcut Footer */}
      <div className="border-t border-slate-200 dark:border-[#262F40] p-3 space-y-2.5 bg-slate-50/70 dark:bg-[#0F141C]">
        {(!collapsed || isMobile) && (
          <div className="rounded-md border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#161B26] px-2.5 py-2 font-mono text-[11px]">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>{t.sidebarSarrafiFx}</span>
              <span className="text-primary font-bold tabular-nums">
                1 USD = {exchangeRate} AFN
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
              <span>Islam Qala Port</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {t.dashboardVerified}
              </span>
            </div>
          </div>
        )}

        <div
          className={`flex items-center justify-between gap-2 px-1 ${
            collapsed && !isMobile ? "justify-center" : ""
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary font-mono text-[11px] font-bold">
              {displayInitials}
            </div>

            {(!collapsed || isMobile) && (
              <div className="min-w-0 truncate">
                <div className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {displayUserName}
                </div>
                <div className="truncate font-mono text-[10px] text-slate-400">
                  {currentRole === "SuperAdmin"
                    ? t.sidebarSuperAdmin
                    : currentRole === "SalesAgent"
                    ? t.sidebarSalesAgent
                    : t.sidebarAccountant}
                </div>
              </div>
            )}
          </div>

          {(!collapsed || isMobile) && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsTutorialOpen(true)}
                className="p-1.5 rounded-md border border-slate-200 dark:border-[#262F40] text-slate-500 hover:text-primary bg-white dark:bg-[#161B26]"
                title={
                  language === "fa"
                    ? "راهنمای برنامه"
                    : language === "ps"
                    ? "د اپلیکیشن لارښود"
                    : "Showroom Tutorial & Tour"
                }
                aria-label="Showroom Tutorial"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsShortcutsModalOpen(true)}
                className="p-1.5 rounded-md border border-slate-200 dark:border-[#262F40] text-slate-500 hover:text-primary bg-white dark:bg-[#161B26]"
                title={t.sidebarKeyboardShortcuts}
                aria-label={t.sidebarKeyboardShortcuts}
              >
                <Keyboard className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Navigation Rail */}
      <aside
        className={`sticky top-0 z-40 hidden md:flex h-screen flex-col border-e border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#121722] text-slate-700 dark:text-slate-300 transition-all duration-200 print:hidden ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Slide-Over Overlay Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex print:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <aside className="relative z-50 flex h-full w-64 max-w-[85vw] flex-col border-e border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#121722] text-slate-700 dark:text-slate-300 shadow-2xl">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
