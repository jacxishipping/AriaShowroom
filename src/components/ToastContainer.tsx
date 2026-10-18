"use client";

import React, { useEffect } from "react";
import { useShowroomStore } from "@/store/useShowroomStore";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useShowroomStore();

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      removeToast(toasts[0].id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toasts, removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icon =
          toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
          ) : toast.type === "warning" ? (
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          ) : toast.type === "error" ? (
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          ) : (
            <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          );

        const borderStyle =
          toast.type === "success"
            ? "border-emerald-500/30 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100"
            : toast.type === "warning"
            ? "border-amber-500/30 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100"
            : toast.type === "error"
            ? "border-red-500/30 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100"
            : "border-blue-500/30 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${borderStyle}`}
          >
            {icon}
            <div className="flex-1 text-xs font-medium leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
