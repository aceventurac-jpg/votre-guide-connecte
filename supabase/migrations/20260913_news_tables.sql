-- Enum for news interaction actions
CREATE TYPE public.news_action AS ENUM ('view', 'like', 'share', 'save');

-- TABLE: news_interactions
-- Tracks user interactions with news articles (views, likes, shares, saves)
CREATE TABLE public.news_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_url TEXT NOT NULL,
  action public.news_action NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_news_interactions_user_url ON public.news_interactions(user_id, article_url);
CREATE INDEX idx_news_interactions_user_created ON public.news_interactions(user_id, created_at);
CREATE INDEX idx_news_interactions_action ON public.news_interactions(action);

GRANT SELECT, INSERT, UPDATE ON public.news_interactions TO authenticated;
GRANT ALL ON public.news_interactions TO service_role;

ALTER TABLE public.news_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "news_interactions_own_read" ON public.news_interactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "news_interactions_own_insert" ON public.news_interactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "news_interactions_own_update" ON public.news_interactions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- TABLE: news_preferences
-- Stores user's news preferences (sources, categories, regions)
CREATE TABLE public.news_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  sources TEXT[] DEFAULT ARRAY['lemonde','francetvinfo','20minutes','bfmtv','liberation','lefigaro'],
  categories TEXT[] DEFAULT ARRAY['actualite-generale','sport','international','economie','culture','science'],
  regions TEXT[] DEFAULT ARRAY[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.news_preferences TO authenticated;
GRANT ALL ON public.news_preferences TO service_role;

ALTER TABLE public.news_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "news_preferences_own_read" ON public.news_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "news_preferences_own_update" ON public.news_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "news_preferences_own_insert" ON public.news_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
