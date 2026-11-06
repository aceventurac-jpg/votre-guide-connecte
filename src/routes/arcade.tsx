import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Gamepad2, Play, Plus, Settings, Share2, Trash2, Wrench, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UniverseFrame } from "@/components/UniverseFrame";
import districtImage from "@/assets/street-arcade-district.jpg";
import { RageGame, type Level } from "@/components/game/RageGame";
import { CityMode } from "@/components/game/CityMode";
import { DIFFICULTY, useArcadeSettings, type ArcadeSettings } from "@/lib/arcade-settings";

export const Route = createFileRoute("/arcade")({
  head: () => ({
    meta: [
      { title: "Street Arcade — Explore et joue dans SocialTown" },
      { name: "description", content: "Explore les quais futuristes de SocialTown, entre dans les applications et crée tes niveaux de combat local." },
      { property: "og:title", content: "Street Arcade — La ville SocialTown" },
      { property: "og:description", content: "Personnages réalistes, promenade interactive et combats locaux dans l’univers SocialTown." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Arcade,
});

const OFFICIAL: Level[] = [
  { name: "Rue de la Nuit", theme: "night", waves: [2, 3], boss: false },
  { name: "Quartier Néon", theme: "neon", waves: [2, 3, 4], boss: true },
  { name: "Les Docks", theme: "dock", waves: [3, 4, 5], boss: true },
];
const KEY = "street-arcade-levels";

function encode(l: Level) { return btoa(unescape(encodeURIComponent(JSON.stringify(l)))); }
function decode(s: string): Level | null { try { return JSON.parse(decodeURIComponent(escape(atob(s.trim())))); } catch { return null; } }

function Arcade() {
  const [mine, setMine] = useState<Level[]>([]);
  const [playing, setPlaying] = useState<Level | null>(null);
  const [draft, setDraft] = useState<Level>({ name: "Mon niveau", theme: "neon", waves: [2, 3], boss: true });
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [city, setCity] = useState(false);

  useEffect(() => { try { setMine(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch {} }, []);
  const save = (list: Level[]) => { setMine(list); localStorage.setItem(KEY, JSON.stringify(list)); };

  if (city) return (
    <UniverseFrame><div className="mx-auto max-w-5xl p-4 sm:p-8">
      <h1 className="text-xl font-black mb-2">VILLE LIBRE</h1>
      <CityMode onExit={() => setCity(false)} />
    </div></UniverseFrame>
  );

  if (playing) return (
    <UniverseFrame><div className="mx-auto max-w-5xl p-4 sm:p-8">
      <Button onClick={() => setPlaying(null)} variant="ghost" className="mb-3"><ArrowLeft /> Retour à l'arcade</Button>
      <h1 className="text-xl font-black mb-2">{playing.name}</h1>
      <RageGame key={JSON.stringify(playing)} level={playing} />
    </div></UniverseFrame>
  );

  const Card = ({ l, del }: { l: Level; del?: () => void }) => (
    <article className="overflow-hidden rounded-lg border border-border bg-card">
      {!del && <div className="arcade-level-image relative overflow-hidden"><img src={districtImage} alt="Quartier Street Arcade au bord du canal" width={1536} height={1024} loading="lazy" className={`h-full w-full object-cover ${l.theme === "night" ? "object-left" : l.theme === "dock" ? "object-bottom" : "object-right"}`} /><span className="absolute bottom-3 left-3 rounded bg-background/90 px-2 py-1 font-mono text-xs text-primary">{l.theme === "night" ? "01 / RUE" : l.theme === "neon" ? "02 / ARÈNE" : "03 / DOCKS"}</span></div>}
      <div className="p-4"><h3 className="text-lg font-bold">{l.name}</h3><p className="mt-1 text-xs text-muted-foreground">{l.waves.length} vagues{l.boss ? " · Boss final" : " · Combat de rue"}</p>
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] text-muted-foreground">{del ? "SUR CET APPAREIL" : "JEU LOCAL"}</span>
        <div className="flex gap-1">
        {del && <Button variant="ghost" size="icon" title="Copier le code" aria-label="Copier le code" onClick={() => { navigator.clipboard?.writeText(encode(l)); setMsg("Code copié !"); }}><Share2 /></Button>}
        {del && <Button variant="ghost" size="icon" title="Supprimer le niveau" aria-label="Supprimer le niveau" onClick={del}><Trash2 /></Button>}
        <Button onClick={() => setPlaying(l)} size="sm"><Play /> Jouer</Button>
      </div></div></div>
    </article>
  );

  return (
    <UniverseFrame>
      <section className="universe-cover relative overflow-hidden">
        <img src={districtImage} alt="Street Arcade : pavillon rétro et arène lumineuse au bord des canaux de SocialTown" width={1536} height={1024} className="absolute inset-0 size-full object-cover" />
        <div className="universe-cover-shade absolute inset-0" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-5 sm:px-8">
          <p className="mb-5 font-mono text-xs text-town-lemon">COMMUNITY PLAZA / QUARTIER 01</p>
          <h1 className="font-display text-5xl font-extrabold leading-none sm:text-7xl">STREET<br /><span className="text-town-coral">ARCADE</span></h1>
          <p className="mt-5 max-w-sm text-sm text-foreground sm:text-base">Les quais, la rue, l’arène.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button onClick={() => setCity(true)} className="bg-accent text-accent-foreground hover:bg-accent/90"><Gamepad2 /> Entrer dans la ville</Button>
            <Button variant="outline" onClick={() => document.getElementById("arcade-studio")?.scrollIntoView({ behavior: "smooth" })}><Wrench /> Créer un niveau</Button>
          </div>
          <p className="mt-5 font-mono text-[10px] text-muted-foreground">EXPLORATION & COMBATS LOCAUX · SANS MULTIJOUEUR</p>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-10 px-4 pb-12 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <p className="font-mono text-xs text-primary">STREET ARCADE / SÉLECTION</p>
          <Button variant="ghost" onClick={() => document.getElementById("arcade-settings")?.scrollIntoView({ behavior: "smooth" })}><Settings /> Paramètres</Button>
        </div>
        <section className="space-y-4"><h2 className="text-2xl font-bold">Choisis ton terrain</h2><div className="grid gap-4 md:grid-cols-3">{OFFICIAL.map((l) => <Card key={l.name} l={l} />)}</div></section>
      <section id="arcade-studio" className="scroll-mt-24 space-y-4 border-t border-border pt-8">
        <h2 className="font-bold text-2xl">Atelier de création</h2>
        <input aria-label="Nom du niveau" className="w-full border rounded px-2 py-1 bg-background" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <div className="flex gap-2">{(["night", "neon", "dock"] as const).map((t) => (
          <Button key={t} onClick={() => setDraft({ ...draft, theme: t })} className={`px-3 py-1 rounded border ${draft.theme === t ? "bg-primary text-primary-foreground" : ""}`}>{{ night: "Nuit", neon: "Néon", dock: "Docks" }[t]}</Button>
        ))}</div>
        <div className="space-y-1">{draft.waves.map((n, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">Vague {i + 1} : <input aria-label={`Ennemis de la vague ${i + 1}`} type="range" min={1} max={6} value={n} onChange={(e) => { const w = [...draft.waves]; w[i] = +e.target.value; setDraft({ ...draft, waves: w }); }} /> {n} voyous
            <Button onClick={() => setDraft({ ...draft, waves: draft.waves.filter((_, j) => j !== i) })} variant="ghost" size="icon" aria-label={`Supprimer la vague ${i + 1}`} className="text-destructive"><X /></Button></div>
        ))}
          {draft.waves.length < 8 && <Button onClick={() => setDraft({ ...draft, waves: [...draft.waves, 3] })} variant="ghost"><Plus /> Ajouter une vague</Button>}
        </div>
        <label className="flex gap-2 text-sm"><input type="checkbox" checked={draft.boss} onChange={(e) => setDraft({ ...draft, boss: e.target.checked })} /> Boss final</label>
        <div className="flex gap-2">
          <Button onClick={() => setPlaying(draft)} disabled={!draft.waves.length} className="px-3 py-1 rounded border">Tester</Button>
          <Button onClick={() => { save([...mine, draft]); setMsg("Niveau enregistré !"); }} disabled={!draft.waves.length} className="px-3 py-1 rounded bg-primary text-primary-foreground font-bold">Enregistrer</Button>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold text-lg">Mes créations</h2>
        {mine.length === 0 && <p className="text-sm text-muted-foreground">Aucun niveau pour l'instant.</p>}
        {mine.map((l, i) => <Card key={i} l={l} del={() => save(mine.filter((_, j) => j !== i))} />)}
        <div className="flex flex-wrap gap-2 pt-2">
          <input aria-label="Code de niveau" placeholder="Code de niveau" className="flex-1 border rounded px-2 py-1 bg-background" value={code} onChange={(e) => setCode(e.target.value)} />
          <Button onClick={() => { const l = decode(code); if (l?.waves) { save([...mine, l]); setCode(""); setMsg("Niveau importé !"); } else setMsg("Code invalide"); }} className="px-3 py-1 rounded border">Importer</Button>
        </div>
        {msg && <p className="text-sm text-primary">{msg}</p>}
      </section>

      <ArcadeSettingsPanel />
      </div>
    </UniverseFrame>
  );
}

function ArcadeSettingsPanel() {
  const { settings, update, reset } = useArcadeSettings();

  const Toggle = ({ k, label, hint }: { k: keyof ArcadeSettings; label: string; hint?: string }) => (
    <label className="flex items-center justify-between gap-3 py-2">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
      <input
        type="checkbox"
        className="size-5 accent-primary"
        checked={Boolean(settings[k])}
        onChange={(e) => update({ [k]: e.target.checked } as Partial<ArcadeSettings>)}
      />
    </label>
  );

  return (
    <section id="arcade-settings" className="scroll-mt-24 space-y-4 border-t border-border pt-8">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-xl">Paramètres Street Arcade</h2>
        <Button onClick={reset} className="text-xs underline text-muted-foreground">Réinitialiser</Button>
      </div>

      <div>
        <div className="text-sm font-medium mb-1">Difficulté</div>
        <div className="flex gap-2">
          {(Object.keys(DIFFICULTY) as (keyof typeof DIFFICULTY)[]).map((d) => (
            <Button
              key={d}
              onClick={() => update({ difficulty: d })}
              className={`px-3 py-1 rounded border text-sm ${settings.difficulty === d ? "bg-primary text-primary-foreground" : ""}`}
            >
              {DIFFICULTY[d].label}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Facile : 150 PV, ennemis lents · Normal : 100 PV · Difficile : 70 PV, ennemis rapides et violents.
        </p>
      </div>

      <div className="divide-y">
        <Toggle k="screenShake" label="Tremblement d'écran" hint="Secousse lors des coups portés." />
        <Toggle k="damageNumbers" label="Chiffres de dégâts" hint="Affiche les dégâts au-dessus des ennemis." />
        <Toggle k="specialCost" label="La spéciale coûte de la vie" hint="Comme dans les beat 'em up classiques." />
        <Toggle k="cityTraffic" label="Trafic en ville" hint="Véhicules conduisibles en Ville Libre." />
      </div>

      <div>
        <div className="text-sm font-medium mb-1">Contrôles tactiles</div>
        <div className="flex gap-2">
          {([["auto", "Auto"], ["always", "Toujours"], ["never", "Jamais"]] as const).map(([v, label]) => (
            <Button
              key={v}
              onClick={() => update({ touchControls: v })}
              className={`px-3 py-1 rounded border text-sm ${settings.touchControls === v ? "bg-primary text-primary-foreground" : ""}`}
            >
              {label}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Auto : boutons affichés uniquement sur mobile.</p>
      </div>

      <p className="text-xs text-muted-foreground">Les réglages s'appliquent à la prochaine partie lancée et sont gardés sur cet appareil.</p>
    </section>
  );
}
