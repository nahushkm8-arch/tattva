-- SELLER FEATURES SETUP
-- 1. Add seller_id to products
-- 2. Update RLS for products to allow sellers to manage their own products
-- 3. Create a view or policy for sellers to see orders containing their products

-- 1. Add seller_id to products table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'seller_id') THEN
        ALTER TABLE public.products ADD COLUMN seller_id uuid references auth.users(id);
    END IF;
END $$;

-- 2. Update Products RLS
-- Allow anyone to view products (already exists, but good to reaffirm)
-- Allow authenticated users to INSERT products (they become the seller)
create policy "Users can create their own products" on public.products
for insert with check (auth.uid() = seller_id);

-- Allow sellers to UPDATE their own products
create policy "Sellers can update own products" on public.products
for update using (auth.uid() = seller_id);

-- Allow sellers to DELETE their own products
create policy "Sellers can delete own products" on public.products
for delete using (auth.uid() = seller_id);

-- 3. Helper function to get seller orders
-- This is complex because orders are linked to users (buyers), not directly to sellers.
-- Sellers need to see order_items for their products.
-- We'll create a secure view or just handle it via RLS on order_items if possible, 
-- but order_items RLS is currently "Users can view own order items" (as buyers).
-- We need to add "Sellers can view order items for their products".

create policy "Sellers can view order items for their products" on public.order_items
for select using (
  exists (
    select 1 from public.products
    where products.id = order_items.product_id
    and products.seller_id = auth.uid()
  )
);
