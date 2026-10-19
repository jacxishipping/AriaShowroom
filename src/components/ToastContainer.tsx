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
    }, 4000);
    return () => clearTimeout(timer);
  }, [toasts, removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 start-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icon =
          toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : toast.type === "warning" ? (
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
          ) : toast.type === "error" ? (
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          ) : (
            <Info className="h-4 w-4 text-[#8AB4F8] shrink-0" />
          );

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-[#202124] dark:bg-[#E8EAED] text-white dark:text-[#202124] shadow-lg transition-all duration-150"
          >
            <div className="flex items-center gap-2.5 text-xs font-medium leading-snug">
              {icon}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white dark:text-slate-600 dark:hover:text-black transition-colors p-0.5 cursor-pointer shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
