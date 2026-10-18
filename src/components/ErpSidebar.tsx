"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
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
      className={`sticky top-0 z-40 flex h-screen flex-col border-r border-slate-200 bg-navy-950 text-slate-300 dark:border-slate-800 transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Sidebar Header: Brand & Showroom ID */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold text-slate-950 font-black shadow-md">
              <Car className="h-5 w-5" />
            </div>
            <div className="truncate">
              <span className="text-sm font-extrabold tracking-tight text-white block">
                {t.brandName}
              </span>
              <span className="text-[10px] font-mono text-gold uppercase tracking-wider block">
                Herat Dealership ERP
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-gold text-slate-950 font-black shadow-md">
            <Car className="h-5 w-5" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-navy-900 hover:text-white transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Quick Action Button: New Stock Intake */}
      <div className="p-3">
        <button
          onClick={onOpenIntake}
          className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-light py-2.5 text-xs font-extrabold text-slate-950 shadow-md hover:brightness-110 transition-all ${
            collapsed ? "px-0" : "px-3"
          }`}
          title="Intake New Vehicle"
        >
          <PlusCircle className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{t.addNewVehicle}</span>}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        <div>
          {!collapsed && (
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-300">
              Dealership Modules
            </p>
          )}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-navy-800 text-gold shadow-xs border border-gold/30"
                      : "text-slate-400 hover:bg-navy-900 hover:text-white"
                  }`}
                  title={item.title}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-gold" : "text-slate-400 group-hover:text-white"}`} />
                    {!collapsed && <span className="truncate">{item.title}</span>}
                  </div>
                  {!collapsed && item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                        isActive
                          ? "bg-gold text-slate-950"
                          : "bg-navy-800 text-slate-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Herat Lot Telemetry Widget (When expanded) */}
        {!collapsed && (
          <div className="rounded-2xl border border-slate-800 bg-navy-900/60 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-white">
                <Compass className="h-3.5 w-3.5 text-gold" />
                Herat Lot Status
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div className="rounded-lg bg-navy-950/80 p-2 border border-slate-800">
                <span className="text-[10px] text-slate-300 block">On Lot:</span>
                <span className="text-white font-bold">{activeLotCount} Cars</span>
              </div>
              <div className="rounded-lg bg-navy-950/80 p-2 border border-slate-800">
                <span className="text-[10px] text-slate-300 block">In Transit:</span>
                <span className="text-gold font-bold">{inTransitCount} Cars</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-300 pt-1 leading-snug">
              Bagh-e-Azadi Avenue • Customs Port Cleared (Islam Qala)
            </p>
          </div>
        )}
      </div>

      {/* Sidebar Footer: System Version & User Identity */}
      <div className="border-t border-slate-800 p-3">
        {!collapsed ? (
          <div className="flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-white text-[11px]">Sadozai ERP v2.4</p>
              <p className="text-[10px] font-mono text-slate-300">
                Active: {currentRole}
              </p>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold">
              OK
            </div>
          </div>
        ) : (
          <div className="flex justify-center text-emerald-400 text-xs font-mono font-bold">
            OK
          </div>
        )}
      </div>
    </aside>
  );
}
