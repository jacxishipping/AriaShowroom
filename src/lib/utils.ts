import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: "USD" | "AFN" = "USD",
  exchangeRate: number = 70.5
): string {
  if (currency === "AFN") {
    const afnAmount = Math.round(amount * exchangeRate);
    return `؋ ${afnAmount.toLocaleString("en-US")}`;
  }
  return `$${amount.toLocaleString("en-US")}`;
}

export function formatMileage(km: number, unit: "km" | "mi" = "km"): string {
  return `${km.toLocaleString("en-US")} ${unit}`;
}
