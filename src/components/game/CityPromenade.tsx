import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, DoorOpen, ExternalLink, Map, MessageCircle, Car, Bike, Footprints, X, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getArcadeSettings } from '@/lib/arcade-settings';
import { CITY_PORTALS, nearbyPortal, SHOPPING_CENTRES } from '@/lib/city-navigation';
import { advanceStreet, approachStreet, MOBILITY, type Mobility } from '@/lib/world-mobility';
import { townerImage } from '@/lib/towner-avatar';
import { WorldPlaces } from './WorldPlaces';
import promenade from '@/assets/socialtown-combat-quay.jpg';
import car from '@/assets/socialtown-electric-car.png';
import motorcycle from '@/assets/socialtown-motorcycle.png';

export function CityPromenade({ name, form, onMission, onStudio }: { name: string; form?: string; onMission: () => void; onStudio?: () => void }) {
  const viewport = useRef<HTMLDivElement>(null), actor = useRef<HTMLDivElement>(null), world = useRef<HTMLDivElement>(null);
  const keys = useRef<Record<string, boolean>>({}), position = useRef({ x: 770, y: 855 }), target = useRef<{ x: number; y: number } | null>(null);
  const [near, setNear] = useState<string | null>('social'), [centreId, setCentreId] = useState('leers'), [inCentre, setInCentre] = useState(false);
  const [touch, setTouch] = useState('auto'), [mode, setMode] = useState<Mobility>('walk'), [placesQuery, setPlacesQuery] = useState<string | null>(null);
  const mobility = useRef<Mobility>('walk');
  const centre = SHOPPING_CENTRES.find(c => c.id === centreId) ?? SHOPPING_CENTRES[0];
  const portal = CITY_PORTALS.find(p => p.id === near);
  useEffect(() => {
    setTouch(getArcadeSettings().touchControls);
    let frame = 0, previous = 0, lastNear: string | null = 'social';
    const down = (e: KeyboardEvent) => { if ((e.target as HTMLElement).matches('input,select,textarea')) return; if (e.key.startsWith('Arrow')) e.preventDefault(); keys.current[e.key.toLowerCase()] = true; };
    const up = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    const clear = () => { keys.current = {}; };
    const loop = (time: number) => {
      const dt = previous ? (time - previous) / 1000 : 0; previous = time;
      const k = keys.current;
      const dx = Number(Boolean(k.arrowright || k.d)) - Number(Boolean(k.arrowleft || k.q || k.a));
      const dy = Number(Boolean(k.arrowdown || k.s)) - Number(Boolean(k.arrowup || k.z || k.w));
      if (dx || dy) target.current = null;
      const old = position.current;
      position.current = target.current ? approachStreet(old, target.current, dt, mobility.current) : advanceStreet(old, { x: dx, y: dy }, dt, mobility.current);
      if (target.current && Math.hypot(target.current.x - position.current.x, target.current.y - position.current.y) < 1) target.current = null;
      const scale = (viewport.current?.clientHeight ?? 500) / 1024;
      const width = viewport.current?.clientWidth ?? 800;
      if (world.current) { world.current.style.width = `${1920 * scale}px`; world.current.style.transform = `translateX(${-Math.max(0, Math.min(Math.max(0, 1920 * scale - width), position.current.x * scale - width / 2))}px)`; }
      if (actor.current) {
        actor.current.style.left = `${position.current.x / 1920 * 100}%`; actor.current.style.top = `${position.current.y / 1024 * 100}%`;
        actor.current.dataset.walking = Math.hypot(old.x - position.current.x, old.y - position.current.y) > .01 ? 'true' : 'false';
        if (Math.abs(old.x - position.current.x) > .01) actor.current.dataset.direction = position.current.x < old.x ? 'left' : 'right';
      }
      const id = nearbyPortal(position.current.x, position.current.y)?.id ?? null;
      if (id !== lastNear) { lastNear = id; setNear(id); }
      frame = requestAnimationFrame(loop);
    };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', clear); frame = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', clear); };
  }, []);
  const walkTo = (x: number, y: number) => { target.current = { x, y }; };
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-2 justify-between"><p className="font-mono text-xs text-primary">{centre.city} · {centre.country} / QUAI SOCIALTOWN</p><div className="flex gap-1"><Button size="icon" variant="outline" title="Carte mondiale et lieux" aria-label="Carte mondiale et lieux" onClick={() => setPlacesQuery('commerce')}><Map /></Button><Button asChild size="icon" variant="outline" title="Échanges Towners"><Link to="/messages" search={{ other_id: undefined }} aria-label="Échanges Towners"><MessageCircle /></Link></Button>{onStudio && <Button size="icon" variant="outline" title="Atelier de création" aria-label="Atelier de création" onClick={onStudio}><Wrench /></Button>}<select aria-label="Territoire" value={centreId} onChange={e => { setCentreId(e.target.value); setInCentre(false); }}>{SHOPPING_CENTRES.map(c => <option key={c.id} value={c.id}>{c.city}</option>)}</select></div></div>
    <div ref={viewport} className="city-promenade relative overflow-hidden bg-background touch-none" aria-label="Rue navigable SocialTown" onPointerDown={e => {
      if ((e.target as HTMLElement).closest('button,a')) return;
      const bounds = world.current?.getBoundingClientRect(); if (bounds) walkTo((e.clientX - bounds.left) / bounds.width * 1920, Math.max(735, Math.min(955, (e.clientY - bounds.top) / bounds.height * 1024)));
    }}>
      <div ref={world} className="city-promenade-world absolute left-0 top-0 h-full">
        <img src={promenade} width={1920} height={1024} alt="Quai SocialTown futuriste, canaux, végétation et commerces" className="pointer-events-none size-full select-none" />
        <div className="world-water" /><img src={car} alt="Trafic virtuel" width={1152} height={576} className="world-traffic pointer-events-none" />
        {CITY_PORTALS.map(p => <Button key={p.id} variant="outline" className="city-door absolute bg-background/90 text-xs" style={{ left: `${p.x / 1920 * 100}%`, top: `${(p.y - 135) / 1024 * 100}%` }} onClick={() => walkTo(p.x, p.y)}><DoorOpen />{p.id === 'mall' ? centre.name : p.label}</Button>)}
        <div ref={actor} className={`city-towner absolute ${mode === 'car' ? 'world-driver' : ''}`} aria-label={`Personnage ${name}`} data-mobility={mode}>
          {mode !== 'car' && <img src={townerImage(form)} width={1024} height={1024} alt="Towner" className="city-towner-image pointer-events-none size-full object-contain" />}
          {mode === 'car' && <img src={car} width={1152} height={576} alt="Voiture du Towner" className="city-towner-image pointer-events-none size-full object-contain" />}
          {mode === 'motorcycle' && <img src={motorcycle} width={1152} height={576} alt="Moto du Towner" className="world-bike" />}
          {mode === 'bicycle' && <Bike className="world-bike text-primary" />}
          {(mode === 'skate' || mode === 'rollers') && <div className={`world-board ${mode}`} />}
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded bg-background/90 px-2 text-xs text-primary whitespace-nowrap">{name} · {MOBILITY[mode].label}</span>
        </div>
        <Button variant="outline" size="sm" className="absolute world-parked" onClick={() => { mobility.current = 'car'; setMode('car'); walkTo(1020, 880); }}><Car />Prendre la voiture</Button>
      </div>
      <span className="absolute left-3 top-3 rounded bg-background/85 px-3 py-2 font-mono text-[10px] text-town-lemon">MONDE LOCAL · TRANSPORT VIRTUEL</span>
      {portal && <div className="absolute inset-x-0 bottom-4 flex justify-center px-3">{portal.to ? <Button asChild><Link to={portal.to}><DoorOpen />Entrer · {portal.label}</Link></Button> : <Button onClick={() => portal.id === 'mall' ? setInCentre(true) : onMission()}><DoorOpen />Entrer · {portal.id === 'mall' ? centre.name : 'Arène'}</Button>}</div>}
    </div>
    <div className="flex flex-wrap gap-2" aria-label="Transports">{(Object.keys(MOBILITY) as Mobility[]).map(m => <Button key={m} size="sm" variant={mode === m ? 'default' : 'outline'} onClick={() => { mobility.current = m; setMode(m); }}>{m === 'walk' ? <Footprints /> : m === 'car' ? <Car /> : <Bike />}{MOBILITY[m].label}</Button>)}</div>
    <div className="flex flex-wrap gap-2" aria-label="Destinations de la promenade">{CITY_PORTALS.map(p => <Button key={p.id} size="sm" variant="outline" onClick={() => walkTo(p.x, p.y)}>{p.id === 'mall' ? centre.name : p.label}</Button>)}<Button size="sm" variant="outline" onClick={() => setPlacesQuery('médecin kinésithérapeute infirmier')}>Santé & rendez-vous</Button></div>
    <div className={`flex gap-2 ${touch === 'never' ? 'hidden' : touch === 'auto' ? 'md:hidden' : ''}`}>{[['arrowleft', ArrowLeft, 'Marcher à gauche'], ['arrowup', ArrowUp, 'Marcher vers le haut'], ['arrowdown', ArrowDown, 'Marcher vers le bas'], ['arrowright', ArrowRight, 'Marcher à droite']].map(([key, Icon, label]) => { const DirectionIcon = Icon as typeof ArrowLeft; return <Button key={String(key)} variant="outline" size="icon" aria-label={String(label)} className="touch-none" onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); keys.current[String(key)] = true; }} onPointerUp={() => { keys.current[String(key)] = false; }} onPointerCancel={() => { keys.current[String(key)] = false; }} onLostPointerCapture={() => { keys.current[String(key)] = false; }}><DirectionIcon /></Button>; })}</div>
    {inCentre && <section className="border-t border-border py-6 space-y-4" aria-label="Centre commercial"><div className="flex justify-between gap-3"><div><p className="font-mono text-xs text-town-lemon">LIEU RÉEL · VISITE CONCEPTUELLE</p><h2 className="mt-2 text-2xl font-bold">{centre.name}</h2><p className="text-sm text-muted-foreground">{centre.address}</p></div><Button variant="ghost" size="icon" aria-label="Quitter le centre" onClick={() => setInCentre(false)}><X /></Button></div><div className="flex flex-wrap gap-2"><Button onClick={() => setPlacesQuery(`commerces ${centre.name} ${centre.city}`)}><Map />Trouver les commerces</Button><Button asChild variant="outline"><a href={centre.directory} target="_blank" rel="noopener noreferrer"><ExternalLink />Annuaire officiel</a></Button><Button asChild variant="outline"><a href={centre.url} target="_blank" rel="noopener noreferrer"><ExternalLink />Site du centre</a></Button></div><p className="text-sm text-muted-foreground">La commande se poursuit auprès du commerce. Aucun catalogue, stock, paiement ou achat n’est connecté dans SocialTown.</p></section>}
    {placesQuery !== null && <WorldPlaces key={placesQuery} initial={placesQuery} onClose={() => setPlacesQuery(null)} />}
  </div>;
}
