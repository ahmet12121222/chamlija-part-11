import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { requireAdminAccess } from "@/lib/auth/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  try {
    await requireAdminAccess();

    const { bookingId } = await params;
    const body = await request.formData();
    const refundMode = String(body.get("refundMode") ?? "none").trim();
    const refundAmountInput = String(body.get("refundAmount") ?? "0").trim();

    const supabaseAdmin = getSupabaseAdminClient();
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select("id, total_price, booking_status, payment_status, customer_name, email, phone_number")
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    const amountPaid = Number(booking.total_price ?? 0);
    const normalizedMode = refundMode === "full" || refundMode === "partial" || refundMode === "none" ? refundMode : "none";

    let refundAmount = 0;
    if (normalizedMode === "partial") {
      refundAmount = Number(refundAmountInput ?? 0);
      if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
        return NextResponse.json({ error: "Partial refund amount must be greater than zero." }, { status: 400 });
      }
      if (refundAmount > amountPaid) {
        return NextResponse.json({ error: "Partial refund amount cannot exceed the amount actually paid." }, { status: 400 });
      }
    }

    if (booking.booking_status === "cancelled") {
      return NextResponse.json({ error: "This booking has already been cancelled." }, { status: 409 });
    }

    if (booking.payment_status === "paid" || booking.booking_status === "confirmed") {
      if (normalizedMode === "none") {
        await supabaseAdmin
          .from("bookings")
          .update({
            booking_status: "cancelled",
            payment_status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("id", booking.id);

        return NextResponse.json({
          success: true,
          bookingId: booking.id,
          bookingStatus: "cancelled",
          paymentStatus: "cancelled",
          message: "Booking cancelled without a refund request.",
        });
      }

      const refundDecision = normalizedMode === "full" ? amountPaid : refundAmount;

      await supabaseAdmin
        .from("bookings")
        .update({
          booking_status: "cancelled",
          payment_status: "refund_pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.id);

      await supabaseAdmin
        .from("payments")
        .update({
          status: "refund_pending",
          refund_amount: refundDecision,
          updated_at: new Date().toISOString(),
        })
        .eq("booking_id", booking.id)
        .eq("provider", "ikhokha");

      return NextResponse.json({
        success: true,
        bookingId: booking.id,
        bookingStatus: "cancelled",
        paymentStatus: "refund_pending",
        refundStatus: "refund_pending",
        refundAmount: refundDecision,
        message: "Refund pending. Open iKhokha Dashboard → find the transaction → issue the full or partial refund → return here → Mark Refund as Completed.",
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

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      bookingStatus: "cancelled",
      paymentStatus: "cancelled",
      message: "Unpaid booking cancelled successfully.",
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
