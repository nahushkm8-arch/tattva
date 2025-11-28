-- POPULATE SAMPLE DATA SCRIPT
-- This script finds the most recent user in your application and adds sample data 
-- for Addresses, Orders, Cart, and Wishlist so you can see them in the database dashboard.

DO $$
DECLARE
  target_user_id uuid;
BEGIN
  -- 1. Get the most recently created user
  SELECT id INTO target_user_id FROM auth.users ORDER BY created_at DESC LIMIT 1;

  -- 2. Check if a user exists
  IF target_user_id IS NOT NULL THEN
    
    -- Add Sample Address
    INSERT INTO public.addresses (user_id, label, address_line1, city, state, zip_code, country, phone, is_default)
    VALUES (target_user_id, 'Home', '123 Sample Street', 'New York', 'NY', '10001', 'United States', '555-0123', true);

    -- Add Sample Wishlist Items (Product IDs 1 and 3)
    INSERT INTO public.wishlist (user_id, product_id)
    VALUES (target_user_id, '1')
    ON CONFLICT DO NOTHING;
    
    INSERT INTO public.wishlist (user_id, product_id)
    VALUES (target_user_id, '3')
    ON CONFLICT DO NOTHING;

    -- Add Sample Cart Item (Product ID 2)
    INSERT INTO public.cart_items (user_id, product_id, quantity)
    VALUES (target_user_id, '2', 1)
    ON CONFLICT DO NOTHING;

    -- Add Sample Order (Delivered)
    WITH new_order AS (
      INSERT INTO public.orders (user_id, status, total_amount)
      VALUES (target_user_id, 'Delivered', 179.98)
      RETURNING id
    )
    -- Add Items to that Order
    INSERT INTO public.order_items (order_id, product_id, quantity, price)
    SELECT id, '1', 1, 129.99 FROM new_order
    UNION ALL
    SELECT id, '4', 1, 49.99 FROM new_order;

    RAISE NOTICE 'Sample data added for user %', target_user_id;

  ELSE
    -- No user found
    RAISE NOTICE 'No users found! Please Sign Up on your website first, then run this script again.';
  END IF;
END $$;
