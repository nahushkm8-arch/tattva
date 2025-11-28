
-- Add media column to products table to store multiple images and videos
-- Format: JSONB array of objects: [{ type: 'image' | 'video', url: 'string' }]
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS media JSONB DEFAULT '[]'::jsonb;

-- Optional: Migrate existing 'image' to 'media' if media is empty
-- This ensures backward compatibility while moving forward
UPDATE public.products
SET media = jsonb_build_array(
    jsonb_build_object('type', 'image', 'url', image)
)
WHERE media IS NULL OR jsonb_array_length(media) = 0;
