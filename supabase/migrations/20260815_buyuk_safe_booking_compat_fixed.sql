create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('picnic_area', 'equipment', 'free_activity', 'paid_activity', 'tent_event_area', 'photo_shoot')),
  description text,
  price numeric(12,2) not null default 0,
  currency text not null default 'ZAR',
  is_active boolean not null default true,
  is_bookable boolean not null default false,
  is_free boolean not null default false,
  capacity integer,
  size text,
  entry_fee_excluded boolean not null default false,
  item_order integer not null default 0,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name, category)
);

alter table public.products enable row level security;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  phone_number text,
  email text,
  booking_date date,
  booking_time text,
  adults integer not null default 0,
  children_3_plus integer not null default 0,
  children_under_3 integer not null default 0,
  selected_area_id uuid,
  selected_equipment_ids text[] not null default '{}',
  selected_paid_activity_id uuid,
  selected_tent_area_id uuid,
  selected_photo_shoot_id uuid,
  entrance_fee_total numeric(12,2) not null default 0,
  additional_total numeric(12,2) not null default 0,
  total_price numeric(12,2) not null default 0,
  booking_status text not null default 'pending' check (booking_status in ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'refunded')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'full_name'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'customer_name'
  ) THEN
    ALTER TABLE public.bookings RENAME COLUMN full_name TO customer_name;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'phone'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE public.bookings RENAME COLUMN phone TO phone_number;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'email_address'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'email'
  ) THEN
    ALTER TABLE public.bookings RENAME COLUMN email_address TO email;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'date'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'booking_date'
  ) THEN
    ALTER TABLE public.bookings RENAME COLUMN date TO booking_date;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'time'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'booking_time'
  ) THEN
    ALTER TABLE public.bookings RENAME COLUMN time TO booking_time;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'customer_notes'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'notes'
  ) THEN
    ALTER TABLE public.bookings RENAME COLUMN customer_notes TO notes;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'picnic_area_id'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'selected_area_id'
  ) THEN
    ALTER TABLE public.bookings RENAME COLUMN picnic_area_id TO selected_area_id;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'customer_name'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN customer_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN phone_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'email'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'booking_date'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN booking_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'booking_time'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN booking_time text;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'adults'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN adults integer not null default 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'children_3_plus'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN children_3_plus integer not null default 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'children_under_3'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN children_under_3 integer not null default 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'selected_area_id'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN selected_area_id uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'selected_equipment_ids'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN selected_equipment_ids text[] not null default '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'selected_paid_activity_id'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN selected_paid_activity_id uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'selected_tent_area_id'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN selected_tent_area_id uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'selected_photo_shoot_id'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN selected_photo_shoot_id uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'entrance_fee_total'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN entrance_fee_total numeric(12,2) not null default 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'additional_total'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN additional_total numeric(12,2) not null default 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'total_price'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN total_price numeric(12,2) not null default 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'booking_status'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN booking_status text not null default 'pending';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN payment_status text not null default 'pending';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'notes'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN notes text;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN created_at timestamptz not null default now();
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN updated_at timestamptz not null default now();
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'full_name'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'customer_name'
  ) THEN
    UPDATE public.bookings
    SET customer_name = COALESCE(customer_name, full_name)
    WHERE customer_name IS NULL AND full_name IS NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'phone'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'phone_number'
  ) THEN
    UPDATE public.bookings
    SET phone_number = COALESCE(phone_number, phone)
    WHERE phone_number IS NULL AND phone IS NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'email_address'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'email'
  ) THEN
    UPDATE public.bookings
    SET email = COALESCE(email, email_address)
    WHERE email IS NULL AND email_address IS NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'customer_notes'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'notes'
  ) THEN
    UPDATE public.bookings
    SET notes = COALESCE(notes, customer_notes)
    WHERE notes IS NULL AND customer_notes IS NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'picnic_area_id'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'selected_area_id'
  ) THEN
    UPDATE public.bookings
    SET selected_area_id = COALESCE(selected_area_id, picnic_area_id::uuid)
    WHERE selected_area_id IS NULL AND picnic_area_id IS NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'selected_area_id'
  ) THEN
    ALTER TABLE public.bookings
      ALTER COLUMN selected_area_id TYPE uuid USING selected_area_id::uuid;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'selected_paid_activity_id'
  ) THEN
    ALTER TABLE public.bookings
      ALTER COLUMN selected_paid_activity_id TYPE uuid USING selected_paid_activity_id::uuid;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'selected_tent_area_id'
  ) THEN
    ALTER TABLE public.bookings
      ALTER COLUMN selected_tent_area_id TYPE uuid USING selected_tent_area_id::uuid;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'selected_photo_shoot_id'
  ) THEN
    ALTER TABLE public.bookings
      ALTER COLUMN selected_photo_shoot_id TYPE uuid USING selected_photo_shoot_id::uuid;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.bookings'::regclass
      AND conname = 'bookings_selected_area_id_fkey'
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_selected_area_id_fkey
      FOREIGN KEY (selected_area_id) REFERENCES public.products(id) ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.bookings'::regclass
      AND conname = 'bookings_selected_paid_activity_id_fkey'
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_selected_paid_activity_id_fkey
      FOREIGN KEY (selected_paid_activity_id) REFERENCES public.products(id) ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.bookings'::regclass
      AND conname = 'bookings_selected_tent_area_id_fkey'
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_selected_tent_area_id_fkey
      FOREIGN KEY (selected_tent_area_id) REFERENCES public.products(id) ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.bookings'::regclass
      AND conname = 'bookings_selected_photo_shoot_id_fkey'
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_selected_photo_shoot_id_fkey
      FOREIGN KEY (selected_photo_shoot_id) REFERENCES public.products(id) ON DELETE RESTRICT;
  END IF;
END $$;

create index if not exists products_category_idx on public.products(category, is_active);
create index if not exists bookings_date_time_idx on public.bookings(booking_date, booking_time);
create index if not exists bookings_selected_area_idx on public.bookings(selected_area_id);

insert into public.products (name, category, description, price, currency, is_active, is_bookable, is_free, capacity, item_order, size, entry_fee_excluded)
values
  ('White Swan & Heart-Shaped Pool', 'picnic_area', 'Bookable picnic area', 2500.00, 'ZAR', true, true, false, null, 1, null, false),
  ('Picnic - Braai Area', 'picnic_area', 'Bookable braai picnic area', 350.00, 'ZAR', true, true, false, null, 2, null, false),
  ('Ottoman Corner', 'picnic_area', 'Bookable seating area', 1500.00, 'ZAR', true, true, false, null, 3, null, false),
  ('6-Seater Picnic Table - Bench', 'equipment', 'Optional equipment', 70.00, 'ZAR', true, true, false, null, 4, null, false),
  ('Plastic Table', 'equipment', 'Optional equipment', 60.00, 'ZAR', true, true, false, null, 5, null, false),
  ('Plastic Chair', 'equipment', 'Optional equipment', 20.00, 'ZAR', true, true, false, null, 6, null, false),
  ('Golf Cart - 4-Seater with Driver', 'paid_activity', 'Paid activity service', 2000.00, 'ZAR', true, true, false, null, 7, null, false),
  ('Grass Area with Tent', 'tent_event_area', 'Tent area booking', 10000.00, 'ZAR', true, true, false, null, 8, null, false),
  ('Pangola Tent', 'tent_event_area', 'Tent option', 100.00, 'ZAR', true, true, false, null, 9, '3×3 m', false),
  ('Grass Area', 'tent_event_area', 'Tent area booking', 5500.00, 'ZAR', true, true, false, null, 10, null, false),
  ('Frame Tent - 6×9 m', 'tent_event_area', 'Frame tent size option', 2500.00, 'ZAR', true, true, false, null, 11, '6×9 m', false),
  ('Frame Tent - 5×15 m', 'tent_event_area', 'Frame tent size option', 4000.00, 'ZAR', true, true, false, null, 12, '5×15 m', false),
  ('Frame Tent - 9×16 m', 'tent_event_area', 'Frame tent size option', 5500.00, 'ZAR', true, true, false, null, 13, '9×16 m', false),
  ('Photo Shoot - 0–4 hours', 'photo_shoot', 'Photo shoot package', 600.00, 'ZAR', true, true, false, null, 14, '0–4 hours', true),
  ('Photo Shoot - Full Day', 'photo_shoot', 'Photo shoot package', 1200.00, 'ZAR', true, true, false, null, 15, 'Full Day', true),
  ('Animal Viewing', 'free_activity', 'Free activity', 0.00, 'ZAR', true, false, true, null, 16, null, false),
  ('Bike Riding (Own Bike)', 'free_activity', 'Free activity', 0.00, 'ZAR', true, false, true, null, 17, null, false),
  ('Yellow Wood Play Park', 'free_activity', 'Free activity', 0.00, 'ZAR', true, false, true, null, 18, null, false),
  ('Water Play Area', 'free_activity', 'Free activity', 0.00, 'ZAR', true, false, true, null, 19, null, false),
  ('Basketball Court', 'free_activity', 'Free activity', 0.00, 'ZAR', true, false, true, null, 20, null, false),
  ('Nature / Outdoor Areas', 'free_activity', 'Free activity', 0.00, 'ZAR', true, false, true, null, 21, null, false)
on conflict (name, category) do update set
  description = excluded.description,
  price = excluded.price,
  currency = excluded.currency,
  is_active = excluded.is_active,
  is_bookable = excluded.is_bookable,
  is_free = excluded.is_free,
  capacity = excluded.capacity,
  size = excluded.size,
  entry_fee_excluded = excluded.entry_fee_excluded,
  item_order = excluded.item_order,
  updated_at = now();

create or replace view public.bookable_products as
select
  id,
  name,
  category,
  description,
  price,
  currency,
  is_active,
  is_bookable,
  is_free,
  capacity,
  size,
  entry_fee_excluded,
  item_order,
  image_url,
  created_at,
  updated_at
from public.products
where is_active = true
  and category in ('picnic_area', 'equipment', 'paid_activity', 'tent_event_area', 'photo_shoot');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'products'
      AND policyname = 'public_products_select_active'
  ) THEN
    CREATE POLICY public_products_select_active
    ON public.products
    FOR SELECT
    TO public
    USING (is_active = true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bookings'
      AND policyname = 'public_bookings_insert_block'
  ) THEN
    CREATE POLICY public_bookings_insert_block
    ON public.bookings
    FOR INSERT
    TO public
    WITH CHECK (false);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bookings'
      AND policyname = 'public_bookings_select_block'
  ) THEN
    CREATE POLICY public_bookings_select_block
    ON public.bookings
    FOR SELECT
    TO public
    USING (false);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bookings'
      AND policyname = 'public_bookings_update_block'
  ) THEN
    CREATE POLICY public_bookings_update_block
    ON public.bookings
    FOR UPDATE
    TO public
    USING (false)
    WITH CHECK (false);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bookings'
      AND policyname = 'public_bookings_delete_block'
  ) THEN
    CREATE POLICY public_bookings_delete_block
    ON public.bookings
    FOR DELETE
    TO public
    USING (false);
  END IF;
END $$;

alter table public.products force row level security;
alter table public.bookings force row level security;
