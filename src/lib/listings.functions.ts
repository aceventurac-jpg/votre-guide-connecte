import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getAnonClient, tryGetUser } from "@/lib/supabase-public.server";
import { z } from "zod";

export const CATEGORIES = [
  "Administratif",
  "Santé",
  "Voyage",
  "Services Locaux",
  "Commerce International",
  "Apprentissage",
  "Scolaire",
  "Vêtements",
  "Jouets",
  "Animaux",
] as const;
export const TYPES = ["Vente", "Location", "Covoiturage", "Service", "Tutorat", "Troc/Don"] as const;

export const CONTEXTS = ["loisirs", "professionnel"] as const;

const ListingInput = z.object({
  category: z.enum(CATEGORIES),
  listing_type: z.enum(TYPES),
  context: z.enum(CONTEXTS).optional(),
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().min(10).max(2000),
  price: z.number().nonnegative().max(1_000_000).nullable().optional(),
  is_free: z.boolean().optional(),
  subject: z.string().trim().max(80).optional().nullable(),
  level: z.string().trim().max(80).optional().nullable(),
  city: z.string().trim().max(80).optional().nullable(),
});

export const createListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ListingInput.parse(input))
  .handler(async ({ data, context }) => {
    const { error, data: row } = await context.supabase
      .from("listings")
      .insert({ ...data, user_id: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

const ListInput = z
  .object({
    category: z.enum(CATEGORIES).optional(),
    listing_type: z.enum(TYPES).optional(),
    context: z.enum(CONTEXTS).optional(),
  })
  .optional();

export const listListings = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ListInput.parse(input))
  .handler(async ({ data }) => {
    const auth = await tryGetUser();
    const sb = auth?.supabase ?? getAnonClient();
    let q = sb
      .from("listings")
      .select(
        "id, category, listing_type, context, title, description, price, is_free, subject, level, city, created_at, user_id",
      )
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(100);
    if (data?.category) q = q.eq("category", data.category);
    if (data?.listing_type) q = q.eq("listing_type", data.listing_type);
    if (data?.context) q = q.eq("context", data.context);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const userIds = Array.from(new Set((rows ?? []).map((r) => r.user_id)));
    const safeIds = userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"];
    const [{ data: profs }, { data: ratings }] = await Promise.all([
      sb.from("profiles").select("id, name, city, verified, profile_type").in("id", safeIds),
      sb.from("user_ratings").select("user_id, avg_rating, review_count").in("user_id", safeIds),
    ]);
    const pmap = new Map((profs ?? []).map((p) => [p.id, p]));
    const rmap = new Map((ratings ?? []).map((r) => [r.user_id, r]));
    return {
      listings: (rows ?? []).map((r) => ({
        ...r,
        seller: pmap.get(r.user_id) ?? null,
        rating: rmap.get(r.user_id) ?? null,
      })),
    };
  });

export const getListing = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const auth = await tryGetUser();
    const sb = auth?.supabase ?? getAnonClient();
    const { data: listing, error } = await sb
      .from("listings")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!listing) throw new Error("Annonce introuvable");
    const [{ data: seller }, { data: rating }, { data: reviews }] = await Promise.all([
      sb.from("profiles").select("id, name, city, verified, profile_type").eq("id", listing.user_id).maybeSingle(),
      sb.from("user_ratings").select("avg_rating, review_count").eq("user_id", listing.user_id).maybeSingle(),
      sb
        .from("reviews")
        .select("id, rating, comment, created_at, reviewer_id")
        .eq("listing_id", data.id)
        .order("created_at", { ascending: false }),
    ]);
    return { listing, seller, rating, reviews: reviews ?? [] };
  });

export const deleteListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("listings").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
