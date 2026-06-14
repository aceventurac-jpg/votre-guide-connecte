import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const PROFILE_TYPES = [
  "particulier",
  "etudiant",
  "auto_entrepreneur",
  "retraite",
  "etranger",
  "parent",
  "aidant",
  "senior",
  "professionnel",
] as const;

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data: profile }, { data: prefs }] = await Promise.all([
      context.supabase.from("profiles").select("*").eq("id", context.userId).maybeSingle(),
      context.supabase.from("user_preferences").select("*").eq("user_id", context.userId).maybeSingle(),
    ]);
    return { profile, prefs };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        name: z.string().trim().min(1).max(80),
        city: z.string().trim().max(80).optional(),
        country: z.string().trim().max(80).optional(),
        profile_type: z.enum(PROFILE_TYPES).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    // Upsert profil (au cas où le trigger n'a pas créé la ligne)
    const { error } = await context.supabase
      .from("profiles")
      .upsert(
        { id: context.userId, ...data, updated_at: new Date().toISOString() },
        { onConflict: "id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
