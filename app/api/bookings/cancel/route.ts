import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const bookingReference = typeof body?.bookingReference === "string" ? body.bookingReference.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";

    if (!bookingReference || (!email && !phone)) {
      return NextResponse.json({ error: "Booking reference and a verified contact detail are required to cancel this booking." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select("id, customer_name, email, phone_number, booking_status, payment_status, total_price, booking_date, booking_time, selected_area_id")
      .eq("id", bookingReference)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "The booking could not be found." }, { status: 404 });
    }

    const contactMatches = (!email || booking.email?.toLowerCase() === email) && (!phone || booking.phone_number === phone);
    if (!contactMatches) {
      return NextResponse.json({ error: "This booking does not match the provided customer contact details." }, { status: 403 });
    }

    if (booking.booking_status === "cancelled") {
      return NextResponse.json({ error: "This booking has already been cancelled." }, { status: 409 });
    }

    const { data: paymentRecord } = await supabaseAdmin
      .from("payments")
      .select("id, status, amount")
      .eq("booking_id", booking.id)
      .eq("provider", "ikhokha")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const hasPaidPayment = paymentRecord?.status === "paid" || booking.payment_status === "paid" || booking.booking_status === "confirmed";

    if (hasPaidPayment) {
      await supabaseAdmin
        .from("payments")
        .update({
          status: "refund_pending",
          refund_amount: Number(paymentRecord?.amount ?? booking.total_price ?? 0),
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentRecord?.id);

      await supabaseAdmin
        .from("bookings")
        .update({
          booking_status: "cancelled",
          payment_status: "refund_pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.id);

      return NextResponse.json({
        success: true,
        bookingId: booking.id,
        bookingStatus: "cancelled",
        paymentStatus: "refund_pending",
        message: "Your booking has been cancelled and a refund request is pending provider confirmation.",
      });
    }

    await supabaseAdmin
      .from("bookings")
      .update({
        booking_status: "cancelled",
        payment_status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id);

    if (paymentRecord) {
      await supabaseAdmin
        .from("payments")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentRecord.id);
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      bookingStatus: "cancelled",
      paymentStatus: "cancelled",
      message: "Your booking has been cancelled successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to cancel the booking.",
      },
      { status: 500 },
    );
  }
}
