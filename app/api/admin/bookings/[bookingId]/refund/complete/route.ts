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
    const formData = await request.formData();
    const action = String(formData.get("refundAction") ?? "complete").trim();

    const supabaseAdmin = getSupabaseAdminClient();
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select("id, payment_status, booking_status, total_price")
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("id, amount, refund_amount, status")
      .eq("booking_id", bookingId)
      .eq("provider", "ikhokha")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (action === "failed") {
      await supabaseAdmin
        .from("payments")
        .update({
          status: "refund_failed",
          refund_amount: Number(payment?.refund_amount ?? 0),
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment?.id ?? "")
        .eq("provider", "ikhokha");

      await supabaseAdmin
        .from("bookings")
        .update({
          payment_status: "refund_failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId);

      return NextResponse.json({
        success: true,
        bookingId,
        paymentStatus: "refund_failed",
        refundStatus: "refund_failed",
        message: "Refund was marked as failed / not completed. Please resolve the manual refund in the iKhokha Dashboard.",
      });
    }

    const refundAmount = Number(payment?.refund_amount ?? payment?.amount ?? booking.total_price ?? 0);
    const finalStatus = refundAmount >= Number(booking.total_price ?? 0) ? "refunded" : "partially_refunded";

    await supabaseAdmin
      .from("payments")
      .update({
        status: finalStatus,
        refund_amount: refundAmount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment?.id ?? "")
      .eq("provider", "ikhokha");

    await supabaseAdmin
      .from("bookings")
      .update({
        payment_status: finalStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    return NextResponse.json({
      success: true,
      bookingId,
      paymentStatus: finalStatus,
      refundStatus: finalStatus,
      refundAmount,
      message: "Refund marked as completed after manual confirmation in the iKhokha Dashboard.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to process the refund completion action.",
      },
      { status: 500 },
    );
  }
}
