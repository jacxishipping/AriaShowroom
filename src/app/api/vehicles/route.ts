import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VehicleStatus, FuelType, TransmissionType, SteeringSide } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const make = searchParams.get("make");

    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status as VehicleStatus;
    }
    if (make && make !== "ALL") {
      where.make = { equals: make, mode: "insensitive" };
    }
    if (search) {
      where.OR = [
        { make: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { stockNumber: { contains: search, mode: "insensitive" } },
        { vin: { contains: search, mode: "insensitive" } },
      ];
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        documents: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (error: any) {
    console.error("Error fetching vehicles from Prisma:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      stockNumber,
      vin,
      make,
      model,
      year,
      trim,
      bodyType = "SUV",
      originCountry = "UAE",
      steering = "LEFT_HAND",
      customsClearance = "Gomrok Herat (Islam Qala)",
      cleanTitle = true,
      mileage,
      fuelType = "PETROL",
      transmission = "AUTOMATIC",
      driveType = "4WD",
      color,
      status = "AVAILABLE",
      purchasePrice,
      freightCost = 0,
      customsDuty = 0,
      repairCost = 0,
      minTargetPrice = 0,
      sellingPrice,
      currency = "USD",
      features = [],
      description = "",
      descriptionDari = "",
      descriptionPashto = "",
      images = [],
    } = body;

    const landedCost =
      Number(purchasePrice || 0) +
      Number(freightCost || 0) +
      Number(customsDuty || 0) +
      Number(repairCost || 0);

    const vehicle = await prisma.vehicle.create({
      data: {
        stockNumber,
        vin,
        make,
        model,
        year: Number(year),
        trim: trim || "",
        bodyType,
        originCountry,
        steering: steering as SteeringSide,
        customsClearance,
        cleanTitle: Boolean(cleanTitle),
        mileage: Number(mileage),
        fuelType: fuelType as FuelType,
        transmission: transmission as TransmissionType,
        driveType,
        color,
        status: status as VehicleStatus,
        purchasePrice: Number(purchasePrice),
        freightCost: Number(freightCost),
        customsDuty: Number(customsDuty),
        repairCost: Number(repairCost),
        landedCost,
        minTargetPrice: Number(minTargetPrice || landedCost * 1.05),
        sellingPrice: Number(sellingPrice),
        currency,
        features: Array.isArray(features) ? features : [],
        description,
        descriptionDari,
        images: {
          create: images.map((img: { url: string; isPrimary?: boolean }, idx: number) => ({
            url: typeof img === "string" ? img : img.url,
            isPrimary: idx === 0,
            order: idx,
          })),
        },
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json({ success: true, data: vehicle }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating vehicle in Prisma:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create vehicle" },
      { status: 500 }
    );
  }
}
