import type { ProductRecord } from "@/lib/products/types";
import type { VisitorCounts } from "./types";

export const PRICING = {
  adult: 50,
  child3Plus: 25,
  under3: 0,
} as const;

export type BookingPriceLineItem = {
  label: string;
  quantity: number;
  unitPrice: number;
  total: number;
  kind: "area" | "equipment" | "single-item";
};

export type BookingPriceBreakdown = {
  adultTotal: number;
  child3PlusTotal: number;
  under3Total: number;
  entranceFeeTotal: number;
  areaTotal: number;
  equipmentTotal: number;
  singleItemTotal: number;
  additionalTotal: number;
  total: number;
  lineItems: BookingPriceLineItem[];
};

export function parseSelectedEquipmentQuantities(selectedEquipmentIds: unknown): Record<string, number> {
  const quantities: Record<string, number> = {};

  if (!Array.isArray(selectedEquipmentIds)) {
    return quantities;
  }

  for (const entry of selectedEquipmentIds) {
    if (typeof entry !== "string" || !entry.trim()) {
      continue;
    }

    const separatorIndex = entry.indexOf(":");
    const productId = separatorIndex >= 0 ? entry.slice(0, separatorIndex).trim() : entry.trim();
    const rawQty = separatorIndex >= 0 ? entry.slice(separatorIndex + 1).trim() : "1";

    if (!productId) {
      continue;
    }

    const parsedQty = Number(rawQty || "1");
    const nextQty = Number.isFinite(parsedQty) && parsedQty > 0 ? Math.trunc(parsedQty) : 0;

    if (nextQty <= 0) {
      continue;
    }

    quantities[productId] = (quantities[productId] ?? 0) + nextQty;
  }

  return quantities;
}

export function calculateTotalVisitors(visitors: VisitorCounts): number {
  return visitors.adults + visitors.children3Plus + visitors.under3;
}

export function calculateEntranceTotal(visitors: VisitorCounts): number {
  return visitors.adults * PRICING.adult + visitors.children3Plus * PRICING.child3Plus;
}

export function calculateBookingPriceBreakdown({
  adults,
  children3Plus,
  childrenUnder3 = 0,
  selectedArea,
  equipmentQuantities,
  products,
  selectedPaidActivityId,
  selectedTentAreaId,
  selectedPhotoShootId,
}: {
  adults: number;
  children3Plus: number;
  childrenUnder3?: number;
  selectedArea: { id: string; name: string; price?: number | null } | null;
  equipmentQuantities: Record<string, number>;
  products: ProductRecord[];
  selectedPaidActivityId?: string | null;
  selectedTentAreaId?: string | null;
  selectedPhotoShootId?: string | null;
}): BookingPriceBreakdown {
  const adultTotal = adults * PRICING.adult;
  const child3PlusTotal = children3Plus * PRICING.child3Plus;
  const under3Total = childrenUnder3 * PRICING.under3;
  const entranceFeeTotal = adultTotal + child3PlusTotal + under3Total;

  const lineItems: BookingPriceLineItem[] = [];
  let areaTotal = 0;
  let equipmentTotal = 0;
  let singleItemTotal = 0;

  if (selectedArea) {
    const unitPrice = Math.max(0, Number(selectedArea.price ?? 0));
    areaTotal = unitPrice;
    lineItems.push({
      label: selectedArea.name,
      quantity: 1,
      unitPrice,
      total: unitPrice,
      kind: "area",
    });
  }

  Object.entries(equipmentQuantities || {}).forEach(([equipmentId, qty]) => {
    const parsedQty = Number(qty) || 0;
    if (parsedQty <= 0) {
      return;
    }

    const product = products.find((entry) => entry.id === equipmentId);
    if (!product) {
      return;
    }

    const unitPrice = Math.max(0, Number(product.price ?? 0));
    const total = unitPrice * parsedQty;
    equipmentTotal += total;
    lineItems.push({
      label: product.name,
      quantity: parsedQty,
      unitPrice,
      total,
      kind: "equipment",
    });
  });

  const singleItemIds = [selectedPaidActivityId, selectedTentAreaId, selectedPhotoShootId].filter(
    (value): value is string => Boolean(value && value.trim().length > 0),
  );

  singleItemIds.forEach((productId) => {
    const product = products.find((entry) => entry.id === productId);
    if (!product) {
      return;
    }

    const unitPrice = Math.max(0, Number(product.price ?? 0));
    singleItemTotal += unitPrice;
    lineItems.push({
      label: product.name,
      quantity: 1,
      unitPrice,
      total: unitPrice,
      kind: "single-item",
    });
  });

  const additionalTotal = areaTotal + equipmentTotal + singleItemTotal;
  const total = entranceFeeTotal + additionalTotal;

  return {
    adultTotal,
    child3PlusTotal,
    under3Total,
    entranceFeeTotal,
    areaTotal,
    equipmentTotal,
    singleItemTotal,
    additionalTotal,
    total,
    lineItems,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(amount);
}
