import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LeadStage } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get("stage");

    const where: any = {};
    if (stage && stage !== "ALL") {
      where.leadStage = stage as LeadStage;
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        sales: {
          include: {
            vehicle: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, count: customers.length, data: customers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      phone,
      whatsapp,
      tazkiraNumber,
      city = "Herat",
      address,
      tradeInRecord,
      notes,
      leadStage = "NEW_INQUIRY",
    } = body;

    const customer = await prisma.customer.create({
      data: {
        fullName,
        phone,
        whatsapp: whatsapp || phone,
        tazkiraNumber,
        city,
        address,
        tradeInRecord,
        notes,
        leadStage: leadStage as LeadStage,
      },
    });

    return NextResponse.json({ success: true, data: customer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create customer" },
      { status: 500 }
    );
  }
}
