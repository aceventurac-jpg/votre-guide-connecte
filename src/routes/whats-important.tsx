import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPersonalizedNews, trackNewsInteraction, type RSSItem } from "@/lib/news.functions";
import { useIsAuthed } from "@/hooks/use-auth";
import {
  ExternalLink,
  Share2,
  Heart,
  Bookmark,
  Filter,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/whats-important")({
  head: () => ({
    meta: [
      { title: "Ce qui compte — Votre Guide" },
      {
        name: "description",
        content:
          "Les actualités qui comptent vraiment, sans le bruit. Algorithmiquement personnalisées.",
      },
    ],
  }),
  component: WhatsImportantPage,
});

const CATEGORIES = [
  { key: "all", label: "Tout" },
  { key: "local", label: "Local" },
  { key: "ecologie", label: "Éco" },
  { key: "actualite-generale", label: "Général" },
  { key: "sport", label: "Sport" },
  { key: "investigation", label: "Investigation" },
  { key: "science", label: "Science" },
];

function NewsCard({ article, onAction }: { article: RSSItem; onAction: (action: string) => void }) {
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);

  return (
    <Card className="p-5 hover:border-accent transition bg-gradient-to-br from-slate-950 to-slate-900 border-slate-800">
      <div className="flex items-start justify-between gap-3 mb-3">
        <Badge className={article.color}>{article.categoryLabel}</Badge>
        <Badge variant="outline" className="text-xs">
          {article.source}
        </Badge>
      </div>

      <h3 className="font-semibold text-lg mb-2 line-clamp-3 text-white">
        {article.title}
      </h3>

      {article.description && (
        <p className="text-sm text-slate-400 line-clamp-2 mb-3">
          {article.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
        <span>
          {new Date(article.pubDate).toLocaleDateString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <span>~2 min</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={() => {
            window.open(article.link, "_blank");
            onAction("view");
          }}
          size="sm"
          className="flex-1 gap-2"
        >
          <ExternalLink className="size-4" /> Lire
        </Button>

        <Button
          onClick={() => {
            setLiked(!liked);
            onAction("like");
          }}
          size="sm"
          variant={liked ? "default" : "outline"}
          className="gap-2"
        >
          <Heart className={`size-4 ${liked ? "fill-current" : ""}`} />
        </Button>

        <Button
          onClick={() => {
            setSaved(!saved);
            onAction("save");
          }}
          size="sm"
          variant={saved ? "default" : "outline"}
          className="gap-2"
        >
          <Bookmark className={`size-4 ${saved ? "fill-current" : ""}`} />
        </Button>

        <Button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: article.title,
                text: article.description,
                url: article.link,
              });
            }
            onAction("share");
          }}
          size="sm"
          variant="outline"
          className="gap-2"
        >
          <Share2 className="size-4" />
        </Button>
      </div>
    </Card>
  );
}

function WhatsImportantPage() {
  const { authed } = useIsAuthed();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const newsFn = useServerFn(getPersonalizedNews);
  const trackFn = useServerFn(trackNewsInteraction);

  const { data, isLoading } = useQuery({
    queryKey: ["personalized-news", authed],
    queryFn: () => newsFn(),
    refetchInterval: 1000 * 60 * 30, // 30 minutes
  });

  const filteredNews =
    selectedCategory === "all"
      ? data?.news || []
      : (data?.news || []).filter((n) => n.category === selectedCategory);

  const handleAction = async (article: RSSItem, action: string) => {
    try {
      await trackFn({
        articleUrl: article.link,
        action: action as "view" | "like" | "share" | "save",
      });
    } catch (error) {
      console.error("Erreur tracking:", error);
    }
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="max-w-3xl w-full mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 space-y-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-8 text-teal-400" />
              <h1 className="text-4xl md:text-5xl font-bold">Ce qui compte</h1>
            </div>
            <p className="text-lg text-slate-400">
              Sans le bruit. Sélectionnées et organisées juste pour toi.
            </p>
            {authed && (
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <span className="size-2 bg-teal-400 rounded-full" />
                70% tes préférences + 30% découverte
              </p>
            )}
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-slate-800 overflow-x-auto">
            <Filter className="size-5 text-slate-500 flex-shrink-0 mt-1" />
            {CATEGORIES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedCategory === key
                    ? "bg-teal-600 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Articles Feed */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card
                  key={i}
                  className="p-5 animate-pulse bg-slate-900 border-slate-800"
                >
                  <div className="h-4 bg-slate-800 rounded mb-3 w-2/3" />
                  <div className="h-6 bg-slate-800 rounded mb-2 w-full" />
                  <div className="h-3 bg-slate-800 rounded w-full mb-1" />
                  <div className="h-3 bg-slate-800 rounded w-4/5" />
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredNews.length === 0 && (
            <Card className="p-8 text-center bg-slate-900 border-slate-800">
              <AlertCircle className="size-12 mx-auto mb-3 text-slate-600" />
              <p className="text-slate-400">Pas d'articles dans cette catégorie</p>
              <p className="text-xs text-slate-500 mt-2">
                {authed
                  ? "Personnalise tes préférences pour voir plus d'articles"
                  : "Connecte-toi pour des recommandations personnalisées"}
              </p>
            </Card>
          )}

          <div className="space-y-4">
            {filteredNews.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                onAction={(action) => handleAction(article, action)}
              />
            ))}
          </div>

          {/* Info algo */}
          <Card className="mt-12 p-4 bg-slate-900 border-slate-800">
            <p className="text-xs text-slate-500">
              💡 Notre algorithme combine tes préférences avec les tendances du moment. Plus
              tu interagis, plus c'est personnalisé. Testé et approuvé pour citadins comme
              ruraux.
            </p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
