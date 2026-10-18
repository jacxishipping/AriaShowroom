"use client";

import React from "react";
import Link from "next/link";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import {
  Car,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Clock,
  ExternalLink,
} from "lucide-react";

export function Footer() {
  const { language } = useShowroomStore();
  const t = translations[language];

  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300 dark:border-slate-800 dark:bg-obsidian">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Col 1: Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-slate-950 font-bold shadow-md">
                <Car className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                {t.brandName}
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t.tagline}. Specialized in verified GCC, USA, and Canadian vehicles
              with 100% legal Islam Qala customs clearance documents.
            </p>
            <div className="flex items-center gap-2 text-xs text-gold">
              <ShieldCheck className="h-4 w-4" />
              <span>Certified Herat Automotive Merchant #8921</span>
            </div>
          </div>

          {/* Col 2: Showroom Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Inventory & Imports
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/inventory" className="hover:text-gold transition-colors">
                  Toyota Land Cruiser (LC300 & V8)
                </Link>
              </li>
              <li>
                <Link href="/inventory" className="hover:text-gold transition-colors">
                  Lexus LX 570 & RX 350
                </Link>
              </li>
              <li>
                <Link href="/inventory" className="hover:text-gold transition-colors">
                  Toyota Corolla SE & Camry Hybrid
                </Link>
              </li>
              <li>
                <Link href="/inventory" className="hover:text-gold transition-colors">
                  Toyota Hilux Rocco 4x4
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-gold transition-colors">
                  Dealer Back-Office & ERP
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Herat Showroom Location & Hours */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Herat Showroom & Lot
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <span>Bagh-e-Azadi Boulevard, Near Shahr-e-Naw Roundabout, Herat, Afghanistan</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gold shrink-0" />
                <span>Saturday – Thursday: 8:00 AM – 7:30 PM (Friday: Closed)</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold shrink-0" />
                <span>+93 79 910 2030 / +93 70 245 8890</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold shrink-0" />
                <span>contact@sadozaimotors.af</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Customs Border Logistics & WhatsApp */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Logistics & Border Port
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Vehicles arriving weekly through Islam Qala Border Port from Dubai (Jebel Ali / Bandar Abbas). In-person inspections welcome on our paved Herat showroom lot.
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/93799102030?text=Hello%20Sadozai%20Motors%20Herat,%20I%20would%20like%20to%20inquire%20about%20your%20current%20vehicle%20inventory."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
              >
                <span>Chat directly on WhatsApp</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Sadozai Motors Herat. All rights reserved.</p>
          <p className="font-mono text-slate-400">
            Automotive Sales & Inventory Management System (App Router)
          </p>
        </div>
      </div>
    </footer>
  );
}
