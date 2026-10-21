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

export interface PinnedView {
  id: string;
  name: string;
  nameFa?: string;
  namePs?: string;
  isSystem?: boolean;
  filters: Partial<FilterState>;
}

export interface ChartFilterState {
  dimension: "originCountry" | "fuelType" | "bodyType" | "make" | "status";
  value: string;
}

interface ShowroomStore {
  // Global App Settings
  currency: CurrencyType;
  exchangeRate: number; // AFN per USD (e.g. 70.5)
  language: LanguageType;
  currentRole: RoleType;
  darkMode: boolean;
  mobileDrawerOpen: boolean;
  clientPresentationMode: boolean;
  activeBranch: string;

  // Google Platform Workspace State
  inspectedVehicleId: string | null;
  setInspectedVehicleId: (id: string | null) => void;
  isShortcutsModalOpen: boolean;
  setIsShortcutsModalOpen: (open: boolean) => void;
  chartFilter: ChartFilterState | null;
  setChartFilter: (filter: ChartFilterState | null) => void;
  pinnedViews: PinnedView[];
  activePinnedViewId: string;
  applyPinnedView: (viewId: string) => void;
  savePinnedView: (name: string) => void;
  deletePinnedView: (viewId: string) => void;

  // Actions for App Settings
  setCurrency: (currency: CurrencyType) => void;
  setExchangeRate: (rate: number) => void;
  setLanguage: (lang: LanguageType) => void;
  setCurrentRole: (role: RoleType) => void;
  toggleDarkMode: () => void;
  setMobileDrawerOpen: (open: boolean) => void;
  toggleMobileDrawer: () => void;
  toggleClientPresentationMode: () => void;
  setActiveBranch: (branch: string) => void;

  // Vehicles
  vehicles: VehicleItem[];
  filters: FilterState;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  addVehicle: (vehicle: Omit<VehicleItem, "id" | "viewsCount" | "inquiriesCount">) => Promise<VehicleItem>;
  updateVehicle: (id: string, updates: Partial<VehicleItem>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;

  // CRM Leads
  customers: CustomerRecord[];
  addCustomer: (customer: Omit<CustomerRecord, "id" | "createdAt">) => Promise<void>;
  updateCustomerStage: (customerId: string, stage: CustomerRecord["leadStage"]) => Promise<void>;
  batchUpdateCustomerStage: (customerIds: string[], stage: CustomerRecord["leadStage"]) => Promise<void>;

  // Sales & Transactions
  sales: SaleRecord[];
  addSale: (sale: Omit<SaleRecord, "id" | "contractNumber" | "saleDate">) => Promise<void>;

  // Expenses & Vehicle Cost Allocation
  expenses: ExpenseRecord[];
  addExpense: (expense: Omit<ExpenseRecord, "id" | "date">) => Promise<void>;

  // Suppliers & Supplier Ledger
  suppliers: SupplierRecord[];
  addSupplier: (supplier: Omit<SupplierRecord, "id" | "bills" | "totalPurchasedUSD" | "totalPaidUSD" | "balanceUSD">) => Promise<void>;
  addSupplierBill: (bill: Omit<SupplierBillRecord, "id">) => Promise<void>;
  recordSupplierPayment: (supplierId: string, amountUSD: number, paymentMethod: any, referenceNumber?: string, sarrafiAccount?: string) => Promise<void>;

  // Commercial Invoicing
  invoices: InvoiceRecord[];
  addInvoice: (invoice: Omit<InvoiceRecord, "id" | "invoiceNumber">) => Promise<void>;
  updateInvoiceStatus: (invoiceId: string, status: InvoiceRecord["status"]) => Promise<void>;

  // Payment Vouchers Engine
  payments: PaymentVoucherRecord[];
  addPaymentVoucher: (voucher: Omit<PaymentVoucherRecord, "id" | "voucherNumber">) => Promise<void>;

  // Accounting & Chart of Accounts
  accounts: AccountRecord[];
  journalEntries: JournalEntryRecord[];
  addJournalEntry: (entry: Omit<JournalEntryRecord, "id" | "entryNumber">) => Promise<void>;

  // UI/UX Enhancements: Favorites & Comparison
  favoriteIds: string[];
  toggleFavorite: (id: string) => void;
  compareIds: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;

  // Quick Status & Batch Actions
  setVehicleStatus: (id: string, status: VehicleItem["status"]) => Promise<void>;
  batchUpdateVehicleStatus: (ids: string[], status: VehicleItem["status"]) => Promise<void>;
  batchAdjustVehiclePrice: (ids: string[], percentDelta: number) => Promise<void>;

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

export const DEFAULT_PINNED_VIEWS: PinnedView[] = [
  {
    id: "all-fleet",
    name: "All Fleet Registry",
    nameFa: "تمام موجودی موترها",
    namePs: "ټول موټرونه",
    isSystem: true,
    filters: {},
  },
  {
    id: "showroom-ready",
    name: "Showroom Ready (On Lot)",
    nameFa: "موجود در نمایشگاه",
    namePs: "په نندارتون کې موجود",
    isSystem: true,
    filters: { status: "Available on Lot" },
  },
  {
    id: "islam-qala-transit",
    name: "Islam Qala In-Transit",
    nameFa: "در مسیر گمرک اسلام قلعه",
    namePs: "د اسلام قلعه په لاره کې",
    isSystem: true,
    filters: { status: "In Transit" },
  },
  {
    id: "hybrid-fleet",
    name: "Hybrid & Eco Fleet",
    nameFa: "موترهای هیبرید و کم‌مصرف",
    namePs: "هایبرډ موټرونه",
    isSystem: true,
    filters: { fuelType: "Hybrid" },
  },
  {
    id: "gcc-dubai",
    name: "GCC / Dubai Imports",
    nameFa: "واردات دبی و خلیج",
    namePs: "د دوبۍ واردات",
    isSystem: true,
    filters: { originCountry: "UAE" },
  },
  {
    id: "exec-suvs",
    name: "Executive SUVs (<$85k)",
    nameFa: "شاسی‌بلندهای ویژه",
    namePs: "لوړ شاسي موټرونه",
    isSystem: true,
    filters: { bodyType: "SUV", maxPrice: 85000 },
  },
];

async function writeRecord(path: string, data: unknown, method = "POST") {
  try {
    const response = await fetch(path, {
      method,
      ...(data === undefined ? {} : {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    });
    const result = await response.json().catch(() => null);
    if (result?.fallback) {
      return null;
    }
    return result?.data ?? null;
  } catch {
    return null;
  }
}

const vehicleStatusToDatabase = {
  "In Transit": "IN_TRANSIT",
  "Under Prep/Maintenance": "UNDER_PREP",
  "Available on Lot": "AVAILABLE",
  "Reserved/Deposit Paid": "RESERVED",
  Sold: "SOLD",
} as const;

const customerStageToDatabase = {
  "New Inquiry": "NEW_INQUIRY",
  "Follow-Up": "FOLLOW_UP",
  "Test Drive": "TEST_DRIVE",
  Negotiation: "NEGOTIATION",
  "Closed/Won": "CLOSED_WON",
  Lost: "LOST",
} as const;

function vehicleToDatabase(vehicle: Partial<VehicleItem>) {
  return {
    ...vehicle,
    status: vehicle.status ? vehicleStatusToDatabase[vehicle.status] : undefined,
    steering: vehicle.steering === "Right-Hand Drive (RHD Converted)" ? "RIGHT_HAND_CONVERTED" : vehicle.steering ? "LEFT_HAND" : undefined,
    fuelType: vehicle.fuelType?.toUpperCase(),
    transmission: vehicle.transmission?.toUpperCase(),
    conditionNotes: vehicle.conditionNotes || vehicle.yardLocation
      ? { ...vehicle.conditionNotes, ...(vehicle.yardLocation ? { yardLocation: vehicle.yardLocation } : {}) }
      : undefined,
  };
}

export const useShowroomStore = create<ShowroomStore>()(
  persist(
    (set, get) => ({
      currency: "USD",
      exchangeRate: 70.5,
      language: "en",
      currentRole: "SuperAdmin",
      darkMode: false,
      mobileDrawerOpen: false,
      clientPresentationMode: false,
      activeBranch: "Herat HQ · Bagh-e-Azadi",

      inspectedVehicleId: null,
      setInspectedVehicleId: (id) => set({ inspectedVehicleId: id }),
      isShortcutsModalOpen: false,
      setIsShortcutsModalOpen: (open) => set({ isShortcutsModalOpen: open }),
      chartFilter: null,
      setChartFilter: (chartFilter) => set({ chartFilter }),
      pinnedViews: DEFAULT_PINNED_VIEWS,
      activePinnedViewId: "all-fleet",

      applyPinnedView: (viewId) => {
        const target = get().pinnedViews.find((v) => v.id === viewId);
        if (!target) return;
        set({
          activePinnedViewId: viewId,
          chartFilter: null,
          filters: {
            ...initialFilters,
            ...target.filters,
          },
        });
      },

      savePinnedView: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const currentFilters = get().filters;
        const newView: PinnedView = {
          id: `view-${Date.now()}`,
          name: trimmed,
          isSystem: false,
          filters: { ...currentFilters },
        };
        set((state) => ({
          pinnedViews: [...state.pinnedViews, newView],
          activePinnedViewId: newView.id,
        }));
        get().addToast(`Pinned custom view "${trimmed}" to workspace`, "success");
      },

      deletePinnedView: (viewId) => {
        set((state) => {
          const next = state.pinnedViews.filter((v) => v.id !== viewId || v.isSystem);
          return {
            pinnedViews: next,
            activePinnedViewId:
              state.activePinnedViewId === viewId ? "all-fleet" : state.activePinnedViewId,
          };
        });
        get().addToast("Removed custom pinned view", "info");
      },

      setCurrency: (currency) => set({ currency }),
      setExchangeRate: (exchangeRate) => set({ exchangeRate }),
      setLanguage: (language) => set({ language }),
      setCurrentRole: (currentRole) => set({ currentRole }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setMobileDrawerOpen: (open) => set({ mobileDrawerOpen: open }),
      toggleMobileDrawer: () => set((state) => ({ mobileDrawerOpen: !state.mobileDrawerOpen })),
      toggleClientPresentationMode: () =>
        set((state) => ({ clientPresentationMode: !state.clientPresentationMode })),
      setActiveBranch: (activeBranch) => set({ activeBranch }),

      vehicles: INITIAL_VEHICLES,
      filters: initialFilters,

      setFilter: (key, value) =>
        set((state) => ({
          activePinnedViewId: "custom",
          filters: { ...state.filters, [key]: value },
        })),

      resetFilters: () =>
        set({
          activePinnedViewId: "all-fleet",
          chartFilter: null,
          filters: initialFilters,
        }),

      addVehicle: async (vehicleData) => {
        const newVehicle: VehicleItem = {
          ...vehicleData,
          id: `veh-${Date.now()}`,
          viewsCount: 1,
          inquiriesCount: 0,
        };
        set((state) => ({
          vehicles: [newVehicle, ...state.vehicles],
        }));
        await writeRecord("/api/vehicles", vehicleToDatabase(vehicleData));
        await get().fetchDatabaseRecords();
        return get().vehicles.find((item) => item.stockNumber === vehicleData.stockNumber) || newVehicle;
      },

      updateVehicle: async (id, updates) => {
        set((state) => ({
          vehicles: state.vehicles.map((v) =>
            v.id === id || v.stockNumber === id ? { ...v, ...updates } : v
          ),
        }));
        await writeRecord(`/api/vehicles/${encodeURIComponent(id)}`, vehicleToDatabase(updates), "PATCH");
        await get().fetchDatabaseRecords();
      },

      deleteVehicle: async (id) => {
        set((state) => ({
          vehicles: state.vehicles.filter((v) => v.id !== id && v.stockNumber !== id),
        }));
        await writeRecord(`/api/vehicles/${encodeURIComponent(id)}`, undefined, "DELETE");
        await get().fetchDatabaseRecords();
      },

      customers: INITIAL_CUSTOMERS,
      addCustomer: async (customerData) => {
        const newCustomer: CustomerRecord = {
          ...customerData,
          id: `cust-${Date.now()}`,
          createdAt: new Date().toISOString().split("T")[0],
        };
        set((state) => ({
          customers: [newCustomer, ...state.customers],
        }));
        await writeRecord("/api/customers", {
          fullName: customerData.fullName,
          phone: customerData.phone,
          whatsapp: customerData.whatsapp,
          tazkiraNumber: customerData.tazkiraNumber,
          city: customerData.city,
          address: customerData.address,
          tradeInRecord: customerData.tradeInRecord,
          budget: customerData.budget,
          interestedInVehicleId: customerData.interestedInVehicleId,
          notes: customerData.notes,
          leadStage: customerStageToDatabase[customerData.leadStage],
        });
        await get().fetchDatabaseRecords();
      },

      updateCustomerStage: async (customerId, stage) => {
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === customerId ? { ...c, leadStage: stage } : c
          ),
        }));
        await writeRecord("/api/customers", {
          customerId,
          leadStage: customerStageToDatabase[stage],
        }, "PATCH");
        await get().fetchDatabaseRecords();
      },

      batchUpdateCustomerStage: async (customerIds, stage) => {
        set((state) => ({
          customers: state.customers.map((c) =>
            customerIds.includes(c.id) ? { ...c, leadStage: stage } : c
          ),
        }));
        await Promise.all(
          customerIds.map((customerId) =>
            writeRecord(
              "/api/customers",
              {
                customerId,
                leadStage: customerStageToDatabase[stage],
              },
              "PATCH"
            )
          )
        );
        await get().fetchDatabaseRecords();
        get().addToast(
          `Updated ${customerIds.length} CRM lead(s) to "${stage}"`,
          "success"
        );
      },

      sales: INITIAL_SALES,
      addSale: async (saleData) => {
        const vehicle = get().vehicles.find((item) => item.stockNumber === saleData.stockNumber);
        const newSale: SaleRecord = {
          ...saleData,
          id: `sale-${Date.now()}`,
          contractNumber: `SM-DEED-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
          saleDate: new Date().toISOString().split("T")[0],
        };
        set((state) => ({
          sales: [newSale, ...state.sales],
        }));

        if (vehicle) {
          await writeRecord("/api/sales", {
            vehicleId: vehicle.id,
            customerName: saleData.customerName,
            customerPhone: saleData.customerPhone,
            customerTazkira: saleData.customerTazkira,
            salePrice: saleData.salePriceUSD,
            currency: "USD",
            exchangeRate: saleData.exchangeRate,
            paymentType: saleData.paymentType === "Installment Plan"
              ? "INSTALLMENT"
              : saleData.paymentType === "Hawala / Bank Transfer"
              ? "BANK_TRANSFER"
              : "CASH",
            downPaymentUSD: saleData.downPaymentUSD,
            installmentsRemaining: saleData.installmentsRemaining,
          });
          await get().fetchDatabaseRecords();
        }
      },

      expenses: INITIAL_EXPENSES,
      addExpense: async (expenseData) => {
        const state = get();
        const vehicle = expenseData.vehicleStock
          ? state.vehicles.find((item) => item.stockNumber === expenseData.vehicleStock)
          : undefined;
        const newExpense: ExpenseRecord = {
          ...expenseData,
          id: `exp-${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
        };
        set((curr) => ({
          expenses: [newExpense, ...curr.expenses],
        }));

        await writeRecord("/api/expenses", {
          category: expenseData.category,
          amount: expenseData.amountUSD,
          currency: "USD",
          description: expenseData.description,
          payee: expenseData.payee,
          receiptNum: expenseData.receiptNumber,
          vehicleId: vehicle?.id,
          exchangeRate: state.exchangeRate,
        });
        await get().fetchDatabaseRecords();
      },

      // Suppliers & Supplier Ledger
      suppliers: INITIAL_SUPPLIERS,
      addSupplier: async (supplierData) => {
        const newSupplier: SupplierRecord = {
          ...supplierData,
          id: `supp-${Date.now()}`,
          totalPurchasedUSD: 0,
          totalPaidUSD: 0,
          balanceUSD: 0,
          bills: [],
        };
        set((state) => ({
          suppliers: [newSupplier, ...state.suppliers],
        }));
        await writeRecord("/api/suppliers", supplierData);
        await get().fetchDatabaseRecords();
      },

      addSupplierBill: async (billData) => {
        const newBill: SupplierBillRecord = {
          ...billData,
          id: `bill-${Date.now()}`,
        };
        set((state) => ({
          suppliers: state.suppliers.map((s) =>
            s.id === billData.supplierId
              ? {
                  ...s,
                  totalPurchasedUSD: s.totalPurchasedUSD + billData.amountUSD,
                  balanceUSD: s.balanceUSD + billData.amountUSD,
                  bills: [newBill, ...s.bills],
                }
              : s
          ),
        }));
        await writeRecord(`/api/suppliers/${encodeURIComponent(billData.supplierId)}/bills`, billData);
        await get().fetchDatabaseRecords();
      },

      recordSupplierPayment: async (supplierId, amountUSD, paymentMethod, referenceNumber, sarrafiAccount) => {
        const state = get();
        const supplier = state.suppliers.find((item) => item.id === supplierId);
        if (!supplier) return;

        set((curr) => ({
          suppliers: curr.suppliers.map((s) =>
            s.id === supplierId
              ? {
                  ...s,
                  totalPaidUSD: s.totalPaidUSD + amountUSD,
                  balanceUSD: Math.max(0, s.balanceUSD - amountUSD),
                }
              : s
          ),
        }));

        await writeRecord("/api/vouchers", {
          voucherType: "SUPPLIER_PAYMENT",
          partyName: supplier.companyName,
          partyPhone: supplier.phone,
          supplierId,
          amountUSD,
          amountAFN: Math.round(amountUSD * state.exchangeRate),
          exchangeRate: state.exchangeRate,
          paymentMethod,
          sarrafiAccount,
          referenceNumber,
          purpose: "Supplier account payoff",
          recordedBy: state.currentRole,
        });
        await get().fetchDatabaseRecords();
      },

      // Invoices
      invoices: INITIAL_INVOICES,
      addInvoice: async (invoiceData) => {
        const newInvoice: InvoiceRecord = {
          ...invoiceData,
          id: `inv-${Date.now()}`,
          invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        };
        set((state) => ({
          invoices: [newInvoice, ...state.invoices],
        }));
        await writeRecord("/api/invoices", invoiceData);
        await get().fetchDatabaseRecords();
      },

      updateInvoiceStatus: async (invoiceId, status) => {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === invoiceId ? { ...inv, status } : inv
          ),
        }));
        await writeRecord("/api/invoices", { invoiceId, status }, "PATCH");
        await get().fetchDatabaseRecords();
      },

      // Payment Vouchers
      payments: INITIAL_PAYMENTS,
      addPaymentVoucher: async (voucherData) => {
        const prefix =
          voucherData.voucherType === "CUSTOMER_PAYMENT"
            ? "RV"
            : voucherData.voucherType === "SUPPLIER_PAYMENT"
            ? "SV"
            : "EV";
        const newVoucher: PaymentVoucherRecord = {
          ...voucherData,
          id: `pv-${Date.now()}`,
          voucherNumber: `${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        };
        set((state) => ({
          payments: [newVoucher, ...state.payments],
        }));
        await writeRecord("/api/vouchers", voucherData);
        await get().fetchDatabaseRecords();
      },

      // Accounting & Chart of Accounts
      accounts: INITIAL_ACCOUNTS,
      journalEntries: INITIAL_JOURNAL_ENTRIES,
      addJournalEntry: async (entryData) => {
        const newEntry: JournalEntryRecord = {
          ...entryData,
          id: `je-${Date.now()}`,
          entryNumber: `JE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        };
        set((state) => ({
          journalEntries: [newEntry, ...state.journalEntries],
        }));
        await writeRecord("/api/journal-entries", entryData);
        await get().fetchDatabaseRecords();
      },

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
      setVehicleStatus: async (id, status) => {
        const target = get().vehicles.find((vehicle) => vehicle.id === id);
        await get().updateVehicle(id, { status });
        get().addToast(
          target
            ? `${target.make} ${target.model} status changed to "${status}"`
            : `Vehicle status changed to "${status}"`,
          "success"
        );
      },

      batchUpdateVehicleStatus: async (ids, status) => {
        set((state) => ({
          vehicles: state.vehicles.map((v) =>
            ids.includes(v.id) ? { ...v, status } : v
          ),
        }));
        await Promise.all(ids.map((id) => writeRecord(
          `/api/vehicles/${encodeURIComponent(id)}`,
          vehicleToDatabase({ status }),
          "PATCH"
        )));
        await get().fetchDatabaseRecords();
        get().addToast(`Updated status for ${ids.length} vehicle(s) to "${status}"`, "success");
      },

      batchAdjustVehiclePrice: async (ids, percentDelta) => {
        const factor = 1 + percentDelta / 100;
        set((state) => ({
          vehicles: state.vehicles.map((v) => {
            if (!ids.includes(v.id)) return v;
            const nextPrice = Math.round((v.sellingPrice * factor) / 100) * 100;
            return { ...v, sellingPrice: Math.max(1000, nextPrice) };
          }),
        }));
        const sign = percentDelta > 0 ? `+${percentDelta}%` : `${percentDelta}%`;
        get().addToast(
          `Adjusted selling price by ${sign} across ${ids.length} selected unit(s)`,
          "success"
        );
      },

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

      // Live PostgreSQL Database Sync (preserves cached/initial records when DB is offline or unconfigured)
      fetchDatabaseRecords: async () => {
        try {
          const [vehRes, custRes, saleRes, invRes, vouchRes, suppRes, expRes, jeRes, acctRes] = await Promise.all([
            fetch("/api/vehicles").then((r) => r.json()).catch(() => null),
            fetch("/api/customers").then((r) => r.json()).catch(() => null),
            fetch("/api/sales").then((r) => r.json()).catch(() => null),
            fetch("/api/invoices").then((r) => r.json()).catch(() => null),
            fetch("/api/vouchers").then((r) => r.json()).catch(() => null),
            fetch("/api/suppliers").then((r) => r.json()).catch(() => null),
            fetch("/api/expenses").then((r) => r.json()).catch(() => null),
            fetch("/api/journal-entries").then((r) => r.json()).catch(() => null),
            fetch("/api/accounts").then((r) => r.json()).catch(() => null),
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
                yardLocation: v.conditionNotes && typeof v.conditionNotes === "object"
                  ? (v.conditionNotes as Record<string, string>).yardLocation
                  : undefined,
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
              budget: Number(c.budget) || 0,
              interestedInVehicleId: c.interestedInVehicleId || "",
              notes: c.notes || "",
              createdAt: c.createdAt ? new Date(c.createdAt).toISOString().split("T")[0] : "",
            }));

            set({ customers: mappedCusts });
          }

          if (saleRes?.success && Array.isArray(saleRes.data) && saleRes.data.length > 0) {
            const paymentTypeMap: Record<string, SaleRecord["paymentType"]> = {
              CASH: "Full Cash",
              INSTALLMENT: "Installment Plan",
              BANK_TRANSFER: "Hawala / Bank Transfer",
            };

            const mappedSales: SaleRecord[] = saleRes.data.map((sale: any) => {
              const rate = Number(sale.exchangeRate) || 70.5;
              const salePriceUSD = sale.currency === "AFN"
                ? Number(sale.salePrice) / rate
                : Number(sale.salePrice);
              const installments = Array.isArray(sale.installments) ? sale.installments : [];
              const outstanding = installments
                .filter((installment: any) => installment.status !== "PAID")
                .reduce((total: number, installment: any) => total + Number(installment.amount || 0), 0);

              return {
                id: sale.id,
                stockNumber: sale.vehicle?.stockNumber || "",
                vehicleName: sale.vehicle
                  ? `${sale.vehicle.year} ${sale.vehicle.make} ${sale.vehicle.model}`
                  : "Vehicle",
                customerName: sale.customer?.fullName || "Customer",
                customerPhone: sale.customer?.phone || "",
                customerTazkira: sale.customer?.tazkiraNumber || "",
                salesAgent: sale.seller?.name || "Sales",
                salePriceUSD,
                exchangeRate: rate,
                paymentType: paymentTypeMap[sale.paymentType] || "Full Cash",
                downPaymentUSD: Math.max(salePriceUSD - outstanding, 0),
                installmentsRemaining: installments.filter((installment: any) => installment.status !== "PAID").length,
                contractNumber: sale.contractNumber,
                saleDate: sale.saleDate ? new Date(sale.saleDate).toISOString().split("T")[0] : "",
                status: outstanding > 0 ? "Pending Installments" : "Completed",
              };
            });

            set({ sales: mappedSales });
          }

          // Live Invoices Sync
          if (invRes?.success && Array.isArray(invRes.data) && invRes.data.length > 0) {
            set({
              invoices: invRes.data.map((invoice: any) => ({
                ...invoice,
                issueDate: invoice.issueDate ? new Date(invoice.issueDate).toISOString().split("T")[0] : "",
                dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split("T")[0] : undefined,
              })),
            });
          }

          // Live Payment Vouchers Sync
          if (vouchRes?.success && Array.isArray(vouchRes.data) && vouchRes.data.length > 0) {
            set({
              payments: vouchRes.data.map((payment: any) => ({
                ...payment,
                date: payment.date ? new Date(payment.date).toISOString().split("T")[0] : "",
              })),
            });
          }

          // Live Suppliers Sync
          if (suppRes?.success && Array.isArray(suppRes.data) && suppRes.data.length > 0) {
            set({
              suppliers: suppRes.data.map((supplier: any) => ({
                ...supplier,
                bills: (supplier.bills || []).map((bill: any) => ({
                  ...bill,
                  issueDate: bill.issueDate ? new Date(bill.issueDate).toISOString().split("T")[0] : "",
                  dueDate: bill.dueDate ? new Date(bill.dueDate).toISOString().split("T")[0] : undefined,
                })),
              })),
            });
          }

          // Live Expenses Sync
          if (expRes?.success && Array.isArray(expRes.data) && expRes.data.length > 0) {
            set({
              expenses: expRes.data.map((e: any) => ({
                id: e.id,
                category: e.category,
                amountUSD: e.amount,
                amountAFN: Math.round(e.amount * get().exchangeRate),
                description: e.description,
                payee: e.payee || "Vendor",
                receiptNumber: e.receiptNum || "",
                date: e.date ? new Date(e.date).toISOString().split("T")[0] : "",
                vehicleStock: e.vehicle?.stockNumber || undefined,
              })),
            });
          }

          // Live Journal Entries Sync
          if (jeRes?.success && Array.isArray(jeRes.data) && jeRes.data.length > 0) {
            set({
              journalEntries: jeRes.data.map((entry: any) => ({
                ...entry,
                date: entry.date ? new Date(entry.date).toISOString().split("T")[0] : "",
              })),
            });
          }

          if (acctRes?.success && Array.isArray(acctRes.data) && acctRes.data.length > 0) {
            set({ accounts: acctRes.data });
          }
        } catch {
          // Using cached showroom state when database is offline
        }
      },
    }),
    {
      name: "sadozai_motors_storage",
      version: 2,
      partialize: (state) => ({
        currency: state.currency,
        exchangeRate: state.exchangeRate,
        language: state.language,
        darkMode: state.darkMode,
        clientPresentationMode: state.clientPresentationMode,
        activeBranch: state.activeBranch,
        filters: state.filters,
        favoriteIds: state.favoriteIds,
        compareIds: state.compareIds,
        pinnedViews: state.pinnedViews,
        activePinnedViewId: state.activePinnedViewId,
      }),
      migrate: (persistedState) => {
        const state = persistedState as Partial<ShowroomStore> | undefined;
        return {
          currency: state?.currency || "USD",
          exchangeRate: state?.exchangeRate || 70.5,
          language: state?.language || "en",
          darkMode: Boolean(state?.darkMode),
          clientPresentationMode: Boolean(state?.clientPresentationMode),
          activeBranch: state?.activeBranch || "Herat HQ · Bagh-e-Azadi",
          filters: state?.filters || initialFilters,
          favoriteIds: state?.favoriteIds || [],
          compareIds: state?.compareIds || [],
          pinnedViews: state?.pinnedViews?.length ? state.pinnedViews : DEFAULT_PINNED_VIEWS,
          activePinnedViewId: state?.activePinnedViewId || "all-fleet",
        } as ShowroomStore;
      },
    }
  )
);
