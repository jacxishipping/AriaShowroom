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
  MenuItem,
} from "@/components/mui";
import {
  Receipt,
  Plus,
  Search,
  X,
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
    <div className="space-y-4">
      {/* Top Expense KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800/90 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Expenses (مصارف)
            </span>
            <span className="p-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
              <DollarSign className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-1.5 text-xl font-extrabold font-mono text-rose-600 dark:text-rose-400 tracking-tight">
            ${totalExpenseUSD.toLocaleString()}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500 font-mono">
            ؋ {totalExpenseAFN.toLocaleString()} AFN
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800/90 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Islam Qala Customs
            </span>
            <span className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-1.5 text-xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
            ${customsTotalUSD.toLocaleString()}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Border tariff clearance
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800/90 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Freight & Transit
            </span>
            <span className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
              <Truck className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-1.5 text-xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
            ${transitTotalUSD.toLocaleString()}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Bandar Abbas & trailers
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800/90 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Detailing & Operations
            </span>
            <span className="p-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40">
              <Wrench className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-1.5 text-xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
            ${(maintenanceTotalUSD + overheadTotalUSD).toLocaleString()}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Showroom overhead & fuel
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search description, payee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 sm:w-60 ps-7 pe-6 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 h-8"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute end-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-8 ps-2.5 pe-6 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Gomrok & Port Tariffs">Gomrok & Tariffs</option>
            <option value="Transit & Ocean Freight">Transit & Freight</option>
            <option value="Vehicle Maintenance/Detailing">Maintenance & Detailing</option>
            <option value="Showroom Overhead & Fuel">Showroom Overhead & Fuel</option>
            <option value="Staff Commissions">Staff Commissions</option>
          </select>

          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="h-8 ps-2.5 pe-6 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium outline-none focus:border-blue-500 cursor-pointer max-w-[200px] truncate"
          >
            <option value="all">All Allocations</option>
            <option value="overhead">General Overhead</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.stockNumber}>
                {v.stockNumber} - {v.make} {v.model}
              </option>
            ))}
          </select>

          {(search || categoryFilter !== "all" || vehicleFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setCategoryFilter("all");
                setVehicleFilter("all");
              }}
              className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline px-1 cursor-pointer"
            >
              Reset
            </button>
          )}

          <span className="text-[11px] font-mono text-slate-400">
            ({filteredExpenses.length} expenses)
          </span>
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
              <MuiTextField
                select
                label="Expense Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
              >
                <MenuItem value="Gomrok & Port Tariffs">Gomrok & Port Tariffs (Herat Islam Qala)</MenuItem>
                <MenuItem value="Transit & Ocean Freight">Transit & Ocean Freight (Bandar Abbas / Islam Qala)</MenuItem>
                <MenuItem value="Vehicle Maintenance/Detailing">Maintenance, Tuning & Detailing Polish</MenuItem>
                <MenuItem value="Showroom Overhead & Fuel">Showroom Overhead & Solar/Fuel Generator</MenuItem>
                <MenuItem value="Staff Commissions">Staff Sales Agent Commissions</MenuItem>
              </MuiTextField>

              <MuiTextField
                select
                label="Allocate to Vehicle Stock # (اختصاص به موتر)"
                value={vehicleStock}
                onChange={(e) => setVehicleStock(e.target.value)}
              >
                <MenuItem value="">General Showroom Overhead (Unallocated)</MenuItem>
                {vehicles.map((v) => (
                  <MenuItem key={v.id} value={v.stockNumber}>
                    {v.stockNumber} - {v.year} {v.make} {v.model} ({v.vin.slice(0, 8)}...)
                  </MenuItem>
                ))}
              </MuiTextField>

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
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#111827] shadow-xs overflow-hidden">
        <div className="px-3.5 py-2.5 border-b border-slate-200/90 dark:border-slate-800/90 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Vehicle Cost Allocations & Operational Outlays
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Audited record of import customs, transit freight, and showroom maintenance outlays.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {filteredExpenses.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <MuiTable dense size="small" className="w-full">
            <MuiTableHead>
              <MuiTableRow hover={false}>
                <MuiTableCell header>Category</MuiTableCell>
                <MuiTableCell header>Allocated Stock</MuiTableCell>
                <MuiTableCell header>Description</MuiTableCell>
                <MuiTableCell header>Payee & Ref</MuiTableCell>
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
                      <div className="flex items-center gap-1 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
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
                      <div className="text-[10px] font-mono text-slate-400">
                        Ref: {exp.receiptNumber}
                      </div>
                    )}
                  </MuiTableCell>

                  <MuiTableCell className="font-mono text-[11px] text-slate-500">
                    {exp.date}
                  </MuiTableCell>

                  <MuiTableCell align="right">
                    <div className="font-mono font-bold text-xs text-rose-600 dark:text-rose-400">
                      -${exp.amountUSD.toLocaleString()} USD
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      ؋ {Math.round(exp.amountUSD * exchangeRate).toLocaleString()} AFN
                    </div>
                  </MuiTableCell>
                </MuiTableRow>
              ))}
            </MuiTableBody>
          </MuiTable>
        </div>
      </div>
    </div>
  );
}
