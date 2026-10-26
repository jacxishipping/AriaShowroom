import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { PaymentType, VehicleStatus, InstallmentStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireApiRole } from "@/lib/api-auth";
import { createLedgerEntry } from "@/lib/ledger";
import { recordSessionAuditEvent } from "@/lib/audit-log";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true, data: [] });
  }
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
  } catch {
    return NextResponse.json({ success: false, fallback: true, data: [] });
  }
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true });
  }
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

    const contractNumber = `ARI-CNT-${new Date().getFullYear()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

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
      await recordSessionAuditEvent(tx, {
        action: "VEHICLE_SOLD",
        entityType: "Sale",
        entityId: sale.id,
        changes: {
          contractNumber,
          vehicleId,
          customerId: customer.id,
          salePrice: price,
          paymentType: paymentTypeValue,
        },
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
        const installmentMonths = Math.max(1, Math.min(60, Number(body.installmentsRemaining) || 6));
        const baseAmount = Math.round((outstanding / installmentMonths) * 100) / 100;
        let scheduledTotal = 0;

        for (let i = 1; i <= installmentMonths; i++) {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 30 * i);
          const isLast = i === installmentMonths;
          const currentAmount = isLast ? Math.round((outstanding - scheduledTotal) * 100) / 100 : baseAmount;
          scheduledTotal += currentAmount;

          await tx.installmentPayment.create({
            data: {
              saleId: sale.id,
              dueDate,
              amount: currentAmount,
            },
          });
        }
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

export async function PATCH(request: Request) {
  const unauthorized = await requireApiRole(["ADMIN", "SALES", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;
  if (!isDatabaseConfigured()) return NextResponse.json({ success: false, fallback: true });

  try {
    const body = await request.json();
    const saleId = body.saleId || body.id;
    if (!saleId) return NextResponse.json({ success: false, error: "Sale ID is required" }, { status: 400 });

    const updated = await prisma.$transaction(async (tx) => {
      const existingSale = await tx.sale.findUnique({
        where: { id: saleId },
        include: { installments: { orderBy: { dueDate: "asc" } }, customer: true },
      });
      if (!existingSale) {
        throw new Error("Sale record not found");
      }

      const updateData: any = {};
      if (body.salePrice !== undefined) updateData.salePrice = Number(body.salePrice);
      if (body.salePriceUSD !== undefined) updateData.salePrice = Number(body.salePriceUSD);
      if (body.notes !== undefined) updateData.notes = body.notes;
      if (body.exchangeRate !== undefined) updateData.exchangeRate = Number(body.exchangeRate);

      // Update customer details if supplied
      if (body.customerName || body.customerPhone || body.customerTazkira) {
        await tx.customer.update({
          where: { id: existingSale.customerId },
          data: {
            ...(body.customerName ? { fullName: body.customerName } : {}),
            ...(body.customerPhone ? { phone: body.customerPhone } : {}),
            ...(body.customerTazkira ? { tazkiraNumber: body.customerTazkira } : {}),
          },
        });
      }

      // If downPaymentUSD increased (e.g. installment collected), settle pending installments accordingly
      if (body.downPaymentUSD !== undefined) {
        const targetOutstanding = Math.max(
          0,
          Number(updateData.salePrice ?? existingSale.salePrice) - Number(body.downPaymentUSD)
        );
        const pendingInstallments = existingSale.installments.filter(
          (inst) => inst.status !== InstallmentStatus.PAID
        );
        const currentOutstanding = pendingInstallments.reduce(
          (sum, inst) => sum + Number(inst.amount || 0),
          0
        );
        let paymentToApply = Math.max(0, currentOutstanding - targetOutstanding);

        for (const inst of pendingInstallments) {
          if (paymentToApply <= 0) break;
          if (paymentToApply >= inst.amount - 0.01) {
            paymentToApply -= inst.amount;
            await tx.installmentPayment.update({
              where: { id: inst.id },
              data: { status: InstallmentStatus.PAID, paidAt: new Date() },
            });
          } else {
            await tx.installmentPayment.update({
              where: { id: inst.id },
              data: { amount: Math.max(0, Math.round((inst.amount - paymentToApply) * 100) / 100) },
            });
            paymentToApply = 0;
          }
        }
      }

      return tx.sale.update({
        where: { id: saleId },
        data: updateData,
      });
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to update sale" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const unauthorized = await requireApiRole(["ADMIN"]);
  if (unauthorized) return unauthorized;
  if (!isDatabaseConfigured()) return NextResponse.json({ success: false, fallback: true });

  try {
    const body = await request.json().catch(() => ({}));
    const saleId = body.saleId || body.id;
    if (!saleId) return NextResponse.json({ success: false, error: "Sale ID is required" }, { status: 400 });

    await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({ where: { id: saleId } });
      if (sale && body.revertVehicleStatus !== false) {
        await tx.vehicle.update({
          where: { id: sale.vehicleId },
          data: { status: "AVAILABLE" },
        });
      }
      await tx.installmentPayment.deleteMany({ where: { saleId } });
      await tx.sale.delete({ where: { id: saleId } });
    });

    return NextResponse.json({ success: true, message: "Sale voided/deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to delete sale" }, { status: 500 });
  }
}
