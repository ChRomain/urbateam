-- supabase/migrations/20260531000002_secure_rls_policies.sql
-- Sécurisation des politiques RLS pour la mise en production

-- 1. Nettoyage des anciennes politiques permissives
DROP POLICY IF EXISTS "Allow all actions for authenticated users on articles" ON articles;
DROP POLICY IF EXISTS "Allow all actions for authenticated users on projets" ON projets;
DROP POLICY IF EXISTS "Allow all actions for authenticated users on clients" ON clients;
DROP POLICY IF EXISTS "Allow all actions for authenticated users on partenaires" ON partenaires;
DROP POLICY IF EXISTS "Allow all actions for authenticated users on faq" ON faq;
DROP POLICY IF EXISTS "Allow all actions for authenticated users on glossaire" ON glossaire;
DROP POLICY IF EXISTS "Allow all actions for authenticated users on team_header" ON team_header;
DROP POLICY IF EXISTS "Allow all actions for authenticated users on team_members" ON team_members;
DROP POLICY IF EXISTS "Allow all actions for authenticated users on social_posts" ON social_posts;

DROP POLICY IF EXISTS "Allow authenticated select on simulations" ON public.simulations;
DROP POLICY IF EXISTS "Allow authenticated update on simulations" ON public.simulations;
DROP POLICY IF EXISTS "Allow authenticated delete on simulations" ON public.simulations;

-- 2. Création de politiques basées sur l'adresse email de l'administrateur
CREATE POLICY "Allow admin write access on articles" ON articles 
    FOR ALL TO authenticated 
    USING (auth.jwt() ->> 'email' = 'admin@urbateam.fr')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@urbateam.fr');

CREATE POLICY "Allow admin write access on projets" ON projets 
    FOR ALL TO authenticated 
    USING (auth.jwt() ->> 'email' = 'admin@urbateam.fr')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@urbateam.fr');

CREATE POLICY "Allow admin write access on clients" ON clients 
    FOR ALL TO authenticated 
    USING (auth.jwt() ->> 'email' = 'admin@urbateam.fr')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@urbateam.fr');

CREATE POLICY "Allow admin write access on partenaires" ON partenaires 
    FOR ALL TO authenticated 
    USING (auth.jwt() ->> 'email' = 'admin@urbateam.fr')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@urbateam.fr');

CREATE POLICY "Allow admin write access on faq" ON faq 
    FOR ALL TO authenticated 
    USING (auth.jwt() ->> 'email' = 'admin@urbateam.fr')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@urbateam.fr');

CREATE POLICY "Allow admin write access on glossaire" ON glossaire 
    FOR ALL TO authenticated 
    USING (auth.jwt() ->> 'email' = 'admin@urbateam.fr')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@urbateam.fr');

CREATE POLICY "Allow admin write access on team_header" ON team_header 
    FOR ALL TO authenticated 
    USING (auth.jwt() ->> 'email' = 'admin@urbateam.fr')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@urbateam.fr');

CREATE POLICY "Allow admin write access on team_members" ON team_members 
    FOR ALL TO authenticated 
    USING (auth.jwt() ->> 'email' = 'admin@urbateam.fr')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@urbateam.fr');

CREATE POLICY "Allow admin write access on social_posts" ON social_posts 
    FOR ALL TO authenticated 
    USING (auth.jwt() ->> 'email' = 'admin@urbateam.fr')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@urbateam.fr');

-- 3. Sécurisation stricte des simulations (leads clients)
CREATE POLICY "Allow admin full access on simulations" ON public.simulations 
    FOR ALL TO authenticated 
    USING (auth.jwt() ->> 'email' = 'admin@urbateam.fr')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@urbateam.fr');
