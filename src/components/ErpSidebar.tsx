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
} from "lucide-react";

interface ErpSidebarProps {
  onOpenIntake?: () => void;
}

export function ErpSidebar({ onOpenIntake }: ErpSidebarProps) {
  const pathname = usePathname();
  const { vehicles, customers, sales, language, currentRole, compareIds } = useShowroomStore();
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
      title: language === "ps" ? "د اسلام قلعه او ترانزیت لوژستیک" : language === "fa" ? "لوجستیک و گمرک اسلام قلعه" : "Customs & Port Logistics",
      href: "/#logistics",
      icon: Truck,
      badge: inTransitCount > 0 ? `${inTransitCount} En Route` : null,
    },
  ];

  return (
    <aside
      className={`sticky top-0 z-40 flex h-screen flex-col border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#121824] shadow-mui-1 transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Enterprise Drawer Header: Brand Avatar & Showroom ID */}
      <div className="flex h-14 items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 px-4">
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-slate-800 dark:text-white border border-slate-700/60 shadow-xs font-bold">
              <Car className="h-4 w-4 text-primary" />
            </div>
            <div className="truncate">
              <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-white block">
                {t.brandName}
              </span>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-medium">
                Dealership ERP
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-slate-800 border border-slate-700/60 shadow-xs font-bold">
            <Car className="h-4 w-4 text-primary" />
          </div>
        )}

        <IconButton
          size="small"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand Drawer" : "Collapse Drawer"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </IconButton>
      </div>

      {/* Quick Intake Button (Material Contained Button) */}
      <div className="p-3">
        <MuiButton
          component={Link}
          href="/intake"
          variant="contained"
          color="primary"
          fullWidth
          size="medium"
          startIcon={<PlusCircle className="h-4 w-4" />}
          className={collapsed ? "!px-0 !min-w-0" : ""}
        >
          {!collapsed && <span>{t.addNewVehicle}</span>}
        </MuiButton>
      </div>

      {/* Material List Items */}
      <nav className="flex-1 space-y-1 px-2 py-2 overflow-y-auto">
        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {!collapsed && <span>Main Navigation</span>}
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                isActive
                  ? "bg-primary/10 text-primary font-semibold dark:bg-primary/20 dark:text-primary"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.title : undefined}
            >
              <span
                className={`shrink-0 transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                }`}
              >
                <IconComponent className="h-4 w-4" />
              </span>

              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.title}</span>
                  {item.badge && (
                    <MuiChip
                      label={item.badge}
                      size="small"
                      color={isActive ? "primary" : "default"}
                    />
                  )}
                </>
              )}
            </Link>
          );
        })}

        {/* Live Lot Telemetry Widget */}
        {!collapsed && (
          <div className="mt-6 mx-1 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 p-3 dark:bg-slate-900/30">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Herat Lot Status
              </span>
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 text-[11px]">Available on Lot</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 text-[11px]">
                  {activeLotCount} Cars
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 text-[11px]">Islam Qala Transit</span>
                <span className="font-mono font-semibold text-amber-600 dark:text-amber-400 text-[11px]">
                  {inTransitCount} Units
                </span>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Material Drawer Footer: User Profile Card */}
      <div className="border-t border-slate-200/80 dark:border-slate-800/80 p-3">
        <div
          className={`flex items-center gap-3 rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="relative shrink-0">
            <Avatar
              sx={{
                bgcolor: "primary.main",
                width: 32,
                height: 32,
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              {currentRole === "SuperAdmin" ? "HA" : currentRole === "SalesAgent" ? "FT" : "MS"}
            </Avatar>
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#121824]" />
          </div>

          {!collapsed && (
            <div className="truncate">
              <span className="text-xs font-bold text-slate-900 dark:text-white block truncate leading-tight">
                {currentRole === "SuperAdmin"
                  ? "Haji Ahmad Shah"
                  : currentRole === "SalesAgent"
                  ? "Farhad Timori"
                  : "Mirwais Saljuqi"}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">
                {currentRole} • Bagh-e-Azadi Lot
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
