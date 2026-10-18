"use client";

import React, { useState } from "react";
import { useShowroomStore, RoleType } from "@/store/useShowroomStore";
import { VehicleIntakeModal } from "@/components/VehicleIntakeModal";
import { VehicleDeedModal } from "@/components/VehicleDeedModal";
import { formatCurrency } from "@/lib/utils";
import { translations } from "@/lib/translations";
import { VehicleItem, CustomerRecord } from "@/lib/mock-data";
import { exportInventoryToCSV, exportSalesLedgerToCSV } from "@/lib/export-utils";
import {
  LayoutDashboard,
  Car,
  Users,
  BadgeDollarSign,
  TrendingUp,
  Plus,
  Search,
  Trash2,
  Edit,
  Eye,
  Shield,
  Phone,
  FileText,
  Clock,
  Printer,
  ChevronRight,
  Filter,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  Receipt,
  FileCheck2,
  FileSpreadsheet,
} from "lucide-react";

export default function AdminDashboardPage() {
  const {
    vehicles,
    customers,
    sales,
    expenses,
    currency,
    exchangeRate,
    language,
    currentRole,
    setCurrentRole,
    deleteVehicle,
    updateCustomerStage,
    addSale,
    addExpense,
  } = useShowroomStore();

  const t = translations[language];

  // Active ERP Tab
  const [activeTab, setActiveTab] = useState<"inventory" | "crm" | "sales" | "financials">("inventory");

  // Modals
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [selectedDeedVehicle, setSelectedDeedVehicle] = useState<VehicleItem | null>(null);

  // Search in inventory table
  const [inventorySearch, setInventorySearch] = useState("");

  // Sale transaction creation state
  const [saleForm, setSaleForm] = useState({
    stockNumber: vehicles[0]?.stockNumber || "",
    customerName: "",
    customerPhone: "",
    customerTazkira: "",
    salesAgent: "Farhad Timori",
    salePriceUSD: vehicles[0]?.sellingPrice || 35000,
    paymentType: "Full Cash" as const,
    downPaymentUSD: vehicles[0]?.sellingPrice || 35000,
    installmentsRemaining: 0,
    notes: "Herat showroom transaction settlement.",
  });

  // Expense creation state
  const [expenseForm, setExpenseForm] = useState({
    category: "Showroom Overhead & Fuel" as const,
    vehicleStock: "",
    amountUSD: 500,
    description: "Diesel fuel for backup generator & maintenance",
  });

  // Filtered vehicles for inventory tab
  const filteredInventory = vehicles.filter(
    (v) =>
      v.make.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      v.model.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      v.stockNumber.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      v.vin.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  // Financial Calculations
  const totalActiveInventoryValue = vehicles
    .filter((v) => v.status !== "Sold")
    .reduce((acc, v) => acc + v.sellingPrice, 0);

  const totalMonthlyRevenue = sales.reduce((acc, s) => acc + s.salePriceUSD, 0);

  const totalShowroomExpenses = expenses.reduce((acc, e) => acc + e.amountUSD, 0);

  const avgMargin = 4850; // USD per vehicle average in Herat market

  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicleObj = vehicles.find((v) => v.stockNumber === saleForm.stockNumber);
    if (!vehicleObj) return;

    addSale({
      stockNumber: saleForm.stockNumber,
      vehicleName: `${vehicleObj.year} ${vehicleObj.make} ${vehicleObj.model}`,
      customerName: saleForm.customerName,
      customerPhone: saleForm.customerPhone,
      customerTazkira: saleForm.customerTazkira,
      salesAgent: saleForm.salesAgent,
      salePriceUSD: Number(saleForm.salePriceUSD),
      exchangeRate: exchangeRate,
      paymentType: saleForm.paymentType,
      downPaymentUSD: Number(saleForm.downPaymentUSD),
      installmentsRemaining: Number(saleForm.installmentsRemaining),
      status: Number(saleForm.installmentsRemaining) > 0 ? "Pending Installments" : "Completed",
    });

    alert("Sale registered successfully! Marked vehicle as Sold and generated contract number.");
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({
      category: expenseForm.category,
      vehicleStock: expenseForm.vehicleStock || undefined,
      amountUSD: Number(expenseForm.amountUSD),
      description: expenseForm.description,
    });
    alert("Expense voucher booked successfully!");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header: Title & Role Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-navy-900">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-gold dark:text-gold-light">
              Herat Automotive ERP / CRM System
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {t.erpTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Authenticated Showroom Management Portal • Sadozai Motors Herat
          </p>
        </div>

        {/* Role Switcher Pill */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-semibold uppercase text-slate-400 block">
              {t.switchRole}
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {currentRole === "SuperAdmin" && "SuperAdmin (Haji Ahmad Shah)"}
              {currentRole === "SalesAgent" && "Sales Agent (Farhad Timori)"}
              {currentRole === "Accountant" && "Accountant (Mirwais Saljuqi)"}
            </span>
          </div>
          <select
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value as RoleType)}
            className="rounded-xl border border-gold/40 bg-navy px-3 py-2 text-xs font-bold text-gold-light outline-none"
          >
            <option value="SuperAdmin">SuperAdmin</option>
            <option value="SalesAgent">Sales Agent</option>
            <option value="Accountant">Accountant</option>
          </select>
        </div>
      </div>

      {/* Navigation Tabs & Exports Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 gap-3">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === "inventory"
                ? "border-gold text-gold"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Car className="h-4 w-4" />
            <span>{t.tabInventory} ({vehicles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("crm")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === "crm"
                ? "border-gold text-gold"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>{t.tabCrm} ({customers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("sales")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === "sales"
                ? "border-gold text-gold"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <BadgeDollarSign className="h-4 w-4" />
            <span>{t.tabSales} ({sales.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("financials")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === "financials"
                ? "border-gold text-gold"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>{t.tabFinancials}</span>
          </button>
        </div>

        {/* Quick CSV / Excel Ledger Exports */}
        <div className="flex items-center gap-2 pb-2 sm:pb-0 shrink-0">
          <button
            onClick={() => exportInventoryToCSV(vehicles)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-navy-900 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer"
            title="Download full lot inventory spreadsheet with landed costs and margins"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
            <span>Lot CSV</span>
          </button>

          <button
            onClick={() => exportSalesLedgerToCSV(sales)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-navy-900 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer"
            title="Download sales transactions ledger"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-gold" />
            <span>Sales CSV</span>
          </button>
        </div>
      </div>

      {/* TAB 1: INVENTORY MANAGEMENT */}
      {activeTab === "inventory" && (
        <div className="space-y-6">
          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search stock #, VIN, make..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs dark:border-slate-800 dark:bg-navy-900"
              />
            </div>

            {currentRole !== "Accountant" && (
              <button
                onClick={() => setIsIntakeOpen(true)}
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gold px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:bg-gold-light transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>{t.addNewVehicle}</span>
              </button>
            )}
          </div>

          {/* Vehicle Inventory Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-navy-900">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-navy-800 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Stock ID & Vehicle</th>
                  <th className="p-4">VIN / Chassis</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Gomrok Customs</th>
                  <th className="p-4">Landed Cost</th>
                  <th className="p-4">Selling Price</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredInventory.map((veh) => (
                  <tr key={veh.id} className="hover:bg-slate-50/60 dark:hover:bg-navy-800/40">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {veh.year} {veh.make} {veh.model}
                      </div>
                      <div className="text-[11px] font-mono text-gold dark:text-gold-light flex items-center gap-2">
                        <span>{veh.stockNumber} ({veh.originCountry})</span>
                        <span className="rounded bg-slate-100 dark:bg-navy-800 px-1.5 py-0.2 text-[10px] text-slate-500 font-sans">
                          📸 {veh.images.length} Photos
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-600 dark:text-slate-400">
                      {veh.vin}
                    </td>
                    <td className="p-4">
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {veh.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 truncate max-w-[160px]">
                      {veh.customsClearance}
                    </td>
                    <td className="p-4 font-mono">
                      ${veh.landedCost.toLocaleString()} USD
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                      ${veh.sellingPrice.toLocaleString()} USD
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <a
                        href={`/vehicles/${veh.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block rounded-lg p-1.5 text-slate-500 hover:text-gold hover:bg-slate-100 dark:hover:bg-navy-800"
                        title="View 40+ Photo Gallery & Specs"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => setSelectedDeedVehicle(veh)}
                        className="rounded-lg p-1.5 text-gold hover:bg-gold/10"
                        title="Print Legal Deed"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      {currentRole === "SuperAdmin" && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete stock ${veh.stockNumber}?`)) {
                              deleteVehicle(veh.id);
                            }
                          }}
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-500/10"
                          title="Delete vehicle"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CRM & LEADS PIPELINE */}
      {activeTab === "crm" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Herat Showroom Customer & Lead Registry
            </h3>
            <span className="text-xs text-slate-500">
              Pipeline tracked by Sales Desk (WhatsApp & Showroom Walk-ins)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {customers.map((cust) => (
              <div
                key={cust.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-navy-900 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-bold text-gold uppercase">
                    {cust.leadStage}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {cust.city}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {cust.fullName}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Phone className="h-3 w-3 text-gold" />
                    <span>{cust.phone}</span>
                  </p>
                  <p className="text-[11px] font-mono text-slate-400">
                    Tazkira: {cust.tazkiraNumber}
                  </p>
                </div>

                {cust.tradeInRecord && (
                  <div className="rounded-lg bg-slate-50 p-2 text-[11px] dark:bg-navy-800">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">
                      Trade-In Vehicle:
                    </span>
                    <span className="text-slate-500">{cust.tradeInRecord}</span>
                  </div>
                )}

                <div className="border-t pt-2 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Budget:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ${cust.budget.toLocaleString()} USD
                  </span>
                </div>

                {/* Stage Mover Dropdown */}
                <select
                  value={cust.leadStage}
                  onChange={(e) =>
                    updateCustomerStage(cust.id, e.target.value as any)
                  }
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-[11px] font-semibold dark:border-slate-700 dark:bg-navy-800"
                >
                  <option value="New Inquiry">New Inquiry</option>
                  <option value="Follow-Up">Follow-Up</option>
                  <option value="Test Drive">Test Drive</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Closed/Won">Closed / Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SALES TRANSACTION ENGINE & DEED CONTRACTS */}
      {activeTab === "sales" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sale Initiation Form */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-navy-900 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BadgeDollarSign className="h-5 w-5 text-gold" />
              Execute Showroom Sale & Issue Contract
            </h3>

            <form onSubmit={handleCreateSale} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300">
                  Select Stock Vehicle
                </label>
                <select
                  value={saleForm.stockNumber}
                  onChange={(e) => {
                    const sel = vehicles.find((v) => v.stockNumber === e.target.value);
                    setSaleForm({
                      ...saleForm,
                      stockNumber: e.target.value,
                      salePriceUSD: sel?.sellingPrice || 35000,
                      downPaymentUSD: sel?.sellingPrice || 35000,
                    });
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 font-mono dark:border-slate-700 dark:bg-navy-800 dark:text-white"
                >
                  {vehicles
                    .filter((v) => v.status !== "Sold")
                    .map((v) => (
                      <option key={v.id} value={v.stockNumber}>
                        {v.stockNumber} - {v.year} {v.make} {v.model} (${v.sellingPrice.toLocaleString()})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300">
                  Buyer Full Name (نام خریدار)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Haji Abdul Qadir Alokozai"
                  value={saleForm.customerName}
                  onChange={(e) =>
                    setSaleForm({ ...saleForm, customerName: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-navy-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300">
                    Phone (شماره تماس)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+93 79 912 3456"
                    value={saleForm.customerPhone}
                    onChange={(e) =>
                      setSaleForm({ ...saleForm, customerPhone: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-navy-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300">
                    Tazkira ID (تذکره)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="1400-0402-88912"
                    value={saleForm.customerTazkira}
                    onChange={(e) =>
                      setSaleForm({ ...saleForm, customerTazkira: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-navy-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300">
                    Agreed Price (USD)
                  </label>
                  <input
                    type="number"
                    value={saleForm.salePriceUSD}
                    onChange={(e) =>
                      setSaleForm({
                        ...saleForm,
                        salePriceUSD: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 font-mono font-bold dark:border-slate-700 dark:bg-navy-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300">
                    Payment Structure
                  </label>
                  <select
                    value={saleForm.paymentType}
                    onChange={(e) =>
                      setSaleForm({ ...saleForm, paymentType: e.target.value as any })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-navy-800 dark:text-white"
                  >
                    <option value="Full Cash">Full Cash</option>
                    <option value="Installment Plan">Installment Plan</option>
                    <option value="Hawala / Bank Transfer">Hawala / Sarrafi</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gold py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-gold-light transition-colors"
              >
                Sign Contract & Convey Title
              </button>
            </form>
          </div>

          {/* Past Sales Records Table */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-navy-900">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">
              Completed Showroom Contracts & Installments
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 dark:bg-navy-800 border-b dark:border-slate-800">
                  <tr>
                    <th className="p-3">Contract #</th>
                    <th className="p-3">Vehicle</th>
                    <th className="p-3">Buyer & Tazkira</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sales.map((s) => (
                    <tr key={s.id}>
                      <td className="p-3 font-mono font-bold text-gold">
                        {s.contractNumber}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {s.vehicleName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {s.stockNumber}
                        </div>
                      </td>
                      <td className="p-3">
                        <div>{s.customerName}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {s.customerTazkira}
                        </div>
                      </td>
                      <td className="p-3 font-mono font-bold">
                        ${s.salePriceUSD.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                          {s.paymentType}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EXECUTIVE FINANCIALS & EXPENSES */}
      {activeTab === "financials" && (
        <div className="space-y-8">
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-navy-900">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                {t.totalActiveValue}
              </span>
              <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-mono">
                ${totalActiveInventoryValue.toLocaleString()} USD
              </p>
              <p className="mt-1 text-xs text-slate-500">
                ؋ {(totalActiveInventoryValue * exchangeRate).toLocaleString()} AFN
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-navy-900">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                {t.monthlyRevenue}
              </span>
              <p className="mt-2 text-2xl font-black text-emerald-500 font-mono">
                +${totalMonthlyRevenue.toLocaleString()} USD
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {sales.length} verified sales deeds executed
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-navy-900">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                {t.netProfitPerCar}
              </span>
              <p className="mt-2 text-2xl font-black text-gold font-mono">
                +${avgMargin.toLocaleString()} USD
              </p>
              <p className="mt-1 text-xs text-slate-500">
                After Islam Qala tariffs & freight
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-navy-900">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                {t.daysOnLot}
              </span>
              <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                18.4 Days
              </p>
              <p className="mt-1 text-xs text-slate-500">
                High turnover (Corolla & LC300 lead)
              </p>
            </div>
          </div>

          {/* Expense Voucher Logging & List */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-navy-900 space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="h-5 w-5 text-gold" />
                Book Showroom Expense / Customs Duty
              </h3>

              <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300">
                    Category
                  </label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, category: e.target.value as any })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-navy-800 dark:text-white"
                  >
                    <option value="Gomrok & Port Tariffs">Gomrok & Port Tariffs (Herat)</option>
                    <option value="Transit & Ocean Freight">Transit & Ocean Freight (Bandar Abbas)</option>
                    <option value="Vehicle Maintenance/Detailing">Maintenance & Detailing</option>
                    <option value="Showroom Overhead & Fuel">Showroom Overhead & Solar/Fuel</option>
                    <option value="Staff Commissions">Staff Commissions</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300">
                    Amount (USD)
                  </label>
                  <input
                    type="number"
                    value={expenseForm.amountUSD}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        amountUSD: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 font-mono font-bold dark:border-slate-700 dark:bg-navy-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300">
                    Description & Receipt Note
                  </label>
                  <input
                    type="text"
                    value={expenseForm.description}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, description: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-navy-800 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-navy py-2.5 text-xs font-bold text-white hover:bg-navy-800 dark:bg-gold dark:text-slate-950 transition-colors"
                >
                  Book Expense Voucher
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-navy-900">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">
                Recorded Operational & Import Outlays
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 dark:bg-navy-800 border-b dark:border-slate-800">
                    <tr>
                      <th className="p-3">Category</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Amount (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {expenses.map((exp) => (
                      <tr key={exp.id}>
                        <td className="p-3 font-semibold text-gold">
                          {exp.category}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">
                          {exp.description}
                        </td>
                        <td className="p-3 text-slate-400 font-mono">
                          {exp.date}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-red-500">
                          -${exp.amountUSD.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Stock Intake Modal */}
      <VehicleIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
      />

      {/* Vehicle Deed Triggered from Inventory */}
      {selectedDeedVehicle && (
        <VehicleDeedModal
          vehicle={selectedDeedVehicle}
          isOpen={!!selectedDeedVehicle}
          onClose={() => setSelectedDeedVehicle(null)}
        />
      )}
    </div>
  );
}
