import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
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
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SendInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Configuration IA manquante.");

    const { generateText } = await import("ai");
    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const { AGENT_PROMPTS, ORCHESTRATOR_PROMPT } = await import("./agents.server");

    const gateway = createLovableAiGatewayProvider(apiKey);
    const model = gateway("google/gemini-3-flash-preview");

    const [{ data: profile }, { data: prefs }, { data: history }] = await Promise.all([
      supabase.from("profiles").select("name, city, country, profile_type").eq("id", userId).maybeSingle(),
      supabase.from("user_preferences").select("*").eq("user_id", userId).maybeSingle(),
      supabase
        .from("conversations")
        .select("role, message, agent_used")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(12),
    ]);

    const recent = (history ?? []).reverse();

    await supabase.from("conversations").insert({
      user_id: userId,
      role: "user",
      message: data.message,
    });

    // Agent : préféré (bulle cliquée) sinon orchestrateur
    let agent: AgentKey = data.preferred_agent ?? "general";
    if (!data.preferred_agent) {
      try {
        const detect = await generateText({
          model,
          system: ORCHESTRATOR_PROMPT,
          prompt: data.message,
        });
        const raw = detect.text.trim().toLowerCase().replace(/[^a-z_]/g, "");
        if ((VALID_AGENTS as readonly string[]).includes(raw)) agent = raw as AgentKey;
      } catch (e) {
        console.error("Intent detection failed", e);
      }
    }

    // 4) Agent spécialisé répond
    const profileLine = profile
      ? `Profil utilisateur : ${profile.name || "inconnu"}${profile.city ? `, ${profile.city}` : ""}${profile.country ? ` (${profile.country})` : ""}, type : ${profile.profile_type ?? "particulier"}.`
      : "";
    const prefsLine = prefs
      ? `Préférences : ${[
          prefs.interests?.length ? `intérêts ${prefs.interests.join(", ")}` : "",
          prefs.travel_style ? `voyage ${prefs.travel_style}` : "",
          prefs.budget ? `budget ${prefs.budget}` : "",
          prefs.family_status ? `situation ${prefs.family_status}` : "",
          prefs.traveler_type ? `voyageur ${prefs.traveler_type}` : "",
        ]
          .filter(Boolean)
          .join(" ; ")}.`
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
      const result = await generateText({
        model,
        system: systemPrompt,
        messages: conv,
      });
      answer = result.text.trim();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("429")) throw new Error("Limite IA atteinte, réessaie dans quelques instants.");
      if (msg.includes("402")) throw new Error("Crédits IA épuisés. Ajoute des crédits dans les paramètres.");
      throw new Error("L'IA est temporairement indisponible.");
    }

    await supabase.from("conversations").insert({
      user_id: userId,
      role: "assistant",
      message: answer,
      agent_used: agent,
    });

    return { reply: answer, agent };
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
