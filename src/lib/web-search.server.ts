/**
 * Recherche web simple via DuckDuckGo HTML (sans clé API).
 * Retourne 5 résultats max. Best-effort, parsing HTML léger.
 * À n'utiliser que côté serveur (server functions).
 */
export type WebResult = { title: string; url: string; snippet: string };

export async function webSearch(query: string, limit = 5): Promise<WebResult[]> {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Accept: "text/html",
      },
    });
    if (!res.ok) return [];
    const html = await res.text();
    // Pattern : <a class="result__a" href="...">Titre</a> ... <a class="result__snippet">Texte</a>
    const results: WebResult[] = [];
    const blockRe =
      /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
    let m: RegExpExecArray | null;
    while ((m = blockRe.exec(html)) && results.length < limit) {
      const rawUrl = m[1];
      // DDG enveloppe parfois dans /l/?uddg=...
      let finalUrl = rawUrl;
      try {
        const u = new URL(rawUrl, "https://duckduckgo.com");
        const uddg = u.searchParams.get("uddg");
        if (uddg) finalUrl = decodeURIComponent(uddg);
      } catch {
        /* keep raw */
      }
      const stripTags = (s: string) =>
        s
          .replace(/<[^>]+>/g, "")
          .replace(/&amp;/g, "&")
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/\s+/g, " ")
          .trim();
      results.push({
        title: stripTags(m[2]).slice(0, 200),
        url: finalUrl,
        snippet: stripTags(m[3]).slice(0, 300),
      });
    }
    return results;
  } catch (e) {
    console.error("webSearch failed", e);
    return [];
  }
}

/**
 * Détecte si une demande utilisateur cherche un lieu / professionnel / établissement réel.
 */
export function shouldUseWebSearch(message: string): boolean {
  const m = message.toLowerCase();
  const triggers = [
    "médecin",
    "medecin",
    "dentiste",
    "kiné",
    "kine",
    "ophtalmo",
    "pédiatre",
    "pediatre",
    "vétérinaire",
    "veterinaire",
    "pharmacie",
    "hôpital",
    "hopital",
    "clinique",
    "restaurant",
    "resto",
    "boulangerie",
    "café",
    "cafe",
    "bar ",
    "hôtel",
    "hotel",
    "airbnb",
    "commerce",
    "boutique",
    "magasin",
    "plombier",
    "électricien",
    "electricien",
    "artisan",
    "garagiste",
    "avocat",
    "notaire",
    "comptable",
    "salle de sport",
    "club",
    "près de",
    "pres de",
    "proche de",
    "à proximité",
    "a proximite",
    "autour de moi",
    "dans ma ville",
    "où trouver",
    "ou trouver",
    "trouver un",
    "trouver une",
    "trouve un",
    "trouve une",
    "recommande",
    "recommander",
    "adresse",
  ];
  return triggers.some((t) => m.includes(t));
}
