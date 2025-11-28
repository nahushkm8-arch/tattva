-- Allow sellers to update the status of orders that contain their products
-- This is necessary so sellers can mark items as Shipped/Delivered.

create policy "Sellers can update orders containing their products" on public.orders
for update using (
  exists (
    select 1 from public.order_items
    join public.products on products.id = order_items.product_id
    where order_items.order_id = orders.id
    and products.seller_id = auth.uid()
  )
);
