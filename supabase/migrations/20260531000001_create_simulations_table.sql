-- supabase/migrations/20260531000001_create_simulations_table.sql
-- Table pour stocker les prospects générés par le Simulateur de Division Foncière

CREATE TABLE IF NOT EXISTS public.simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    address TEXT NOT NULL,
    parcel_ref TEXT,
    total_surface TEXT,
    lot_a_surface TEXT,
    lot_b_surface TEXT,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT,
    client_message TEXT,
    status TEXT DEFAULT 'new' NOT NULL
);

-- Activation de RLS (Row Level Security)
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;

-- Politique d'insertion publique (permet à n'importe quel prospect de soumettre sa simulation)
CREATE POLICY "Allow public inserts on simulations" 
ON public.simulations 
FOR INSERT 
WITH CHECK (true);

-- Politiques administratives (lecture/mise à jour/suppression uniquement pour les admins connectés)
CREATE POLICY "Allow authenticated select on simulations" 
ON public.simulations 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated update on simulations" 
ON public.simulations 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated delete on simulations" 
ON public.simulations 
FOR DELETE 
TO authenticated 
USING (true);
