"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { VehicleCard } from "@/components/VehicleCard";
import {
  Car,
  ShieldCheck,
  FileCheck2,
  Users,
  Search,
  ArrowRight,
  MapPin,
  Clock,
  PhoneCall,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Shield,
  Truck,
  Building,
} from "lucide-react";

export default function HomePage() {
  const { vehicles, language, setFilter } = useShowroomStore();
  const t = translations[language];

  const [quickMake, setQuickMake] = useState("ALL");
  const [quickBody, setQuickBody] = useState("ALL");

  const featuredVehicles = vehicles.slice(0, 4);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickMake !== "ALL") setFilter("make", quickMake);
    if (quickBody !== "ALL") setFilter("bodyType", quickBody);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Cinematic Hero Section */}
      <section className="relative min-h-[580px] w-full overflow-hidden bg-gradient-to-b from-navy-950 via-navy to-navy-950 text-white flex items-center">
        {/* Background Decorative Pattern & Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,119,6,0.18),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-xs font-semibold text-gold-light backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                <span>Premier Showroom in Herat • Bagh-e-Azadi Avenue</span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
                {language === "fa" || language === "ps" ? (
                  <span className="font-dari">{t.heroTitle}</span>
                ) : (
                  <>
                    Exceptional Engineering.{" "}
                    <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
                      Direct to Herat.
                    </span>
                  </>
                )}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {t.heroSubtitle}
              </p>

              {/* Quick Search Card */}
              <div className="mt-8 rounded-2xl border border-slate-700/60 bg-navy-900/80 p-4 shadow-2xl backdrop-blur-md">
                <form
                  onSubmit={handleQuickSearch}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  <select
                    value={quickMake}
                    onChange={(e) => setQuickMake(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-navy-800 px-3 py-2.5 text-xs font-semibold text-white outline-none focus:border-gold"
                  >
                    <option value="ALL">{t.allMakes}</option>
                    <option value="Toyota">Toyota (Land Cruiser, Corolla, Hilux)</option>
                    <option value="Lexus">Lexus (LX 570, RX 350)</option>
                  </select>

                  <select
                    value={quickBody}
                    onChange={(e) => setQuickBody(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-navy-800 px-3 py-2.5 text-xs font-semibold text-white outline-none focus:border-gold"
                  >
                    <option value="ALL">All Body Types</option>
                    <option value="SUV">SUV (Land Cruiser / LX 570)</option>
                    <option value="Sedan">Sedan (Corolla / Camry)</option>
                    <option value="Pickup">Pickup (Hilux Rocco)</option>
                  </select>

                  <Link
                    href="/inventory"
                    className="flex items-center justify-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-gold-light transition-colors"
                  >
                    <Search className="h-4 w-4" />
                    <span>{t.browseInventory}</span>
                  </Link>
                </form>
              </div>

              {/* Micro Trust Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  100% Islam Qala Cleared
                </span>
                <span className="flex items-center gap-1.5">
                  <FileCheck2 className="h-4 w-4 text-gold-light" />
                  Official Bilingual Legal Deeds
                </span>
                <span className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-blue-400" />
                  Direct Ocean & Dry Port Freight
                </span>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-3xl border-2 border-gold/30 shadow-2xl group">
                <Image
                  src="https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1200&q=85"
                  alt="Land Cruiser 300 VXR at Sadozai Motors"
                  fill
                  priority
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/20 to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 space-y-1">
                  <span className="inline-block rounded-full bg-gold/90 px-2.5 py-0.5 text-[10px] font-bold text-slate-950 uppercase">
                    Featured Herat Arrival
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    Toyota Land Cruiser 300 VXR (2023)
                  </h3>
                  <p className="text-xs text-slate-300">
                    Dubai GCC Spec • Zero Paintwork • Gomrok Islam Qala Verified
                  </p>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-lg font-extrabold text-gold-light">
                      $91,500 USD
                    </span>
                    <Link
                      href="/vehicles/veh-001"
                      className="rounded-lg bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/30"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Showroom Interactive KPI Stats */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-navy-900">
          <div className="flex items-center gap-4 border-r border-slate-100 dark:border-slate-800 pr-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {vehicles.length}+
              </p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {t.statsCarsInStock}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 lg:border-r border-slate-100 dark:border-slate-800 pr-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                480+
              </p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {t.statsHappyBuyers}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-r border-slate-100 dark:border-slate-800 pr-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-500">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                100%
              </p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {t.statsVerifiedGomrok}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                5 Ports
              </p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                UAE • USA • Canada • Japan • Europe
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vehicles Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-4 border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gold" />
              <p className="text-xs font-bold uppercase tracking-wider text-gold dark:text-gold-light">
                Herat Showroom Highlights
              </p>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
              Featured Arrivals on the Lot
            </h2>
          </div>
          <Link
            href="/inventory"
            className="flex items-center gap-1 text-xs font-bold text-gold hover:text-gold-light transition-colors"
          >
            <span>View All Vehicles in Catalog</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </section>

      {/* Origin Countries Highlight Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 border border-slate-800">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Direct Global Import Routes to Herat
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Every vehicle in our showroom is purchased through certified dealer auctions and verified agencies worldwide, routed via Bandar Abbas to Islam Qala Dry Port.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
            <div className="rounded-2xl border border-slate-800 bg-navy-900/60 p-4">
              <p className="text-2xl font-bold text-gold">🇦🇪 UAE</p>
              <p className="text-xs font-semibold text-slate-200 mt-1">Dubai GCC Specs</p>
              <p className="text-[11px] text-slate-400">High-cooling radiators & dual AC</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-navy-900/60 p-4">
              <p className="text-2xl font-bold text-gold">🇺🇸 USA</p>
              <p className="text-xs font-semibold text-slate-200 mt-1">Texas & California</p>
              <p className="text-[11px] text-slate-400">Rust-free chassis, original catalytic</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-navy-900/60 p-4">
              <p className="text-2xl font-bold text-gold">🇨🇦 Canada</p>
              <p className="text-xs font-semibold text-slate-200 mt-1">Lexus & High-Trim</p>
              <p className="text-[11px] text-slate-400">AWD / 4WD luxury editions</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-navy-900/60 p-4">
              <p className="text-2xl font-bold text-gold">🇯🇵 Japan</p>
              <p className="text-xs font-semibold text-slate-200 mt-1">High-Grade Conversions</p>
              <p className="text-[11px] text-slate-400">Grade 4.5+ auction certified</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-navy-900/60 p-4 col-span-2 sm:col-span-1">
              <p className="text-2xl font-bold text-gold">🇪🇺 Europe</p>
              <p className="text-xs font-semibold text-slate-200 mt-1">Germany / Low-KM</p>
              <p className="text-[11px] text-slate-400">Full service logbooks</p>
            </div>
          </div>
        </div>
      </section>

      {/* Herat Showroom Location & Visiting Hours Card */}
      <section id="contact" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-lg dark:border-slate-800 dark:bg-navy-900">
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gold dark:text-gold-light">
                Herat Dealership Lot
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                Visit Sadozai Showroom on Bagh-e-Azadi
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Walk through our 2,500 sq. meter paved lot. Every vehicle is washed, detailed, and open for physical inspection, mechanical scan, and test drives along Bagh-e-Azadi Boulevard.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-navy-800">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1">
                  <MapPin className="h-4 w-4 text-gold" />
                  Address & Coordinates
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Bagh-e-Azadi Boulevard, 200m North of Shahr-e-Naw Circle, Herat
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-navy-800">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1">
                  <Clock className="h-4 w-4 text-gold" />
                  Showroom Timings
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Sat – Thu: 8:00 AM – 7:30 PM (Continuous power with solar backups)
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://wa.me/93799102030"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
              >
                <PhoneCall className="h-4 w-4" />
                <span>WhatsApp Showroom Desk</span>
              </a>

              <Link
                href="/inventory"
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-5 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-200 dark:border-slate-700 dark:bg-navy-800 dark:text-slate-200 transition-colors"
              >
                <span>Browse {vehicles.length} Available Vehicles</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Interactive Herat Map Graphic Card */}
          <div className="lg:col-span-5 relative flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-navy-800 p-6 border border-slate-200 dark:border-slate-700 min-h-[300px]">
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/20 text-gold">
                <MapPin className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                Herat Showroom & Customs Reception
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Secure gated customer parking, private contract signing offices, and on-site vehicle inspection hoist.
              </p>
              <div className="inline-block rounded-lg bg-navy px-3 py-1 text-xs font-mono text-gold-light">
                GPS: 34.3482° N, 62.1997° E (Herat)
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
