"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useShowroomStore } from "@/store/useShowroomStore";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { translations } from "@/lib/translations";
import { MuiButton, IconButton } from "@/components/mui";
import {
  Car,
  PhoneCall,
  DollarSign,
  Globe,
  Sun,
  Moon,
  ShieldCheck,
  LayoutDashboard,
  Compass,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const {
    currency,
    setCurrency,
    exchangeRate,
    language,
    setLanguage,
    darkMode,
    toggleDarkMode,
    currentRole,
    branding,
  } = useShowroomStore();

  const t = translations[language];
  const isErp = pathname?.startsWith("/admin");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-obsidian/90 transition-colors">
      {/* Top Banner: Herat Location & Gomrok Notice */}
      <div className="w-full bg-navy py-1.5 px-4 text-xs font-medium text-slate-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-gold-light">
              <Compass className="h-3.5 w-3.5" />
              {t.locationHerat}
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-400">
              {t.customsBorder}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline font-mono text-emerald-400">
              {t.exchangeRateLabel}
            </span>
            <a
              href={buildWhatsAppUrl(branding?.whatsapp || "93799102030")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gold-light hover:text-white transition-colors"
            >
              <PhoneCall className="h-3 w-3" />
              <span>{branding?.phone || "+93 79 910 2030"}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-navy to-navy-800 text-gold-light shadow-md border border-gold/30 group-hover:scale-105 transition-transform">
            <Car className="h-6 w-6 text-gold" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {branding?.dealershipName || t.brandName}
              </span>
              <span className="rounded bg-gold/15 px-1.5 py-0.5 text-[10px] font-semibold text-gold dark:text-gold-light uppercase tracking-wider">
                Herat
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {branding?.dealershipTagline || t.tagline}
            </p>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
          <Link
            href="/"
            className={`transition-colors hover:text-gold ${
              pathname === "/"
                ? "text-gold font-semibold"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            {t.navHome}
          </Link>
          <Link
            href="/inventory"
            className={`transition-colors hover:text-gold ${
              pathname === "/inventory"
                ? "text-gold font-semibold"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            {t.navInventory}
          </Link>
          <Link
            href="/#about"
            className="text-slate-600 dark:text-slate-300 hover:text-gold transition-colors"
          >
            {t.navAbout}
          </Link>
          <Link
            href="/#contact"
            className="text-slate-600 dark:text-slate-300 hover:text-gold transition-colors"
          >
            {t.navContact}
          </Link>
        </nav>

        {/* Right Actions: Currency, Language, Theme, ERP Portal */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Toggle (USD <-> AFN) */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-800 dark:bg-navy-900">
            <button
              onClick={() => setCurrency("USD")}
              className={`rounded px-2 py-1 text-xs font-semibold transition-all ${
                currency === "USD"
                  ? "bg-navy text-gold shadow-xs dark:bg-gold dark:text-slate-950"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
              title="Display prices in US Dollars"
            >
              USD $
            </button>
            <button
              onClick={() => setCurrency("AFN")}
              className={`rounded px-2 py-1 text-xs font-semibold transition-all ${
                currency === "AFN"
                  ? "bg-navy text-gold shadow-xs dark:bg-gold dark:text-slate-950"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
              title="Display prices in Afghan Afghani"
            >
              AFN ؋
            </button>
          </div>

          {/* Tri-Lingual Language Selector (English / Dari / Pashto) */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-800 dark:bg-navy-900">
            <button
              onClick={() => setLanguage("en")}
              className={`rounded px-2 py-1 text-xs font-semibold transition-all ${
                language === "en"
                  ? "bg-navy text-gold shadow-xs dark:bg-gold dark:text-slate-950"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
              title="English"
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("fa")}
              className={`rounded px-2 py-1 text-xs font-semibold font-dari transition-all ${
                language === "fa"
                  ? "bg-navy text-gold shadow-xs dark:bg-gold dark:text-slate-950"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
              title="دری (Dari)"
            >
              دری
            </button>
            <button
              onClick={() => setLanguage("ps")}
              className={`rounded px-2 py-1 text-xs font-semibold font-dari transition-all ${
                language === "ps"
                  ? "bg-navy text-gold shadow-xs dark:bg-gold dark:text-slate-950"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
              title="پښتو (Pashto)"
            >
              پښتو
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <IconButton
            size="small"
            onClick={toggleDarkMode}
            aria-label="Toggle theme"
            className="!border !border-slate-200 dark:!border-slate-800"
          >
            {darkMode ? (
              <Sun className="h-4 w-4 text-warning" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </IconButton>

          {/* ERP Portal CTA */}
          <MuiButton
            component={Link}
            href="/admin"
            variant="contained"
            color="primary"
            size="small"
            startIcon={<LayoutDashboard className="h-3.5 w-3.5" />}
          >
            <span className="hidden sm:inline">
              {isErp ? "ERP Active" : t.navErpPortal}
            </span>
          </MuiButton>
        </div>
      </div>
    </header>
  );
}
