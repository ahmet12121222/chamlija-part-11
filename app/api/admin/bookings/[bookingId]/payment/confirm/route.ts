import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { requireAdminAccess } from "@/lib/auth/admin";

export async function POST(request: Request, { params }: { params: Promise<{ bookingId: string }> }) {
  try {
    await requireAdminAccess();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { bookingId } = await params;

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // Get booking details
    const { data: booking, error: bookingError } = await supabaseAdmin.from("bookings").select("id, total_price, payment_method, payment_status").eq("id", bookingId).maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Only allow confirming payment for cash_at_gate method. Bank transfers require the review flow with receipt verification.
    if (booking.payment_method === "bank_transfer") {
      return NextResponse.json({ error: "Bank transfer payments must be reviewed using the receipt verification flow." }, { status: 400 });
    }

    if (booking.payment_method !== "cash_at_gate") {
      return NextResponse.json({ error: "This booking does not use manual payment" }, { status: 400 });
    }

    // Update booking and payment status for a confirmed manual payment.
    const { error: updateBookingError } = await supabaseAdmin
      .from("bookings")
      .update({
        payment_status: "paid",
        booking_status: "confirmed",
      })
      .eq("id", bookingId);

    if (updateBookingError) {
      return NextResponse.json({ error: updateBookingError.message }, { status: 500 });
    }

    // Update or create payment record
    const { error: paymentError } = await supabaseAdmin.from("payments").upsert(
      [
        {
          booking_id: bookingId,
          provider: "manual",
          provider_payment_id: null,
          amount: booking.total_price ?? 0,
          currency: "ZAR",
          status: "paid",
          refund_amount: 0,
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: "booking_id" },
    );

    if (paymentError) {
      console.warn("Payment record update warning:", paymentError);
      // Don't fail if payment record update has issues
    }

    return redirect("/admin");
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
