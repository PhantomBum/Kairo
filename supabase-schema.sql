-- ============================================================
-- KAIRO — Supabase Schema
-- Run this in Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. Main entities table (stores all app data)
CREATE TABLE IF NOT EXISTS public.entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_date TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_entities_type ON public.entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_entities_created_by ON public.entities(created_by);
CREATE INDEX IF NOT EXISTS idx_entities_created_date ON public.entities(created_date DESC);
CREATE INDEX IF NOT EXISTS idx_entities_data ON public.entities USING GIN(data);

-- 3. Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_date = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_date ON public.entities;
CREATE TRIGGER trigger_update_date
  BEFORE UPDATE ON public.entities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_date();

-- 4. Enable Row Level Security
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all entities (servers, messages, etc. are public)
CREATE POLICY "Authenticated users can read all entities"
  ON public.entities
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert entities
CREATE POLICY "Authenticated users can insert entities"
  ON public.entities
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update entities
CREATE POLICY "Authenticated users can update entities"
  ON public.entities
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete entities
CREATE POLICY "Authenticated users can delete entities"
  ON public.entities
  FOR DELETE
  TO authenticated
  USING (true);

-- Allow anonymous read access for public pages (invite, status, etc.)
CREATE POLICY "Anonymous can read public entities"
  ON public.entities
  FOR SELECT
  TO anon
  USING (entity_type IN ('Server', 'UserProfile', 'Channel', 'Category', 'Role'));

-- 5. Enable Realtime on the entities table
ALTER PUBLICATION supabase_realtime ADD TABLE public.entities;

-- ============================================================
-- 6. Storage: Create bucket "uploads" in Supabase Dashboard > Storage.
-- Set it to Public. Add policy: Allow authenticated INSERT, public SELECT.
-- ============================================================

-- ============================================================
-- DONE! Your Kairo database is ready.
-- ============================================================
