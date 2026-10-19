"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { getMuiTheme } from "@/theme/muiTheme";
import { useShowroomStore } from "@/store/useShowroomStore";
import { ErpSidebar } from "@/components/ErpSidebar";
import { ErpHeader } from "@/components/ErpHeader";
import { ToastContainer } from "@/components/ToastContainer";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { darkMode, language, fetchDatabaseRecords } = useShowroomStore();

  useEffect(() => {
    // Initial sync with live PostgreSQL database
    fetchDatabaseRecords();
  }, [fetchDatabaseRecords]);

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

  const muiTheme = useMemo(() => getMuiTheme(darkMode ? "dark" : "light"), [darkMode]);

  const pathname = usePathname();
  const isAuthOrPublic = pathname === "/login" || pathname?.startsWith("/verify");

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {isAuthOrPublic ? (
        <div className="min-h-screen bg-[#F4F3EF] dark:bg-[#0A0C10] text-[#111318] dark:text-[#ECEEF2] transition-colors">
          {children}
          <ToastContainer />
        </div>
      ) : (
        <div className="flex min-h-screen bg-[#F4F3EF] dark:bg-[#0A0C10] text-[#111318] dark:text-[#ECEEF2] transition-colors selection:bg-amber-600 selection:text-white">
          {/* Enterprise ERP Sidebar */}
          <ErpSidebar />

          {/* Main ERP Cockpit Area */}
          <div className="flex flex-1 flex-col overflow-hidden min-w-0">
            <ErpHeader />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">
              {children}
            </main>
          </div>

          {/* Global Floating Toast Notifications */}
          <ToastContainer />
        </div>
      )}
    </ThemeProvider>
  );
}
