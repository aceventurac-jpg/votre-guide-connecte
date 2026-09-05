import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, ChefHat, Target, HandHeart, PawPrint, Gift, MessageCircle, ArrowRight } from "lucide-react";
import { AGENT_ORDER } from "@/lib/agent-meta";
import { UniverseBubble } from "@/components/UniverseBubble";
import { StoriesStrip } from "@/components/StoriesStrip";
import { getHomePreview } from "@/lib/home.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Assistant Citoyen — Tous les services de votre quotidien" },
      {
        name: "description",
        content:
          "Démarches, santé, voyage, entraide locale, animaux, troc et dons : un assistant IA et une communauté pour simplifier votre quotidien.",
      },
      { property: "og:title", content: "Assistant Citoyen — Tous les services de votre quotidien" },
      { property: "og:description", content: "Un assistant IA et une communauté pour simplifier votre quotidien." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({
      queryKey: ["home-preview"],
      queryFn: () => getHomePreview(),
    }),
  component: Landing,
});

const ESSENTIALS = [
  { to: "/recipes", label: "Mes recettes", desc: "Carnet et menu de la semaine", icon: ChefHat },
  { to: "/goals", label: "Mes objectifs", desc: "Suivi et progression", icon: Target },
  { to: "/forum", label: "Entraide locale", desc: "Un coup de main près de chez moi", icon: HandHeart },
  { to: "/pets", label: "Animaux", desc: "Balades et rencontres", icon: PawPrint },
  { to: "/troc", label: "Troc & Dons", desc: "Donner, échanger, récupérer", icon: Gift },
] as const;

function Landing() {
  const previewFn = useServerFn(getHomePreview);
  const { data } = useQuery({ queryKey: ["home-preview"], queryFn: () => previewFn() });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-4 flex items-center justify-end">
        <Link to="/auth"><Button variant="ghost">Se connecter</Button></Link>
      </header>

      <main className="flex-1">
        <section className="px-6 pt-4 pb-12 max-w-3xl mx-auto text-center space-y-5">
          <div className="mx-auto size-16 rounded-2xl bg-primary text-primary-foreground inline-flex items-center justify-center shadow-lg shadow-primary/25">
            <Sparkles className="size-8" />
          </div>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
            Tous les services de votre quotidien, au même endroit.
          </h1>
          <p className="text-lg text-muted-foreground">
            Démarches, santé, voyage, entraide, animaux&nbsp;: posez votre question, on s'occupe du reste.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-1">
            <Link to="/chat"><Button size="lg">Démarrer le chat</Button></Link>
            <Link to="/community"><Button size="lg" variant="outline">Voir la communauté</Button></Link>
          </div>
        </section>

        <section className="px-6 pb-12 max-w-5xl mx-auto space-y-4">
          <h2 className="text-lg font-semibold">Mes indispensables</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {ESSENTIALS.map(({ to, label, desc, icon: Icon }) => (
              <Link key={to} to={to}>
                <Card className="p-4 h-full hover:border-accent transition flex flex-col gap-2">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center">
                    <Icon className="size-5" />
                  </div>
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="px-6 pb-12 max-w-5xl mx-auto">
          <StoriesStrip />
        </section>

        <section className="px-6 py-12 bg-secondary/40">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MessageCircle className="size-5 text-accent" /> Chat IA
              </h2>
              <Link to="/chat" className="text-sm text-accent inline-flex items-center gap-1">
                Ouvrir le chat <ArrowRight className="size-4" />
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Choisissez un univers ou laissez l'assistant détecter votre besoin.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {AGENT_ORDER.map((k, i) => (
                <UniverseBubble key={k} agent={k} index={i} />
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-12 max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h2 className="font-semibold">Derniers échanges communauté</h2>
            <div className="space-y-2">
              {(data?.posts ?? []).map((p) => (
                <Link key={p.id} to="/community/$id" params={{ id: p.id }}>
                  <Card className="p-3 hover:border-accent transition">
                    <p className="text-sm line-clamp-2">{p.content}</p>
                  </Card>
                </Link>
              ))}
              {(!data?.posts || data.posts.length === 0) && (
                <p className="text-sm text-muted-foreground">Pas encore de publication.</p>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="font-semibold">Dernières annonces</h2>
            <div className="space-y-2">
              {(data?.listings ?? []).map((l) => (
                <Link key={l.id} to="/listings/$id" params={{ id: l.id }}>
                  <Card className="p-3 hover:border-accent transition">
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
        </section>
      </main>

      <footer className="px-6 py-6 text-center text-xs text-muted-foreground border-t">
        © Assistant Citoyen — Informations à titre indicatif. Vérifiez toujours auprès des organismes officiels.
      </footer>
    </div>
  );
}
