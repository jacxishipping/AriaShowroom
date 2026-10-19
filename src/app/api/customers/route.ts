import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { LeadStage } from "@prisma/client";
import { requireApiRole } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true, data: [] });
  }
  const unauthorized = await requireApiRole(["ADMIN", "SALES", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;

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
            vehicle: {
              select: { id: true, stockNumber: true, make: true, model: true, year: true, status: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, count: customers.length, data: customers });
  } catch {
    return NextResponse.json({ success: false, fallback: true, data: [] });
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireApiRole(["ADMIN", "SALES"]);
  if (unauthorized) return unauthorized;

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
      budget = 0,
      interestedInVehicleId,
      notes,
      leadStage = "NEW_INQUIRY",
    } = body;

    if (!fullName?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { success: false, error: "Name and phone are required" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        fullName,
        phone,
        whatsapp: whatsapp || phone,
        tazkiraNumber: tazkiraNumber?.trim() || null,
        city,
        address,
        tradeInRecord,
        budget: Number(budget) || 0,
        interestedInVehicleId: interestedInVehicleId || null,
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

export async function PATCH(request: Request) {
  const unauthorized = await requireApiRole(["ADMIN", "SALES"]);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const stageMap: Record<string, LeadStage> = {
      "New Inquiry": LeadStage.NEW_INQUIRY,
      "Follow-Up": LeadStage.FOLLOW_UP,
      "Test Drive": LeadStage.TEST_DRIVE,
      Negotiation: LeadStage.NEGOTIATION,
      "Closed/Won": LeadStage.CLOSED_WON,
      Lost: LeadStage.LOST,
    };
    const stage = stageMap[body.leadStage] || body.leadStage;

    if (!body.customerId || !Object.values(LeadStage).includes(stage)) {
      return NextResponse.json(
        { success: false, error: "Customer ID and a valid lead stage are required" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.update({
      where: { id: body.customerId },
      data: { leadStage: stage },
    });
    return NextResponse.json({ success: true, data: customer });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update customer stage" },
      { status: 500 }
    );
  }
}
