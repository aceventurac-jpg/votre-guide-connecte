import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, ExternalLink } from "lucide-react";
import { fetchRSSNews } from "@/lib/rss.functions";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "Actualités — Votre Guide" },
      { name: "description", content: "Agrégateur de presse et actualités locales" },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  const newsFn = useServerFn(fetchRSSNews);
  const { data, isLoading } = useQuery({
    queryKey: ["news"],
    queryFn: () => newsFn(),
    refetchInterval: 1000 * 60 * 30, // Rafraîchir toutes les 30 min
  });

  const news = data?.news ?? [];

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-b from-background to-slate-50">
        <div className="max-w-4xl w-full mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 text-white inline-flex items-center justify-center">
              <Newspaper className="size-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Actualités</h1>
              <p className="text-sm text-muted-foreground">Les dernières infos de vos sources préférées</p>
            </div>
          </div>

          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2 w-3/4" />
                  <div className="h-3 bg-muted rounded" />
                </Card>
              ))}
            </div>
          )}

          {!isLoading && news.length === 0 && (
            <Card className="p-8 text-center text-muted-foreground">
              <Newspaper className="size-12 mx-auto mb-3 text-muted-foreground/50" />
              <p>Impossible de charger les actualités pour le moment</p>
              <p className="text-xs mt-2">Réessaie dans quelques instants</p>
            </Card>
          )}

          <div className="space-y-3">
            {news.map((item, idx) => (
              <Card
                key={`${item.source}-${idx}`}
                className="p-4 hover:border-accent transition cursor-pointer hover:bg-card/80"
                onClick={() => window.open(item.link, "_blank")}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold line-clamp-2 mb-1">{item.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={item.color} variant="secondary">
                        {item.source}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.type}
                      </Badge>
                    </div>
                  </div>
                  <ExternalLink className="size-4 text-muted-foreground flex-shrink-0 mt-1" />
                </div>

                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {item.description.replace(/<[^>]*>/g, "")}
                  </p>
                )}

                <p className="text-xs text-muted-foreground">
                  {new Date(item.pubDate).toLocaleDateString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
