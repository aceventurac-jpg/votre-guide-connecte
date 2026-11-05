export const CITY_BOUNDS = { width: 1920, minY: 735, maxY: 955 };
export const PORTAL_RADIUS = 150;
export function moveTowner(x: number, y: number, dx: number, dy: number, delta: number) {
  const step = 260 * Math.min(Math.max(delta, 0), 0.05);
  return { x: Math.max(60, Math.min(CITY_BOUNDS.width - 60, x + dx * step)), y: Math.max(CITY_BOUNDS.minY, Math.min(CITY_BOUNDS.maxY, y + dy * step)) };
}
export const CITY_PORTALS = [
  { id: "recipes", label: "Halles culinaires", to: "/recipes", x: 210, y: 780 },
  { id: "troc", label: "Atelier du troc", to: "/troc", x: 490, y: 800 },
  { id: "social", label: "Place des expériences", to: "/social", x: 770, y: 800 },
  { id: "mall", label: "Centre commercial", to: null, x: 1180, y: 775 },
  { id: "camera", label: "Studio caméra", to: "/camera", x: 1460, y: 800 },
  { id: "mission", label: "Arène Street Arcade", to: null, x: 1750, y: 790 },
] as const;
export function nearbyPortal(x: number, y: number) {
  return CITY_PORTALS.find(p => Math.hypot(p.x - x, p.y - y) <= PORTAL_RADIUS);
}
export const SHOPPING_CENTRES = [
  { id: "leers", name: "Aushopping Leers", city: "Leers", country: "France", address: "1 Avenue de l’Europe, 59115 Leers", url: "https://leers.aushopping.com/", directory: "https://leers.aushopping.com/magasins-galerie", shops: ["Auchan", "Jules", "Kiko", "Nocibé", "Adopt", "5ÀSEC"] },
  { id: "tournai", name: "Shopping les Bastions", city: "Tournai", country: "Belgique", address: "Accès principal : Boulevard Walter de Marvis", url: "https://lesbastions.be/fr", directory: "https://lesbastions.be/fr/boutiques", shops: ["A.S. Adventure", "Action", "Alain Afflelou", "Boulangerie Louise", "Eyes and More", "Kiabi"] },
] as const;