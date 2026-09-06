-- ========== profiles ==========
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;

-- ========== listings (vinted-like) ==========
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS size text;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS style text;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS item_condition text;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'disponible';

-- ========== recipes / comments ==========
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.post_comments ADD COLUMN IF NOT EXISTS photo_url text;

-- ========== stories enrichies ==========
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS media_url text;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS media_type text;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS overlay_text text;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS poll_a text;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS poll_b text;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS link_url text;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS music_url text;

-- ========== media ==========
CREATE TABLE IF NOT EXISTS public.media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'image',
  url text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS media_entity_idx ON public.media(entity_type, entity_id);
GRANT SELECT ON public.media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media TO authenticated;
GRANT ALL ON public.media TO service_role;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "media readable by everyone" ON public.media FOR SELECT USING (true);
CREATE POLICY "media insert own" ON public.media FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "media update own" ON public.media FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "media delete own" ON public.media FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- ========== follows ==========
CREATE TABLE IF NOT EXISTS public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  followed_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (follower_id, followed_id),
  CHECK (follower_id <> followed_id)
);
GRANT SELECT ON public.follows TO anon;
GRANT SELECT, INSERT, DELETE ON public.follows TO authenticated;
GRANT ALL ON public.follows TO service_role;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "follows readable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "follow as self" ON public.follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "unfollow as self" ON public.follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- ========== notifications ==========
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  actor_id uuid,
  type text NOT NULL,
  content text NOT NULL,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications(user_id, created_at DESC);
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ========== direct messages ==========
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  content text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (sender_id <> receiver_id)
);
CREATE INDEX IF NOT EXISTS dm_pair_idx ON public.direct_messages(sender_id, receiver_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE ON public.direct_messages TO authenticated;
GRANT ALL ON public.direct_messages TO service_role;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own dms" ON public.direct_messages FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "send dms" ON public.direct_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "mark dms read" ON public.direct_messages FOR UPDATE TO authenticated USING (auth.uid() = receiver_id) WITH CHECK (auth.uid() = receiver_id);

-- ========== waste events ==========
CREATE TABLE IF NOT EXISTS public.waste_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  city text,
  place text,
  event_date timestamptz,
  media_url text,
  media_type text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.waste_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.waste_events TO authenticated;
GRANT ALL ON public.waste_events TO service_role;
ALTER TABLE public.waste_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "waste events readable" ON public.waste_events FOR SELECT USING (true);
CREATE POLICY "waste events insert own" ON public.waste_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "waste events update own" ON public.waste_events FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "waste events delete own" ON public.waste_events FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER waste_events_updated_at BEFORE UPDATE ON public.waste_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.waste_event_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.waste_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);
GRANT SELECT ON public.waste_event_participants TO anon;
GRANT SELECT, INSERT, DELETE ON public.waste_event_participants TO authenticated;
GRANT ALL ON public.waste_event_participants TO service_role;
ALTER TABLE public.waste_event_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "participants readable" ON public.waste_event_participants FOR SELECT USING (true);
CREATE POLICY "join event" ON public.waste_event_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "leave event" ON public.waste_event_participants FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ========== services à domicile ==========
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text,
  city text,
  price numeric,
  availability_today text,
  media_url text,
  media_type text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services readable" ON public.services FOR SELECT USING (true);
CREATE POLICY "services insert own" ON public.services FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "services update own" ON public.services FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "services delete own" ON public.services FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.service_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (service_id, reviewer_id)
);
GRANT SELECT ON public.service_reviews TO anon;
GRANT SELECT, INSERT, UPDATE ON public.service_reviews TO authenticated;
GRANT ALL ON public.service_reviews TO service_role;
ALTER TABLE public.service_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service reviews readable" ON public.service_reviews FOR SELECT USING (true);
CREATE POLICY "service reviews insert own" ON public.service_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "service reviews update own" ON public.service_reviews FOR UPDATE TO authenticated USING (auth.uid() = reviewer_id) WITH CHECK (auth.uid() = reviewer_id);

-- ========== sondages de story ==========
CREATE TABLE IF NOT EXISTS public.story_poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  choice smallint NOT NULL CHECK (choice IN (1, 2)),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (story_id, user_id)
);
GRANT SELECT ON public.story_poll_votes TO anon;
GRANT SELECT, INSERT, UPDATE ON public.story_poll_votes TO authenticated;
GRANT ALL ON public.story_poll_votes TO service_role;
ALTER TABLE public.story_poll_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "poll votes readable" ON public.story_poll_votes FOR SELECT USING (true);
CREATE POLICY "poll vote own" ON public.story_poll_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "poll vote change" ON public.story_poll_votes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ========== déclencheurs de notification ==========
CREATE OR REPLACE FUNCTION public.notify_on_post_like()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target uuid;
BEGIN
  SELECT user_id INTO target FROM public.posts WHERE id = NEW.post_id;
  IF target IS NOT NULL AND target <> NEW.user_id THEN
    INSERT INTO public.notifications (user_id, actor_id, type, content, link)
    VALUES (target, NEW.user_id, 'like', 'a aimé votre publication', '/community/' || NEW.post_id);
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER post_likes_notify AFTER INSERT ON public.post_likes FOR EACH ROW EXECUTE FUNCTION public.notify_on_post_like();

CREATE OR REPLACE FUNCTION public.notify_on_post_comment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target uuid;
BEGIN
  SELECT user_id INTO target FROM public.posts WHERE id = NEW.post_id;
  IF target IS NOT NULL AND target <> NEW.user_id THEN
    INSERT INTO public.notifications (user_id, actor_id, type, content, link)
    VALUES (target, NEW.user_id, 'commentaire', 'a commenté votre publication', '/community/' || NEW.post_id);
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER post_comments_notify AFTER INSERT ON public.post_comments FOR EACH ROW EXECUTE FUNCTION public.notify_on_post_comment();

CREATE OR REPLACE FUNCTION public.notify_on_direct_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, actor_id, type, content, link)
  VALUES (NEW.receiver_id, NEW.sender_id, 'message', 'vous a envoyé un message', '/messages/' || NEW.sender_id);
  RETURN NEW;
END; $$;
CREATE TRIGGER direct_messages_notify AFTER INSERT ON public.direct_messages FOR EACH ROW EXECUTE FUNCTION public.notify_on_direct_message();

CREATE OR REPLACE FUNCTION public.notify_followers_on_post()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, actor_id, type, content, link)
  SELECT f.follower_id, NEW.user_id, 'publication', 'a publié quelque chose de nouveau', '/community/' || NEW.id
  FROM public.follows f WHERE f.followed_id = NEW.user_id;
  RETURN NEW;
END; $$;
CREATE TRIGGER posts_notify_followers AFTER INSERT ON public.posts FOR EACH ROW EXECUTE FUNCTION public.notify_followers_on_post();

CREATE OR REPLACE FUNCTION public.notify_on_new_follow()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, actor_id, type, content, link)
  VALUES (NEW.followed_id, NEW.follower_id, 'abonnement', 'vous suit désormais', '/u/' || NEW.follower_id);
  RETURN NEW;
END; $$;
CREATE TRIGGER follows_notify AFTER INSERT ON public.follows FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_follow();

CREATE OR REPLACE FUNCTION public.notify_city_on_waste_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.city IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, actor_id, type, content, link)
    SELECT p.id, NEW.user_id, 'evenement', 'organise une collecte près de chez vous', '/collecte'
    FROM public.profiles p
    WHERE p.id <> NEW.user_id AND lower(p.city) = lower(NEW.city);
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER waste_events_notify AFTER INSERT ON public.waste_events FOR EACH ROW EXECUTE FUNCTION public.notify_city_on_waste_event();

-- ========== realtime ==========
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;

-- ========== storage policies (bucket privé "media") ==========
CREATE POLICY "media files readable" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "media files upload own" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "media files delete own" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);