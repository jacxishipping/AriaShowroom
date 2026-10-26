import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { PaymentType, VehicleStatus, InstallmentStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireApiRole } from "@/lib/api-auth";
import {
  createLedgerEntry,
  reverseLedgerEntriesByReference,
  roundCurrency,
} from "@/lib/ledger";
import { recordSessionAuditEvent } from "@/lib/audit-log";

export const dynamic = "force-dynamic";

function resolveSalePaymentAccount(
  paymentType: PaymentType,
  paymentChannel?: string,
  notes?: string
): string {
  const channel = String(paymentChannel || "").toUpperCase();
  const notesLower = String(notes || "").toLowerCase();
  if (
    channel === "SARRAFI" ||
    notesLower.includes("sarrafi") ||
    notesLower.includes("hawala")
  ) {
    return "1020 - Sarrafi Khorasan Holding Account";
  }
  if (channel === "BANK" || paymentType === PaymentType.BANK_TRANSFER) {
    return "1030 - Azizi Bank Commercial USD Account";
  }
  return "1010 - Showroom Central Cash Safe";
}

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true, data: [] });
  }
  const unauthorized = await requireApiRole(["ADMIN", "SALES", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;

  try {
    await prisma.installmentPayment
      .updateMany({
        where: {
          status: InstallmentStatus.PENDING,
          dueDate: { lt: new Date() },
        },
        data: { status: InstallmentStatus.OVERDUE },
      })
      .catch(() => null);

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
      paymentChannel,
      notes,
    } = body;
    const price = roundCurrency(Number(salePrice));
    const rate = Number(exchangeRate) || 70.5;
    const customerName = String(body.customerName || "").trim();
    const customerPhone = String(body.customerPhone || "").trim();
    const customerTazkira = String(body.customerTazkira || "").trim();

    const session = await getServerSession(authOptions);
    const seller = session?.user?.email
      ? await prisma.user.findUnique({ where: { email: session.user.email } })
      : null;

    if (!seller) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Your staff account must exist in the database before recording sales",
        },
        { status: 400 }
      );
    }
    if (!Number.isFinite(price) || price <= 0 || !customerName || !customerPhone || !customerTazkira) {
      return NextResponse.json(
        {
          success: false,
          error: "Vehicle, buyer identity, and a positive sale price are required",
        },
        { status: 400 }
      );
    }

    const contractNumber = `ARI-CNT-${new Date().getFullYear()}-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const result = await prisma.$transaction(async (tx) => {
      const paymentTypeValue = paymentType as PaymentType;
      if (!Object.values(PaymentType).includes(paymentTypeValue)) {
        throw new Error("Invalid payment type");
      }

      const vehicle = await tx.vehicle.findUnique({ where: { id: vehicleId } });
      if (!vehicle || vehicle.status === VehicleStatus.SOLD) {
        throw new Error("Vehicle is unavailable or already sold");
      }

      // Atomic conditional claim prevents two concurrent agents from double-selling the same vehicle
      const claimed = await tx.vehicle.updateMany({
        where: { id: vehicleId, status: { not: VehicleStatus.SOLD } },
        data: { status: VehicleStatus.SOLD },
      });
      if (claimed.count !== 1) {
        throw new Error("Vehicle is unavailable or already sold");
      }
      try {
        await tx.$executeRaw`UPDATE "Vehicle" SET "statusChangedAt" = NOW() WHERE id = ${vehicleId}`;
      } catch {
        // Ignore if statusChangedAt column is absent
      }

      const customer = await tx.customer.upsert({
        where: { tazkiraNumber: customerTazkira },
        create: {
          fullName: customerName,
          phone: customerPhone,
          whatsapp: customerPhone,
          tazkiraNumber: customerTazkira,
        },
        update: {
          fullName: customerName,
          phone: customerPhone,
        },
      });

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
          entryNumber: `JE-COGS-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          description: `Cost of vehicle sold ${vehicle.stockNumber}`,
          reference: contractNumber,
          debitAccount: "5010 - COGS - Vehicle Purchase Cost",
          creditAccount: "1040 - Vehicle Inventory Asset (Lot & Port)",
          amountUSD: roundCurrency(Number(vehicle.landedCost)),
          amountAFN: Math.round(Number(vehicle.landedCost) * rate),
        });
      }

      const downPayment = roundCurrency(
        Math.min(Math.max(Number(body.downPaymentUSD) || 0, 0), price)
      );
      const paymentAccount = resolveSalePaymentAccount(
        paymentTypeValue,
        paymentChannel,
        notes
      );
      const journalEntries = [];

      if (downPayment > 0 || paymentTypeValue !== PaymentType.INSTALLMENT) {
        const paidAmount =
          paymentTypeValue === PaymentType.INSTALLMENT ? downPayment : price;
        if (paidAmount > 0) {
          journalEntries.push(
            await createLedgerEntry(tx, {
              entryNumber: `JE-SALE-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
              description: `Vehicle sale ${contractNumber}`,
              reference: contractNumber,
              debitAccount: paymentAccount,
              creditAccount: "4010 - Vehicle Sales Revenue",
              amountUSD: paidAmount,
              amountAFN: Math.round(paidAmount * rate),
            })
          );
        }
      }

      const outstanding = roundCurrency(Math.max(price - downPayment, 0));
      if (paymentTypeValue === PaymentType.INSTALLMENT && outstanding > 0) {
        const installmentMonths = Math.max(
          1,
          Math.min(60, Number(body.installmentsRemaining) || 6)
        );
        const baseAmount = roundCurrency(outstanding / installmentMonths);
        let scheduledTotal = 0;

        for (let i = 1; i <= installmentMonths; i++) {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 30 * i);
          const isLast = i === installmentMonths;
          const currentAmount = isLast
            ? roundCurrency(outstanding - scheduledTotal)
            : baseAmount;
          scheduledTotal = roundCurrency(scheduledTotal + currentAmount);

          await tx.installmentPayment.create({
            data: {
              saleId: sale.id,
              dueDate,
              amount: currentAmount,
            },
          });
        }
        journalEntries.push(
          await createLedgerEntry(tx, {
            entryNumber: `JE-AR-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
            description: `Installment receivable for ${contractNumber}`,
            reference: contractNumber,
            debitAccount: "1050 - Accounts Receivable (Customer Installments)",
            creditAccount: "4010 - Vehicle Sales Revenue",
            amountUSD: outstanding,
            amountAFN: Math.round(outstanding * rate),
          })
        );
      }

      return { ...sale, customer, journalEntries };
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    const status =
      error?.message === "Vehicle is unavailable or already sold" ? 409 : 500;
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record sale" },
      { status }
    );
  }
}

export async function PATCH(request: Request) {
  const unauthorized = await requireApiRole(["ADMIN", "SALES", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true });
  }

  try {
    const body = await request.json();
    const saleId = body.saleId || body.id;
    if (!saleId) {
      return NextResponse.json(
        { success: false, error: "Sale ID is required" },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const existingSale = await tx.sale.findUnique({
        where: { id: saleId },
        include: {
          installments: { orderBy: { dueDate: "asc" } },
          customer: true,
        },
      });
      if (!existingSale) {
        throw new Error("Sale record not found");
      }

      const updateData: Record<string, unknown> = {};
      if (body.salePrice !== undefined) {
        updateData.salePrice = roundCurrency(Number(body.salePrice));
      }
      if (body.salePriceUSD !== undefined) {
        updateData.salePrice = roundCurrency(Number(body.salePriceUSD));
      }
      if (body.notes !== undefined) updateData.notes = body.notes;
      if (body.exchangeRate !== undefined) {
        updateData.exchangeRate = Number(body.exchangeRate);
      }

      // Guard customer Tazkira uniqueness before updating customer
      if (body.customerName || body.customerPhone || body.customerTazkira) {
        const nextTazkira =
          body.customerTazkira !== undefined
            ? String(body.customerTazkira).trim() || null
            : undefined;

        if (nextTazkira && nextTazkira !== existingSale.customer.tazkiraNumber) {
          const conflicting = await tx.customer.findUnique({
            where: { tazkiraNumber: nextTazkira },
          });
          if (conflicting && conflicting.id !== existingSale.customerId) {
            throw new Error("Another customer already holds this Tazkira number");
          }
        }

        await tx.customer.update({
          where: { id: existingSale.customerId },
          data: {
            ...(body.customerName ? { fullName: String(body.customerName).trim() } : {}),
            ...(body.customerPhone ? { phone: String(body.customerPhone).trim() } : {}),
            ...(nextTazkira !== undefined ? { tazkiraNumber: nextTazkira } : {}),
          },
        });
      }

      // Settle pending installments & record AR reduction if downPaymentUSD increased
      if (body.downPaymentUSD !== undefined) {
        const effectiveSalePrice = Number(
          updateData.salePrice ?? existingSale.salePrice
        );
        const targetOutstanding = roundCurrency(
          Math.max(0, effectiveSalePrice - Number(body.downPaymentUSD))
        );
        const pendingInstallments = existingSale.installments.filter(
          (inst) => inst.status !== InstallmentStatus.PAID
        );
        const currentOutstanding = roundCurrency(
          pendingInstallments.reduce((sum, inst) => sum + Number(inst.amount || 0), 0)
        );
        let paymentToApply = roundCurrency(
          Math.max(0, currentOutstanding - targetOutstanding)
        );
        const settledAmount = paymentToApply;

        for (const inst of pendingInstallments) {
          if (paymentToApply <= 0) break;
          if (paymentToApply >= inst.amount - 0.01) {
            paymentToApply = roundCurrency(paymentToApply - inst.amount);
            await tx.installmentPayment.update({
              where: { id: inst.id },
              data: { status: InstallmentStatus.PAID, paidAt: new Date() },
            });
          } else {
            await tx.installmentPayment.update({
              where: { id: inst.id },
              data: {
                amount: Math.max(0, roundCurrency(inst.amount - paymentToApply)),
              },
            });
            paymentToApply = 0;
          }
        }

        if (settledAmount > 0) {
          const rate = Number(updateData.exchangeRate ?? existingSale.exchangeRate) || 70.5;
          await createLedgerEntry(tx, {
            entryNumber: `JE-INST-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
            description: `Installment settlement on ${existingSale.contractNumber}`,
            reference: existingSale.contractNumber,
            debitAccount: "1010 - Showroom Central Cash Safe",
            creditAccount: "1050 - Accounts Receivable (Customer Installments)",
            amountUSD: settledAmount,
            amountAFN: Math.round(settledAmount * rate),
          });
        }
      }

      const nextSale = await tx.sale.update({
        where: { id: saleId },
        data: updateData,
      });

      await recordSessionAuditEvent(tx, {
        action: "SALE_UPDATED",
        entityType: "Sale",
        entityId: nextSale.id,
        changes: {
          contractNumber: existingSale.contractNumber,
          fromSalePrice: existingSale.salePrice,
          toSalePrice: nextSale.salePrice,
        },
      });

      return nextSale;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    const status =
      error?.message === "Sale record not found"
        ? 404
        : error?.message === "Another customer already holds this Tazkira number"
        ? 409
        : 500;
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update sale" },
      { status }
    );
  }
}

export async function DELETE(request: Request) {
  const unauthorized = await requireApiRole(["ADMIN"]);
  if (unauthorized) return unauthorized;
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const saleId = body.saleId || body.id;
    if (!saleId) {
      return NextResponse.json(
        { success: false, error: "Sale ID is required" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({ where: { id: saleId } });
      if (!sale) {
        throw new Error("Sale record not found");
      }

      if (body.revertVehicleStatus !== false) {
        await tx.vehicle.update({
          where: { id: sale.vehicleId },
          data: { status: VehicleStatus.AVAILABLE },
        });
      }

      await reverseLedgerEntriesByReference(
        tx,
        sale.contractNumber,
        "Sale contract voided"
      );

      await tx.installmentPayment.deleteMany({ where: { saleId } });
      await tx.sale.delete({ where: { id: saleId } });

      await recordSessionAuditEvent(tx, {
        action: "SALE_VOIDED",
        entityType: "Sale",
        entityId: saleId,
        changes: {
          contractNumber: sale.contractNumber,
          vehicleId: sale.vehicleId,
          salePrice: sale.salePrice,
          revertedVehicleStatus: body.revertVehicleStatus !== false,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Sale voided and ledger entries reversed successfully",
    });
  } catch (error: any) {
    const status = error?.message === "Sale record not found" ? 404 : 500;
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete sale" },
      { status }
    );
  }
}
