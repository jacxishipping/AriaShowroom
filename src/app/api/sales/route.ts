import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentType, VehicleStatus } from "@prisma/client";

export async function GET() {
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
  try {
    const body = await request.json();
    const {
      vehicleId,
      customerId,
      sellerId,
      salePrice,
      currency = "USD",
      exchangeRate = 70.5,
      paymentType = "CASH",
      notes,
    } = body;

    const contractNumber = `SM-CNT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create the sale and update vehicle status in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          vehicleId,
          customerId,
          sellerId,
          salePrice: Number(salePrice),
          currency,
          exchangeRate: Number(exchangeRate),
          paymentType: paymentType as PaymentType,
          contractNumber,
          notes,
        },
        include: {
          vehicle: true,
          customer: true,
        },
      });

      // Update vehicle status to SOLD
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { status: VehicleStatus.SOLD },
      });

      return sale;
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record sale" },
      { status: 500 }
    );
  }
}
