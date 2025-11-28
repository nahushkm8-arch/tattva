
-- Add columns if they don't exist
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Function to update product rating and review count
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
DECLARE
    _product_id TEXT;
    _avg_rating NUMERIC;
    _count INTEGER;
BEGIN
    -- Determine product_id based on operation
    IF (TG_OP = 'DELETE') THEN
        _product_id := OLD.product_id;
    ELSE
        _product_id := NEW.product_id;
    END IF;

    -- Calculate new average and count
    SELECT COALESCE(AVG(rating), 0), COUNT(*)
    INTO _avg_rating, _count
    FROM public.reviews
    WHERE product_id = _product_id;

    -- Update products table
    UPDATE public.products
    SET rating = _avg_rating,
        reviews_count = _count
    WHERE id = _product_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_review_change ON public.reviews;
CREATE TRIGGER on_review_change
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_product_rating();
