-- FIX ORDER PERMISSIONS SCRIPT
-- Run this to allow users to place orders (INSERT permissions were missing).

-- 1. Allow Users to Create Orders
create policy "Users can create own orders" on public.orders 
for insert with check (auth.uid() = user_id);

-- 2. Allow Users to Add Items to their Orders
create policy "Users can create own order items" on public.order_items 
for insert with check (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
    and orders.user_id = auth.uid()
  )
);
