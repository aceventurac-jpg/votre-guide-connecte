import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, MessageCircle, Users, ShieldCheck } from "lucide-react";
import { AGENT_ORDER, AGENT_META, type AgentKey } from "@/lib/agent-meta";
import { UniverseBubble } from "@/components/UniverseBubble";
import { getHomePreview } from "@/lib/home.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Assistant Citoyen — Pose ta question, on s'occupe du reste" },
      { name: "description", content: "Un assistant IA qui détecte ton besoin et te connecte au bon expert : démarches, santé, voyage, services locaux, commerce international, apprentissage." },
      { property: "og:title", content: "Assistant Citoyen" },
      { property: "og:description", content: "Pose ta question, on s'occupe du reste." },
    ],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({
      queryKey: ["home-preview"],
      queryFn: () => getHomePreview(),
    }),
  component: Landing,
});

function Landing() {
  const previewFn = useServerFn(getHomePreview);
  const { data } = useQuery({
    queryKey: ["home-preview"],
    queryFn: () => previewFn(),
  });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <div className="size-9 rounded-xl bg-primary text-primary-foreground inline-flex items-center justify-center">
            <Sparkles className="size-5" />
          </div>
          Assistant Citoyen
        </div>
        <Link to="/auth"><Button variant="ghost">Se connecter</Button></Link>
      </header>

      <main className="flex-1">
        <section className="px-6 py-14 md:py-20 max-w-4xl mx-auto text-center space-y-5">
          <span className="badge-agent"><Sparkles className="size-3" /> 6 agents spécialisés</span>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
            Pose ta question,
            <br />
            <span className="text-accent">on s'occupe du reste.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choisis un univers ou laisse l'orchestrateur détecter ton besoin.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link to="/chat"><Button size="lg">Démarrer le chat</Button></Link>
            <Link to="/community"><Button size="lg" variant="outline">Voir la communauté</Button></Link>
          </div>
        </section>

        <section className="px-6 pb-14 max-w-5xl mx-auto">
          <h2 className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
            Choisis un univers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {AGENT_ORDER.map((k, i) => (
              <UniverseBubble key={k} agent={k} index={i} />
            ))}
          </div>
        </section>

        <section className="px-6 py-12 bg-secondary/40">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2"><Users className="size-4 text-accent" /> Derniers échanges communauté</h3>
              <div className="space-y-2">
                {(data?.posts ?? []).map((p) => {
                  const m = AGENT_META[p.category as AgentKey];
                  const label = m?.label ?? p.category;
                  return (
                    <Link key={p.id} to="/community/$id" params={{ id: p.id }}>
                      <Card className="p-3 hover:border-accent transition">
                        <div className="text-[11px] mb-1 text-accent">{label}</div>
                        <p className="text-sm line-clamp-2">{p.content}</p>
                      </Card>
                    </Link>
                  );
                })}
                {(!data?.posts || data.posts.length === 0) && (
                  <p className="text-sm text-muted-foreground">Pas encore de publication.</p>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2"><ShieldCheck className="size-4 text-accent" /> Dernières annonces</h3>
              <div className="space-y-2">
                {(data?.listings ?? []).map((l) => (
                  <Link key={l.id} to="/listings/$id" params={{ id: l.id }}>
                    <Card className="p-3 hover:border-accent transition">
                      <div className="text-[11px] mb-1 text-muted-foreground">{l.category} · {l.listing_type}</div>
                      <p className="text-sm font-medium line-clamp-1">{l.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{l.description}</p>
                    </Card>
                  </Link>
                ))}
                {(!data?.listings || data.listings.length === 0) && (
                  <p className="text-sm text-muted-foreground">Pas encore d'annonce.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-14 max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { icon: MessageCircle, t: "Un seul chat", d: "L'orchestrateur route ta question au bon agent." },
            { icon: Users, t: "Communauté entraidante", d: "Pose tes questions, partage tes retours d'expérience." },
            { icon: ShieldCheck, t: "Confiance intégrée", d: "Profils vérifiés, avis, signalements et sécurité." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="space-y-2">
              <div className="size-10 rounded-xl bg-primary/15 text-primary inline-flex items-center justify-center">
                <Icon className="size-5" />
              </div>
              <h3 className="font-semibold">{t}</h3>
              <p className="text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="px-6 py-6 text-center text-xs text-muted-foreground border-t">
        © Assistant Citoyen — Informations à titre indicatif. Vérifiez toujours auprès des organismes officiels.
      </footer>
    </div>
  );
}
