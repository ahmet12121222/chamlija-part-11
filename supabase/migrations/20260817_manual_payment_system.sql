-- Add payment_method column to bookings table for manual payment system
-- Supports: bank_transfer, cash_at_gate

-- Add column if it doesn't already exist
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_name='bookings' and column_name='payment_method'
  ) then
    alter table public.bookings add column payment_method text;
  end if;
end
$$;

-- Add constraint to ensure valid payment methods
alter table public.bookings
  drop constraint if exists bookings_payment_method_check;

alter table public.bookings
  add constraint bookings_payment_method_check
  check (payment_method in ('bank_transfer', 'cash_at_gate') or payment_method is null);

-- Create index for payment_method column
create index if not exists bookings_payment_method_idx on public.bookings (payment_method);

-- Ensure payment_method is included in bookings queries
comment on column public.bookings.payment_method is 'Payment method selected by customer: bank_transfer or cash_at_gate';
