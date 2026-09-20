import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPersonalizedNews } from "@/lib/news.functions";
import { ExternalLink, ArrowRight } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";

export function NewsCarousel() {
  const newsFn = useServerFn(getPersonalizedNews);
  const { data } = useQuery({
    queryKey: ["personalized-news-carousel"],
    queryFn: () => newsFn(),
    refetchInterval: 1000 * 60 * 30,
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: true });

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      setCanScroll({
        left: scrollRef.current.scrollLeft > 0,
        right:
          scrollRef.current.scrollLeft <
          scrollRef.current.scrollWidth - scrollRef.current.clientWidth - 10,
      });
    }
  };

  const news = (data?.news || []).slice(0, 10);

  if (news.length === 0) return null;

  return (
    <div className="space-y-3 mb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Ce qui compte</h2>
        <Link to="/whats-important">
          <Button variant="ghost" size="sm" className="gap-1">
            Voir tout <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>

      <div className="relative group">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        >
          {news.map((article) => (
            <Card
              key={article.id}
              className="flex-shrink-0 w-80 p-4 hover:border-accent transition cursor-pointer bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 snap-start"
              onClick={() => window.open(article.link, "_blank")}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge className={`text-xs ${article.color}`}>
                  {article.categoryLabel}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(article.pubDate).toLocaleDateString("fr-FR")}
                </span>
              </div>

              <h3 className="font-semibold line-clamp-2 mb-2 text-sm">
                {article.title}
              </h3>

              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                {article.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {article.source}
                </span>
                <ExternalLink className="size-3 text-accent" />
              </div>
            </Card>
          ))}
        </div>

        {/* Scroll buttons */}
        {canScroll.left && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 size-8 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition hidden group-hover:inline-flex items-center justify-center"
          >
            ←
          </button>
        )}
        {canScroll.right && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 size-8 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition hidden group-hover:inline-flex items-center justify-center"
          >
            →
          </button>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
