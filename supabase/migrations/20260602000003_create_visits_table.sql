-- supabase/migrations/20260602000003_create_visits_table.sql
-- Create table to track live user visits in real-time

CREATE TABLE IF NOT EXISTS public.visits (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    path TEXT NOT NULL,
    is_article BOOLEAN DEFAULT FALSE,
    device TEXT DEFAULT 'Desktop',
    browser TEXT DEFAULT 'Autre',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

-- 1. Policy to allow anonymous visitors to log page visits
CREATE POLICY "Allow public insert on visits" ON public.visits
    FOR INSERT WITH CHECK (true);

-- 2. Policy to restrict select queries to admin@urbateam.fr users
CREATE POLICY "Allow admin read access on visits" ON public.visits
    FOR SELECT TO authenticated
    USING (auth.jwt() ->> 'email' = 'admin@urbateam.fr');
