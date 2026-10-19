"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { MuiChip, MuiButton, Avatar, IconButton } from "@/components/mui";
import {
  LayoutDashboard,
  Car,
  Users,
  BadgeDollarSign,
  TrendingUp,
  FileText,
  ShieldCheck,
  Receipt,
  Settings,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Truck,
  Compass,
  Boxes,
  HelpCircle,
  Sparkles,
  Layers,
  ScanLine,
  X,
} from "lucide-react";

interface ErpSidebarProps {
  onOpenIntake?: () => void;
}

export function ErpSidebar({ onOpenIntake }: ErpSidebarProps) {
  const pathname = usePathname();
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
  } = useShowroomStore();
  const [collapsed, setCollapsed] = useState(false);

  const t = translations[language];

  const inTransitCount = vehicles.filter((v) => v.status === "In Transit").length;

  const navSections = [
    {
      label: language === "ps" ? "۰۱ / سټاک او موټرونه" : language === "fa" ? "۰۱ / گدام و موجودی" : "01 / FLEET & LOT",
      items: [
        {
          title: language === "ps" ? "د نندارتون ډشبورډ" : language === "fa" ? "داشبورد عملیاتی" : "Operations Cockpit",
          href: "/",
          icon: LayoutDashboard,
          count: null,
        },
        {
          title: language === "ps" ? "د موټرونو ګودام او سټاک" : language === "fa" ? "گدام و موجودی موترها" : "Vehicle Inventory",
          href: "/inventory",
          icon: Car,
          count: vehicles.length,
        },
        {
          title: language === "ps" ? "د موټر ثبت او عکاسي" : language === "fa" ? "ثبت موتر و عکاسی" : "Vehicle Intake",
          href: "/intake",
          icon: PlusCircle,
          count: null,
        },
        {
          title: language === "ps" ? "د موټرونو مقایسه" : language === "fa" ? "مقایسه موترها" : "Fleet Comparison",
          href: "/compare",
          icon: Layers,
          count: compareIds.length > 0 ? compareIds.length : null,
        },
        {
          title: language === "ps" ? "د بارکوډ او شاسي سکنر" : language === "fa" ? "اسکنر بارکد و شاسی" : "Lot VIN Scanner",
          href: "/scanner",
          icon: ScanLine,
          count: null,
        },
      ],
    },
    {
      label: language === "ps" ? "۰۲ / پلور او مراجعین" : language === "fa" ? "۰۲ / فروشات و قرارداد" : "02 / COMMERCIAL DESK",
      items: [
        {
          title: language === "ps" ? "د مراجعینو او پلور مرکز (CRM)" : language === "fa" ? "مشتریان، لیدها و قراردادها" : "CRM & Sales Desk",
          href: "/admin",
          icon: Users,
          count: customers.length,
        },
      ],
    },
    {
      label: language === "ps" ? "۰۳ / مالي او ګمرک" : language === "fa" ? "۰۳ / خزانه، صرافی و گمرک" : "03 / TREASURY & PORT",
      items: [
        {
          title: language === "ps" ? "د محاسبې او صرافۍ مرکز" : language === "fa" ? "حسابداری، صرافی و فاکتور" : "Accounting & Sarrafi",
          href: "/accounting",
          icon: Receipt,
          count: invoices.length,
        },
        {
          title: language === "ps" ? "د اسلام قلعه او ترانزیت لوژستیک" : language === "fa" ? "لوجستیک و گمرک اسلام قلعه" : "Customs & Port Logistics",
          href: "/logistics",
          icon: Truck,
          count: inTransitCount > 0 ? inTransitCount : null,
        },
      ],
    },
  ];

  const renderSidebarContent = (isMobile = false) => (
    <>
      {/* Brand Authority Header */}
      <div className="flex h-14 items-center justify-between border-b border-white/[0.08] px-4">
        {(!collapsed || isMobile) && (
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden group">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-amber-600/15 border border-amber-500/40 text-amber-400 font-mono text-xs font-bold tracking-tighter">
              SM
            </div>
            <div className="truncate">
              <div className="text-xs font-bold uppercase tracking-wider text-white whitespace-nowrap">
                Sadozai Motors
              </div>
              <div className="font-mono text-[10px] text-slate-400 tracking-tight">
                HERAT · LIC #49912
              </div>
            </div>
          </Link>
        )}

        {collapsed && !isMobile && (
          <Link
            href="/"
            className="mx-auto flex h-8 w-8 items-center justify-center rounded bg-amber-600/15 border border-amber-500/40 text-amber-400 font-mono text-xs font-bold"
          >
            SM
          </Link>
        )}

        {isMobile ? (
          <button
            onClick={() => setMobileDrawerOpen(false)}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5"
            title="Close Drawer"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5"
            title={collapsed ? "Expand Rail" : "Collapse Rail"}
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            )}
          </button>
        )}
      </div>

      {/* Primary Action Strip */}
      <div className="px-3 pt-3 pb-2">
        <Link
          href="/intake"
          onClick={() => isMobile && setMobileDrawerOpen(false)}
          className={`flex items-center justify-center gap-2 rounded bg-amber-600 hover:bg-amber-500 px-3 py-2 text-xs font-semibold text-white transition whitespace-nowrap ${
            collapsed && !isMobile ? "h-9 w-9 p-0 mx-auto" : "w-full"
          }`}
          title={t.addNewVehicle}
        >
          <PlusCircle className="h-3.5 w-3.5 shrink-0" />
          {(!collapsed || isMobile) && <span>{t.addNewVehicle}</span>}
        </Link>
      </div>

      {/* Sectioned Navigation Rail */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-2.5 py-3">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {(!collapsed || isMobile) && (
              <div className="px-2.5 pb-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-500">
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
                  className={`group flex items-center gap-2.5 rounded px-2.5 py-2 text-xs transition ${
                    isActive
                      ? "border-s-2 border-amber-500 bg-white/[0.07] font-semibold text-white"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                  } ${collapsed && !isMobile ? "justify-center px-0" : ""}`}
                  title={collapsed && !isMobile ? item.title : undefined}
                >
                  <span
                    className={`shrink-0 ${
                      isActive ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"
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
                              ? "bg-amber-500/20 text-amber-300 font-bold"
                              : "text-slate-500 group-hover:text-slate-400"
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
      </nav>

      {/* Khorasan Sarrafi Desk & Operator Footer */}
      <div className="border-t border-white/[0.08] p-3 space-y-2.5 bg-[#080A0E]">
        {(!collapsed || isMobile) && (
          <div className="rounded border border-white/[0.07] bg-white/[0.02] px-2.5 py-2 font-mono text-[11px]">
            <div className="flex items-center justify-between text-slate-400">
              <span>SARRAFI FX</span>
              <span className="text-amber-400 font-bold tabular-nums">
                1 USD = {exchangeRate} AFN
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
              <span>ISLAM QALA PORT</span>
              <span className="text-emerald-400">ACTIVE</span>
            </div>
          </div>
        )}

        <div
          className={`flex items-center gap-2.5 px-1 ${
            collapsed && !isMobile ? "justify-center" : ""
          }`}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-slate-800 border border-white/10 font-mono text-[11px] font-bold text-amber-400">
            {currentRole === "SuperAdmin"
              ? "HA"
              : currentRole === "SalesAgent"
              ? "FT"
              : "MS"}
          </div>

          {(!collapsed || isMobile) && (
            <div className="min-w-0 truncate">
              <div className="truncate text-xs font-semibold text-slate-200">
                {currentRole === "SuperAdmin"
                  ? "Haji Ahmad Shah"
                  : currentRole === "SalesAgent"
                  ? "Farhad Timori"
                  : "Mirwais Saljuqi"}
              </div>
              <div className="truncate font-mono text-[10px] text-slate-500 uppercase">
                {currentRole}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Obsidian Rail */}
      <aside
        className={`sticky top-0 z-40 hidden md:flex h-screen flex-col border-r rtl:border-r-0 rtl:border-l border-white/[0.08] bg-[#0B0D12] text-slate-300 transition-all duration-200 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Slide-Over Overlay Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <aside className="relative z-50 flex h-full w-64 max-w-[85vw] flex-col border-r rtl:border-r-0 rtl:border-l border-white/[0.08] bg-[#0B0D12] text-slate-300 shadow-2xl animate-in slide-in-from-left rtl:slide-in-from-right duration-200">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
