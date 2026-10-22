import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { LeadStage } from "@prisma/client";
import { requireApiRole } from "@/lib/api-auth";
import { recordSessionAuditEvent } from "@/lib/audit-log";

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

    const customer = await prisma.$transaction(async (tx) => {
      const created = await tx.customer.create({
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
      await recordSessionAuditEvent(tx, {
        action: "CUSTOMER_CREATED",
        entityType: "Customer",
        entityId: created.id,
        changes: { leadStage: created.leadStage },
      });
      return created;
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
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true });
  }

  try {
    const body = await request.json();
    const customerId = body.customerId || body.id;
    if (!customerId) {
      return NextResponse.json({ success: false, error: "Customer ID is required" }, { status: 400 });
    }

    const stageMap: Record<string, LeadStage> = {
      "New Inquiry": LeadStage.NEW_INQUIRY,
      "Follow-Up": LeadStage.FOLLOW_UP,
      "Test Drive": LeadStage.TEST_DRIVE,
      Negotiation: LeadStage.NEGOTIATION,
      "Closed/Won": LeadStage.CLOSED_WON,
      Lost: LeadStage.LOST,
    };

    const updateData: any = {};
    if (body.fullName !== undefined) updateData.fullName = body.fullName;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.whatsapp !== undefined) updateData.whatsapp = body.whatsapp;
    if (body.tazkiraNumber !== undefined) updateData.tazkiraNumber = body.tazkiraNumber?.trim() || null;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.budget !== undefined) updateData.budget = Number(body.budget) || 0;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.interestedInVehicleId !== undefined) updateData.interestedInVehicleId = body.interestedInVehicleId || null;
    if (body.leadStage !== undefined) {
      updateData.leadStage = stageMap[body.leadStage] || body.leadStage;
    }

    const updated = await prisma.customer.update({
      where: { id: customerId },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const unauthorized = await requireApiRole(["ADMIN"]);
  if (unauthorized) return unauthorized;
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true });
  }

  try {
    const { searchParams } = new URL(request.url);
    const body = await request.json().catch(() => ({}));
    const customerId = body.customerId || body.id || searchParams.get("id");
    if (!customerId) {
      return NextResponse.json({ success: false, error: "Customer ID is required" }, { status: 400 });
    }

    await prisma.customer.delete({ where: { id: customerId } });
    return NextResponse.json({ success: true, message: "Customer deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to delete customer" }, { status: 500 });
  }
}