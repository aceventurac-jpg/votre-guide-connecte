import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useConnectivity, type NetState } from "@/hooks/use-connectivity";
import { useIsAuthed } from "@/hooks/use-auth";

type Uni = { name: string; icon: string; to: string; live: boolean; keys: string };
type District = { id: string; name: string; color: string; x: number; y: number; items: Uni[] };

const DISTRICTS: District[] = [
  { id: "market", name: "MARKET DISTRICT", color: "var(--color-neon-yellow)", x: 20, y: 28, items: [
    { name: "Épicerie", icon: "🛒", to: "/listings", live: false, keys: "courses bio épicerie" },
    { name: "Scan", icon: "📷", to: "/recipes", live: false, keys: "scan caméra" },
    { name: "Jouets", icon: "🧸", to: "/troc", live: true, keys: "jouet" },
    { name: "Vêtements", icon: "👕", to: "/troc", live: true, keys: "vêtement mode" },
    { name: "Fournitures", icon: "🎒", to: "/listings", live: true, keys: "fourniture scolaire" },
    { name: "Recettes", icon: "🍳", to: "/recipes", live: true, keys: "recette cuisine" },
  ]},
  { id: "mobility", name: "MOBILITY GRID", color: "var(--color-neon-cyan)", x: 78, y: 26, items: [
    { name: "Parking", icon: "🅿️", to: "/carpool", live: false, keys: "parking garer" },
    { name: "AutoShare", icon: "🚗", to: "/carpool", live: true, keys: "covoiturage trajet" },
    { name: "Climat", icon: "🌦️", to: "/weather", live: true, keys: "météo climat" },
  ]},
  { id: "community", name: "COMMUNITY PLAZA", color: "var(--color-neon-pink)", x: 50, y: 14, items: [
    { name: "SocialFeed", icon: "👥", to: "/social", live: true, keys: "social fil" },
    { name: "Agenda", icon: "📅", to: "/eco", live: true, keys: "agenda événement" },
    { name: "Objectifs", icon: "🎯", to: "/goals", live: true, keys: "objectif" },
    { name: "Street Arcade", icon: "🥊", to: "/arcade", live: true, keys: "jeu arcade baston combat" },
  ]},
  { id: "life", name: "LIFE DISTRICT", color: "var(--color-neon-green)", x: 24, y: 74, items: [
    { name: "ImmoTown", icon: "🏠", to: "/solutions", live: false, keys: "logement immo" },
    { name: "Services maison", icon: "🔧", to: "/solutions", live: true, keys: "chaudière réparer ménage" },
    { name: "Énergie", icon: "⚡", to: "/eco", live: false, keys: "énergie" },
    { name: "Déchets", icon: "♻️", to: "/eco", live: true, keys: "déchet collecte" },
    { name: "Animaux", icon: "🐕", to: "/pets", live: true, keys: "animal chien chat" },
    { name: "Bien-être", icon: "🧠", to: "/health-coach", live: true, keys: "santé sport bien-être" },
  ]},
  { id: "knowledge", name: "KNOWLEDGE ZONE", color: "var(--color-troc)", x: 76, y: 74, items: [
    { name: "Tutorat", icon: "🎓", to: "/listings", live: true, keys: "professeur cours" },
    { name: "Tourisme", icon: "🧳", to: "/chat", live: false, keys: "voyage tourisme" },
    { name: "Entrepreneurs", icon: "💼", to: "/business", live: true, keys: "pro entreprise" },
  ]},
];

const netColor: Record<NetState, string> = {
  ONLINE: "var(--color-neon-green)", CONNECTING: "var(--color-neon-yellow)",
  DEGRADED: "var(--color-neon-yellow)", OFFLINE: "var(--color-neon-red)",
};

function Dot({ c }: { c: string }) {
  return <span className="inline-block size-2 rounded-full mr-1.5 animate-pulse" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />;
}

export function CityHub() {
  const { net, latency, geo, setGeo } = useConnectivity();
  const { authed } = useIsAuthed();
  const [active, setActive] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [listening, setListening] = useState(false);

  const all = DISTRICTS.flatMap((d) => d.items.map((u) => ({ ...u, d })));
  const matches = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return all.filter((u) => (u.name + " " + u.keys).toLowerCase().split(" ").some((w) => w.length > 2 && s.includes(w)) || u.name.toLowerCase().includes(s));
  }, [q]);
  const district = DISTRICTS.find((d) => d.id === active);
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
    <div className="min-h-screen bg-arcade text-neon-cyan font-mono relative overflow-hidden select-none">
      <div className="pointer-events-none absolute inset-0 z-40 opacity-30 bg-[repeating-linear-gradient(0deg,transparent_0_2px,rgba(0,0,0,0.6)_2px_4px)]" />

      {/* HUD */}
      <header className="relative z-30 flex flex-wrap items-center justify-between gap-3 p-3 border-b-2 border-neon-cyan/40 bg-arcade-panel/90">
        <div className="flex items-center gap-3">
          <div className="size-11 border-2 border-neon-pink flex items-center justify-center text-2xl shadow-[0_0_12px_var(--color-neon-pink)]">🧑‍🚀</div>
          <div>
            <p className="text-neon-pink font-bold tracking-widest text-sm">SOCIALTOWN · CITY HUB</p>
            <p className="text-[10px] text-neon-cyan/70">TOWNER {authed ? "CONNECTÉ" : "INVITÉ"} · NIV 1 · XP 0/100</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-[10px] tracking-wider">
          <span><Dot c={netColor[net]} />NETWORK {net}{latency != null && net !== "OFFLINE" ? ` ${latency}ms` : ""}</span>
          <span><Dot c={authed ? "var(--color-neon-green)" : "var(--color-neon-yellow)"} />TOWNER {authed ? "ONLINE" : "GUEST"}</span>
          <button onClick={locate} className="text-left"><Dot c={geo === "AVAILABLE" ? "var(--color-neon-green)" : geo === "DENIED" ? "var(--color-neon-red)" : "var(--color-neon-yellow)"} />GEO {geo}</button>
          <span><Dot c="var(--color-neon-cyan)" />SERVICES {liveCount}/{all.length}</span>
        </div>
        <div className="flex gap-2">
          {authed === false && <Link to="/auth" className="px-3 py-1.5 border-2 border-neon-yellow text-neon-yellow text-xs font-bold">▶ PRESS START</Link>}
          <span className="px-3 py-1.5 border-2 border-neon-yellow text-neon-yellow text-xs font-bold">🪙 0</span>
        </div>
      </header>

      {/* Command console */}
      <div className="relative z-30 max-w-3xl mx-auto mt-4 px-3">
        <div className="flex gap-2 border-2 border-neon-cyan bg-arcade-panel p-2 shadow-[0_0_14px_var(--color-neon-cyan)]">
          <span className="text-neon-pink self-center">&gt;</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="trouve un parking, réparer ma chaudière, cours de maths…"
            className="flex-1 bg-transparent outline-none text-sm text-neon-cyan placeholder:text-neon-cyan/40" />
          <button onClick={voice} className={`px-2 border border-neon-pink text-neon-pink text-xs ${listening ? "animate-pulse" : ""}`}>🎤</button>
          <Link to="/chat" className="px-2 border border-neon-green text-neon-green text-xs self-stretch flex items-center">IA</Link>
        </div>
        {matches.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {matches.map((u) => (
              <Link key={u.name} to={u.to} className="px-3 py-1.5 border text-xs bg-arcade-panel" style={{ borderColor: u.d.color, color: u.d.color }}>
                {u.icon} {u.name} → {u.d.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* City map */}
      <section className="relative z-10 mx-auto mt-4 max-w-6xl aspect-[4/3] sm:aspect-[16/9] px-3">
        <div className="absolute inset-3 border-2 border-neon-pink/40 overflow-hidden [perspective:700px]">
          <div className="absolute inset-x-0 bottom-0 h-[70%] origin-bottom [transform:rotateX(60deg)] opacity-60
            bg-[linear-gradient(var(--color-neon-pink)_1px,transparent_1px),linear-gradient(90deg,var(--color-neon-pink)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute inset-x-0 top-[22%] h-24 flex items-end justify-around opacity-40">
            {[60, 90, 45, 110, 70, 95, 50, 80, 65].map((h, i) => (
              <div key={i} className="w-[7%] border-t-2 border-x border-neon-cyan bg-arcade-panel" style={{ height: h }} />
            ))}
          </div>
          {/* Avatar */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-4xl animate-bounce">🧑‍🚀</div>
            <p className="text-[9px] text-neon-yellow">YOU</p>
          </div>
          {DISTRICTS.map((d) => (
            <button key={d.id} onClick={() => setActive(d.id === active ? null : d.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 px-2 py-1.5 border-2 bg-arcade-panel/90 text-[10px] sm:text-xs font-bold tracking-widest transition hover:scale-110"
              style={{ left: `${d.x}%`, top: `${d.y}%`, borderColor: d.color, color: d.color, boxShadow: `0 0 ${active === d.id ? 22 : 10}px ${d.color}` }}>
              {d.name}<span className="block text-[9px] opacity-70">{d.items.length} univers</span>
            </button>
          ))}
        </div>
      </section>

      {/* District panel */}
      <section className="relative z-30 max-w-6xl mx-auto px-3 py-4">
        {district ? (
          <div className="border-2 p-4 bg-arcade-panel" style={{ borderColor: district.color }}>
            <p className="font-bold tracking-widest mb-3" style={{ color: district.color }}>▶ {district.name}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {district.items.map((u) => (
                <Link key={u.name} to={u.to} className="border border-neon-cyan/40 p-3 text-center hover:bg-arcade transition">
                  <div className="text-2xl">{u.icon}</div>
                  <div className="text-xs mt-1 text-neon-cyan">{u.name}</div>
                  <div className={`text-[9px] mt-1 ${u.live ? "text-neon-green" : "text-neon-yellow"}`}>{u.live ? "● LIVE" : "◐ PILOTE"}</div>
                </Link>
              ))}
            </div>
            <p className="text-[9px] mt-3 text-neon-cyan/50">PILOTE = aucun fournisseur réel connecté : aucune réservation ni paiement ne sera simulé.</p>
          </div>
        ) : (
          <p className="text-center text-xs text-neon-cyan/60 tracking-widest animate-pulse">◆ SÉLECTIONNE UN QUARTIER POUR Y ENTRER ◆</p>
        )}
      </section>
    </div>
  );
}
