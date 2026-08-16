import { createHmac, timingSafeEqual } from "crypto";
import { calculateBookingPriceBreakdown, parseSelectedEquipmentQuantities } from "@/lib/booking/pricing";
import type { ProductRecord } from "@/lib/products/types";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "refund_pending"
  | "refunded"
  | "partially_refunded"
  | "refund_failed";

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
  selected_area_id: string | null;
  selected_equipment_ids: string[] | null;
  selected_paid_activity_id: string | null;
  selected_tent_area_id: string | null;
  selected_photo_shoot_id: string | null;
  adults: number | null;
  children_3_plus: number | null;
  children_under_3: number | null;
};

export type IkhokhaCheckoutResponse = {
  paymentId?: string | null;
  externalTransactionId?: string | null;
  checkoutUrl?: string | null;
  redirectUrl?: string | null;
  providerConfigured: boolean;
  providerMessage?: string;
};

export function getIkhokhaConfig() {
  const baseUrl = process.env.IKHOKHA_API_BASE_URL?.trim() || "https://api.ikhokha.com";
  const applicationId = process.env.IKHOKHA_APPLICATION_ID?.trim() || process.env.IKHOKHA_APPLICATION_KEY_ID?.trim() || process.env.IKHOKHA_API_KEY?.trim();
  const applicationSecret = process.env.IKHOKHA_APPLICATION_SECRET?.trim() || process.env.IKHOKHA_APPLICATION_KEY_SECRET?.trim() || process.env.IKHOKHA_API_SECRET?.trim();
  const webhookSecret = process.env.IKHOKHA_WEBHOOK_SECRET?.trim() || applicationSecret;
  const externalEntityId = process.env.IKHOKHA_EXTERNAL_ENTITY_ID?.trim() || process.env.IKHOKHA_ENTITY_ID?.trim();
  const returnUrl = process.env.IKHOKHA_RETURN_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";

  return {
    baseUrl,
    applicationId,
    applicationSecret,
    webhookSecret,
    externalEntityId,
    returnUrl,
  };
}

export function isIkhokhaConfigured(): boolean {
  const { applicationId, externalEntityId, baseUrl } = getIkhokhaConfig();
  return Boolean(applicationId && externalEntityId && baseUrl);
}

export async function getBookingPaymentSummary(bookingId: string): Promise<BookingPaymentSummary | null> {
  const supabaseAdmin = getSupabaseAdminClient();

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select(
      "id, total_price, booking_status, payment_status, customer_name, email, phone_number, booking_date, booking_time, selected_area_id, selected_equipment_ids, selected_paid_activity_id, selected_tent_area_id, selected_photo_shoot_id, adults, children_3_plus, children_under_3",
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
    const { data: areaData, error: areaError } = await supabaseAdmin.from("products").select("*").eq("id", selectedAreaId).maybeSingle();
    if (!areaError && areaData) {
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
    const { data: productRows, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, name, price, category, currency, is_active, is_bookable, is_free, description, capacity, size, entry_fee_excluded, image_url, item_order")
      .in("id", productIds)
      .eq("is_active", true)
      .eq("is_bookable", true);

    if (!productsError) {
      products = (productRows ?? []) as ProductRecord[];
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
    await supabaseAdmin
      .from("bookings")
      .update({ total_price: canonicalTotal })
      .eq("id", bookingId);
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
  } as BookingPaymentSummary;
}

export function toCents(value: number): number {
  return Math.max(0, Math.round(Number(value || 0) * 100));
}

export function buildIkhokhaCheckoutRequest(booking: BookingPaymentSummary, callbackUrl: string, successUrl: string, failureUrl: string, cancelUrl: string) {
  const { applicationId, externalEntityId } = getIkhokhaConfig();
  const amountInCents = toCents(Number(booking.total_price ?? 0));

  return {
    entityID: applicationId,
    externalEntityID: externalEntityId,
    amount: amountInCents,
    currency: "ZAR",
    requesterUrl: getIkhokhaConfig().returnUrl,
    mode: "live",
    description: `Booking payment for ${booking.customer_name ?? "customer"}`,
    externalTransactionID: booking.id,
    urls: {
      callbackUrl,
      successPageUrl: successUrl,
      failurePageUrl: failureUrl,
      cancelUrl,
    },
  };
}

export function createIkhokhaSignature(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody).digest("hex");
}

export function verifyIkhokhaWebhookSignature({
  path,
  rawBody,
  appSecret,
  receivedSignature,
}: {
  path: string;
  rawBody: string;
  appSecret: string;
  receivedSignature: string;
}): boolean {
  if (!path || !receivedSignature || !appSecret) {
    return false;
  }

  const expectedSignature = createHmac("sha256", appSecret).update(`${path}${rawBody}`).digest("hex");
  const providedSignature = receivedSignature.trim();

  if (providedSignature.length !== expectedSignature.length) {
    return false;
  }

  const providedBuffer = Buffer.from(providedSignature.toLowerCase(), "hex");
  const expectedBuffer = Buffer.from(expectedSignature.toLowerCase(), "hex");

  try {
    return timingSafeEqual(providedBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

export async function createIkhokhaCheckout(
  booking: BookingPaymentSummary,
  callbackUrl: string,
  successUrl: string,
  failureUrl: string,
  cancelUrl: string,
): Promise<IkhokhaCheckoutResponse> {
  const { baseUrl, applicationId, applicationSecret, externalEntityId } = getIkhokhaConfig();

  if (!baseUrl || !applicationId || !applicationSecret || !externalEntityId) {
    return {
      providerConfigured: false,
      checkoutUrl: null,
      redirectUrl: null,
      providerMessage: "iKhokha provider details are incomplete. Set IKHOKHA_API_BASE_URL, IKHOKHA_APPLICATION_ID, IKHOKHA_APPLICATION_SECRET, and IKHOKHA_EXTERNAL_ENTITY_ID.",
    };
  }

  const requestBody = buildIkhokhaCheckoutRequest(booking, callbackUrl, successUrl, failureUrl, cancelUrl);
  const rawBody = JSON.stringify(requestBody);

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/public-api/v1/api/payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: rawBody,
    cache: "no-store",
  });

  const text = await response.text();
  let payload: Record<string, unknown> | null = null;

  if (text) {
    try {
      payload = JSON.parse(text) as Record<string, unknown>;
    } catch {
      payload = { raw: text };
    }
  }

  if (!response.ok) {
    const detail = payload && typeof payload.message === "string" ? payload.message : payload && typeof payload.error === "string" ? payload.error : "iKhokha payment-link creation failed.";
    return {
      providerConfigured: true,
      checkoutUrl: null,
      redirectUrl: null,
      providerMessage: detail,
    };
  }

  const paylinkUrl = typeof payload?.paylinkUrl === "string" ? payload.paylinkUrl : null;
  const paylinkId = typeof payload?.paylinkID === "string" ? payload.paylinkID : null;
  const externalTransactionId = typeof payload?.externalTransactionID === "string" ? payload.externalTransactionID : booking.id;

  return {
    paymentId: paylinkId ?? externalTransactionId ?? booking.id,
    externalTransactionId,
    checkoutUrl: paylinkUrl,
    redirectUrl: paylinkUrl,
    providerConfigured: true,
    providerMessage: typeof payload?.message === "string" ? payload.message : undefined,
  };
}

export async function getIkhokhaStatus(externalReference?: string | null, paymentLinkId?: string | null): Promise<{ ok: boolean; verified: boolean; status: string | null; amount: number | null; payload: Record<string, unknown> | null; error?: string }> {
  const { baseUrl } = getIkhokhaConfig();

  if (!baseUrl || (!externalReference && !paymentLinkId)) {
    return {
      ok: false,
      verified: false,
      status: null,
      amount: null,
      payload: null,
      error: "iKhokha status lookup is not configured.",
    };
  }

  const params = new URLSearchParams();
  if (externalReference) {
    params.set("externalReference", externalReference);
  }
  if (paymentLinkId) {
    params.set("paymentLinkId", paymentLinkId);
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/public-api/v1/api/getStatus/external?${params.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const text = await response.text();
  let payload: Record<string, unknown> | null = null;
  if (text) {
    try {
      payload = JSON.parse(text) as Record<string, unknown>;
    } catch {
      payload = { raw: text };
    }
  }

  const statusValue = typeof payload?.durum === "string" ? payload.durum : null;
  const amountValue = Number(payload && typeof payload.miktar === "number" ? payload.miktar : typeof payload?.miktar === "string" ? payload.miktar : 0);

  return {
    ok: response.ok,
    verified: response.ok && normalizeStatus(statusValue) === "parali",
    status: statusValue,
    amount: Number.isFinite(amountValue) ? amountValue : null,
    payload,
    error: response.ok ? undefined : typeof payload?.message === "string" ? payload.message : "Unable to fetch iKhokha payment status.",
  };
}

export function coerceBool(value: unknown): boolean {
  return value === true || value === "true" || value === "1" || value === 1;
}

export function normalizeStatus(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}
