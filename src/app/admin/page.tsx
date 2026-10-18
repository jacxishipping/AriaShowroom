"use client";

import React, { useState } from "react";
import { useShowroomStore, RoleType } from "@/store/useShowroomStore";
import { VehicleIntakeModal } from "@/components/VehicleIntakeModal";
import { VehicleDeedModal } from "@/components/VehicleDeedModal";
import { CommercialInvoiceModal } from "@/components/CommercialInvoiceModal";
import { PaymentVoucherModal } from "@/components/PaymentVoucherModal";
import { SupplierLedgerModal } from "@/components/SupplierLedgerModal";
import { InvoicesTab } from "@/components/accounting/InvoicesTab";
import { SuppliersTab } from "@/components/accounting/SuppliersTab";
import { ExpensesTab } from "@/components/accounting/ExpensesTab";
import { PaymentsTab } from "@/components/accounting/PaymentsTab";
import { AccountingTab } from "@/components/accounting/AccountingTab";
import { formatCurrency } from "@/lib/utils";
import { translations } from "@/lib/translations";
import {
  VehicleItem,
  CustomerRecord,
  InvoiceRecord,
  SupplierRecord,
  PaymentVoucherRecord,
} from "@/lib/mock-data";
import { exportInventoryToCSV, exportSalesLedgerToCSV } from "@/lib/export-utils";
import {
  MuiCard,
  MuiCardHeader,
  MuiCardContent,
  MuiButton,
  MuiChip,
  MuiTabs,
  MuiTableContainer,
  MuiTable,
  MuiTableHead,
  MuiTableBody,
  MuiTableRow,
  MuiTableCell,
  MuiTextField,
} from "@/components/mui";
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
  Building2,
  Landmark,
  Scale,
  Wallet,
  Banknote,
  ArrowUpRight,
  ArrowDownLeft,
  Percent,
  BookOpen,
} from "lucide-react";

export default function AdminDashboardPage() {
  const {
    vehicles,
    customers,
    sales,
    expenses,
    suppliers,
    invoices,
    payments,
    accounts,
    journalEntries,
    currency,
    exchangeRate,
    language,
    currentRole,
    setCurrentRole,
    deleteVehicle,
    updateCustomerStage,
    addSale,
    addExpense,
    addSupplier,
    addInvoice,
    updateInvoiceStatus,
    addPaymentVoucher,
    addJournalEntry,
    addToast,
  } = useShowroomStore();

  const t = translations[language];

  // Active ERP Tab
  const [activeTab, setActiveTab] = useState<
    "inventory" | "crm" | "sales" | "invoices" | "suppliers" | "expenses" | "payments" | "accounting"
  >("inventory");

  // Modals
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [selectedDeedVehicle, setSelectedDeedVehicle] = useState<VehicleItem | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<PaymentVoucherRecord | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierRecord | null>(null);

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

  // Filtered vehicles for inventory tab
  const filteredInventory = vehicles.filter(
    (v) =>
      v.make.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      v.model.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      v.stockNumber.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      v.vin.toLowerCase().includes(inventorySearch.toLowerCase())
  );

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

    addToast("Sale registered successfully! Marked vehicle as Sold and generated contract.", "success");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header: Title & Role Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-[#121824]">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Herat Automotive ERP / CRM System
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            {t.erpTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Authenticated Showroom Management Portal • Sadozai Motors Herat
          </p>
        </div>

        {/* Role Switcher Pill */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-semibold uppercase text-slate-400 block">
              {t.switchRole}
            </span>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {currentRole === "SuperAdmin" && "SuperAdmin (Haji Ahmad Shah)"}
              {currentRole === "SalesAgent" && "Sales Agent (Farhad Timori)"}
              {currentRole === "Accountant" && "Accountant (Mirwais Saljuqi)"}
            </span>
          </div>
          <select
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value as RoleType)}
            className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-[#1a2234] dark:text-slate-200 outline-none focus:border-[#1976D2]"
          >
            <option value="SuperAdmin">SuperAdmin</option>
            <option value="SalesAgent">Sales Agent</option>
            <option value="Accountant">Accountant</option>
          </select>
        </div>
      </div>

      {/* Material Navigation Tabs & Exports Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 gap-3">
        <MuiTabs
          value={activeTab}
          onChange={(val) => setActiveTab(val as any)}
          color="primary"
          tabs={[
            {
              value: "inventory",
              label: "Vehicle Inventory",
              icon: <Car className="h-4 w-4" />,
              badge: vehicles.length,
            },
            {
              value: "crm",
              label: "CRM & Leads",
              icon: <Users className="h-4 w-4" />,
              badge: customers.length,
            },
            {
              value: "sales",
              label: "Sales Desk",
              icon: <BadgeDollarSign className="h-4 w-4" />,
              badge: sales.length,
            },
            {
              value: "invoices",
              label: "Invoices",
              icon: <FileCheck2 className="h-4 w-4" />,
              badge: invoices.length,
            },
            {
              value: "suppliers",
              label: "Supplier Ledger (AP)",
              icon: <Building2 className="h-4 w-4" />,
              badge: suppliers.length,
            },
            {
              value: "expenses",
              label: "Vehicle Expenses",
              icon: <Receipt className="h-4 w-4" />,
              badge: expenses.length,
            },
            {
              value: "payments",
              label: "Record Payment",
              icon: <Banknote className="h-4 w-4" />,
              badge: payments.length,
            },
            {
              value: "accounting",
              label: "Full Accounting (GL)",
              icon: <Landmark className="h-4 w-4" />,
            },
          ]}
        />

        {/* Quick CSV / Excel Ledger Exports */}
        <div className="flex items-center gap-2 pb-2 sm:pb-0 shrink-0">
          <MuiButton
            variant="outlined"
            size="small"
            onClick={() => exportInventoryToCSV(vehicles)}
            startIcon={<FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />}
          >
            Lot CSV
          </MuiButton>

          <MuiButton
            variant="outlined"
            size="small"
            onClick={() => exportSalesLedgerToCSV(sales)}
            startIcon={<FileSpreadsheet className="h-3.5 w-3.5 text-[#D97706]" />}
          >
            Sales CSV
          </MuiButton>
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
                className="w-full rounded-md border border-slate-300 bg-white py-1.5 pl-9 pr-4 text-xs font-normal dark:border-slate-700 dark:bg-[#121824] dark:text-white outline-none focus:border-[#1976D2]"
              />
            </div>

            {currentRole !== "Accountant" && (
              <MuiButton
                variant="contained"
                color="primary"
                size="small"
                onClick={() => setIsIntakeOpen(true)}
                startIcon={<Plus className="h-4 w-4" />}
              >
                <span>{t.addNewVehicle}</span>
              </MuiButton>
            )}
          </div>

          {/* Material Vehicle Inventory Table */}
          <MuiCard elevation={1}>
            <div className="overflow-x-auto">
              <MuiTable dense>
                <MuiTableHead>
                  <MuiTableRow hover={false}>
                    <MuiTableCell header>Stock ID & Vehicle</MuiTableCell>
                    <MuiTableCell header>VIN / Chassis</MuiTableCell>
                    <MuiTableCell header>Status</MuiTableCell>
                    <MuiTableCell header>Gomrok Customs</MuiTableCell>
                    <MuiTableCell header>Landed Cost</MuiTableCell>
                    <MuiTableCell header>Selling Price</MuiTableCell>
                    <MuiTableCell header align="right">
                      Actions
                    </MuiTableCell>
                  </MuiTableRow>
                </MuiTableHead>
                <MuiTableBody>
                  {filteredInventory.map((veh) => (
                    <MuiTableRow key={veh.id}>
                      <MuiTableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {veh.year} {veh.make} {veh.model}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <span>{veh.stockNumber} • {veh.originCountry}</span>
                          <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-500 font-sans">
                            {veh.images.length} Photos
                          </span>
                        </div>
                      </MuiTableCell>
                      <MuiTableCell className="font-mono text-slate-600 dark:text-slate-400">
                        {veh.vin}
                      </MuiTableCell>
                      <MuiTableCell>
                        <MuiChip
                          label={veh.status}
                          color={veh.status === "Available on Lot" ? "success" : "default"}
                          size="small"
                        />
                      </MuiTableCell>
                      <MuiTableCell className="text-slate-600 dark:text-slate-400 truncate max-w-[160px]">
                        {veh.customsClearance}
                      </MuiTableCell>
                      <MuiTableCell className="font-mono text-slate-600 dark:text-slate-300">
                        ${veh.landedCost.toLocaleString()} USD
                      </MuiTableCell>
                      <MuiTableCell className="font-mono font-semibold text-slate-900 dark:text-white">
                        ${veh.sellingPrice.toLocaleString()} USD
                      </MuiTableCell>
                      <MuiTableCell align="right">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={`/vehicles/${veh.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded p-1 text-slate-400 hover:text-[#1976D2] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="View Photo Gallery & Specs"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => setSelectedDeedVehicle(veh)}
                            className="rounded p-1 text-slate-400 hover:text-[#1976D2] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
                              className="rounded p-1 text-slate-400 hover:text-[#D32F2F] hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Delete vehicle"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </MuiTableCell>
                    </MuiTableRow>
                  ))}
                </MuiTableBody>
              </MuiTable>
            </div>
          </MuiCard>
        </div>
      )}

      {/* TAB 2: CRM & LEADS PIPELINE */}
      {activeTab === "crm" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Herat Showroom Customer & Lead Registry
              </h3>
              <p className="text-xs text-slate-500">
                Pipeline tracked by Sales Desk (WhatsApp & Showroom Walk-ins)
              </p>
            </div>
            <MuiChip label={`${customers.length} Active Leads`} color="primary" size="small" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {customers.map((cust) => (
              <MuiCard
                key={cust.id}
                elevation={1}
                className="p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <MuiChip
                    label={cust.leadStage}
                    size="small"
                    color={
                      cust.leadStage === "Closed/Won"
                        ? "success"
                        : cust.leadStage === "Lost"
                        ? "error"
                        : "default"
                    }
                  />
                  <span className="text-[11px] font-mono text-slate-400">
                    {cust.city}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {cust.fullName}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <span>{cust.phone}</span>
                  </p>
                  <p className="text-[11px] font-mono text-slate-400">
                    Tazkira: {cust.tazkiraNumber}
                  </p>
                </div>

                {cust.tradeInRecord && (
                  <div className="rounded-md bg-slate-50 p-2 text-[11px] dark:bg-[#121824] border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">
                      Trade-In Vehicle:
                    </span>
                    <span className="text-slate-500">{cust.tradeInRecord}</span>
                  </div>
                )}

                <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Budget:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    ${cust.budget.toLocaleString()} USD
                  </span>
                </div>

                {/* Stage Mover Dropdown */}
                <select
                  value={cust.leadStage}
                  onChange={(e) =>
                    updateCustomerStage(cust.id, e.target.value as any)
                  }
                  className="w-full rounded-md border border-slate-300 bg-white p-1.5 text-xs font-medium dark:border-slate-700 dark:bg-[#121824] dark:text-white outline-none focus:border-[#1976D2]"
                >
                  <option value="New Inquiry">New Inquiry</option>
                  <option value="Follow-Up">Follow-Up</option>
                  <option value="Test Drive">Test Drive</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Closed/Won">Closed / Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </MuiCard>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SALES TRANSACTION ENGINE & DEED CONTRACTS */}
      {activeTab === "sales" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sale Initiation Form */}
          <MuiCard elevation={1} className="lg:col-span-5 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
              <BadgeDollarSign className="h-4 w-4 text-[#1976D2]" />
              Execute Showroom Sale & Issue Contract
            </h3>

            <form onSubmit={handleCreateSale} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
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
                  className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs font-mono dark:border-slate-700 dark:bg-[#121824] dark:text-white outline-none focus:border-[#1976D2]"
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

              <MuiTextField
                label="Buyer Full Name (نام خریدار)"
                required
                placeholder="e.g. Haji Abdul Qadir Alokozai"
                value={saleForm.customerName}
                onChange={(e) =>
                  setSaleForm({ ...saleForm, customerName: e.target.value })
                }
              />

              <div className="grid grid-cols-2 gap-3">
                <MuiTextField
                  label="Phone (شماره تماس)"
                  required
                  placeholder="+93 79 912 3456"
                  value={saleForm.customerPhone}
                  onChange={(e) =>
                    setSaleForm({ ...saleForm, customerPhone: e.target.value })
                  }
                />
                <MuiTextField
                  label="Tazkira ID (تذکره)"
                  required
                  placeholder="1400-0402-88912"
                  value={saleForm.customerTazkira}
                  onChange={(e) =>
                    setSaleForm({ ...saleForm, customerTazkira: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <MuiTextField
                  label="Agreed Price (USD)"
                  type="number"
                  value={saleForm.salePriceUSD}
                  onChange={(e) =>
                    setSaleForm({
                      ...saleForm,
                      salePriceUSD: Number(e.target.value),
                    })
                  }
                  startAdornment={<DollarSign className="h-3.5 w-3.5 text-slate-400" />}
                />

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Payment Structure
                  </label>
                  <select
                    value={saleForm.paymentType}
                    onChange={(e) =>
                      setSaleForm({ ...saleForm, paymentType: e.target.value as any })
                    }
                    className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-[#121824] dark:text-white outline-none focus:border-[#1976D2]"
                  >
                    <option value="Full Cash">Full Cash</option>
                    <option value="Installment Plan">Installment Plan</option>
                    <option value="Hawala / Bank Transfer">Hawala / Sarrafi</option>
                  </select>
                </div>
              </div>

              <MuiButton
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="medium"
              >
                Sign Contract & Convey Title
              </MuiButton>
            </form>
          </MuiCard>

          {/* Past Sales Records Table */}
          <MuiCard elevation={1} className="lg:col-span-7">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Completed Showroom Contracts & Installments
              </h3>
            </div>
            <div className="overflow-x-auto">
              <MuiTable dense>
                <MuiTableHead>
                  <MuiTableRow hover={false}>
                    <MuiTableCell header>Contract #</MuiTableCell>
                    <MuiTableCell header>Vehicle</MuiTableCell>
                    <MuiTableCell header>Buyer & Tazkira</MuiTableCell>
                    <MuiTableCell header>Price</MuiTableCell>
                    <MuiTableCell header>Payment</MuiTableCell>
                  </MuiTableRow>
                </MuiTableHead>
                <MuiTableBody>
                  {sales.map((s) => (
                    <MuiTableRow key={s.id}>
                      <MuiTableCell className="font-mono font-semibold text-[#1976D2] dark:text-[#42A5F5]">
                        {s.contractNumber}
                      </MuiTableCell>
                      <MuiTableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {s.vehicleName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {s.stockNumber}
                        </div>
                      </MuiTableCell>
                      <MuiTableCell>
                        <div className="text-slate-900 dark:text-white">{s.customerName}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {s.customerTazkira}
                        </div>
                      </MuiTableCell>
                      <MuiTableCell className="font-mono font-semibold text-slate-900 dark:text-white">
                        ${s.salePriceUSD.toLocaleString()}
                      </MuiTableCell>
                      <MuiTableCell>
                        <MuiChip
                          label={s.paymentType}
                          color={s.paymentType === "Full Cash" ? "success" : "default"}
                          size="small"
                        />
                      </MuiTableCell>
                    </MuiTableRow>
                  ))}
                </MuiTableBody>
              </MuiTable>
            </div>
          </MuiCard>
        </div>
      )}

      {/* TAB 4: COMMERCIAL INVOICING */}
      {activeTab === "invoices" && (
        <InvoicesTab onSelectInvoice={(inv) => setSelectedInvoice(inv)} />
      )}

      {/* TAB 5: SUPPLIER LEDGER (ACCOUNTS PAYABLE) */}
      {activeTab === "suppliers" && (
        <SuppliersTab onSelectSupplier={(sup) => setSelectedSupplier(sup)} />
      )}

      {/* TAB 6: VEHICLE EXPENSES & DIRECT LANDED COST */}
      {activeTab === "expenses" && <ExpensesTab />}

      {/* TAB 7: PAYMENT VOUCHERS & CASHFLOW */}
      {activeTab === "payments" && (
        <PaymentsTab onSelectVoucher={(vch) => setSelectedVoucher(vch)} />
      )}

      {/* TAB 8: FULL GENERAL LEDGER ACCOUNTING */}
      {activeTab === "accounting" && <AccountingTab />}

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

      {/* Commercial Invoice Modal */}
      {selectedInvoice && (
        <CommercialInvoiceModal
          invoice={selectedInvoice}
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {/* Payment Voucher Modal */}
      {selectedVoucher && (
        <PaymentVoucherModal
          voucher={selectedVoucher}
          isOpen={!!selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
        />
      )}

      {/* Supplier Statement Ledger Modal */}
      {selectedSupplier && (
        <SupplierLedgerModal
          supplier={selectedSupplier}
          isOpen={!!selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
        />
      )}
    </div>
  );
}
