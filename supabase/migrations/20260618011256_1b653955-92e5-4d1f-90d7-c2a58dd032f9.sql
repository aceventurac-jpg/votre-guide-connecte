-- Posts : ajouter ville + nouvelles catégories
ALTER TYPE public.post_category ADD VALUE IF NOT EXISTS 'entraide';
ALTER TYPE public.post_category ADD VALUE IF NOT EXISTS 'animaux';
ALTER TYPE public.post_category ADD VALUE IF NOT EXISTS 'cuisine';
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS city text;

-- Listings : nouveau type Troc/Don + nouvelles catégories + flag gratuit
ALTER TYPE public.listing_type ADD VALUE IF NOT EXISTS 'Troc/Don';
ALTER TYPE public.listing_category ADD VALUE IF NOT EXISTS 'Scolaire';
ALTER TYPE public.listing_category ADD VALUE IF NOT EXISTS 'Vêtements';
ALTER TYPE public.listing_category ADD VALUE IF NOT EXISTS 'Jouets';
ALTER TYPE public.listing_category ADD VALUE IF NOT EXISTS 'Animaux';
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS is_free boolean NOT NULL DEFAULT false;

-- Recettes
CREATE TABLE IF NOT EXISTS public.recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  ingredients text[] NOT NULL DEFAULT '{}',
  steps text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipes TO authenticated;
GRANT ALL ON public.recipes TO service_role;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recipes_owner_select" ON public.recipes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "recipes_owner_insert" ON public.recipes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "recipes_owner_update" ON public.recipes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "recipes_owner_delete" ON public.recipes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Objectifs
CREATE TABLE IF NOT EXISTS public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  deadline date,
  status text NOT NULL DEFAULT 'en_cours' CHECK (status IN ('en_cours','atteint','abandonne')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals TO authenticated;
GRANT ALL ON public.goals TO service_role;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "goals_owner_select" ON public.goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "goals_owner_insert" ON public.goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "goals_owner_update" ON public.goals FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "goals_owner_delete" ON public.goals FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Trigger updated_at partagé (créé une seule fois)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS recipes_set_updated_at ON public.recipes;
CREATE TRIGGER recipes_set_updated_at BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS goals_set_updated_at ON public.goals;
CREATE TRIGGER goals_set_updated_at BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();