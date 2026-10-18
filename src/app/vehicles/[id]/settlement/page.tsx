"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import {
  MuiCard,
  MuiButton,
  MuiChip,
  MuiTextField,
  MenuItem,
  IconButton,
} from "@/components/mui";
import {
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  ArrowLeft,
  Send,
  User,
  ShieldCheck,
  Share2,
  DollarSign,
  Car,
} from "lucide-react";

interface InstallmentMilestone {
  id: string;
  milestoneName: string;
  milestoneNameDari: string;
  dueDate: string;
  amountUsd: number;
  status: "PAID" | "PENDING" | "OVERDUE";
  paidDate?: string;
}

export default function SarrafiSettlementPage() {
  const params = useParams();
  const vehicleId = params?.id as string;
  const { vehicles, exchangeRate, language, addToast } = useShowroomStore();
  const t = translations[language];

  const vehicle = vehicles.find((v) => v.id === vehicleId) || vehicles[0];

  const [paymentChannel, setPaymentChannel] = useState<
    "SARRAFI" | "CASH_SHOWROOM" | "BANK_TRANSFER" | "INSTALLMENT_PLAN"
  >("SARRAFI");

  const [sarrafName, setSarrafName] = useState(
    "Sarrafi Haji Mohammad & Sons (صرافی حاجی محمد و پسران)"
  );
  const [sarrafMarket, setSarrafMarket] = useState("Khorasan Market, Shop 42, Herat");
  const [hawalaVoucherNumber, setHawalaVoucherNumber] = useState(
    `HWL-KHR-2026-${(vehicle?.stockNumber || "SM-HRT-882").replace("SM-HRT-", "")}77`
  );
  const [customerName, setCustomerName] = useState("Haji Abdul Qadir Karimi");
  const [customerPhone, setCustomerPhone] = useState("+93799887766");
  const [customerTazkira, setCustomerTazkira] = useState("HRT-1402-984210");
  const [lockedRate, setLockedRate] = useState(exchangeRate || 70.5);

  const totalAmount = vehicle?.sellingPrice || 45000;
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

  if (!vehicle) {
    return (
      <div className="p-8 text-center text-slate-500">
        Vehicle not found.{" "}
        <Link href="/inventory" className="text-primary underline">
          Return to inventory
        </Link>
      </div>
    );
  }

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
    addToast("Updated milestone installment payment status!", "success");
  };

  const generateWhatsAppReminder = (m: InstallmentMilestone) => {
    const amountAfn = Math.round(m.amountUsd * lockedRate);
    const text = `محترم ${customerName} صاحب،
سلام و احترام از طرف نندارتون موتر سدوزی هرات.
یادآوری بابت موعد قسط موتر ${vehicle.year} ${vehicle.make} ${vehicle.model} (استاک ${vehicle.stockNumber}):
💵 مبلغ قسط: $${m.amountUsd.toLocaleString()} دالر (معادل ${amountAfn.toLocaleString()} افغانی)
📅 تاریخ سررسید: ${m.dueDate}
🏛️ نحوه تسویه: ${sarrafName} (${sarrafMarket}) یا نقد در دفتر نمایشگاه.
تشکر از اعتماد شما!`;

    return `https://wa.me/${customerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(text)}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const totalPaidUSD = milestones
    .filter((m) => m.status === "PAID")
    .reduce((sum, m) => sum + m.amountUsd, 0);

  const totalRemainingUSD = totalAmount - totalPaidUSD;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Top Navigation & Breadcrumbs (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/" className="hover:text-primary transition-colors">
              Cockpit
            </Link>
            <span>/</span>
            <Link href="/inventory" className="hover:text-primary transition-colors">
              Inventory
            </Link>
            <span>/</span>
            <Link href={`/vehicles/${vehicle.id}`} className="hover:text-primary transition-colors">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">
              Sarrafi Settlement
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Banknote className="h-6 w-6 text-emerald-600" />
            Sarrafi Settlement & Installment Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ثبت و مدیریت اسناد تسویه حساب صرافی مارکیت خراسان، قفل نرخ اسعار و جدول سررسید اقساط
          </p>
        </div>

        <div className="flex items-center gap-3">
          <MuiButton
            component={Link}
            href={`/vehicles/${vehicle.id}`}
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Vehicle
          </MuiButton>
          <MuiButton
            variant="contained"
            color="primary"
            size="medium"
            onClick={handlePrint}
            startIcon={<Printer className="h-4 w-4" />}
          >
            Print Settlement Slip (چاپ رسید)
          </MuiButton>
        </div>
      </div>

      {/* Main Ledger Sheet */}
      <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-lg border border-slate-200 dark:border-slate-800 dark:bg-[#111827] text-slate-900 dark:text-slate-100 print:bg-white print:text-black print:border-none print:shadow-none print:p-0 space-y-6">
        {/* Deal Summary KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Total Agreed Deal
            </span>
            <p className="mt-1 text-xl font-black text-slate-900 dark:text-white print:text-black font-mono">
              ${totalAmount.toLocaleString()} USD
            </p>
            <span className="text-[10px] text-slate-500">قیمت نهایی موتر</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Locked Sarrafi Rate
            </span>
            <p className="mt-1 text-xl font-black text-slate-900 dark:text-white print:text-black font-mono">
              1 USD = {lockedRate} AFN
            </p>
            <span className="text-[10px] text-slate-500">نرخ توافق شده صرافی</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Paid to Date
            </span>
            <p className="mt-1 text-xl font-black text-emerald-600 font-mono">
              ${totalPaidUSD.toLocaleString()} USD
            </p>
            <span className="text-[10px] text-slate-500">مجموع دریافتی تاکنون</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Remaining Balance
            </span>
            <p className="mt-1 text-xl font-black text-primary font-mono">
              ${totalRemainingUSD.toLocaleString()} USD
            </p>
            <span className="text-[10px] text-slate-500">
              (؋ {(totalRemainingUSD * lockedRate).toLocaleString()} AFN)
            </span>
          </div>
        </div>

        {/* Configuration Strip (Hidden in Print) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <MuiTextField
            select
            label="Payment Channel (کانال تسویه مالی)"
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
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
              <User className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-mono">
                Buyer Dossier & National ID
              </span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {customerName} • {customerTazkira}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">
              Vehicle Stock Reference
            </span>
            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
              {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.stockNumber})
            </span>
          </div>
        </div>

        {/* Milestone Schedule Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Milestone Payment Schedule & Due Dates (جدول اقساط و موعدها)</span>
            </h3>
            <span className="text-xs text-slate-400 print:hidden">
              Click status tag to toggle PAID / PENDING
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 print:border-gray-400">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold print:bg-gray-100">
                <tr>
                  <th className="p-3.5">Milestone Description (شرح قسط)</th>
                  <th className="p-3.5">Due Date (موعد پرداخت)</th>
                  <th className="p-3.5">Amount (USD)</th>
                  <th className="p-3.5">Amount (AFN)</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right print:hidden">WhatsApp Notice</th>
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
                      {m.status !== "PAID" ? (
                        <a
                          href={generateWhatsAppReminder(m)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-2xs"
                        >
                          <Send className="h-3 w-3" />
                          <span>WhatsApp Reminder</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-semibold">
                          Settled ✓
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Official Signatures (Visible on Print) */}
        <div className="hidden print:grid grid-cols-3 gap-6 pt-10 text-center text-xs">
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
  );
}
