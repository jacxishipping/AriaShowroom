"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useShowroomStore } from "@/store/useShowroomStore";
import { VehicleItem } from "@/lib/mock-data";
import {
  MuiButton,
  MuiTextField,
  MenuItem,
} from "@/components/mui";
import {
  ScanLine,
  Camera,
  ArrowLeft,
  Search,
  CheckCircle2,
  Car,
  MapPin,
  Eye,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  Printer,
  ShieldCheck,
  Check,
  Navigation,
  ClipboardCheck,
} from "lucide-react";
import { ScanAuditHistory, ScanAuditEntry } from "@/components/ScanAuditHistory";

interface DetectedBarcode {
  rawValue?: string;
}

interface BarcodeDetectorLike {
  detect(source: ImageBitmapSource): Promise<DetectedBarcode[]>;
}

type BarcodeDetectorConstructor = new (options?: {
  formats?: string[];
}) => BarcodeDetectorLike;

export default function LotBarcodeScannerPage() {
  const {
    vehicles,
    updateVehicle,
    addToast,
    exchangeRate,
    language,
    currentRole,
    clientPresentationMode,
  } = useShowroomStore();

  const showFinancialMargins =
    !clientPresentationMode &&
    (currentRole === "SuperAdmin" || currentRole === "Accountant");

  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedYard, setSelectedYard] = useState("Main Showroom - Bagh-e-Azadi");
  const [scannedVin, setScannedVin] = useState("");
  const [scannedVehicle, setScannedVehicle] = useState<VehicleItem | null>(
    () => vehicles[0] || null
  );
  const [isLaserActive, setIsLaserActive] = useState(true);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [newYardBay, setNewYardBay] = useState("");

  // Scan Audit History tracking for the active lot walk session
  const [auditEntries, setAuditEntries] = useState<ScanAuditEntry[]>(() => {
    if (!vehicles || vehicles.length === 0) return [];
    const initialSamples = vehicles.slice(0, 4);
    return initialSamples.map((v, idx) => {
      const offset = (initialSamples.length - idx) * 9;
      const d = new Date(Date.now() - offset * 60000);
      return {
        id: `audit-${v.id}-${idx}`,
        vin: v.vin,
        vehicleId: v.id,
        stockNumber: v.stockNumber,
        make: v.make,
        model: v.model,
        year: v.year,
        trim: v.trim,
        sellingPrice: v.sellingPrice,
        image: v.images[0],
        bayLocation: v.yardLocation || "Main Showroom - Bagh-e-Azadi",
        timestamp: d.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
        scannedAt: d,
        isAudited: idx === 0 || idx === 1,
        scanMethod:
          idx === 0 ? "OPTICAL_CAMERA" : idx === 1 ? "LASER_GUN" : "QUICK_CHIP",
        status: v.status,
      };
    });
  });

  const [auditedVehicleIds, setAuditedVehicleIds] = useState<string[]>(() => {
    if (!vehicles || vehicles.length === 0) return [];
    return [vehicles[0]?.id, vehicles[1]?.id].filter(Boolean) as string[];
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastOpticalCodeRef = useRef<{ code: string; at: number }>({
    code: "",
    at: 0,
  });

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
          setCameraError(
            "Camera unavailable or permission not granted. Simulated laser viewport active."
          );
          setHasCamera(false);
        });
    } else {
      setCameraError(
        "Camera API not supported in this browser. Simulated laser viewport active."
      );
    }

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Apply hardware camera torch constraint when supported
  useEffect(() => {
    const track = streamRef.current?.getVideoTracks()?.[0];
    if (!track || typeof track.applyConstraints !== "function") return;
    track
      .applyConstraints({
        advanced: [{ torch: isTorchOn } as MediaTrackConstraintSet],
      })
      .catch(() => {});
  }, [isTorchOn]);

  // Update initial selected yard bay when scanned vehicle changes
  useEffect(() => {
    if (scannedVehicle) {
      setNewYardBay(
        scannedVehicle.yardLocation || "Main Showroom - Bagh-e-Azadi"
      );
    }
  }, [scannedVehicle]);

  // Helper to record a scan into the session audit history
  const recordScanEntry = useCallback(
    (
      v: VehicleItem,
      method:
        | "OPTICAL_CAMERA"
        | "LASER_GUN"
        | "MANUAL_ENTRY"
        | "QUICK_CHIP" = "OPTICAL_CAMERA",
      customBay?: string
    ) => {
      const bay =
        customBay ||
        selectedYard ||
        v.yardLocation ||
        "Main Showroom - Bagh-e-Azadi";
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      const newEntry: ScanAuditEntry = {
        id: `audit-${v.id}-${Date.now()}`,
        vin: v.vin,
        vehicleId: v.id,
        stockNumber: v.stockNumber,
        make: v.make,
        model: v.model,
        year: v.year,
        trim: v.trim,
        sellingPrice: v.sellingPrice,
        image: v.images[0],
        bayLocation: bay,
        timestamp: timeStr,
        scannedAt: now,
        isAudited: auditedVehicleIds.includes(v.id),
        scanMethod: method,
        status: v.status,
      };

      setAuditEntries((prev) => [
        newEntry,
        ...prev.filter((e) => e.vin !== v.vin),
      ]);
    },
    [auditedVehicleIds, selectedYard]
  );

  const handleSelectVehicle = useCallback(
    (
      v: VehicleItem,
      method:
        | "OPTICAL_CAMERA"
        | "LASER_GUN"
        | "MANUAL_ENTRY"
        | "QUICK_CHIP" = "QUICK_CHIP"
    ) => {
      setScannedVehicle(v);
      setScannedVin(v.vin);
      recordScanEntry(v, method);
      addToast(
        `Identified ${v.year} ${v.make} ${v.model} (${v.stockNumber})`,
        "success"
      );
    },
    [addToast, recordScanEntry]
  );

  // Live Optical BarcodeDetector Loop on Camera Frames
  useEffect(() => {
    if (!hasCamera || !isLaserActive || typeof window === "undefined") return;
    const DetectorClass = (
      window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }
    ).BarcodeDetector;
    if (!DetectorClass) return;

    let detector: BarcodeDetectorLike;
    try {
      detector = new DetectorClass({
        formats: ["code_128", "code_39", "qr_code", "ean_13"],
      });
    } catch {
      detector = new DetectorClass();
    }

    let cancelled = false;
    const interval = setInterval(async () => {
      if (cancelled || !videoRef.current || videoRef.current.readyState < 2) {
        return;
      }
      try {
        const codes = await detector.detect(videoRef.current);
        if (!codes || codes.length === 0) return;
        const raw = codes[0]?.rawValue?.trim();
        if (!raw) return;

        const nowMs = Date.now();
        if (
          lastOpticalCodeRef.current.code === raw &&
          nowMs - lastOpticalCodeRef.current.at < 3000
        ) {
          return;
        }
        lastOpticalCodeRef.current = { code: raw, at: nowMs };

        const normalized = raw.toLowerCase();
        const found = vehicles.find(
          (v) =>
            v.vin.toLowerCase() === normalized ||
            v.stockNumber.toLowerCase() === normalized ||
            (normalized.length >= 6 && v.vin.toLowerCase().includes(normalized))
        );

        if (found) {
          handleSelectVehicle(found, "OPTICAL_CAMERA");
        } else {
          setScannedVin(raw.toUpperCase());
          const now = new Date();
          const rawEntry: ScanAuditEntry = {
            id: `audit-raw-${nowMs}`,
            vin: raw.toUpperCase(),
            bayLocation: selectedYard,
            timestamp: now.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            }),
            scannedAt: now,
            isAudited: false,
            scanMethod: "OPTICAL_CAMERA",
            notes: "Uncatalogued lot unit",
          };
          setAuditEntries((prev) => [
            rawEntry,
            ...prev.filter((e) => e.vin !== rawEntry.vin),
          ]);
          addToast(`Scanned uncatalogued barcode: ${raw.toUpperCase()}`, "warning");
        }
      } catch {
        // Ignore transient frame decode errors
      }
    }, 600);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [addToast, handleSelectVehicle, hasCamera, isLaserActive, selectedYard, vehicles]);

  // Filter vehicles currently assigned to selected yard
  const yardVehicles = vehicles.filter(
    (v) => !selectedYard || v.yardLocation === selectedYard
  );

  const handleManualSearch = (val: string) => {
    setScannedVin(val);
    const trimmed = val.toLowerCase().trim();
    if (!trimmed) return;
    const found = vehicles.find(
      (v) =>
        v.vin.toLowerCase().includes(trimmed) ||
        v.stockNumber.toLowerCase().includes(trimmed) ||
        v.model.toLowerCase().includes(trimmed)
    );
    if (found) {
      setScannedVehicle(found);
      recordScanEntry(found, "MANUAL_ENTRY");
    } else if (trimmed.length >= 6) {
      const now = new Date();
      const rawEntry: ScanAuditEntry = {
        id: `audit-raw-${Date.now()}`,
        vin: val.toUpperCase().trim(),
        bayLocation: selectedYard,
        timestamp: now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
        scannedAt: now,
        isAudited: false,
        scanMethod: "LASER_GUN",
        notes: "Uncatalogued lot unit",
      };
      setAuditEntries((prev) => [
        rawEntry,
        ...prev.filter((e) => e.vin !== rawEntry.vin),
      ]);
    }
  };

  // Re-assign yard location
  const handleUpdateYardBay = async () => {
    if (!scannedVehicle) return;
    try {
      await updateVehicle(scannedVehicle.id, { yardLocation: newYardBay });
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Unable to update yard location",
        "error"
      );
      return;
    }
    setScannedVehicle((prev) =>
      prev ? { ...prev, yardLocation: newYardBay } : null
    );
    setAuditEntries((prev) =>
      prev.map((e) =>
        e.vehicleId === scannedVehicle.id ? { ...e, bayLocation: newYardBay } : e
      )
    );
    addToast(
      `${scannedVehicle.make} ${scannedVehicle.model} bay updated to: ${newYardBay}`,
      "success"
    );
  };

  // Mark audited during lot walk
  const handleMarkAudited = () => {
    if (!scannedVehicle) return;
    const isCurrentlyAudited = auditedVehicleIds.includes(scannedVehicle.id);

    if (!isCurrentlyAudited) {
      setAuditedVehicleIds((prev) => [...prev, scannedVehicle.id]);
      setAuditEntries((prev) =>
        prev.map((e) =>
          e.vehicleId === scannedVehicle.id ? { ...e, isAudited: true } : e
        )
      );
      addToast(
        `✓ Audited & verified ${scannedVehicle.make} ${scannedVehicle.model} physical location`,
        "success"
      );
    } else {
      setAuditedVehicleIds((prev) =>
        prev.filter((id) => id !== scannedVehicle.id)
      );
      setAuditEntries((prev) =>
        prev.map((e) =>
          e.vehicleId === scannedVehicle.id ? { ...e, isAudited: false } : e
        )
      );
      addToast(
        `Unmarked ${scannedVehicle.make} ${scannedVehicle.model} audit verification`,
        "info"
      );
    }
  };

  const handleSelectAuditEntry = (entry: ScanAuditEntry) => {
    if (entry.vehicleId) {
      const v = vehicles.find((item) => item.id === entry.vehicleId);
      if (v) {
        setScannedVehicle(v);
        setScannedVin(v.vin);
        if (entry.bayLocation) setSelectedYard(entry.bayLocation);
        addToast(
          `Loaded ${v.year} ${v.make} ${v.model} (${v.stockNumber}) from audit log`,
          "info"
        );
      }
    } else if (entry.vin) {
      setScannedVin(entry.vin);
    }
  };

  const handleToggleEntryAudited = (entryId: string) => {
    setAuditEntries((prev) =>
      prev.map((e) => {
        if (e.id === entryId) {
          const nextAudited = !e.isAudited;
          if (e.vehicleId) {
            if (nextAudited) {
              setAuditedVehicleIds((ids) =>
                ids.includes(e.vehicleId!) ? ids : [...ids, e.vehicleId!]
              );
            } else {
              setAuditedVehicleIds((ids) =>
                ids.filter((id) => id !== e.vehicleId)
              );
            }
          }
          addToast(
            nextAudited
              ? `Marked VIN ${e.vin} as audited ✓`
              : `Unmarked VIN ${e.vin}`,
            "info"
          );
          return { ...e, isAudited: nextAudited };
        }
        return e;
      })
    );
  };

  const handleClearAuditHistory = () => {
    setAuditEntries([]);
    setAuditedVehicleIds([]);
    addToast("Lot walk audit history cleared for new session", "info");
  };

  const handleDeleteAuditEntry = (entryId: string) => {
    setAuditEntries((prev) => prev.filter((e) => e.id !== entryId));
  };

  const auditProgressPercent = Math.round(
    (auditedVehicleIds.length / (vehicles.length || 1)) * 100
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 space-y-4 pb-16">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#262F40]">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-0.5">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              {language === "ps" ? "ډشبورډ" : language === "fa" ? "داشبورد" : "Cockpit"}
            </Link>
            <span>/</span>
            <Link href="/inventory" className="hover:text-blue-600 transition-colors">
              {language === "ps" ? "موجودي" : language === "fa" ? "موجودی" : "Inventory"}
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">
              {language === "ps"
                ? "د بارکوډ او VIN سکنر"
                : language === "fa"
                ? "اسکنر بارکد و شاسی"
                : "VIN Barcode Scanner"}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            {language === "ps"
              ? "د موټرو د شاسي (VIN) او بارکوډ نوري سکنر"
              : language === "fa"
              ? "اسکنر نوری بارکد و شماره شاسی (VIN) محوطه"
              : "Lot Walk VIN & Barcode Optical Scanner"}
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {language === "ps"
              ? "په محوطه کې د موټرو د شاسي سټیکرونو سکن او فزیکي تفتیش"
              : language === "fa"
              ? "شناسایی آنی برچسب شاسی، تگ‌های نمایشگاه و بازرسی فزیکی موجودی"
              : "Real-time optical recognition for door-jamb VIN stickers, lot barcode tags, and physical inventory audit."}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap print:hidden">
          <MuiButton
            component={Link}
            href="/inventory"
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />}
            sx={{ fontSize: "11px", py: "3px" }}
          >
            {language === "ps" ? "موجودي ته ستنیدل" : language === "fa" ? "بازگشت به موجودی" : "Back to Inventory"}
          </MuiButton>
          <MuiButton
            variant="contained"
            color="primary"
            size="small"
            onClick={() => window.print()}
            startIcon={<Printer className="h-3.5 w-3.5" />}
            sx={{ fontSize: "11px", py: "3px" }}
          >
            {language === "ps" ? "د لوټ ټګ چاپ" : language === "fa" ? "چاپ تگ موتر" : "Print Lot Tag"}
          </MuiButton>
        </div>
      </div>

      {/* Lot Walk Audit Progress Strip */}
      <div className="p-3 rounded-xl border border-slate-200/90 dark:border-[#262F40] bg-white dark:bg-[#161B26] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              Lot Walk Physical Audit Progress
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
              {auditedVehicleIds.length} of {vehicles.length} units audited on showroom grounds today
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-64">
          <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(auditProgressPercent, 8)}%` }}
            />
          </div>
          <span className="text-xs font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400 shrink-0">
            {auditProgressPercent}% Done
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Camera Viewport & Yard Selector (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-2xl border border-slate-200/90 dark:border-[#262F40] bg-white dark:bg-[#161B26] shadow-xs space-y-3">
            {/* Yard Selector & Camera Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Target Showroom Yard:
                </span>
              </div>
              <div className="w-full sm:w-60">
                <MuiTextField
                  select
                  size="small"
                  fullWidth
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

            {/* Camera Viewfinder Box with Laser Animation */}
            <div
              className={`relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-black border border-slate-800 flex items-center justify-center shadow-inner transition-all ${
                isTorchOn ? "brightness-125" : ""
              }`}
            >
              <video
                ref={videoRef}
                playsInline
                muted
                className={`h-full w-full object-cover ${hasCamera ? "block" : "hidden"}`}
              />

              {/* Viewfinder Target Reticle with Animated Laser Line */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
                <div className="relative h-40 w-72 rounded-xl border-2 border-dashed border-emerald-400/80 bg-emerald-500/5 shadow-2xl flex items-center justify-center overflow-hidden">
                  <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
                  <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
                  <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
                  <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />

                  {isLaserActive && (
                    <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-bounce" />
                  )}

                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-mono text-emerald-300 bg-black/70 px-2.5 py-0.5 rounded backdrop-blur-xs border border-emerald-500/30 block">
                      Align VIN Barcode Tag Inside Box
                    </span>
                    {scannedVehicle && (
                      <span className="text-[9px] font-mono text-slate-300 bg-black/60 px-1.5 py-0.5 rounded">
                        Target: {scannedVehicle.stockNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Camera Fallback / Simulated Backdrop */}
              {!hasCamera && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center text-slate-400 bg-slate-950/80 space-y-2 pointer-events-none">
                  <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 border border-slate-800">
                    <Camera className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">
                      Optical Laser Scanner Active
                    </h4>
                    <p className="text-[10px] text-slate-400 max-w-xs mt-0.5">
                      {cameraError ||
                        "Point webcam or phone at vehicle VIN tag, or scan with a USB laser gun below."}
                    </p>
                  </div>
                </div>
              )}

              {/* Interactive Viewfinder Controls Overlay */}
              <div className="absolute top-2.5 end-2.5 flex items-center gap-1.5 bg-black/60 backdrop-blur-xs p-1 rounded-lg border border-white/10 z-10">
                <button
                  type="button"
                  aria-label="Toggle laser line"
                  onClick={() => setIsLaserActive(!isLaserActive)}
                  className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                    isLaserActive
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "text-slate-400"
                  }`}
                  title="Toggle Laser Line"
                >
                  <Zap className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Toggle torch"
                  onClick={() => setIsTorchOn(!isTorchOn)}
                  className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                    isTorchOn
                      ? "bg-amber-500/20 text-amber-400"
                      : "text-slate-400"
                  }`}
                  title="Toggle Flashlight / Torch"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Toggle scan beep sound"
                  onClick={() => setIsSoundMuted(!isSoundMuted)}
                  className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                    !isSoundMuted
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-slate-400"
                  }`}
                  title="Toggle Scan Beep Sound"
                >
                  {isSoundMuted ? (
                    <VolumeX className="h-3.5 w-3.5" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Manual VIN Input Fallback & Laser Gun Adornment */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-semibold text-slate-500 block">
                Or Type / Scan with Handheld USB Laser Gun:
              </span>
              <MuiTextField
                placeholder="Enter VIN or Stock Number (e.g. ARIA-2026-001 or JTMBW...)"
                size="small"
                fullWidth
                value={scannedVin}
                onChange={(e) => handleManualSearch(e.target.value)}
                startAdornment={<Search className="h-3.5 w-3.5 text-slate-400 me-2" />}
                autoFocus
              />
            </div>

            {/* Quick 1-Click Scan Chips */}
            <div className="pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Quick Lot Barcode Lookup:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {vehicles.slice(0, 4).map((v) => (
                  <button
                    type="button"
                    key={v.id}
                    onClick={() => handleSelectVehicle(v)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer"
                  >
                    <ScanLine className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    <span>
                      {v.year} {v.make} {v.model}
                    </span>
                    <span className="font-mono tabular-nums text-[10px] text-slate-400">
                      ({v.stockNumber})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick-Pick Stock Grid in this Yard */}
          <div className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-[#262F40] bg-white dark:bg-[#161B26] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Registered Vehicles in Yard ({yardVehicles.length})
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                Tap vehicle to identify
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pe-1">
              {yardVehicles.map((v) => {
                const isAudited = auditedVehicleIds.includes(v.id);
                const isSelected = scannedVehicle?.id === v.id;

                return (
                  <button
                    type="button"
                    key={v.id}
                    onClick={() => handleSelectVehicle(v)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-start border transition-all cursor-pointer ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs"
                        : "border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="relative h-10 w-14 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      {v.images[0] ? (
                        <Image
                          src={v.images[0]}
                          alt={v.model}
                          fill
                          unoptimized={v.images[0].startsWith("data:")}
                          className="object-cover"
                        />
                      ) : (
                        <Car className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                    <div className="truncate flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1">
                        <span>
                          {v.year} {v.make} {v.model}
                        </span>
                        {isAudited && (
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                        )}
                      </div>
                      <div className="font-mono tabular-nums text-[10px] text-slate-400 truncate">
                        {v.stockNumber} • {v.vin.substring(0, 8)}...
                      </div>
                    </div>
                    <div className="text-end shrink-0">
                      <div className="text-xs font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                        ${v.sellingPrice.toLocaleString()}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Identified Vehicle Dossier & Quick Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {scannedVehicle ? (
            <div className="p-4 rounded-2xl border border-slate-200/90 dark:border-[#262F40] bg-white dark:bg-[#161B26] shadow-xs space-y-3.5 border-t-4 border-t-emerald-500 sticky top-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Vehicle Identified
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      Verified against Customs &amp; Inventory DB
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {auditedVehicleIds.includes(scannedVehicle.id) && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      <Check className="h-3 w-3" /> Audited
                    </span>
                  )}
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {scannedVehicle.status}
                  </span>
                </div>
              </div>

              {/* Vehicle Photo Banner */}
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                {scannedVehicle.images[0] ? (
                  <Image
                    src={scannedVehicle.images[0]}
                    alt={scannedVehicle.model}
                    fill
                    unoptimized={scannedVehicle.images[0].startsWith("data:")}
                    className="object-cover"
                  />
                ) : (
                  <Car className="h-10 w-10 text-slate-400" />
                )}
                <div className="absolute bottom-2 start-2 bg-black/75 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-mono tabular-nums">
                  {scannedVehicle.stockNumber}
                </div>
                <div className="absolute top-2 end-2 bg-black/75 backdrop-blur-xs text-emerald-400 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                  {scannedVehicle.yardLocation || "Bagh-e-Azadi"}
                </div>
              </div>

              {/* Title & Price */}
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {scannedVehicle.year} {scannedVehicle.make} {scannedVehicle.model}
                </h2>
                <div className="text-[11px] text-slate-500">
                  {scannedVehicle.trim || "Full Option GCC"}
                </div>

                <div className="mt-2 flex items-baseline justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Selling Price
                    </div>
                    <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                      ${scannedVehicle.sellingPrice.toLocaleString()} USD
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Sarrafi AFN
                    </div>
                    <div className="text-xs font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
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
                  <div className="text-[10px] text-slate-400 uppercase">Odometer</div>
                  <div className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white text-[11px]">
                    {scannedVehicle.mileage.toLocaleString()} KM
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Customs Clearance</div>
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400 truncate text-[11px]">
                    {scannedVehicle.customsClearance.split("-")[0].trim()}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  {showFinancialMargins ? (
                    <>
                      <div className="text-[10px] text-slate-400 uppercase">Landed Cost</div>
                      <div className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white text-[11px]">
                        ${scannedVehicle.landedCost?.toLocaleString() || "N/A"} USD
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-[10px] text-slate-400 uppercase">Origin Spec</div>
                      <div className="font-semibold text-slate-900 dark:text-white text-[11px]">
                        {scannedVehicle.originCountry} ({scannedVehicle.fuelType})
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Bay Reassignment & Audit Button */}
              {currentRole !== "Accountant" && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2 print:hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Navigation className="h-3 w-3 text-blue-500" />
                      Re-assign Showroom Bay:
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleUpdateYardBay()}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
                    >
                      Save Bay
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <MuiTextField
                      select
                      size="small"
                      fullWidth
                      value={newYardBay}
                      onChange={(e) => setNewYardBay(e.target.value)}
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
                      <MenuItem value="Detailing & PDI Wash Bay">
                        Detailing &amp; PDI Wash Bay
                      </MenuItem>
                    </MuiTextField>
                  </div>
                </div>
              )}

              {/* Physical Audit Action Button */}
              <div className="print:hidden space-y-2">
                <MuiButton
                  variant={
                    auditedVehicleIds.includes(scannedVehicle.id)
                      ? "outlined"
                      : "contained"
                  }
                  color={
                    auditedVehicleIds.includes(scannedVehicle.id)
                      ? "inherit"
                      : "success"
                  }
                  fullWidth
                  size="small"
                  onClick={handleMarkAudited}
                  startIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                  sx={{ fontSize: "11px", py: "4px" }}
                >
                  {auditedVehicleIds.includes(scannedVehicle.id)
                    ? "✓ Verified in Lot Audit"
                    : "Mark Inspected & Reconciled"}
                </MuiButton>

                {/* Direct Route Action Buttons */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <MuiButton
                    component={Link}
                    href={`/vehicles/${scannedVehicle.id}`}
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="small"
                    sx={{ fontSize: "11px", py: "4px" }}
                    startIcon={<Eye className="h-3.5 w-3.5" />}
                  >
                    Open Full Vehicle Dossier
                  </MuiButton>

                  <div className="grid grid-cols-2 gap-2">
                    <MuiButton
                      component={Link}
                      href={`/verify?vin=${scannedVehicle.vin}`}
                      variant="outlined"
                      color="inherit"
                      size="small"
                      sx={{ fontSize: "11px", py: "3px" }}
                      startIcon={<ShieldCheck className="h-3 w-3 text-blue-600" />}
                    >
                      Verify Certificate
                    </MuiButton>

                    <MuiButton
                      component={Link}
                      href="/compare"
                      variant="outlined"
                      color="inherit"
                      size="small"
                      sx={{ fontSize: "11px", py: "3px" }}
                      startIcon={<Car className="h-3 w-3 text-emerald-600" />}
                    >
                      Compare Specs
                    </MuiButton>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#161B26] space-y-2 text-slate-400">
              <div className="mx-auto h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <ScanLine className="h-5 w-5 text-slate-400" />
              </div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Awaiting VIN Scan or Selection
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                Scan a barcode with your camera, use a handheld laser gun, or select any vehicle from the list.
              </p>
            </div>
          )}

          {/* Active Session Audit Mini Status */}
          <div className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-[#262F40] bg-white dark:bg-[#161B26] shadow-xs space-y-2.5 print:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <ClipboardCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Session Walk Audit Tracker</span>
              </div>
              <span className="text-[10px] font-mono tabular-nums font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60">
                {auditEntries.length} VINs Scanned
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Every barcode or VIN scanned during your walk is logged with its timestamp and physical bay location. Review the comprehensive audit table below.
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono tabular-nums">
              <span className="text-slate-400">Reconciled:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {auditEntries.filter((e) => e.isAudited).length} / {auditEntries.length} units
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Scan Audit History Component */}
      <div className="print:hidden">
        <ScanAuditHistory
          entries={auditEntries}
          currentVehicleId={scannedVehicle?.id}
          onSelectEntry={handleSelectAuditEntry}
          onToggleAudited={handleToggleEntryAudited}
          onClearHistory={handleClearAuditHistory}
          onDeleteEntry={handleDeleteAuditEntry}
        />
      </div>
    </div>
  );
}
