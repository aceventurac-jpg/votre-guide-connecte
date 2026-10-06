import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RageGame, type Level } from "@/components/game/RageGame";
import { CityMode } from "@/components/game/CityMode";

export const Route = createFileRoute("/arcade")({
  head: () => ({
    meta: [
      { title: "Street Arcade — Joue et crée tes niveaux de baston" },
      { name: "description", content: "Beat 'em up rétro en ligne : joue aux niveaux de la communauté et crée les tiens." },
      { property: "og:title", content: "Street Arcade — Joue et crée" },
      { property: "og:description", content: "Beat 'em up rétro : joue et crée tes propres niveaux." },
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

  if (playing) return (
    <div className="min-h-screen bg-background p-4">
      <button onClick={() => setPlaying(null)} className="mb-3 underline">← Retour à l'arcade</button>
      <h1 className="text-xl font-black mb-2">{playing.name}</h1>
      <RageGame key={JSON.stringify(playing) + Date.now()} level={playing} />
    </div>
  );

  const Card = ({ l, del }: { l: Level; del?: () => void }) => (
    <div className="rounded-lg border p-3 flex items-center justify-between gap-2">
      <div><div className="font-bold">{l.name}</div><div className="text-xs text-muted-foreground">{l.theme} · {l.waves.length} vagues{l.boss ? " · boss" : ""}</div></div>
      <div className="flex gap-2">
        {del && <button onClick={() => { navigator.clipboard?.writeText(encode(l)); setMsg("Code copié !"); }} className="text-xs underline">Partager</button>}
        {del && <button onClick={del} className="text-xs text-destructive">Suppr.</button>}
        <button onClick={() => setPlaying(l)} className="px-3 py-1 rounded bg-primary text-primary-foreground font-bold">Jouer</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 max-w-3xl mx-auto space-y-8">
      <Link to="/" className="underline text-sm">← Accueil</Link>
      <header>
        <h1 className="text-4xl font-black tracking-tight">STREET ARCADE</h1>
        <p className="text-muted-foreground">Ici, tu ne fais pas que jouer : tu crées tes propres niveaux.</p>
      </header>

      <section className="space-y-2"><h2 className="font-bold text-lg">Niveaux officiels</h2>{OFFICIAL.map((l) => <Card key={l.name} l={l} />)}</section>

      <section className="space-y-3 rounded-xl border p-4">
        <h2 className="font-bold text-lg">Studio : crée ton niveau</h2>
        <input className="w-full border rounded px-2 py-1 bg-background" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <div className="flex gap-2">{(["night", "neon", "dock"] as const).map((t) => (
          <button key={t} onClick={() => setDraft({ ...draft, theme: t })} className={`px-3 py-1 rounded border ${draft.theme === t ? "bg-primary text-primary-foreground" : ""}`}>{{ night: "Nuit", neon: "Néon", dock: "Docks" }[t]}</button>
        ))}</div>
        <div className="space-y-1">{draft.waves.map((n, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">Vague {i + 1} : <input type="range" min={1} max={6} value={n} onChange={(e) => { const w = [...draft.waves]; w[i] = +e.target.value; setDraft({ ...draft, waves: w }); }} /> {n} voyous
            <button onClick={() => setDraft({ ...draft, waves: draft.waves.filter((_, j) => j !== i) })} className="text-destructive">✕</button></div>
        ))}
          {draft.waves.length < 8 && <button onClick={() => setDraft({ ...draft, waves: [...draft.waves, 3] })} className="text-sm underline">+ Ajouter une vague</button>}
        </div>
        <label className="flex gap-2 text-sm"><input type="checkbox" checked={draft.boss} onChange={(e) => setDraft({ ...draft, boss: e.target.checked })} /> Boss final</label>
        <div className="flex gap-2">
          <button onClick={() => setPlaying(draft)} disabled={!draft.waves.length} className="px-3 py-1 rounded border">Tester</button>
          <button onClick={() => { save([...mine, draft]); setMsg("Niveau enregistré !"); }} disabled={!draft.waves.length} className="px-3 py-1 rounded bg-primary text-primary-foreground font-bold">Enregistrer</button>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold text-lg">Mes créations</h2>
        {mine.length === 0 && <p className="text-sm text-muted-foreground">Aucun niveau pour l'instant.</p>}
        {mine.map((l, i) => <Card key={i} l={l} del={() => save(mine.filter((_, j) => j !== i))} />)}
        <div className="flex gap-2 pt-2">
          <input placeholder="Colle le code d'un ami" className="flex-1 border rounded px-2 py-1 bg-background" value={code} onChange={(e) => setCode(e.target.value)} />
          <button onClick={() => { const l = decode(code); if (l?.waves) { save([...mine, l]); setCode(""); setMsg("Niveau importé !"); } else setMsg("Code invalide"); }} className="px-3 py-1 rounded border">Importer</button>
        </div>
        {msg && <p className="text-sm text-primary">{msg}</p>}
      </section>
    </div>
  );
}
