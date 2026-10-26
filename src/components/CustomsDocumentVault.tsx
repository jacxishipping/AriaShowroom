"use client";

import React, { useState, useEffect } from "react";
import { VehicleItem } from "@/lib/mock-data";
import { useShowroomStore } from "@/store/useShowroomStore";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  ShieldCheck,
  FileCheck2,
  Download,
  Eye,
  X,
} from "lucide-react";
import {
  MuiCard,
  MuiChip,
  MuiButton,
  MuiTextField,
  MenuItem,
  IconButton,
} from "@/components/mui";

interface CustomsDoc {
  id: string;
  title: string;
  titleDari: string;
  docType: "MAKTOUB" | "BILL_OF_LADING" | "TRAFFIC_CERT" | "EXPORT_TITLE" | "HAWALA_SLIP";
  fileUrl: string;
  slipNumber: string;
  status: "VERIFIED" | "PENDING_CUSTOMS" | "TRAFFIC_APPROVED";
  date: string;
}

interface CustomsDocumentVaultProps {
  vehicle: VehicleItem;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function CustomsDocumentVault({ vehicle }: CustomsDocumentVaultProps) {
  const { branding, language, addToast } = useShowroomStore();
  const shortStockSuffix = vehicle.stockNumber.replace(/^[A-Z]+-[A-Z0-9]+-/, "");

  const [docs, setDocs] = useState<CustomsDoc[]>([
    {
      id: "doc-1",
      title: "Gomrok Herat / Islam Qala Final Clearance Maktoub",
      titleDari: "مکتوب قطعی ترخیص گمرک اسلام قلعه و هرات (یک کلید)",
      docType: "MAKTOUB",
      fileUrl:
        "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80",
      slipNumber: `MKT-HRT-2026-${shortStockSuffix}89`,
      status: "VERIFIED",
      date: "1402/11/14",
    },
    {
      id: "doc-2",
      title: "Dubai UAE Export Certificate & Title Transfer",
      titleDari: "سرتیفیکیت خروجی و سند مالکیت امارات متحده عربی",
      docType: "EXPORT_TITLE",
      fileUrl:
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
      slipNumber: `DXB-EXP-${vehicle.vin.substring(0, 8)}`,
      status: "VERIFIED",
      date: "1402/10/28",
    },
    {
      id: "doc-3",
      title: "Islam Qala Overland Transit Bill of Lading (B/L)",
      titleDari: "بارنامه بین‌المللی انتقال زمینی بندر عباس به گمرک هرات",
      docType: "BILL_OF_LADING",
      fileUrl:
        "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80",
      slipNumber: `BL-IR-AF-${shortStockSuffix}`,
      status: "VERIFIED",
      date: "1402/11/02",
    },
    {
      id: "doc-4",
      title: "Herat Traffic Directorate Inspection Validation",
      titleDari: "تاییدیه معاینه تخنیکی و شماره شاسی مدیریت ترافیک هرات",
      docType: "TRAFFIC_CERT",
      fileUrl:
        "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
      slipNumber: `TRF-HRT-88401`,
      status: "TRAFFIC_APPROVED",
      date: "1402/11/18",
    },
  ]);

  const [isUploading, setIsUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<CustomsDoc | null>(null);
  const [newDocType, setNewDocType] = useState<CustomsDoc["docType"]>("MAKTOUB");
  const [newSlipNumber, setNewSlipNumber] = useState("");

  useEffect(() => {
    if (!selectedDoc) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedDoc(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedDoc]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      let uploadedUrl = "";
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          uploadedUrl = data.urls?.[0] || data.url || "";
        }
      } catch {
        // Fallback to persistent Data URL below
      }

      if (!uploadedUrl) {
        uploadedUrl = await fileToDataUrl(file);
      }

      const newDoc: CustomsDoc = {
        id: `doc-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        titleDari: "سند الحاقی جدید گمرک و ترافیک",
        docType: newDocType,
        fileUrl: uploadedUrl,
        slipNumber: newSlipNumber || `MKT-HRT-${Date.now().toString().slice(-4)}`,
        status: "VERIFIED",
        date: new Date().toLocaleDateString("fa-AF"),
      };

      setDocs((prev) => [newDoc, ...prev]);
      setNewSlipNumber("");
      addToast("Official document attached to customs vault", "success");
    } catch (err) {
      console.error("Doc upload error:", err);
      addToast("Could not upload customs document", "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <MuiCard elevation={1} className="p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#262F40] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {language === "ps"
                ? "د ګمرک او ترافیک اسنادو خزانه"
                : language === "fa"
                ? "آرشیف اسناد گمرکی و مکتوب ترافیک"
                : "Official Customs & Title Document Vault"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {branding?.dealershipName || "Aria Motors"} ·{" "}
              {branding?.customsTerminalBranch || "Islam Qala Dry Port Customs Terminal"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MuiChip
            label={
              language === "ps"
                ? "۱۰۰٪ اسلام قلعه محصول شوی"
                : language === "fa"
                ? "۱۰۰٪ محصول قطعی اسلام قلعه"
                : "100% Islam Qala Cleared"
            }
            color="success"
            size="small"
            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          />
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition-all hover:border-[var(--theme-primary)]/50 dark:border-[#262F40] dark:bg-[#121722]"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-700 dark:bg-[#161B26] dark:text-slate-300 border border-slate-200 dark:border-[#262F40]">
                  <FileText className="h-3 w-3 text-slate-400" />
                  {doc.slipNumber}
                </span>

                <MuiChip
                  label={
                    doc.status === "TRAFFIC_APPROVED" ? "Traffic Verified" : "Customs Verified"
                  }
                  color="success"
                  size="small"
                />
              </div>

              <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                {doc.title}
              </h4>
              <p
                dir="rtl"
                className="text-[11px] font-dari text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-1"
              >
                {doc.titleDari}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#262F40] flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono tabular-nums text-slate-400">
                Date: {doc.date}
              </span>

              <div className="flex items-center gap-2">
                <MuiButton
                  variant="outlined"
                  color="inherit"
                  size="small"
                  onClick={() => setSelectedDoc(doc)}
                  startIcon={<Eye className="h-3.5 w-3.5 text-[var(--theme-primary)]" />}
                >
                  {language === "ps" ? "کتنه" : language === "fa" ? "مشاهده" : "Preview"}
                </MuiButton>

                <MuiButton
                  component="a"
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  color="inherit"
                  size="small"
                  startIcon={<Download className="h-3.5 w-3.5" />}
                >
                  {language === "ps" ? "ډاونلوډ" : language === "fa" ? "دانلود" : "Download"}
                </MuiButton>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload New Document Box */}
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-4 dark:border-[#262F40] dark:bg-[#121722]/60">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-slate-800">
              <UploadCloud className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                {language === "ps"
                  ? "نوی رسمي مکتوب یا د ترافیک سند پورته کړئ"
                  : language === "fa"
                  ? "بارگذاری مکتوب جدید گمرک یا سند ترافیک"
                  : "Upload Additional Official Maktoub or Traffic Slip"}
              </span>
              <span className="text-[11px] text-slate-400">
                PDF or high-resolution document scan
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <MuiTextField
              select
              sizeVariant="small"
              aria-label="Document Type"
              value={newDocType}
              onChange={(e) => setNewDocType(e.target.value as CustomsDoc["docType"])}
              className="min-w-[190px]"
            >
              <MenuItem value="MAKTOUB">Islam Qala Maktoub</MenuItem>
              <MenuItem value="BILL_OF_LADING">Bill of Lading (B/L)</MenuItem>
              <MenuItem value="TRAFFIC_CERT">Traffic Inspection Sheet</MenuItem>
              <MenuItem value="EXPORT_TITLE">Export Certificate</MenuItem>
              <MenuItem value="HAWALA_SLIP">Sarrafi Voucher</MenuItem>
            </MuiTextField>

            <MuiButton
              component="label"
              variant="contained"
              color="primary"
              size="medium"
              startIcon={<UploadCloud className="h-4 w-4" />}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Upload File"}
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                disabled={isUploading}
                hidden
              />
            </MuiButton>
          </div>
        </div>
      </div>

      {/* Document Lightbox Preview Modal */}
      {selectedDoc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedDoc.title}
          onClick={() => setSelectedDoc(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl rounded-xl bg-white p-6 shadow-2xl dark:bg-[#161B26] border border-slate-200 dark:border-[#262F40]"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-[#262F40]">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-emerald-500" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {selectedDoc.title}
                  </h4>
                  <span className="font-mono text-xs text-slate-400">
                    Slip Number: {selectedDoc.slipNumber} •{" "}
                    {branding?.dealershipName || "Aria Motors"} Verified
                  </span>
                </div>
              </div>
              <IconButton
                size="small"
                aria-label="Close document preview"
                onClick={() => setSelectedDoc(null)}
              >
                <X className="h-5 w-5" />
              </IconButton>
            </div>

            <div className="mt-4 flex items-center justify-center overflow-hidden rounded-lg bg-slate-950 max-h-[65vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedDoc.fileUrl}
                alt={selectedDoc.title}
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>

            <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-200 dark:border-[#262F40] text-xs">
              <span className="font-dari text-slate-600 dark:text-slate-300">
                {selectedDoc.titleDari}
              </span>
              <MuiButton
                component="a"
                href={selectedDoc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                color="primary"
                size="small"
                startIcon={<Download className="h-3.5 w-3.5" />}
              >
                Download Original
              </MuiButton>
            </div>
          </div>
        </div>
      )}
    </MuiCard>
  );
}
