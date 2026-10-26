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
import { FirstTimeTutorialModal } from "./FirstTimeTutorialModal";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const {
    language,
    darkMode,
    fetchDatabaseRecords,
    setCurrentRole,
    theming,
    updateTheming,
  } = useShowroomStore();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isRtl = language === "fa" || language === "ps";

  // Standalone full-screen public/auth routes
  const isStandaloneRoute =
    pathname?.startsWith("/verify") || pathname?.startsWith("/login");

  const muiTheme = useMemo(
    () =>
      getMuiTheme(
        darkMode ? "dark" : "light",
        theming?.primaryColor,
        theming?.borderRadius
      ),
    [darkMode, theming?.primaryColor, theming?.borderRadius]
  );

  // Sync system dark mode preference when themeMode === "system"
  useEffect(() => {
    if (theming?.themeMode !== "system" || typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const applySystem = (matches: boolean) => {
      useShowroomStore.setState({ darkMode: matches });
    };
    applySystem(mql.matches);
    const listener = (e: MediaQueryListEvent) => applySystem(e.matches);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, [theming?.themeMode, updateTheming]);

  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    html.dir = isRtl ? "rtl" : "ltr";
    html.lang = language;
    if (theming?.primaryColor) {
      html.style.setProperty("--primary-color", theming.primaryColor);
      html.style.setProperty("--primary", theming.primaryColor);
    }
    if (theming?.borderRadius !== undefined) {
      html.style.setProperty("--custom-radius", `${theming.borderRadius}px`);
    }
    html.dataset.font = theming?.fontFamily || "jakarta";
    html.dataset.density = theming?.uiDensity || "comfortable";
    html.dataset.contrast = theming?.contrastMode || "standard";
    html.dataset.glass = theming?.glassmorphism === false ? "false" : "true";
  }, [
    darkMode,
    isRtl,
    language,
    theming?.primaryColor,
    theming?.borderRadius,
    theming?.fontFamily,
    theming?.uiDensity,
    theming?.contrastMode,
    theming?.glassmorphism,
  ]);

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
          <main
            className={`flex-1 overflow-x-hidden ${
              theming?.uiDensity === "compact" ? "p-3 sm:p-4" : "p-4 sm:p-6"
            }`}
          >
            {children}
          </main>
          <Footer />
        </div>

        {/* Global Google Platform Overlays */}
        <ContextualInspectorDrawer />
        <KeyboardShortcutManager />
        <FirstTimeTutorialModal />
        <ToastContainer />
      </div>
    </ThemeProvider>
  );
}
