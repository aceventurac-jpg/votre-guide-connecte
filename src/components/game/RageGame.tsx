import { useEffect, useRef, useState } from "react";
import { DIFFICULTY, getArcadeSettings } from "@/lib/arcade-settings";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Sparkles, Swords } from "lucide-react";
import scenery from "@/assets/socialtown-promenade.jpg";
import walking from "@/assets/towner-walking.png";
import punching from "@/assets/towner-combat.png";
import rival from "@/assets/arcade-rival.png";

export type Level = { name: string; theme: "night" | "neon" | "dock"; waves: number[]; boss: boolean };

type Ent = { x: number; y: number; hp: number; max: number; dir: 1 | -1; atk: number; hit: number; vx: number; boss?: boolean; cd: number };

const W = 640, H = 360, TOP = 220, BOT = 340;

export function RageGame({ level, onEnd }: { level: Level; onEnd?: (score: number, win: boolean) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const keys = useRef<Record<string, boolean>>({});
  const [hud, setHud] = useState({ hp: 100, max: 100, score: 0, wave: 1, over: "" });
  const [ready, setReady] = useState(false);
  const [assetError, setAssetError] = useState(false);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const g = c.getContext("2d");
    if (!g) return;
    const images = [scenery, walking, punching, rival].map(src => { const image = new Image(); image.src = src; return image; });
    let loaded = false, disposed = false;
    setReady(false); setAssetError(false);
    Promise.all(images.map(image => image.decode())).then(() => { if (!disposed) { loaded = true; setReady(true); } }).catch(() => { if (!disposed) setAssetError(true); });
    const colors = getComputedStyle(c);
    const primary = colors.getPropertyValue("--primary").trim();
    const accent = colors.getPropertyValue("--accent").trim();
    const background = colors.getPropertyValue("--background").trim();
    const highlight = colors.getPropertyValue("--color-town-lemon").trim();
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

    const drawFighter = (e: Ent) => {
      const sx = e.x - cam, sy = e.y;
      g.fillStyle = background; g.globalAlpha = .45; g.beginPath(); g.ellipse(sx, sy, 22, 5, 0, 0, 7); g.fill(); g.globalAlpha = 1;
      const s = e.boss ? 1.4 : 1;
      g.save(); g.translate(sx, sy); g.scale(s * e.dir, s);
      if (e.hit > 0) g.globalAlpha = 0.5 + 0.5 * Math.sin(e.hit);
      const image = e === p ? images[e.atk > 0 ? 2 : 1] : images[3];
      const bob = e.atk > 0 ? 0 : Math.sin(frame / 6 + e.x) * 1.5;
      g.drawImage(image, -55 + (e.atk > 0 ? 8 : 0), -112 + bob, 112, 112);
      if (e.atk > 0) { g.strokeStyle = e === p ? primary : accent; g.lineWidth = 2; g.beginPath(); g.arc(25, -65, 24, -.7, .8); g.stroke(); }
      g.restore();
      if (e !== p) { g.fillStyle = background; g.fillRect(sx - 18, sy - 115 * s, 36, 3); g.fillStyle = accent; g.fillRect(sx - 18, sy - 115 * s, 36 * e.hp / e.max, 3); }
    };

    let raf = 0, frame = 0;
    const loop = () => {
      frame++;
      if (!loaded) { raf = requestAnimationFrame(loop); return; }
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
      g.save(); g.scale(2, 2); if (cfg.screenShake && shake > 0) { g.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake); shake--; } else if (shake > 0) shake--;
      const scene = images[0];
      const cropWidth = scene.naturalHeight * W / H;
      const base = level.theme === "dock" ? 0 : level.theme === "night" ? 120 : 220;
      const cropX = Math.min(scene.naturalWidth - cropWidth, base + cam * .12);
      g.drawImage(scene, Math.max(0, cropX), 0, cropWidth, scene.naturalHeight, 0, 0, W, H);
      [...foes, p].sort((a, b) => a.y - b.y).forEach(drawFighter);
      if (cfg.damageNumbers) {
        g.font = "bold 12px monospace"; g.textAlign = "center";
        for (let i = floats.length - 1; i >= 0; i--) {
          const f = floats[i]; f.life--; f.y -= 0.8;
          if (f.life <= 0) { floats.splice(i, 1); continue; }
          g.fillStyle = highlight; g.fillText(f.txt, f.x - cam, f.y);
        }
      }
      g.restore();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const clear = () => { keys.current = {}; };
    window.addEventListener("blur", clear);
    return () => { disposed = true; keys.current = {}; cancelAnimationFrame(raf); window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); window.removeEventListener("blur", clear); };
  }, [level]);

  const [touch, setTouch] = useState("auto");
  useEffect(() => { setTouch(getArcadeSettings().touchControls); }, []);
  const touchCls = touch === "always" ? "" : touch === "never" ? "hidden" : "md:hidden";
  const press = (k: string, v: boolean) => { keys.current[k] = v; };
  const Btn = ({ k, label }: { k: string; label: string }) => (
    <Button size="icon" variant="outline" aria-label={label} title={label} className="size-11 select-none touch-none"
      onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); press(k, true); }} onPointerUp={() => press(k, false)} onPointerCancel={() => press(k, false)}>
      {k === "arrowup" ? <ArrowUp /> : k === "arrowdown" ? <ArrowDown /> : k === "arrowleft" ? <ArrowLeft /> : k === "arrowright" ? <ArrowRight /> : k === "j" ? <Swords /> : <Sparkles />}</Button>
  );

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex flex-wrap gap-2 justify-between items-center font-mono text-xs px-3 py-3 bg-card text-primary border-b border-border">
        <span>1UP {String(hud.score).padStart(6, "0")}</span>
        <span className="flex items-center gap-2">HP <meter aria-label="Vie du Towner" min={0} max={hud.max} value={hud.hp} className="w-24 h-3 accent-primary" /> {hud.hp}</span>
        <span>VAGUE {hud.wave}/{level.waves.length}</span>
      </div>
      <div className="relative">
        <canvas aria-label="Combat Street Arcade dans la ville SocialTown" ref={ref} width={W * 2} height={H * 2} className="block w-full aspect-video bg-background" />
        {!ready && <div role="status" className="absolute inset-0 grid place-items-center bg-background text-primary">{assetError ? "Le décor n’a pas pu se charger. Recharge la page." : "Connexion à l’arène…"}</div>}
        {hud.over && <div className="absolute inset-0 grid place-items-center bg-background/60 text-3xl font-black text-town-lemon">{hud.over}</div>}
      </div>
      <div className={`flex justify-between p-3 ${touchCls}`}>
        <div className="grid grid-cols-3 gap-1">
          <span /><Btn k="arrowup" label="Monter" /><span />
          <Btn k="arrowleft" label="Gauche" /><span /><Btn k="arrowright" label="Droite" />
          <span /><Btn k="arrowdown" label="Descendre" /><span />
        </div>
        <div className="flex gap-2 items-center"><Btn k="j" label="Frapper" /><Btn k="l" label="Attaque spéciale" /></div>
      </div>
      <p className="text-xs text-muted-foreground mt-2 hidden md:block">Flèches/ZQSD : bouger · J ou Espace : frapper · L : spéciale (coûte de la vie)</p>
    </div>
  );
}
