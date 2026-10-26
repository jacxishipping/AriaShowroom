"use client";

import React from "react";
import Link from "next/link";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { ShieldCheck, ExternalLink, Keyboard } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function Footer() {
  const { language, setIsShortcutsModalOpen, branding } = useShowroomStore();
  const waUrl = buildWhatsAppUrl(branding?.whatsapp || "93799102030");
  const t = translations[language];

  const localizedName =
    language === "fa"
      ? branding?.dealershipNameFa || branding?.dealershipName || t.brandName
      : language === "ps"
      ? branding?.dealershipNamePs || branding?.dealershipName || t.brandName
      : branding?.dealershipName || t.brandName;

  const displayAddress = branding?.address || t.footerAddress;

  return (
    <footer
      id="contact"
      className="border-t border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#121722] text-slate-500 dark:text-slate-400 print:hidden"
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {localizedName}
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1 text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span className="font-mono tabular-nums">
              {branding?.licenseNumber || "Herat Dealership License #49912"}
            </span>
          </span>
          <span>·</span>
          <span>{displayAddress}</span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link href="/inventory" className="hover:text-primary transition-colors">
            {language === "fa"
              ? "موجودی موترها"
              : language === "ps"
              ? "د موټرونو سټاک"
              : "Fleet Registry"}
          </Link>
          <Link href="/logistics" className="hover:text-primary transition-colors">
            {language === "fa"
              ? "گمرک اسلام قلعه"
              : language === "ps"
              ? "اسلام قلعه ګمرک"
              : "Islam Qala Customs"}
          </Link>
          <Link href="/verify" className="hover:text-primary transition-colors">
            {language === "fa"
              ? "تأیید اصالت سند"
              : language === "ps"
              ? "د سند تایید"
              : "Public Deed Verify"}
          </Link>
          <button
            type="button"
            onClick={() => setIsShortcutsModalOpen(true)}
            className="inline-flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
          >
            <Keyboard className="h-3.5 w-3.5" />
            <span>
              {language === "fa"
                ? "کلیدهای میانبر (؟)"
                : language === "ps"
                ? "شارټکټونه (؟)"
                : "Shortcuts (?)"}
            </span>
          </button>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span>WhatsApp Desk</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
