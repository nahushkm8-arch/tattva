-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Orders Table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text check (status in ('Pending', 'Processing', 'In Transit', 'Delivered', 'Cancelled')) default 'Pending',
  total_amount numeric(10, 2) not null
);

-- Order Items Table
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders not null,
  product_id text not null, -- Assuming product IDs are strings from your data.ts, or uuid if you have a products table
  quantity integer not null default 1,
  price numeric(10, 2) not null
);

-- Addresses Table
create table public.addresses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  label text not null, -- e.g., 'Home', 'Office'
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  zip_code text not null,
  country text not null,
  phone text,
  is_default boolean default false
);

-- Wishlist Table
create table public.wishlist (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  product_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id)
);

-- RLS Policies (Optional but recommended)
alter table public.orders enable row level security;
create policy "Users can view their own orders" on public.orders for select using (auth.uid() = user_id);

alter table public.order_items enable row level security;
create policy "Users can view their own order items" on public.order_items for select using (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));

alter table public.addresses enable row level security;
create policy "Users can view their own addresses" on public.addresses for select using (auth.uid() = user_id);
create policy "Users can insert their own addresses" on public.addresses for insert with check (auth.uid() = user_id);
create policy "Users can update their own addresses" on public.addresses for update using (auth.uid() = user_id);
create policy "Users can delete their own addresses" on public.addresses for delete using (auth.uid() = user_id);

alter table public.wishlist enable row level security;
create policy "Users can view their own wishlist" on public.wishlist for select using (auth.uid() = user_id);
create policy "Users can insert their own wishlist" on public.wishlist for insert with check (auth.uid() = user_id);
create policy "Users can delete their own wishlist" on public.wishlist for delete using (auth.uid() = user_id);
