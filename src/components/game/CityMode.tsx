import { useEffect, useRef, useState } from "react";
import { RageGame, type Level } from "./RageGame";

// ---------- Types ----------
export type Avatar = { skin: string; shirt: string; hair: string; name: string };
export type Gang = { name: string; color: string; members: number };

type Vehicle = { x: number; y: number; color: string; name: string };
type Mission = { x: number; y: number; title: string; gang: string; level: Level; done: boolean };
type Prop = { x: number; y: number; kind: "pipe" | "bat" };

const W = 640, H = 360, WORLD = 2400;

const AVATAR_KEY = "street-arcade-avatar";
const GANG_KEY = "street-arcade-gang";
const XP_KEY = "street-arcade-xp";

const SKINS = ["#e8b48a", "#c98d5e", "#8d5a3a", "#f0c8a0"];
const SHIRTS = ["#f5f5f5", "#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6", "#ff6b6b"];
const HAIRS = ["#ffd84a", "#222", "#6b3a1f", "#e74c3c", "#2ef2ff"];

const GANGS: { name: string; color: string }[] = [
  { name: "Les Cobras", color: "#2ecc71" },
  { name: "Néon Syndicat", color: "#ff2e88" },
  { name: "Dockers", color: "#e07a3a" },
];

function buildMissions(): Mission[] {
  const themes: Level["theme"][] = ["night", "neon", "dock"];
  return GANGS.flatMap((g, gi) =>
    [0, 1].map((i) => ({
      x: 300 + gi * 700 + i * 250,
      y: 120 + ((gi * 2 + i) % 3) * 100,
      title: `${g.name} — Contrat ${i + 1}`,
      gang: g.name,
      done: false,
      level: {
        name: `${g.name} : Contrat ${i + 1}`,
        theme: themes[(gi + i) % 3],
        waves: [2 + i, 3 + i, 3 + gi],
        boss: i === 1,
      },
    })),
  );
}

// ---------- Component ----------
export function CityMode({ onExit }: { onExit: () => void }) {
  const [avatar, setAvatar] = useState<Avatar>(() => {
    try {
      return JSON.parse(localStorage.getItem(AVATAR_KEY) || "") as Avatar;
    } catch {
      return { skin: SKINS[0], shirt: SHIRTS[0], hair: HAIRS[0], name: "Towner" };
    }
  });
  const [gang, setGang] = useState<Gang | null>(() => {
    try {
      return JSON.parse(localStorage.getItem(GANG_KEY) || "null");
    } catch {
      return null;
    }
  });
  const [xp, setXp] = useState(() => Number(localStorage.getItem(XP_KEY) || 0));
  const [mission, setMission] = useState<Mission | null>(null);
  const [tab, setTab] = useState<"city" | "avatar" | "gang">("city");

  const saveAvatar = (a: Avatar) => {
    setAvatar(a);
    localStorage.setItem(AVATAR_KEY, JSON.stringify(a));
  };
  const saveGang = (g: Gang | null) => {
    setGang(g);
    localStorage.setItem(GANG_KEY, JSON.stringify(g));
  };
  const addXp = (n: number) => {
    const v = xp + n;
    setXp(v);
    localStorage.setItem(XP_KEY, String(v));
  };

  if (mission) {
    return (
      <div>
        <button onClick={() => setMission(null)} className="mb-3 underline text-sm">← Retour à la ville</button>
        <h2 className="text-lg font-black mb-2">{mission.title}</h2>
        <RageGame
          key={mission.title + Date.now()}
          level={mission.level}
          onEnd={(score, win) => {
            if (win) addXp(50 + Math.floor(score / 500));
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={onExit} className="underline text-sm">← Arcade</button>
        <div className="flex gap-1 ml-auto">
          {(["city", "avatar", "gang"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 rounded border text-sm ${tab === t ? "bg-primary text-primary-foreground" : ""}`}
            >
              {{ city: "🌆 Ville", avatar: "🧍 Avatar", gang: "🚩 Gang" }[t]}
            </button>
          ))}
        </div>
        <span className="text-sm font-mono">XP {xp} · Niv. {1 + Math.floor(xp / 100)}</span>
      </div>

      {tab === "city" && <CityCanvas avatar={avatar} gang={gang} onMission={setMission} />}
      {tab === "avatar" && <AvatarStudio avatar={avatar} onSave={saveAvatar} />}
      {tab === "gang" && <GangPanel gang={gang} onSave={saveGang} xp={xp} />}
    </div>
  );
}

// ---------- City exploration canvas ----------
function CityCanvas({ avatar, gang, onMission }: { avatar: Avatar; gang: Gang | null; onMission: (m: Mission) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const keys = useRef<Record<string, boolean>>({});
  const [hud, setHud] = useState({ near: "", inCar: "" });

  useEffect(() => {
    const c = ref.current!;
    const g = c.getContext("2d")!;
    const p = { x: 200, y: 260 };
    const vehicles: Vehicle[] = [
      { x: 420, y: 300, color: "#e74c3c", name: "Taxi" },
      { x: 1100, y: 180, color: "#3498db", name: "Muscle Car" },
      { x: 1900, y: 320, color: "#f1c40f", name: "Lowrider" },
    ];
    const props: Prop[] = [
      { x: 520, y: 250, kind: "pipe" },
      { x: 1350, y: 290, kind: "bat" },
      { x: 2050, y: 200, kind: "pipe" },
    ];
    const missions = buildMissions();
    let cam = 0;
    let inCar: Vehicle | null = null;
    let raf = 0;

    const kd = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
      if ([" ", "arrowup", "arrowdown"].includes(e.key.toLowerCase())) e.preventDefault();
    };
    const ku = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);

    const drawAvatar = (x: number, y: number, s = 1) => {
      g.save();
      g.translate(x, y);
      g.scale(s, s);
      g.fillStyle = "#223";
      g.fillRect(-8, -24, 6, 24);
      g.fillRect(2, -24, 6, 24);
      g.fillStyle = gang ? gang.color : avatar.shirt;
      g.fillRect(-10, -52, 20, 28);
      g.fillStyle = avatar.skin;
      g.fillRect(-7, -66, 14, 14);
      g.fillStyle = avatar.hair;
      g.fillRect(-8, -70, 16, 6);
      g.restore();
    };

    const loop = () => {
      const k = keys.current;
      const sp = inCar ? 5.5 : 2.4;
      if (k["arrowleft"] || k["q"] || k["a"]) p.x -= sp;
      if (k["arrowright"] || k["d"]) p.x += sp;
      if (k["arrowup"] || k["z"] || k["w"]) p.y -= sp * 0.7;
      if (k["arrowdown"] || k["s"]) p.y += sp * 0.7;
      p.x = Math.max(20, Math.min(WORLD - 20, p.x));
      p.y = Math.max(80, Math.min(H - 20, p.y));

      // Enter / exit vehicle (E)
      if (k["e"]) {
        k["e"] = false;
        if (inCar) {
          inCar.x = p.x + 40;
          inCar.y = p.y;
          inCar = null;
        } else {
          const v = vehicles.find((v) => Math.abs(v.x - p.x) < 45 && Math.abs(v.y - p.y) < 30);
          if (v) inCar = v;
        }
      }
      if (inCar) {
        inCar.x = p.x;
        inCar.y = p.y;
      }

      // Start mission (F)
      let near = "";
      for (const m of missions) {
        if (!m.done && Math.abs(m.x - p.x) < 40 && Math.abs(m.y - p.y) < 40) {
          near = m.title;
          if (k["f"]) {
            k["f"] = false;
            m.done = true;
            onMission(m);
            return;
          }
        }
      }
      cam = Math.max(0, Math.min(WORLD - W, p.x - W / 2));

      // ----- Render -----
      // sky
      const grd = g.createLinearGradient(0, 0, 0, 90);
      grd.addColorStop(0, "#0b0b2e");
      grd.addColorStop(1, "#3a1b5c");
      g.fillStyle = grd;
      g.fillRect(0, 0, W, 90);
      // skyline
      for (let i = -1; i < 12; i++) {
        const bx = i * 90 - (cam * 0.3) % 90;
        const bh = 50 + ((i + Math.floor((cam * 0.3) / 90)) * 37) % 45;
        g.fillStyle = "#1a1640";
        g.fillRect(bx, 90 - bh, 80, bh);
        g.fillStyle = "#ffd84a";
        for (let wy = 90 - bh + 8; wy < 82; wy += 14)
          for (let wx = 8; wx < 70; wx += 14) if ((wx + wy + i) % 3) g.fillRect(bx + wx, wy, 5, 7);
      }
      // street
      g.fillStyle = "#2b2b33";
      g.fillRect(0, 90, W, H - 90);
      g.strokeStyle = "rgba(255,255,255,.15)";
      g.setLineDash([20, 20]);
      g.beginPath();
      g.moveTo(0, 200);
      g.lineTo(W, 200);
      g.stroke();
      g.setLineDash([]);
      // sidewalk blocks
      g.fillStyle = "#3b3b46";
      for (let i = 0; i < 40; i++) {
        const bx = i * 80 - cam;
        if (bx > -80 && bx < W) g.fillRect(bx, 92, 78, 30);
      }

      // mission markers
      for (const m of missions) {
        if (m.done) continue;
        const sx = m.x - cam;
        if (sx < -30 || sx > W + 30) continue;
        g.fillStyle = "#ff2e88";
        g.beginPath();
        g.arc(sx, m.y, 10 + 2 * Math.sin(Date.now() / 200), 0, 7);
        g.fill();
        g.fillStyle = "#fff";
        g.font = "bold 10px monospace";
        g.textAlign = "center";
        g.fillText("!", sx, m.y + 4);
      }

      // props (weapons on the ground)
      for (const pr of props) {
        const sx = pr.x - cam;
        if (sx < -20 || sx > W + 20) continue;
        g.fillStyle = pr.kind === "pipe" ? "#9aa" : "#a66a2a";
        g.save();
        g.translate(sx, pr.y);
        g.rotate(0.5);
        g.fillRect(-12, -2, 24, 4);
        g.restore();
      }

      // vehicles
      for (const v of vehicles) {
        const sx = v.x - cam;
        if (sx < -60 || sx > W + 60) continue;
        g.fillStyle = "rgba(0,0,0,.35)";
        g.beginPath();
        g.ellipse(sx, v.y + 6, 30, 6, 0, 0, 7);
        g.fill();
        g.fillStyle = v.color;
        g.fillRect(sx - 28, v.y - 16, 56, 20);
        g.fillStyle = "#111";
        g.fillRect(sx - 16, v.y - 24, 32, 10);
        g.fillStyle = "#222";
        g.beginPath();
        g.arc(sx - 16, v.y + 4, 6, 0, 7);
        g.arc(sx + 16, v.y + 4, 6, 0, 7);
        g.fill();
      }

      // player
      drawAvatar(p.x - cam, p.y, 1);

      setHud({ near, inCar: inCar ? inCar.name : "" });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, [avatar, gang, onMission]);

  const press = (k: string, v: boolean) => { keys.current[k] = v; };
  const Btn = ({ k, label }: { k: string; label: string }) => (
    <button
      className="size-14 rounded-full bg-primary/80 text-primary-foreground font-bold select-none touch-none"
      onPointerDown={() => press(k, true)}
      onPointerUp={() => press(k, false)}
      onPointerLeave={() => press(k, false)}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex justify-between items-center font-mono text-xs px-2 py-1 bg-foreground text-background rounded-t">
        <span>{hud.inCar ? `🚗 ${hud.inCar}` : "🚶 À pied"}</span>
        <span>{hud.near ? `⚑ ${hud.near} — appuie F` : "Explore la ville…"}</span>
      </div>
      <canvas ref={ref} width={W} height={H} className="w-full bg-black [image-rendering:pixelated]" />
      <div className="flex justify-between p-3 md:hidden">
        <div className="grid grid-cols-3 gap-1">
          <span /><Btn k="arrowup" label="▲" /><span />
          <Btn k="arrowleft" label="◀" /><span /><Btn k="arrowright" label="▶" />
          <span /><Btn k="arrowdown" label="▼" /><span />
        </div>
        <div className="flex gap-2 items-center"><Btn k="e" label="🚗" /><Btn k="f" label="⚑" /></div>
      </div>
      <p className="text-xs text-muted-foreground mt-2 hidden md:block">
        Flèches/ZQSD : bouger · E : monter/descendre d'un véhicule · F : accepter une mission (combat à mains nues, façon Streets of Rage)
      </p>
    </div>
  );
}

// ---------- Avatar studio (Roblox-style customization) ----------
function AvatarStudio({ avatar, onSave }: { avatar: Avatar; onSave: (a: Avatar) => void }) {
  const Row = ({ label, values, cur, pick }: { label: string; values: string[]; cur: string; pick: (v: string) => void }) => (
    <div className="space-y-1">
      <div className="text-sm font-medium">{label}</div>
      <div className="flex gap-2 flex-wrap">
        {values.map((v) => (
          <button
            key={v}
            onClick={() => pick(v)}
            className={`size-8 rounded-full border-2 ${cur === v ? "border-primary scale-110" : "border-transparent"}`}
            style={{ background: v }}
            aria-label={v}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="rounded-xl border p-4 space-y-4 max-w-md">
      <h3 className="font-bold text-lg">Studio Avatar</h3>
      <input
        className="w-full border rounded px-2 py-1 bg-background"
        value={avatar.name}
        onChange={(e) => onSave({ ...avatar, name: e.target.value })}
        placeholder="Ton pseudo"
      />
      <Row label="Peau" values={SKINS} cur={avatar.skin} pick={(v) => onSave({ ...avatar, skin: v })} />
      <Row label="Tenue" values={SHIRTS} cur={avatar.shirt} pick={(v) => onSave({ ...avatar, shirt: v })} />
      <Row label="Cheveux" values={HAIRS} cur={avatar.hair} pick={(v) => onSave({ ...avatar, hair: v })} />
      <p className="text-xs text-muted-foreground">Ton avatar te représente en ville. La couleur de ton gang remplace ta tenue en exploration.</p>
    </div>
  );
}

// ---------- Gang panel ----------
function GangPanel({ gang, onSave, xp }: { gang: Gang | null; onSave: (g: Gang | null) => void; xp: number }) {
  const [name, setName] = useState("");

  if (gang) {
    return (
      <div className="rounded-xl border p-4 space-y-3 max-w-md">
        <h3 className="font-bold text-lg">Ton gang</h3>
        <div className="flex items-center gap-3">
          <span className="size-10 rounded-full" style={{ background: gang.color }} />
          <div>
            <div className="font-bold">{gang.name}</div>
            <div className="text-xs text-muted-foreground">Réputation : {xp} XP</div>
          </div>
        </div>
        <button onClick={() => onSave(null)} className="text-sm text-destructive underline">Quitter le gang</button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-4 space-y-4 max-w-md">
      <h3 className="font-bold text-lg">Rejoins ou crée un gang</h3>
      <div className="space-y-2">
        {GANGS.map((g) => (
          <button
            key={g.name}
            onClick={() => onSave({ ...g, members: 1 })}
            className="w-full flex items-center gap-3 border rounded-lg p-3 text-left hover:bg-secondary/50"
          >
            <span className="size-8 rounded-full" style={{ background: g.color }} />
            <span className="font-medium">{g.name}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-2 pt-2 border-t">
        <input
          className="flex-1 border rounded px-2 py-1 bg-background"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom de ton gang"
        />
        <button
          disabled={!name.trim()}
          onClick={() => onSave({ name: name.trim(), color: SHIRTS[Math.floor(Math.random() * SHIRTS.length)], members: 1 })}
          className="px-3 py-1 rounded bg-primary text-primary-foreground font-bold disabled:opacity-50"
        >
          Créer
        </button>
      </div>
    </div>
  );
}
