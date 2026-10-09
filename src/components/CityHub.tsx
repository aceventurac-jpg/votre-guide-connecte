import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useConnectivity, type NetState } from "@/hooks/use-connectivity";
import { useIsAuthed } from "@/hooks/use-auth";
import { useAppSettings } from "@/lib/app-settings";
import cityImg from "@/assets/socialtown-city.jpg";

type Uni = { name: string; icon: string; to: string; live: boolean; keys: string; app: string };
type District = {
  id: string; name: string; tagline: string; imaginary: string; color: string;
  x: number; y: number; items: Uni[];
};

const DISTRICTS: District[] = [
  { id: "market", name: "Market District", tagline: "Marché flottant des canaux", color: "var(--color-town-lemon)", x: 22, y: 62,
    imaginary: "Halles de verre au bord de l'eau, étals partagés, troc et cuisine anti-gaspi.",
    items: [
      { name: "Épicerie", icon: "🛒", to: "/listings", live: false, keys: "courses bio épicerie", app: "listings" },
      { name: "Scan frigo", icon: "📷", to: "/recipes", live: false, keys: "scan caméra frigo", app: "recipes" },
      { name: "Jouets", icon: "🧸", to: "/troc", live: true, keys: "jouet", app: "troc" },
      { name: "Vêtements", icon: "👕", to: "/troc", live: true, keys: "vêtement mode", app: "troc" },
      { name: "Fournitures", icon: "🎒", to: "/listings", live: true, keys: "fourniture scolaire", app: "listings" },
      { name: "Recettes", icon: "🍳", to: "/recipes", live: true, keys: "recette cuisine", app: "recipes" },
    ]},
  { id: "mobility", name: "Mobility Grid", tagline: "Viaducs et lignes lumineuses", color: "var(--color-town-cyan)", x: 80, y: 40,
    imaginary: "Ponts suspendus, navettes silencieuses et trajets partagés entre quartiers.",
    items: [
      { name: "Parking", icon: "🅿️", to: "/carpool", live: false, keys: "parking garer", app: "carpool" },
      { name: "AutoShare", icon: "🚗", to: "/carpool", live: true, keys: "covoiturage trajet", app: "carpool" },
      { name: "Climat", icon: "🌦️", to: "/weather", live: true, keys: "météo climat", app: "weather" },
    ]},
  { id: "community", name: "Community Plaza", tagline: "La grande place centrale", color: "var(--color-town-coral)", x: 50, y: 30,
    imaginary: "Le cœur de la ville : écrans géants, salle d'arcade rétro, scène des créateurs.",
    items: [
      { name: "SocialFeed", icon: "👥", to: "/social", live: true, keys: "social fil", app: "social" },
      { name: "Caméra", icon: "🎥", to: "/camera", live: true, keys: "caméra story vidéo", app: "camera" },
      { name: "Agenda", icon: "📅", to: "/eco", live: true, keys: "agenda événement", app: "eco" },
      { name: "Objectifs", icon: "🎯", to: "/goals", live: true, keys: "objectif", app: "goals" },
      { name: "Street Arcade", icon: "🥊", to: "/arcade", live: true, keys: "jeu arcade baston combat", app: "arcade" },
    ]},
  { id: "life", name: "Life Gardens", tagline: "Jardins suspendus et habitat", color: "var(--color-neon-green)", x: 30, y: 82,
    imaginary: "Terrasses végétales, maisons connectées, animaux et bien-être au calme.",
    items: [
      { name: "ImmoTown", icon: "🏠", to: "/solutions", live: false, keys: "logement immo", app: "solutions" },
      { name: "Services maison", icon: "🔧", to: "/solutions", live: true, keys: "chaudière réparer ménage", app: "solutions" },
      { name: "Énergie", icon: "⚡", to: "/eco", live: false, keys: "énergie", app: "eco" },
      { name: "Déchets", icon: "♻️", to: "/eco", live: true, keys: "déchet collecte", app: "eco" },
      { name: "Animaux", icon: "🐕", to: "/pets", live: true, keys: "animal chien chat", app: "pets" },
      { name: "Bien-être", icon: "🧠", to: "/health-coach", live: true, keys: "santé sport bien-être", app: "health" },
    ]},
  { id: "knowledge", name: "Knowledge Towers", tagline: "Tours du savoir et des métiers", color: "var(--color-troc)", x: 72, y: 76,
    imaginary: "Bibliothèques verticales, ateliers d'entrepreneurs et portes vers le monde.",
    items: [
      { name: "Tutorat", icon: "🎓", to: "/listings", live: true, keys: "professeur cours", app: "listings" },
      { name: "Tourisme", icon: "🧳", to: "/chat", live: false, keys: "voyage tourisme", app: "chat" },
      { name: "Entrepreneurs", icon: "💼", to: "/business", live: true, keys: "pro entreprise", app: "business" },
    ]},
];

const netColor: Record<NetState, string> = {
  ONLINE: "var(--color-neon-green)", CONNECTING: "var(--color-town-lemon)",
  DEGRADED: "var(--color-town-lemon)", OFFLINE: "var(--color-town-coral)",
};

function Dot({ c }: { c: string }) {
  return <span className="inline-block size-2 rounded-full mr-1.5 motion-safe:animate-pulse" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />;
}

export function CityHub() {
  const { net, latency, geo, setGeo } = useConnectivity();
  const { authed } = useIsAuthed();
  const settings = useAppSettings();
  const [active, setActive] = useState<string>("community");
  const [q, setQ] = useState("");
  const [listening, setListening] = useState(false);

  const visible = (u: Uni) => { const c = settings.app(u.app); return c.enabled && c.showOnHub; };
  const districts = DISTRICTS.map((d) => ({ ...d, items: d.items.filter(visible) }));
  const all = districts.flatMap((d) => d.items.map((u) => ({ ...u, d })));
  const matches = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return all.filter((u) => (u.name + " " + u.keys).toLowerCase().split(" ").some((w) => w.length > 2 && s.includes(w)) || u.name.toLowerCase().includes(s));
  }, [q, all]);
  const district = districts.find((d) => d.id === active);
  const liveCount = all.filter((u) => u.live).length;

  function voice() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setQ("Commande vocale non prise en charge par ce navigateur"); return; }
    const r = new SR(); r.lang = "fr-FR";
    r.onresult = (e: any) => setQ(e.results[0][0].transcript);
    r.onend = () => setListening(false);
    setListening(true); r.start();
  }
  function locate() {
    navigator.geolocation?.getCurrentPosition(() => setGeo("AVAILABLE"), () => setGeo("DENIED"));
  }

  return (
    <div className="min-h-screen bg-town text-foreground font-[family-name:var(--font-body)] relative overflow-x-hidden" style={{ color: "#e8eef2" }}>
      {/* HUD rétro */}
      <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-town/85 backdrop-blur border-b border-town-cyan/20 font-mono">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-md border-2 border-town-coral flex items-center justify-center text-xl shadow-[0_0_14px_var(--color-town-coral)]">🧑‍🚀</div>
          <div>
            <p className="text-town-cyan font-bold tracking-[0.25em] text-xs">SOCIALTOWN</p>
            <p className="text-[10px] text-town-cyan/60">TOWNER {authed ? "CONNECTÉ" : "INVITÉ"} · NIV 1 · XP 0/100</p>
          </div>
        </div>
        <div className="hidden md:flex gap-4 text-[10px] tracking-wider text-town-cyan/80">
          <span><Dot c={netColor[net]} />NETWORK {net}{latency != null && net !== "OFFLINE" ? ` ${latency}ms` : ""}</span>
          <button onClick={locate}><Dot c={geo === "AVAILABLE" ? "var(--color-neon-green)" : geo === "DENIED" ? "var(--color-town-coral)" : "var(--color-town-lemon)"} />GEO {geo}</button>
          <span><Dot c="var(--color-town-cyan)" />LIVE {liveCount}/{all.length}</span>
        </div>
        <div className="flex gap-2 items-center">
          <span className="px-2.5 py-1 rounded border border-town-lemon/60 text-town-lemon text-xs">🪙 0</span>
          <Link to="/settings" aria-label="Réglages" className="px-2.5 py-1 rounded border border-town-cyan/40 text-town-cyan text-xs">⚙</Link>
          {authed === false && <Link to="/auth" className="px-3 py-1 rounded bg-town-coral text-town text-xs font-bold">PRESS START</Link>}
        </div>
      </header>

      {/* Ville immersive */}
      <section className="relative h-[78vh] min-h-[520px] w-full overflow-hidden">
        <img src={cityImg} alt="Vue aérienne de la ville futuriste de SocialTown, avec canaux, jardins et tours" className="absolute inset-0 size-full object-cover scale-105" />
        <div className="absolute inset-0 bg-gradient-to-b from-town/70 via-town/10 to-town" />
        <div className="pointer-events-none absolute inset-0 opacity-20 bg-[repeating-linear-gradient(0deg,transparent_0_2px,rgba(0,0,0,0.7)_2px_4px)]" />

        {DISTRICTS.map((d) => (
          <button key={d.id} onClick={() => setActive(d.id)}
            className="absolute -translate-x-1/2 -translate-y-1/2 group hidden sm:block"
            style={{ left: `${d.x}%`, top: `${d.y}%` }}>
            <span className="block size-3 mx-auto rounded-full motion-safe:animate-ping absolute left-1/2 -translate-x-1/2 -top-4" style={{ background: d.color }} />
            <span className="block size-3 mx-auto rounded-full absolute left-1/2 -translate-x-1/2 -top-4" style={{ background: d.color, boxShadow: `0 0 14px ${d.color}` }} />
            <span className={`block px-3 py-1.5 rounded-md backdrop-blur bg-town/70 border text-xs font-bold font-[family-name:var(--font-display)] tracking-wide transition group-hover:scale-105 ${active === d.id ? "scale-105" : ""}`}
              style={{ borderColor: d.color, color: d.color, boxShadow: active === d.id ? `0 0 22px ${d.color}` : undefined }}>
              {d.name}
            </span>
          </button>
        ))}

        <div className="absolute inset-x-0 top-[10%] px-5 text-center">
          <p className="font-mono text-[11px] tracking-[0.4em] text-town-lemon">◆ PLAYER ONE · READY ◆</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] font-extrabold text-4xl sm:text-6xl lg:text-7xl leading-[0.95]">
            Une ville à explorer.<br /><span className="text-town-cyan">Des mondes à créer.</span>
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base text-white/75">
            Chaque quartier de SocialTown ouvre un imaginaire différent. Joue, publie ton expérience, construis tes propres niveaux.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/arcade" className="px-5 py-2.5 rounded-md bg-town-coral text-town font-bold text-sm shadow-[0_0_20px_var(--color-town-coral)]">▶ Jouer</Link>
            <Link to="/arcade" className="px-5 py-2.5 rounded-md border border-town-lemon text-town-lemon font-bold text-sm">✦ Créer un niveau</Link>
            <Link to="/camera" className="px-5 py-2.5 rounded-md border border-town-cyan text-town-cyan font-bold text-sm">● Publier</Link>
          </div>
        </div>

        {/* Console */}
        <div className="absolute inset-x-0 bottom-6 px-4">
          <div className="max-w-2xl mx-auto flex gap-2 rounded-lg border border-town-cyan/50 bg-town/80 backdrop-blur p-2 font-mono">
            <span className="text-town-coral self-center pl-1">&gt;</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Rechercher dans la ville" placeholder="trouve un parking, une recette, un jeu…"
              className="flex-1 min-w-0 bg-transparent outline-none text-sm text-town-cyan placeholder:text-town-cyan/40" />
            <button onClick={voice} aria-label="Commande vocale" className={`px-2 rounded border border-town-coral text-town-coral text-xs ${listening ? "animate-pulse" : ""}`}>🎤</button>
            <Link to="/chat" className="px-2 rounded border border-neon-green text-neon-green text-xs flex items-center">IA</Link>
          </div>
          {matches.length > 0 && (
            <div className="max-w-2xl mx-auto mt-2 flex flex-wrap gap-2">
              {matches.map((u) => (
                <Link key={u.d.id + u.name} to={u.to} className="px-3 py-1.5 rounded border text-xs bg-town/90" style={{ borderColor: u.d.color, color: u.d.color }}>
                  {u.icon} {u.name} · {u.d.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quartiers */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <p className="font-mono text-[11px] tracking-[0.35em] text-town-cyan/70">QUARTIERS</p>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {districts.map((d) => (
            <button key={d.id} onClick={() => setActive(d.id)}
              className="shrink-0 px-4 py-2 rounded-full border text-sm font-[family-name:var(--font-display)] font-bold transition"
              style={{ borderColor: d.color, color: active === d.id ? "#080c10" : d.color, background: active === d.id ? d.color : "transparent" }}>
              {d.name}
            </button>
          ))}
        </div>

        {district && (
          <div className="mt-6 grid lg:grid-cols-[1fr_2fr] gap-6">
            <div className="rounded-xl border p-6 bg-town-panel" style={{ borderColor: district.color }}>
              <p className="font-mono text-[11px] tracking-widest" style={{ color: district.color }}>{district.tagline.toUpperCase()}</p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold">{district.name}</h2>
              <p className="mt-3 text-sm text-white/70">{district.imaginary}</p>
              <p className="mt-4 text-xs text-white/50">{district.items.length} univers visibles · masque ou active-les dans les <Link to="/settings" className="underline">réglages</Link>.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {district.items.length === 0 && <p className="text-sm text-white/60">Tous les univers de ce quartier sont masqués dans tes réglages.</p>}
              {district.items.map((u) => (
                <Link key={u.name} to={u.to} className="rounded-xl border border-white/10 bg-town-panel p-4 hover:border-town-cyan transition">
                  <div className="text-3xl">{u.icon}</div>
                  <div className="mt-2 font-bold text-sm">{u.name}</div>
                  <div className={`mt-1 font-mono text-[10px] ${u.live ? "text-neon-green" : "text-town-lemon"}`}>{u.live ? "● LIVE" : "◐ PILOTE"}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
        <p className="mt-6 font-mono text-[10px] text-white/40">PILOTE = aucun fournisseur réel connecté : aucune réservation ni paiement n'est effectué.</p>
      </section>
    </div>
  );
}
