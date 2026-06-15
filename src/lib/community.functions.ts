import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const CATEGORIES = ["administratif","sante","voyage","services_locaux","commerce_international","apprentissage"] as const;
const CONTEXTS = ["loisirs","professionnel"] as const;

// ---------- Messagerie interne ----------
export const sendInternalMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      listing_id: z.string().uuid(),
      receiver_id: z.string().uuid(),
      content: z.string().trim().min(1).max(2000),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    if (data.receiver_id === context.userId) throw new Error("Tu ne peux pas t'envoyer un message.");
    const { error } = await context.supabase.from("messages").insert({
      listing_id: data.listing_id,
      receiver_id: data.receiver_id,
      sender_id: context.userId,
      content: data.content,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ listing_id: z.string().uuid(), other_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("messages")
      .select("id, sender_id, receiver_id, content, created_at")
      .eq("listing_id", data.listing_id)
      .or(`and(sender_id.eq.${context.userId},receiver_id.eq.${data.other_id}),and(sender_id.eq.${data.other_id},receiver_id.eq.${context.userId})`)
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) throw new Error(error.message);
    return { messages: rows ?? [] };
  });

export const getInbox = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("messages")
      .select("id, listing_id, sender_id, receiver_id, content, created_at")
      .or(`sender_id.eq.${context.userId},receiver_id.eq.${context.userId}`)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { messages: data ?? [] };
  });

// ---------- Reviews ----------
export const submitReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      listing_id: z.string().uuid(),
      reviewed_id: z.string().uuid(),
      rating: z.number().int().min(1).max(5),
      comment: z.string().trim().max(1000).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    if (data.reviewed_id === context.userId) throw new Error("Tu ne peux pas t'auto-évaluer.");
    const { error } = await context.supabase.from("reviews").upsert(
      {
        listing_id: data.listing_id,
        reviewed_id: data.reviewed_id,
        reviewer_id: context.userId,
        rating: data.rating,
        comment: data.comment ?? null,
      },
      { onConflict: "listing_id,reviewer_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Reports ----------
export const reportListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ listing_id: z.string().uuid(), reason: z.string().trim().min(5).max(500) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("reports").insert({
      listing_id: data.listing_id,
      reporter_id: context.userId,
      reason: data.reason,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Posts (fil communautaire) ----------
export const createPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      category: z.enum(CATEGORIES),
      context: z.enum(CONTEXTS).default("loisirs"),
      content: z.string().trim().min(1).max(2000),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error, data: row } = await context.supabase
      .from("posts")
      .insert({ ...data, user_id: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const listPosts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      category: z.enum(CATEGORIES).optional(),
      context: z.enum(CONTEXTS).optional(),
      limit: z.number().int().min(1).max(50).optional(),
    }).optional().parse(input),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("posts")
      .select("id, user_id, category, context, content, created_at")
      .order("created_at", { ascending: false })
      .limit(data?.limit ?? 50);
    if (data?.category) q = q.eq("category", data.category);
    if (data?.context) q = q.eq("context", data.context);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const ids = (rows ?? []).map((r) => r.id);
    const userIds = Array.from(new Set((rows ?? []).map((r) => r.user_id)));
    const safeUserIds = userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"];
    const safePostIds = ids.length ? ids : ["00000000-0000-0000-0000-000000000000"];

    const [{ data: profs }, { data: likes }, { data: comments }] = await Promise.all([
      context.supabase.from("profiles").select("id, name, city").in("id", safeUserIds),
      context.supabase.from("post_likes").select("post_id, user_id").in("post_id", safePostIds),
      context.supabase.from("post_comments").select("post_id").in("post_id", safePostIds),
    ]);

    const pmap = new Map((profs ?? []).map((p) => [p.id, p]));
    const likeCount = new Map<string, number>();
    const likedByMe = new Set<string>();
    (likes ?? []).forEach((l) => {
      likeCount.set(l.post_id, (likeCount.get(l.post_id) ?? 0) + 1);
      if (l.user_id === context.userId) likedByMe.add(l.post_id);
    });
    const commentCount = new Map<string, number>();
    (comments ?? []).forEach((c) => commentCount.set(c.post_id, (commentCount.get(c.post_id) ?? 0) + 1));

    return {
      posts: (rows ?? []).map((r) => ({
        ...r,
        author: pmap.get(r.user_id) ?? null,
        likes: likeCount.get(r.id) ?? 0,
        comments: commentCount.get(r.id) ?? 0,
        liked_by_me: likedByMe.has(r.id),
        mine: r.user_id === context.userId,
      })),
    };
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("posts").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const togglePostLike = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ post_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: existing } = await context.supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", data.post_id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (existing) {
      await context.supabase.from("post_likes").delete().eq("id", existing.id);
      return { liked: false };
    }
    const { error } = await context.supabase.from("post_likes").insert({
      post_id: data.post_id,
      user_id: context.userId,
    });
    if (error) throw new Error(error.message);
    return { liked: true };
  });

export const listComments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ post_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("post_comments")
      .select("id, user_id, content, created_at")
      .eq("post_id", data.post_id)
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) throw new Error(error.message);
    const userIds = Array.from(new Set((rows ?? []).map((r) => r.user_id)));
    const { data: profs } = await context.supabase
      .from("profiles")
      .select("id, name")
      .in("id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);
    const pmap = new Map((profs ?? []).map((p) => [p.id, p]));
    return {
      comments: (rows ?? []).map((r) => ({ ...r, author: pmap.get(r.user_id) ?? null, mine: r.user_id === context.userId })),
    };
  });

export const addComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ post_id: z.string().uuid(), content: z.string().trim().min(1).max(1000) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("post_comments").insert({
      post_id: data.post_id,
      user_id: context.userId,
      content: data.content,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("post_comments")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
