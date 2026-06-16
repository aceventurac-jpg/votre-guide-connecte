import { createServerFn } from "@tanstack/react-start";

export const getHomePreview = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [{ data: posts }, { data: listings }] = await Promise.all([
    supabaseAdmin
      .from("posts")
      .select("id, category, context, content, created_at")
      .order("created_at", { ascending: false })
      .limit(3),
    supabaseAdmin
      .from("listings")
      .select("id, category, listing_type, title, description, price, city, created_at")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);
  return { posts: posts ?? [], listings: listings ?? [] };
});
