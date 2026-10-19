"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useShowroomStore } from "@/store/useShowroomStore";
import { X, ArrowRight, Layers } from "lucide-react";
import { MuiButton, IconButton } from "@/components/mui";

interface CompareBarProps {
  onOpenCompare?: () => void;
}

export function CompareBar({ onOpenCompare }: CompareBarProps) {
  const { vehicles, compareIds, toggleCompare, clearCompare } = useShowroomStore();

  if (compareIds.length === 0) return null;

  const comparedVehicles = vehicles.filter((v) => compareIds.includes(v.id));

  return (
    <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center pointer-events-none px-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="pointer-events-auto flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-2xl bg-slate-900/95 dark:bg-[#111827]/95 text-white border border-slate-700/80 shadow-2xl backdrop-blur-md max-w-xl w-full">
        <div className="flex items-center gap-2 ps-2">
          <Layers className="h-4 w-4 text-primary shrink-0" />
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
        <div className="flex items-center gap-2 pe-1">
          <MuiButton
            onClick={clearCompare}
            variant="text"
            color="inherit"
            size="small"
          >
            Clear
          </MuiButton>
          <MuiButton
            component={Link}
            href="/compare"
            variant="contained"
            color="primary"
            size="small"
            endIcon={<ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />}
          >
            Compare Now
          </MuiButton>
        </div>
      </div>
    </div>
  );
}
