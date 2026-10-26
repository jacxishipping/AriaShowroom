import {
  PrismaClient,
  UserRole,
  VehicleStatus,
  FuelType,
  TransmissionType,
  SteeringSide,
  PaymentType,
  InstallmentStatus,
  LeadStage,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { createLedgerEntry, ensureChartOfAccounts } from "../src/lib/ledger";

const prisma = new PrismaClient();

const DEFAULT_SEED_BRANDING = {
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

async function main() {
  if (process.env.ALLOW_DESTRUCTIVE_SEED !== "true") {
    throw new Error(
      "Seeding deletes existing sample data. Set ALLOW_DESTRUCTIVE_SEED=true to confirm."
    );
  }

  const adminSeedPassword = process.env.SEED_ADMIN_PASSWORD;
  const salesSeedPassword = process.env.SEED_SALES_PASSWORD;
  const accountantSeedPassword = process.env.SEED_ACCOUNTANT_PASSWORD;
  if (
    !adminSeedPassword ||
    adminSeedPassword.length < 12 ||
    !salesSeedPassword ||
    salesSeedPassword.length < 12 ||
    !accountantSeedPassword ||
    accountantSeedPassword.length < 12 ||
    new Set([adminSeedPassword, salesSeedPassword, accountantSeedPassword]).size !== 3
  ) {
    throw new Error(
      "Set separate, unique SEED_ADMIN_PASSWORD, SEED_SALES_PASSWORD, and SEED_ACCOUNTANT_PASSWORD values of at least 12 characters."
    );
  }

  const [adminPasswordHash, salesPasswordHash, accountantPasswordHash] =
    await Promise.all([
      bcrypt.hash(adminSeedPassword, 12),
      bcrypt.hash(salesSeedPassword, 12),
      bcrypt.hash(accountantSeedPassword, 12),
    ]);

  const exchangeRate = 70.5;
  console.log("Seeding Aria Motors (Herat Showroom) database & double-entry ledger...");

  // 1. Clean existing data in FK-safe order
  await prisma.auditLog.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.account.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.supplierBill.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.installmentPayment.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.vehicleDocument.deleteMany();
  await prisma.vehicleImage.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.dealershipSettings.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Singleton Dealership Settings
  await prisma.dealershipSettings.create({
    data: {
      id: "default",
      exchangeRate,
      activeBranch: "Herat HQ · Bagh-e-Azadi",
      branding: DEFAULT_SEED_BRANDING,
    },
  });

  // 3. Create Staff Users (SuperAdmin, SalesAgent, Accountant)
  await prisma.user.create({
    data: {
      name: "Haji Ahmad Shah Aria",
      email: "admin@ariamotors.af",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      phone: "+93 79 910 2030",
    },
  });

  const salesAgent = await prisma.user.create({
    data: {
      name: "Farhad Timori",
      email: "sales@ariamotors.af",
      passwordHash: salesPasswordHash,
      role: UserRole.SALES,
      phone: "+93 70 245 8890",
    },
  });

  await prisma.user.create({
    data: {
      name: "Mirwais Saljuqi",
      email: "finance@ariamotors.af",
      passwordHash: accountantPasswordHash,
      role: UserRole.ACCOUNTANT,
      phone: "+93 78 611 4400",
    },
  });

  // 4. Seed Vehicles, Sale, Expenses, Supplier Bill & Balanced Double-Entry Journal Atomically
  await prisma.$transaction(async (tx) => {
    await ensureChartOfAccounts(tx);

    // Seed initial working cash into Showroom Central Cash Safe
    await createLedgerEntry(tx, {
      entryNumber: "JE-SEED-CAP-001",
      description: "Initial showroom operating treasury capital",
      reference: "ARIA-CAP-2026",
      debitAccount: "1010 - Showroom Central Cash Safe",
      creditAccount: "3010 - Owner Capital & Equity",
      amountUSD: 50000,
      amountAFN: Math.round(50000 * exchangeRate),
    });

    const v1 = await tx.vehicle.create({
      data: {
        stockNumber: "ARI-HRT-101",
        vin: "JTMCY7AJ8N4098231",
        make: "Toyota",
        model: "Land Cruiser 300 VXR",
        year: 2023,
        trim: "VXR Twin-Turbo V6",
        bodyType: "SUV",
        originCountry: "UAE",
        steering: SteeringSide.LEFT_HAND,
        customsClearance: "Gomrok Herat (Islam Qala) - One-Key Maktoub",
        cleanTitle: true,
        mileage: 14200,
        fuelType: FuelType.PETROL,
        transmission: TransmissionType.AUTOMATIC,
        driveType: "4WD",
        color: "Pearl White Metallic",
        status: VehicleStatus.SOLD,
        purchasePrice: 74500,
        freightCost: 1400,
        customsDuty: 6800,
        repairCost: 300,
        landedCost: 83000,
        minTargetPrice: 88000,
        sellingPrice: 91500,
        currency: "USD",
        features: [
          "3.5L V6 Twin-Turbo",
          "JBL 14-Speaker Audio",
          "Cool Box Refrigerator",
          "360° Bird-Eye Camera",
          "Rear Seat Entertainment",
          "Crawl Control & Multi-Terrain Select",
          "Beige Quilted Leather",
        ],
        description:
          "GCC Spec Dubai import with zero paint and full Gomrok Herat customs clearance. Inspected at Aria Motors Showroom on Bagh-e-Azadi Boulevard.",
        descriptionDari:
          "لندکروزر VXR مدل ۲۰۲۳ مشخصات خلیج، بدون رنگ و تکر، محصول شده گمرک هرات با اسناد کامل یک کلید.",
        conditionNotes: {
          exterior: "10/10 - Original Factory Pearl Paint",
          interior: "10/10 - Beige Nappa Leather, Smoke-Free",
          engine: "10/10 - 3.5L Twin-Turbo Factory Sealed",
          tires: "95% Dunlop Grandtrek AT25",
          accidentHistory: "Zero Accidents / Original Airbags",
        },
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1400&q=85",
              isPrimary: true,
              order: 1,
            },
            {
              url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1400&q=85",
              isPrimary: false,
              order: 2,
            },
          ],
        },
        documents: {
          create: [
            {
              title: "Herat Customs Maktoub #44918",
              fileUrl: "/docs/gomrok-lc300.pdf",
              docType: "CUSTOMS_CLEARANCE",
            },
            {
              title: "Dubai RTA Export Certificate",
              fileUrl: "/docs/rta-lc300.pdf",
              docType: "EXPORT_TITLE",
            },
          ],
        },
      },
    });

    const v2 = await tx.vehicle.create({
      data: {
        stockNumber: "ARI-HRT-102",
        vin: "2T1BURHE9KC210944",
        make: "Toyota",
        model: "Corolla S",
        year: 2020,
        trim: "SE Special Edition",
        bodyType: "Sedan",
        originCountry: "USA",
        steering: SteeringSide.LEFT_HAND,
        customsClearance: "Gomrok Herat - Verified Plate",
        cleanTitle: true,
        mileage: 38400,
        fuelType: FuelType.PETROL,
        transmission: TransmissionType.AUTOMATIC,
        driveType: "FWD",
        color: "Celestite Gray",
        status: VehicleStatus.AVAILABLE,
        purchasePrice: 9200,
        freightCost: 1650,
        customsDuty: 2150,
        repairCost: 400,
        landedCost: 13400,
        minTargetPrice: 14800,
        sellingPrice: 15500,
        currency: "USD",
        features: [
          "Apple CarPlay & Android Auto",
          "Paddle Shifters",
          "Toyota Safety Sense 2.0",
          "Sunroof / Moonroof",
          "18-Inch Machined Alloy Wheels",
          "Push Button Start",
        ],
        description:
          "Clean Texas import Toyota Corolla SE in high-demand Celestite Gray. Low mileage, original catalytic converter, and Herat negative-6 plate ready.",
        descriptionDari:
          "تویوتا کرولا S/SE مدل ۲۰۲۰ واردات امریکا، پلیت منفی ۶ هرات، کتلست اصلی کمپنی، بسیار کم مصرف.",
        conditionNotes: {
          exterior: "9.5/10 - Minor bumper touch-up only",
          interior: "10/10 - Black Sport SofTex Trim",
          engine: "10/10 - 2.0L Dynamic Force",
          tires: "90% Michelin Primacy",
          accidentHistory: "Clean Carfax - Original Chassis",
        },
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1400&q=85",
              isPrimary: true,
              order: 1,
            },
          ],
        },
      },
    });

    const v3 = await tx.vehicle.create({
      data: {
        stockNumber: "ARI-HRT-103",
        vin: "JTJHY7AX6L4319872",
        make: "Lexus",
        model: "LX 570",
        year: 2021,
        trim: "Super Sport Black Edition S",
        bodyType: "SUV",
        originCountry: "Canada",
        steering: SteeringSide.LEFT_HAND,
        customsClearance: "Gomrok Herat - Legal Maktoub",
        cleanTitle: true,
        mileage: 27900,
        fuelType: FuelType.PETROL,
        transmission: TransmissionType.AUTOMATIC,
        driveType: "4WD",
        color: "Obsidian Black",
        status: VehicleStatus.RESERVED,
        purchasePrice: 62000,
        freightCost: 2100,
        customsDuty: 5900,
        repairCost: 500,
        landedCost: 70500,
        minTargetPrice: 75000,
        sellingPrice: 78500,
        currency: "USD",
        features: [
          "5.7L Naturally Aspirated V8",
          "Mark Levinson 19-Speaker Reference",
          "Hydraulic Height Control (AHC)",
          "Cabernet Red Semi-Aniline Leather",
          "Head-Up Display",
          "21-Inch Forged Alloy Wheels",
        ],
        description:
          "Canadian-spec Lexus LX 570 Black Edition with Cabernet Red interior. Rust-free chassis, hydraulic suspension tested, and full customs clearance.",
        descriptionDari:
          "لکسس LX570 بلک ادیشن مدل ۲۰۲۱ واردات کانادا، داخل سرخ، کمک هایدرولیک فعال و بدون هیچگونه عوارض.",
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1400&q=85",
              isPrimary: true,
              order: 1,
            },
          ],
        },
      },
    });

    const v4 = await tx.vehicle.create({
      data: {
        stockNumber: "ARI-HRT-104",
        vin: "MROBA3CD9N0192834",
        make: "Toyota",
        model: "Hilux Revo Rocco",
        year: 2022,
        trim: "2.8L Turbo Diesel 4x4",
        bodyType: "Pickup",
        originCountry: "UAE",
        steering: SteeringSide.LEFT_HAND,
        customsClearance: "Islam Qala Port Cleared",
        cleanTitle: true,
        mileage: 22100,
        fuelType: FuelType.DIESEL,
        transmission: TransmissionType.AUTOMATIC,
        driveType: "4WD",
        color: "Attitude Black",
        status: VehicleStatus.AVAILABLE,
        purchasePrice: 31500,
        freightCost: 1100,
        customsDuty: 3800,
        repairCost: 250,
        landedCost: 36650,
        minTargetPrice: 39500,
        sellingPrice: 41200,
        currency: "USD",
        features: [
          "2.8L GD-FTV Turbo Diesel",
          "Rear Differential Lock",
          "Rocco Factory Roll Bar & Bedliner",
          "LED Bi-Beam Headlamps",
          "Downhill Assist Control",
        ],
        description:
          "Heavy-duty Toyota Hilux Revo Rocco 2.8L Diesel engineered for Afghan terrain. Original factory Rocco package with diff-lock.",
        descriptionDari:
          "تویوتا هایلکس روکو ۲۰۲۲ دیزل ۲.۸ توربو، دو دف کمپنی، مناسب برای تمام مسیرهای افغانستان.",
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1400&q=85",
              isPrimary: true,
              order: 1,
            },
          ],
        },
      },
    });

    // Book opening inventory asset (1040 vs 3010) for all 4 vehicles
    for (const veh of [v1, v2, v3, v4]) {
      await createLedgerEntry(tx, {
        entryNumber: `JE-INV-SEED-${veh.stockNumber}`,
        description: `Opening inventory asset — ${veh.year} ${veh.make} ${veh.model} (${veh.stockNumber})`,
        reference: veh.stockNumber,
        debitAccount: "1040 - Vehicle Inventory Asset (Lot & Port)",
        creditAccount: "3010 - Owner Capital & Equity",
        amountUSD: veh.landedCost,
        amountAFN: Math.round(veh.landedCost * exchangeRate),
      });
    }

    // Create Customers
    const customer1 = await tx.customer.create({
      data: {
        fullName: "Haji Abdul Qadir Alokozai",
        phone: "+93 79 944 5566",
        whatsapp: "+93799445566",
        tazkiraNumber: "1400-0402-88912",
        city: "Herat",
        address: "Shahr-e-Naw, Street 4, Herat",
        tradeInRecord: "2016 Toyota Prado TXL ($26,000 valuation)",
        leadStage: LeadStage.CLOSED_WON,
        budget: 95000,
        notes: "Long-term VIP merchant in Herat Industrial City.",
      },
    });

    await tx.customer.create({
      data: {
        fullName: "Eng. Jawid Barakzai",
        phone: "+93 70 033 1122",
        whatsapp: "+93700331122",
        tazkiraNumber: "1399-0811-44210",
        city: "Herat",
        address: "Jada-e-Bank Khoon, Herat",
        leadStage: LeadStage.NEGOTIATION,
        budget: 80000,
        interestedInVehicleId: v3.id,
        notes: "Placed $5,000 deposit inquiry on Lexus LX 570.",
      },
    });

    // Create Sale & Installment Schedule on v1 (ARI-HRT-101) + Matching Ledger Entries
    const contractNumber = "ARI-CNT-2026-089";
    await tx.sale.create({
      data: {
        vehicleId: v1.id,
        customerId: customer1.id,
        sellerId: salesAgent.id,
        salePrice: 90500,
        currency: "USD",
        exchangeRate,
        paymentType: PaymentType.INSTALLMENT,
        contractNumber,
        notes:
          "Paid $70,500 cash upfront; $20,000 in two 30-day installments ($10,000 collected, $10,000 pending).",
        installments: {
          create: [
            {
              dueDate: new Date("2026-11-15"),
              amount: 10000,
              status: InstallmentStatus.PAID,
              paidAt: new Date("2026-10-15"),
            },
            {
              dueDate: new Date("2026-12-15"),
              amount: 10000,
              status: InstallmentStatus.PENDING,
            },
          ],
        },
      },
    });

    // COGS entry ($83,000 out of 1040 into 5010)
    await createLedgerEntry(tx, {
      entryNumber: "JE-COGS-SEED-101",
      description: `Cost of vehicle sold ${v1.stockNumber}`,
      reference: contractNumber,
      debitAccount: "5010 - COGS - Vehicle Purchase Cost",
      creditAccount: "1040 - Vehicle Inventory Asset (Lot & Port)",
      amountUSD: v1.landedCost,
      amountAFN: Math.round(v1.landedCost * exchangeRate),
    });

    // Collected cash revenue ($80,500 = $70,500 down payment + $10,000 paid installment)
    await createLedgerEntry(tx, {
      entryNumber: "JE-SALE-SEED-101",
      description: `Vehicle sale cash proceeds ${contractNumber}`,
      reference: contractNumber,
      debitAccount: "1010 - Showroom Central Cash Safe",
      creditAccount: "4010 - Vehicle Sales Revenue",
      amountUSD: 80500,
      amountAFN: Math.round(80500 * exchangeRate),
    });

    // Remaining pending installment ($10,000 in 1050 AR)
    await createLedgerEntry(tx, {
      entryNumber: "JE-AR-SEED-101",
      description: `Installment receivable for ${contractNumber}`,
      reference: contractNumber,
      debitAccount: "1050 - Accounts Receivable (Customer Installments)",
      creditAccount: "4010 - Vehicle Sales Revenue",
      amountUSD: 10000,
      amountAFN: Math.round(10000 * exchangeRate),
    });

    // Seed Showroom Overhead Expense + Matching Ledger Entry
    const overheadExpense = await tx.expense.create({
      data: {
        category: "Showroom Overhead",
        amount: 1850,
        currency: "USD",
        description:
          "Monthly showroom rent, solar generator fuel, and security guards",
        payee: "Herat Commercial Properties",
        receiptNum: "EXP-HRT-001",
      },
    });

    await createLedgerEntry(tx, {
      entryNumber: "JE-EXP-SEED-001",
      description: "Showroom Overhead: Monthly showroom rent, solar generator fuel, and security guards [Receipt EXP-HRT-001]",
      reference: overheadExpense.id,
      debitAccount: "6020 - Operating Expense - Solar, Fuel & Generator",
      creditAccount: "1010 - Showroom Central Cash Safe",
      amountUSD: 1850,
      amountAFN: Math.round(1850 * exchangeRate),
    });

    // Seed Dubai Auto Supplier & Open Consignment Bill
    await tx.supplier.create({
      data: {
        companyName: "Al-Aweer Gulf Motors FZE",
        contactName: "Tariq Al-Mansoori",
        country: "UAE",
        city: "Dubai",
        phone: "+971 50 442 8810",
        whatsapp: "+971504428810",
        email: "exports@alaweergulf.ae",
        bankOrSarrafiAccount: "Khorasan Sarrafi Market · Hawala Desk #14",
        totalPurchasedUSD: 36650,
        totalPaidUSD: 36650,
        balanceUSD: 0,
        notes: "Primary GCC Land Cruiser & Hilux exporter at Ras Al Khor Auto Market.",
      },
    });
  });

  console.log("Seed completed successfully with balanced double-entry accounts!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
