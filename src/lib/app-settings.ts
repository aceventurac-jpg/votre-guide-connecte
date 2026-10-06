import { useEffect, useState } from "react";

export type GlobalSettings = {
  autoCamera: boolean;
  autoMic: boolean;
  autoLocation: boolean;
  frontCameraFirst: boolean;
  postVisibility: "public" | "abonnes" | "prive";
  autoplayVideos: boolean;
  dataSaver: boolean;
  hudNeon: boolean;
};

export type AppSettings = {
  enabled: boolean;
  notifications: boolean;
  showOnHub: boolean;
  shareToFeed: boolean;
  useLocation: boolean;
  privateMode: boolean;
};

export const APPS: { id: string; label: string; to: string }[] = [
  { id: "social", label: "Fil social", to: "/social" },
  { id: "camera", label: "Caméra & Stories", to: "/camera" },
  { id: "chat", label: "Chat IA", to: "/chat" },
  { id: "community", label: "Communauté", to: "/community" },
  { id: "arcade", label: "Street Arcade", to: "/arcade" },
  { id: "troc", label: "Troc", to: "/troc" },
  { id: "recipes", label: "Recettes", to: "/recipes" },
  { id: "solutions", label: "Solutions à domicile", to: "/solutions" },
  { id: "eco", label: "Action Éco", to: "/eco" },
  { id: "news", label: "Actualités", to: "/news" },
  { id: "health", label: "Coach Santé", to: "/health-coach" },
  { id: "weather", label: "Météo", to: "/weather" },
  { id: "carpool", label: "Covoiturage", to: "/carpool" },
  { id: "btp", label: "BTP & Artisans", to: "/btp" },
  { id: "business", label: "Pro & Commerce", to: "/business" },
  { id: "solidarity", label: "Solidarité", to: "/solidarity" },
  { id: "listings", label: "Annonces", to: "/listings" },
  { id: "forum", label: "Entraide", to: "/forum" },
  { id: "pets", label: "Animaux", to: "/pets" },
  { id: "messages", label: "Messages", to: "/messages" },
  { id: "goals", label: "Objectifs", to: "/goals" },
  { id: "history", label: "Historique", to: "/history" },
];

export const DEFAULT_GLOBAL: GlobalSettings = {
  autoCamera: true,
  autoMic: true,
  autoLocation: false,
  frontCameraFirst: false,
  postVisibility: "public",
  autoplayVideos: true,
  dataSaver: false,
  hudNeon: true,
};

export const DEFAULT_APP: AppSettings = {
  enabled: true,
  notifications: true,
  showOnHub: true,
  shareToFeed: true,
  useLocation: false,
  privateMode: false,
};

const KEY = "socialtown-settings-v1";
type Stored = { global: GlobalSettings; apps: Record<string, AppSettings> };

function read(): Stored {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return { global: { ...DEFAULT_GLOBAL, ...p.global }, apps: p.apps ?? {} };
    }
  } catch {}
  return { global: DEFAULT_GLOBAL, apps: {} };
}

export function useAppSettings() {
  const [state, setState] = useState<Stored>({ global: DEFAULT_GLOBAL, apps: {} });
  useEffect(() => setState(read()), []);
  const save = (s: Stored) => {
    setState(s);
    localStorage.setItem(KEY, JSON.stringify(s));
  };
  return {
    global: state.global,
    app: (id: string): AppSettings => ({ ...DEFAULT_APP, ...state.apps[id] }),
    setGlobal: (patch: Partial<GlobalSettings>) => save({ ...state, global: { ...state.global, ...patch } }),
    setApp: (id: string, patch: Partial<AppSettings>) =>
      save({ ...state, apps: { ...state.apps, [id]: { ...DEFAULT_APP, ...state.apps[id], ...patch } } }),
    reset: () => save({ global: DEFAULT_GLOBAL, apps: {} }),
  };
}
