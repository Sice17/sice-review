import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SWEDISH_PHONE_REGEX = /^(\+46|0)7[\d\s-]{7,12}$/;

export function isValidSwedishPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s-]/g, "");
  return SWEDISH_PHONE_REGEX.test(cleaned);
}

export function normalizeSwedishPhone(phone: string): string {
  const cleaned = phone.replace(/[\s-]/g, "");
  if (cleaned.startsWith("+46")) {
    return cleaned;
  }
  if (cleaned.startsWith("0")) {
    return `+46${cleaned.slice(1)}`;
  }
  return cleaned;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
