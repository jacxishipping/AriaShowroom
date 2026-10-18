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

  // UI/UX Enhancements: Favorites & Comparison
  favoriteIds: string[];
  toggleFavorite: (id: string) => void;
  compareIds: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;

  // Quick Status Actions
  setVehicleStatus: (id: string, status: VehicleItem["status"]) => void;
  batchUpdateVehicleStatus: (ids: string[], status: VehicleItem["status"]) => void;

  // Toast Notification System
  toasts: Array<{ id: string; type: "success" | "info" | "warning" | "error"; message: string }>;
  addToast: (message: string, type?: "success" | "info" | "warning" | "error") => void;
  removeToast: (id: string) => void;

  // Showroom Activity Notifications
  notifications: Array<{
    id: string;
    title: string;
    desc: string;
    time: string;
    read: boolean;
    type: "customs" | "sale" | "lead" | "rate";
  }>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Live PostgreSQL Database Sync
  fetchDatabaseRecords: () => Promise<void>;
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

      // UI/UX Enhancements: Favorites & Comparison
      favoriteIds: [],
      toggleFavorite: (id) =>
        set((state) => {
          const exists = state.favoriteIds.includes(id);
          const next = exists
            ? state.favoriteIds.filter((favId) => favId !== id)
            : [...state.favoriteIds, id];
          return { favoriteIds: next };
        }),

      compareIds: [],
      toggleCompare: (id) =>
        set((state) => {
          const exists = state.compareIds.includes(id);
          if (exists) {
            return { compareIds: state.compareIds.filter((cId) => cId !== id) };
          }
          if (state.compareIds.length >= 3) {
            return state; // maximum 3 vehicles to compare side-by-side
          }
          return { compareIds: [...state.compareIds, id] };
        }),
      clearCompare: () => set({ compareIds: [] }),

      // Quick Status Actions with Toast
      setVehicleStatus: (id, status) =>
        set((state) => {
          const target = state.vehicles.find((v) => v.id === id);
          const updated = state.vehicles.map((v) => (v.id === id ? { ...v, status } : v));
          const toastId = `toast-${Date.now()}`;
          const newToast = {
            id: toastId,
            type: "success" as const,
            message: target
              ? `${target.make} ${target.model} status changed to "${status}"`
              : `Vehicle status changed to "${status}"`,
          };
          return {
            vehicles: updated,
            toasts: [...state.toasts, newToast],
          };
        }),

      batchUpdateVehicleStatus: (ids, status) =>
        set((state) => {
          const updated = state.vehicles.map((v) =>
            ids.includes(v.id) ? { ...v, status } : v
          );
          const toastId = `toast-${Date.now()}`;
          return {
            vehicles: updated,
            toasts: [
              ...state.toasts,
              {
                id: toastId,
                type: "success",
                message: `Updated status for ${ids.length} vehicle(s) to "${status}"`,
              },
            ],
          };
        }),

      // Toast Notification System
      toasts: [],
      addToast: (message, type = "info") =>
        set((state) => ({
          toasts: [
            ...state.toasts,
            { id: `toast-${Date.now()}-${Math.random()}`, type, message },
          ],
        })),
      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      // Showroom Activity Notifications
      notifications: [
        {
          id: "notif-1",
          title: "Customs Clearance Verified",
          desc: "Toyota Land Cruiser 300 VXR (SM-HRT-101) negative plate papers stamped at Gomrok Herat.",
          time: "10 mins ago",
          read: false,
          type: "customs",
        },
        {
          id: "notif-2",
          title: "Deposit Paid & Reserved",
          desc: "Lexus LX 570 Super Sport (SM-HRT-102) reserved by Haji Mohammad Gul. Deposit: $15,000 USD.",
          time: "45 mins ago",
          read: false,
          type: "sale",
        },
        {
          id: "notif-3",
          title: "New High-Value Inquiry",
          desc: "Customer inquiry received via WhatsApp for Hilux Revo Rocco (SM-HRT-103).",
          time: "2 hours ago",
          read: false,
          type: "lead",
        },
        {
          id: "notif-4",
          title: "Sarrafi Exchange Rate Alert",
          desc: "Herat market rate settled at $1 USD = 70.5 AFN. Accounting ledgers synced.",
          time: "5 hours ago",
          read: true,
          type: "rate",
        },
      ],
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      // Live PostgreSQL Database Sync
      fetchDatabaseRecords: async () => {
        try {
          const [vehRes, custRes, invRes, vouchRes, suppRes, expRes, jeRes] = await Promise.all([
            fetch("/api/vehicles").then((r) => r.json()).catch(() => null),
            fetch("/api/customers").then((r) => r.json()).catch(() => null),
            fetch("/api/invoices").then((r) => r.json()).catch(() => null),
            fetch("/api/vouchers").then((r) => r.json()).catch(() => null),
            fetch("/api/suppliers").then((r) => r.json()).catch(() => null),
            fetch("/api/expenses").then((r) => r.json()).catch(() => null),
            fetch("/api/journal-entries").then((r) => r.json()).catch(() => null),
          ]);

          if (vehRes?.success && Array.isArray(vehRes.data) && vehRes.data.length > 0) {
            const statusMap: Record<string, VehicleItem["status"]> = {
              AVAILABLE: "Available on Lot",
              IN_TRANSIT: "In Transit",
              RESERVED: "Reserved/Deposit Paid",
              SOLD: "Sold",
              UNDER_PREP: "Under Prep/Maintenance",
            };

            const steeringMap: Record<string, VehicleItem["steering"]> = {
              LEFT_HAND: "Left-Hand Drive (LHD)",
              RIGHT_HAND_CONVERTED: "Right-Hand Drive (RHD Converted)",
            };

            const fuelMap: Record<string, VehicleItem["fuelType"]> = {
              PETROL: "Petrol",
              HYBRID: "Hybrid",
              DIESEL: "Diesel",
              ELECTRIC: "Electric",
            };

            const transMap: Record<string, VehicleItem["transmission"]> = {
              AUTOMATIC: "Automatic",
              MANUAL: "Manual",
            };

            const mappedVehicles: VehicleItem[] = vehRes.data.map((v: any) => {
              const imageUrls =
                Array.isArray(v.images) && v.images.length > 0
                  ? v.images.map((img: any) => img.url)
                  : [
                      "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1400&q=85",
                    ];

              return {
                id: v.id,
                stockNumber: v.stockNumber,
                vin: v.vin,
                make: v.make,
                model: v.model,
                year: v.year,
                trim: v.trim || "",
                bodyType: v.bodyType || "SUV",
                originCountry: v.originCountry || "UAE",
                steering: steeringMap[v.steering] || "Left-Hand Drive (LHD)",
                customsClearance: v.customsClearance || "Gomrok Herat - Verified",
                cleanTitle: Boolean(v.cleanTitle),
                mileage: v.mileage,
                fuelType: fuelMap[v.fuelType] || "Petrol",
                transmission: transMap[v.transmission] || "Automatic",
                driveType: v.driveType || "4WD",
                color: v.color || "White",
                status: statusMap[v.status] || "Available on Lot",
                purchasePrice: v.purchasePrice || 0,
                freightCost: v.freightCost || 0,
                customsDuty: v.customsDuty || 0,
                repairCost: v.repairCost || 0,
                landedCost: v.landedCost || 0,
                minTargetPrice: v.minTargetPrice || 0,
                sellingPrice: v.sellingPrice || 0,
                features: v.features || [],
                description: v.description || "",
                descriptionDari: v.descriptionDari || "",
                conditionNotes: v.conditionNotes || {
                  exterior: "Clean original condition",
                  interior: "Leather interior, smoke-free",
                  engine: "Factory standard inspection",
                  tires: "Good condition",
                  accidentHistory: "Clean Title",
                },
                images: imageUrls,
                documents: v.documents || [],
                viewsCount: 0,
                inquiriesCount: 0,
              };
            });

            set({ vehicles: mappedVehicles });
          }

          if (custRes?.success && Array.isArray(custRes.data) && custRes.data.length > 0) {
            const leadMap: Record<string, CustomerRecord["leadStage"]> = {
              NEW_INQUIRY: "New Inquiry",
              FOLLOW_UP: "Follow-Up",
              TEST_DRIVE: "Test Drive",
              NEGOTIATION: "Negotiation",
              CLOSED_WON: "Closed/Won",
              LOST: "Lost",
            };

            const mappedCusts: CustomerRecord[] = custRes.data.map((c: any) => ({
              id: c.id,
              fullName: c.fullName,
              phone: c.phone,
              whatsapp: c.whatsapp || c.phone,
              tazkiraNumber: c.tazkiraNumber,
              city: c.city || "Herat",
              address: c.address || "",
              tradeInRecord: c.tradeInRecord || undefined,
              leadStage: leadMap[c.leadStage] || "New Inquiry",
              budget: 45000,
              interestedInVehicleId: "",
              notes: c.notes || "",
              createdAt: c.createdAt ? new Date(c.createdAt).toISOString().split("T")[0] : "",
            }));

            set({ customers: mappedCusts });
          }

          // Live Invoices Sync
          if (invRes?.success && Array.isArray(invRes.data) && invRes.data.length > 0) {
            set({ invoices: invRes.data });
          }

          // Live Payment Vouchers Sync
          if (vouchRes?.success && Array.isArray(vouchRes.data) && vouchRes.data.length > 0) {
            set({ payments: vouchRes.data });
          }

          // Live Suppliers Sync
          if (suppRes?.success && Array.isArray(suppRes.data) && suppRes.data.length > 0) {
            set({ suppliers: suppRes.data });
          }

          // Live Expenses Sync
          if (expRes?.success && Array.isArray(expRes.data) && expRes.data.length > 0) {
            set({
              expenses: expRes.data.map((e: any) => ({
                id: e.id,
                category: e.category,
                amountUSD: e.amount,
                amountAFN: Math.round(e.amount * 70.5),
                description: e.description,
                payee: e.payee || "Vendor",
                receiptNumber: e.receiptNum || "",
                date: e.date ? new Date(e.date).toISOString().split("T")[0] : "",
              })),
            });
          }

          // Live Journal Entries Sync
          if (jeRes?.success && Array.isArray(jeRes.data) && jeRes.data.length > 0) {
            set({ journalEntries: jeRes.data });
          }
        } catch (error) {
          console.warn("Failed syncing from database, using cached showroom state:", error);
        }
      },
    }),
    {
      name: "sadozai_motors_storage",
    }
  )
);
