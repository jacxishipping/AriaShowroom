"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShowroomStore } from "@/store/useShowroomStore";
import { VehicleItem } from "@/lib/mock-data";
import {
  MuiCard,
  MuiButton,
  MuiChip,
  MuiTextField,
  MenuItem,
  IconButton,
} from "@/components/mui";
import {
  ScanLine,
  Camera,
  ArrowLeft,
  Search,
  CheckCircle2,
  Car,
  MapPin,
  ExternalLink,
  FileCheck,
  Banknote,
  Eye,
  RefreshCw,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";

export default function LotBarcodeScannerPage() {
  const router = useRouter();
  const { vehicles, addToast, exchangeRate } = useShowroomStore();

  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedYard, setSelectedYard] = useState("Main Showroom - Bagh-e-Azadi");
  const [scannedVin, setScannedVin] = useState("");
  const [scannedVehicle, setScannedVehicle] = useState<VehicleItem | null>(null);
  const [scanHistory, setScanHistory] = useState<VehicleItem[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera
  useEffect(() => {
    let active = true;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          if (!active) {
            stream.getTracks().forEach((track) => track.stop());
            return;
          }
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
          setHasCamera(true);
        })
        .catch((err) => {
          console.warn("Camera access warning:", err);
          setCameraError("Camera permission not granted or device lacks camera. Use manual VIN lookup.");
          setHasCamera(false);
        });
    } else {
      setCameraError("Camera API not supported in this browser. Use manual VIN lookup.");
    }

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Filter vehicles currently assigned to selected yard
  const yardVehicles = vehicles.filter(
    (v) => !selectedYard || v.yardLocation === selectedYard
  );

  const handleManualSearch = (val: string) => {
    setScannedVin(val);
    const found = vehicles.find(
      (v) =>
        v.vin.toLowerCase().includes(val.toLowerCase().trim()) ||
        v.stockNumber.toLowerCase().includes(val.toLowerCase().trim())
    );
    if (found) {
      setScannedVehicle(found);
      if (!scanHistory.some((h) => h.id === found.id)) {
        setScanHistory((prev) => [found, ...prev]);
      }
    }
  };

  const handleSelectVehicle = (v: VehicleItem) => {
    setScannedVehicle(v);
    setScannedVin(v.vin);
    if (!scanHistory.some((h) => h.id === v.id)) {
      setScanHistory((prev) => [v, ...prev]);
    }
    addToast(`Identified ${v.year} ${v.make} ${v.model} (${v.stockNumber})`, "success");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 space-y-4">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-0.5">
            <Link href="/" className="hover:text-primary transition-colors">
              Cockpit
            </Link>
            <span>/</span>
            <Link href="/inventory" className="hover:text-primary transition-colors">
              Inventory
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">
              VIN Barcode Scanner
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-primary" />
            Lot Walk VIN & Barcode Camera Scanner
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Camera optical recognition for vehicle door-jamb VIN stickers, lot barcode tags, and inventory audit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <MuiButton
            component={Link}
            href="/inventory"
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<ArrowLeft className="h-3.5 w-3.5" />}
            sx={{ fontSize: "11px", py: "3px" }}
          >
            Back to Inventory
          </MuiButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Camera Viewport & Yard Selector (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#121824] shadow-xs space-y-3">
            {/* Yard Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Target Showroom Yard:
                </span>
              </div>
              <div className="w-full sm:w-56">
                <MuiTextField
                  select
                  sizeVariant="small"
                  value={selectedYard}
                  onChange={(e) => setSelectedYard(e.target.value)}
                >
                  <MenuItem value="Main Showroom - Bagh-e-Azadi">
                    Main Showroom - Bagh-e-Azadi
                  </MenuItem>
                  <MenuItem value="VIP Covered Bay - Showroom 1">
                    VIP Covered Bay - Showroom 1
                  </MenuItem>
                  <MenuItem value="Holding Yard - Islam Qala Border">
                    Holding Yard - Islam Qala Border
                  </MenuItem>
                  <MenuItem value="Herat Customs Dry Port (Gomrok)">
                    Herat Customs Dry Port (Gomrok)
                  </MenuItem>
                </MuiTextField>
              </div>
            </div>

            {/* Camera Viewfinder Box */}
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-black border border-slate-800 flex items-center justify-center shadow-inner">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`h-full w-full object-cover ${hasCamera ? "block" : "hidden"}`}
              />

              {/* Viewfinder Target Reticle */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
                <div className="relative h-36 w-64 rounded-xl border-2 border-dashed border-emerald-400/80 bg-emerald-500/5 shadow-2xl flex items-center justify-center">
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-300 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                    Align VIN Barcode Inside Box
                  </span>
                </div>
              </div>

              {/* Camera Fallback State */}
              {!hasCamera && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center text-slate-400 bg-slate-950/90 space-y-2">
                  <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-500">
                    <Camera className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">
                      Camera Standby / Permission Required
                    </h4>
                    <p className="text-[10px] text-slate-400 max-w-xs mt-0.5">
                      {cameraError || "Point your phone or webcam at the VIN barcode tag located on the driver side door-jamb."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Manual VIN Input Fallback */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-semibold text-slate-500 block">
                Or Type / Scan with Handheld USB Laser Gun:
              </span>
              <MuiTextField
                placeholder="Enter VIN or Stock Number (e.g. SM-HRT-882 or JTMCY...)"
                sizeVariant="small"
                value={scannedVin}
                onChange={(e) => handleManualSearch(e.target.value)}
                startAdornment={<Search className="h-3.5 w-3.5 text-slate-400" />}
                autoFocus
              />
            </div>
          </div>

          {/* Quick-Pick Stock Grid in this Yard */}
          <div className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#121824] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Registered Vehicles in {selectedYard.split("-")[0]} ({yardVehicles.length})
              </h3>
              <span className="text-[10px] text-slate-400">Click to simulate scan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto">
              {yardVehicles.map((v) => (
                <button
                  key={v.id}
                  onClick={() => handleSelectVehicle(v)}
                  className={`flex items-center gap-2 p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    scannedVehicle?.id === v.id
                      ? "border-primary bg-primary/10 shadow-xs"
                      : "border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="relative h-9 w-12 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                    <Image
                      src={v.images[0]}
                      alt={v.model}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="truncate flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {v.year} {v.make} {v.model}
                    </div>
                    <div className="font-mono text-[10px] text-slate-400 truncate">
                      {v.stockNumber} • {v.vin.substring(0, 8)}...
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-emerald-600">
                      ${v.sellingPrice.toLocaleString()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Identified Vehicle Dossier & Quick Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {scannedVehicle ? (
            <div className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#121824] shadow-xs space-y-3.5 border-t-4 border-t-emerald-500">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Vehicle Identified
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      Verified against Customs & Inventory DB
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {scannedVehicle.status}
                </span>
              </div>

              {/* Vehicle Photo Banner */}
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs">
                <Image
                  src={scannedVehicle.images[0]}
                  alt={scannedVehicle.model}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-mono">
                  {scannedVehicle.stockNumber}
                </div>
              </div>

              {/* Title & Price */}
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {scannedVehicle.year} {scannedVehicle.make} {scannedVehicle.model}
                </h2>
                <div className="text-[11px] text-slate-500">{scannedVehicle.trim}</div>

                <div className="mt-2 flex items-baseline justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Selling Price
                    </div>
                    <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                      ${scannedVehicle.sellingPrice.toLocaleString()} USD
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Sarrafi AFN
                    </div>
                    <div className="text-xs font-bold font-mono text-emerald-600">
                      ؋ {(scannedVehicle.sellingPrice * exchangeRate).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Identification Spec Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Chassis / VIN</div>
                  <div className="font-mono font-semibold text-slate-900 dark:text-white truncate text-[11px]">
                    {scannedVehicle.vin}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Current Bay</div>
                  <div className="font-semibold text-slate-900 dark:text-white truncate text-[11px]">
                    {(scannedVehicle.yardLocation || "Main Showroom").split("-")[0]}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Odometer</div>
                  <div className="font-mono font-semibold text-slate-900 dark:text-white text-[11px]">
                    {scannedVehicle.mileage.toLocaleString()} KM
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Customs Status</div>
                  <div className="font-semibold text-emerald-600 truncate text-[11px]">
                    Islam Qala Cleared
                  </div>
                </div>
              </div>

              {/* Direct Route Action Buttons */}
              <div className="space-y-2 pt-1">
                <MuiButton
                  component={Link}
                  href={`/vehicles/${scannedVehicle.id}`}
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="small"
                  sx={{ fontSize: "11px", py: "5px" }}
                  startIcon={<Eye className="h-3.5 w-3.5" />}
                >
                  Open Full Vehicle Dossier
                </MuiButton>

                <div className="grid grid-cols-2 gap-2">
                  <MuiButton
                    component={Link}
                    href={`/vehicles/${scannedVehicle.id}/deed`}
                    variant="outlined"
                    color="inherit"
                    size="small"
                    sx={{ fontSize: "11px", py: "4px" }}
                    startIcon={<FileCheck className="h-3 w-3 text-primary" />}
                  >
                    Generate Deed
                  </MuiButton>

                  <MuiButton
                    component={Link}
                    href={`/vehicles/${scannedVehicle.id}/settlement`}
                    variant="outlined"
                    color="inherit"
                    size="small"
                    sx={{ fontSize: "11px", py: "4px" }}
                    startIcon={<Banknote className="h-3 w-3 text-emerald-600" />}
                  >
                    Sarrafi Settlement
                  </MuiButton>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#121824] space-y-2 text-slate-400">
              <div className="mx-auto h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <ScanLine className="h-5 w-5 text-slate-400" />
              </div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Awaiting VIN Scan or Selection
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                Scan a barcode with your device camera, use a handheld scanner, or pick any vehicle from the yard list.
              </p>
            </div>
          )}

          {/* Session Scan History */}
          {scanHistory.length > 0 && (
            <div className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#121824] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Recent Session Audits ({scanHistory.length})
                </h4>
                <button
                  onClick={() => setScanHistory([])}
                  className="text-[10px] text-slate-400 hover:text-slate-600"
                >
                  Clear History
                </button>
              </div>

              <div className="space-y-1">
                {scanHistory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setScannedVehicle(item)}
                    className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Car className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-900 dark:text-white truncate">
                        {item.year} {item.make} {item.model}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">
                      {item.stockNumber}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
