export interface VehicleCondition {
  interior: string;
  exterior: string;
  engine: string;
  tires: string;
  accidentHistory: string;
}

export interface VehicleDocument {
  id: string;
  title: string;
  fileUrl: string;
  docType: string;
}

export interface VehicleItem {
  id: string;
  stockNumber: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  bodyType: "SUV" | "Sedan" | "Pickup" | "Crossover";
  originCountry: "UAE" | "USA" | "Canada" | "Japan" | "Europe";
  steering: "Left-Hand Drive (LHD)" | "Right-Hand Drive (RHD Converted)";
  customsClearance: string;
  cleanTitle: boolean;
  mileage: number;
  fuelType: "Petrol" | "Hybrid" | "Diesel" | "Electric";
  transmission: "Automatic" | "Manual";
  driveType: "4WD" | "AWD" | "FWD" | "RWD";
  color: string;
  status: "In Transit" | "Under Prep/Maintenance" | "Available on Lot" | "Reserved/Deposit Paid" | "Sold";
  yardLocation?: string;
  purchasePrice: number; // USD
  freightCost: number; // USD
  customsDuty: number; // USD (Herat Customs)
  repairCost: number; // USD
  landedCost: number; // USD
  minTargetPrice: number; // USD
  sellingPrice: number; // USD
  features: string[];
  description: string;
  descriptionDari: string;
  descriptionPashto?: string;
  conditionNotes: VehicleCondition;
  images: string[];
  documents: VehicleDocument[];
  viewsCount: number;
  inquiriesCount: number;
}

export interface CustomerRecord {
  id: string;
  fullName: string;
  phone: string;
  whatsapp: string;
  tazkiraNumber: string;
  city: string;
  address: string;
  tradeInRecord?: string;
  leadStage: "New Inquiry" | "Follow-Up" | "Test Drive" | "Negotiation" | "Closed/Won" | "Lost";
  budget: number;
  interestedInVehicleId: string;
  notes: string;
  createdAt: string;
}

export interface SaleRecord {
  id: string;
  stockNumber: string;
  vehicleName: string;
  customerName: string;
  customerPhone: string;
  customerTazkira: string;
  salesAgent: string;
  salePriceUSD: number;
  exchangeRate: number; // AFN per USD
  paymentType: "Full Cash" | "Installment Plan" | "Hawala / Bank Transfer";
  downPaymentUSD: number;
  installmentsRemaining: number;
  contractNumber: string;
  saleDate: string;
  status: "Completed" | "Pending Installments";
}

export interface ExpenseRecord {
  id: string;
  category: "Gomrok & Port Tariffs" | "Transit & Ocean Freight" | "Vehicle Maintenance/Detailing" | "Showroom Overhead & Fuel" | "Staff Commissions";
  vehicleStock?: string;
  amountUSD: number;
  description: string;
  payee?: string;
  receiptNumber?: string;
  date: string;
}

export interface SupplierBillRecord {
  id: string;
  billNumber: string;
  supplierId: string;
  stockNumber?: string;
  vehicleDescription?: string;
  amountUSD: number;
  status: "Paid" | "Partial" | "Unpaid";
  issueDate: string;
  dueDate?: string;
  notes?: string;
}

export interface SupplierRecord {
  id: string;
  companyName: string;
  contactName: string;
  country: string;
  city?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  bankOrSarrafiAccount?: string;
  totalPurchasedUSD: number;
  totalPaidUSD: number;
  balanceUSD: number; // Payable balance (Purchased - Paid)
  notes?: string;
  bills: SupplierBillRecord[];
}

export interface InvoiceItem {
  description: string;
  descriptionDari: string;
  amountUSD: number;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  saleId?: string;
  customerName: string;
  customerPhone: string;
  customerTazkira?: string;
  customerAddress?: string;
  vehicleStock?: string;
  vehicleDesc?: string;
  vin?: string;
  items: InvoiceItem[];
  subtotalUSD: number;
  customsFeeUSD: number;
  registrationFeeUSD: number;
  discountUSD: number;
  totalUSD: number;
  totalAFN: number;
  exchangeRate: number;
  status: "Paid" | "Partially Paid" | "Draft" | "Overdue";
  paymentMethod: string;
  issueDate: string;
  dueDate?: string;
  notes?: string;
}

export interface PaymentVoucherRecord {
  id: string;
  voucherNumber: string;
  voucherType: "CUSTOMER_PAYMENT" | "SUPPLIER_PAYMENT" | "EXPENSE_PAYMENT";
  date: string;
  partyName: string;
  partyPhone?: string;
  partyTazkira?: string;
  amountUSD: number;
  amountAFN: number;
  exchangeRate: number;
  paymentMethod: "Cash (صندوق)" | "Sarrafi Hawala (حواله صرافی)" | "Bank Transfer (حساب بانکی)";
  sarrafiAccount?: string;
  referenceNumber?: string;
  vehicleStock?: string;
  supplierId?: string;
  purpose: string;
  recordedBy: string;
}

export interface AccountRecord {
  code: string;
  name: string;
  nameDari: string;
  type: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
  balanceUSD: number;
}

export interface JournalEntryRecord {
  id: string;
  entryNumber: string;
  date: string;
  description: string;
  reference?: string;
  debitAccount: string;
  creditAccount: string;
  amountUSD: number;
  amountAFN: number;
}

export const INITIAL_VEHICLES: VehicleItem[] = [];
export const INITIAL_CUSTOMERS: CustomerRecord[] = [];
export const INITIAL_SALES: SaleRecord[] = [];
export const INITIAL_EXPENSES: ExpenseRecord[] = [];
export const INITIAL_SUPPLIERS: SupplierRecord[] = [];
export const INITIAL_INVOICES: InvoiceRecord[] = [];
export const INITIAL_PAYMENTS: PaymentVoucherRecord[] = [];
export const INITIAL_JOURNAL_ENTRIES: JournalEntryRecord[] = [];

export const INITIAL_ACCOUNTS: AccountRecord[] = [
  { code: "1010", name: "Showroom Central Cash Safe", nameDari: "صندوق مرکزی نندارتون (نقدی)", type: "ASSET", balanceUSD: 0 },
  { code: "1020", name: "Sarrafi Khorasan Holding Account", nameDari: "حساب صرافی مارکیت خراسان هرات", type: "ASSET", balanceUSD: 0 },
  { code: "1030", name: "Azizi Bank Commercial USD Account", nameDari: "حساب بانکی ارزی عزیزی بانک", type: "ASSET", balanceUSD: 0 },
  { code: "1040", name: "Vehicle Inventory Asset (Lot & Port)", nameDari: "دارایی موجودی موترها (نندارتون و گمرک)", type: "ASSET", balanceUSD: 0 },
  { code: "1050", name: "Accounts Receivable (Customer Installments)", nameDari: "حساب‌های دریافتنی (طلبکاری از مشتریان)", type: "ASSET", balanceUSD: 0 },
  { code: "2010", name: "Accounts Payable (Auto Suppliers UAE/Japan)", nameDari: "حساب‌های پرداختنی (بدهکاری به تأمین‌کنندگان)", type: "LIABILITY", balanceUSD: 0 },
  { code: "2020", name: "Customs Duty Payable (Gomrok Islam Qala)", nameDari: "عوارض گمرکی پرداختنی اسلام قلعه", type: "LIABILITY", balanceUSD: 0 },
  { code: "2030", name: "Customer Advance Deposits", nameDari: "پیش‌پرداخت و بیعانه موترها", type: "LIABILITY", balanceUSD: 0 },
  { code: "3010", name: "Owner Capital & Equity", nameDari: "سرمایه مالک نندارتون", type: "EQUITY", balanceUSD: 0 },
  { code: "3020", name: "Opening Balance Equity", nameDari: "تعدیل مانده افتتاحیه", type: "EQUITY", balanceUSD: 0 },
  { code: "4010", name: "Vehicle Sales Revenue", nameDari: "عواید حاصل از فروش موترها", type: "REVENUE", balanceUSD: 0 },
  { code: "4020", name: "Documentation & Transfer Fee Income", nameDari: "عواید کمیشن و ترخیص اسناد رسمی", type: "REVENUE", balanceUSD: 0 },
  { code: "5010", name: "COGS - Vehicle Purchase Cost", nameDari: "بهای تمام‌شده خرید موتر", type: "EXPENSE", balanceUSD: 0 },
  { code: "5020", name: "COGS - Freight & Port Clearance", nameDari: "بهای تمام‌شده ترانزیت و محصول گمرک", type: "EXPENSE", balanceUSD: 0 },
  { code: "6010", name: "Operating Expense - Detailing & Detailing", nameDari: "هزینه رنگ، ترمیم و سرویس تخنیکی", type: "EXPENSE", balanceUSD: 0 },
  { code: "6020", name: "Operating Expense - Solar, Fuel & Generator", nameDari: "هزینه برق، سولر و دیزل ژنراتور نندارتون", type: "EXPENSE", balanceUSD: 0 },
  { code: "6030", name: "Operating Expense - Staff Salaries & Bonus", nameDari: "معاشات و کمیشن ماهوار پرسونل", type: "EXPENSE", balanceUSD: 0 },
];
