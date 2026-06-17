
-- Stories table
CREATE TABLE public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category public.post_category NOT NULL,
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','private')),
  allowed_user_ids uuid[] NOT NULL DEFAULT '{}',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.stories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.stories TO authenticated;
GRANT ALL ON public.stories TO service_role;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stories_read_public_anon" ON public.stories FOR SELECT TO anon
  USING (visibility = 'public' AND expires_at > now());
CREATE POLICY "stories_read_visible_auth" ON public.stories FOR SELECT TO authenticated
  USING (
    expires_at > now() AND (
      visibility = 'public'
      OR user_id = auth.uid()
      OR auth.uid() = ANY(allowed_user_ids)
    )
  );
CREATE POLICY "stories_insert_own" ON public.stories FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stories_delete_own" ON public.stories FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX stories_category_expires_idx ON public.stories (category, expires_at DESC);

-- Anon read access for guest mode
GRANT SELECT ON public.posts TO anon;
GRANT SELECT ON public.post_likes TO anon;
GRANT SELECT ON public.post_comments TO anon;
GRANT SELECT ON public.listings TO anon;
GRANT SELECT ON public.profiles TO anon;

CREATE POLICY "posts_read_anon" ON public.posts FOR SELECT TO anon USING (true);
CREATE POLICY "post_likes_read_anon" ON public.post_likes FOR SELECT TO anon USING (true);
CREATE POLICY "post_comments_read_anon" ON public.post_comments FOR SELECT TO anon USING (true);
CREATE POLICY "listings_read_anon" ON public.listings FOR SELECT TO anon USING (active);
CREATE POLICY "profiles_read_public_anon" ON public.profiles FOR SELECT TO anon USING (true);
