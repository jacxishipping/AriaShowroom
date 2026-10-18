import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        bills: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: suppliers });
  } catch (error: any) {
    console.error("Failed to fetch suppliers from database:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch suppliers" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const created = await prisma.supplier.create({
      data: {
        companyName: body.companyName,
        contactName: body.contactName,
        country: body.country || "UAE",
        city: body.city || "Dubai",
        phone: body.phone,
        whatsapp: body.whatsapp || null,
        email: body.email || null,
        bankOrSarrafiAccount: body.bankOrSarrafiAccount || null,
        totalPurchasedUSD: Number(body.totalPurchasedUSD) || 0,
        totalPaidUSD: Number(body.totalPaidUSD) || 0,
        balanceUSD: Number(body.balanceUSD) || 0,
        notes: body.notes || null,
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    console.error("Failed to create supplier in database:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create supplier" },
      { status: 500 }
    );
  }
}
