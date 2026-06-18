import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { tryGetUser, getAnonClient } from "@/lib/supabase-public.server";
import { z } from "zod";

const VALID_AGENTS = [
  "administratif",
  "sante",
  "voyage",
  "services_locaux",
  "commerce_international",
  "apprentissage",
  "general",
] as const;
type AgentKey = (typeof VALID_AGENTS)[number];

const SendInput = z.object({
  message: z.string().trim().min(1).max(4000),
  preferred_agent: z.enum(VALID_AGENTS).optional(),
});

export const sendChatMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SendInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Configuration IA manquante.");

    const auth = await tryGetUser();
    const sb = auth?.supabase ?? getAnonClient();
    const userId = auth?.userId ?? null;

    const { generateText, tool, stepCountIs } = await import("ai");
    const { z: zod } = await import("zod");
    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const { AGENT_PROMPTS, ORCHESTRATOR_PROMPT } = await import("./agents.server");
    const { webSearch, shouldUseWebSearch } = await import("./web-search.server");

    const gateway = createLovableAiGatewayProvider(apiKey);
    const model = gateway("google/gemini-3-flash-preview");

    type Profile = { name?: string | null; city?: string | null; country?: string | null; profile_type?: string | null };
    type Prefs = { interests?: string[] | null; travel_style?: string | null; budget?: string | null; family_status?: string | null; traveler_type?: string | null };
    let profile: Profile | null = null;
    let prefs: Prefs | null = null;
    let recent: { role: string; message: string }[] = [];

    if (userId) {
      const [{ data: p }, { data: pr }, { data: history }] = await Promise.all([
        sb.from("profiles").select("name, city, country, profile_type").eq("id", userId).maybeSingle(),
        sb.from("user_preferences").select("*").eq("user_id", userId).maybeSingle(),
        sb.from("conversations").select("role, message, agent_used").eq("user_id", userId).order("created_at", { ascending: false }).limit(12),
      ]);
      profile = (p as Profile | null) ?? null;
      prefs = (pr as Prefs | null) ?? null;
      recent = (history ?? []).reverse();
      await sb.from("conversations").insert({ user_id: userId, role: "user", message: data.message });
    }

    let agent: AgentKey = data.preferred_agent ?? "general";
    if (!data.preferred_agent) {
      try {
        const detect = await generateText({ model, system: ORCHESTRATOR_PROMPT, prompt: data.message });
        const raw = detect.text.trim().toLowerCase().replace(/[^a-z_]/g, "");
        if ((VALID_AGENTS as readonly string[]).includes(raw)) agent = raw as AgentKey;
      } catch (e) {
        console.error("Intent detection failed", e);
      }
    }

    const profileLine = profile
      ? `Profil utilisateur : ${profile.name || "inconnu"}${profile.city ? `, ${profile.city}` : ""}${profile.country ? ` (${profile.country})` : ""}, type : ${profile.profile_type ?? "particulier"}.`
      : "Profil utilisateur : visiteur non connecté.";
    const prefsLine = prefs
      ? `Préférences : ${[
          prefs.interests?.length ? `intérêts ${prefs.interests.join(", ")}` : "",
          prefs.travel_style ? `voyage ${prefs.travel_style}` : "",
          prefs.budget ? `budget ${prefs.budget}` : "",
          prefs.family_status ? `situation ${prefs.family_status}` : "",
          prefs.traveler_type ? `voyageur ${prefs.traveler_type}` : "",
        ].filter(Boolean).join(" ; ")}.`
      : "";

    const systemPrompt = `${AGENT_PROMPTS[agent]}\n\n${profileLine}\n${prefsLine}`.trim();

    const conv = [
      ...recent.map((m) => ({
        role: (m.role === "assistant" ? "assistant" : "user") as "assistant" | "user",
        content: m.message,
      })),
      { role: "user" as const, content: data.message },
    ];

    let answer: string;
    try {
      const result = await generateText({ model, system: systemPrompt, messages: conv });
      answer = result.text.trim();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("429")) throw new Error("Limite IA atteinte, réessaie dans quelques instants.");
      if (msg.includes("402")) throw new Error("Crédits IA épuisés. Ajoute des crédits dans les paramètres.");
      throw new Error("L'IA est temporairement indisponible.");
    }

    if (userId) {
      await sb.from("conversations").insert({ user_id: userId, role: "assistant", message: answer, agent_used: agent });
    }

    return { reply: answer, agent, persisted: !!userId };
  });

export const getChatHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("conversations")
      .select("id, role, message, agent_used, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) throw new Error(error.message);
    return { messages: data ?? [] };
  });

export const clearChatHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("conversations")
      .delete()
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
