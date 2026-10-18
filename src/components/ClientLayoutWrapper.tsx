"use client";

import React, { useEffect } from "react";
import { useShowroomStore } from "@/store/useShowroomStore";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { darkMode, language } = useShowroomStore();

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (language === "fa") {
      root.setAttribute("dir", "rtl");
      root.setAttribute("lang", "fa-AF");
    } else if (language === "ps") {
      root.setAttribute("dir", "rtl");
      root.setAttribute("lang", "ps-AF");
    } else {
      root.setAttribute("dir", "ltr");
      root.setAttribute("lang", "en");
    }
  }, [darkMode, language]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-obsidian text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
