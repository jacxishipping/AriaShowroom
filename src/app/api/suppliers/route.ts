import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { requireApiRole } from "@/lib/api-auth";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true, data: [] });
  }
  const unauthorized = await requireApiRole(["ADMIN", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;

  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        bills: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: suppliers });
  } catch {
    return NextResponse.json({ success: false, fallback: true, data: [] });
  }
}

export async function POST(req: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, fallback: true });
  }
  const unauthorized = await requireApiRole(["ADMIN", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;

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

export async function PATCH(req: Request) {
  const unauthorized = await requireApiRole(["ADMIN", "ACCOUNTANT"]);
  if (unauthorized) return unauthorized;
  if (!isDatabaseConfigured()) return NextResponse.json({ success: false, fallback: true });

  try {
    const body = await req.json();
    const supplierId = body.supplierId || body.id;
    if (!supplierId) return NextResponse.json({ success: false, error: "Supplier ID is required" }, { status: 400 });

    const updateData: any = {};
    if (body.companyName !== undefined) updateData.companyName = body.companyName;
    if (body.contactName !== undefined) updateData.contactName = body.contactName;
    if (body.country !== undefined) updateData.country = body.country;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.whatsapp !== undefined) updateData.whatsapp = body.whatsapp;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.bankOrSarrafiAccount !== undefined) updateData.bankOrSarrafiAccount = body.bankOrSarrafiAccount;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const updated = await prisma.supplier.update({
      where: { id: supplierId },
      data: updateData,
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to update supplier" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const unauthorized = await requireApiRole(["ADMIN"]);
  if (unauthorized) return unauthorized;
  if (!isDatabaseConfigured()) return NextResponse.json({ success: false, fallback: true });

  try {
    const body = await req.json().catch(() => ({}));
    const supplierId = body.supplierId || body.id;
    if (!supplierId) return NextResponse.json({ success: false, error: "Supplier ID is required" }, { status: 400 });

    await prisma.supplier.delete({ where: { id: supplierId } });
    return NextResponse.json({ success: true, message: "Supplier deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to delete supplier" }, { status: 500 });
  }
}
