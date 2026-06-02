-- supabase/migrations/20260602000004_create_eco_diagnostics_table.sql
-- Table pour stocker les prospects générés par l'Éco-Diagnostic Foncier

CREATE TABLE IF NOT EXISTS public.eco_diagnostics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    address TEXT NOT NULL,
    parcel_ref TEXT,
    surface TEXT,
    overall_score INTEGER,
    scores JSONB, -- Pour stocker les scores détaillés (Sol, Eau, Climat, Règles, Foncier)
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT,
    client_message TEXT,
    status TEXT DEFAULT 'new' NOT NULL
);

-- Activation de RLS (Row Level Security)
ALTER TABLE public.eco_diagnostics ENABLE ROW LEVEL SECURITY;

-- Politique d'insertion publique (permet à n'importe quel prospect de soumettre sa demande)
CREATE POLICY "Allow public inserts on eco_diagnostics" 
ON public.eco_diagnostics 
FOR INSERT 
WITH CHECK (true);

-- Politiques administratives (lecture/mise à jour/suppression uniquement pour les admins connectés)
CREATE POLICY "Allow authenticated select on eco_diagnostics" 
ON public.eco_diagnostics 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated update on eco_diagnostics" 
ON public.eco_diagnostics 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated delete on eco_diagnostics" 
ON public.eco_diagnostics 
FOR DELETE 
TO authenticated 
USING (true);
