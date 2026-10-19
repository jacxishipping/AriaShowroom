"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useShowroomStore } from "@/store/useShowroomStore";
import { Dialog, DialogContent } from "@/components/mui";
import { Keyboard, X } from "lucide-react";

export function KeyboardShortcutManager() {
  const router = useRouter();
  const {
    vehicles,
    inspectedVehicleId,
    setInspectedVehicleId,
    isShortcutsModalOpen,
    setIsShortcutsModalOpen,
    addToast,
  } = useShowroomStore();

  const gChordRef = useRef<boolean>(false);
  const gTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function isTypingInInput(target: EventTarget | null): boolean {
      if (!target || !(target instanceof HTMLElement)) return false;
      const tag = target.tagName.toLowerCase();
      return (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        target.isContentEditable
      );
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (inspectedVehicleId) {
          setInspectedVehicleId(null);
          return;
        }
        if (isShortcutsModalOpen) {
          setIsShortcutsModalOpen(false);
          return;
        }
      }

      if (isTypingInInput(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // "?" opens Google Workspace Keyboard Shortcuts cheat sheet
      if (e.key === "?") {
        e.preventDefault();
        setIsShortcutsModalOpen(!isShortcutsModalOpen);
        return;
      }

      // "/" focuses the top bar Omnibox search input
      if (e.key === "/") {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[data-omnibox="true"]'
        );
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // Two-key "g" navigation chords (like Gmail / Google Cloud Console)
      if (e.key.toLowerCase() === "g" && !gChordRef.current) {
        gChordRef.current = true;
        if (gTimeoutRef.current) clearTimeout(gTimeoutRef.current);
        gTimeoutRef.current = setTimeout(() => {
          gChordRef.current = false;
        }, 1200);
        return;
      }

      if (gChordRef.current) {
        gChordRef.current = false;
        if (gTimeoutRef.current) clearTimeout(gTimeoutRef.current);
        const dest = e.key.toLowerCase();
        if (dest === "d") {
          e.preventDefault();
          router.push("/");
          addToast("Navigated to Operations Cockpit (g + d)", "info");
          return;
        }
        if (dest === "i") {
          e.preventDefault();
          router.push("/inventory");
          addToast("Navigated to Vehicle Inventory (g + i)", "info");
          return;
        }
        if (dest === "a") {
          e.preventDefault();
          router.push("/accounting");
          addToast("Navigated to Accounting & Sarrafi Hub (g + a)", "info");
          return;
        }
        if (dest === "c") {
          e.preventDefault();
          router.push("/admin");
          addToast("Navigated to CRM & Commercial Desk (g + c)", "info");
          return;
        }
        if (dest === "l") {
          e.preventDefault();
          router.push("/logistics");
          addToast("Navigated to Customs & Port Logistics (g + l)", "info");
          return;
        }
        if (dest === "n") {
          e.preventDefault();
          router.push("/intake");
          addToast("Navigated to Vehicle Intake Studio (g + n)", "info");
          return;
        }
      }

      // "j" / "k" cycles through vehicles in the Contextual Inspector Drawer
      if (e.key === "j" || e.key === "k") {
        if (vehicles.length === 0) return;
        e.preventDefault();
        const currentIdx = vehicles.findIndex((v) => v.id === inspectedVehicleId);
        let nextIdx = 0;
        if (currentIdx === -1) {
          nextIdx = 0;
        } else if (e.key === "j") {
          nextIdx = (currentIdx + 1) % vehicles.length;
        } else {
          nextIdx = (currentIdx - 1 + vehicles.length) % vehicles.length;
        }
        setInspectedVehicleId(vehicles[nextIdx].id);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    vehicles,
    inspectedVehicleId,
    isShortcutsModalOpen,
    setInspectedVehicleId,
    setIsShortcutsModalOpen,
    router,
    addToast,
  ]);

  return (
    <Dialog
      open={isShortcutsModalOpen}
      onClose={() => setIsShortcutsModalOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogContent className="p-0 overflow-hidden bg-white dark:bg-[#161B26]">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-[#262F40] bg-slate-50 dark:bg-[#121722]">
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-[#1A73E8] dark:text-[#8AB4F8]" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Google Workspace & Console Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={() => setIsShortcutsModalOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-2.5">
            <div className="font-semibold text-slate-900 dark:text-white pb-1 border-b border-slate-200 dark:border-[#262F40]">
              Global Navigation Chords
            </div>
            {[
              { keys: ["g", "d"], label: "Go to Operations Cockpit" },
              { keys: ["g", "i"], label: "Go to Vehicle Inventory" },
              { keys: ["g", "c"], label: "Go to CRM & Sales Desk" },
              { keys: ["g", "a"], label: "Go to Accounting & Sarrafi" },
              { keys: ["g", "l"], label: "Go to Customs & Port Logistics" },
              { keys: ["g", "n"], label: "Register New Vehicle Intake" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                <div className="flex items-center gap-1">
                  {item.keys.map((k, idx) => (
                    <React.Fragment key={k}>
                      <kbd className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                        {k}
                      </kbd>
                      {idx < item.keys.length - 1 && (
                        <span className="text-slate-400 text-[10px]">then</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2.5">
            <div className="font-semibold text-slate-900 dark:text-white pb-1 border-b border-slate-200 dark:border-[#262F40]">
              Omnibox & Resource Inspection
            </div>
            {[
              { keys: ["⌘K"], label: "Open Command Palette & FX" },
              { keys: ["/"], label: "Focus Top Bar Omnibox Search" },
              { keys: ["j"], label: "Inspect Next Vehicle in Drawer" },
              { keys: ["k"], label: "Inspect Previous Vehicle" },
              { keys: ["?"], label: "Toggle Shortcut Cheat Sheet" },
              { keys: ["Esc"], label: "Close Inspector or Dialog" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                <div className="flex items-center gap-1">
                  {item.keys.map((k) => (
                    <kbd
                      key={k}
                      className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
