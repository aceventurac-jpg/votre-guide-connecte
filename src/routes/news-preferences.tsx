import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { CheckCircle2, Settings } from "lucide-react";

export const Route = createFileRoute("/news-preferences")({
  head: () => ({
    meta: [
      { title: "Mes préférences — Ce qui compte" },
      { name: "description", content: "Personnalise tes actualités" },
    ],
  }),
  component: NewsPreferencesPage,
});

const ALL_CATEGORIES = [
  { key: "actualite-generale", label: "Actualité générale" },
  { key: "investigation", label: "Investigation" },
  { key: "international", label: "International" },
  { key: "economie", label: "Économie" },
  { key: "sport", label: "Sport" },
  { key: "ecologie", label: "Écologie" },
  { key: "culture", label: "Culture" },
  { key: "science", label: "Science & Tech" },
  { key: "local", label: "Local" },
  { key: "alternatif", label: "Alternatif" },
];

const ALL_SOURCES = [
  { key: "lemonde", label: "Le Monde" },
  { key: "francetvinfo", label: "France TV" },
  { key: "20minutes", label: "20 Minutes" },
  { key: "bfmtv", label: "BFM TV" },
  { key: "liberation", label: "Libération" },
  { key: "lefigaro", label: "Le Figaro" },
  { key: "mediapart", label: "Mediapart" },
  { key: "blast", label: "Blast" },
  { key: "disclose", label: "Disclose" },
  { key: "arretsurimages", label: "Arrêt sur images" },
  { key: "courrier", label: "Courrier Int." },
  { key: "rfi", label: "RFI" },
  { key: "france24", label: "France 24" },
  { key: "bbci", label: "BBC" },
  { key: "tv5", label: "TV5" },
  { key: "lesechos", label: "Les Échos" },
  { key: "latribune", label: "La Tribune" },
  { key: "capital", label: "Capital" },
  { key: "bfmbusiness", label: "BFM Business" },
  { key: "lequipe", label: "L'Équipe" },
  { key: "rmcsport", label: "RMC Sport" },
  { key: "sofoot", label: "So Foot" },
  { key: "eurosport", label: "Eurosport" },
  { key: "footmercato", label: "Foot Mercato" },
  { key: "reporterre", label: "Reporterre" },
  { key: "bonpote", label: "Bon Pote" },
  { key: "monde-diplomatique", label: "Monde Diplo" },
  { key: "telerama", label: "Télérama" },
  { key: "lesinrocks", label: "Les Inrocks" },
  { key: "slate", label: "Slate" },
  { key: "sciencesetavenir", label: "Sciences et Avenir" },
  { key: "numerama", label: "Numerama" },
  { key: "futura", label: "Futura" },
  { key: "ouest-france", label: "Ouest-France" },
  { key: "lavoixdunord", label: "La Voix du Nord" },
  { key: "sudouest", label: "Sud Ouest" },
  { key: "ladepeche", label: "La Dépêche" },
  { key: "leparisien", label: "Le Parisien" },
  { key: "leprogres", label: "Le Progrès" },
  { key: "lamontagne", label: "La Montagne" },
  { key: "lemedia", label: "Le Média" },
  { key: "bastamag", label: "Basta!" },
  { key: "politis", label: "Politis" },
  { key: "regards", label: "Regards" },
];

function NewsPreferencesPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPreferences() {
      const { data: user } = await (supabase as any).auth.getUser();
      if (!user?.user?.id) return;

      const { data } = await (supabase as any)
        .from("news_preferences")
        .select("*")
        .eq("user_id", user.user.id)
        .single();

      if (data) {
        setSelectedCategories(data.categories);
        setSelectedSources(data.sources);
      } else {
        setSelectedCategories(
          ALL_CATEGORIES.slice(0, 5).map((c) => c.key)
        );
        setSelectedSources(
          ALL_SOURCES.slice(0, 8).map((s) => s.key)
        );
      }
      setLoading(false);
    }
    loadPreferences();
  }, []);

  async function savePreferences() {
    const { data: user } = await (supabase as any).auth.getUser();
    if (!user?.user?.id) return;

    const { data: existing } = await (supabase as any)
      .from("news_preferences")
      .select("*")
      .eq("user_id", user.user.id)
      .single();

    if (existing) {
      await (supabase as any)
        .from("news_preferences")
        .update({
          categories: selectedCategories,
          sources: selectedSources,
        })
        .eq("user_id", user.user.id);
    } else {
      await (supabase as any).from("news_preferences").insert({
        user_id: user.user.id,
        categories: selectedCategories,
        sources: selectedSources,
      });
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-b from-background to-slate-50 dark:to-slate-900">
        <div className="max-w-3xl w-full mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-8">
            <Settings className="size-6 text-accent" />
            <h1 className="text-3xl font-bold">Mes préférences actualités</h1>
          </div>

          <div className="space-y-8">
            {/* Catégories */}
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Catégories</h2>
              <p className="text-sm text-muted-foreground">
                Sélectionne les catégories qui t'intéressent
              </p>
              <div className="flex flex-wrap gap-2">
                {ALL_CATEGORIES.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() =>
                      setSelectedCategories((prev) =>
                        prev.includes(key)
                          ? prev.filter((c) => c !== key)
                          : [...prev, key]
                      )
                    }
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      selectedCategories.includes(key)
                        ? "bg-accent text-white"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </Card>

            {/* Sources */}
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Sources</h2>
              <p className="text-sm text-muted-foreground">
                Choisis les médias que tu veux suivre ({selectedSources.length}/{ALL_SOURCES.length})
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ALL_SOURCES.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() =>
                      setSelectedSources((prev) =>
                        prev.includes(key)
                          ? prev.filter((s) => s !== key)
                          : [...prev, key]
                      )
                    }
                    className={`px-3 py-2 rounded text-sm font-medium transition text-left flex items-center gap-2 ${
                      selectedSources.includes(key)
                        ? "bg-accent text-white"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {selectedSources.includes(key) && (
                      <CheckCircle2 className="size-4 flex-shrink-0" />
                    )}
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Info algo */}
            <Card className="p-4 bg-accent/10 border-accent/20 space-y-2">
              <p className="text-sm font-medium text-accent">
                💡 Algorithme personnalisé
              </p>
              <p className="text-xs text-muted-foreground">
                Tes actualités seront composées à 70% de tes préférences et 30% de découverte pour
                rester informé des sujets émergents. L'algorithme se renforce avec tes interactions
                (likes, shares, saves).
              </p>
            </Card>

            {/* Save Button */}
            <div className="flex gap-3">
              <Button
                onClick={savePreferences}
                size="lg"
                className="flex-1"
                disabled={saved}
              >
                {saved ? "✓ Préférences sauvegardées" : "Sauvegarder"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
