import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentType, VehicleStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireApiRole } from "@/lib/api-auth";
import { createLedgerEntry } from "@/lib/ledger";

export const dynamic = "force-dynamic";

export async function GET() {
  const unauthorized = await requireApiRole(["ADMIN", "SALES", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;

  try {
    const sales = await prisma.sale.findMany({
      include: {
        vehicle: {
          include: {
            images: {
              where: { isPrimary: true },
            },
          },
        },
        customer: true,
        seller: {
          select: { id: true, name: true, role: true },
        },
        installments: true,
      },
      orderBy: { saleDate: "desc" },
    });

    return NextResponse.json({ success: true, count: sales.length, data: sales });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireApiRole(["ADMIN", "SALES"]);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const {
      vehicleId,
      salePrice,
      currency = "USD",
      exchangeRate = 70.5,
      paymentType = "CASH",
      notes,
    } = body;
    const price = Number(salePrice);
    const rate = Number(exchangeRate) || 70.5;
    const session = await getServerSession(authOptions);
    const seller = session?.user?.email
      ? await prisma.user.findUnique({ where: { email: session.user.email } })
      : null;

    if (!seller) {
      return NextResponse.json(
        { success: false, error: "Your staff account must exist in the database before recording sales" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(price) || price <= 0 || !body.customerName || !body.customerPhone || !body.customerTazkira) {
      return NextResponse.json(
        { success: false, error: "Vehicle, buyer identity, and a positive sale price are required" },
        { status: 400 }
      );
    }

    const contractNumber = `SM-CNT-${new Date().getFullYear()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const result = await prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.findUnique({ where: { id: vehicleId } });
      if (!vehicle || vehicle.status === VehicleStatus.SOLD) {
        throw new Error("Vehicle is unavailable or already sold");
      }

      const customer = await tx.customer.upsert({
        where: { tazkiraNumber: body.customerTazkira },
        create: {
          fullName: body.customerName,
          phone: body.customerPhone,
          whatsapp: body.customerPhone,
          tazkiraNumber: body.customerTazkira,
        },
        update: {
          fullName: body.customerName,
          phone: body.customerPhone,
        },
      });

      const paymentTypeValue = paymentType as PaymentType;
      if (!Object.values(PaymentType).includes(paymentTypeValue)) {
        throw new Error("Invalid payment type");
      }

      const sale = await tx.sale.create({
        data: {
          vehicleId,
          customerId: customer.id,
          sellerId: seller.id,
          salePrice: price,
          currency,
          exchangeRate: rate,
          paymentType: paymentTypeValue,
          contractNumber,
          notes,
        },
        include: {
          vehicle: true,
          customer: true,
        },
      });

      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { status: VehicleStatus.SOLD },
      });

      if (Number(vehicle.landedCost) > 0) {
        await createLedgerEntry(tx, {
          entryNumber: `JE-COGS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          description: `Cost of vehicle sold ${vehicle.stockNumber}`,
          reference: contractNumber,
          debitAccount: "5010 - COGS - Vehicle Purchase Cost",
          creditAccount: "1040 - Vehicle Inventory Asset (Lot & Port)",
          amountUSD: Number(vehicle.landedCost),
          amountAFN: Math.round(Number(vehicle.landedCost) * rate),
        });
      }

      const downPayment = Math.min(Math.max(Number(body.downPaymentUSD) || 0, 0), price);
      const paymentAccount = paymentTypeValue === PaymentType.BANK_TRANSFER
        ? "1030 - Azizi Bank Commercial USD Account"
        : "1010 - Showroom Central Cash Safe";
      const journalEntries = [];

      if (downPayment > 0 || paymentTypeValue !== PaymentType.INSTALLMENT) {
        const paidAmount = paymentTypeValue === PaymentType.INSTALLMENT ? downPayment : price;
        if (paidAmount > 0) {
          journalEntries.push(await createLedgerEntry(tx, {
              entryNumber: `JE-SALE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              description: `Vehicle sale ${contractNumber}`,
              reference: contractNumber,
              debitAccount: paymentAccount,
              creditAccount: "4010 - Vehicle Sales Revenue",
              amountUSD: paidAmount,
              amountAFN: Math.round(paidAmount * rate),
          }));
        }
      }

      const outstanding = Math.max(price - downPayment, 0);
      if (paymentTypeValue === PaymentType.INSTALLMENT && outstanding > 0) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        await tx.installmentPayment.create({
          data: { saleId: sale.id, dueDate, amount: outstanding },
        });
        journalEntries.push(await createLedgerEntry(tx, {
            entryNumber: `JE-AR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            description: `Installment receivable for ${contractNumber}`,
            reference: contractNumber,
            debitAccount: "1050 - Accounts Receivable (Customer Installments)",
            creditAccount: "4010 - Vehicle Sales Revenue",
            amountUSD: outstanding,
            amountAFN: Math.round(outstanding * rate),
        }));
      }

      return { ...sale, customer, journalEntries };
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record sale" },
      { status: 500 }
    );
  }
}
