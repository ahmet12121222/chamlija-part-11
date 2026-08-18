-- Prevent active reservations from sharing the same area/date/time slot.
-- This migration intentionally fails with a clear report if existing active duplicates exist.
-- It never deletes or changes existing reservation data.

DO $$
DECLARE
  duplicate_groups integer;
BEGIN
  SELECT COUNT(*)
  INTO duplicate_groups
  FROM (
    SELECT booking_date, LEFT(booking_time, 5) AS booking_time, selected_area_id
    FROM public.bookings
    WHERE selected_area_id IS NOT NULL
      AND booking_status IN ('pending', 'confirmed')
      AND COALESCE(payment_status, 'pending') NOT IN ('rejected', 'cancelled', 'failed', 'refunded', 'refund_failed')
    GROUP BY booking_date, LEFT(booking_time, 5), selected_area_id
    HAVING COUNT(*) > 1
  ) AS duplicates;

  IF duplicate_groups > 0 THEN
    RAISE EXCEPTION
      'Cannot create active area slot protection: % duplicate booking group(s) exist. Resolve the reported duplicates before applying this migration.',
      duplicate_groups;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS bookings_active_area_slot_unique_idx
  ON public.bookings (booking_date, LEFT(booking_time, 5), selected_area_id)
  WHERE selected_area_id IS NOT NULL
    AND booking_status IN ('pending', 'confirmed')
    AND COALESCE(payment_status, 'pending') NOT IN ('rejected', 'cancelled', 'failed', 'refunded', 'refund_failed');
