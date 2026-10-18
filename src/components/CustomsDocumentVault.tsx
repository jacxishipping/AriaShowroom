"use client";

import React, { useState } from "react";
import { VehicleItem } from "@/lib/mock-data";
import { useShowroomStore } from "@/store/useShowroomStore";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  FileCheck2,
  Download,
  Eye,
  X,
  AlertCircle,
  Clock,
  Stamp,
} from "lucide-react";
import { MuiCard, MuiChip, MuiButton } from "@/components/mui";

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

export function CustomsDocumentVault({ vehicle }: CustomsDocumentVaultProps) {
  const { language } = useShowroomStore();

  const [docs, setDocs] = useState<CustomsDoc[]>([
    {
      id: "doc-1",
      title: "Gomrok Herat / Islam Qala Final Clearance Maktoub",
      titleDari: "مکتوب قطعی ترخیص گمرک اسلام قلعه و هرات (یک کلید)",
      docType: "MAKTOUB",
      fileUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80",
      slipNumber: `MKT-HRT-2026-${vehicle.stockNumber.replace("SM-HRT-", "")}89`,
      status: "VERIFIED",
      date: "1402/11/14",
    },
    {
      id: "doc-2",
      title: "Dubai UAE Export Certificate & Title Transfer",
      titleDari: "سرتیفیکیت خروجی و سند مالکیت امارات متحده عربی",
      docType: "EXPORT_TITLE",
      fileUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
      slipNumber: `DXB-EXP-${vehicle.vin.substring(0, 8)}`,
      status: "VERIFIED",
      date: "1402/10/28",
    },
    {
      id: "doc-3",
      title: "Islam Qala Overland Transit Bill of Lading (B/L)",
      titleDari: "بارنامه بین‌المللی انتقال زمینی بندر عباس به گمرک هرات",
      docType: "BILL_OF_LADING",
      fileUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80",
      slipNumber: `BL-IR-AF-${vehicle.stockNumber.replace("SM-HRT-", "")}`,
      status: "VERIFIED",
      date: "1402/11/02",
    },
    {
      id: "doc-4",
      title: "Herat Traffic Directorate Inspection Validation",
      titleDari: "تاییدیه معاینه تخنیکی و شماره شاسی مدیریت ترافیک هرات",
      docType: "TRAFFIC_CERT",
      fileUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
      slipNumber: `TRF-HRT-88401`,
      status: "TRAFFIC_APPROVED",
      date: "1402/11/18",
    },
  ]);

  const [isUploading, setIsUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<CustomsDoc | null>(null);
  const [newDocType, setNewDocType] = useState<CustomsDoc["docType"]>("MAKTOUB");
  const [newSlipNumber, setNewSlipNumber] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const uploadedUrl = data.urls?.[0] || URL.createObjectURL(file);

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
    } catch (err) {
      console.error("Doc upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <MuiCard elevation={1} className="p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D97706]/10 text-[#D97706]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Official Customs & Title Document Vault (اسناد گمرکی و مکتوب)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Islam Qala dry port clearance maktoub, transit B/L, and Herat traffic department records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MuiChip
            label="100% Islam Qala Cleared (محصول قطعی)"
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
            className="group relative flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 transition-all hover:border-[#1976D2]/40 hover:shadow-mui-2 dark:border-slate-800 dark:bg-[#121824]"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-700 shadow-2xs dark:bg-[#1A202C] dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                  <FileText className="h-3 w-3 text-[#D97706]" />
                  {doc.slipNumber}
                </span>

                <MuiChip
                  label={doc.status === "TRAFFIC_APPROVED" ? "Traffic Verified" : "Customs Verified"}
                  color="success"
                  size="small"
                />
              </div>

              <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                {doc.title}
              </h4>
              <p dir="rtl" className="text-[11px] font-dari text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-1">
                {doc.titleDari}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono text-slate-400">
                Date: {doc.date}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDoc(doc)}
                  className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 dark:bg-navy-900 dark:text-slate-200 dark:hover:bg-navy-950 transition-colors cursor-pointer"
                >
                  <Eye className="h-3 w-3 text-gold" />
                  <span>Preview</span>
                </button>

                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-lg bg-slate-200/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-300 dark:bg-navy-700 dark:text-slate-200 dark:hover:bg-navy-600 transition-colors"
                >
                  <Download className="h-3 w-3" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload New Document Box */}
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/40 p-4 dark:border-slate-700 dark:bg-navy-950/40">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-gold dark:bg-gold/10">
              <UploadCloud className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Upload Additional Official Maktoub or Traffic Slip
              </span>
              <span className="text-[11px] text-slate-400">
                Directly uploads and persists to Vercel Blob CDN (PDF or high-res scan)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={newDocType}
              onChange={(e) => setNewDocType(e.target.value as any)}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-navy-900 dark:text-slate-200"
            >
              <option value="MAKTOUB">Islam Qala Maktoub</option>
              <option value="BILL_OF_LADING">Bill of Lading (B/L)</option>
              <option value="TRAFFIC_CERT">Traffic Inspection Sheet</option>
              <option value="EXPORT_TITLE">Export Certificate</option>
              <option value="HAWALA_SLIP">Sarrafi Voucher</option>
            </select>

            <label className="relative flex items-center justify-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-800 dark:bg-gold dark:text-slate-950 dark:hover:bg-gold-light transition-colors cursor-pointer shrink-0">
              {isUploading ? (
                <span>Uploading...</span>
              ) : (
                <>
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>Upload File</span>
                </>
              )}
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="sr-only"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Document Lightbox Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-navy-950">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-gold" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {selectedDoc.title}
                  </h4>
                  <span className="font-mono text-xs text-slate-400">
                    Slip Number: {selectedDoc.slipNumber} • Verified
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-center overflow-hidden rounded-xl bg-slate-950 max-h-[65vh]">
              <img
                src={selectedDoc.fileUrl}
                alt={selectedDoc.title}
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>

            <div className="mt-4 flex items-center justify-between pt-2 border-t dark:border-slate-800 text-xs">
              <span className="font-dari text-slate-600 dark:text-slate-300">
                {selectedDoc.titleDari}
              </span>
              <a
                href={selectedDoc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-gold px-3 py-1.5 font-bold text-slate-950 hover:bg-gold-light"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Original Resolution</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </MuiCard>
  );
}
