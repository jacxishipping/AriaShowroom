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

export interface BrandingSettings {
  dealershipName: string;
  dealershipNameFa: string;
  dealershipNamePs: string;
  dealershipTagline: string;
  dealershipShortCode: string;
  licenseNumber: string;
  tinNumber: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  customsTerminalBranch: string;
  authorizedSignatory: string;
  signatoryTitle: string;
  sealStyle: "official_gold" | "chamber_blue" | "customs_red" | "minimal_black";
  logoPreset: "luxury_crest" | "monogram" | "crown" | "shield" | "custom";
  customLogoUrl: string;
  watermarkText: string;
  watermarkPosition: "bottom-right" | "bottom-left" | "center" | "diagonal";
  watermarkOpacity: number;
}

export interface ThemingSettings {
  themeMode: "light" | "dark" | "system";
  primaryColor: string;
  accentPresetId: string;
  borderRadius: number;
  fontFamily: "inter" | "jakarta" | "system" | "serif-luxury" | "mono";
  uiDensity: "comfortable" | "compact";
  glassmorphism: boolean;
  contrastMode: "standard" | "high-contrast";
}

export interface ThemePreset {
  id: string;
  name: string;
  nameFa: string;
  namePs: string;
  primaryColor: string;
  borderRadius: number;
  uiDensity: "comfortable" | "compact";
  fontFamily: "inter" | "jakarta" | "system" | "serif-luxury" | "mono";
  description: string;
}

export const DEFAULT_BRANDING: BrandingSettings = {
  dealershipName: "Aria Motors",
  dealershipNameFa: "نمایشگاه موتر آریا",
  dealershipNamePs: "د آریا موټر نندارتون",
  dealershipTagline: "Premier Luxury Automotive Showroom & Import Agency",
  dealershipShortCode: "ARI",
  licenseNumber: "Herat Dealership License #49912",
  tinNumber: "TIN-98234-AF",
  phone: "+93 79 910 2030",
  whatsapp: "+93 79 910 2030",
  email: "info@ariamotors.af",
  address: "Bagh-e-Azadi Boulevard, Herat, Afghanistan",
  customsTerminalBranch: "Islam Qala Dry Port Customs Terminal #3",
  authorizedSignatory: "Haji Ahmad Shah Aria",
  signatoryTitle: "President & Managing Director",
  sealStyle: "official_gold",
  logoPreset: "luxury_crest",
  customLogoUrl: "",
  watermarkText: "ARIA MOTORS HERAT · OFFICIAL INVENTORY",
  watermarkPosition: "bottom-right",
  watermarkOpacity: 0.35,
};

export const DEFAULT_THEMING: ThemingSettings = {
  themeMode: "light",
  primaryColor: "#1A73E8",
  accentPresetId: "default-blue",
  borderRadius: 8,
  fontFamily: "jakarta",
  uiDensity: "comfortable",
  glassmorphism: true,
  contrastMode: "standard",
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "default-blue",
    name: "Khorasan Google Blue",
    nameFa: "آبی کلاسیک خراسان",
    namePs: "د خراسان کلاسیک آبي",
    primaryColor: "#1A73E8",
    borderRadius: 8,
    uiDensity: "comfortable",
    fontFamily: "jakarta",
    description: "Modern enterprise Google Cloud console aesthetic with clean blues.",
  },
  {
    id: "royal-gold",
    name: "Aria Royal Gold",
    nameFa: "طلایی سلطنتی آریا",
    namePs: "د آریا شاهي طلايي",
    primaryColor: "#D97706",
    borderRadius: 12,
    uiDensity: "comfortable",
    fontFamily: "serif-luxury",
    description: "Prestigious luxury automotive look suited for Land Cruiser & Lexus showrooms.",
  },
  {
    id: "herat-emerald",
    name: "Herat Oasis Emerald",
    nameFa: "سبز زمردی هرات",
    namePs: "د هرات زمرودي شین",
    primaryColor: "#059669",
    borderRadius: 8,
    uiDensity: "comfortable",
    fontFamily: "inter",
    description: "Vibrant Afghan emerald green, symbolizing prosperity and trust.",
  },
  {
    id: "midnight-purple",
    name: "Executive Midnight",
    nameFa: "بنفش تشریفاتی شب",
    namePs: "د شپې تشریفاتي بنفش",
    primaryColor: "#7C3AED",
    borderRadius: 10,
    uiDensity: "comfortable",
    fontFamily: "jakarta",
    description: "Sophisticated deep violet tone with executive polish.",
  },
  {
    id: "crimson-red",
    name: "Imperial Crimson",
    nameFa: "قرمز یاقوتی درباری",
    namePs: "یاقوتي سور",
    primaryColor: "#DC2626",
    borderRadius: 6,
    uiDensity: "comfortable",
    fontFamily: "system",
    description: "High-impact bold crimson for sporty high-performance inventory.",
  },
  {
    id: "stealth-obsidian",
    name: "Stealth Slate & Steel",
    nameFa: "فولادی تیره و متالیک",
    namePs: "فولادي اوسپنیز",
    primaryColor: "#475569",
    borderRadius: 4,
    uiDensity: "compact",
    fontFamily: "mono",
    description: "Minimalist industrial precision for dense fleet data analysis.",
  },
];

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

  // Theming & Branding Engine
  branding: BrandingSettings;
  theming: ThemingSettings;
  updateBranding: (branding: Partial<BrandingSettings>) => void;
  updateTheming: (theming: Partial<ThemingSettings>) => void;
  applyThemePreset: (presetId: string) => void;
  resetBrandingToDefault: () => void;
  resetThemingToDefault: () => void;

  // Google Platform Workspace State
  inspectedVehicleId: string | null;
  setInspectedVehicleId: (id: string | null) => void;
  isShortcutsModalOpen: boolean;
  setIsShortcutsModalOpen: (open: boolean) => void;

  // First-Time Tutorial Walkthrough
  hasCompletedTutorial: boolean;
  isTutorialOpen: boolean;
  tutorialStep: number;
  setIsTutorialOpen: (open: boolean) => void;
  setTutorialStep: (step: number) => void;
  completeTutorial: (dontShowAgain?: boolean) => void;
  resetTutorial: () => void;
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
  updateCustomer: (customerId: string, updates: Partial<CustomerRecord>) => Promise<void>;
  deleteCustomer: (customerId: string) => Promise<void>;
  updateCustomerStage: (customerId: string, stage: CustomerRecord["leadStage"]) => Promise<void>;
  batchUpdateCustomerStage: (customerIds: string[], stage: CustomerRecord["leadStage"]) => Promise<void>;

  // Sales & Transactions
  sales: SaleRecord[];
  addSale: (sale: Omit<SaleRecord, "id" | "contractNumber" | "saleDate">) => Promise<void>;
  updateSale: (saleId: string, updates: Partial<SaleRecord>) => Promise<void>;
  deleteSale: (saleId: string, revertVehicleStatus?: boolean) => Promise<void>;

  // Expenses & Vehicle Cost Allocation
  expenses: ExpenseRecord[];
  addExpense: (expense: Omit<ExpenseRecord, "id" | "date">) => Promise<void>;
  updateExpense: (expenseId: string, updates: Partial<ExpenseRecord>) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;

  // Suppliers & Supplier Ledger
  suppliers: SupplierRecord[];
  addSupplier: (supplier: Omit<SupplierRecord, "id" | "bills" | "totalPurchasedUSD" | "totalPaidUSD" | "balanceUSD">) => Promise<void>;
  updateSupplier: (supplierId: string, updates: Partial<SupplierRecord>) => Promise<void>;
  deleteSupplier: (supplierId: string) => Promise<void>;
  addSupplierBill: (bill: Omit<SupplierBillRecord, "id">) => Promise<void>;
  deleteSupplierBill: (supplierId: string, billId: string) => Promise<void>;
  recordSupplierPayment: (supplierId: string, amountUSD: number, paymentMethod: any, referenceNumber?: string, sarrafiAccount?: string) => Promise<void>;

  // Commercial Invoicing
  invoices: InvoiceRecord[];
  addInvoice: (invoice: Omit<InvoiceRecord, "id" | "invoiceNumber">) => Promise<void>;
  updateInvoice: (invoiceId: string, updates: Partial<InvoiceRecord>) => Promise<void>;
  deleteInvoice: (invoiceId: string) => Promise<void>;

  // Payment Vouchers Engine
  payments: PaymentVoucherRecord[];
  addPaymentVoucher: (voucher: Omit<PaymentVoucherRecord, "id" | "voucherNumber">) => Promise<void>;
  updatePaymentVoucher: (voucherId: string, updates: Partial<PaymentVoucherRecord>) => Promise<void>;
  deletePaymentVoucher: (voucherId: string) => Promise<void>;

  // Accounting & Chart of Accounts
  accounts: AccountRecord[];
  journalEntries: JournalEntryRecord[];
  addJournalEntry: (entry: Omit<JournalEntryRecord, "id" | "entryNumber">) => Promise<void>;
  deleteJournalEntry: (entryId: string) => Promise<void>;

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
  addNotification: (item: {
    title: string;
    desc: string;
    type: "customs" | "sale" | "lead" | "rate";
  }) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Live PostgreSQL Database Sync
  fetchDealershipSettings: () => Promise<void>;
  fetchDatabaseRecords: (roleOverride?: RoleType) => Promise<void>;
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

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.error || `Request to ${path} failed (${response.status})`
    );
  }

  return result.data ?? null;
}

let settingsSyncTimer: ReturnType<typeof setTimeout> | null = null;
let pendingSettingsPatch: Record<string, unknown> = {};

function scheduleSettingsPersist(patch: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  pendingSettingsPatch = {
    ...pendingSettingsPatch,
    ...patch,
    ...(patch.branding && pendingSettingsPatch.branding
      ? {
          branding: {
            ...(pendingSettingsPatch.branding as Record<string, unknown>),
            ...(patch.branding as Record<string, unknown>),
          },
        }
      : {}),
  };
  if (settingsSyncTimer) {
    clearTimeout(settingsSyncTimer);
  }
  settingsSyncTimer = setTimeout(() => {
    const payload = pendingSettingsPatch;
    pendingSettingsPatch = {};
    settingsSyncTimer = null;
    fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);
  }, 350);
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
    yardLocation: vehicle.yardLocation || "Main Showroom - Bagh-e-Azadi",
    viewsCount: vehicle.viewsCount ?? 0,
    inquiriesCount: vehicle.inquiriesCount ?? 0,
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
      currentRole: "SalesAgent",
      darkMode: false,
      mobileDrawerOpen: false,
      clientPresentationMode: false,
      activeBranch: "Herat HQ · Bagh-e-Azadi",

      // Theming & Branding State
      branding: DEFAULT_BRANDING,
      theming: DEFAULT_THEMING,

      updateBranding: (updates) =>
        set((state) => {
          const nextBranding = { ...state.branding, ...updates };
          if (state.currentRole === "SuperAdmin") {
            scheduleSettingsPersist({ branding: updates });
          }
          return { branding: nextBranding };
        }),

      updateTheming: (updates) =>
        set((state) => {
          const nextMode = updates.themeMode ?? state.theming.themeMode;
          let nextDark = state.darkMode;
          if (updates.themeMode === "dark") nextDark = true;
          else if (updates.themeMode === "light") nextDark = false;
          else if (updates.themeMode === "system" && typeof window !== "undefined") {
            nextDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          }
          return {
            theming: { ...state.theming, ...updates, themeMode: nextMode },
            darkMode: nextDark,
          };
        }),

      applyThemePreset: (presetId) => {
        const preset = THEME_PRESETS.find((p) => p.id === presetId);
        if (!preset) return;
        set((state) => ({
          theming: {
            ...state.theming,
            accentPresetId: preset.id,
            primaryColor: preset.primaryColor,
            borderRadius: preset.borderRadius,
            uiDensity: preset.uiDensity,
            fontFamily: preset.fontFamily,
          },
        }));
      },

      resetBrandingToDefault: () => {
        set({ branding: DEFAULT_BRANDING });
        if (get().currentRole === "SuperAdmin") {
          scheduleSettingsPersist({ branding: DEFAULT_BRANDING });
        }
      },
      resetThemingToDefault: () => set({ theming: DEFAULT_THEMING, darkMode: false }),

      inspectedVehicleId: null,
      setInspectedVehicleId: (id) => set({ inspectedVehicleId: id }),
      isShortcutsModalOpen: false,
      setIsShortcutsModalOpen: (open) => set({ isShortcutsModalOpen: open }),

      // First-Time Tutorial State
      hasCompletedTutorial: false,
      isTutorialOpen: false,
      tutorialStep: 0,
      setIsTutorialOpen: (open) => set({ isTutorialOpen: open }),
      setTutorialStep: (tutorialStep) => set({ tutorialStep }),
      completeTutorial: (dontShowAgain = true) => {
        set({
          isTutorialOpen: false,
          hasCompletedTutorial: dontShowAgain ? true : get().hasCompletedTutorial,
        });
      },
      resetTutorial: () => {
        set({
          tutorialStep: 0,
          isTutorialOpen: true,
        });
      },
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
      setExchangeRate: (exchangeRate) => {
        set({ exchangeRate });
        const role = get().currentRole;
        if (role === "SuperAdmin" || role === "Accountant") {
          scheduleSettingsPersist({ exchangeRate });
        }
      },
      setLanguage: (language) => set({ language }),
      setCurrentRole: (currentRole) => set({ currentRole }),
      toggleDarkMode: () =>
        set((state) => {
          const nextDark = !state.darkMode;
          return {
            darkMode: nextDark,
            theming: {
              ...state.theming,
              themeMode: nextDark ? "dark" : "light",
            },
          };
        }),
      setMobileDrawerOpen: (open) => set({ mobileDrawerOpen: open }),
      toggleMobileDrawer: () => set((state) => ({ mobileDrawerOpen: !state.mobileDrawerOpen })),
      toggleClientPresentationMode: () =>
        set((state) => ({ clientPresentationMode: !state.clientPresentationMode })),
      setActiveBranch: (activeBranch) => {
        set({ activeBranch });
        const role = get().currentRole;
        if (role === "SuperAdmin" || role === "Accountant") {
          scheduleSettingsPersist({ activeBranch });
        }
      },

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
        await writeRecord("/api/vehicles", {
          ...vehicleToDatabase(vehicleData),
          exchangeRate: get().exchangeRate,
        });
        set((state) => ({
          vehicles: [newVehicle, ...state.vehicles],
        }));
        get().addNotification({
          title: `New Fleet Arrival: ${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`,
          desc: `Stock #${vehicleData.stockNumber} (${vehicleData.status})`,
          type: "customs",
        });
        await get().fetchDatabaseRecords();
        return get().vehicles.find((item) => item.stockNumber === vehicleData.stockNumber) || newVehicle;
      },

      updateVehicle: async (id, updates) => {
        await writeRecord(`/api/vehicles/${encodeURIComponent(id)}`, vehicleToDatabase(updates), "PATCH");
        set((state) => ({
          vehicles: state.vehicles.map((v) =>
            v.id === id || v.stockNumber === id ? { ...v, ...updates } : v
          ),
        }));
        await get().fetchDatabaseRecords();
      },

      deleteVehicle: async (id) => {
        await writeRecord(`/api/vehicles/${encodeURIComponent(id)}`, undefined, "DELETE");
        set((state) => ({
          vehicles: state.vehicles.filter((v) => v.id !== id && v.stockNumber !== id),
        }));
        await get().fetchDatabaseRecords();
      },

      customers: INITIAL_CUSTOMERS,
      addCustomer: async (customerData) => {
        const newCustomer: CustomerRecord = {
          ...customerData,
          id: `cust-${Date.now()}`,
          createdAt: new Date().toISOString().split("T")[0],
        };
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
        set((state) => ({
          customers: [newCustomer, ...state.customers],
        }));
        get().addNotification({
          title: `New Buyer Lead: ${customerData.fullName}`,
          desc: `${customerData.city} • Stage: ${customerData.leadStage}`,
          type: "lead",
        });
        await get().fetchDatabaseRecords();
      },

      updateCustomer: async (customerId, updates) => {
        await writeRecord("/api/customers", { customerId, ...updates }, "PATCH");
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === customerId ? { ...c, ...updates } : c
          ),
        }));
        await get().fetchDatabaseRecords();
      },

      deleteCustomer: async (customerId) => {
        await writeRecord("/api/customers", { customerId }, "DELETE");
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== customerId),
        }));
        await get().fetchDatabaseRecords();
      },

      updateCustomerStage: async (customerId, stage) => {
        await writeRecord("/api/customers", {
          customerId,
          leadStage: customerStageToDatabase[stage],
        }, "PATCH");
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === customerId ? { ...c, leadStage: stage } : c
          ),
        }));
        await get().fetchDatabaseRecords();
      },

      batchUpdateCustomerStage: async (customerIds, stage) => {
        const results = await Promise.allSettled(
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
        const failed = results.find((result) => result.status === "rejected");
        if (failed?.status === "rejected") throw failed.reason;
        set((state) => ({
          customers: state.customers.map((c) =>
            customerIds.includes(c.id) ? { ...c, leadStage: stage } : c
          ),
        }));
        get().addToast(
          `Updated ${customerIds.length} CRM lead(s) to "${stage}"`,
          "success"
        );
      },

      sales: INITIAL_SALES,
      addSale: async (saleData) => {
        const vehicle = get().vehicles.find((item) => item.stockNumber === saleData.stockNumber);
        if (!vehicle) throw new Error("Vehicle not found in the current inventory");
        const newSale: SaleRecord = {
          ...saleData,
          id: `sale-${Date.now()}`,
          contractNumber: `ARI-DEED-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
          saleDate: new Date().toISOString().split("T")[0],
        };
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
            paymentChannel:
              saleData.paymentType === "Hawala / Bank Transfer"
                ? "SARRAFI"
                : "CASH",
            downPaymentUSD: saleData.downPaymentUSD,
            installmentsRemaining: saleData.installmentsRemaining,
        });
        set((state) => ({
          sales: [newSale, ...state.sales],
        }));
        get().addNotification({
          title: `Vehicle Sold: ${saleData.vehicleName}`,
          desc: `Buyer: ${saleData.customerName} ($${saleData.salePriceUSD.toLocaleString()})`,
          type: "sale",
        });
        await get().fetchDatabaseRecords();
      },

      updateSale: async (saleId, updates) => {
        await writeRecord("/api/sales", { saleId, ...updates }, "PATCH");
        set((state) => ({
          sales: state.sales.map((s) =>
            s.id === saleId ? { ...s, ...updates } : s
          ),
        }));
        await get().fetchDatabaseRecords();
      },

      deleteSale: async (saleId, revertVehicleStatus = true) => {
        const sale = get().sales.find((s) => s.id === saleId);
        await writeRecord("/api/sales", { saleId, revertVehicleStatus }, "DELETE");
        set((state) => ({
          sales: state.sales.filter((s) => s.id !== saleId),
          vehicles: revertVehicleStatus && sale?.stockNumber
            ? state.vehicles.map((v) =>
                v.stockNumber === sale.stockNumber ? { ...v, status: "Available on Lot" as const } : v
              )
            : state.vehicles,
        }));
        await get().fetchDatabaseRecords();
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
        set((curr) => ({
          expenses: [newExpense, ...curr.expenses],
        }));
        await get().fetchDatabaseRecords();
      },

      updateExpense: async (expenseId, updates) => {
        await writeRecord("/api/expenses", { expenseId, ...updates }, "PATCH");
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === expenseId ? { ...e, ...updates } : e
          ),
        }));
        await get().fetchDatabaseRecords();
      },

      deleteExpense: async (expenseId) => {
        await writeRecord("/api/expenses", { expenseId }, "DELETE");
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== expenseId),
        }));
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
        await writeRecord("/api/suppliers", supplierData);
        set((state) => ({
          suppliers: [newSupplier, ...state.suppliers],
        }));
        await get().fetchDatabaseRecords();
      },

      updateSupplier: async (supplierId, updates) => {
        await writeRecord("/api/suppliers", { supplierId, ...updates }, "PATCH");
        set((state) => ({
          suppliers: state.suppliers.map((s) =>
            s.id === supplierId ? { ...s, ...updates } : s
          ),
        }));
        await get().fetchDatabaseRecords();
      },

      deleteSupplier: async (supplierId) => {
        await writeRecord("/api/suppliers", { supplierId }, "DELETE");
        set((state) => ({
          suppliers: state.suppliers.filter((s) => s.id !== supplierId),
        }));
        await get().fetchDatabaseRecords();
      },

      deleteSupplierBill: async (supplierId, billId) => {
        await writeRecord(`/api/suppliers/${encodeURIComponent(supplierId)}/bills`, { billId }, "DELETE");
        set((state) => ({
          suppliers: state.suppliers.map((s) =>
            s.id === supplierId
              ? { ...s, bills: s.bills.filter((b) => b.id !== billId) }
              : s
          ),
        }));
        await get().fetchDatabaseRecords();
      },

      addSupplierBill: async (billData) => {
        const newBill: SupplierBillRecord = {
          ...billData,
          id: `bill-${Date.now()}`,
        };
        await writeRecord(`/api/suppliers/${encodeURIComponent(billData.supplierId)}/bills`, {
          ...billData,
          exchangeRate: get().exchangeRate,
        });
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
        await get().fetchDatabaseRecords();
      },

      recordSupplierPayment: async (supplierId, amountUSD, paymentMethod, referenceNumber, sarrafiAccount) => {
        const state = get();
        const supplier = state.suppliers.find((item) => item.id === supplierId);
        if (!supplier) return;

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
        await writeRecord("/api/invoices", invoiceData);
        set((state) => ({
          invoices: [newInvoice, ...state.invoices],
        }));
        await get().fetchDatabaseRecords();
      },

      updateInvoice: async (invoiceId, updates) => {
        await writeRecord("/api/invoices", { invoiceId, ...updates }, "PATCH");
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === invoiceId ? { ...inv, ...updates } : inv
          ),
        }));
        await get().fetchDatabaseRecords();
      },

      deleteInvoice: async (invoiceId) => {
        await writeRecord("/api/invoices", { invoiceId }, "DELETE");
        set((state) => ({
          invoices: state.invoices.filter((inv) => inv.id !== invoiceId),
        }));
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
        await writeRecord("/api/vouchers", voucherData);
        set((state) => ({
          payments: [newVoucher, ...state.payments],
        }));
        await get().fetchDatabaseRecords();
      },

      updatePaymentVoucher: async (voucherId, updates) => {
        await writeRecord("/api/vouchers", { voucherId, ...updates }, "PATCH");
        set((state) => ({
          payments: state.payments.map((p) =>
            p.id === voucherId ? { ...p, ...updates } : p
          ),
        }));
        await get().fetchDatabaseRecords();
      },

      deletePaymentVoucher: async (voucherId) => {
        await writeRecord("/api/vouchers", { voucherId }, "DELETE");
        set((state) => ({
          payments: state.payments.filter((p) => p.id !== voucherId),
        }));
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
        await writeRecord("/api/journal-entries", entryData);
        set((state) => ({
          journalEntries: [newEntry, ...state.journalEntries],
        }));
        await get().fetchDatabaseRecords();
      },

      deleteJournalEntry: async (entryId) => {
        await writeRecord("/api/journal-entries", { entryId }, "DELETE");
        set((state) => ({
          journalEntries: state.journalEntries.filter((je) => je.id !== entryId),
        }));
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
        const results = await Promise.allSettled(ids.map((id) => writeRecord(
          `/api/vehicles/${encodeURIComponent(id)}`,
          vehicleToDatabase({ status }),
          "PATCH"
        )));
        await get().fetchDatabaseRecords();
        const failed = results.find((result) => result.status === "rejected");
        if (failed?.status === "rejected") throw failed.reason;
        set((state) => ({
          vehicles: state.vehicles.map((v) =>
            ids.includes(v.id) ? { ...v, status } : v
          ),
        }));
        get().addToast(`Updated status for ${ids.length} vehicle(s) to "${status}"`, "success");
      },

      batchAdjustVehiclePrice: async (ids, percentDelta) => {
        const factor = 1 + percentDelta / 100;
        const updates = get().vehicles
          .filter((vehicle) => ids.includes(vehicle.id))
          .map((vehicle) => ({
            vehicle,
            sellingPrice: Math.max(
              1000,
              Math.round((vehicle.sellingPrice * factor) / 100) * 100
            ),
          }));
        const results = await Promise.allSettled(
          updates.map(({ vehicle, sellingPrice }) =>
            writeRecord(
              `/api/vehicles/${encodeURIComponent(vehicle.id)}`,
              { sellingPrice },
              "PATCH"
            )
          )
        );
        await get().fetchDatabaseRecords();
        const failed = results.find((result) => result.status === "rejected");
        if (failed?.status === "rejected") throw failed.reason;
        set((state) => ({
          vehicles: state.vehicles.map((vehicle) => {
            const update = updates.find((item) => item.vehicle.id === vehicle.id);
            return update ? { ...vehicle, sellingPrice: update.sellingPrice } : vehicle;
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
      notifications: [],
      addNotification: ({ title, desc, type }) =>
        set((state) => ({
          notifications: [
            {
              id: `notif-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
              title,
              desc,
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              read: false,
              type,
            },
            ...state.notifications,
          ].slice(0, 50),
        })),
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

      fetchDealershipSettings: async () => {
        try {
          const res = await fetch("/api/settings");
          if (!res.ok) return;
          const payload = await res.json().catch(() => null);
          if (payload?.success && payload.data) {
            const dbSettings = payload.data;
            set((state) => ({
              exchangeRate:
                Number(dbSettings.exchangeRate) > 0
                  ? Number(dbSettings.exchangeRate)
                  : state.exchangeRate,
              activeBranch: dbSettings.activeBranch || state.activeBranch,
              branding:
                dbSettings.branding && typeof dbSettings.branding === "object"
                  ? { ...DEFAULT_BRANDING, ...dbSettings.branding }
                  : state.branding,
            }));
          }
        } catch {
          // Offline / unconfigured DB retains local settings
        }
      },

      // Live PostgreSQL Database Sync (role-aware; preserves cached/initial records when DB is offline or unconfigured)
      fetchDatabaseRecords: async (roleOverride) => {
        try {
          void get().fetchDealershipSettings();
          const effectiveRole = roleOverride || get().currentRole;
          const canAccessAccounting =
            effectiveRole === "SuperAdmin" || effectiveRole === "Accountant";

          const fetchJson = (url: string) =>
            fetch(url)
              .then((r) => (r.ok ? r.json() : null))
              .catch(() => null);

          const [
            vehRes,
            custRes,
            saleRes,
            invRes,
            vouchRes,
            suppRes,
            expRes,
            jeRes,
            acctRes,
            alertsRes,
          ] = await Promise.all([
            fetchJson("/api/vehicles"),
            fetchJson("/api/customers"),
            fetchJson("/api/sales"),
            fetchJson("/api/invoices"),
            canAccessAccounting ? fetchJson("/api/vouchers") : Promise.resolve(null),
            canAccessAccounting ? fetchJson("/api/suppliers") : Promise.resolve(null),
            canAccessAccounting ? fetchJson("/api/expenses") : Promise.resolve(null),
            canAccessAccounting ? fetchJson("/api/journal-entries") : Promise.resolve(null),
            canAccessAccounting ? fetchJson("/api/accounts") : Promise.resolve(null),
            canAccessAccounting ? fetchJson("/api/alerts") : Promise.resolve(null),
          ]);

          if (vehRes?.success && Array.isArray(vehRes.data)) {
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

              const rawNotes = v.conditionNotes && typeof v.conditionNotes === "object"
                ? v.conditionNotes
                : {};

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
                conditionNotes: {
                  exterior: rawNotes.exterior || "Clean original condition",
                  interior: rawNotes.interior || "Leather interior, smoke-free",
                  engine: rawNotes.engine || "Factory standard inspection",
                  tires: rawNotes.tires || "Good condition",
                  accidentHistory: rawNotes.accidentHistory || "Clean Title",
                  ...(rawNotes.yardLocation ? { yardLocation: rawNotes.yardLocation } : {}),
                  ...(rawNotes.logisticsStage !== undefined ? { logisticsStage: Number(rawNotes.logisticsStage) } : {}),
                  ...(rawNotes.paintZones ? { paintZones: rawNotes.paintZones } : {}),
                },
                yardLocation: v.yardLocation || rawNotes.yardLocation || "Main Showroom - Bagh-e-Azadi",
                images: imageUrls,
                documents: v.documents || [],
                viewsCount: Number(v.viewsCount) || 0,
                inquiriesCount: Number(v.inquiriesCount) || 0,
              };
            });

            set({ vehicles: mappedVehicles });
          }

          if (custRes?.success && Array.isArray(custRes.data)) {
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

          if (saleRes?.success && Array.isArray(saleRes.data)) {
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
          if (invRes?.success && Array.isArray(invRes.data)) {
            set({
              invoices: invRes.data.map((invoice: any) => ({
                ...invoice,
                issueDate: invoice.issueDate ? new Date(invoice.issueDate).toISOString().split("T")[0] : "",
                dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split("T")[0] : undefined,
              })),
            });
          }

          // Live Payment Vouchers Sync
          if (vouchRes?.success && Array.isArray(vouchRes.data)) {
            set({
              payments: vouchRes.data.map((payment: any) => ({
                ...payment,
                date: payment.date ? new Date(payment.date).toISOString().split("T")[0] : "",
              })),
            });
          }

          // Live Suppliers Sync
          if (suppRes?.success && Array.isArray(suppRes.data)) {
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
          if (expRes?.success && Array.isArray(expRes.data)) {
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
          if (jeRes?.success && Array.isArray(jeRes.data)) {
            set({
              journalEntries: jeRes.data.map((entry: any) => ({
                ...entry,
                date: entry.date ? new Date(entry.date).toISOString().split("T")[0] : "",
              })),
            });
          }

          if (acctRes?.success && Array.isArray(acctRes.data)) {
            set({ accounts: acctRes.data });
          }

          if (alertsRes?.success && alertsRes.data) {
            const existingById = new Map(
              get().notifications.map((n) => [n.id, n])
            );
            const alertItems: ShowroomStore["notifications"] = [];

            for (const item of alertsRes.data.transit || []) {
              const id = `alert-transit-${item.id}`;
              alertItems.push({
                id,
                title: `Stale Transit: ${item.make} ${item.model}`,
                desc: `Stock #${item.stockNumber} in transit > 30 days`,
                time: item.statusChangedAt
                  ? new Date(item.statusChangedAt).toISOString().split("T")[0]
                  : "Alert",
                read: existingById.get(id)?.read ?? false,
                type: "customs",
              });
            }

            for (const inst of alertsRes.data.installments || []) {
              const id = `alert-inst-${inst.id}`;
              alertItems.push({
                id,
                title: `Overdue Installment: ${inst.customerName}`,
                desc: `Contract ${inst.contractNumber} • $${Number(inst.amount || 0).toLocaleString()}`,
                time: inst.dueDate
                  ? new Date(inst.dueDate).toISOString().split("T")[0]
                  : "Overdue",
                read: existingById.get(id)?.read ?? false,
                type: "sale",
              });
            }

            for (const lead of alertsRes.data.followUps || []) {
              const id = `alert-lead-${lead.id}`;
              alertItems.push({
                id,
                title: `Lead Follow-Up Needed: ${lead.fullName}`,
                desc: `Phone ${lead.phone} • Stage: ${lead.leadStage}`,
                time: lead.updatedAt
                  ? new Date(lead.updatedAt).toISOString().split("T")[0]
                  : "Follow-up",
                read: existingById.get(id)?.read ?? false,
                type: "lead",
              });
            }

            const manualItems = get().notifications.filter(
              (n) => !n.id.startsWith("alert-")
            );
            set({ notifications: [...alertItems, ...manualItems].slice(0, 50) });
          }
        } catch {
          // Using cached showroom state when database is offline
        }
      },
    }),
    {
      name: "sadozai_motors_storage",
      version: 3,
      partialize: (state) => ({
        currency: state.currency,
        exchangeRate: state.exchangeRate,
        language: state.language,
        darkMode: state.darkMode,
        clientPresentationMode: state.clientPresentationMode,
        activeBranch: state.activeBranch,
        branding: state.branding,
        theming: state.theming,
        filters: state.filters,
        favoriteIds: state.favoriteIds,
        compareIds: state.compareIds,
        pinnedViews: state.pinnedViews,
        activePinnedViewId: state.activePinnedViewId,
        hasCompletedTutorial: state.hasCompletedTutorial,
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
          branding: { ...DEFAULT_BRANDING, ...(state?.branding || {}) },
          theming: { ...DEFAULT_THEMING, ...(state?.theming || {}) },
          filters: state?.filters || initialFilters,
          favoriteIds: state?.favoriteIds || [],
          compareIds: state?.compareIds || [],
          pinnedViews: state?.pinnedViews?.length ? state.pinnedViews : DEFAULT_PINNED_VIEWS,
          activePinnedViewId: state?.activePinnedViewId || "all-fleet",
          hasCompletedTutorial: Boolean(state?.hasCompletedTutorial),
        } as ShowroomStore;
      },
    }
  )
);
