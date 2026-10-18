import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  VehicleItem,
  CustomerRecord,
  SaleRecord,
  ExpenseRecord,
  INITIAL_VEHICLES,
  INITIAL_CUSTOMERS,
  INITIAL_SALES,
  INITIAL_EXPENSES,
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

  // Expenses
  expenses: ExpenseRecord[];
  addExpense: (expense: Omit<ExpenseRecord, "id" | "date">) => void;
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
          return { expenses: [newExpense, ...state.expenses] };
        }),
    }),
    {
      name: "sadozai_motors_storage",
    }
  )
);
