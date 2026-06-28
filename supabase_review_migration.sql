-- ─── RESTAURANT REVIEWS SCHEMA MIGRATION ───
-- Run this SQL in your Supabase SQL Editor to enable persistent reviews storing.

CREATE TABLE IF NOT EXISTS public.restaurant_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.restaurant_reviews ENABLE ROW LEVEL SECURITY;

-- Set security policies
-- 1. Allow public read access to see restaurant feedback
CREATE POLICY "Allow public read access to reviews" 
ON public.restaurant_reviews FOR SELECT 
USING (true);

-- 2. Allow public inserts so customers can submit reviews
CREATE POLICY "Allow public insert access to reviews" 
ON public.restaurant_reviews FOR INSERT 
WITH CHECK (true);
