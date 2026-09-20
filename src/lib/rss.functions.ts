import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const RSS_FEEDS = [
  { url: "https://www.lemonde.fr/rss/une.xml", source: "Le Monde", type: "politique", color: "bg-blue-100 text-blue-800" },
  { url: "https://www.lequipe.fr/rss/actu_rss.xml", source: "L'Équipe", type: "sport", color: "bg-green-100 text-green-800" },
  { url: "https://reporterre.net/spip.php?page=backend", source: "Reporterre", type: "écologie", color: "bg-emerald-100 text-emerald-800" },
  { url: "https://www.courrierinternational.com/feed/all/rss.xml", source: "Courrier Int.", type: "international", color: "bg-purple-100 text-purple-800" },
  { url: "https://www.francetvinfo.fr/titres.rss", source: "France TV", type: "général", color: "bg-amber-100 text-amber-800" },
];

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  type: string;
  color: string;
  summary?: string;
}

async function fetchRSSFeed(feedUrl: string, source: string, type: string, color: string): Promise<RSSItem[]> {
  try {
    const response = await fetch(feedUrl, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return [];

    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");

    const items = Array.from(xml.querySelectorAll("item")).slice(0, 3).map((item) => {
      const title = item.querySelector("title")?.textContent || "Sans titre";
      const link = item.querySelector("link")?.textContent || "";
      const description = item.querySelector("description")?.textContent || "";
      const pubDate = item.querySelector("pubDate")?.textContent || "";

      return { title, link, description: description.slice(0, 200), pubDate, source, type, color };
    });

    return items;
  } catch (error) {
    console.error(`Erreur fetch RSS ${source}:`, error);
    return [];
  }
}

export const fetchRSSNews = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const allItems: RSSItem[] = [];

    for (const feed of RSS_FEEDS) {
      const items = await fetchRSSFeed(feed.url, feed.source, feed.type, feed.color);
      allItems.push(...items);
    }

    // Trier par date (les plus récentes d'abord)
    allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    // Limiter à 15 articles
    return { news: allItems.slice(0, 15) };
  } catch (error) {
    console.error("Erreur agrégation RSS:", error);
    return { news: [] };
  }
});
