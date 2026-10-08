import { useEffect, useState } from "react";

export type Difficulty = "facile" | "normal" | "difficile";
export type TouchControls = "auto" | "always" | "never";

export type ArcadeSettings = {
  difficulty: Difficulty;
  screenShake: boolean;
  damageNumbers: boolean;
  touchControls: TouchControls;
  cityTraffic: boolean;
  specialCost: boolean; // la spéciale coûte de la vie
};

export const DEFAULT_ARCADE: ArcadeSettings = {
  difficulty: "normal",
  screenShake: true,
  damageNumbers: true,
  touchControls: "auto",
  cityTraffic: true,
  specialCost: true,
};

const KEY = "street-arcade-settings";

// Multiplicateurs appliqués par le moteur selon la difficulté
export const DIFFICULTY: Record<Difficulty, { label: string; enemyDamage: number; enemySpeed: number; playerHp: number }> = {
  facile: { label: "Facile", enemyDamage: 0.5, enemySpeed: 0.8, playerHp: 150 },
  normal: { label: "Normal", enemyDamage: 1, enemySpeed: 1, playerHp: 100 },
  difficile: { label: "Difficile", enemyDamage: 1.6, enemySpeed: 1.25, playerHp: 70 },
};

function read(): ArcadeSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_ARCADE, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_ARCADE;
}

export function getArcadeSettings(): ArcadeSettings {
  return read();
}

export function useArcadeSettings() {
  const [settings, setSettings] = useState<ArcadeSettings>(DEFAULT_ARCADE);
  useEffect(() => setSettings(read()), []);
  const update = (patch: Partial<ArcadeSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };
  const reset = () => {
    setSettings(DEFAULT_ARCADE);
    localStorage.setItem(KEY, JSON.stringify(DEFAULT_ARCADE));
  };
  return { settings, update, reset };
}
