import { PrismaClient, UserRole, VehicleStatus, FuelType, TransmissionType, SteeringSide, PaymentType, InstallmentStatus, LeadStage } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Sadozai Motors (Herat Showroom) database...");

  // 1. Clean existing data
  await prisma.installmentPayment.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.vehicleDocument.deleteMany();
  await prisma.vehicleImage.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users (SuperAdmin, SalesAgent, Accountant)
  const admin = await prisma.user.create({
    data: {
      name: "Haji Ahmad Shah Sadozai",
      email: "admin@sadozaimotors.af",
      passwordHash: "$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm",
      role: UserRole.ADMIN,
      phone: "+93 79 910 2030",
    },
  });

  const salesAgent = await prisma.user.create({
    data: {
      name: "Farhad Timori",
      email: "sales@sadozaimotors.af",
      passwordHash: "$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm",
      role: UserRole.SALES,
      phone: "+93 70 245 8890",
    },
  });

  const accountant = await prisma.user.create({
    data: {
      name: "Mirwais Saljuqi",
      email: "finance@sadozaimotors.af",
      passwordHash: "$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm",
      role: UserRole.ACCOUNTANT,
      phone: "+93 78 611 4400",
    },
  });

  // 3. Create Realistic Afghan / Herat Vehicle Inventory
  const v1 = await prisma.vehicle.create({
    data: {
      stockNumber: "SM-HRT-101",
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
      status: VehicleStatus.AVAILABLE,
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
        "GCC Spec Dubai import with zero paint and full Gomrok Herat customs clearance. Inspected at Sadozai Showroom on Bagh-e-Azadi Avenue.",
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

  const v2 = await prisma.vehicle.create({
    data: {
      stockNumber: "SM-HRT-102",
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

  const v3 = await prisma.vehicle.create({
    data: {
      stockNumber: "SM-HRT-103",
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

  const v4 = await prisma.vehicle.create({
    data: {
      stockNumber: "SM-HRT-104",
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

  // 4. Create Customers
  const customer1 = await prisma.customer.create({
    data: {
      fullName: "Haji Abdul Qadir Alokozai",
      phone: "+93 79 944 5566",
      whatsapp: "+93799445566",
      tazkiraNumber: "1400-0402-88912",
      city: "Herat",
      address: "Shahr-e-Naw, Street 4, Herat",
      tradeInRecord: "2016 Toyota Prado TXL ($26,000 valuation)",
      leadStage: LeadStage.CLOSED_WON,
      notes: "Long-term VIP merchant in Herat Industrial City.",
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      fullName: "Eng. Jawid Barakzai",
      phone: "+93 70 033 1122",
      whatsapp: "+93700331122",
      tazkiraNumber: "1399-0811-44210",
      city: "Herat",
      address: "Jada-e-Bank Khoon, Herat",
      leadStage: LeadStage.NEGOTIATION,
      notes: "Placed $5,000 deposit on Lexus LX 570.",
    },
  });

  // 5. Create Sale & Installment Schedule
  await prisma.sale.create({
    data: {
      vehicleId: v1.id,
      customerId: customer1.id,
      sellerId: salesAgent.id,
      salePrice: 90500,
      currency: "USD",
      exchangeRate: 70.5,
      paymentType: PaymentType.INSTALLMENT,
      contractNumber: "SM-CNTR-2026-089",
      notes: "Paid $70,500 cash upfront; $20,000 remaining in two 30-day installments.",
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

  // 6. Create Showroom Expenses
  await prisma.expense.createMany({
    data: [
      {
        vehicleId: v1.id,
        category: "Gomrok / Customs Clearance",
        amount: 6800,
        currency: "USD",
        description: "Islam Qala Port & Herat Customs tariff for Land Cruiser 300",
      },
      {
        vehicleId: v2.id,
        category: "Logistics & Bandar Abbas Transit",
        amount: 1650,
        currency: "USD",
        description: "Container transit from Houston via Bandar Abbas to Islam Qala",
      },
      {
        category: "Showroom Overhead",
        amount: 1850,
        currency: "USD",
        description: "Monthly showroom rent, solar generator fuel, and security guards",
      },
    ],
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
