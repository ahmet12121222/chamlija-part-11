do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'bookings' and column_name = 'payment_method'
  ) then
    alter table public.bookings add column payment_method text;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'payments' and column_name = 'receipt_url'
  ) then
    alter table public.payments add column receipt_url text;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'payments' and column_name = 'receipt_file_name'
  ) then
    alter table public.payments add column receipt_file_name text;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'payments' and column_name = 'receipt_path'
  ) then
    alter table public.payments add column receipt_path text;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'payments' and column_name = 'receipt_uploaded_at'
  ) then
    alter table public.payments add column receipt_uploaded_at timestamptz;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'payments' and column_name = 'payment_date'
  ) then
    alter table public.payments add column payment_date date;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'payments' and column_name = 'transaction_reference'
  ) then
    alter table public.payments add column transaction_reference text;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'payments' and column_name = 'verification_status'
  ) then
    alter table public.payments add column verification_status text default 'pending';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'payments' and column_name = 'rejection_reason'
  ) then
    alter table public.payments add column rejection_reason text;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'payments' and column_name = 'verified_by'
  ) then
    alter table public.payments add column verified_by text;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'payments' and column_name = 'verified_at'
  ) then
    alter table public.payments add column verified_at timestamptz;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'payments' and column_name = 'admin_notes'
  ) then
    alter table public.payments add column admin_notes text;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'payments' and column_name = 'review_status'
  ) then
    alter table public.payments add column review_status text default 'pending';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'payments' and column_name = 'reviewed_at'
  ) then
    alter table public.payments add column reviewed_at timestamptz;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'payments' and column_name = 'review_note'
  ) then
    alter table public.payments add column review_note text;
  end if;
end $$;

alter table public.bookings
  drop constraint if exists bookings_payment_method_check;

alter table public.bookings
  add constraint bookings_payment_method_check
  check (payment_method in ('bank_transfer', 'cash_at_gate') or payment_method is null);

alter table public.bookings
  drop constraint if exists bookings_payment_status_check;

alter table public.bookings
  add constraint bookings_payment_status_check
  check (
    payment_status in (
      'pending',
      'pending_payment',
      'receipt_uploaded',
      'under_review',
      'verified',
      'rejected',
      'receipt_required',
      'paid',
      'failed',
      'cancelled',
      'refund_pending',
      'refunded',
      'partially_refunded',
      'refund_failed'
    )
  );

alter table public.payments
  drop constraint if exists payments_status_check;

alter table public.payments
  add constraint payments_status_check
  check (
    status in (
      'pending',
      'pending_payment',
      'receipt_uploaded',
      'under_review',
      'verified',
      'rejected',
      'receipt_required',
      'paid',
      'failed',
      'cancelled',
      'refund_pending',
      'refunded',
      'partially_refunded',
      'refund_failed'
    )
  );

alter table public.payments
  drop constraint if exists payments_review_status_check;

alter table public.payments
  add constraint payments_review_status_check
  check (
    review_status in (
      'pending',
      'receipt_uploaded',
      'under_review',
      'verified',
      'rejected',
      'receipt_required',
      'manual_review',
      'approved',
      'resubmission_requested'
    ) or review_status is null
  );

create index if not exists bookings_payment_status_idx on public.bookings (payment_status);
create index if not exists bookings_payment_method_idx on public.bookings (payment_method);
create index if not exists payments_review_status_idx on public.payments (review_status);
create index if not exists payments_transaction_reference_idx on public.payments (transaction_reference);
create index if not exists payments_receipt_uploaded_at_idx on public.payments (receipt_uploaded_at);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create unique index if not exists admin_users_user_id_idx on public.admin_users (user_id);
create unique index if not exists admin_users_email_idx on public.admin_users (email);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
      and au.is_active = true
  );
$$;

grant execute on function public.is_admin() to authenticated;

grant execute on function public.is_admin() to service_role;

create or replace function public.booking_email_matches_session(p_booking_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.bookings b
    where b.id = p_booking_id
      and auth.uid() is not null
      and lower(coalesce(b.email, '')) = lower(coalesce(current_setting('request.jwt.claims', true)::json->>'email', ''))
  );
$$;

grant execute on function public.booking_email_matches_session(uuid) to authenticated;

grant execute on function public.booking_email_matches_session(uuid) to service_role;

create or replace function public.payment_belongs_to_session(p_payment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.payments p
    join public.bookings b on b.id = p.booking_id
    where p.id = p_payment_id
      and auth.uid() is not null
      and lower(coalesce(b.email, '')) = lower(coalesce(current_setting('request.jwt.claims', true)::json->>'email', ''))
  );
$$;

grant execute on function public.payment_belongs_to_session(uuid) to authenticated;

grant execute on function public.payment_belongs_to_session(uuid) to service_role;

create table if not exists public.payment_audit_logs (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  admin_user_id uuid,
  previous_status text,
  new_status text not null,
  changed_at timestamptz not null default now(),
  admin_note text,
  rejection_reason text
);

create index if not exists payment_audit_logs_payment_idx on public.payment_audit_logs (payment_id, changed_at desc);
create index if not exists payment_audit_logs_booking_idx on public.payment_audit_logs (booking_id, changed_at desc);

alter table public.payment_audit_logs enable row level security;

DO $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'admin_users'
      and policyname = 'admin_users_admin_manage'
  ) then
    create policy "admin_users_admin_manage"
    on public.admin_users
    for all
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());
  end if;
end $$;

DO $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'bookings'
      and policyname = 'bookings_customer_select_own'
  ) then
    create policy "bookings_customer_select_own"
    on public.bookings
    for select
    to authenticated
    using (public.booking_email_matches_session(id));
  end if;
end $$;

DO $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'bookings'
      and policyname = 'bookings_customer_update_own'
  ) then
    create policy "bookings_customer_update_own"
    on public.bookings
    for update
    to authenticated
    using (public.booking_email_matches_session(id))
    with check (
      public.booking_email_matches_session(id)
      and booking_status <> 'confirmed'
      and payment_status <> 'verified'
      and payment_status <> 'paid'
    );
  end if;
end $$;

DO $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'bookings'
      and policyname = 'bookings_customer_insert_own'
  ) then
    create policy "bookings_customer_insert_own"
    on public.bookings
    for insert
    to authenticated
    with check (
      auth.uid() is not null
      and lower(coalesce(email, '')) = lower(coalesce(current_setting('request.jwt.claims', true)::json->>'email', ''))
      and booking_status <> 'confirmed'
      and payment_status not in ('verified', 'paid')
    );
  end if;
end $$;

DO $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'bookings'
      and policyname = 'bookings_admin_select_all'
  ) then
    create policy "bookings_admin_select_all"
    on public.bookings
    for select
    to authenticated
    using (public.is_admin());
  end if;
end $$;

DO $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'bookings'
      and policyname = 'bookings_admin_update_all'
  ) then
    create policy "bookings_admin_update_all"
    on public.bookings
    for update
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());
  end if;
end $$;

DO $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'payments'
      and policyname = 'payments_customer_select_own'
  ) then
    create policy "payments_customer_select_own"
    on public.payments
    for select
    to authenticated
    using (public.payment_belongs_to_session(id));
  end if;
end $$;

DO $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'payments'
      and policyname = 'payments_customer_update_own'
  ) then
    create policy "payments_customer_update_own"
    on public.payments
    for update
    to authenticated
    using (public.payment_belongs_to_session(id))
    with check (
      public.payment_belongs_to_session(id)
      and coalesce(status, '') not in ('verified', 'paid')
      and coalesce(review_status, '') not in ('approved', 'verified')
      and verified_by is null
      and verified_at is null
      and review_status in (null, 'pending', 'receipt_uploaded', 'under_review', 'rejected', 'receipt_required', 'manual_review')
    );
  end if;
end $$;

DO $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'payments'
      and policyname = 'payments_customer_insert_own'
  ) then
    create policy "payments_customer_insert_own"
    on public.payments
    for insert
    to authenticated
    with check (
      auth.uid() is not null
      and exists (
        select 1
        from public.bookings b
        where b.id = booking_id
          and lower(coalesce(b.email, '')) = lower(coalesce(current_setting('request.jwt.claims', true)::json->>'email', ''))
      )
      and provider = 'manual'
      and status not in ('verified', 'paid')
      and coalesce(review_status, '') not in ('approved', 'verified')
    );
  end if;
end $$;

DO $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'payments'
      and policyname = 'payments_admin_select_all'
  ) then
    create policy "payments_admin_select_all"
    on public.payments
    for select
    to authenticated
    using (public.is_admin());
  end if;
end $$;

DO $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'payments'
      and policyname = 'payments_admin_update_all'
  ) then
    create policy "payments_admin_update_all"
    on public.payments
    for update
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());
  end if;
end $$;

DO $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'payments'
      and policyname = 'payments_admin_insert_all'
  ) then
    create policy "payments_admin_insert_all"
    on public.payments
    for insert
    to authenticated
    with check (public.is_admin());
  end if;
end $$;

DO $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'payment_audit_logs'
      and policyname = 'payment_audit_logs_admin_only'
  ) then
    create policy "payment_audit_logs_admin_only"
    on public.payment_audit_logs
    for all
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());
  end if;
end $$;

DO $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'bookings'
      and policyname = 'bookings_admin_insert_all'
  ) then
    create policy "bookings_admin_insert_all"
    on public.bookings
    for insert
    to authenticated
    with check (public.is_admin());
  end if;
end $$;

alter table public.payments enable row level security;

comment on column public.payments.receipt_path is 'Private storage path for the customers payment receipt';
comment on column public.payments.receipt_uploaded_at is 'When the customer uploaded the transfer receipt';
comment on column public.payments.payment_date is 'Payment date extracted from the bank transfer receipt';
comment on column public.payments.transaction_reference is 'Payment reference extracted from the receipt';
comment on column public.payments.verification_status is 'Receipt validation and manual review outcome';
comment on column public.payments.rejection_reason is 'Reason provided by the admin when a receipt is rejected';
comment on column public.payments.admin_notes is 'Internal notes added during receipt review';
comment on column public.payments.review_status is 'Customer and admin review state for the payment verification workflow';
