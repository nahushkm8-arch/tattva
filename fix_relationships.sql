-- Fix missing Foreign Key relationships for PostgREST
-- This ensures Supabase knows how to join order_items with products and orders.

-- 1. Fix order_items -> products relationship
ALTER TABLE public.order_items
DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

ALTER TABLE public.order_items
ADD CONSTRAINT order_items_product_id_fkey
FOREIGN KEY (product_id)
REFERENCES public.products(id)
ON DELETE CASCADE;

-- 2. Fix order_items -> orders relationship
ALTER TABLE public.order_items
DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;

ALTER TABLE public.order_items
ADD CONSTRAINT order_items_order_id_fkey
FOREIGN KEY (order_id)
REFERENCES public.orders(id)
ON DELETE CASCADE;

-- 3. (Optional) Ensure products have a seller_id (if any are missing, assign to current user or handle manually)
-- This is just a safety check, actual assignment should be done by the app or manually if needed.
