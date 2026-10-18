"use client";

import React from "react";
import Image from "next/image";
import { useShowroomStore } from "@/store/useShowroomStore";
import { X, ArrowRight, Layers } from "lucide-react";

interface CompareBarProps {
  onOpenCompare: () => void;
}

export function CompareBar({ onOpenCompare }: CompareBarProps) {
  const { vehicles, compareIds, toggleCompare, clearCompare } = useShowroomStore();

  if (compareIds.length === 0) return null;

  const comparedVehicles = vehicles.filter((v) => compareIds.includes(v.id));

  return (
    <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center pointer-events-none px-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="pointer-events-auto flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-2xl bg-slate-900/95 dark:bg-[#111827]/95 text-white border border-slate-700/80 shadow-2xl backdrop-blur-md max-w-xl w-full">
        <div className="flex items-center gap-2 pl-2">
          <Layers className="h-4 w-4 text-blue-400 shrink-0" />
          <span className="text-xs font-bold whitespace-nowrap">
            Compare ({comparedVehicles.length}/3)
          </span>
        </div>

        {/* Thumbnail Avatars */}
        <div className="flex items-center gap-2 overflow-x-auto flex-1">
          {comparedVehicles.map((v) => (
            <div
              key={v.id}
              className="relative h-10 w-14 shrink-0 rounded-lg overflow-hidden border border-slate-700 group bg-slate-800"
            >
              <Image src={v.images[0]} alt={v.model} fill className="object-cover" />
              <button
                onClick={() => toggleCompare(v.id)}
                className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pr-1">
          <button
            onClick={clearCompare}
            className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1"
          >
            Clear
          </button>
          <button
            onClick={onOpenCompare}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors whitespace-nowrap cursor-pointer"
          >
            <span>Compare Now</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
