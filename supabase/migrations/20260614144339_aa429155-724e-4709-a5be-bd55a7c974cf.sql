
DROP VIEW IF EXISTS public.user_ratings;
CREATE VIEW public.user_ratings WITH (security_invoker = true) AS
SELECT reviewed_id AS user_id, AVG(rating)::NUMERIC(3,2) AS avg_rating, COUNT(*) AS review_count
FROM public.reviews GROUP BY reviewed_id;
GRANT SELECT ON public.user_ratings TO authenticated;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
