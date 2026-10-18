"use client";

import React, { useState } from "react";
import { useShowroomStore } from "@/store/useShowroomStore";
import {
  MuiCard,
  MuiButton,
  MuiChip,
  MuiTable,
  MuiTableHead,
  MuiTableBody,
  MuiTableRow,
  MuiTableCell,
  MuiTextField,
} from "@/components/mui";
import {
  Receipt,
  Plus,
  Search,
  DollarSign,
  Car,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  Building,
  ShieldCheck,
  TrendingDown,
  Truck,
  Wrench,
} from "lucide-react";

export function ExpensesTab() {
  const { expenses, vehicles, exchangeRate, addExpense } = useShowroomStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [isCreating, setIsCreating] = useState(false);

  // New Expense Form State
  const [category, setCategory] = useState<
    | "Gomrok & Port Tariffs"
    | "Transit & Ocean Freight"
    | "Vehicle Maintenance/Detailing"
    | "Showroom Overhead & Fuel"
    | "Staff Commissions"
  >("Gomrok & Port Tariffs");
  const [vehicleStock, setVehicleStock] = useState("");
  const [amountUSD, setAmountUSD] = useState<number>(2500);
  const [payee, setPayee] = useState("Islam Qala Customs Directorate (گمرک اسلام قلعه)");
  const [receiptNumber, setReceiptNumber] = useState("MKT-HRT-2026-");
  const [description, setDescription] = useState("Port clearance tariffs & legal maktoub stamps");

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      (e.payee && e.payee.toLowerCase().includes(search.toLowerCase())) ||
      (e.receiptNumber && e.receiptNumber.toLowerCase().includes(search.toLowerCase())) ||
      (e.vehicleStock && e.vehicleStock.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = categoryFilter === "all" || e.category === categoryFilter;
    const matchesVehicle =
      vehicleFilter === "all" ||
      (vehicleFilter === "overhead" && !e.vehicleStock) ||
      e.vehicleStock === vehicleFilter;

    return matchesSearch && matchesCategory && matchesVehicle;
  });

  const totalExpenseUSD = expenses.reduce((acc, e) => acc + e.amountUSD, 0);
  const totalExpenseAFN = Math.round(totalExpenseUSD * exchangeRate);

  const customsTotalUSD = expenses
    .filter((e) => e.category === "Gomrok & Port Tariffs")
    .reduce((acc, e) => acc + e.amountUSD, 0);

  const transitTotalUSD = expenses
    .filter((e) => e.category === "Transit & Ocean Freight")
    .reduce((acc, e) => acc + e.amountUSD, 0);

  const maintenanceTotalUSD = expenses
    .filter((e) => e.category === "Vehicle Maintenance/Detailing")
    .reduce((acc, e) => acc + e.amountUSD, 0);

  const overheadTotalUSD = expenses
    .filter((e) => e.category === "Showroom Overhead & Fuel" || e.category === "Staff Commissions")
    .reduce((acc, e) => acc + e.amountUSD, 0);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountUSD <= 0) return;

    addExpense({
      category,
      vehicleStock: vehicleStock ? vehicleStock : undefined,
      amountUSD: Number(amountUSD),
      description,
      payee: payee || undefined,
      receiptNumber: receiptNumber || undefined,
    });

    // Reset Form
    setDescription("");
    setReceiptNumber("MKT-HRT-2026-");
    setIsCreating(false);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Gomrok & Port Tariffs":
        return "primary";
      case "Transit & Ocean Freight":
        return "info";
      case "Vehicle Maintenance/Detailing":
        return "warning";
      case "Showroom Overhead & Fuel":
        return "default";
      case "Staff Commissions":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Expense KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MuiCard elevation={1} className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Expenses (مجموع مصارف)
            </span>
            <span className="rounded-full bg-rose-50 dark:bg-rose-950/40 p-1.5 text-rose-600 dark:text-rose-400">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
            ${totalExpenseUSD.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-mono">
            ؋ {totalExpenseAFN.toLocaleString()} AFN (@ {exchangeRate})
          </p>
        </MuiCard>

        <MuiCard elevation={1} className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Islam Qala Customs (تعرفه گمرکی)
            </span>
            <span className="rounded-full bg-blue-50 dark:bg-blue-950/40 p-1.5 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">
            ${customsTotalUSD.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Official border tariff clearance
          </p>
        </MuiCard>

        <MuiCard elevation={1} className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Freight & Transit (کرایه و ترانزیت)
            </span>
            <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/40 p-1.5 text-indigo-600 dark:text-indigo-400">
              <Truck className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">
            ${transitTotalUSD.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Bandar Abbas & overland car-carrier trailers
          </p>
        </MuiCard>

        <MuiCard elevation={1} className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Detailing & Operations
            </span>
            <span className="rounded-full bg-amber-50 dark:bg-amber-950/40 p-1.5 text-amber-600 dark:text-amber-400">
              <Wrench className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">
            ${(maintenanceTotalUSD + overheadTotalUSD).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Showroom overhead, fuel & vehicle polish
          </p>
        </MuiCard>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search description, payee, receipt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 outline-none focus:border-[#1976D2] dark:border-slate-700 dark:bg-[#121824] dark:text-white"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#1976D2] dark:border-slate-700 dark:bg-[#121824] dark:text-white"
          >
            <option value="all">All Categories</option>
            <option value="Gomrok & Port Tariffs">Gomrok & Port Tariffs</option>
            <option value="Transit & Ocean Freight">Transit & Ocean Freight</option>
            <option value="Vehicle Maintenance/Detailing">Maintenance & Detailing</option>
            <option value="Showroom Overhead & Fuel">Showroom Overhead & Fuel</option>
            <option value="Staff Commissions">Staff Commissions</option>
          </select>

          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#1976D2] dark:border-slate-700 dark:bg-[#121824] dark:text-white"
          >
            <option value="all">All Vehicle Cost Allocations</option>
            <option value="overhead">Showroom General Overhead (Unallocated)</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.stockNumber}>
                {v.stockNumber} - {v.year} {v.make} {v.model}
              </option>
            ))}
          </select>
        </div>

        <MuiButton
          variant={isCreating ? "outlined" : "contained"}
          color="primary"
          size="small"
          onClick={() => setIsCreating(!isCreating)}
          startIcon={isCreating ? undefined : <Plus className="h-4 w-4" />}
        >
          {isCreating ? "Cancel" : "Book Vehicle Cost / Expense"}
        </MuiButton>
      </div>

      {/* Direct Landed Cost Allocation Notice Banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3.5 text-xs text-blue-900 dark:border-blue-900/60 dark:bg-[#111c30] dark:text-blue-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Car className="h-4 w-4 text-[#1976D2] shrink-0" />
          <span>
            <strong>Direct Landed Cost Engine:</strong> Assigning an expense to a specific <strong>Stock #</strong> dynamically updates the landed purchase cost of that vehicle in real time, accurately computing net gross margins on sale.
          </span>
        </div>
      </div>

      {/* Expandable Expense Booking Form */}
      {isCreating && (
        <MuiCard elevation={2} className="p-6 border border-blue-200 dark:border-blue-900/50 bg-blue-50/20 dark:bg-[#121b2d]">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="h-5 w-5 text-[#1976D2]" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Book Expense / Vehicle Cost Allocation Voucher (ثبت مصرف و هزینه موتر)
            </h3>
          </div>

          <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Expense Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-[#121824] dark:text-white outline-none focus:border-[#1976D2]"
                >
                  <option value="Gomrok & Port Tariffs">Gomrok & Port Tariffs (Herat Islam Qala)</option>
                  <option value="Transit & Ocean Freight">Transit & Ocean Freight (Bandar Abbas / Islam Qala)</option>
                  <option value="Vehicle Maintenance/Detailing">Maintenance, Tuning & Detailing Polish</option>
                  <option value="Showroom Overhead & Fuel">Showroom Overhead & Solar/Fuel Generator</option>
                  <option value="Staff Commissions">Staff Sales Agent Commissions</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Allocate to Vehicle Stock # (اختصاص به موتر)
                </label>
                <select
                  value={vehicleStock}
                  onChange={(e) => setVehicleStock(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs font-mono dark:border-slate-700 dark:bg-[#121824] dark:text-white outline-none focus:border-[#1976D2]"
                >
                  <option value="">General Showroom Overhead (Unallocated)</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.stockNumber}>
                      {v.stockNumber} - {v.year} {v.make} {v.model} ({v.vin.slice(0, 8)}...)
                    </option>
                  ))}
                </select>
              </div>

              <MuiTextField
                label="Amount (USD)"
                type="number"
                required
                value={amountUSD}
                onChange={(e) => setAmountUSD(Number(e.target.value))}
                startAdornment={<DollarSign className="h-3.5 w-3.5 text-slate-400" />}
                helperText={`Equivalent to approx ؋ ${(amountUSD * exchangeRate).toLocaleString()} AFN`}
              />

              <MuiTextField
                label="Payee / Recipient Party (دریافت‌کننده وجه)"
                placeholder="e.g. Islam Qala Customs Directorate"
                value={payee}
                onChange={(e) => setPayee(e.target.value)}
              />

              <MuiTextField
                label="Receipt / Maktoub # (شماره رسید یا مکتوب)"
                placeholder="e.g. MKT-HRT-2026-991"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
              />

              <div className="sm:col-span-1">
                <MuiTextField
                  label="Description / Purpose"
                  required
                  placeholder="e.g. Customs tariff stamp clearance and import stamp"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <MuiButton
                type="button"
                variant="outlined"
                color="inherit"
                size="small"
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </MuiButton>
              <MuiButton
                type="submit"
                variant="contained"
                color="primary"
                size="small"
              >
                Save & Post to General Ledger
              </MuiButton>
            </div>
          </form>
        </MuiCard>
      )}

      {/* Expenses Table */}
      <MuiCard elevation={1} className="overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Recorded Vehicle Cost Allocations & Operational Outlays
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Audited record of all import customs, transit freight, and showroom maintenance outlays.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {filteredExpenses.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <MuiTable dense>
            <MuiTableHead>
              <MuiTableRow hover={false}>
                <MuiTableCell header>Category</MuiTableCell>
                <MuiTableCell header>Allocated Vehicle / Target</MuiTableCell>
                <MuiTableCell header>Description</MuiTableCell>
                <MuiTableCell header>Payee & Receipt #</MuiTableCell>
                <MuiTableCell header>Date</MuiTableCell>
                <MuiTableCell header align="right">Amount (USD / AFN)</MuiTableCell>
              </MuiTableRow>
            </MuiTableHead>
            <MuiTableBody>
              {filteredExpenses.map((exp) => (
                <MuiTableRow key={exp.id}>
                  <MuiTableCell>
                    <MuiChip
                      label={exp.category}
                      color={getCategoryColor(exp.category) as any}
                      size="small"
                    />
                  </MuiTableCell>

                  <MuiTableCell>
                    {exp.vehicleStock ? (
                      <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[#1976D2] dark:text-[#42A5F5]">
                        <Car className="h-3 w-3 shrink-0" />
                        <span>{exp.vehicleStock}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Showroom Overhead</span>
                    )}
                  </MuiTableCell>

                  <MuiTableCell>
                    <div className="text-xs font-medium text-slate-900 dark:text-white">
                      {exp.description}
                    </div>
                  </MuiTableCell>

                  <MuiTableCell>
                    <div className="text-xs text-slate-700 dark:text-slate-300">
                      {exp.payee || "—"}
                    </div>
                    {exp.receiptNumber && (
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        Ref: {exp.receiptNumber}
                      </div>
                    )}
                  </MuiTableCell>

                  <MuiTableCell className="font-mono text-xs text-slate-500">
                    {exp.date}
                  </MuiTableCell>

                  <MuiTableCell align="right">
                    <div className="font-mono font-bold text-sm text-rose-600 dark:text-rose-400">
                      -${exp.amountUSD.toLocaleString()} USD
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      ؋ {Math.round(exp.amountUSD * exchangeRate).toLocaleString()} AFN
                    </div>
                  </MuiTableCell>
                </MuiTableRow>
              ))}
            </MuiTableBody>
          </MuiTable>
        </div>
      </MuiCard>
    </div>
  );
}
