-- FORUM
CREATE TABLE public.forum_topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  city text,
  category post_category not null default 'entraide',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forum_topics TO authenticated;
GRANT SELECT ON public.forum_topics TO anon;
GRANT ALL ON public.forum_topics TO service_role;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY forum_topics_read_all ON public.forum_topics FOR SELECT TO authenticated USING (true);
CREATE POLICY forum_topics_read_anon ON public.forum_topics FOR SELECT TO anon USING (true);
CREATE POLICY forum_topics_insert_own ON public.forum_topics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY forum_topics_update_own ON public.forum_topics FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY forum_topics_delete_own ON public.forum_topics FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER forum_topics_updated_at BEFORE UPDATE ON public.forum_topics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.forum_topics(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forum_replies TO authenticated;
GRANT SELECT ON public.forum_replies TO anon;
GRANT ALL ON public.forum_replies TO service_role;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY forum_replies_read_all ON public.forum_replies FOR SELECT TO authenticated USING (true);
CREATE POLICY forum_replies_read_anon ON public.forum_replies FOR SELECT TO anon USING (true);
CREATE POLICY forum_replies_insert_own ON public.forum_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY forum_replies_update_own ON public.forum_replies FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY forum_replies_delete_own ON public.forum_replies FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ANIMAUX
CREATE TABLE public.pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  species text not null default 'chien',
  breed text,
  age_years int,
  city text,
  photo_url text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pets TO authenticated;
GRANT SELECT ON public.pets TO anon;
GRANT ALL ON public.pets TO service_role;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY pets_read_all ON public.pets FOR SELECT TO authenticated USING (true);
CREATE POLICY pets_read_anon ON public.pets FOR SELECT TO anon USING (true);
CREATE POLICY pets_insert_own ON public.pets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY pets_update_own ON public.pets FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY pets_delete_own ON public.pets FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER pets_updated_at BEFORE UPDATE ON public.pets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.pet_meetups (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  requester_id uuid not null references auth.users(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  status text not null default 'en_attente',
  created_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE ON public.pet_meetups TO authenticated;
GRANT ALL ON public.pet_meetups TO service_role;
ALTER TABLE public.pet_meetups ENABLE ROW LEVEL SECURITY;
CREATE POLICY pet_meetups_read_participant ON public.pet_meetups FOR SELECT TO authenticated USING (auth.uid() = requester_id OR auth.uid() = owner_id);
CREATE POLICY pet_meetups_insert_own ON public.pet_meetups FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id AND auth.uid() <> owner_id);
CREATE POLICY pet_meetups_update_owner ON public.pet_meetups FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- RECETTES & OBJECTIFS
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS planned_day text;
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS progress int not null default 0;
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS description text;