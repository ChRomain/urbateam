-- supabase/migrations/20260619000006_create_site_texts_table.sql
-- Urbateam Custom Site Texts and Translations Overrides

CREATE TABLE IF NOT EXISTS site_texts (
    key TEXT PRIMARY KEY,
    fr TEXT NOT NULL,
    en TEXT,
    br TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE site_texts ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policy
CREATE POLICY "Allow public read access on site_texts" ON site_texts
    FOR SELECT USING (true);

-- 2. Admin Write Policy
CREATE POLICY "Allow admin write access on site_texts" ON site_texts 
    FOR ALL TO authenticated 
    USING (auth.jwt() ->> 'email' = 'admin@urbateam.fr')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@urbateam.fr');
