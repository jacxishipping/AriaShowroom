/**
 * Free NHTSA VIN Decoder Utility
 * Decodes 17-character vehicle identification numbers via the public NHTSA VPIC API
 */

export interface DecodedVehicleInfo {
  make: string;
  model: string;
  year: number;
  trim: string;
  bodyType: string;
  fuelType: "Petrol" | "Diesel" | "Hybrid" | "Electric";
  transmission: "Automatic" | "Manual";
  driveType: string;
  originCountry: string;
  engineCylinders?: string;
  displacementL?: string;
  rawDetails: Record<string, string>;
}

export async function decodeVin(vin: string): Promise<DecodedVehicleInfo | null> {
  const cleanVin = vin.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (cleanVin.length !== 17) {
    throw new Error("VIN must be exactly 17 characters long");
  }

  try {
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${encodeURIComponent(cleanVin)}?format=json`
    );

    if (!res.ok) {
      throw new Error(`NHTSA API responded with status ${res.status}`);
    }

    const data = await res.json();
    const result = data?.Results?.[0];

    if (!result || result.ErrorCode !== "0" && !result.Make) {
      throw new Error(result?.ErrorText || "Unable to decode vehicle from VIN");
    }

    // Map fuel type
    let mappedFuel: "Petrol" | "Diesel" | "Hybrid" | "Electric" = "Petrol";
    const rawFuel = (result.FuelTypePrimary || "").toLowerCase();
    if (rawFuel.includes("hybrid") || rawFuel.includes("plug-in")) {
      mappedFuel = "Hybrid";
    } else if (rawFuel.includes("diesel")) {
      mappedFuel = "Diesel";
    } else if (rawFuel.includes("electric")) {
      mappedFuel = "Electric";
    }

    // Map transmission
    let mappedTrans: "Automatic" | "Manual" = "Automatic";
    const rawTrans = (result.TransmissionStyle || "").toLowerCase();
    if (rawTrans.includes("manual")) {
      mappedTrans = "Manual";
    }

    // Map body type
    let body = result.BodyClass || "SUV";
    if (body.includes("Sport Utility") || body.includes("SUV")) {
      body = "SUV";
    } else if (body.includes("Sedan")) {
      body = "Sedan";
    } else if (body.includes("Pickup") || body.includes("Truck")) {
      body = "Pickup Truck";
    }

    // Map country
    const origin = result.PlantCountry || (result.Country || "USA");

    return {
      make: result.Make || "Toyota",
      model: result.Model || "Land Cruiser",
      year: parseInt(result.ModelYear) || new Date().getFullYear(),
      trim: result.Trim || result.Series || "",
      bodyType: body,
      fuelType: mappedFuel,
      transmission: mappedTrans,
      driveType: result.DriveType || "4WD",
      originCountry: origin,
      engineCylinders: result.EngineCylinders || "",
      displacementL: result.DisplacementL || "",
      rawDetails: result,
    };
  } catch (error: any) {
    console.error("VIN decoding failed:", error);
    throw error;
  }
}
