-- supabase/migrations/20260603000005_add_in_carousel_to_clients.sql
-- Add in_carousel column to track which clients to display in the homepage slider

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS in_carousel BOOLEAN DEFAULT FALSE;

-- Set existing clients to be in the carousel by default
UPDATE public.clients SET in_carousel = TRUE;
