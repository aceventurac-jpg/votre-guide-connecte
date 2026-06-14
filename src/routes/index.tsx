import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle, Users, ShieldCheck, FileText, Stethoscope, Plane, Wrench, Globe2, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Assistant Citoyen — Pose ta question, on s'occupe du reste" },
      { name: "description", content: "Un assistant IA qui détecte ton besoin et te connecte au bon expert : démarches, santé, voyage, services locaux, commerce international, apprentissage." },
      { property: "og:title", content: "Assistant Citoyen" },
      { property: "og:description", content: "Pose ta question, on s'occupe du reste." },
    ],
  }),
  component: Landing,
});

const agents = [
  { icon: FileText, label: "Administratif" },
  { icon: Stethoscope, label: "Santé" },
  { icon: Plane, label: "Voyage" },
  { icon: Wrench, label: "Services Locaux" },
  { icon: Globe2, label: "Commerce International" },
  { icon: GraduationCap, label: "Apprentissage" },
];

function Landing() {
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
        <section className="px-6 py-16 md:py-24 max-w-4xl mx-auto text-center space-y-6">
          <span className="badge-agent"><Sparkles className="size-3" /> 6 agents spécialisés</span>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
            Pose ta question,
            <br />
            <span className="text-accent">on s'occupe du reste.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Un chat unique. Notre orchestrateur détecte automatiquement ton besoin et appelle l'expert adapté.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link to="/auth"><Button size="lg">Commencer gratuitement</Button></Link>
            <Link to="/auth"><Button size="lg" variant="outline">Découvrir les annonces</Button></Link>
          </div>
        </section>

        <section className="px-6 py-12 bg-secondary/50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider mb-8">
              Six expertises, une seule conversation
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {agents.map(({ icon: Icon, label }) => (
                <div key={label} className="bg-card rounded-2xl p-5 border flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-mauve-soft text-accent inline-flex items-center justify-center">
                    <Icon className="size-5" />
                  </div>
                  <span className="font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-16 max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { icon: MessageCircle, t: "Un seul chat", d: "Une interface naturelle, l'orchestrateur route ta question au bon agent." },
            { icon: Users, t: "Annonces communautaires", d: "Vente, location, covoiturage, services, tutorat — avec messagerie sécurisée." },
            { icon: ShieldCheck, t: "Confiance intégrée", d: "Profils vérifiés, avis, signalements et conseils de sécurité." },
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
