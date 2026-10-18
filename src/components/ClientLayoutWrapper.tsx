"use client";

import React, { useState, useEffect } from "react";
import { useShowroomStore } from "@/store/useShowroomStore";
import { ErpSidebar } from "@/components/ErpSidebar";
import { ErpHeader } from "@/components/ErpHeader";
import { VehicleIntakeModal } from "@/components/VehicleIntakeModal";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { darkMode, language } = useShowroomStore();
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);

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
    <div className="flex min-h-screen bg-slate-50 dark:bg-obsidian text-slate-900 dark:text-slate-100 transition-colors">
      {/* Enterprise ERP Sidebar */}
      <ErpSidebar onOpenIntake={() => setIsIntakeModalOpen(true)} />

      {/* Main ERP Cockpit Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <ErpHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Global Vehicle Intake Modal */}
      <VehicleIntakeModal
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
      />
    </div>
  );
}
