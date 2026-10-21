"use client";

import React, { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { getMuiTheme } from "@/theme/muiTheme";
import { useShowroomStore } from "@/store/useShowroomStore";
import { ErpSidebar } from "./ErpSidebar";
import { ErpHeader } from "./ErpHeader";
import { Footer } from "./Footer";
import { ToastContainer } from "./ToastContainer";
import { ContextualInspectorDrawer } from "./ContextualInspectorDrawer";
import { KeyboardShortcutManager } from "./KeyboardShortcutManager";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { language, darkMode, fetchDatabaseRecords, setCurrentRole } = useShowroomStore();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isRtl = language === "fa" || language === "ps";

  // Standalone full-screen public/auth routes
  const isStandaloneRoute =
    pathname?.startsWith("/verify") || pathname?.startsWith("/login");

  const muiTheme = useMemo(
    () => getMuiTheme(darkMode ? "dark" : "light"),
    [darkMode]
  );

  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    html.dir = isRtl ? "rtl" : "ltr";
    html.lang = language;
  }, [darkMode, isRtl, language]);

  // Synchronize live PostgreSQL database state via Next.js API routes on mount
  useEffect(() => {
    fetchDatabaseRecords();
  }, [fetchDatabaseRecords]);

  useEffect(() => {
    if (status === "loading") return;

    const roleMap = {
      ADMIN: "SuperAdmin",
      SALES: "SalesAgent",
      ACCOUNTANT: "Accountant",
    } as const;
    const role = session?.user
      ? (session.user as typeof session.user & { role?: keyof typeof roleMap }).role
      : undefined;

    setCurrentRole(role && role in roleMap ? roleMap[role] : "SalesAgent");
  }, [session, setCurrentRole, status]);

  if (isStandaloneRoute) {
    return (
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <div
          dir={isRtl ? "rtl" : "ltr"}
          className={`min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0F141C] text-[#0F172A] dark:text-[#F1F5F9] transition-colors duration-200 ${
            isRtl ? "font-dari" : "font-sans"
          }`}
        >
          <main className="flex-1">{children}</main>
          <ToastContainer />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className={`min-h-screen flex bg-[#F8FAFC] dark:bg-[#0F141C] text-[#0F172A] dark:text-[#F1F5F9] transition-colors duration-200 ${
          isRtl ? "font-dari" : "font-sans"
        }`}
      >
        {/* Left Navigation Sidebar Rail */}
        <ErpSidebar />

        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <ErpHeader />
          <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">{children}</main>
          <Footer />
        </div>

        {/* Global Google Platform Overlays */}
        <ContextualInspectorDrawer />
        <KeyboardShortcutManager />
        <ToastContainer />
      </div>
    </ThemeProvider>
  );
}
