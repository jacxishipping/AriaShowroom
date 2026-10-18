import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: invoices });
  } catch (error: any) {
    console.error("Failed to fetch invoices from database:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const created = await prisma.invoice.create({
      data: {
        invoiceNumber: body.invoiceNumber || `INV-HRT-${Date.now().toString().slice(-6)}`,
        customerId: body.customerId || null,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        customerTazkira: body.customerTazkira || null,
        customerAddress: body.customerAddress || null,
        vehicleStock: body.vehicleStock || null,
        vehicleDesc: body.vehicleDesc || null,
        vin: body.vin || null,
        items: body.items || [],
        subtotalUSD: Number(body.subtotalUSD) || 0,
        customsFeeUSD: Number(body.customsFeeUSD) || 0,
        registrationFeeUSD: Number(body.registrationFeeUSD) || 0,
        discountUSD: Number(body.discountUSD) || 0,
        totalUSD: Number(body.totalUSD) || 0,
        totalAFN: Number(body.totalAFN) || 0,
        exchangeRate: Number(body.exchangeRate) || 70.5,
        status: body.status || "Paid",
        paymentMethod: body.paymentMethod || "Cash",
        notes: body.notes || null,
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    console.error("Failed to create invoice in database:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create invoice" },
      { status: 500 }
    );
  }
}
