import { supabase } from "@/lib/supabase/client";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { BOOKING_TIME_SLOTS } from "@/lib/booking/hours";
import { calculateEntranceTotal } from "@/lib/booking/pricing";

export type PicnicAreaRecord = {
  id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  capacity?: number | null;
  is_active?: boolean | null;
  is_bookable?: boolean | null;
  category?: string | null;
  created_at?: string | null;
};

export type BookingRecord = {
  id: string;
  selected_area_id: string;
  booking_date: string;
  booking_time: string;
  booking_status?: string | null;
  payment_status?: string | null;
};

export const BUSINESS_HOURS = {
  open: "09:00",
  close: "18:00",
};

export function toDateValue(dateValue: string): Date | null {
  if (!dateValue) {
    return null;
  }

  const parsed = new Date(`${dateValue}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function calculateBookingTotal(adults: number, children3Plus: number, childrenUnder3: number): number {
  return calculateEntranceTotal({ adults, children3Plus, under3: childrenUnder3 });
}

export async function getActivePicnicAreas(): Promise<{ data: PicnicAreaRecord[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category", "picnic_area")
      .eq("is_active", true)
      .eq("is_bookable", true)
      .order("item_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: (data ?? []) as PicnicAreaRecord[], error: null };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : "Unable to load picnic areas.",
    };
  }
}

export async function getPicnicAreaById(areaId: string): Promise<PicnicAreaRecord | null> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", areaId)
      .eq("category", "picnic_area")
      .eq("is_active", true)
      .eq("is_bookable", true)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as PicnicAreaRecord;
  } catch {
    return null;
  }
}

export function getTimeSlotsForDay(): string[] {
  return [...BOOKING_TIME_SLOTS];
}

export function toMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return Number.NaN;
  }

  return hours * 60 + minutes;
}

export function minutesToClock(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export async function getExistingBookingsForArea(dateValue: string, areaId: string): Promise<BookingRecord[]> {
  try {
    // Bookings are only readable via the admin client (RLS blocks public SELECT), so this
    // must only ever be called from server-side code (API routes), never the browser.
    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("id, selected_area_id, booking_date, booking_time, booking_status, payment_status")
      .eq("selected_area_id", areaId)
      .eq("booking_date", dateValue)
      .in("booking_status", ["pending", "confirmed"])
      .or("payment_status.is.null,payment_status.not.in.(rejected,cancelled,failed,refunded,refund_failed)");

    if (error || !data) {
      return [];
    }

    return data as BookingRecord[];
  } catch {
    return [];
  }
}

export async function getAvailableTimeSlots(dateValue: string, areaId: string): Promise<string[]> {
  const slots = getTimeSlotsForDay();
  const bookings = await getExistingBookingsForArea(dateValue, areaId);
  // Postgres `time` columns come back as "HH:MM:SS"; normalize to "HH:MM" to match slot format.
  const bookedTimes = new Set(bookings.map((booking) => booking.booking_time.slice(0, 5)));

  return slots.filter((slot) => !bookedTimes.has(slot));
}

export async function getSuggestedDates(areaId: string, fromDate: string, count = 7): Promise<string[]> {
  const startDate = toDateValue(fromDate);

  if (!startDate) {
    return [];
  }

  const suggestions: string[] = [];
  const loopDate = new Date(startDate);

  for (let index = 0; index < count && suggestions.length < count; index += 1) {
    loopDate.setDate(loopDate.getDate() + 1);
    const isoDate = loopDate.toISOString().slice(0, 10);
    const options = await getAvailableTimeSlots(isoDate, areaId);

    if (options.length > 0) {
      suggestions.push(isoDate);
    }
  }

  return suggestions;
}

export async function createBookingRecord(payload: {
  customer_name: string;
  phone_number: string;
  email: string;
  booking_date: string;
  booking_time: string;
  adults: number;
  children_3_plus: number;
  children_under_3: number;
  selected_area_id: string;
  selected_equipment_ids: string[];
  selected_paid_activity_id: string | null;
  selected_tent_area_id: string | null;
  selected_photo_shoot_id: string | null;
  entrance_fee_total: number;
  additional_total: number;
  total_price: number;
  notes: string;
  payment_status: "pending";
  booking_status: "pending";
}): Promise<{ id: string | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .insert([payload])
      .select("id")
      .single();

    if (error) {
      return { id: null, error: error.message };
    }

    return { id: data?.id ?? null, error: null };
  } catch (error) {
    return {
      id: null,
      error: error instanceof Error ? error.message : "Unable to submit the booking.",
    };
  }
}
