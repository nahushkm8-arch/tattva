-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- CART ITEMS TABLE
-- Stores items in the user's shopping cart.
-- This allows the cart to persist across devices and sessions.
create table public.cart_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  product_id text references public.products(id) not null, -- References the products table
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id) -- Ensures a product appears only once per user's cart (update quantity instead)
);

-- ROW LEVEL SECURITY (RLS)
-- Enable RLS to ensure users can only access their own cart items
alter table public.cart_items enable row level security;

-- Policies
create policy "Users can view their own cart items" 
  on public.cart_items for select 
  using (auth.uid() = user_id);

create policy "Users can add items to their own cart" 
  on public.cart_items for insert 
  with check (auth.uid() = user_id);

create policy "Users can update quantity of their own cart items" 
  on public.cart_items for update 
  using (auth.uid() = user_id);

create policy "Users can remove items from their own cart" 
  on public.cart_items for delete 
  using (auth.uid() = user_id);
