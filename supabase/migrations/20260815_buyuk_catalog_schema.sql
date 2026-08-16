create extension if not exists pgcrypto;

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('picnic_area', 'equipment', 'free_activity', 'paid_activity', 'tent_event_area', 'photo_shoot')),
  description text,
  price numeric(12,2) not null default 0,
  currency text not null default 'ZAR',
  is_active boolean not null default true,
  is_bookable boolean not null default false,
  is_free boolean not null default false,
  size text,
  entry_fee_excluded boolean not null default false,
  item_order integer not null default 0,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name, category)
);

alter table products enable row level security;

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone_number text not null,
  email text not null,
  booking_date date not null,
  booking_time text not null,
  adults integer not null default 0,
  children_3_plus integer not null default 0,
  children_under_3 integer not null default 0,
  selected_area_id uuid references products(id),
  selected_equipment_ids text[] not null default '{}',
  selected_paid_activity_id uuid references products(id),
  selected_tent_area_id uuid references products(id),
  selected_photo_shoot_id uuid references products(id),
  entrance_fee_total numeric(12,2) not null default 0,
  additional_total numeric(12,2) not null default 0,
  total_price numeric(12,2) not null default 0,
  booking_status text not null default 'pending' check (booking_status in ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'refunded')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table bookings enable row level security;

create index if not exists products_category_idx on products(category, is_active);
create index if not exists bookings_date_area_idx on bookings(booking_date, booking_time, selected_area_id);

insert into products (name, category, description, price, is_active, is_bookable, is_free, item_order, size, entry_fee_excluded)
values
  ('White Swan & Heart-Shaped Pool', 'picnic_area', 'Bookable picnic area', 2500.00, true, true, false, 1, null, false),
  ('Picnic - Braai Area', 'picnic_area', 'Bookable braai picnic area', 350.00, true, true, false, 2, null, false),
  ('Ottoman Corner', 'picnic_area', 'Bookable seating area', 1500.00, true, true, false, 3, null, false),
  ('6-Seater Picnic Table - Bench', 'equipment', 'Optional equipment', 70.00, true, true, false, 4, null, false),
  ('Plastic Table', 'equipment', 'Optional equipment', 60.00, true, true, false, 5, null, false),
  ('Plastic Chair', 'equipment', 'Optional equipment', 20.00, true, true, false, 6, null, false),
  ('Animal Viewing', 'free_activity', 'Free activity', 0.00, true, false, true, 7, null, false),
  ('Bike Riding (Own Bike)', 'free_activity', 'Free activity', 0.00, true, false, true, 8, null, false),
  ('Yellow Wood Play Park', 'free_activity', 'Free activity', 0.00, true, false, true, 9, null, false),
  ('Water Play Area', 'free_activity', 'Free activity', 0.00, true, false, true, 10, null, false),
  ('Basketball Court', 'free_activity', 'Free activity', 0.00, true, false, true, 11, null, false),
  ('Nature / Outdoor Areas', 'free_activity', 'Free activity', 0.00, true, false, true, 12, null, false),
  ('Golf Cart - 4-Seater with Driver', 'paid_activity', 'Paid activity service', 2000.00, true, true, false, 13, null, false),
  ('Grass Area with Tent', 'tent_event_area', 'Tent area booking', 10000.00, true, true, false, 14, null, false),
  ('Pangola Tent', 'tent_event_area', 'Tent option', 100.00, true, true, false, 15, '3×3 m', false),
  ('Grass Area', 'tent_event_area', 'Tent area booking', 5500.00, true, true, false, 16, null, false),
  ('Frame Tent - 6×9 m', 'tent_event_area', 'Frame tent size option', 2500.00, true, true, false, 17, '6×9 m', false),
  ('Frame Tent - 5×15 m', 'tent_event_area', 'Frame tent size option', 4000.00, true, true, false, 18, '5×15 m', false),
  ('Frame Tent - 9×16 m', 'tent_event_area', 'Frame tent size option', 5500.00, true, true, false, 19, '9×16 m', false),
  ('Photo Shoot - 0–4 hours', 'photo_shoot', 'Photo shoot package', 600.00, true, true, false, 20, '0–4 hours', true),
  ('Photo Shoot - Full Day', 'photo_shoot', 'Photo shoot package', 1200.00, true, true, false, 21, 'Full Day', true)
on conflict (name, category) do update set
  description = excluded.description,
  price = excluded.price,
  currency = excluded.currency,
  is_active = excluded.is_active,
  is_bookable = excluded.is_bookable,
  is_free = excluded.is_free,
  size = excluded.size,
  entry_fee_excluded = excluded.entry_fee_excluded,
  item_order = excluded.item_order,
  updated_at = now();

create or replace view public.bookable_products as
select *
from public.products
where is_active = true and (
  category in ('picnic_area', 'equipment', 'paid_activity', 'tent_event_area', 'photo_shoot')
  or (category = 'free_activity' and is_free = true)
);
