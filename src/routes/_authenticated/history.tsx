import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getChatHistory } from "@/lib/chat.functions";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { FileText, Stethoscope, Plane, Wrench, Globe2, GraduationCap, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "Historique — Assistant Citoyen" }] }),
  component: HistoryPage,
});

const AGENT_META = {
  administratif: { label: "Administratif", icon: FileText },
  sante: { label: "Santé", icon: Stethoscope },
  voyage: { label: "Voyage", icon: Plane },
  services_locaux: { label: "Services Locaux", icon: Wrench },
  commerce_international: { label: "Commerce International", icon: Globe2 },
  apprentissage: { label: "Apprentissage", icon: GraduationCap },
  general: { label: "Général", icon: Sparkles },
} as const;
type AgentKey = keyof typeof AGENT_META;

function HistoryPage() {
  const fetchFn = useServerFn(getChatHistory);
  const { data } = useQuery({ queryKey: ["chat-history"], queryFn: () => fetchFn() });
  const messages = (data?.messages ?? []).slice().reverse();

  // group by date
  const groups = new Map<string, typeof messages>();
  for (const m of messages) {
    const d = new Date(m.created_at).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
    const arr = groups.get(d) ?? [];
    arr.push(m);
    groups.set(d, arr);
  }

  return (
    <AppShell>
      <div className="max-w-3xl w-full mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Historique des conversations</h1>
          <p className="text-sm text-muted-foreground">Toutes tes échanges, regroupés par jour.</p>
        </div>

        {messages.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">Pas encore de messages.</Card>
        )}

        {Array.from(groups.entries()).map(([day, items]) => (
          <div key={day} className="space-y-2">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground">{day}</h2>
            <Card className="divide-y">
              {items.map((m) => {
                const meta = m.agent_used ? AGENT_META[m.agent_used as AgentKey] : null;
                return (
                  <div key={m.id} className="p-4 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {m.role === "user" ? "Toi" : "Assistant"}
                      </span>
                      {meta && (
                        <span className="badge-agent text-[10px] py-0.5">
                          <meta.icon className="size-3" /> {meta.label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm line-clamp-3">{m.message}</p>
                  </div>
                );
              })}
            </Card>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
