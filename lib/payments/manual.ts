/**
 * Manual Payment System - Bank Transfer / EFT and Cash at Gate
 * This module provides utilities for manual payment processing
 */

import { calculateBookingPriceBreakdown, parseSelectedEquipmentQuantities } from "@/lib/booking/pricing";
import type { ProductRecord } from "@/lib/products/types";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled" | "refund_pending" | "refunded" | "partially_refunded" | "refund_failed";

export type PaymentMethod = "bank_transfer" | "cash_at_gate";

export type BookingPaymentSummary = {
  id: string;
  total_price: number | null;
  payment_status: string | null;
  booking_status: string | null;
  customer_name: string | null;
  email: string | null;
  phone_number: string | null;
  booking_date: string | null;
  booking_time: string | null;
  reservation_code: string | null;
  selected_area_id: string | null;
  selected_equipment_ids: string[] | null;
  selected_paid_activity_id: string | null;
  selected_tent_area_id: string | null;
  selected_photo_shoot_id: string | null;
  adults: number | null;
  children_3_plus: number | null;
  children_under_3: number | null;
};

/**
 * Get bank transfer details for payment display
 * **IMPORTANT:** Replace these placeholder values with your actual bank details
 */
export function getBankTransferDetails() {
  return {
    bankName: process.env.BANK_NAME || "YOUR_BANK_NAME_HERE", // e.g., "ABSA", "FNB", "Capitec"
    accountName: process.env.BANK_ACCOUNT_NAME || "CHAMLIJA PICNIC AREA", // e.g., "Chamlija (Pty) Ltd"
    accountNumber: process.env.BANK_ACCOUNT_NUMBER || "1234567890", // Replace with actual account number
    branchCode: process.env.BANK_BRANCH_CODE || "123456", // Replace with actual branch code
    swiftCode: process.env.BANK_SWIFT_CODE || "", // Optional: SWIFT code for international transfers
    iban: process.env.BANK_IBAN || "", // Optional: IBAN for international transfers
  };
}

export async function getBookingPaymentSummary(bookingId: string): Promise<BookingPaymentSummary | null> {
  const supabaseAdmin = getSupabaseAdminClient();

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select(
      "id, total_price, booking_status, payment_status, customer_name, email, phone_number, booking_date, booking_time, reservation_code, selected_area_id, selected_equipment_ids, selected_paid_activity_id, selected_tent_area_id, selected_photo_shoot_id, adults, children_3_plus, children_under_3",
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const selectedAreaId = typeof data.selected_area_id === "string" ? data.selected_area_id : null;
  const selectedEquipmentIds = Array.isArray(data.selected_equipment_ids) ? data.selected_equipment_ids.filter((value): value is string => typeof value === "string") : [];
  const selectedPaidActivityId = typeof data.selected_paid_activity_id === "string" ? data.selected_paid_activity_id : null;
  const selectedTentAreaId = typeof data.selected_tent_area_id === "string" ? data.selected_tent_area_id : null;
  const selectedPhotoShootId = typeof data.selected_photo_shoot_id === "string" ? data.selected_photo_shoot_id : null;

  let selectedArea = null;
  if (selectedAreaId) {
    const { data: areaData } = await supabaseAdmin.from("products").select("*").eq("id", selectedAreaId).maybeSingle();
    if (areaData) {
      selectedArea = areaData;
    }
  }

  const productIds = [...new Set(
    [
      ...Object.keys(parseSelectedEquipmentQuantities(selectedEquipmentIds)),
      selectedPaidActivityId,
      selectedTentAreaId,
      selectedPhotoShootId,
    ].filter((value): value is string => Boolean(value)),
  )];

  let products: ProductRecord[] = [];

  if (productIds.length > 0) {
    const { data: productRows } = await supabaseAdmin
      .from("products")
      .select("id, name, price, category, currency, is_active, is_bookable, is_free, description, capacity, size, entry_fee_excluded, image_url, item_order")
      .in("id", productIds)
      .eq("is_active", true)
      .eq("is_bookable", true);

    if (productRows) {
      products = (productRows as unknown as ProductRecord[]);
    }
  }

  const adults = Number(data.adults ?? 0);
  const children3Plus = Number(data.children_3_plus ?? 0);
  const childrenUnder3 = Number(data.children_under_3 ?? 0);
  const breakdown = calculateBookingPriceBreakdown({
    adults,
    children3Plus,
    childrenUnder3,
    selectedArea,
    equipmentQuantities: parseSelectedEquipmentQuantities(selectedEquipmentIds),
    products,
    selectedPaidActivityId,
    selectedTentAreaId,
    selectedPhotoShootId,
  });

  const canonicalTotal = breakdown.total;
  const storedTotal = Number(data.total_price ?? 0);

  if (storedTotal !== canonicalTotal) {
    await supabaseAdmin.from("bookings").update({ total_price: canonicalTotal }).eq("id", bookingId);
  }

  return {
    ...data,
    selected_equipment_ids: selectedEquipmentIds,
    selected_paid_activity_id: selectedPaidActivityId,
    selected_tent_area_id: selectedTentAreaId,
    selected_photo_shoot_id: selectedPhotoShootId,
    adults,
    children_3_plus: children3Plus,
    children_under_3: childrenUnder3,
    total_price: canonicalTotal,
    reservation_code: data.reservation_code,
  } as BookingPaymentSummary;
}

export function formatCurrency(value: number | null | undefined): string {
  const numeric = Number(value ?? 0);
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(numeric);
}
