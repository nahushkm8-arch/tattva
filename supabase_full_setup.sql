-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Extends auth.users)
-- This table is automatically populated via a trigger when a new user signs up.
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  first_name text,
  last_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. ORDERS TABLE
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text check (status in ('Pending', 'Processing', 'In Transit', 'Delivered', 'Cancelled')) default 'Pending',
  total_amount numeric(10, 2) not null
);

-- 3. ORDER ITEMS TABLE
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders not null,
  product_id text not null,
  quantity integer not null default 1,
  price numeric(10, 2) not null
);

-- 4. ADDRESSES TABLE
create table public.addresses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  label text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  zip_code text not null,
  country text not null,
  phone text,
  is_default boolean default false
);

-- 5. WISHLIST TABLE
create table public.wishlist (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  product_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id)
);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.addresses enable row level security;
alter table public.wishlist enable row level security;

-- Profiles Policies
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- Orders Policies
create policy "Users can view their own orders" on public.orders for select using (auth.uid() = user_id);

-- Order Items Policies
create policy "Users can view their own order items" on public.order_items for select using (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));

-- Addresses Policies
create policy "Users can view their own addresses" on public.addresses for select using (auth.uid() = user_id);
create policy "Users can insert their own addresses" on public.addresses for insert with check (auth.uid() = user_id);
create policy "Users can update their own addresses" on public.addresses for update using (auth.uid() = user_id);
create policy "Users can delete their own addresses" on public.addresses for delete using (auth.uid() = user_id);

-- Wishlist Policies
create policy "Users can view their own wishlist" on public.wishlist for select using (auth.uid() = user_id);
create policy "Users can insert their own wishlist" on public.wishlist for insert with check (auth.uid() = user_id);
create policy "Users can delete their own wishlist" on public.wishlist for delete using (auth.uid() = user_id);

-- 7. AUTOMATIC PROFILE CREATION TRIGGER
-- This function creates a profile entry whenever a new user is created in auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function on new user creation
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
