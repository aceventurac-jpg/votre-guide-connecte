import { useEffect, useState } from "react";
import { RageGame, type Level } from "./RageGame";
import { CityPromenade } from "./CityPromenade";
import { Button } from "@/components/ui/button";

// ---------- Types ----------
export type Avatar = { skin: string; shirt: string; hair: string; name: string };
export type Gang = { name: string; color: string; members: number };

type Mission = { x: number; y: number; title: string; gang: string; level: Level; done: boolean };

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
  const [avatar, setAvatar] = useState<Avatar>({ skin: SKINS[0], shirt: SHIRTS[0], hair: HAIRS[0], name: "Towner" });
  const [gang, setGang] = useState<Gang | null>(null);
  const [xp, setXp] = useState(0);
  useEffect(() => {
    try { const a = localStorage.getItem(AVATAR_KEY); if (a) setAvatar(JSON.parse(a)); } catch {}
    try { setGang(JSON.parse(localStorage.getItem(GANG_KEY) || "null")); } catch {}
    setXp(Number(localStorage.getItem(XP_KEY) || 0));
  }, []);
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
        <Button onClick={() => setMission(null)} className="mb-3 underline text-sm">← Retour à la ville</Button>
        <h2 className="text-lg font-black mb-2">{mission.title}</h2>
        <RageGame
          key={mission.title}
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
        <Button onClick={onExit} className="underline text-sm">← Arcade</Button>
        <div className="flex gap-1 ml-auto">
          {(["city", "avatar", "gang"] as const).map((t) => (
            <Button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 rounded border text-sm ${tab === t ? "bg-primary text-primary-foreground" : ""}`}
            >
              {{ city: "🌆 Ville", avatar: "🧍 Avatar", gang: "🚩 Gang" }[t]}
            </Button>
          ))}
        </div>
        <span className="text-sm font-mono">XP {xp} · Niv. {1 + Math.floor(xp / 100)}</span>
      </div>

      {tab === "city" && <CityPromenade name={avatar.name} onMission={() => setMission(buildMissions()[0])} />}
      {tab === "avatar" && <AvatarStudio avatar={avatar} onSave={saveAvatar} />}
      {tab === "gang" && <GangPanel gang={gang} onSave={saveGang} xp={xp} />}
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
          <Button
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
        <Button onClick={() => onSave(null)} className="text-sm text-destructive underline">Quitter le gang</Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-4 space-y-4 max-w-md">
      <h3 className="font-bold text-lg">Rejoins ou crée un gang</h3>
      <div className="space-y-2">
        {GANGS.map((g) => (
          <Button
            key={g.name}
            onClick={() => onSave({ ...g, members: 1 })}
            className="w-full flex items-center gap-3 border rounded-lg p-3 text-left hover:bg-secondary/50"
          >
            <span className="size-8 rounded-full" style={{ background: g.color }} />
            <span className="font-medium">{g.name}</span>
          </Button>
        ))}
      </div>
      <div className="flex gap-2 pt-2 border-t">
        <input
          className="flex-1 border rounded px-2 py-1 bg-background"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom de ton gang"
        />
        <Button
          disabled={!name.trim()}
          onClick={() => onSave({ name: name.trim(), color: SHIRTS[Math.floor(Math.random() * SHIRTS.length)], members: 1 })}
          className="px-3 py-1 rounded bg-primary text-primary-foreground font-bold disabled:opacity-50"
        >
          Créer
        </Button>
      </div>
    </div>
  );
}
