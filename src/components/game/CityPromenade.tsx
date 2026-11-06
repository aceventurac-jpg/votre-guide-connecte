import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, DoorOpen, ExternalLink, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getArcadeSettings } from "@/lib/arcade-settings";
import { CITY_PORTALS, moveTowner, nearbyPortal, SHOPPING_CENTRES } from "@/lib/city-navigation";
import promenade from "@/assets/socialtown-combat-quay.jpg";
import character from "@/assets/towner-walking.png";

export function CityPromenade({ name, onMission }: { name: string; onMission: () => void }) {
  const viewport = useRef<HTMLDivElement>(null);
  const actor = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const keys = useRef<Record<string, boolean>>({});
  const position = useRef({ x: 770, y: 855 });
  const target = useRef<{ x: number; y: number } | null>(null);
  const [near, setNear] = useState<string | null>("social");
  const [centreId, setCentreId] = useState("leers");
  const [inCentre, setInCentre] = useState(false);
  const [touch, setTouch] = useState("auto");
  const centre = SHOPPING_CENTRES.find(c => c.id === centreId) ?? SHOPPING_CENTRES[0];
  const portal = CITY_PORTALS.find(p => p.id === near);
  useEffect(() => {
    setTouch(getArcadeSettings().touchControls);
    let frame = 0, previous = 0, lastNear: string | null = "social";
    const down = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).matches("input,select,textarea")) return;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) e.preventDefault();
      keys.current[e.key.toLowerCase()] = true;
    };
    const up = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    const clear = () => { keys.current = {}; };
    const loop = (time: number) => {
      const dt = previous ? (time - previous) / 1000 : 0; previous = time;
      const k = keys.current;
      let dx = Number(Boolean(k.arrowright || k.d)) - Number(Boolean(k.arrowleft || k.q || k.a));
      let dy = Number(Boolean(k.arrowdown || k.s)) - Number(Boolean(k.arrowup || k.z || k.w));
      if (dx || dy) target.current = null;
      if (target.current) {
        const distX = target.current.x - position.current.x, distY = target.current.y - position.current.y;
        if (Math.hypot(distX, distY) < 12) target.current = null;
        else { dx = Math.abs(distX) < 8 ? 0 : Math.sign(distX); dy = Math.abs(distY) < 8 ? 0 : Math.sign(distY); }
      }
      position.current = moveTowner(position.current.x, position.current.y, dx, dy, dt);
      const scale = (viewport.current?.clientHeight ?? 500) / 1024;
      const visibleWidth = viewport.current?.clientWidth ?? 800;
      const camera = Math.max(0, Math.min(1920 * scale - visibleWidth, position.current.x * scale - visibleWidth / 2));
      if (world.current) world.current.style.transform = `translateX(${-camera}px)`;
      if (actor.current) {
        actor.current.style.left = `${position.current.x / 1920 * 100}%`;
        actor.current.style.top = `${position.current.y / 1024 * 100}%`;
        actor.current.dataset.walking = dx || dy ? "true" : "false";
        actor.current.dataset.direction = dx < 0 ? "left" : "right";
      }
      const id = nearbyPortal(position.current.x, position.current.y)?.id ?? null;
      if (id !== lastNear) { lastNear = id; setNear(id); }
      frame = requestAnimationFrame(loop);
    };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up); window.addEventListener("blur", clear);
    frame = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); window.removeEventListener("blur", clear); };
  }, []);
  const walkTo = (x: number, y: number) => { target.current = { x, y }; };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm text-primary"><MapPin className="size-4" /> {centre.city} · {centre.country}</p>
        <select aria-label="Territoire" value={centreId} onChange={e => { setCentreId(e.target.value); setInCentre(false); }}>{SHOPPING_CENTRES.map(c => <option key={c.id} value={c.id}>{c.city} · {c.country}</option>)}</select>
      </div>
      <div ref={viewport} className="city-promenade relative overflow-hidden bg-background" onPointerDown={e => {
        if ((e.target as HTMLElement).closest("button,a")) return;
        const bounds = world.current?.getBoundingClientRect();
        if (bounds) walkTo((e.clientX - bounds.left) / bounds.width * 1920, Math.max(735, Math.min(955, (e.clientY - bounds.top) / bounds.height * 1024)));
      }}>
        <div ref={world} className="city-promenade-world absolute left-0 top-0 h-full">
          <img src={promenade} width={1920} height={1024} alt="Promenade virtuelle SocialTown, centre commercial, canaux et pavillon arcade" className="pointer-events-none size-full select-none" />
          {CITY_PORTALS.map(p => <Button key={p.id} variant="outline" className="city-door absolute bg-background/90 text-xs" style={{ left: `${p.x / 1920 * 100}%`, top: `${(p.y - 135) / 1024 * 100}%` }} onClick={() => walkTo(p.x, p.y)}><DoorOpen />{p.id === "mall" ? centre.name : p.label}</Button>)}
          <div ref={actor} className="city-towner absolute" aria-label={`Personnage ${name}`}>
            <img src={character} width={816} height={816} alt="Towner" className="city-towner-image pointer-events-none size-full object-contain" />
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded bg-background/90 px-2 text-xs text-primary">{name}</span>
          </div>
        </div>
        <span className="absolute left-3 top-3 rounded bg-background/85 px-3 py-2 font-mono text-[10px] text-town-lemon">VILLE VIRTUELLE · DÉCOR CONCEPTUEL</span>
        {portal && <div className="absolute inset-x-0 bottom-4 flex justify-center px-3">
          {portal.to ? <Button asChild><Link to={portal.to}><DoorOpen />Entrer · {portal.label}</Link></Button> : <Button onClick={() => portal.id === "mall" ? setInCentre(true) : onMission()}><DoorOpen />Entrer · {portal.id === "mall" ? centre.name : "Arène"}</Button>}
        </div>}
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Destinations de la promenade">{CITY_PORTALS.map(p => <Button key={p.id} size="sm" variant="outline" onClick={() => walkTo(p.x, p.y)}>{p.id === "mall" ? centre.name : p.label}</Button>)}</div>
      <div className={`flex gap-2 ${touch === "never" ? "hidden" : touch === "auto" ? "md:hidden" : ""}`}>
        {[["arrowleft", ArrowLeft, "Marcher à gauche"], ["arrowup", ArrowUp, "Marcher vers le haut"], ["arrowdown", ArrowDown, "Marcher vers le bas"], ["arrowright", ArrowRight, "Marcher à droite"]].map(([key, Icon, label]) => {
          const DirectionIcon = Icon as typeof ArrowLeft;
          return <Button key={String(key)} variant="outline" size="icon" aria-label={String(label)} className="touch-none" onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); keys.current[String(key)] = true; }} onPointerUp={() => { keys.current[String(key)] = false; }} onPointerCancel={() => { keys.current[String(key)] = false; }}><DirectionIcon /></Button>;
        })}
      </div>
      {inCentre && <section className="border-t border-border py-6" aria-label="Centre commercial">
        <div className="flex items-start justify-between gap-3"><div><p className="font-mono text-xs text-town-lemon">LIEU RÉEL · VISITE VIRTUELLE CONCEPTUELLE</p><h2 className="mt-2 text-2xl font-bold">{centre.name}</h2><p className="mt-2 text-sm text-muted-foreground">{centre.address}</p></div><Button variant="ghost" size="icon" aria-label="Quitter le centre" onClick={() => setInCentre(false)}><X /></Button></div>
        <div className="my-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{centre.shops.map(shop => <a key={shop} href={centre.directory} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border bg-card p-4"><span className="font-bold">{shop}</span><span className="mt-2 flex items-center gap-2 text-xs text-primary">Annuaire officiel <ExternalLink className="size-3" /></span></a>)}</div>
        <p className="mb-4 text-sm text-muted-foreground">Commerces référencés par le centre. Aucun catalogue, stock, paiement ou achat n’est connecté dans SocialTown.</p>
        <Button asChild variant="outline"><a href={centre.url} target="_blank" rel="noopener noreferrer"><ExternalLink />Site officiel du centre</a></Button>
      </section>}
    </div>
  );
}