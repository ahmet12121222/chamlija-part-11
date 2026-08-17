alter table public.bookings
  add column if not exists reservation_code text;

create unique index if not exists bookings_reservation_code_unique
  on public.bookings (reservation_code)
  where reservation_code is not null;
