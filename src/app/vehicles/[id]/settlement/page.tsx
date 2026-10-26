"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useShowroomStore } from "@/store/useShowroomStore";
import {
  MuiButton,
  MuiTextField,
  MenuItem,
  IconButton,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@/components/mui";
import {
  Banknote,
  Clock,
  Printer,
  ArrowLeft,
  Send,
  ShieldCheck,
  DollarSign,
  Plus,
  Trash2,
  Save,
  Loader2,
} from "lucide-react";

interface InstallmentMilestone {
  id: string;
  milestoneName: string;
  milestoneNameDari: string;
  dueDate: string;
  amountUsd: number;
  status: "PAID" | "PENDING" | "OVERDUE";
  paidDate?: string;
  voucherId?: string;
}

export default function SarrafiSettlementPage() {
  const params = useParams();
  const vehicleId = params?.id as string;
  const { data: session } = useSession();
  const {
    vehicles,
    sales,
    customers,
    payments,
    exchangeRate,
    language,
    currentRole,
    branding,
    addPaymentVoucher,
    updateSale,
    addSale,
    addToast,
  } = useShowroomStore();

  const vehicle = vehicles.find((v) => v.id === vehicleId);
  const existingSale = sales.find(
    (s) => vehicle && s.stockNumber === vehicle.stockNumber
  );
  const matchedCustomer = customers.find(
    (c) =>
      (vehicle && c.interestedInVehicleId === vehicle.id) ||
      (existingSale &&
        (c.fullName.toLowerCase() === existingSale.customerName.toLowerCase() ||
          c.phone === existingSale.customerPhone))
  );

  const shortCode = branding?.dealershipShortCode || "ARIA";
  const dealershipName = branding?.dealershipName || "Aria Motors";
  const dealershipNameFa = branding?.dealershipNameFa || "آریا موتورز";

  const [paymentChannel, setPaymentChannel] = useState<
    "SARRAFI" | "CASH_SHOWROOM" | "BANK_TRANSFER" | "INSTALLMENT_PLAN"
  >("SARRAFI");

  const [sarrafName, setSarrafName] = useState("Khorasan Sarrafi Exchange");
  const [sarrafMarket] = useState("Herat Khorasan Market");
  const [hawalaVoucherNumber, setHawalaVoucherNumber] = useState(
    `HWL-${shortCode}-${(vehicle?.stockNumber || "001")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(-5)}`
  );
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerTazkira, setCustomerTazkira] = useState("");
  const [lockedRate, setLockedRate] = useState(exchangeRate || 70.5);
  const [initialized, setInitialized] = useState(false);
  const [syncingLedger, setSyncingLedger] = useState(false);

  const totalAmount = existingSale?.salePriceUSD || vehicle?.sellingPrice || 45000;
  const defaultDeposit = Math.round(totalAmount * 0.4);
  const defaultM1 = Math.round(totalAmount * 0.3);
  const defaultM2 = totalAmount - defaultDeposit - defaultM1;

  const [milestones, setMilestones] = useState<InstallmentMilestone[]>([
    {
      id: "m-1",
      milestoneName: "Down Payment / Deposit (بیعانه اولیه)",
      milestoneNameDari: "پیش پرداخت و بیعانه قطعی",
      dueDate: "Immediate / امروز",
      amountUsd: defaultDeposit,
      status: "PAID",
      paidDate: "Today",
    },
    {
      id: "m-2",
      milestoneName: "Milestone 1 - Customs & Title Delivery",
      milestoneNameDari: "قسط اول - تسلیمی مکتوب گمرک و اسناد",
      dueDate: "In 30 Days (۳۰ روز بعد)",
      amountUsd: defaultM1,
      status: "PENDING",
    },
    {
      id: "m-3",
      milestoneName: "Milestone 2 - Traffic Registration Conveyance",
      milestoneNameDari: "قسط دوم - تکمیل پلیت و ثبت ترافیک",
      dueDate: "In 60 Days (۶۰ روز بعد)",
      amountUsd: defaultM2,
      status: "PENDING",
    },
  ]);

  // Pre-fill buyer details & recorded payment vouchers from store once loaded
  useEffect(() => {
    if (!vehicle || initialized) return;

    const vehicleVouchers = payments.filter(
      (p) =>
        p.vehicleStock === vehicle.stockNumber &&
        p.voucherType === "CUSTOMER_PAYMENT"
    );

    if (existingSale) {
      setCustomerName(existingSale.customerName || "");
      setCustomerPhone(existingSale.customerPhone || "");
      setCustomerTazkira(existingSale.customerTazkira || "");
      setLockedRate(existingSale.exchangeRate || exchangeRate || 70.5);
      if (existingSale.paymentType === "Installment Plan") {
        setPaymentChannel("INSTALLMENT_PLAN");
      } else if (existingSale.paymentType === "Full Cash") {
        setPaymentChannel("CASH_SHOWROOM");
      }
    } else if (matchedCustomer) {
      setCustomerName(matchedCustomer.fullName || "");
      setCustomerPhone(matchedCustomer.phone || "");
      setCustomerTazkira(matchedCustomer.tazkiraNumber || "");
    }

    if (vehicleVouchers.length > 0) {
      const voucherMilestones: InstallmentMilestone[] = vehicleVouchers.map(
        (v, idx) => ({
          id: `voucher-${v.id}`,
          milestoneName: v.purpose || `Recorded Receipt #${idx + 1} (${v.voucherNumber})`,
          milestoneNameDari: `رسید ثبت‌شده شماره ${v.voucherNumber}`,
          dueDate: v.date,
          amountUsd: v.amountUSD,
          status: "PAID",
          paidDate: v.date,
          voucherId: v.id,
        })
      );
      const paidSum = voucherMilestones.reduce((s, m) => s + m.amountUsd, 0);
      const targetTotal = existingSale?.salePriceUSD || vehicle.sellingPrice;
      if (paidSum < targetTotal) {
        const remaining = targetTotal - paidSum;
        const count = Math.max(1, existingSale?.installmentsRemaining || 2);
        const each = Math.round(remaining / count);
        for (let i = 0; i < count; i++) {
          const amt = i === count - 1 ? remaining - each * (count - 1) : each;
          voucherMilestones.push({
            id: `pending-${i + 1}`,
            milestoneName: `Scheduled Installment Qist #${i + 1}`,
            milestoneNameDari: `قسط بعدی شماره ${i + 1}`,
            dueDate: `In ${(i + 1) * 30} Days`,
            amountUsd: amt,
            status: "PENDING",
          });
        }
      }
      setMilestones(voucherMilestones);
      if (vehicleVouchers[0]?.referenceNumber) {
        setHawalaVoucherNumber(vehicleVouchers[0].referenceNumber);
      }
    } else if (existingSale) {
      const paid = existingSale.downPaymentUSD || 0;
      const rem = Math.max(0, existingSale.salePriceUSD - paid);
      const nextList: InstallmentMilestone[] = [];
      if (paid > 0) {
        nextList.push({
          id: "sale-down",
          milestoneName: "Recorded Contract Down Payment",
          milestoneNameDari: "پیش‌پرداخت ثبت‌شده قرارداد",
          dueDate: existingSale.saleDate.slice(0, 10),
          amountUsd: paid,
          status: "PAID",
          paidDate: existingSale.saleDate.slice(0, 10),
        });
      }
      if (rem > 0) {
        nextList.push({
          id: "sale-rem",
          milestoneName: "Remaining Contract Balance",
          milestoneNameDari: "متباقی وجه قرارداد",
          dueDate: "In 30 Days",
          amountUsd: rem,
          status: "PENDING",
        });
      }
      if (nextList.length > 0) setMilestones(nextList);
    }

    setInitialized(true);
  }, [exchangeRate, existingSale, initialized, matchedCustomer, payments, vehicle]);

  // Modal State for Adding Custom Installment
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMilestoneName, setNewMilestoneName] = useState("");
  const [newMilestoneNameDari, setNewMilestoneNameDari] = useState("");
  const [newDueDate, setNewDueDate] = useState("In 90 Days");
  const [newAmountUsd, setNewAmountUsd] = useState(5000);

  const totalPaidUSD = useMemo(
    () =>
      milestones
        .filter((m) => m.status === "PAID")
        .reduce((sum, m) => sum + m.amountUsd, 0),
    [milestones]
  );

  const totalRemainingUSD = Math.max(0, totalAmount - totalPaidUSD);
  const progressPercent = Math.min(
    100,
    Math.round((totalPaidUSD / (totalAmount || 1)) * 100)
  );

  const handleToggleMilestone = async (milestone: InstallmentMilestone) => {
    if (!vehicle) return;
    const markingPaid = milestone.status !== "PAID";
    const todayIso = new Date().toISOString().split("T")[0];

    setMilestones((prev) =>
      prev.map((m) =>
        m.id === milestone.id
          ? {
              ...m,
              status: markingPaid ? "PAID" : "PENDING",
              paidDate: markingPaid ? todayIso : undefined,
            }
          : m
      )
    );

    if (markingPaid && !milestone.voucherId && customerName.trim()) {
      try {
        await addPaymentVoucher({
          voucherType: "CUSTOMER_PAYMENT",
          date: todayIso,
          partyName: customerName.trim(),
          partyPhone: customerPhone.trim(),
          partyTazkira: customerTazkira.trim(),
          amountUSD: milestone.amountUsd,
          amountAFN: Math.round(milestone.amountUsd * lockedRate),
          exchangeRate: lockedRate,
          paymentMethod:
            paymentChannel === "CASH_SHOWROOM"
              ? "Cash (صندوق)"
              : "Sarrafi Hawala (حواله صرافی)",
          sarrafiAccount: sarrafName,
          referenceNumber: hawalaVoucherNumber,
          vehicleStock: vehicle.stockNumber,
          purpose: `${milestone.milestoneName} (${vehicle.year} ${vehicle.make} ${vehicle.model})`,
          recordedBy: session?.user?.name || branding?.authorizedSignatory || "Sarrafi Desk",
        });
      } catch {
        // Non-blocking if offline; local state still reflects toggle
      }
    }

    addToast(
      markingPaid
        ? `Marked $${milestone.amountUsd.toLocaleString()} USD milestone PAID`
        : "Reverted milestone status to PENDING",
      "success"
    );
  };

  const handleSyncSettlementLedger = async () => {
    if (!vehicle) return;
    if (!customerName.trim() || !customerPhone.trim()) {
      addToast("Please enter Buyer Name and Phone before syncing settlement.", "warning");
      return;
    }

    setSyncingLedger(true);
    const pendingCount = milestones.filter((m) => m.status !== "PAID").length;
    const isCompleted = totalPaidUSD >= totalAmount || pendingCount === 0;

    try {
      if (existingSale) {
        await updateSale(existingSale.id, {
          downPaymentUSD: Math.min(totalAmount, totalPaidUSD),
          installmentsRemaining: isCompleted ? 0 : Math.max(1, pendingCount),
          status: isCompleted ? "Completed" : "Pending Installments",
        });
      } else {
        await addSale({
          stockNumber: vehicle.stockNumber,
          vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerTazkira: customerTazkira.trim() || "PENDING",
          salesAgent: session?.user?.name || branding?.authorizedSignatory || "Sales Desk",
          salePriceUSD: totalAmount,
          exchangeRate: lockedRate,
          paymentType:
            paymentChannel === "CASH_SHOWROOM"
              ? "Full Cash"
              : paymentChannel === "INSTALLMENT_PLAN" || !isCompleted
              ? "Installment Plan"
              : "Hawala / Bank Transfer",
          downPaymentUSD: Math.min(totalAmount, totalPaidUSD),
          installmentsRemaining: isCompleted ? 0 : Math.max(1, pendingCount),
          status: isCompleted ? "Completed" : "Pending Installments",
        });
      }
      addToast("Synced Sarrafi settlement & installment schedule to ledger!", "success");
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Failed to sync settlement record",
        "error"
      );
    } finally {
      setSyncingLedger(false);
    }
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneName.trim() || newAmountUsd <= 0) {
      addToast("Please provide milestone name and valid amount", "warning");
      return;
    }

    const newMilestone: InstallmentMilestone = {
      id: `m-${Date.now()}`,
      milestoneName: newMilestoneName,
      milestoneNameDari: newMilestoneNameDari || newMilestoneName,
      dueDate: newDueDate,
      amountUsd: Number(newAmountUsd),
      status: "PENDING",
    };

    setMilestones((prev) => [...prev, newMilestone]);
    setIsAddModalOpen(false);
    setNewMilestoneName("");
    setNewMilestoneNameDari("");
    addToast(`Added installment milestone: ${newMilestoneName}`, "success");
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
    addToast("Milestone installment removed", "info");
  };

  const generateWhatsAppReminder = (m: InstallmentMilestone) => {
    const amountAfn = Math.round(m.amountUsd * lockedRate);
    const text = `محترم ${customerName || "خریدار گرامی"}،
سلام و احترام از طرف ${dealershipNameFa} (${dealershipName}).
یادآوری بابت موعد قسط موتر ${vehicle?.year} ${vehicle?.make} ${vehicle?.model} (استاک ${vehicle?.stockNumber}):
💵 مبلغ قسط: $${m.amountUsd.toLocaleString()} دالر (معادل ${amountAfn.toLocaleString()} افغانی)
📅 تاریخ سررسید: ${m.dueDate}
🏛️ نحوه تسویه: ${sarrafName} (${sarrafMarket}) یا نقد در دفتر نمایشگاه.
تشکر از اعتماد شما!`;

    const phoneDigits = (customerPhone || branding?.whatsapp || "").replace(/[^0-9]/g, "");
    return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(text)}`;
  };

  const handlePrint = () => {
    window.print();
  };

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

  return (
    <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 space-y-4 pb-16">
      {/* Top Navigation & Breadcrumbs (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#E2E8F0] dark:border-[#262F40] print:hidden">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-0.5">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Cockpit
            </Link>
            <span>/</span>
            <Link href="/inventory" className="hover:text-blue-600 transition-colors">
              Inventory
            </Link>
            <span>/</span>
            <Link href={`/vehicles/${vehicle.id}`} className="hover:text-blue-600 transition-colors">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">
              Sarrafi Settlement
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Banknote className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Sarrafi Settlement &amp; Installment Ledger
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            ثبت و مدیریت اسناد تسویه حساب صرافی، قفل نرخ اسعار و جدول سررسید اقساط ({dealershipNameFa})
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <MuiButton
            component={Link}
            href={`/vehicles/${vehicle.id}`}
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />}
            sx={{ fontSize: "11px", py: "3px" }}
          >
            Back to Vehicle
          </MuiButton>
          <MuiButton
            variant="outlined"
            size="small"
            onClick={() => setIsAddModalOpen(true)}
            startIcon={<Plus className="h-3.5 w-3.5" />}
            sx={{ fontSize: "11px", py: "3px" }}
          >
            Add Milestone
          </MuiButton>
          {currentRole !== "SalesAgent" || !existingSale ? (
            <MuiButton
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => void handleSyncSettlementLedger()}
              disabled={syncingLedger}
              startIcon={
                syncingLedger ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )
              }
              sx={{ fontSize: "11px", py: "3px" }}
            >
              Save Settlement
            </MuiButton>
          ) : null}
          <MuiButton
            variant="contained"
            color="primary"
            size="small"
            onClick={handlePrint}
            startIcon={<Printer className="h-3.5 w-3.5" />}
            sx={{ fontSize: "11px", py: "3px" }}
          >
            Print Slip
          </MuiButton>
        </div>
      </div>

      {/* Main Ledger Sheet */}
      <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-xs border border-[#E2E8F0] dark:border-[#262F40] dark:bg-[#161B26] text-slate-900 dark:text-slate-100 print:bg-white print:text-black print:border-none print:shadow-none print:p-0 space-y-4">
        {/* Deal Summary KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-center tabular-nums">
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
            <p className="mt-1 text-lg font-extrabold text-blue-600 dark:text-blue-400 font-mono">
              ${totalRemainingUSD.toLocaleString()} USD
            </p>
            <span className="text-[10px] text-slate-500 font-mono">
              (؋ {(totalRemainingUSD * lockedRate).toLocaleString()} AFN)
            </span>
          </div>
        </div>

        {/* Visual Collection Progress Bar */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-1.5 print:hidden">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Banknote className="h-3.5 w-3.5 text-emerald-600" />
              Settlement Collection Status:
            </span>
            <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-bold">
              {progressPercent}% Settled (${totalPaidUSD.toLocaleString()} of ${totalAmount.toLocaleString()})
            </span>
          </div>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: "rgba(100, 116, 139, 0.15)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                backgroundColor: progressPercent === 100 ? "#10b981" : "#2563eb",
              },
            }}
          />
        </div>

        {/* Editable Buyer & Sarrafi Configuration Strip (Hidden in Print) */}
        <div className="space-y-3 print:hidden p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <MuiTextField
              select
              label="Payment Channel (کانال تسویه مالی)"
              sizeVariant="small"
              value={paymentChannel}
              onChange={(e) =>
                setPaymentChannel(
                  e.target.value as
                    | "SARRAFI"
                    | "CASH_SHOWROOM"
                    | "BANK_TRANSFER"
                    | "INSTALLMENT_PLAN"
                )
              }
            >
              <MenuItem value="SARRAFI">Sarrafi Hawala (حواله صرافی)</MenuItem>
              <MenuItem value="CASH_SHOWROOM">Cash at Showroom Safe (صندوق نقد)</MenuItem>
              <MenuItem value="BANK_TRANSFER">Bank Transfer (حساب بانکی)</MenuItem>
              <MenuItem value="INSTALLMENT_PLAN">Custom Milestone Plan (اقساطی)</MenuItem>
            </MuiTextField>

            <MuiTextField
              label="Sarrafi Exchange & Shop #"
              sizeVariant="small"
              value={sarrafName}
              onChange={(e) => setSarrafName(e.target.value)}
            />

            <MuiTextField
              label="Hawala Voucher Reference #"
              sizeVariant="small"
              value={hawalaVoucherNumber}
              onChange={(e) => setHawalaVoucherNumber(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
            <MuiTextField
              label="Buyer Full Name (نام خریدار)"
              sizeVariant="small"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <MuiTextField
              label="Buyer Tazkira ID (تذکره)"
              sizeVariant="small"
              value={customerTazkira}
              onChange={(e) => setCustomerTazkira(e.target.value)}
            />
            <MuiTextField
              label="Contact WhatsApp / Phone"
              sizeVariant="small"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
            <MuiTextField
              label="Locked FX Rate (AFN/USD)"
              type="number"
              sizeVariant="small"
              value={lockedRate}
              onChange={(e) => setLockedRate(Number(e.target.value) || exchangeRate)}
            />
          </div>
        </div>

        {/* Customer & Rate Summary Strip (Visible on Screen & Print) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Customer / Buyer
            </span>
            <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
              {customerName || "—"}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Buyer Tazkira ID
            </span>
            <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200 mt-0.5 block">
              {customerTazkira || "—"}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Contact WhatsApp
            </span>
            <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200 mt-0.5 block">
              {customerPhone || "—"}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Locked FX Rate
            </span>
            <span className="font-mono tabular-nums font-bold text-emerald-600 mt-0.5 block">
              1 USD = {lockedRate} AFN
            </span>
          </div>
        </div>

        {/* Milestone Installment Table */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Payment Milestones &amp; Hawala Maturities ({milestones.length} Installments)
            </h3>
            <span className="text-[10px] text-slate-400 print:hidden">
              Click status chip to record or toggle payment receipt
            </span>
          </div>

          <div className="space-y-2.5">
            {milestones.map((m, idx) => {
              const amountAfn = Math.round(m.amountUsd * lockedRate);
              const isPaid = m.status === "PAID";

              return (
                <div
                  key={m.id}
                  className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isPaid
                      ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60"
                      : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-mono tabular-nums font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {m.milestoneName}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-dari ps-7">
                      {m.milestoneNameDari}
                    </div>
                    <div className="text-[10px] text-slate-400 ps-7 flex items-center gap-1 font-mono tabular-nums">
                      <Clock className="h-3 w-3" />
                      <span>Due: {m.dueDate}</span>
                      {m.paidDate && (
                        <span className="text-emerald-600 font-semibold">
                          • Settled {m.paidDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 ps-7 sm:ps-0">
                    <div className="text-end tabular-nums">
                      <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                        ${m.amountUsd.toLocaleString()} USD
                      </div>
                      <div className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                        ؋ {amountAfn.toLocaleString()} AFN
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleToggleMilestone(m)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isPaid
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300"
                      }`}
                    >
                      {isPaid ? "✓ PAID" : "PENDING"}
                    </button>

                    <div className="flex items-center gap-1 print:hidden">
                      <a
                        href={generateWhatsAppReminder(m)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors"
                        title="Send WhatsApp Payment Reminder"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </a>
                      {milestones.length > 1 && (
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteMilestone(m.id)}
                          title="Remove milestone"
                          sx={{ p: 0.5 }}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-red-500" />
                        </IconButton>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Printable Official Sarrafi Market Endorsement Seal */}
        <div className="mt-6 pt-5 border-t-2 border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 space-y-0.5">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>{dealershipName} &amp; Sarrafi Exchange Endorsement</span>
            </div>
            <p className="text-[10px] font-dari">
              این سند جهت تسویه حساب قطعی معامله موتر صادر گردیده و مبالغ مندرج مورد تأیید صرافی و {dealershipNameFa} می‌باشد.
            </p>
          </div>

          <div className="p-3 rounded-xl border-2 border-emerald-600/40 bg-emerald-50/30 dark:bg-emerald-950/20 rotate-[-1deg] text-center shrink-0">
            <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              ★ {sarrafName} ★
            </div>
            <div className="text-xs font-black text-emerald-800 dark:text-emerald-300 font-mono">
              {progressPercent === 100 ? "SETTLED & ENDORSED" : "ACTIVE LEDGER"}
            </div>
            <div className="text-[8px] text-emerald-600 font-mono tabular-nums">
              Voucher: {hawalaVoucherNumber}
            </div>
          </div>
        </div>
      </div>

      {/* Add Custom Installment Milestone Dialog */}
      <Dialog open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: "14px", fontWeight: 700, pb: 1 }}>
          Add Installment Milestone
        </DialogTitle>
        <form onSubmit={handleAddMilestone}>
          <DialogContent sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <MuiTextField
              label="Milestone Description (English)"
              sizeVariant="small"
              value={newMilestoneName}
              onChange={(e) => setNewMilestoneName(e.target.value)}
              placeholder="e.g. Milestone 3 - Engine Warranty Inspection"
              required
            />
            <MuiTextField
              label="توضیح قسط به دری"
              sizeVariant="small"
              dir="rtl"
              value={newMilestoneNameDari}
              onChange={(e) => setNewMilestoneNameDari(e.target.value)}
              placeholder="مثلاً: قسط سوم - معاینه تخنیکی و تحویل سویچ"
            />
            <MuiTextField
              label="Due Date / Maturity"
              sizeVariant="small"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              placeholder="e.g. In 90 Days / ۳ ماه بعد"
              required
            />
            <MuiTextField
              label="Amount in USD"
              type="number"
              sizeVariant="small"
              value={newAmountUsd}
              onChange={(e) => setNewAmountUsd(Number(e.target.value))}
              startAdornment={<DollarSign className="h-3.5 w-3.5 text-slate-400" />}
              helperText={`≈ ${(newAmountUsd * lockedRate).toLocaleString()} AFN`}
              required
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <MuiButton variant="outlined" color="inherit" size="small" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </MuiButton>
            <MuiButton type="submit" variant="contained" color="primary" size="small">
              Add Milestone
            </MuiButton>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
