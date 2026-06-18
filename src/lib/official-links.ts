// Liste blanche de domaines officiels français/européens reconnus.
// Si une réponse de l'assistant contient un lien vers un de ces domaines,
// on affiche un bouton "Ouvrir le site officiel".
const OFFICIAL_DOMAINS = [
  "service-public.fr",
  "ants.gouv.fr",
  "ameli.fr",
  "caf.fr",
  "urssaf.fr",
  "impots.gouv.fr",
  "interieur.gouv.fr",
  "diplomatie.gouv.fr",
  "france-visas.gouv.fr",
  "douane.gouv.fr",
  "pro.douane.gouv.fr",
  "education.gouv.fr",
  "eduscol.education.fr",
  "lumni.fr",
  "businessfrance.fr",
  "signal.conso.gouv.fr",
  "legifrance.gouv.fr",
  "pole-emploi.fr",
  "francetravail.fr",
  "msa.fr",
  "europa.eu",
  "ec.europa.eu",
];

/** Extrait la première URL officielle d'un texte markdown (sinon null). */
export function findOfficialLink(text: string): string | null {
  const urlRegex = /https?:\/\/[^\s)\]]+/gi;
  const matches = text.match(urlRegex);
  if (!matches) return null;
  for (const raw of matches) {
    // Nettoyage trailing
    const url = raw.replace(/[.,;:!?]+$/, "");
    try {
      const u = new URL(url);
      const host = u.hostname.toLowerCase();
      if (OFFICIAL_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`))) {
        return url;
      }
    } catch {
      /* invalid url, skip */
    }
  }
  return null;
}
