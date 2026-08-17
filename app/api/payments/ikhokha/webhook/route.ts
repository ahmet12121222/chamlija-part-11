import { NextResponse } from "next/server";
import { getIkhokhaConfig, verifyIkhokhaWebhookSignature } from "@/lib/payments/ikhokha";
import { getSupabaseAdminClient as getSupabaseServerClient } from "@/lib/supabase/server";

function getStringValue(source: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const path = key.split(".");
    let current: unknown = source;

    for (const segment of path) {
      if (!current || typeof current !== "object" || !(segment in current)) {
        current = undefined;
        break;
      }
      current = (current as Record<string, unknown>)[segment];
    }

    if (typeof current === "string" && current.trim()) {
      return current.trim();
    }

    if (typeof current === "number") {
      return String(current);
    }
  }

  return null;
}

function normalizeWebhookStatus(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const appId = request.headers.get("IK-APPID") ?? request.headers.get("ik-appid");
    const signature = request.headers.get("IK-SIGN") ?? request.headers.get("ik-sign");
    const path = new URL(request.url).pathname;
    const { applicationId, applicationSecret } = getIkhokhaConfig();

    if (!appId) {
      return NextResponse.json({ error: "Missing IK-APPID header." }, { status: 401 });
    }

    if (appId !== applicationId) {
      return NextResponse.json({ error: "Invalid IK-APPID header." }, { status: 403 });
    }

    if (!signature) {
      return NextResponse.json({ error: "Missing IK-SIGN header." }, { status: 401 });
    }

    if (!applicationSecret) {
      return NextResponse.json({ error: "iKhokha App Secret is not configured." }, { status: 503 });
    }

    const isVerified = verifyIkhokhaWebhookSignature({
      path,
      rawBody,
      appSecret: applicationSecret,
      receivedSignature: signature,
    });

    if (!isVerified) {
      return NextResponse.json({ error: "Invalid IK-SIGN signature." }, { status: 401 });
    }

    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
    }

    const paymentLinkId = getStringValue(payload, [
      "paylinkID",
      "paylinkId",
      "paymentLinkID",
      "paymentLinkId",
      "data.paylinkID",
      "data.paylinkId",
      "result.paylinkID",
      "result.paylinkId",
    ]);

    const externalTransactionId = getStringValue(payload, [
      "externalTransactionID",
      "externalTransactionId",
      "hariciIslemID",
      "hariciİşlemID",
      "data.externalTransactionID",
      "result.externalTransactionID",
    ]);

    const statusValue = getStringValue(payload, ["status", "durum", "data.status", "data.durum", "result.status", "result.durum"]);
    const responseCode = getStringValue(payload, ["responseCode", "code", "yanıt kodu", "yanitKodu", "data.responseCode", "result.responseCode"]);
    const amountValue = Number(
      getStringValue(payload, ["amount", "totalAmount", "value", "miktar", "data.amount", "data.miktar", "result.amount", "result.miktar"]) ?? 0,
    );

    if (!paymentLinkId && !externalTransactionId) {
      return NextResponse.json({ error: "Webhook payload is missing an iKhokha payment identifier." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseServerClient();
    let paymentQuery = supabaseAdmin
      .from("payments")
      .select("id, booking_id, provider_payment_id, provider_reference, amount, status")
      .eq("provider", "ikhokha");

    if (paymentLinkId && externalTransactionId) {
      paymentQuery = paymentQuery.or(`provider_payment_id.eq.${paymentLinkId},provider_reference.eq.${externalTransactionId}`);
    } else if (paymentLinkId) {
      paymentQuery = paymentQuery.eq("provider_payment_id", paymentLinkId);
    } else if (externalTransactionId) {
      paymentQuery = paymentQuery.eq("provider_reference", externalTransactionId);
    }

    const { data: paymentRecord, error: paymentLookupError } = await paymentQuery
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (paymentLookupError) {
      return NextResponse.json({ error: paymentLookupError.message }, { status: 500 });
    }

    if (!paymentRecord) {
      return NextResponse.json({ success: true, idempotent: true, ignored: true, message: "No matching payment record found for the verified iKhokha webhook." });
    }

    const normalizedStatus = normalizeWebhookStatus(statusValue);
    const providerAmount = Number(paymentRecord.amount ?? 0);
    const amountsMatch = Number.isFinite(amountValue) && providerAmount > 0 ? amountValue === providerAmount : true;

    const isSuccessfulPayment =
      normalizedStatus === "success" ||
      normalizedStatus === "paid" ||
      (normalizedStatus === "başari" && normalizeWebhookStatus(responseCode) === "00") ||
      (normalizedStatus === "basiari" && normalizeWebhookStatus(responseCode) === "00");

    if (!amountsMatch) {
      return NextResponse.json({ success: false, verified: true, idempotent: true, message: "Webhook amount does not match the stored payment amount." }, { status: 400 });
    }

    if (paymentRecord.status === "paid") {
      return NextResponse.json({ success: true, idempotent: true, bookingId: paymentRecord.booking_id, paymentStatus: "paid" });
    }

    if (!isSuccessfulPayment) {
      return NextResponse.json({ success: false, verified: true, idempotent: true, message: "Webhook did not indicate a successful payment." });
    }

    const { error: paymentUpdateError } = await supabaseAdmin
      .from("payments")
      .update({
        status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentRecord.id);

    if (paymentUpdateError) {
      return NextResponse.json({ error: paymentUpdateError.message }, { status: 500 });
    }

    const { error: bookingUpdateError } = await supabaseAdmin
      .from("bookings")
      .update({
        payment_status: "paid",
        booking_status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentRecord.booking_id);

    if (bookingUpdateError) {
      return NextResponse.json({ error: bookingUpdateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      idempotent: true,
      bookingId: paymentRecord.booking_id,
      paymentStatus: "paid",
      bookingStatus: "confirmed",
      message: "Payment confirmed after official iKhokha status verification.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to process webhook.",
      },
      { status: 500 },
    );
  }
}
