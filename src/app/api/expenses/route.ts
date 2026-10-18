import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: "desc" },
    });
    return NextResponse.json({ success: true, data: expenses });
  } catch (error: any) {
    console.error("Failed to fetch expenses from database:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const created = await prisma.expense.create({
      data: {
        category: body.category || "Operational",
        amount: Number(body.amount) || 0,
        currency: body.currency || "USD",
        description: body.description,
        payee: body.payee || null,
        receiptNum: body.receiptNum || null,
        vehicleId: body.vehicleId || null,
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    console.error("Failed to create expense in database:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create expense" },
      { status: 500 }
    );
  }
}
