import { NextResponse } from "next/server";
import { getBookingPaymentSummary, getIkhokhaStatus, normalizeStatus } from "@/lib/payments/ikhokha";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId") ?? "";

    if (!bookingId) {
      return NextResponse.json({ error: "A bookingId is required." }, { status: 400 });
    }

    const booking = await getBookingPaymentSummary(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("id, provider, provider_payment_id, provider_reference, amount, currency, status, refund_amount")
      .eq("booking_id", bookingId)
      .eq("provider", "ikhokha")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const providerStatus = await getIkhokhaStatus(payment?.provider_reference ?? null, payment?.provider_payment_id ?? null);
    const storedAmount = Number(payment?.amount ?? 0);
    const providerAmount = Number(providerStatus.amount ?? 0);
    const amountsMatch = storedAmount > 0 && providerAmount > 0 ? providerAmount === storedAmount : true;

    if (providerStatus.ok && providerStatus.verified && amountsMatch) {
      await supabaseAdmin
        .from("payments")
        .update({
          status: "paid",
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment?.id);

      await supabaseAdmin
        .from("bookings")
        .update({
          payment_status: "paid",
          booking_status: "confirmed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.id);
    }

    const refreshedBooking = await getBookingPaymentSummary(bookingId);

    return NextResponse.json({
      bookingId: booking.id,
      totalPrice: Number(booking.total_price ?? 0),
      bookingStatus: refreshedBooking?.booking_status ?? booking.booking_status ?? "pending",
      paymentStatus: refreshedBooking?.payment_status ?? booking.payment_status ?? "pending",
      providerStatus: payment?.status ?? "pending",
      providerVerifiedStatus: providerStatus.status ?? null,
      providerConfirmed: providerStatus.verified && amountsMatch,
      bookingDate: booking.booking_date ?? null,
      bookingTime: booking.booking_time ?? null,
      selectedAreaId: booking.selected_area_id ?? null,
      confirmed: refreshedBooking?.payment_status === "paid" || refreshedBooking?.booking_status === "confirmed",
      providerAmount,
      paymentAmount: storedAmount,
      amountsMatch,
      providerData: providerStatus.payload,
      statusNote: providerStatus.verified ? "Payment verified by official iKhokha status response." : normalizeStatus(providerStatus.status) === "parali" ? "Provider status indicates a paid payment but amounts do not match." : "Official iKhokha status has not yet confirmed a successful payment.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to fetch payment status.",
      },
      { status: 500 },
    );
  }
}
