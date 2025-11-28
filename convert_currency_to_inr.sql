-- SQL Script to convert all monetary values from USD to INR
-- Conversion Rate used: 1 USD = 84 INR

BEGIN;

-- 1. Update Products Table
-- Convert price and original_price
UPDATE public.products
SET price = ROUND((price * 84)::numeric, 2),
    original_price = ROUND((original_price * 84)::numeric, 2);

-- 2. Update Orders Table
-- Convert total_amount for historical consistency
UPDATE public.orders
SET total_amount = ROUND((total_amount * 84)::numeric, 2);

-- 3. Update Order Items Table
-- Convert price snapshot for historical consistency
UPDATE public.order_items
SET price = ROUND((price * 84)::numeric, 2);

COMMIT;

-- Output success message (optional, depends on client)
-- SELECT 'Currency conversion completed successfully.' as status;
