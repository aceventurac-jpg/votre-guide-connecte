import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getAnonClient, tryGetUser } from "@/lib/supabase-public.server";
import { z } from "zod";

// ---------------- Abonnements ----------------
export const toggleFollow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ user_id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    if (data.user_id === context.userId) throw new Error("Tu ne peux pas te suivre toi-même.");
    const { data: existing } = await context.supabase
      .from("follows")
      .select("id")
      .eq("follower_id", context.userId)
      .eq("followed_id", data.user_id)
      .maybeSingle();
    if (existing) {
      await context.supabase.from("follows").delete().eq("id", existing.id);
      return { following: false };
    }
    const { error } = await context.supabase
      .from("follows")
      .insert({ follower_id: context.userId, followed_id: data.user_id });
    if (error) throw new Error(error.message);
    return { following: true };
  });

// ---------------- Profil public ----------------
export const getPublicProfile = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ user_id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const auth = await tryGetUser();
    const sb = auth?.supabase ?? getAnonClient();
    const meId = auth?.userId ?? null;
    const { signPaths, signOne } = await import("@/lib/media.server");

    const [{ data: profile }, { data: posts }, { data: listings }, { data: reviews }, { data: followers }, { data: following }] =
      await Promise.all([
        sb.from("profiles").select("id, name, city, country, bio, avatar_url, profile_type, verified, created_at").eq("id", data.user_id).maybeSingle(),
        sb.from("posts").select("id, category, content, created_at").eq("user_id", data.user_id).order("created_at", { ascending: false }).limit(20),
        sb.from("listings").select("id, title, price, is_free, category, listing_type, city").eq("user_id", data.user_id).eq("active", true).limit(20),
        sb.from("reviews").select("rating").eq("reviewed_id", data.user_id),
        sb.from("follows").select("follower_id").eq("followed_id", data.user_id),
        sb.from("follows").select("followed_id").eq("follower_id", data.user_id),
      ]);

    const ratings = (reviews ?? []).map((r) => r.rating);
    const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
    const map = await signPaths([profile?.avatar_url ?? ""].filter(Boolean));

    return {
      profile: profile ? { ...profile, avatar_url: signOne(map, profile.avatar_url) } : null,
      posts: posts ?? [],
      listings: listings ?? [],
      rating: avg ? Math.round(avg * 10) / 10 : null,
      reviews_count: ratings.length,
      followers: (followers ?? []).length,
      following: (following ?? []).length,
      is_following: meId ? (followers ?? []).some((f) => f.follower_id === meId) : false,
      me: meId,
    };
  });

export const updateAvatarAndBio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ avatar_url: z.string().max(400).optional(), bio: z.string().max(500).optional() }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({
        updated_at: new Date().toISOString(),
        ...(data.avatar_url !== undefined ? { avatar_url: data.avatar_url } : {}),
        ...(data.bio !== undefined ? { bio: data.bio } : {}),
      })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------- Notifications ----------------
export const listNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: rows, error } = await context.supabase
      .from("notifications")
      .select("id, actor_id, type, content, link, read, created_at")
      .order("created_at", { ascending: false })
      .limit(40);
    if (error) throw new Error(error.message);
    const actorIds = Array.from(new Set((rows ?? []).map((r) => r.actor_id).filter(Boolean))) as string[];
    const { data: profs } = await context.supabase
      .from("profiles")
      .select("id, name")
      .in("id", actorIds.length ? actorIds : ["00000000-0000-0000-0000-000000000000"]);
    const pmap = new Map((profs ?? []).map((p) => [p.id, p]));
    return {
      notifications: (rows ?? []).map((r) => ({ ...r, actor: r.actor_id ? pmap.get(r.actor_id) ?? null : null })),
      unread: (rows ?? []).filter((r) => !r.read).length,
    };
  });

export const markNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid().optional() }).optional().parse(i))
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("notifications").update({ read: true }).eq("user_id", context.userId).eq("read", false);
    if (data?.id) q = q.eq("id", data.id);
    const { error } = await q;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------- Messagerie directe ----------------
export const sendDirectMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ receiver_id: z.string().uuid(), content: z.string().trim().min(1).max(2000) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    if (data.receiver_id === context.userId) throw new Error("Tu ne peux pas t'écrire à toi-même.");
    const { error } = await context.supabase
      .from("direct_messages")
      .insert({ sender_id: context.userId, receiver_id: data.receiver_id, content: data.content });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listDirectThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ other_id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("direct_messages")
      .select("id, sender_id, receiver_id, content, read, created_at")
      .or(
        `and(sender_id.eq.${context.userId},receiver_id.eq.${data.other_id}),and(sender_id.eq.${data.other_id},receiver_id.eq.${context.userId})`,
      )
      .order("created_at", { ascending: true })
      .limit(300);
    if (error) throw new Error(error.message);
    await context.supabase
      .from("direct_messages")
      .update({ read: true })
      .eq("receiver_id", context.userId)
      .eq("sender_id", data.other_id)
      .eq("read", false);
    const { data: other } = await context.supabase
      .from("profiles")
      .select("id, name, city")
      .eq("id", data.other_id)
      .maybeSingle();
    return { messages: rows ?? [], other, me: context.userId };
  });

export const listConversations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: rows, error } = await context.supabase
      .from("direct_messages")
      .select("id, sender_id, receiver_id, content, read, created_at")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) throw new Error(error.message);
    const byOther = new Map<string, { other_id: string; content: string; created_at: string; unread: number }>();
    (rows ?? []).forEach((m) => {
      const other = m.sender_id === context.userId ? m.receiver_id : m.sender_id;
      const cur = byOther.get(other);
      const unreadInc = !m.read && m.receiver_id === context.userId ? 1 : 0;
      if (!cur) byOther.set(other, { other_id: other, content: m.content, created_at: m.created_at, unread: unreadInc });
      else cur.unread += unreadInc;
    });
    const ids = Array.from(byOther.keys());
    const { data: profs } = await context.supabase
      .from("profiles")
      .select("id, name, city")
      .in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    const pmap = new Map((profs ?? []).map((p) => [p.id, p]));
    return {
      conversations: Array.from(byOther.values()).map((c) => ({ ...c, other: pmap.get(c.other_id) ?? null })),
    };
  });
