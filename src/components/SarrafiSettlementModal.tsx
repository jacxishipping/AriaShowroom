"use client";

import React, { useState } from "react";
import { VehicleItem } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { useShowroomStore } from "@/store/useShowroomStore";
import {
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  Send,
  Printer,
  X,
  AlertCircle,
  Receipt,
  User,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { MuiButton, MuiChip, MuiTextField, MenuItem, IconButton } from "@/components/mui";

interface InstallmentMilestone {
  id: string;
  milestoneName: string;
  milestoneNameDari: string;
  dueDate: string;
  amountUsd: number;
  status: "PAID" | "PENDING" | "OVERDUE";
  paidDate?: string;
}

interface SarrafiSettlementModalProps {
  vehicle: VehicleItem;
  isOpen: boolean;
  onClose: () => void;
}

export function SarrafiSettlementModal({
  vehicle,
  isOpen,
  onClose,
}: SarrafiSettlementModalProps) {
  const { language, exchangeRate } = useShowroomStore();

  const [paymentChannel, setPaymentChannel] = useState<
    "SARRAFI" | "CASH_SHOWROOM" | "BANK_TRANSFER" | "INSTALLMENT_PLAN"
  >("SARRAFI");

  const [sarrafName, setSarrafName] = useState(
    "Sarrafi Haji Mohammad & Sons (صرافی حاجی محمد و پسران)"
  );
  const [sarrafMarket, setSarrafMarket] = useState("Khorasan Market, Shop 42, Herat");
  const [hawalaVoucherNumber, setHawalaVoucherNumber] = useState(
    `HWL-KHR-2026-${vehicle.stockNumber.replace("SM-HRT-", "")}77`
  );
  const [customerName, setCustomerName] = useState("Haji Abdul Qadir Karimi");
  const [customerPhone, setCustomerPhone] = useState("+93799887766");
  const [customerTazkira, setCustomerTazkira] = useState("HRT-1402-984210");
  const [lockedRate, setLockedRate] = useState(exchangeRate || 70.5);

  // Default 3-milestone installment schedule
  const totalAmount = vehicle.sellingPrice;
  const deposit = Math.round(totalAmount * 0.4);
  const milestone1 = Math.round(totalAmount * 0.3);
  const milestone2 = totalAmount - deposit - milestone1;

  const [milestones, setMilestones] = useState<InstallmentMilestone[]>([
    {
      id: "m-1",
      milestoneName: "Down Payment / Deposit (بیعانه اولیه)",
      milestoneNameDari: "پیش پرداخت و بیعانه قطعی",
      dueDate: "Immediate / امروز",
      amountUsd: deposit,
      status: "PAID",
      paidDate: "Today",
    },
    {
      id: "m-2",
      milestoneName: "Milestone 1 - Customs & Title Delivery",
      milestoneNameDari: "قسط اول - تسلیمی مکتوب گمرک و اسناد",
      dueDate: "In 30 Days (۳۰ روز بعد)",
      amountUsd: milestone1,
      status: "PENDING",
    },
    {
      id: "m-3",
      milestoneName: "Milestone 2 - Traffic Registration Conveyance",
      milestoneNameDari: "قسط دوم - تکمیل پلیت و ثبت ترافیک",
      dueDate: "In 60 Days (۶۰ روز بعد)",
      amountUsd: milestone2,
      status: "PENDING",
    },
  ]);

  if (!isOpen) return null;

  const handleToggleMilestone = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status: m.status === "PAID" ? "PENDING" : "PAID",
              paidDate: m.status === "PAID" ? undefined : new Date().toLocaleDateString("en-US"),
            }
          : m
      )
    );
  };

  const generateWhatsAppReminder = (m: InstallmentMilestone) => {
    const amountAfn = Math.round(m.amountUsd * lockedRate);
    const text = `محترم ${customerName} صاحب،
سلام و احترام از طرف نندارتون موتر سدوزی هرات.
یادآوری بابت موعد قسط موتر ${vehicle.year} ${vehicle.make} ${vehicle.model} (استاک ${vehicle.stockNumber}):
💵 مبلغ قسط: $${m.amountUsd.toLocaleString()} دالر (معادل ${amountAfn.toLocaleString()} افغانی)
📅 تاریخ سررسید: ${m.dueDate}
🏛️ نحوه تسویه: صرافی مارکیت خراسان یا نقد در دفتر نمایشگاه.
تشکر از اعتماد شما!`;

    return `https://wa.me/${customerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(text)}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-navy-950 sm:p-8 print:w-full print:max-w-none print:shadow-none print:p-6 print:text-black">
        {/* Header (Hidden in Print) */}
        <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold">
              <Banknote className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Sarrafi Settlement & Installment Ledger (تسویه حساب صرافی و اقساط)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Khorasan Market hawala vouchers, exchange rate lock, and milestone schedule
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MuiButton
              variant="contained"
              color="primary"
              size="small"
              onClick={handlePrint}
              startIcon={<Printer className="h-4 w-4" />}
            >
              Print Settlement Slip (چاپ رسید)
            </MuiButton>
            <IconButton size="small" onClick={onClose}>
              <X className="h-5 w-5" />
            </IconButton>
          </div>
        </div>

        {/* Content Container */}
        <div className="mt-6 space-y-6 text-xs text-slate-800 dark:text-slate-200 print:text-black">
          {/* Top Settlement Summary Banner */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-navy-900 print:bg-gray-50 print:border-gray-400">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Vehicle Deal</span>
                <p className="text-lg font-black text-slate-950 dark:text-white print:text-black font-mono">
                  ${vehicle.sellingPrice.toLocaleString()} USD
                </p>
                <span className="text-[10px] text-slate-500">قیمت نهایی موتر</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Locked Rate (Sarrafi)</span>
                <p className="text-lg font-black text-slate-950 dark:text-white print:text-black font-mono">
                  1 USD = {lockedRate} AFN
                </p>
                <span className="text-[10px] text-slate-500">نرخ اسعار قفل شده</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Equivalent AFN</span>
                <p className="text-lg font-black text-gold print:text-black font-mono">
                  {Math.round(vehicle.sellingPrice * lockedRate).toLocaleString()} AFN
                </p>
                <span className="text-[10px] text-slate-500">معادل به افغانی</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Paid to Date</span>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  $
                  {milestones
                    .filter((m) => m.status === "PAID")
                    .reduce((sum, m) => sum + m.amountUsd, 0)
                    .toLocaleString()}{" "}
                  USD
                </p>
                <span className="text-[10px] text-slate-500">مجموع دریافتی تاکنون</span>
              </div>
            </div>
          </div>

          {/* Form Configuration Strip (Hidden in Print) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
            <MuiTextField
              select
              label="Settlement Channel (کانال تسویه مالی)"
              sizeVariant="small"
              value={paymentChannel}
              onChange={(e) => setPaymentChannel(e.target.value as any)}
            >
              <MenuItem value="SARRAFI">Khorasan Market Sarrafi (حواله صرافی خراسان)</MenuItem>
              <MenuItem value="CASH_SHOWROOM">Cash at Showroom Desk (نقد در نمایشگاه)</MenuItem>
              <MenuItem value="BANK_TRANSFER">Bank Wire (انتقال بانکی AIB / افغانستان بانک)</MenuItem>
              <MenuItem value="INSTALLMENT_PLAN">Milestone Installments (اقساط ماهوار)</MenuItem>
            </MuiTextField>

            <MuiTextField
              label="Sarraf / Exchange Office (نام صرافی)"
              sizeVariant="small"
              value={sarrafName}
              onChange={(e) => setSarrafName(e.target.value)}
            />

            <MuiTextField
              label="Hawala Voucher Number (نمبر سند حواله)"
              sizeVariant="small"
              value={hawalaVoucherNumber}
              onChange={(e) => setHawalaVoucherNumber(e.target.value)}
            />
          </div>

          {/* Buyer Particulars Card */}
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-navy-900/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-white dark:bg-gold dark:text-slate-950 font-bold">
                <User className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-mono">
                  Buyer Account & Contact
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-xs">
                  {customerName} • {customerTazkira}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">
                WhatsApp Notification Line
              </span>
              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {customerPhone}
              </span>
            </div>
          </div>

          {/* Milestone Schedule Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gold" />
                <span>Milestone Payment Schedule & Due Dates (جدول اقساط و موعدها)</span>
              </h4>
              <span className="text-[11px] text-slate-400">
                Click status tag to toggle PAID / PENDING
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 print:border-gray-400">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 font-bold dark:bg-navy-900 print:bg-gray-100">
                  <tr>
                    <th className="p-3.5">Milestone Description (شرح قسط)</th>
                    <th className="p-3.5">Due Date (موعد پرداخت)</th>
                    <th className="p-3.5">Amount (USD)</th>
                    <th className="p-3.5">Amount (AFN)</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right print:hidden">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 print:divide-gray-300">
                  {milestones.map((m) => (
                    <tr
                      key={m.id}
                      className={
                        m.status === "PAID"
                          ? "bg-emerald-50/40 dark:bg-emerald-950/20"
                          : ""
                      }
                    >
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {m.milestoneName}
                        </span>
                        <span className="text-[10px] font-dari text-slate-500">
                          {m.milestoneNameDari}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                        {m.dueDate}
                      </td>

                      <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                        ${m.amountUsd.toLocaleString()}
                      </td>

                      <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                        {Math.round(m.amountUsd * lockedRate).toLocaleString()} AFN
                      </td>

                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleToggleMilestone(m.id)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold cursor-pointer transition-colors ${
                            m.status === "PAID"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {m.status === "PAID" ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              <span>PAID (پرداخت شد)</span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3" />
                              <span>PENDING (باقی‌مانده)</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="p-3.5 text-right print:hidden">
                        {m.status !== "PAID" && (
                          <a
                            href={generateWhatsAppReminder(m)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-emerald-500 transition-colors"
                          >
                            <Send className="h-3 w-3" />
                            <span>WhatsApp Reminder</span>
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Official Signatures (Visible on Print) */}
          <div className="hidden print:grid grid-cols-3 gap-6 pt-8 text-center text-xs">
            <div className="border-t border-slate-400 pt-2">
              <span className="font-bold">Dealership Accountant (مدیر مالی)</span>
              <p className="text-[10px] text-gray-500 mt-1">Sadozai Motors Herat</p>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <span className="font-bold">Sarraf Agent (نماینده صرافی خراسان)</span>
              <p className="text-[10px] text-gray-500 mt-1">تاییدیه حواله و رسید بانکی</p>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <span className="font-bold">Purchaser / Buyer (خریدار محترم)</span>
              <p className="text-[10px] text-gray-500 mt-1">امضاء و اثر انگشت</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
