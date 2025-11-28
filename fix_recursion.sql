-- FIX INFINITE RECURSION IN RLS
-- We use a SECURITY DEFINER function to check seller permissions.
-- This bypasses RLS on the dependent tables inside the function, breaking the loop.

-- 1. Create the helper function
CREATE OR REPLACE FUNCTION public.fn_is_seller_for_order(_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.order_items oi
    JOIN public.products p ON p.id = oi.product_id
    WHERE oi.order_id = _order_id
    AND p.seller_id = auth.uid()
  );
END;
$$;

-- 2. Update Orders Policy for Sellers
DROP POLICY IF EXISTS "Sellers can view orders containing their products" ON public.orders;
CREATE POLICY "Sellers can view orders containing their products" ON public.orders
FOR SELECT USING (
  public.fn_is_seller_for_order(id)
);

DROP POLICY IF EXISTS "Sellers can update orders containing their products" ON public.orders;
CREATE POLICY "Sellers can update orders containing their products" ON public.orders
FOR UPDATE USING (
  public.fn_is_seller_for_order(id)
);

-- 3. Ensure Buyers can still see their orders (No change needed, but good to verify)
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders
FOR SELECT USING (auth.uid() = user_id);

-- 4. Ensure Buyers can see their order items (This was the other half of the loop)
-- Since the Seller policy on 'orders' no longer queries 'order_items' directly (it uses the function),
-- the loop should be broken.
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
CREATE POLICY "Users can view their own order items" ON public.order_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);
