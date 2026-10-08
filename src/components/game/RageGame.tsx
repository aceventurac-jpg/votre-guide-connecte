import { useEffect, useRef, useState } from "react";
import { DIFFICULTY, getArcadeSettings } from "@/lib/arcade-settings";

export type Level = { name: string; theme: "night" | "neon" | "dock"; waves: number[]; boss: boolean };

type Ent = { x: number; y: number; hp: number; max: number; dir: 1 | -1; atk: number; hit: number; vx: number; boss?: boolean; cd: number };

const W = 640, H = 360, TOP = 220, BOT = 340;

const THEMES = {
  night: { sky: ["#0b0b2e", "#3a1b5c"], b: "#1a1640", win: "#ffd84a", floor: "#3b3346" },
  neon: { sky: ["#12001f", "#ff2e88"], b: "#20103a", win: "#2ef2ff", floor: "#2a2030" },
  dock: { sky: ["#1b2a4a", "#e07a3a"], b: "#22283a", win: "#ffb347", floor: "#4a3a2a" },
};

export function RageGame({ level, onEnd }: { level: Level; onEnd?: (score: number, win: boolean) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const keys = useRef<Record<string, boolean>>({});
  const [hud, setHud] = useState({ hp: 100, max: 100, score: 0, wave: 1, over: "" });

  useEffect(() => {
    const c = ref.current!; const g = c.getContext("2d")!;
    const t = THEMES[level.theme];
    const cfg = getArcadeSettings();
    const diff = DIFFICULTY[cfg.difficulty];
    const p: Ent = { x: 80, y: 280, hp: diff.playerHp, max: diff.playerHp, dir: 1, atk: 0, hit: 0, vx: 0, cd: 0 };
    let foes: Ent[] = []; let wave = 0; let score = 0; let cam = 0; let shake = 0; let done = false;
    const floats: { x: number; y: number; txt: string; life: number }[] = [];
    const waves = [...level.waves];
    const spawn = () => {
      const n = waves[wave];
      if (n === undefined) {
        if (level.boss && !foes.some((f) => f.boss) && wave === waves.length) {
          foes.push({ x: cam + W + 40, y: 280, hp: 120, max: 120, dir: -1, atk: 0, hit: 0, vx: 0, boss: true, cd: 0 });
          wave++; return;
        }
        end(true); return;
      }
      for (let i = 0; i < n; i++) foes.push({ x: cam + W + 40 + i * 60, y: TOP + Math.random() * (BOT - TOP), hp: 30, max: 30, dir: -1, atk: 0, hit: 0, vx: 0, cd: 40 + i * 20 });
      wave++;
    };
    const end = (win: boolean) => { if (done) return; done = true; setHud((h) => ({ ...h, over: win ? "STAGE CLEAR!" : "GAME OVER" })); onEnd?.(score, win); };
    spawn();

    const kd = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true; if ([" ", "arrowup", "arrowdown"].includes(e.key.toLowerCase())) e.preventDefault(); };
    const ku = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);

    const drawFighter = (e: Ent, col: string, hair: string) => {
      const sx = e.x - cam, sy = e.y;
      g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(sx, sy, 18, 5, 0, 0, 7); g.fill();
      const s = e.boss ? 1.4 : 1;
      g.save(); g.translate(sx, sy); g.scale(s * e.dir, s);
      if (e.hit > 0) g.globalAlpha = 0.5 + 0.5 * Math.sin(e.hit);
      g.fillStyle = "#223"; g.fillRect(-8, -24, 6, 24); g.fillRect(2, -24, 6, 24);
      g.fillStyle = col; g.fillRect(-10, -52, 20, 28);
      g.fillStyle = "#e8b48a"; g.fillRect(-7, -66, 14, 14);
      g.fillStyle = hair; g.fillRect(-8, -70, 16, 6);
      g.fillStyle = "#e8b48a"; g.fillRect(8, -48, e.atk > 0 ? 22 : 8, 6);
      g.restore();
      if (e !== p) { g.fillStyle = "#300"; g.fillRect(sx - 15, sy - 85 * s, 30, 4); g.fillStyle = "#f33"; g.fillRect(sx - 15, sy - 85 * s, 30 * e.hp / e.max, 4); }
    };

    let raf = 0, frame = 0;
    const loop = () => {
      frame++;
      const k = keys.current;
      if (!done) {
        const sp = 2.4;
        if (k["arrowleft"] || k["q"] || k["a"]) { p.x -= sp; p.dir = -1; }
        if (k["arrowright"] || k["d"]) { p.x += sp; p.dir = 1; }
        if (k["arrowup"] || k["z"] || k["w"]) p.y -= sp * 0.7;
        if (k["arrowdown"] || k["s"]) p.y += sp * 0.7;
        p.y = Math.max(TOP, Math.min(BOT, p.y)); p.x = Math.max(cam + 20, p.x);
        if ((k["j"] || k[" "]) && p.cd <= 0) {
          p.atk = 10; p.cd = 18;
          foes.forEach((f) => { if (Math.abs(f.y - p.y) < 18 && (f.x - p.x) * p.dir > 0 && Math.abs(f.x - p.x) < (f.boss ? 55 : 45)) { f.hp -= 10; f.hit = 12; f.x += p.dir * 14; score += 100; shake = 5; floats.push({ x: f.x, y: f.y - 80, txt: "-10", life: 30 }); } });
        }
        if (k["l"] && p.cd <= 0 && (cfg.specialCost ? p.hp > 10 : true)) {
          p.atk = 20; p.cd = 40; if (cfg.specialCost) p.hp -= 6; shake = 10;
          foes.forEach((f) => { if (Math.abs(f.x - p.x) < 90 && Math.abs(f.y - p.y) < 40) { f.hp -= 25; f.hit = 15; f.x += Math.sign(f.x - p.x) * 40; score += 250; floats.push({ x: f.x, y: f.y - 80, txt: "-25", life: 30 }); } });
        }
        p.cd--; p.atk--; p.hit--;
        foes.forEach((f) => {
          f.hit--; f.atk--; f.cd--;
          const dx = p.x - f.x, dy = p.y - f.y; f.dir = dx > 0 ? 1 : -1;
          if (f.hit <= 0) { if (Math.abs(dx) > 34) f.x += Math.sign(dx) * (f.boss ? 1.3 : 1.1) * diff.enemySpeed; if (Math.abs(dy) > 3) f.y += Math.sign(dy) * 0.7 * diff.enemySpeed; }
          if (Math.abs(dx) < 38 && Math.abs(dy) < 14 && f.cd <= 0 && f.hit <= 0) { f.atk = 10; f.cd = f.boss ? 50 : 70; p.hp -= Math.round((f.boss ? 14 : 7) * diff.enemyDamage); p.hit = 12; shake = 4; }
        });
        foes = foes.filter((f) => { if (f.hp <= 0) { score += f.boss ? 5000 : 500; return false; } return true; });
        if (foes.length === 0) { cam = Math.max(cam, p.x - 200); if (p.x - cam > W - 120) cam += 2; if (frame % 90 === 0) spawn(); }
        else cam = Math.max(cam, Math.min(p.x - W / 2, cam));
        if (p.hp <= 0) { p.hp = 0; end(false); }
        if (frame % 6 === 0) setHud((h) => ({ ...h, hp: p.hp, max: p.max, score, wave: Math.min(wave, waves.length) }));
      }
      // render
      g.save(); if (cfg.screenShake && shake > 0) { g.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake); shake--; } else if (shake > 0) shake--;
      const grd = g.createLinearGradient(0, 0, 0, TOP); grd.addColorStop(0, t.sky[0]); grd.addColorStop(1, t.sky[1]);
      g.fillStyle = grd; g.fillRect(0, 0, W, TOP);
      for (let i = -1; i < 12; i++) {
        const bx = i * 80 - (cam * 0.4) % 80, bh = 90 + ((i + Math.floor(cam * 0.4 / 80)) * 37 % 70);
        g.fillStyle = t.b; g.fillRect(bx, TOP - bh, 70, bh);
        g.fillStyle = t.win;
        for (let wy = TOP - bh + 10; wy < TOP - 10; wy += 16) for (let wx = 8; wx < 62; wx += 16) if ((wx + wy + i) % 3) g.fillRect(bx + wx, wy, 6, 8);
      }
      g.fillStyle = t.floor; g.fillRect(0, TOP - 10, W, H);
      g.strokeStyle = "rgba(255,255,255,.08)";
      for (let i = 0; i < 14; i++) { const lx = i * 60 - cam % 60; g.beginPath(); g.moveTo(lx, TOP - 10); g.lineTo(lx - 60, H); g.stroke(); }
      [...foes, p].sort((a, b) => a.y - b.y).forEach((e) => e === p ? drawFighter(e, "#f5f5f5", "#ffd84a") : drawFighter(e, e.boss ? "#7a1fa2" : "#2a6", e.boss ? "#111" : "#a33"));
      if (cfg.damageNumbers) {
        g.font = "bold 12px monospace"; g.textAlign = "center";
        for (let i = floats.length - 1; i >= 0; i--) {
          const f = floats[i]; f.life--; f.y -= 0.8;
          if (f.life <= 0) { floats.splice(i, 1); continue; }
          g.fillStyle = "#ffd84a"; g.fillText(f.txt, f.x - cam, f.y);
        }
      }
      g.restore();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); };
  }, [level]);

  const [touch] = useState(() => getArcadeSettings().touchControls);
  const touchCls = touch === "always" ? "" : touch === "never" ? "hidden" : "md:hidden";
  const press = (k: string, v: boolean) => { keys.current[k] = v; };
  const Btn = ({ k, label }: { k: string; label: string }) => (
    <button className="size-14 rounded-full bg-primary/80 text-primary-foreground font-bold select-none touch-none"
      onPointerDown={() => press(k, true)} onPointerUp={() => press(k, false)} onPointerLeave={() => press(k, false)}>{label}</button>
  );

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex justify-between items-center font-mono text-sm px-2 py-1 bg-foreground text-background rounded-t">
        <span>1UP {String(hud.score).padStart(6, "0")}</span>
        <span className="flex items-center gap-2">HP <span className="w-32 h-3 bg-destructive/40 inline-block"><span className="block h-3 bg-yellow-400" style={{ width: `${(hud.hp / hud.max) * 100}%` }} /></span></span>
        <span>VAGUE {hud.wave}/{level.waves.length}</span>
      </div>
      <div className="relative">
        <canvas ref={ref} width={W} height={H} className="w-full bg-black [image-rendering:pixelated]" />
        {hud.over && <div className="absolute inset-0 grid place-items-center bg-black/60 text-4xl font-black text-yellow-300">{hud.over}</div>}
      </div>
      <div className={`flex justify-between p-3 ${touchCls}`}>
        <div className="grid grid-cols-3 gap-1">
          <span /><Btn k="arrowup" label="▲" /><span />
          <Btn k="arrowleft" label="◀" /><span /><Btn k="arrowright" label="▶" />
          <span /><Btn k="arrowdown" label="▼" /><span />
        </div>
        <div className="flex gap-2 items-center"><Btn k="j" label="👊" /><Btn k="l" label="💥" /></div>
      </div>
      <p className="text-xs text-muted-foreground mt-2 hidden md:block">Flèches/ZQSD : bouger · J ou Espace : frapper · L : spéciale (coûte de la vie)</p>
    </div>
  );
}
