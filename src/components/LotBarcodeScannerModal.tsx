"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useShowroomStore } from "@/store/useShowroomStore";
import {
  ScanLine,
  Camera,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  Car,
  MapPin,
  Sparkles,
  Zap,
} from "lucide-react";
import { MuiButton, MuiChip, MuiTextField } from "@/components/mui";

interface LotBarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LotBarcodeScannerModal({
  isOpen,
  onClose,
}: LotBarcodeScannerModalProps) {
  const router = useRouter();
  const { vehicles } = useShowroomStore();

  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedYard, setSelectedYard] = useState("Main Showroom - Bagh-e-Azadi");
  const [scannedVin, setScannedVin] = useState("");
  const [scanningSuccess, setScanningSuccess] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      return;
    }

    // Try starting camera stream
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
          setHasCamera(true);
        })
        .catch((err) => {
          console.warn("Camera not available, falling back to simulated lot scanner:", err);
          setCameraError("Camera unavailable or permission denied. Use quick-pick below.");
          setHasCamera(false);
        });
    } else {
      setCameraError("Camera API not supported on this browser.");
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectVehicle = (vehicleId: string) => {
    setScanningSuccess(vehicleId);
    setTimeout(() => {
      onClose();
      router.push(`/vehicles/${vehicleId}`);
      setScanningSuccess(null);
    }, 450);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedVin.trim()) return;

    const matched = vehicles.find(
      (v) =>
        v.vin.toLowerCase().includes(scannedVin.toLowerCase()) ||
        v.stockNumber.toLowerCase().includes(scannedVin.toLowerCase())
    );

    if (matched) {
      handleSelectVehicle(matched.id);
    } else {
      alert(`No vehicle found with VIN/Stock matching "${scannedVin}"`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-mui-24 dark:bg-[#121824] sm:p-7 border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D97706]/15 text-[#D97706]">
              <ScanLine className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Lot Walk VIN & Barcode Scanner (اسکنر شاسی و بارکد موتر)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Point camera at door jamb barcode or windshield sticker
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Yard Location Picker */}
        <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 p-2.5 dark:bg-[#1A202C] border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <MapPin className="h-4 w-4 text-[#D97706] shrink-0" />
            <span className="font-semibold">Current Yard:</span>
          </div>
          <select
            value={selectedYard}
            onChange={(e) => setSelectedYard(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium dark:border-slate-700 dark:bg-[#121824] dark:text-white outline-none focus:border-[#1976D2]"
          >
            <option value="Main Showroom - Bagh-e-Azadi">Main Showroom (باغ آزادی)</option>
            <option value="Yard 2 - Islam Qala Highway">Yard 2 (سرک اسلام قلعه)</option>
            <option value="Islam Qala Customs Bonded Yard">Customs Bonded Port (گمرک اسلام قلعه)</option>
          </select>
        </div>

        {/* Camera Viewport or Fallback Graphic */}
        <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-xl bg-black flex items-center justify-center border-2 border-slate-800">
          {hasCamera ? (
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-center p-6 space-y-2">
              <Camera className="h-10 w-10 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">
                {cameraError || "Camera scanner simulation active"}
              </p>
              <MuiChip
                label="Select from verified yard stock below"
                color="gold"
                size="small"
              />
            </div>
          )}

          {/* Scanner Target Box with Pulsing Laser */}
          <div className="pointer-events-none absolute inset-x-12 inset-y-8 rounded-xl border-2 border-[#D97706]/70">
            <div className={`absolute inset-x-0 top-1/2 h-0.5 ${scanningSuccess ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,1)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"} animate-pulse`} />
          </div>

          {/* Lock Confirmation Overlay */}
          {scanningSuccess && (
            <div className="absolute inset-0 bg-emerald-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white animate-fadeIn">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 animate-bounce mb-1" />
              <span className="text-sm font-bold tracking-wider uppercase text-emerald-300">
                Barcode Recognized • Loading Sheet...
              </span>
            </div>
          )}
        </div>

        {/* Manual Input / Quick Match Form */}
        <form onSubmit={handleManualSearch} className="mt-4 flex gap-2 items-center">
          <div className="relative flex-1">
            <MuiTextField
              placeholder="Or type Stock # or VIN (e.g. JTMCY7... or SM-HRT-101)"
              value={scannedVin}
              onChange={(e) => setScannedVin(e.target.value)}
              startAdornment={<Search className="h-4 w-4 text-slate-400" />}
              sizeVariant="small"
            />
          </div>
          <MuiButton
            type="submit"
            variant="contained"
            color="gold"
            size="small"
            className="shrink-0 h-[34px]"
          >
            Locate Car
          </MuiButton>
        </form>

        {/* Quick Pick Vehicles on Current Lot */}
        <div className="mt-5 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Cars Present in {selectedYard}:
          </span>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {vehicles.map((v) => (
              <button
                key={v.id}
                onClick={() => handleSelectVehicle(v.id)}
                className="w-full flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/50 p-2.5 text-left text-xs transition-colors hover:border-[#1976D2] hover:bg-[#1976D2]/5 dark:border-slate-800 dark:bg-[#1A202C]/60 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Car className="h-4 w-4 text-[#D97706] shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {v.year} {v.make} {v.model}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      VIN: {v.vin} • #{v.stockNumber}
                    </span>
                  </div>
                </div>

                <div className="text-right flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-900 dark:text-white block">
                    ${v.sellingPrice.toLocaleString()}
                  </span>
                  <MuiChip
                    label={v.status}
                    color={v.status === "Available on Lot" ? "success" : "default"}
                    size="small"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
