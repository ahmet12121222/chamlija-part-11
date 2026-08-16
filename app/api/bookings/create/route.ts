import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { isValidBookingTime } from "@/lib/booking/hours";

const ADULT_FEE = 50;
const CHILD_3_PLUS_FEE = 25;
const FREE_CHILD_PRICE = 0;

function parseNonNegativeInteger(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.trunc(parsed) : 0;
}

function computeEntranceFee(adults: number, children3Plus: number, childrenUnder3: number): number {
  return adults * ADULT_FEE + children3Plus * CHILD_3_PLUS_FEE + childrenUnder3 * FREE_CHILD_PRICE;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const fullName = String(body.full_name ?? "").trim();
    const phoneNumber = String(body.phone_number ?? "").trim();
    const email = String(body.email ?? "").trim();
    const bookingDate = String(body.booking_date ?? "").trim();
    const bookingTime = String(body.booking_time ?? "").trim();
    const areaId = String(body.picnic_area_id ?? "").trim();
    const customerNotes = String(body.customer_notes ?? "").trim();
    const adults = parseNonNegativeInteger(body.adults);
    const children3Plus = parseNonNegativeInteger(body.children_3_plus);
    const childrenUnder3 = parseNonNegativeInteger(body.children_under_3);

    const selectedEquipmentIds = Array.isArray(body.selected_equipment_ids)
      ? body.selected_equipment_ids.filter((id: unknown): id is string => typeof id === "string" && id.trim().length > 0)
      : [];
    
    // Parse equipment quantities from "id:qty" format
    const equipmentWithQty = selectedEquipmentIds.map((item: string) => {
      const [id, qtyStr] = item.split(":");
      const qty = Number(qtyStr) || 1;
      return { id: id.trim(), qty };
    });
    
    const selectedPaidActivityId = typeof body.selected_paid_activity_id === "string" ? body.selected_paid_activity_id.trim() : null;
    const selectedTentAreaId = typeof body.selected_tent_area_id === "string" ? body.selected_tent_area_id.trim() : null;
    const selectedPhotoShootId = typeof body.selected_photo_shoot_id === "string" ? body.selected_photo_shoot_id.trim() : null;

    if (!fullName || !phoneNumber || !email || !bookingDate || !bookingTime || !areaId) {
      return NextResponse.json({ error: "All required booking fields must be provided." }, { status: 400 });
    }

    if (adults < 0 || children3Plus < 0 || childrenUnder3 < 0) {
      return NextResponse.json({ error: "Guest counts cannot be negative." }, { status: 400 });
    }

    if (adults + children3Plus + childrenUnder3 <= 0) {
      return NextResponse.json({ error: "At least one guest must be present." }, { status: 400 });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(bookingDate)) {
      return NextResponse.json({ error: "Please provide a valid booking date." }, { status: 400 });
    }

    if (!isValidBookingTime(bookingTime)) {
      return NextResponse.json({ error: "Please choose a valid booking time between 09:00 and 18:00." }, { status: 400 });
    }

    const selectedDate = new Date(`${bookingDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(selectedDate.getTime()) || selectedDate < today) {
      return NextResponse.json({ error: "Booking date cannot be in the past." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();

    const { data: area, error: areaError } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("id", areaId)
      .eq("category", "picnic_area")
      .eq("is_active", true)
      .eq("is_bookable", true)
      .maybeSingle();

    if (areaError || !area) {
      return NextResponse.json({ error: "The selected picnic area is unavailable." }, { status: 400 });
    }

    if (area.capacity !== null && area.capacity !== undefined && adults + children3Plus + childrenUnder3 > Number(area.capacity)) {
      return NextResponse.json({ error: "The selected picnic area cannot accommodate your party size." }, { status: 400 });
    }

    let additionalTotal = Number(area.price ?? 0);

    const selectedProductIds = [
      ...equipmentWithQty.map((e: { id: string; qty: number }) => e.id),
      selectedPaidActivityId,
      selectedTentAreaId,
      selectedPhotoShootId,
    ].filter((id): id is string => typeof id === "string" && Boolean(id.trim()));

    const productIds = [...new Set(selectedProductIds)];

    const validatedProductIds: string[] = [];

    if (productIds.length > 0) {
      const { data: products, error: productsError } = await supabaseAdmin
        .from("products")
        .select("*")
        .in("id", productIds)
        .eq("is_active", true)
        .eq("is_bookable", true)
        .in("category", ["equipment", "paid_activity", "tent_event_area", "photo_shoot"]);

      if (productsError) {
        return NextResponse.json({ error: productsError.message }, { status: 500 });
      }

      const productMap = new Map((products ?? []).map((product) => [product.id, product]));

      // Handle equipment with quantities
      for (const { id: equipmentId, qty } of equipmentWithQty) {
        const product = productMap.get(equipmentId);

        if (!product) {
          return NextResponse.json({ error: "One or more selected products are invalid or unavailable." }, { status: 400 });
        }

        if (product.is_free === true) {
          continue;
        }

        if (product.category !== "equipment") {
          return NextResponse.json({ error: "One or more selected equipment items belong to an invalid category." }, { status: 400 });
        }

        validatedProductIds.push(equipmentId);
        additionalTotal += Number(product.price ?? 0) * qty;
      }

      // Handle single-select products (paid activity, tent area, photo shoot)
      for (const productId of [selectedPaidActivityId, selectedTentAreaId, selectedPhotoShootId]) {
        if (!productId) continue;

        const product = productMap.get(productId);

        if (!product) {
          return NextResponse.json({ error: "One or more selected products are invalid or unavailable." }, { status: 400 });
        }

        if (product.is_free === true) {
          continue;
        }

        if (product.category !== "paid_activity" && product.category !== "tent_event_area" && product.category !== "photo_shoot") {
          return NextResponse.json({ error: "One or more selected products belong to an invalid category." }, { status: 400 });
        }

        validatedProductIds.push(productId);
        additionalTotal += Number(product.price ?? 0);
      }
    }

    const entranceFeeTotal = computeEntranceFee(adults, children3Plus, childrenUnder3);
    const finalTotal = entranceFeeTotal + additionalTotal;

    const { data: conflictingBookings, error: conflictError } = await supabaseAdmin
      .from("bookings")
      .select("id")
      .eq("selected_area_id", areaId)
      .eq("booking_date", bookingDate)
      .eq("booking_time", bookingTime)
      .in("booking_status", ["pending", "confirmed"]);

    if (conflictError) {
      return NextResponse.json({ error: conflictError.message }, { status: 500 });
    }

    if ((conflictingBookings ?? []).length > 0) {
      return NextResponse.json({ error: "Unfortunately, this time slot is unavailable." }, { status: 409 });
    }

    const { data: productCapacityRows, error: capacityError } = await supabaseAdmin
      .from("products")
      .select("id, capacity, category")
      .in("id", [areaId, ...validatedProductIds]);

    if (capacityError) {
      return NextResponse.json({ error: capacityError.message }, { status: 500 });
    }

    const productCapacityMap = new Map((productCapacityRows ?? []).map((row) => [row.id, row]));

    for (const productId of [areaId, ...validatedProductIds]) {
      const capProduct = productCapacityMap.get(productId);
      if (!capProduct) continue;

      if (capProduct.capacity !== null && capProduct.capacity !== undefined) {
        const capacityValue = Number(capProduct.capacity);
        if (Number.isFinite(capacityValue) && capacityValue > 0) {
          const guestTotal = adults + children3Plus + childrenUnder3;
          if (guestTotal > capacityValue) {
            return NextResponse.json({ error: "The selected product exceeds the available capacity for this booking." }, { status: 400 });
          }
        }
      }
    }

    const payload = {
      customer_name: fullName,
      phone_number: phoneNumber,
      email,
      booking_date: bookingDate,
      booking_time: bookingTime,
      adults,
      children_3_plus: children3Plus,
      children_under_3: childrenUnder3,
      selected_area_id: areaId,
      selected_equipment_ids: selectedEquipmentIds,
      selected_paid_activity_id: selectedPaidActivityId || null,
      selected_tent_area_id: selectedTentAreaId || null,
      selected_photo_shoot_id: selectedPhotoShootId || null,
      entrance_fee_total: entranceFeeTotal,
      additional_total: additionalTotal,
      total_price: finalTotal,
      booking_status: "pending",
      payment_status: "pending",
      notes: customerNotes,
    };

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .insert([payload])
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bookingId: data?.id ?? null, success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to submit booking.",
      },
      { status: 500 },
    );
  }
}
