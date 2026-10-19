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
    sales,
    invoices,
    language,
    currentRole,
    compareIds,
    mobileDrawerOpen,
    setMobileDrawerOpen,
  } = useShowroomStore();
  const [collapsed, setCollapsed] = useState(false);

  const t = translations[language];

  // Active lot vehicles count
  const activeLotCount = vehicles.filter((v) => v.status === "Available on Lot").length;
  const inTransitCount = vehicles.filter((v) => v.status === "In Transit").length;

  const navItems = [
    {
      title: language === "ps" ? "د نندارتون ډشبورډ" : language === "fa" ? "داشبورد عملیاتی" : "Operations Cockpit",
      href: "/",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      title: language === "ps" ? "د موټرونو ګودام او سټاک" : language === "fa" ? "گدام و موجودی موترها" : "Vehicle Inventory",
      href: "/inventory",
      icon: Car,
      badge: `${vehicles.length}`,
    },
    {
      title: language === "ps" ? "د موټر ثبت او عکاسي" : language === "fa" ? "ثبت موتر و عکاسی" : "Vehicle Intake",
      href: "/intake",
      icon: PlusCircle,
      badge: "New",
    },
    {
      title: language === "ps" ? "د موټرونو مقایسه" : language === "fa" ? "مقایسه موترها" : "Fleet Comparison",
      href: "/compare",
      icon: Layers,
      badge: compareIds.length > 0 ? `${compareIds.length}` : null,
    },
    {
      title: language === "ps" ? "د بارکوډ او شاسي سکنر" : language === "fa" ? "اسکنر بارکد و شاسی" : "Lot VIN Scanner",
      href: "/scanner",
      icon: ScanLine,
      badge: null,
    },
    {
      title: language === "ps" ? "د مدیریت او پلور انجن (ERP)" : language === "fa" ? "سیستم جامع مدیریت و CRM" : "Dealership ERP Hub",
      href: "/admin",
      icon: Boxes,
      badge: "ERP",
    },
    {
      title: language === "ps" ? "د محاسبې او صرافۍ مرکز" : language === "fa" ? "حسابداری، صرافی و فاکتور" : "Accounting & Sarrafi",
      href: "/accounting",
      icon: Receipt,
      badge: `${invoices.length}`,
    },
    {
      title: language === "ps" ? "د اسلام قلعه او ترانزیت لوژستیک" : language === "fa" ? "لوجستیک و گمرک اسلام قلعه" : "Customs & Port Logistics",
      href: "/logistics",
      icon: Truck,
      badge: inTransitCount > 0 ? `${inTransitCount} En Route` : null,
    },
  ];

  const renderSidebarContent = (isMobile = false) => (
    <>
      <div className="flex h-16 items-center justify-between border-b border-slate-200/80 px-4 dark:border-slate-800/80">
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm dark:bg-slate-700">
              <Car className="h-4 w-4" />
            </div>
            <div className="truncate">
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{t.brandName}</div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">ERP</div>
            </div>
          </div>
        )}

        {collapsed && !isMobile && (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-700">
            <Car className="h-4 w-4" />
          </div>
        )}

        {isMobile ? (
          <IconButton size="small" onClick={() => setMobileDrawerOpen(false)} title="Close Drawer">
            <X className="h-4 w-4" />
          </IconButton>
        ) : (
          <IconButton size="small" onClick={() => setCollapsed(!collapsed)} title={collapsed ? "Expand Drawer" : "Collapse Drawer"}>
            {collapsed ? <ChevronRight className="h-4 w-4 rtl:rotate-180" /> : <ChevronLeft className="h-4 w-4 rtl:rotate-180" />}
          </IconButton>
        )}
      </div>

      <div className="px-3 py-3">
        <Link
          href="/intake"
          onClick={() => isMobile && setMobileDrawerOpen(false)}
          className={`flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 ${
            collapsed && !isMobile ? "h-10 w-10 p-0" : "w-full"
          }`}
          title={t.addNewVehicle}
        >
          <PlusCircle className="h-4 w-4" />
          {(!collapsed || isMobile) && <span>{t.addNewVehicle}</span>}
        </Link>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && setMobileDrawerOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white"
              } ${collapsed && !isMobile ? "justify-center" : ""}`}
              title={collapsed && !isMobile ? item.title : undefined}
            >
              <span className={`shrink-0 ${isActive ? "text-blue-600 dark:text-blue-300" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"}`}>
                <IconComponent className="h-4 w-4" />
              </span>

              {(!collapsed || isMobile) && (
                <>
                  <span className="flex-1 truncate">{item.title}</span>
                  {item.badge && (
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${isActive ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"}`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200/80 p-3 dark:border-slate-800/80">
        <div className={`flex items-center gap-3 rounded-xl bg-slate-50 p-2 dark:bg-slate-900/60 ${collapsed && !isMobile ? "justify-center" : ""}`}>
          <div className="relative shrink-0">
            <Avatar
              sx={{
                bgcolor: "#2563eb",
                width: 32,
                height: 32,
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              {currentRole === "SuperAdmin" ? "HA" : currentRole === "SalesAgent" ? "FT" : "MS"}
            </Avatar>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-50 dark:ring-slate-900" />
          </div>

          {(!collapsed || isMobile) && (
            <div className="min-w-0 truncate">
              <div className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                {currentRole === "SuperAdmin" ? "Haji Ahmad Shah" : currentRole === "SalesAgent" ? "Farhad Timori" : "Mirwais Saljuqi"}
              </div>
              <div className="truncate text-[10px] text-slate-500 dark:text-slate-400">{currentRole}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`sticky top-0 z-40 hidden md:flex h-screen flex-col border-r rtl:border-r-0 rtl:border-l border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#121824] shadow-mui-1 transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Slide-Over Overlay Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileDrawerOpen(false)}
          />
          {/* Drawer Panel */}
          <aside
            className="relative z-50 flex h-full w-72 max-w-[85vw] flex-col border-r rtl:border-r-0 rtl:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121824] shadow-2xl animate-in slide-in-from-left rtl:slide-in-from-right duration-200"
          >
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
