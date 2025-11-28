-- COMPREHENSIVE SELLER PERMISSIONS FIX
-- Run this entire script in the Supabase SQL Editor to fix all permission issues.

-- 1. Enable RLS on all tables (if not already enabled)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 2. Clean up existing policies to avoid conflicts
DROP POLICY IF EXISTS "Sellers can view order items for their products" ON public.order_items;
DROP POLICY IF EXISTS "Sellers can update orders containing their products" ON public.orders;
DROP POLICY IF EXISTS "Sellers can view orders containing their products" ON public.orders;

-- 3. Policy: Sellers can VIEW order items for their products
CREATE POLICY "Sellers can view order items for their products" ON public.order_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.products
    WHERE products.id = order_items.product_id
    AND products.seller_id = auth.uid()
  )
);

-- 4. Policy: Sellers can VIEW orders containing their products
-- (This ensures the 'orders' part of the join works correctly)
CREATE POLICY "Sellers can view orders containing their products" ON public.orders
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.order_items
    JOIN public.products ON products.id = order_items.product_id
    WHERE order_items.order_id = orders.id
    AND products.seller_id = auth.uid()
  )
);

-- 5. Policy: Sellers can UPDATE orders containing their products
CREATE POLICY "Sellers can update orders containing their products" ON public.orders
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.order_items
    JOIN public.products ON products.id = order_items.product_id
    WHERE order_items.order_id = orders.id
    AND products.seller_id = auth.uid()
  )
);

-- 6. Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT SELECT, INSERT ON public.order_items TO authenticated;
