-- supabase/migrations/20260531000000_create_urbateam_schema.sql
-- Urbateam Database Schema for Supabase

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table ARTICLES (Blog posts)
CREATE TABLE IF NOT EXISTS articles (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft')),
    sort INTEGER,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    featured_image TEXT,
    author TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    category TEXT,
    date_published TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table PROJETS (Portfolio cases with geospatial coordinates)
CREATE TABLE IF NOT EXISTS projets (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft')),
    sort INTEGER,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    category TEXT,
    client TEXT,
    missions JSONB DEFAULT '[]'::jsonb,
    technical_details TEXT,
    image_before TEXT,
    image_after TEXT,
    images_gallery JSONB DEFAULT '[]'::jsonb,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table CLIENTS (Logos and brand references)
CREATE TABLE IF NOT EXISTS clients (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft')),
    sort INTEGER,
    name TEXT NOT NULL,
    logo TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table PARTENAIRES (Professional ecosystem)
CREATE TABLE IF NOT EXISTS partenaires (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft')),
    sort INTEGER,
    name TEXT NOT NULL,
    logo TEXT,
    role TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table FAQ (Multilingual Q&A)
CREATE TABLE IF NOT EXISTS faq (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft')),
    sort INTEGER,
    question_fr TEXT NOT NULL,
    answer_fr TEXT,
    question_en TEXT,
    answer_en TEXT,
    question_br TEXT,
    answer_br TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Table GLOSSAIRE (Definitions of land terms)
CREATE TABLE IF NOT EXISTS glossaire (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft')),
    sort INTEGER,
    term_fr TEXT NOT NULL,
    definition_fr TEXT,
    term_en TEXT,
    definition_en TEXT,
    term_br TEXT,
    definition_br TEXT,
    related_expertise TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Table TEAM_HEADER (Header photo and intro)
CREATE TABLE IF NOT EXISTS team_header (
    id INT PRIMARY KEY DEFAULT 1,
    title_fr TEXT,
    subtitle_fr TEXT,
    title_en TEXT,
    subtitle_en TEXT,
    title_br TEXT,
    subtitle_br TEXT,
    team_photo TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT only_one_row CHECK (id = 1)
);

-- 8. Table TEAM_MEMBERS (Team members and specialists)
CREATE TABLE IF NOT EXISTS team_members (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft')),
    sort INTEGER,
    slug TEXT UNIQUE,
    image TEXT,
    linkedin TEXT,
    generic BOOLEAN DEFAULT FALSE,
    email TEXT,
    phone TEXT,
    name_fr TEXT,
    role_fr TEXT,
    desc_fr TEXT,
    name_en TEXT,
    role_en TEXT,
    desc_en TEXT,
    name_br TEXT,
    role_br TEXT,
    desc_br TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Table SOCIAL_POSTS (Instagram posts feed)
CREATE TABLE IF NOT EXISTS social_posts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft')),
    sort INTEGER,
    url TEXT NOT NULL,
    caption TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
-- We make the reading public for simplicity, and keep write operations private to authenticated admin users (Supabase Auth).

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projets ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE partenaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE glossaire ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_header ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

-- Create Public Read Policies
CREATE POLICY "Allow public read access on articles" ON articles FOR SELECT USING (true);
CREATE POLICY "Allow public read access on projets" ON projets FOR SELECT USING (true);
CREATE POLICY "Allow public read access on clients" ON clients FOR SELECT USING (true);
CREATE POLICY "Allow public read access on partenaires" ON partenaires FOR SELECT USING (true);
CREATE POLICY "Allow public read access on faq" ON faq FOR SELECT USING (true);
CREATE POLICY "Allow public read access on glossaire" ON glossaire FOR SELECT USING (true);
CREATE POLICY "Allow public read access on team_header" ON team_header FOR SELECT USING (true);
CREATE POLICY "Allow public read access on team_members" ON team_members FOR SELECT USING (true);
CREATE POLICY "Allow public read access on social_posts" ON social_posts FOR SELECT USING (true);

-- Create Write/Modify Policies for Authenticated Admin Users
CREATE POLICY "Allow all actions for authenticated users on articles" ON articles FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users on projets" ON projets FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users on clients" ON clients FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users on partenaires" ON partenaires FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users on faq" ON faq FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users on glossaire" ON glossaire FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users on team_header" ON team_header FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users on team_members" ON team_members FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users on social_posts" ON social_posts FOR ALL TO authenticated USING (true);
