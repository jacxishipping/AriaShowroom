import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const vouchers = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: vouchers });
  } catch (error: any) {
    console.error("Failed to fetch vouchers from database:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch vouchers" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const created = await prisma.payment.create({
      data: {
        voucherNumber: body.voucherNumber || `PV-HRT-${Date.now().toString().slice(-6)}`,
        voucherType: body.voucherType || "CUSTOMER_PAYMENT",
        partyName: body.partyName,
        partyPhone: body.partyPhone || null,
        partyTazkira: body.partyTazkira || null,
        amountUSD: Number(body.amountUSD) || 0,
        amountAFN: Number(body.amountAFN) || 0,
        exchangeRate: Number(body.exchangeRate) || 70.5,
        paymentMethod: body.paymentMethod || "Cash",
        sarrafiAccount: body.sarrafiAccount || null,
        referenceNumber: body.referenceNumber || null,
        vehicleStock: body.vehicleStock || null,
        supplierId: body.supplierId || null,
        purpose: body.purpose || "Payment settlement",
        recordedBy: body.recordedBy || "Accountant",
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    console.error("Failed to create payment voucher in database:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create payment voucher" },
      { status: 500 }
    );
  }
}
