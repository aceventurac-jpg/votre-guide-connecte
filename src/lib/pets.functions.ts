import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getAnonClient, tryGetUser } from "@/lib/supabase-public.server";
import { z } from "zod";

export const SPECIES = ["chien", "chat", "lapin", "oiseau", "cheval", "autre"] as const;

const PetInput = z.object({
  name: z.string().trim().min(1).max(60),
  species: z.enum(SPECIES),
  breed: z.string().trim().max(80).optional().nullable(),
  age_years: z.number().int().min(0).max(60).optional().nullable(),
  city: z.string().trim().max(80).optional().nullable(),
  photo_url: z.string().trim().url().max(500).optional().nullable(),
  description: z.string().trim().max(1000).optional().nullable(),
});

export const listPets = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ city: z.string().trim().max(80).optional(), species: z.enum(SPECIES).optional() }).optional().parse(input),
  )
  .handler(async ({ data }) => {
    const auth = await tryGetUser();
    const sb = auth?.supabase ?? getAnonClient();
    let q = sb
      .from("pets")
      .select("id, user_id, name, species, breed, age_years, city, photo_url, description, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data?.city) q = q.ilike("city", `%${data.city}%`);
    if (data?.species) q = q.eq("species", data.species);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const ids = Array.from(new Set((rows ?? []).map((r) => r.user_id)));
    const { data: profs } = ids.length
      ? await sb.from("profiles").select("id, name, city, verified").in("id", ids)
      : { data: [] as { id: string; name: string | null; city: string | null; verified: boolean }[] };
    const map = new Map((profs ?? []).map((p) => [p.id, p]));
    return {
      pets: (rows ?? []).map((p) => ({
        ...p,
        owner: map.get(p.user_id) ?? null,
        mine: auth?.userId === p.user_id,
      })),
      authed: !!auth,
    };
  });

export const createPet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => PetInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("pets")
      .insert({
        ...data,
        breed: data.breed || null,
        city: data.city || null,
        photo_url: data.photo_url || null,
        description: data.description || null,
        user_id: context.userId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deletePet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("pets").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const requestMeetup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ pet_id: z.string().uuid(), owner_id: z.string().uuid(), message: z.string().trim().min(1).max(1000) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    if (data.owner_id === context.userId) throw new Error("C'est déjà ton animal 🙂");
    const { error } = await context.supabase.from("pet_meetups").insert({
      pet_id: data.pet_id,
      owner_id: data.owner_id,
      requester_id: context.userId,
      message: data.message,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMeetups = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("pet_meetups")
      .select("id, pet_id, requester_id, owner_id, message, status, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    const petIds = Array.from(new Set((data ?? []).map((m) => m.pet_id)));
    const { data: pets } = petIds.length
      ? await context.supabase.from("pets").select("id, name, photo_url").in("id", petIds)
      : { data: [] as { id: string; name: string; photo_url: string | null }[] };
    const map = new Map((pets ?? []).map((p) => [p.id, p]));
    return {
      meetups: (data ?? []).map((m) => ({
        ...m,
        pet: map.get(m.pet_id) ?? null,
        incoming: m.owner_id === context.userId,
      })),
    };
  });

export const respondMeetup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["accepte", "refuse"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("pet_meetups")
      .update({ status: data.status })
      .eq("id", data.id)
      .eq("owner_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
