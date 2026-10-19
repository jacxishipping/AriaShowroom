import { SAMPLE_VEHICLE_PHOTOS_40 } from "./sample-photos";

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

export const INITIAL_VEHICLES: VehicleItem[] = [
  {
    id: "veh-001",
    stockNumber: "SM-HRT-101",
    vin: "JTMCY7AJ8N4098231",
    make: "Toyota",
    model: "Land Cruiser 300 VXR",
    year: 2023,
    trim: "VXR Twin-Turbo V6",
    bodyType: "SUV",
    originCountry: "UAE",
    steering: "Left-Hand Drive (LHD)",
    customsClearance: "Gomrok Herat (Islam Qala) - Maktoub Cleared",
    cleanTitle: true,
    mileage: 14200,
    fuelType: "Petrol",
    transmission: "Automatic",
    driveType: "4WD",
    color: "Pearl White Metallic",
    status: "Available on Lot",
    purchasePrice: 74500,
    freightCost: 1400,
    customsDuty: 6800,
    repairCost: 300,
    landedCost: 83000,
    minTargetPrice: 88000,
    sellingPrice: 91500,
    features: [
      "3.5L V6 Twin-Turbo (409 HP)",
      "JBL 14-Speaker Synthesis Audio",
      "Factory Cool Box Refrigerator",
      "360° Multi-Terrain Bird-Eye Camera",
      "Rear Dual Entertainment Screens",
      "Crawl Control & Turn Assist",
      "Perforated Beige Nappa Leather",
      "Radar Adaptive Cruise Control",
    ],
    description:
      "Exclusive Dubai GCC-spec Land Cruiser 300 VXR. One owner in UAE, imported directly via Bandar Abbas to Islam Qala. Zero paintwork, 100% original factory condition. Fully cleared at Herat Customs with original negative plate paperwork ready.",
    descriptionDari:
      "تویوتا لندکروزر ۳۰۰ مدل ۲۰۲۳ فول آپشن VXR خلیجی، بدون تکر و رنگ به شرط کامپیوتر. محصول شده گمرک هرات (اسلام قلعه)، آماده انتقال سند و پلیت منفی.",
    descriptionPashto:
      "تویوټا لینډکروزر ۳۰۰ ماډل ۲۰۲۳ فول آپشن VXR خلیجي، بې رنګه او بې ټکره د هرات (اسلام قلعه) ګمرک محصول، د اسنادو انتقال او منفي پلیټ ته چمتو.",
    conditionNotes: {
      exterior: "10/10 - Zero repainted panels, original ceramic coat",
      interior: "10/10 - Pristine quilted beige leather, smoke-free",
      engine: "10/10 - 3.5L Twin Turbo sealed factory standard",
      tires: "95% Dunlop Grandtrek AT25 with 20\" wheels",
      accidentHistory: "Clean Title - No collision history",
    },
    images: SAMPLE_VEHICLE_PHOTOS_40,
    documents: [
      {
        id: "doc-1",
        title: "Gomrok Herat Customs Slip #44109",
        fileUrl: "/docs/gomrok-herat-lc300.pdf",
        docType: "Customs Clearance",
      },
      {
        id: "doc-2",
        title: "Dubai RTA Export Certificate",
        fileUrl: "/docs/rta-dubai.pdf",
        docType: "Export Title",
      },
    ],
    viewsCount: 1420,
    inquiriesCount: 28,
  },
  {
    id: "veh-002",
    stockNumber: "SM-HRT-102",
    vin: "2T1BURHE9KC210944",
    make: "Toyota",
    model: "Corolla S",
    year: 2020,
    trim: "SE Special Sport Edition",
    bodyType: "Sedan",
    originCountry: "USA",
    steering: "Left-Hand Drive (LHD)",
    customsClearance: "Gomrok Herat - Verified Plate Ready",
    cleanTitle: true,
    mileage: 38400,
    fuelType: "Petrol",
    transmission: "Automatic",
    driveType: "FWD",
    color: "Celestite Blue-Gray",
    status: "Available on Lot",
    purchasePrice: 9200,
    freightCost: 1650,
    customsDuty: 2150,
    repairCost: 400,
    landedCost: 13400,
    minTargetPrice: 14800,
    sellingPrice: 15500,
    features: [
      "Apple CarPlay & Android Auto",
      "Paddle Shifters & Sport Driving Mode",
      "Toyota Safety Sense 2.0 (Lane Departure & Brake Assist)",
      "Power Sunroof / Moonroof",
      "18\" Machined Gloss Alloy Wheels",
      "Smart Keyless Entry & Push Start",
      "Original High-Grade Catalytic Converter",
    ],
    description:
      "Direct Texas USA import Toyota Corolla SE in high-demand Celestite Gray. Flawless suspension, high fuel economy (34 MPG), original catalytic converter intact, and passed Herat traffic technical inspection.",
    descriptionDari:
      "تویوتا کرولا SE مدل ۲۰۲۰ وارداتی تگزاس آمریکا، بدون تکر شدید، کتلست فابریک کمپنی، بسیار کم‌مصرف و نرم، آماده انتقال سند به نام خریدار.",
    descriptionPashto:
      "تویوټا کورولا S/SE ماډل ۲۰۲۰ د امریکا واردات، منفی ۶ هرات پلیټ ته چمتو، فابریکه کتلست، خورا کم مصرف او نرم موټر.",
    conditionNotes: {
      exterior: "9.5/10 - Minor bumper cosmetic polish only",
      interior: "10/10 - Black sport fabric with blue accent stitching",
      engine: "10/10 - 2.0L Dynamic Force Engine in peak performance",
      tires: "90% Michelin Primacy All-Season",
      accidentHistory: "Clean Carfax - All 8 factory airbags original",
    },
    images: [
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1590362891988-3075217414c4?auto=format&fit=crop&w=1400&q=85",
    ],
    documents: [
      {
        id: "doc-3",
        title: "USA Certificate of Title (Texas)",
        fileUrl: "/docs/texas-title.pdf",
        docType: "Title Certificate",
      },
    ],
    viewsCount: 2310,
    inquiriesCount: 45,
  },
  {
    id: "veh-003",
    stockNumber: "SM-HRT-103",
    vin: "JTJHY7AX6L4319872",
    make: "Lexus",
    model: "LX 570",
    year: 2021,
    trim: "Super Sport Black Edition S",
    bodyType: "SUV",
    originCountry: "Canada",
    steering: "Left-Hand Drive (LHD)",
    customsClearance: "Gomrok Herat - One-Key Maktoub",
    cleanTitle: true,
    mileage: 27900,
    fuelType: "Petrol",
    transmission: "Automatic",
    driveType: "4WD",
    color: "Onyx Black",
    status: "Reserved/Deposit Paid",
    purchasePrice: 62000,
    freightCost: 2100,
    customsDuty: 5900,
    repairCost: 500,
    landedCost: 70500,
    minTargetPrice: 75000,
    sellingPrice: 78500,
    features: [
      "5.7L Naturally Aspirated V8 (383 HP)",
      "Mark Levinson 19-Speaker Reference Surround",
      "Adaptive Variable Suspension with Active Height Control",
      "Cabernet Red Semi-Aniline Leather Interior",
      "Color Head-Up Display (HUD)",
      "21\" Forged Black Edition Alloy Wheels",
      "Ventilated & Heated Front/Rear Seats",
    ],
    description:
      "Canadian spec Lexus LX 570 Black Edition with striking Cabernet Red interior. Undercarriage rust-free, hydraulic suspension calibrated for rugged conditions. Reserved by Herat merchant with initial cash deposit.",
    descriptionDari:
      "لکسس LX570 سوپر اسپرت مدل ۲۰۲۱ واردات کانادا، داخل چرم سرخ، سیستم هایدرولیک و کمک فنر کاملاً سالم، بی خط و خال.",
    conditionNotes: {
      exterior: "9.8/10 - Black obsidian metallic mirror finish",
      interior: "10/10 - Cabernet Red leather in showroom condition",
      engine: "10/10 - Legendary 3UR-FE V8 purring flawlessly",
      tires: "92% Bridgestone Dueler H/T",
      accidentHistory: "Accident-free verified by Canadian Carfax",
    },
    images: [
      "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=85",
    ],
    documents: [
      {
        id: "doc-4",
        title: "Canada Ministry of Transportation Title",
        fileUrl: "/docs/canada-title.pdf",
        docType: "Export Title",
      },
    ],
    viewsCount: 3100,
    inquiriesCount: 62,
  },
  {
    id: "veh-004",
    stockNumber: "SM-HRT-104",
    vin: "MROBA3CD9N0192834",
    make: "Toyota",
    model: "Hilux Revo Rocco",
    year: 2022,
    trim: "2.8L Turbo Diesel 4x4",
    bodyType: "Pickup",
    originCountry: "UAE",
    steering: "Left-Hand Drive (LHD)",
    customsClearance: "Islam Qala Port Cleared",
    cleanTitle: true,
    mileage: 22100,
    fuelType: "Diesel",
    transmission: "Automatic",
    driveType: "4WD",
    color: "Attitude Black Mica",
    status: "Available on Lot",
    purchasePrice: 31500,
    freightCost: 1100,
    customsDuty: 3800,
    repairCost: 250,
    landedCost: 36650,
    minTargetPrice: 39500,
    sellingPrice: 41200,
    features: [
      "2.8L GD-FTV Turbo Diesel (201 HP, 500 Nm Torque)",
      "Factory Rear Differential Lock",
      "Rocco Styling Package with Sport Bar & Bedliner",
      "Bi-LED Projector Headlights",
      "Downhill Assist & Hill-Start Assist Control",
      "Optitron Instrument Cluster with 4.2\" Color Display",
    ],
    description:
      "Heavy duty Toyota Hilux Revo Rocco 2.8L Diesel. Legendary durability and towing power, suited for western Afghanistan highways and mountainous terrain. Original Rocco package with factory diff-lock.",
    descriptionDari:
      "تویوتا هایلکس روکو مدل ۲۰۲۲ موتور ۲.۸ توربو دیزل، دنده اتومات، دو دفرنسیال همراه قفل دیفلاک کمپنی، آماده هرگونه تست و سفر.",
    conditionNotes: {
      exterior: "10/10 - Original paint, tough bedliner intact",
      interior: "10/10 - Black sport interior with carbon accents",
      engine: "10/10 - Turbo diesel responsive and smoke-free",
      tires: "95% Bridgestone All-Terrain",
      accidentHistory: "Clean Title - No damages recorded",
    },
    images: [
      "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1400&q=85",
    ],
    documents: [],
    viewsCount: 1890,
    inquiriesCount: 37,
  },
  {
    id: "veh-005",
    stockNumber: "SM-HRT-105",
    vin: "4T1B21HK5NU891023",
    make: "Toyota",
    model: "Camry XSE Hybrid",
    year: 2022,
    trim: "XSE Two-Tone Panoramic",
    bodyType: "Sedan",
    originCountry: "USA",
    steering: "Left-Hand Drive (LHD)",
    customsClearance: "Gomrok Herat - Cleared",
    cleanTitle: true,
    mileage: 18500,
    fuelType: "Hybrid",
    transmission: "Automatic",
    driveType: "FWD",
    color: "Wind Chill Pearl / Midnight Black Roof",
    status: "Under Prep/Maintenance",
    purchasePrice: 21500,
    freightCost: 1700,
    customsDuty: 3200,
    repairCost: 600,
    landedCost: 27000,
    minTargetPrice: 29500,
    sellingPrice: 31200,
    features: [
      "2.5L 4-Cylinder Dynamic Force Hybrid (46 MPG)",
      "Panoramic Glass Roof with Power Sunshade",
      "Red Cockpit Leather Seating",
      "JBL 9-Speaker Premium Audio",
      "Wireless Smartphone Charging Pad",
      "Blind Spot Monitor with Rear Cross-Traffic Alert",
    ],
    description:
      "Sought-after Toyota Camry XSE Hybrid featuring two-tone Pearl White body with gloss black roof and blood red leather. Currently undergoing routine 50-point safety check and Swiss ceramic detailing at Sadozai workshop.",
    descriptionDari:
      "تویوتا کمری XSE هایبرید مدل ۲۰۲۲، دو رنگ (سفید صدفی با سقف سیاه)، داخل چرم سرخ، مصرف سوخت فوق‌العاده پایین (۴.۵ لیتر در ۱۰۰ کیلومتر).",
    conditionNotes: {
      exterior: "9.5/10 - Minor bumper detail in progress",
      interior: "10/10 - Red leather like brand new",
      engine: "10/10 - Hybrid battery battery health 99%",
      tires: "90% Michelin CrossClimate",
      accidentHistory: "Clean Title - All original vin stickers on panels",
    },
    images: [
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1400&q=85",
    ],
    documents: [],
    viewsCount: 1650,
    inquiriesCount: 19,
  },
  {
    id: "veh-006",
    stockNumber: "SM-HRT-106",
    vin: "2T2HZMCA4MC189201",
    make: "Lexus",
    model: "RX 350",
    year: 2021,
    trim: "F-Sport Series 3",
    bodyType: "Crossover",
    originCountry: "Canada",
    steering: "Left-Hand Drive (LHD)",
    customsClearance: "In Transit via Bandar Abbas",
    cleanTitle: true,
    mileage: 31000,
    fuelType: "Petrol",
    transmission: "Automatic",
    driveType: "AWD",
    color: "Caviar Mica Black",
    status: "In Transit",
    purchasePrice: 28000,
    freightCost: 2200,
    customsDuty: 4100,
    repairCost: 0,
    landedCost: 34300,
    minTargetPrice: 37500,
    sellingPrice: 39500,
    features: [
      "3.5L V6 AWD (295 HP)",
      "F-Sport Mesh Grille & Sport Bolstered Seats",
      "Mark Levinson Sound System",
      "Hands-Free Power Liftgate",
      "Triple-Beam LED Headlamps",
      "Lexus Safety System+ 2.0",
    ],
    description:
      "Lexus RX 350 F-Sport Series 3 in Caviar Black. Vehicle currently in transit via Bandar Abbas en route to Islam Qala dry port. Pre-orders and reservation contracts available with price guarantee.",
    descriptionDari:
      "لکسس RX350 مدل ۲۰۲۱ تیپ اف اسپرت، در مسیر ترانزیت از بندر عباس به اسلام قلعه، تحویل در هرات طی ۱۰ روز کاری با ضمانت قیمت.",
    conditionNotes: {
      exterior: "10/10 - Clean Canadian import inspection",
      interior: "10/10 - Red F-Sport leather interior",
      engine: "10/10 - V6 engine 31,000 km verified",
      tires: "90% Michelin Latitude",
      accidentHistory: "Clean Title - No flood or collision",
    },
    images: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=85",
    ],
    documents: [],
    viewsCount: 940,
    inquiriesCount: 12,
  },
];

export const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: "cust-001",
    fullName: "Haji Abdul Qadir Alokozai",
    phone: "+93 79 944 5566",
    whatsapp: "+93799445566",
    tazkiraNumber: "1400-0402-88912",
    city: "Herat",
    address: "Shahr-e-Naw, Street 4, Herat City",
    tradeInRecord: "2016 Toyota Prado TXL ($26,000 valuation)",
    leadStage: "Closed/Won",
    budget: 95000,
    interestedInVehicleId: "veh-001",
    notes: "VIP businessman in Herat Industrial City. Paid upfront for Land Cruiser 300.",
    createdAt: "2026-10-02",
  },
  {
    id: "cust-002",
    fullName: "Eng. Jawid Barakzai",
    phone: "+93 70 033 1122",
    whatsapp: "+93700331122",
    tazkiraNumber: "1399-0811-44210",
    city: "Herat",
    address: "Jada-e-Bank Khoon, Herat",
    leadStage: "Negotiation",
    budget: 80000,
    interestedInVehicleId: "veh-003",
    notes: "Placed $5,000 cash deposit on Lexus LX 570. Balancing payment pending next week.",
    createdAt: "2026-10-08",
  },
  {
    id: "cust-003",
    fullName: "Mohammad Tariq Popal",
    phone: "+93 78 812 3456",
    whatsapp: "+93788123456",
    tazkiraNumber: "1401-0105-19823",
    city: "Herat",
    address: "Darwaza-e-Kandahar, Herat",
    tradeInRecord: "2013 Toyota Corolla LE ($7,200 valuation)",
    leadStage: "Test Drive",
    budget: 16000,
    interestedInVehicleId: "veh-002",
    notes: "Interested in trade-in for the 2020 Corolla SE. Test drive scheduled.",
    createdAt: "2026-10-12",
  },
  {
    id: "cust-004",
    fullName: "Dr. Ahmad Wahid Sediqi",
    phone: "+93 79 123 7890",
    whatsapp: "+93791237890",
    tazkiraNumber: "1398-0220-77190",
    city: "Herat",
    address: "Wilayat Road, Herat",
    leadStage: "New Inquiry",
    budget: 42000,
    interestedInVehicleId: "veh-004",
    notes: "Looking for Toyota Hilux Rocco for regional clinic medical operations.",
    createdAt: "2026-10-16",
  },
];

export const INITIAL_SALES: SaleRecord[] = [
  {
    id: "sale-001",
    stockNumber: "SM-HRT-098",
    vehicleName: "2022 Toyota Land Cruiser Prado TXL",
    customerName: "Haji Abdul Qadir Alokozai",
    customerPhone: "+93 79 944 5566",
    customerTazkira: "1400-0402-88912",
    salesAgent: "Farhad Timori",
    salePriceUSD: 58500,
    exchangeRate: 70.5,
    paymentType: "Installment Plan",
    downPaymentUSD: 38500,
    installmentsRemaining: 2,
    contractNumber: "SM-CNTR-2026-089",
    saleDate: "2026-09-24",
    status: "Pending Installments",
  },
  {
    id: "sale-002",
    stockNumber: "SM-HRT-094",
    vehicleName: "2019 Lexus RX 350 AWD",
    customerName: "Sardar Mohammad Karim",
    customerPhone: "+93 70 882 1199",
    customerTazkira: "1397-0315-99812",
    salesAgent: "Farhad Timori",
    salePriceUSD: 34200,
    exchangeRate: 70.8,
    paymentType: "Full Cash",
    downPaymentUSD: 34200,
    installmentsRemaining: 0,
    contractNumber: "SM-CNTR-2026-088",
    saleDate: "2026-09-18",
    status: "Completed",
  },
  {
    id: "sale-003",
    stockNumber: "SM-HRT-091",
    vehicleName: "2021 Toyota Corolla S",
    customerName: "Qari Bashir Ahmad",
    customerPhone: "+93 78 554 2200",
    customerTazkira: "1400-0919-33120",
    salesAgent: "Farhad Timori",
    salePriceUSD: 16800,
    exchangeRate: 71.0,
    paymentType: "Hawala / Bank Transfer",
    downPaymentUSD: 16800,
    installmentsRemaining: 0,
    contractNumber: "SM-CNTR-2026-087",
    saleDate: "2026-09-10",
    status: "Completed",
  },
];

export const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: "exp-001",
    category: "Gomrok & Port Tariffs",
    vehicleStock: "SM-HRT-101",
    amountUSD: 6800,
    description: "Islam Qala customs duty and clearance fee for Land Cruiser 300 VXR",
    date: "2026-10-04",
  },
  {
    id: "exp-002",
    category: "Transit & Ocean Freight",
    vehicleStock: "SM-HRT-102",
    amountUSD: 1650,
    description: "Container transit Houston TX -> Bandar Abbas -> Islam Qala (Corolla SE)",
    date: "2026-10-06",
  },
  {
    id: "exp-003",
    category: "Showroom Overhead & Fuel",
    amountUSD: 1850,
    description: "Monthly showroom rent, solar generator fuel, and 24/7 security watch",
    date: "2026-10-01",
  },
  {
    id: "exp-004",
    category: "Vehicle Maintenance/Detailing",
    vehicleStock: "SM-HRT-105",
    amountUSD: 600,
    description: "Ceramic polish, AC system servicing, and fresh synthetic oil change (Camry)",
    payee: "Al-Shurooq Detailing Herat",
    receiptNumber: "DET-2026-991",
    date: "2026-10-14",
  },
];

export const INITIAL_SUPPLIERS: SupplierRecord[] = [
  {
    id: "sup-001",
    companyName: "Al-Baraka Global Motors FZE",
    contactName: "Tariq Mansoor Al-Fahim",
    country: "UAE (Ras Al Khor Auto Market, Dubai)",
    city: "Dubai",
    phone: "+971 4 333 8920",
    whatsapp: "+971 50 123 4567",
    email: "tariq@albaraka-motors.ae",
    bankOrSarrafiAccount: "Emirates NBD / Sarrafi Haji Qayoum Khorasan Account #8812",
    totalPurchasedUSD: 245000,
    totalPaidUSD: 215000,
    balanceUSD: 30000,
    notes: "Primary supplier for Toyota Land Cruiser 300 and Prado GCC specs.",
    bills: [
      {
        id: "bill-001",
        billNumber: "BILL-DXB-9102",
        supplierId: "sup-001",
        stockNumber: "SM-HRT-101",
        vehicleDescription: "2023 Toyota Land Cruiser 300 VXR",
        amountUSD: 98000,
        status: "Paid",
        issueDate: "2026-09-15",
      },
      {
        id: "bill-002",
        billNumber: "BILL-DXB-9244",
        supplierId: "sup-001",
        stockNumber: "SM-HRT-104",
        vehicleDescription: "2023 Toyota Land Cruiser Prado TXL",
        amountUSD: 62000,
        status: "Partial",
        issueDate: "2026-10-01",
      },
    ],
  },
  {
    id: "sup-002",
    companyName: "Tokyo Trans Auto Corporation",
    contactName: "Kenji Sato / Mirwais Alokozai",
    country: "Japan (Yokohama Port)",
    city: "Yokohama",
    phone: "+81 45 671 2290",
    whatsapp: "+81 90 9812 3341",
    email: "sato@tokyo-trans-auto.jp",
    bankOrSarrafiAccount: "MUFG Bank Tokyo / Hawala Khorasan Market Herat",
    totalPurchasedUSD: 180000,
    totalPaidUSD: 165000,
    balanceUSD: 15000,
    notes: "Specializes in high-grade low mileage Lexus LX600 & Hilux pickups.",
    bills: [
      {
        id: "bill-003",
        billNumber: "BILL-TYO-4410",
        supplierId: "sup-002",
        stockNumber: "SM-HRT-106",
        vehicleDescription: "2022 Lexus LX600 Ultra Luxury",
        amountUSD: 120000,
        status: "Paid",
        issueDate: "2026-09-20",
      },
    ],
  },
  {
    id: "sup-003",
    companyName: "Khorasan Transit & Customs Agency",
    contactName: "Haji Mohammad Sarwar",
    country: "Afghanistan / Iran (Islam Qala & Bandar Abbas)",
    city: "Herat",
    phone: "+93 79 988 1234",
    whatsapp: "+93 79 988 1234",
    email: "sarwar.transit@gmail.com",
    bankOrSarrafiAccount: "Azizi Bank Herat / Sarrafi Kabul Bank Safe",
    totalPurchasedUSD: 42000,
    totalPaidUSD: 37500,
    balanceUSD: 4500,
    notes: "Overland freight logistics from Bandar Abbas port and Islam Qala customs tariffs clearance.",
    bills: [
      {
        id: "bill-004",
        billNumber: "BILL-HRT-8821",
        supplierId: "sup-003",
        stockNumber: "SM-HRT-103",
        vehicleDescription: "Islam Qala Overland Carrier Freight (Hilux Adventure)",
        amountUSD: 4500,
        status: "Unpaid",
        issueDate: "2026-10-12",
      },
    ],
  },
];

export const INITIAL_INVOICES: InvoiceRecord[] = [
  {
    id: "inv-001",
    invoiceNumber: "INV-HRT-2026-0089",
    saleId: "sale-001",
    customerName: "Haji Abdul Qadir Alokozai",
    customerPhone: "+93 79 912 3456",
    customerTazkira: "1401-0402-99812",
    customerAddress: "Darwaza-e-Kandahar, Herat City",
    vehicleStock: "SM-HRT-101",
    vehicleDesc: "2023 Toyota Land Cruiser 300 VXR (Pearl White)",
    vin: "JTMCY7AJ8N4098231",
    items: [
      {
        description: "2023 Toyota Land Cruiser 300 VXR Direct GCC Import",
        descriptionDari: "موتر لندکروزر مدل ۲۰۲۳ وی اکس ار وارداتی خلیج",
        amountUSD: 118000,
      },
      {
        description: "Official Islam Qala Port Customs Clearance Title & Maktoub Fee",
        descriptionDari: "محصول قطعی گمرک اسلام قلعه و صدور مکتوب رسمی",
        amountUSD: 3500,
      },
      {
        description: "Herat Traffic Directorate Number Plate & Transfer Registration",
        descriptionDari: "ثبت ترافیک و انتقال سند قانونی ولایت هرات",
        amountUSD: 500,
      },
    ],
    subtotalUSD: 122000,
    customsFeeUSD: 0,
    registrationFeeUSD: 0,
    discountUSD: 0,
    totalUSD: 122000,
    totalAFN: 8601000,
    exchangeRate: 70.5,
    status: "Paid",
    paymentMethod: "Cash (نقدی)",
    issueDate: "2026-09-28",
    notes: "Full transaction settled. Official deed and title transferred.",
  },
  {
    id: "inv-002",
    invoiceNumber: "INV-HRT-2026-0090",
    customerName: "Mohammad Ishaq Noorzai",
    customerPhone: "+93 70 045 6789",
    customerTazkira: "1399-0112-77112",
    customerAddress: "Shahr-e-Naw, Herat",
    vehicleStock: "SM-HRT-103",
    vehicleDesc: "2022 Toyota Hilux Adventure 4x4",
    vin: "MR0HA3CD9N0128941",
    items: [
      {
        description: "2022 Toyota Hilux Adventure 4.0L V6 4WD",
        descriptionDari: "موتر تویوتا هایلوکس ادونچر مدل ۲۰۲۲ شش سیلندر",
        amountUSD: 44000,
      },
      {
        description: "Customs Clearance & Documentation",
        descriptionDari: "هزینه ترخیص و سند گمرکی",
        amountUSD: 1000,
      },
    ],
    subtotalUSD: 45000,
    customsFeeUSD: 0,
    registrationFeeUSD: 0,
    discountUSD: 500,
    totalUSD: 44500,
    totalAFN: 3137250,
    exchangeRate: 70.5,
    status: "Partially Paid",
    paymentMethod: "Sarrafi Hawala (حواله صرافی)",
    issueDate: "2026-10-10",
    notes: "$30,000 Hawala received. Remaining $14,500 due on vehicle handover.",
  },
];

export const INITIAL_PAYMENTS: PaymentVoucherRecord[] = [
  {
    id: "pv-001",
    voucherNumber: "PV-REC-2026-001",
    voucherType: "CUSTOMER_PAYMENT",
    date: "2026-09-28",
    partyName: "Haji Abdul Qadir Alokozai",
    partyPhone: "+93 79 912 3456",
    partyTazkira: "1401-0402-99812",
    amountUSD: 122000,
    amountAFN: 8601000,
    exchangeRate: 70.5,
    paymentMethod: "Cash (صندوق)",
    sarrafiAccount: "Showroom Central Vault (صندوق مرکزی)",
    referenceNumber: "CASH-SETTLE-001",
    vehicleStock: "SM-HRT-101",
    purpose: "Full settlement for Land Cruiser 300 purchase under contract SM-CNTR-2026-089",
    recordedBy: "Mirwais Saljuqi (Accountant)",
  },
  {
    id: "pv-002",
    voucherNumber: "PV-PAY-2026-002",
    voucherType: "SUPPLIER_PAYMENT",
    date: "2026-10-02",
    partyName: "Al-Baraka Global Motors FZE",
    partyPhone: "+971 50 123 4567",
    amountUSD: 45000,
    amountAFN: 3172500,
    exchangeRate: 70.5,
    paymentMethod: "Sarrafi Hawala (حواله صرافی)",
    sarrafiAccount: "Sarrafi Haji Qayoum Khorasan Market",
    referenceNumber: "HWL-DXB-99201",
    supplierId: "sup-001",
    purpose: "Partial balance settlement for Dubai consignment vehicles (Prado & LC300)",
    recordedBy: "Mirwais Saljuqi (Accountant)",
  },
  {
    id: "pv-003",
    voucherNumber: "PV-EXP-2026-003",
    voucherType: "EXPENSE_PAYMENT",
    date: "2026-10-04",
    partyName: "Gomrok Herat / Islam Qala Port Directorate",
    amountUSD: 6800,
    amountAFN: 479400,
    exchangeRate: 70.5,
    paymentMethod: "Cash (صندوق)",
    referenceNumber: "MKT-HRT-88124",
    vehicleStock: "SM-HRT-101",
    purpose: "Official customs tariff duty paid for Land Cruiser 300 clearance",
    recordedBy: "Mirwais Saljuqi (Accountant)",
  },
];

export const INITIAL_ACCOUNTS: AccountRecord[] = [
  { code: "1010", name: "Showroom Central Cash Safe", nameDari: "صندوق مرکزی نندارتون (نقدی)", type: "ASSET", balanceUSD: 85400 },
  { code: "1020", name: "Sarrafi Khorasan Holding Account", nameDari: "حساب صرافی مارکیت خراسان هرات", type: "ASSET", balanceUSD: 142000 },
  { code: "1030", name: "Azizi Bank Commercial USD Account", nameDari: "حساب بانکی ارزی عزیزی بانک", type: "ASSET", balanceUSD: 95000 },
  { code: "1040", name: "Vehicle Inventory Asset (Lot & Port)", nameDari: "دارایی موجودی موترها (نندارتون و گمرک)", type: "ASSET", balanceUSD: 375500 },
  { code: "1050", name: "Accounts Receivable (Customer Installments)", nameDari: "حساب‌های دریافتنی (طلبکاری از مشتریان)", type: "ASSET", balanceUSD: 14500 },
  { code: "2010", name: "Accounts Payable (Auto Suppliers UAE/Japan)", nameDari: "حساب‌های پرداختنی (بدهکاری به تأمین‌کنندگان)", type: "LIABILITY", balanceUSD: 49500 },
  { code: "2020", name: "Customs Duty Payable (Gomrok Islam Qala)", nameDari: "عوارض گمرکی پرداختنی اسلام قلعه", type: "LIABILITY", balanceUSD: 4500 },
  { code: "2030", name: "Customer Advance Deposits", nameDari: "پیش‌پرداخت و بیعانه موترها", type: "LIABILITY", balanceUSD: 8000 },
  { code: "3010", name: "Owner Capital & Equity", nameDari: "سرمایه مالک نندارتون (حاجی احمد شاه)", type: "EQUITY", balanceUSD: 450000 },
  { code: "3020", name: "Opening Balance Equity", nameDari: "تعدیل مانده افتتاحیه", type: "EQUITY", balanceUSD: 176500 },
  { code: "4010", name: "Vehicle Sales Revenue", nameDari: "عواید حاصل از فروش موترها", type: "REVENUE", balanceUSD: 236800 },
  { code: "4020", name: "Documentation & Transfer Fee Income", nameDari: "عواید کمیشن و ترخیص اسناد رسمی", type: "REVENUE", balanceUSD: 4800 },
  { code: "5010", name: "COGS - Vehicle Purchase Cost", nameDari: "بهای تمام‌شده خرید موتر (دبی/جاپان)", type: "EXPENSE", balanceUSD: 182000 },
  { code: "5020", name: "COGS - Freight & Port Clearance", nameDari: "بهای تمام‌شده ترانزیت و محصول گمرک", type: "EXPENSE", balanceUSD: 24500 },
  { code: "6010", name: "Operating Expense - Detailing & Detailing", nameDari: "هزینه رنگ، ترمیم و سرویس تخنیکی", type: "EXPENSE", balanceUSD: 3400 },
  { code: "6020", name: "Operating Expense - Solar, Fuel & Generator", nameDari: "هزینه برق، سولر و دیزل ژنراتور نندارتون", type: "EXPENSE", balanceUSD: 2600 },
  { code: "6030", name: "Operating Expense - Staff Salaries & Bonus", nameDari: "معاشات و کمیشن ماهوار پرسونل", type: "EXPENSE", balanceUSD: 5200 },
];

export const INITIAL_JOURNAL_ENTRIES: JournalEntryRecord[] = [
  {
    id: "je-001",
    entryNumber: "JE-2026-001",
    date: "2026-09-28",
    description: "Sale of Land Cruiser 300 VXR (SM-HRT-101) full cash settlement",
    reference: "INV-HRT-2026-0089",
    debitAccount: "1010 - Showroom Central Cash Safe",
    creditAccount: "4010 - Vehicle Sales Revenue",
    amountUSD: 122000,
    amountAFN: 8601000,
  },
  {
    id: "je-002",
    entryNumber: "JE-2026-002",
    date: "2026-10-02",
    description: "Hawala payment to Al-Baraka Motors Dubai via Sarrafi Khorasan",
    reference: "PV-PAY-2026-002",
    debitAccount: "2010 - Accounts Payable (Auto Suppliers)",
    creditAccount: "1020 - Sarrafi Khorasan Holding Account",
    amountUSD: 45000,
    amountAFN: 3172500,
  },
  {
    id: "je-003",
    entryNumber: "JE-2026-003",
    date: "2026-10-04",
    description: "Islam Qala port customs duty payment for Land Cruiser 300",
    reference: "PV-EXP-2026-003",
    debitAccount: "5020 - COGS - Freight & Port Clearance",
    creditAccount: "1010 - Showroom Central Cash Safe",
    amountUSD: 6800,
    amountAFN: 479400,
  },
];
