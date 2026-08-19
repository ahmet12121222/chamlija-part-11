-- Safely assign references only to existing bookings that do not have one.
-- Existing reservation data and existing codes are left unchanged.
DO $$
DECLARE
  next_number bigint;
BEGIN
  SELECT COALESCE(MAX((substring(reservation_code from '^CHM-[0-9]{4}-([0-9]+)$'))::bigint), 0)
  INTO next_number
  FROM public.bookings
  WHERE reservation_code IS NOT NULL;

  WITH missing AS (
    SELECT id, booking_date, ROW_NUMBER() OVER (ORDER BY created_at NULLS FIRST, id) AS row_number
    FROM public.bookings
    WHERE reservation_code IS NULL
  )
  UPDATE public.bookings AS bookings
  SET reservation_code = 'CHM-' || EXTRACT(YEAR FROM missing.booking_date)::text || '-' || LPAD((next_number + missing.row_number)::text, 6, '0'),
      updated_at = COALESCE(bookings.updated_at, NOW())
  FROM missing
  WHERE bookings.id = missing.id;
END $$;
