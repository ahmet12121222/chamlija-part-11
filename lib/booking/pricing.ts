import type { VisitorCounts } from "./types";

export const PRICING = {
  adult: 50,
  child3Plus: 25,
  under3: 0,
} as const;

export function calculateTotalVisitors(visitors: VisitorCounts): number {
  return visitors.adults + visitors.children3Plus + visitors.under3;
}

export function calculateEntranceTotal(visitors: VisitorCounts): number {
  return visitors.adults * PRICING.adult + visitors.children3Plus * PRICING.child3Plus;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(amount);
}
