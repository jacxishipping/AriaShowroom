"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { MuiChip, MuiButton } from "@/components/mui";
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
} from "lucide-react";

interface ErpSidebarProps {
  onOpenIntake: () => void;
}

export function ErpSidebar({ onOpenIntake }: ErpSidebarProps) {
  const pathname = usePathname();
  const { vehicles, customers, sales, language, currentRole } = useShowroomStore();
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
      {/* Material Drawer Header: Brand Avatar & Showroom ID */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 px-4">
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D97706] text-white shadow-mui-1 font-black">
              <Car className="h-5 w-5" />
            </div>
            <div className="truncate">
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white block">
                {t.brandName}
              </span>
              <span className="text-[10px] font-mono text-[#D97706] uppercase tracking-wider block font-semibold">
                Herat Dealership ERP
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#D97706] text-white shadow-mui-1 font-black">
            <Car className="h-5 w-5" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800/80 dark:hover:text-white transition-colors cursor-pointer"
          title={collapsed ? "Expand Drawer" : "Collapse Drawer"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Quick Intake Button (Material Contained Button) */}
      <div className="p-3">
        <MuiButton
          variant="contained"
          color="gold"
          fullWidth
          size="medium"
          onClick={onOpenIntake}
          startIcon={<PlusCircle className="h-4 w-4" />}
          className={collapsed ? "!px-0 !min-w-0" : ""}
        >
          {!collapsed && <span>{t.addNewVehicle}</span>}
        </MuiButton>
      </div>

      {/* Material List Items */}
      <nav className="flex-1 space-y-1 px-2 py-2 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                  ? "bg-[#1976D2]/10 text-[#1976D2] font-semibold dark:bg-[#1976D2]/20 dark:text-[#42A5F5]"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.title : undefined}
            >
              <span
                className={`shrink-0 transition-colors ${
                  isActive
                    ? "text-[#1976D2] dark:text-[#42A5F5]"
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

        {/* Live Lot Telemetry Widget (Material Paper) */}
        {!collapsed && (
          <div className="mt-6 mx-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 p-3.5 dark:bg-slate-900/40">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Herat Lot Status
              </span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Available on Lot</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {activeLotCount} Cars
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Islam Qala Transit</span>
                <span className="font-mono font-bold text-[#D97706]">
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
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1976D2] text-xs font-bold text-white shadow-sm">
            {currentRole === "SuperAdmin" ? "HA" : currentRole === "SalesAgent" ? "FT" : "MS"}
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
