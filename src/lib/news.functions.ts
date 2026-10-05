import { createServerFn } from "@tanstack/react-start";

export interface RSSItem {
  id: string;
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  sourceKey: string;
  category: string;
  categoryLabel: string;
  color: string;
  region?: string;
  summary?: string;
  image?: string;
}

const RSS_SOURCES = {
  "actualite-generale": {
    label: "Actualité générale",
    color: "bg-slate-900 text-white",
    feeds: [
      "https://www.lemonde.fr/rss/une.xml",
      "https://www.francetvinfo.fr/titres.rss",
      "https://www.20minutes.fr/feeds/rss/une",
      "https://www.bfmtv.com/rss/news-flux-rss",
      "https://www.liberation.fr/arc/outboundfeeds/rss",
      "https://www.lefigaro.fr/rss/figaro_actualites.xml",
    ],
  },
  investigation: {
    label: "Investigation",
    color: "bg-red-100 text-red-900",
    feeds: [
      "https://www.mediapart.fr/articles/feed",
      "https://blast-info.fr/feed",
      "https://disclose.ngo/feed",
      "https://arretsurimages.net/feed",
    ],
  },
  international: {
    label: "International",
    color: "bg-purple-900 text-white",
    feeds: [
      "https://www.courrierinternational.com/feed/all/rss.xml",
      "https://www.rfi.fr/fr/rss",
      "https://www.france24.com/fr/rss",
      "https://feeds.bbci.co.uk/afrique/rss.xml",
      "https://www.tv5monde.com/rss",
    ],
  },
  economie: {
    label: "Économie",
    color: "bg-amber-100 text-amber-900",
    feeds: [
      "https://www.lesechos.fr/rss/rss_une.xml",
      "https://www.latribune.fr/rss/une.xml",
      "https://www.capital.fr/rss",
      "https://bfmbusiness.bfmtv.com/rss/news-flux-rss",
    ],
  },
  sport: {
    label: "Sport",
    color: "bg-teal-100 text-teal-900",
    feeds: [
      "https://www.lequipe.fr/rss/actu_rss.xml",
      "https://rmcsport.bfmtv.com/rss/news-flux-rss",
      "https://www.sofoot.com/feed",
      "https://www.eurosport.fr/rss.xml",
      "https://www.footmercato.net/flux-rss",
    ],
  },
  ecologie: {
    label: "Écologie",
    color: "bg-green-100 text-green-900",
    feeds: [
      "https://reporterre.net/spip.php?page=backend",
      "https://bonpote.com/feed",
      "https://monde-diplomatique.fr/rss/",
    ],
  },
  culture: {
    label: "Culture",
    color: "bg-pink-100 text-pink-900",
    feeds: [
      "https://www.telerama.fr/rss/programme-tv.xml",
      "https://www.lesinrocks.com/feed",
      "https://www.slate.fr/rss.xml",
    ],
  },
  science: {
    label: "Science & Tech",
    color: "bg-cyan-100 text-cyan-900",
    feeds: [
      "https://sciencesetavenir.fr/rss.xml",
      "https://www.numerama.com/feed",
      "https://www.futura-sciences.com/rss/actualites.xml",
    ],
  },
  local: {
    label: "Local",
    color: "bg-orange-100 text-orange-900",
    feeds: [
      "https://www.ouest-france.fr/rss",
      "https://www.lavoixdunord.fr/rss.xml",
      "https://www.sudouest.fr/rss.xml",
      "https://www.ladepeche.fr/rss.xml",
      "https://www.leparisien.fr/arc/outboundfeeds/rss",
      "https://www.leprogres.fr/rss.xml",
      "https://www.lamontagne.fr/rss.xml",
    ],
  },
  alternatif: {
    label: "Alternatif",
    color: "bg-indigo-100 text-indigo-900",
    feeds: [
      "https://lemedia.fr/feed",
      "https://bastamag.net/spip.php?page=backend",
      "https://politis.fr/feed",
      "https://regards.fr/feed",
    ],
  },
};

async function fetchRSSFeed(
  feedUrl: string,
  sourceKey: string,
  category: string
): Promise<RSSItem[]> {
  try {
    const response = await fetch(feedUrl, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return [];

    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");

    const items = Array.from(xml.querySelectorAll("item"))
      .slice(0, 5)
      .map((item, idx) => {
        const title = item.querySelector("title")?.textContent || "Sans titre";
        const link = item.querySelector("link")?.textContent || "";
        const description = item.querySelector("description")?.textContent || "";
        const pubDate = item.querySelector("pubDate")?.textContent || "";
        const image = item.querySelector("image url")?.textContent || "";

        const source = Object.entries(RSS_SOURCES).find(
          ([_, meta]) => meta.feeds.includes(feedUrl)
        );
        const sourceLabel = source
          ? feedUrl.includes("lemonde")
            ? "Le Monde"
            : feedUrl.includes("francetvinfo")
              ? "France TV"
              : feedUrl.includes("20minutes")
                ? "20 Minutes"
                : feedUrl.includes("bfmtv")
                  ? "BFM TV"
                  : feedUrl.includes("liberation")
                    ? "Libération"
                    : feedUrl.includes("figaro")
                      ? "Le Figaro"
                      : feedUrl.includes("mediapart")
                        ? "Mediapart"
                        : feedUrl.includes("blast")
                          ? "Blast"
                          : feedUrl.includes("disclose")
                            ? "Disclose"
                            : feedUrl.includes("arretsurimages")
                              ? "Arrêt sur images"
                              : feedUrl.includes("courrier")
                                ? "Courrier Int."
                                : feedUrl.includes("rfi")
                                  ? "RFI"
                                  : feedUrl.includes("france24")
                                    ? "France 24"
                                    : feedUrl.includes("bbci")
                                      ? "BBC"
                                      : feedUrl.includes("tv5")
                                        ? "TV5"
                                        : feedUrl.includes("lesechos")
                                          ? "Les Échos"
                                          : feedUrl.includes("latribune")
                                            ? "La Tribune"
                                            : feedUrl.includes("capital")
                                              ? "Capital"
                                              : feedUrl.includes("bfmbusiness")
                                                ? "BFM Business"
                                                : feedUrl.includes("lequipe")
                                                  ? "L'Équipe"
                                                  : feedUrl.includes("rmcsport")
                                                    ? "RMC Sport"
                                                    : feedUrl.includes("sofoot")
                                                      ? "So Foot"
                                                      : feedUrl.includes("eurosport")
                                                        ? "Eurosport"
                                                        : feedUrl.includes("footmercato")
                                                          ? "Foot Mercato"
                                                          : feedUrl.includes("reporterre")
                                                            ? "Reporterre"
                                                            : feedUrl.includes("bonpote")
                                                              ? "Bon Pote"
                                                              : feedUrl.includes("monde-diplomatique")
                                                                ? "Monde Diplo"
                                                                : feedUrl.includes("telerama")
                                                                  ? "Télérama"
                                                                  : feedUrl.includes("lesinrocks")
                                                                    ? "Les Inrocks"
                                                                    : feedUrl.includes("slate")
                                                                      ? "Slate"
                                                                      : feedUrl.includes("sciencesetavenir")
                                                                        ? "Sciences et Avenir"
                                                                        : feedUrl.includes("numerama")
                                                                          ? "Numerama"
                                                                          : feedUrl.includes("futura")
                                                                            ? "Futura"
                                                                            : feedUrl.includes("ouest-france")
                                                                              ? "Ouest-France"
                                                                              : feedUrl.includes("lavoixdunord")
                                                                                ? "La Voix du Nord"
                                                                                : feedUrl.includes("sudouest")
                                                                                  ? "Sud Ouest"
                                                                                  : feedUrl.includes("ladepeche")
                                                                                    ? "La Dépêche"
                                                                                    : feedUrl.includes("leparisien")
                                                                                      ? "Le Parisien"
                                                                                      : feedUrl.includes("leprogres")
                                                                                        ? "Le Progrès"
                                                                                        : feedUrl.includes("lamontagne")
                                                                                          ? "La Montagne"
                                                                                          : feedUrl.includes("lemedia")
                                                                                            ? "Le Média"
                                                                                            : feedUrl.includes("bastamag")
                                                                                              ? "Basta!"
                                                                                              : feedUrl.includes("politis")
                                                                                                ? "Politis"
                                                                                                : feedUrl.includes("regards")
                                                                                                  ? "Regards"
                                                                                                  : "Source"
          : "Source";

        const categoryMeta = RSS_SOURCES[category as keyof typeof RSS_SOURCES];

        return {
          id: `${sourceKey}-${idx}-${Date.now()}`,
          title,
          link,
          description: description.replace(/<[^>]*>/g, "").slice(0, 200),
          pubDate,
          source: sourceLabel,
          sourceKey,
          category,
          categoryLabel: categoryMeta?.label || category,
          color: categoryMeta?.color || "bg-slate-100 text-slate-900",
          image,
        };
      });

    return items;
  } catch (error) {
    console.error(`Erreur fetch RSS ${feedUrl}:`, error);
    return [];
  }
}

export const fetchIntelligentNews = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const allItems: RSSItem[] = [];

      // Fetch from all categories
      for (const [categoryKey, categoryMeta] of Object.entries(RSS_SOURCES)) {
        for (const feedUrl of categoryMeta.feeds) {
          const items = await fetchRSSFeed(feedUrl, categoryKey, categoryKey);
          allItems.push(...items);
        }
      }

      // Deduplicate by title
      const seen = new Set<string>();
      const unique = allItems.filter((item) => {
        if (seen.has(item.title)) return false;
        seen.add(item.title);
        return true;
      });

      // Sort by date (most recent first)
      unique.sort(
        (a, b) =>
          new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      );

      return { news: unique.slice(0, 50) };
    } catch (error) {
      console.error("Erreur agrégation RSS:", error);
      return { news: [] };
    }
  }
);

// Get personalized news feed based on user preferences (70% preferences + 30% discovery)
export const getPersonalizedNews = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      // Fetch all news
      const allNews = await fetchIntelligentNews();

      // Note: For authenticated users, personalization would be done client-side
      // or via a separate endpoint that has access to auth context
      // For now, return trending news ranked by recency
      const scoredNews = allNews.news.map((article) => {
        // Recency boost (30%)
        const hoursSince =
          (Date.now() - new Date(article.pubDate).getTime()) / (1000 * 60 * 60);
        const recencyBoost = Math.max(0, 0.3 * (1 - hoursSince / 48)); // Boost for articles < 48h

        // Engagement score based on category diversity
        const categoryScores: { [key: string]: number } = {
          "actualite-generale": 0.3,
          investigation: 0.25,
          international: 0.25,
          economie: 0.2,
          sport: 0.25,
          ecologie: 0.35,
          culture: 0.2,
          science: 0.25,
          local: 0.3,
          alternatif: 0.2,
        };

        const categoryScore =
          categoryScores[article.category as keyof typeof categoryScores] || 0.2;
        const score = categoryScore + recencyBoost;

        return { ...article, score };
      });

      // Sort by score and return top 15
      const personalized = scoredNews
        .sort((a, b) => b.score - a.score)
        .slice(0, 15)
        .map(({ score, ...article }) => article);

      return { news: personalized, personalized: false };
    } catch (error) {
      console.error("Erreur recommandation:", error);
      return { news: [], personalized: false };
    }
  }
);

// Track user interaction with article (no storage table yet)
export const trackNewsInteraction = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => data as { articleUrl: string; action: "view" | "like" | "share" | "save"; duration?: number })
  .handler(async ({ data }) => ({ success: true, action: data.action }));
