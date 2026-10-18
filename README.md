# Sadozai Motors Herat (سدوزی موترز هرات)
### Luxury Car Showroom & Direct Sales Management System (Customer Portal + Dealership ERP)

A production-grade, full-stack automotive platform designed specifically for the automotive market in **Herat, Afghanistan**, engineered with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**.

---

## 🌟 Key Features & Architectural Highlights

### 1. Dual Customer & Back-Office Architecture
- **Public Customer Portal (`/` & `/inventory` & `/vehicles/[id]`):**
  - Cinematic hero showcase featuring high-demand Afghan market vehicles (e.g. Toyota Land Cruiser 300 VXR, Lexus LX 570, Hilux Revo Rocco, Corolla SE, Camry Hybrid).
  - Faceted instant multi-criteria filter (Make, Model, Year, Body Type, Fuel, Transmission, Steering Side, Import Origin, Status).
  - Direct WhatsApp lead capture with pre-filled vehicle specs, stock numbers, and chassis VIN.
  - Interactive Herat showroom location card on Bagh-e-Azadi Avenue with business hours, solar generator status, and Islam Qala port import highlights.
- **Internal Dealership ERP & CRM (`/admin`):**
  - **Role-Based Access Control (RBAC):** `SuperAdmin` (Haji Ahmad Shah), `SalesAgent` (Farhad Timori), and `Accountant` (Mirwais Saljuqi).
  - **Lot & Inventory CRUD:** Acquisition and landed cost accounting (Purchase Price + Shipping + Herat Customs Duty + Detailing = Total Landed Cost vs Target Selling Price).
  - **CRM & Customer Registry:** Lead progression pipeline from New Inquiry to Closed/Won with Tazkira / National ID records and trade-in valuations.
  - **Sales Engine & Bilingual Contracts:** Automatic generation of legal sales contracts with dual-currency settlement (USD and AFN).
  - **Financials & Overhead Tracking:** KPI cards for lot value, monthly gross sales, average net margins, and showroom expense vouchers.

### 2. Tailored for the Afghan & Herat Automotive Market
- **Islam Qala & Gomrok Herat Customs Integration:** Full verification status tracking for customs clearance papers (*One-Key Maktoub*, *Islam Qala Dry Port Clearances*).
- **Dual-Currency Engine:** Instant conversion between **USD ($)** and **Afghan Afghani (؋)** with real-time exchange rate controls (default: 1 USD = 70.5 AFN).
- **Bi-directional Internationalization (i18n):**
  - **English (LTR)** with clean typography.
  - **Dari / Persian (RTL)** with native font hierarchy and terminology (`تذکره`, `محصول گمرک اسلام قلعه`, `اشترنگ`, `کتلست`).
- **Printable Bilingual Legal Deed & Deposit Receipt (`VehicleDeedModal`):**
  - Formatted under Afghan commercial deed standards.
  - Includes seller/merchant credentials, buyer identity (Tazkira), VIN/chassis guarantees, payment terms, and official showroom stamp certification.

---

## 🗄️ Database Schema (`prisma/schema.prisma`)

```prisma
model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  role         UserRole @default(SALES) // ADMIN, SALES, ACCOUNTANT
  phone        String?
  sales        Sale[]
}

model Vehicle {
  id               String            @id @default(cuid())
  stockNumber      String            @unique
  vin              String            @unique
  make             String
  model            String
  year             Int
  trim             String?
  bodyType         String
  originCountry    String            // UAE, USA, Canada, Japan, Europe
  steering         SteeringSide      // LEFT_HAND, RIGHT_HAND_CONVERTED
  customsClearance String            // Gomrok Herat verified
  cleanTitle       Boolean
  mileage          Int
  fuelType         FuelType
  transmission     TransmissionType
  driveType        String
  color            String
  status           VehicleStatus     // IN_TRANSIT, UNDER_PREP, AVAILABLE, RESERVED, SOLD
  purchasePrice    Float
  freightCost      Float
  customsDuty      Float             // Herat customs tariff
  repairCost       Float
  landedCost       Float
  sellingPrice     Float
  features         String[]
  description      String
  descriptionDari  String?
  images           VehicleImage[]
  documents        VehicleDocument[]
  sales            Sale[]
  expenses         Expense[]
}

model Customer {
  id            String    @id @default(cuid())
  fullName      String
  phone         String
  whatsapp      String?
  tazkiraNumber String    @unique
  city          String    @default("Herat")
  leadStage     LeadStage
  sales         Sale[]
}

model Sale {
  id             String               @id @default(cuid())
  vehicleId      String
  customerId     String
  sellerId       String
  salePrice      Float
  currency       String
  exchangeRate   Float
  paymentType    PaymentType
  contractNumber String               @unique
  installments   InstallmentPayment[]
}
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+
- PostgreSQL database (or Supabase Postgres)

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Database Migration & Seed
```bash
# Push schema to PostgreSQL
npm run db:push

# Populate sample Herat vehicles, customers, and sales
npm run db:seed
```

### 4. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the public showroom or [http://localhost:3000/admin](http://localhost:3000/admin) for the dealership ERP.
