-- 1. Clean up old policies
DROP POLICY IF EXISTS "Sellers can view order items for their products" ON public.order_items;
DROP POLICY IF EXISTS "Sellers can update orders containing their products" ON public.orders;
DROP POLICY IF EXISTS "Sellers can view orders containing their products" ON public.orders;

-- 2. Allow Sellers to VIEW orders (Critical for Dashboard)
CREATE POLICY "Sellers can view orders containing their products" ON public.orders
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.order_items
    JOIN public.products ON products.id = order_items.product_id
    WHERE order_items.order_id = orders.id
    AND products.seller_id = auth.uid()
  )
);

-- 3. Allow Sellers to UPDATE orders
CREATE POLICY "Sellers can update orders containing their products" ON public.orders
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.order_items
    JOIN public.products ON products.id = order_items.product_id
    WHERE order_items.order_id = orders.id
    AND products.seller_id = auth.uid()
  )
);

-- 4. Allow Sellers to VIEW order items
CREATE POLICY "Sellers can view order items for their products" ON public.order_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.products
    WHERE products.id = order_items.product_id
    AND products.seller_id = auth.uid()
  )
);
