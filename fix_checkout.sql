-- FIX CHECKOUT PERMISSIONS
-- Ensure buyers can actually place orders!

-- 1. Allow Users to Create Orders
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
CREATE POLICY "Users can create their own orders" ON public.orders
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. Allow Users to View their own orders (needed for the insert->select return)
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders
FOR SELECT USING (auth.uid() = user_id);

-- 3. Allow Users to Create Order Items
-- They need to be able to insert items for orders they just created.
DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;
CREATE POLICY "Users can create order items" ON public.order_items
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- 4. Allow Users to View their own order items
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
CREATE POLICY "Users can view their own order items" ON public.order_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);
