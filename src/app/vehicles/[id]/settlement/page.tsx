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
    <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 space-y-4">
      {/* Top Navigation & Breadcrumbs (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800 print:hidden">
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
            <Link href={`/vehicles/${vehicle.id}`} className="hover:text-primary transition-colors">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">
              Sarrafi Settlement
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Banknote className="h-5 w-5 text-emerald-600" />
            Sarrafi Settlement & Installment Ledger
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            ثبت و مدیریت اسناد تسویه حساب صرافی مارکیت خراسان، قفل نرخ اسعار و جدول سررسید اقساط
          </p>
        </div>

        <div className="flex items-center gap-2">
          <MuiButton
            component={Link}
            href={`/vehicles/${vehicle.id}`}
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<ArrowLeft className="h-3.5 w-3.5" />}
            sx={{ fontSize: "11px", py: "3px" }}
          >
            Back to Vehicle
          </MuiButton>
          <MuiButton
            variant="contained"
            color="primary"
            size="small"
            onClick={handlePrint}
            startIcon={<Printer className="h-3.5 w-3.5" />}
            sx={{ fontSize: "11px", py: "3px" }}
          >
            Print Settlement Slip
          </MuiButton>
        </div>
      </div>

      {/* Main Ledger Sheet */}
      <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-xs border border-slate-200/90 dark:border-slate-800/90 dark:bg-[#111827] text-slate-900 dark:text-slate-100 print:bg-white print:text-black print:border-none print:shadow-none print:p-0 space-y-4">
        {/* Deal Summary KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Total Agreed Deal
            </span>
            <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white print:text-black font-mono">
              ${totalAmount.toLocaleString()} USD
            </p>
            <span className="text-[10px] text-slate-500">قیمت نهایی موتر</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Locked Sarrafi Rate
            </span>
            <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white print:text-black font-mono">
              1 USD = {lockedRate} AFN
            </p>
            <span className="text-[10px] text-slate-500">نرخ توافق شده صرافی</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Paid to Date
            </span>
            <p className="mt-1 text-lg font-extrabold text-emerald-600 font-mono">
              ${totalPaidUSD.toLocaleString()} USD
            </p>
            <span className="text-[10px] text-slate-500">مجموع دریافتی تاکنون</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Remaining Balance
            </span>
            <p className="mt-1 text-lg font-extrabold text-primary font-mono">
              ${totalRemainingUSD.toLocaleString()} USD
            </p>
            <span className="text-[10px] text-slate-500">
              (؋ {(totalRemainingUSD * lockedRate).toLocaleString()} AFN)
            </span>
          </div>
        </div>

        {/* Configuration Strip (Hidden in Print) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:hidden p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
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
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
              <User className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-mono">
                Buyer Dossier & National ID
              </span>
              <span className="font-bold text-slate-900 dark:text-white text-xs">
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>Milestone Payment Schedule (جدول اقساط و موعدها)</span>
            </h3>
            <span className="text-[10px] text-slate-400 print:hidden">
              Click status tag to toggle PAID / PENDING
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200/90 dark:border-slate-800/90 print:border-gray-400">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 font-bold print:bg-gray-100 border-b border-slate-200/90 dark:border-slate-800">
                <tr>
                  <th className="px-3 py-2 text-[11px]">Milestone Description</th>
                  <th className="px-3 py-2 text-[11px]">Due Date</th>
                  <th className="px-3 py-2 text-[11px]">Amount (USD)</th>
                  <th className="px-3 py-2 text-[11px]">Amount (AFN)</th>
                  <th className="px-3 py-2 text-center text-[11px]">Status</th>
                  <th className="px-3 py-2 text-right print:hidden text-[11px]">WhatsApp Notice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/80 print:divide-gray-300">
                {milestones.map((m) => (
                  <tr
                    key={m.id}
                    className={
                      m.status === "PAID"
                        ? "bg-emerald-50/30 dark:bg-emerald-950/20"
                        : ""
                    }
                  >
                    <td className="px-3 py-2">
                      <span className="font-bold text-slate-900 dark:text-white block text-xs">
                        {m.milestoneName}
                      </span>
                      <span className="text-[10px] font-dari text-slate-500">
                        {m.milestoneNameDari}
                      </span>
                    </td>

                    <td className="px-3 py-2 font-mono text-xs text-slate-700 dark:text-slate-300">
                      {m.dueDate}
                    </td>

                    <td className="px-3 py-2 font-mono font-bold text-slate-900 dark:text-white text-xs">
                      ${m.amountUsd.toLocaleString()}
                    </td>

                    <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-300 text-xs">
                      {Math.round(m.amountUsd * lockedRate).toLocaleString()} AFN
                    </td>

                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleToggleMilestone(m.id)}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold cursor-pointer transition-colors ${
                          m.status === "PAID"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {m.status === "PAID" ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            <span>PAID</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" />
                            <span>PENDING</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-3 py-2 text-right print:hidden">
                      {m.status !== "PAID" ? (
                        <a
                          href={generateWhatsAppReminder(m)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-emerald-500 transition-colors shadow-2xs"
                        >
                          <Send className="h-3 w-3" />
                          <span>WhatsApp</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-semibold font-mono">
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
