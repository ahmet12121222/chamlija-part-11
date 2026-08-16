import { createHmac, timingSafeEqual } from "crypto";
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
    .select("id, total_price, booking_status, payment_status, customer_name, email, phone_number, booking_date, booking_time, selected_area_id")
    .eq("id", bookingId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as BookingPaymentSummary;
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
