import { FileText, Stethoscope, Plane, Wrench, Globe2, GraduationCap, Sparkles, HandHeart, PawPrint, ChefHat, type LucideIcon } from "lucide-react";

export type AgentKey =
  | "administratif" | "sante" | "voyage"
  | "services_locaux" | "commerce_international" | "apprentissage" | "general";

export const AGENT_META: Record<AgentKey, {
  label: string;
  icon: LucideIcon;
  color: string;        // background tint (oklch)
  ring: string;         // ring color
  accent: string;       // text accent (foreground over color)
  description: string;
}> = {
  administratif: {
    label: "Administratif", icon: FileText,
    color: "oklch(0.94 0.05 240)", ring: "oklch(0.55 0.13 240)", accent: "oklch(0.35 0.13 240)",
    description: "Papiers, CAF, impôts, ANTS",
  },
  sante: {
    label: "Santé & Sport", icon: Stethoscope,
    color: "oklch(0.94 0.06 25)", ring: "oklch(0.6 0.14 25)", accent: "oklch(0.42 0.14 25)",
    description: "Soins, ordonnances, entraînement",
  },
  voyage: {
    label: "Voyage", icon: Plane,
    color: "oklch(0.94 0.05 200)", ring: "oklch(0.6 0.12 200)", accent: "oklch(0.4 0.12 200)",
    description: "Visa, billets, itinéraires",
  },
  services_locaux: {
    label: "Services Locaux", icon: Wrench,
    color: "oklch(0.94 0.05 70)", ring: "oklch(0.62 0.12 70)", accent: "oklch(0.42 0.12 70)",
    description: "Artisans, avocats, devis",
  },
  commerce_international: {
    label: "Commerce Int.", icon: Globe2,
    color: "oklch(0.93 0.05 340)", ring: "oklch(0.58 0.13 340)", accent: "oklch(0.4 0.13 340)",
    description: "Douane, import/export, UE",
  },
  apprentissage: {
    label: "Apprentissage", icon: GraduationCap,
    color: "oklch(0.94 0.06 145)", ring: "oklch(0.55 0.13 145)", accent: "oklch(0.38 0.13 145)",
    description: "Devoirs, révisions, maternelle",
  },
  general: {
    label: "Général", icon: Sparkles,
    color: "oklch(0.94 0.02 280)", ring: "oklch(0.55 0.05 280)", accent: "oklch(0.4 0.05 280)",
    description: "Toute autre question",
  },
};

export const AGENT_ORDER: AgentKey[] = [
  "administratif","sante","voyage","services_locaux","commerce_international","apprentissage",
];

// Catégories de posts communautaires (inclut les univers ci-dessus + des univers
// purement communautaires qui ne correspondent pas à un agent IA dédié).
export type PostCategoryKey =
  | "administratif" | "sante" | "voyage" | "services_locaux"
  | "commerce_international" | "apprentissage"
  | "entraide" | "animaux" | "cuisine";

export const POST_CATEGORY_META: Record<PostCategoryKey, { label: string; icon: LucideIcon }> = {
  administratif: { label: "Administratif", icon: FileText },
  sante: { label: "Santé & Sport", icon: Stethoscope },
  voyage: { label: "Voyage", icon: Plane },
  services_locaux: { label: "Services Locaux", icon: Wrench },
  commerce_international: { label: "Commerce Int.", icon: Globe2 },
  apprentissage: { label: "Apprentissage", icon: GraduationCap },
  entraide: { label: "Entraide locale", icon: HandHeart },
  animaux: { label: "Animaux", icon: PawPrint },
  cuisine: { label: "Cuisine", icon: ChefHat },
};

export const POST_CATEGORY_ORDER: PostCategoryKey[] = [
  "administratif","sante","voyage","services_locaux","commerce_international",
  "apprentissage","entraide","animaux","cuisine",
];
