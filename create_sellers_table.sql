-- Create a 'sellers' table to store store-specific profile information.
-- This table extends the auth.users table (1:1 relationship).

CREATE TABLE IF NOT EXISTS public.sellers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name TEXT,
  store_description TEXT,
  support_email TEXT,
  logo_url TEXT,
  banner_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. Public can view all sellers (e.g. for a "Store Profile" page)
CREATE POLICY "Public can view sellers" ON public.sellers
FOR SELECT USING (true);

-- 2. Users can insert their own seller profile
CREATE POLICY "Users can create their own seller profile" ON public.sellers
FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Sellers can update their own profile
CREATE POLICY "Sellers can update their own profile" ON public.sellers
FOR UPDATE USING (auth.uid() = id);

-- 4. Sellers can delete their own profile
CREATE POLICY "Sellers can delete their own profile" ON public.sellers
FOR DELETE USING (auth.uid() = id);

-- Optional: Auto-create seller profiles for existing users who have listed products
-- This is a migration step to ensure existing sellers have a profile row.
INSERT INTO public.sellers (id, store_name, support_email)
SELECT DISTINCT seller_id, 'My Store', 'contact@example.com'
FROM public.products
WHERE seller_id IS NOT NULL
ON CONFLICT (id) DO NOTHING;
