import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  VehicleItem,
  CustomerRecord,
  SaleRecord,
  ExpenseRecord,
  SupplierRecord,
  SupplierBillRecord,
  InvoiceRecord,
  PaymentVoucherRecord,
  AccountRecord,
  JournalEntryRecord,
  INITIAL_VEHICLES,
  INITIAL_CUSTOMERS,
  INITIAL_SALES,
  INITIAL_EXPENSES,
  INITIAL_SUPPLIERS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_ACCOUNTS,
  INITIAL_JOURNAL_ENTRIES,
} from "@/lib/mock-data";

export type RoleType = "SuperAdmin" | "SalesAgent" | "Accountant";
export type CurrencyType = "USD" | "AFN";
export type LanguageType = "en" | "fa" | "ps"; // English, Dari (Farsi), or Pashto

export interface FilterState {
  search: string;
  make: string;
  model: string;
  bodyType: string;
  minYear: number | null;
  maxYear: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  fuelType: string;
  transmission: string;
  steering: string;
  originCountry: string;
  status: string;
}

interface ShowroomStore {
  // Global App Settings
  currency: CurrencyType;
  exchangeRate: number; // AFN per USD (e.g. 70.5)
  language: LanguageType;
  currentRole: RoleType;
  darkMode: boolean;

  // Actions for App Settings
  setCurrency: (currency: CurrencyType) => void;
  setExchangeRate: (rate: number) => void;
  setLanguage: (lang: LanguageType) => void;
  setCurrentRole: (role: RoleType) => void;
  toggleDarkMode: () => void;

  // Vehicles
  vehicles: VehicleItem[];
  filters: FilterState;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  addVehicle: (vehicle: Omit<VehicleItem, "id" | "viewsCount" | "inquiriesCount">) => void;
  updateVehicle: (id: string, updates: Partial<VehicleItem>) => void;
  deleteVehicle: (id: string) => void;

  // CRM Leads
  customers: CustomerRecord[];
  addCustomer: (customer: Omit<CustomerRecord, "id" | "createdAt">) => void;
  updateCustomerStage: (customerId: string, stage: CustomerRecord["leadStage"]) => void;

  // Sales & Transactions
  sales: SaleRecord[];
  addSale: (sale: Omit<SaleRecord, "id" | "contractNumber" | "saleDate">) => void;

  // Expenses & Vehicle Cost Allocation
  expenses: ExpenseRecord[];
  addExpense: (expense: Omit<ExpenseRecord, "id" | "date">) => void;

  // Suppliers & Supplier Ledger
  suppliers: SupplierRecord[];
  addSupplier: (supplier: Omit<SupplierRecord, "id" | "bills" | "totalPurchasedUSD" | "totalPaidUSD" | "balanceUSD">) => void;
  addSupplierBill: (bill: Omit<SupplierBillRecord, "id">) => void;
  recordSupplierPayment: (supplierId: string, amountUSD: number, paymentMethod: any, referenceNumber?: string, sarrafiAccount?: string) => void;

  // Commercial Invoicing
  invoices: InvoiceRecord[];
  addInvoice: (invoice: Omit<InvoiceRecord, "id" | "invoiceNumber">) => void;
  updateInvoiceStatus: (invoiceId: string, status: InvoiceRecord["status"]) => void;

  // Payment Vouchers Engine
  payments: PaymentVoucherRecord[];
  addPaymentVoucher: (voucher: Omit<PaymentVoucherRecord, "id" | "voucherNumber">) => void;

  // Accounting & Chart of Accounts
  accounts: AccountRecord[];
  journalEntries: JournalEntryRecord[];
  addJournalEntry: (entry: Omit<JournalEntryRecord, "id" | "entryNumber">) => void;
}

const initialFilters: FilterState = {
  search: "",
  make: "ALL",
  model: "ALL",
  bodyType: "ALL",
  minYear: null,
  maxYear: null,
  minPrice: null,
  maxPrice: null,
  fuelType: "ALL",
  transmission: "ALL",
  steering: "ALL",
  originCountry: "ALL",
  status: "ALL",
};

export const useShowroomStore = create<ShowroomStore>()(
  persist(
    (set, get) => ({
      currency: "USD",
      exchangeRate: 70.5,
      language: "en",
      currentRole: "SuperAdmin",
      darkMode: false,

      setCurrency: (currency) => set({ currency }),
      setExchangeRate: (exchangeRate) => set({ exchangeRate }),
      setLanguage: (language) => set({ language }),
      setCurrentRole: (currentRole) => set({ currentRole }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      vehicles: INITIAL_VEHICLES,
      filters: initialFilters,

      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),

      resetFilters: () => set({ filters: initialFilters }),

      addVehicle: (vehicleData) =>
        set((state) => {
          const newId = `veh-${Date.now().toString().slice(-4)}`;
          const newVehicle: VehicleItem = {
            ...vehicleData,
            id: newId,
            viewsCount: 0,
            inquiriesCount: 0,
          };
          return { vehicles: [newVehicle, ...state.vehicles] };
        }),

      updateVehicle: (id, updates) =>
        set((state) => ({
          vehicles: state.vehicles.map((v) => (v.id === id ? { ...v, ...updates } : v)),
        })),

      deleteVehicle: (id) =>
        set((state) => ({
          vehicles: state.vehicles.filter((v) => v.id !== id),
        })),

      customers: INITIAL_CUSTOMERS,
      addCustomer: (customerData) =>
        set((state) => {
          const newId = `cust-${Date.now().toString().slice(-4)}`;
          const newCust: CustomerRecord = {
            ...customerData,
            id: newId,
            createdAt: new Date().toISOString().split("T")[0],
          };
          return { customers: [newCust, ...state.customers] };
        }),

      updateCustomerStage: (customerId, stage) =>
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === customerId ? { ...c, leadStage: stage } : c
          ),
        })),

      sales: INITIAL_SALES,
      addSale: (saleData) =>
        set((state) => {
          const randomNum = Math.floor(100 + Math.random() * 900);
          const contractNumber = `SM-CNTR-2026-${randomNum}`;
          const newSale: SaleRecord = {
            ...saleData,
            id: `sale-${Date.now().toString().slice(-4)}`,
            contractNumber,
            saleDate: new Date().toISOString().split("T")[0],
          };

          // Mark vehicle as Sold
          const updatedVehicles = state.vehicles.map((v) =>
            v.stockNumber === saleData.stockNumber ? { ...v, status: "Sold" as const } : v
          );

          return {
            sales: [newSale, ...state.sales],
            vehicles: updatedVehicles,
          };
        }),

      expenses: INITIAL_EXPENSES,
      addExpense: (expenseData) =>
        set((state) => {
          const newExpense: ExpenseRecord = {
            ...expenseData,
            id: `exp-${Date.now().toString().slice(-4)}`,
            date: new Date().toISOString().split("T")[0],
          };

          // Also update vehicle landed cost if vehicleStock is linked
          let updatedVehicles = state.vehicles;
          if (expenseData.vehicleStock) {
            updatedVehicles = state.vehicles.map((v) => {
              if (v.stockNumber === expenseData.vehicleStock) {
                const newLanded = v.landedCost + expenseData.amountUSD;
                return { ...v, landedCost: newLanded };
              }
              return v;
            });
          }

          // Also log a journal entry for accounting
          const newJe: JournalEntryRecord = {
            id: `je-${Date.now().toString().slice(-4)}`,
            entryNumber: `JE-EXP-${Date.now().toString().slice(-4)}`,
            date: new Date().toISOString().split("T")[0],
            description: `${expenseData.category}: ${expenseData.description}`,
            reference: expenseData.vehicleStock || "GENERAL_OVERHEAD",
            debitAccount: "5020 - COGS - Freight & Port Clearance",
            creditAccount: "1010 - Showroom Central Cash Safe",
            amountUSD: expenseData.amountUSD,
            amountAFN: Math.round(expenseData.amountUSD * state.exchangeRate),
          };

          return {
            expenses: [newExpense, ...state.expenses],
            vehicles: updatedVehicles,
            journalEntries: [newJe, ...state.journalEntries],
          };
        }),

      // Suppliers & Supplier Ledger
      suppliers: INITIAL_SUPPLIERS,
      addSupplier: (supData) =>
        set((state) => {
          const newId = `sup-${Date.now().toString().slice(-4)}`;
          const newSup: SupplierRecord = {
            ...supData,
            id: newId,
            bills: [],
            totalPurchasedUSD: 0,
            totalPaidUSD: 0,
            balanceUSD: 0,
          };
          return { suppliers: [newSup, ...state.suppliers] };
        }),

      addSupplierBill: (billData) =>
        set((state) => {
          const newId = `bill-${Date.now().toString().slice(-4)}`;
          const newBill: SupplierBillRecord = {
            ...billData,
            id: newId,
          };

          const updatedSuppliers = state.suppliers.map((sup) => {
            if (sup.id === billData.supplierId) {
              const newPurchased = sup.totalPurchasedUSD + billData.amountUSD;
              const newBal = newPurchased - sup.totalPaidUSD;
              return {
                ...sup,
                totalPurchasedUSD: newPurchased,
                balanceUSD: newBal,
                bills: [newBill, ...sup.bills],
              };
            }
            return sup;
          });

          // Journal Entry for Supplier Bill (Accounts Payable Debit Asset / Credit AP)
          const newJe: JournalEntryRecord = {
            id: `je-${Date.now().toString().slice(-4)}`,
            entryNumber: `JE-BILL-${Date.now().toString().slice(-4)}`,
            date: billData.issueDate || new Date().toISOString().split("T")[0],
            description: `Vehicle purchase bill: ${billData.vehicleDescription || "Consignment"}`,
            reference: billData.billNumber,
            debitAccount: "1040 - Vehicle Inventory Asset (Lot & Port)",
            creditAccount: "2010 - Accounts Payable (Auto Suppliers UAE/Japan)",
            amountUSD: billData.amountUSD,
            amountAFN: Math.round(billData.amountUSD * state.exchangeRate),
          };

          return {
            suppliers: updatedSuppliers,
            journalEntries: [newJe, ...state.journalEntries],
          };
        }),

      recordSupplierPayment: (supplierId, amountUSD, paymentMethod, referenceNumber, sarrafiAccount) =>
        set((state) => {
          const updatedSuppliers = state.suppliers.map((sup) => {
            if (sup.id === supplierId) {
              const newPaid = sup.totalPaidUSD + amountUSD;
              const newBal = sup.totalPurchasedUSD - newPaid;
              return {
                ...sup,
                totalPaidUSD: newPaid,
                balanceUSD: newBal,
              };
            }
            return sup;
          });

          const targetSup = state.suppliers.find((s) => s.id === supplierId);
          const newVoucher: PaymentVoucherRecord = {
            id: `pv-${Date.now().toString().slice(-4)}`,
            voucherNumber: `PV-SUP-${Math.floor(100 + Math.random() * 900)}`,
            voucherType: "SUPPLIER_PAYMENT",
            date: new Date().toISOString().split("T")[0],
            partyName: targetSup?.companyName || "International Auto Supplier",
            partyPhone: targetSup?.phone,
            amountUSD,
            amountAFN: Math.round(amountUSD * state.exchangeRate),
            exchangeRate: state.exchangeRate,
            paymentMethod: paymentMethod || "Sarrafi Hawala (حواله صرافی)",
            sarrafiAccount: sarrafiAccount || "Sarrafi Khorasan Market Holding Safe",
            referenceNumber: referenceNumber || `HWL-${Date.now().toString().slice(-5)}`,
            supplierId,
            purpose: `Supplier account payoff for consignment imports`,
            recordedBy: state.currentRole,
          };

          const newJe: JournalEntryRecord = {
            id: `je-${Date.now().toString().slice(-4)}`,
            entryNumber: `JE-PAY-${Date.now().toString().slice(-4)}`,
            date: new Date().toISOString().split("T")[0],
            description: `Payment payoff to ${targetSup?.companyName || "Supplier"}`,
            reference: newVoucher.voucherNumber,
            debitAccount: "2010 - Accounts Payable (Auto Suppliers UAE/Japan)",
            creditAccount: paymentMethod?.includes("Cash")
              ? "1010 - Showroom Central Cash Safe"
              : "1020 - Sarrafi Khorasan Holding Account",
            amountUSD,
            amountAFN: Math.round(amountUSD * state.exchangeRate),
          };

          return {
            suppliers: updatedSuppliers,
            payments: [newVoucher, ...state.payments],
            journalEntries: [newJe, ...state.journalEntries],
          };
        }),

      // Invoices
      invoices: INITIAL_INVOICES,
      addInvoice: (invoiceData) =>
        set((state) => {
          const randomNum = Math.floor(1000 + Math.random() * 9000);
          const invoiceNumber = `INV-HRT-2026-${randomNum}`;
          const newInvoice: InvoiceRecord = {
            ...invoiceData,
            id: `inv-${Date.now().toString().slice(-4)}`,
            invoiceNumber,
          };

          return { invoices: [newInvoice, ...state.invoices] };
        }),

      updateInvoiceStatus: (invoiceId, status) =>
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === invoiceId ? { ...inv, status } : inv
          ),
        })),

      // Payment Vouchers
      payments: INITIAL_PAYMENTS,
      addPaymentVoucher: (voucherData) =>
        set((state) => {
          const randomNum = Math.floor(100 + Math.random() * 900);
          const prefix =
            voucherData.voucherType === "CUSTOMER_PAYMENT"
              ? "PV-REC"
              : voucherData.voucherType === "SUPPLIER_PAYMENT"
              ? "PV-PAY"
              : "PV-EXP";
          const voucherNumber = `${prefix}-2026-${randomNum}`;

          const newVoucher: PaymentVoucherRecord = {
            ...voucherData,
            id: `pv-${Date.now().toString().slice(-4)}`,
            voucherNumber,
          };

          // Automatic journal entry
          const debitAcct =
            voucherData.voucherType === "CUSTOMER_PAYMENT"
              ? voucherData.paymentMethod.includes("Cash")
                ? "1010 - Showroom Central Cash Safe"
                : "1020 - Sarrafi Khorasan Holding Account"
              : voucherData.voucherType === "SUPPLIER_PAYMENT"
              ? "2010 - Accounts Payable (Auto Suppliers UAE/Japan)"
              : "5020 - COGS - Freight & Port Clearance";

          const creditAcct =
            voucherData.voucherType === "CUSTOMER_PAYMENT"
              ? "4010 - Vehicle Sales Revenue"
              : voucherData.paymentMethod.includes("Cash")
              ? "1010 - Showroom Central Cash Safe"
              : "1020 - Sarrafi Khorasan Holding Account";

          const newJe: JournalEntryRecord = {
            id: `je-${Date.now().toString().slice(-4)}`,
            entryNumber: `JE-${Date.now().toString().slice(-4)}`,
            date: voucherData.date || new Date().toISOString().split("T")[0],
            description: voucherData.purpose,
            reference: voucherNumber,
            debitAccount: debitAcct,
            creditAccount: creditAcct,
            amountUSD: voucherData.amountUSD,
            amountAFN: voucherData.amountAFN,
          };

          return {
            payments: [newVoucher, ...state.payments],
            journalEntries: [newJe, ...state.journalEntries],
          };
        }),

      // Accounting & Chart of Accounts
      accounts: INITIAL_ACCOUNTS,
      journalEntries: INITIAL_JOURNAL_ENTRIES,
      addJournalEntry: (entryData) =>
        set((state) => {
          const entryNumber = `JE-2026-${Math.floor(100 + Math.random() * 900)}`;
          const newEntry: JournalEntryRecord = {
            ...entryData,
            id: `je-${Date.now().toString().slice(-4)}`,
            entryNumber,
          };
          return { journalEntries: [newEntry, ...state.journalEntries] };
        }),
    }),
    {
      name: "sadozai_motors_storage",
    }
  )
);
