-- FIX VISIBILITY ISSUES
-- The previous policies might have failed if the 'products' table wasn't explicitly readable.

-- 1. Ensure Products are readable by everyone (it's a marketplace, so this is standard)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products
FOR SELECT USING (true);

-- 2. Simplify Order Items Policy
-- Sellers need to see order items linked to their products.
DROP POLICY IF EXISTS "Sellers can view order items for their products" ON public.order_items;
CREATE POLICY "Sellers can view order items for their products" ON public.order_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.products
    WHERE products.id = order_items.product_id
    AND products.seller_id = auth.uid()
  )
);

-- 3. Simplify Orders Policy
-- Sellers need to see orders that have their items.
DROP POLICY IF EXISTS "Sellers can view orders containing their products" ON public.orders;
CREATE POLICY "Sellers can view orders containing their products" ON public.orders
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.order_items
    WHERE order_items.order_id = orders.id
    AND EXISTS (
        SELECT 1 FROM public.products
        WHERE products.id = order_items.product_id
        AND products.seller_id = auth.uid()
    )
  )
);

-- 4. Re-apply Update Policy just in case
DROP POLICY IF EXISTS "Sellers can update orders containing their products" ON public.orders;
CREATE POLICY "Sellers can update orders containing their products" ON public.orders
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.order_items
    JOIN public.products ON products.id = order_items.product_id
    WHERE order_items.order_id = orders.id
    AND products.seller_id = auth.uid()
  )
);
