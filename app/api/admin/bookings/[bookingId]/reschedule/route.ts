import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/auth/admin";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { isValidBookingTime } from "@/lib/booking/hours";

const AREA_SLOT_CONFLICT_MESSAGE = "This area is already booked for this date and time. Please choose another area or time.";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  try {
    await requireAdminAccess();
    const { bookingId } = await params;
    const formData = await request.formData();
    const bookingDate = String(formData.get("bookingDate") ?? "").trim();
    const bookingTime = String(formData.get("bookingTime") ?? "").trim();
    const areaId = String(formData.get("areaId") ?? "").trim();

    if (!bookingId || !/^\d{4}-\d{2}-\d{2}$/.test(bookingDate) || !isValidBookingTime(bookingTime) || !areaId) {
      return NextResponse.json({ error: "A valid date, time, and area are required." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { data: area, error: areaError } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("id", areaId)
      .eq("category", "picnic_area")
      .eq("is_active", true)
      .eq("is_bookable", true)
      .maybeSingle();

    if (areaError || !area) {
      return NextResponse.json({ error: "The selected picnic area is unavailable." }, { status: 400 });
    }

    const { data: conflicts, error: conflictError } = await supabaseAdmin
      .from("bookings")
      .select("id")
      .eq("selected_area_id", areaId)
      .eq("booking_date", bookingDate)
      .eq("booking_time", bookingTime)
      .neq("id", bookingId)
      .in("booking_status", ["pending", "confirmed"])
      .or("payment_status.is.null,payment_status.not.in.(rejected,cancelled,failed,refunded,refund_failed)");

    if (conflictError) {
      return NextResponse.json({ error: conflictError.message }, { status: 500 });
    }

    if ((conflicts ?? []).length > 0) {
      return NextResponse.json({ error: AREA_SLOT_CONFLICT_MESSAGE }, { status: 409 });
    }

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .update({ booking_date: bookingDate, booking_time: bookingTime, selected_area_id: areaId, updated_at: new Date().toISOString() })
      .eq("id", bookingId)
      .select("id, reservation_code, booking_date, booking_time, selected_area_id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: AREA_SLOT_CONFLICT_MESSAGE }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, booking: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to reschedule booking." }, { status: 500 });
  }
}
