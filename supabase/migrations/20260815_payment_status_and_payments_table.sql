create extension if not exists pgcrypto;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  provider text not null default 'ikhokha',
  provider_payment_id text,
  provider_reference text,
  amount numeric(12,2) not null default 0,
  currency text not null default 'ZAR',
  status text not null default 'pending' check (status in ('pending','paid','failed','cancelled','refund_pending','refunded','partially_refunded','refund_failed')),
  refund_amount numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (booking_id, provider, provider_payment_id)
);

alter table public.payments enable row level security;

create unique index if not exists payments_booking_provider_unique_idx on public.payments (booking_id, provider, provider_payment_id) where provider_payment_id is not null;

alter table public.bookings
  drop constraint if exists bookings_payment_status_check;

alter table public.bookings
  add constraint bookings_payment_status_check
  check (payment_status in ('pending','paid','failed','cancelled','refund_pending','refunded','partially_refunded','refund_failed'));

alter table public.bookings
  alter column payment_status set default 'pending';

create index if not exists payments_booking_idx on public.payments (booking_id, provider, status);
create index if not exists payments_provider_reference_idx on public.payments (provider, provider_reference);
