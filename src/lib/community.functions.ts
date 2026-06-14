import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// ---------- Messagerie interne ----------
export const sendInternalMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        listing_id: z.string().uuid(),
        receiver_id: z.string().uuid(),
        content: z.string().trim().min(1).max(2000),
      })
      .parse(input),
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
      .or(
        `and(sender_id.eq.${context.userId},receiver_id.eq.${data.other_id}),and(sender_id.eq.${data.other_id},receiver_id.eq.${context.userId})`,
      )
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
    z
      .object({
        listing_id: z.string().uuid(),
        reviewed_id: z.string().uuid(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().trim().max(1000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    if (data.reviewed_id === context.userId) throw new Error("Tu ne peux pas t'auto-évaluer.");
    const { error } = await context.supabase
      .from("reviews")
      .upsert(
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
