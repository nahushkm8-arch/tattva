-- Create Reviews Table (Fixed Types)
-- products.id is TEXT, so reviews.product_id must be TEXT.

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE, -- Changed from UUID to TEXT
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Public can view reviews
CREATE POLICY "Public can view reviews" ON public.reviews
FOR SELECT USING (true);

-- 2. Authenticated users can create reviews
CREATE POLICY "Users can create reviews" ON public.reviews
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Users can update/delete their own reviews
CREATE POLICY "Users can update own reviews" ON public.reviews
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON public.reviews
FOR DELETE USING (auth.uid() = user_id);
