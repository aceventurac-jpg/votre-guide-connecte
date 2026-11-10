import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { MapPin, Search, Phone, ExternalLink, Navigation, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { searchWorldPlaces, getWorldPlace } from '@/lib/places.functions';
import { useIsAuthed } from '@/hooks/use-auth';
import { placeActionAvailability } from '@/lib/place-actions';

type Place = Awaited<ReturnType<typeof searchWorldPlaces>>[number];
type MapHandle = { panTo: (p: { lat: number; lng: number }) => void; getCenter: () => { lat: () => number; lng: () => number } | undefined; addListener: (event: string, fn: () => void) => { remove: () => void } };
type MarkerHandle = { setMap: (map: MapHandle | null) => void; addListener: (event: string, fn: () => void) => { remove: () => void } };
type MapsApi = { Map: new (el: HTMLElement, options: object) => MapHandle; Marker: new (options: object) => MarkerHandle };
declare global { interface Window { socialtownMapsReady?: () => void; google?: { maps: MapsApi } } }
let mapsLoading: Promise<MapsApi> | undefined;
function loadMap() {
  if (window.google?.maps.Map) return Promise.resolve(window.google.maps);
  if (mapsLoading) return mapsLoading;
  mapsLoading = new Promise<MapsApi>((resolve, reject) => {
    const key = import.meta.env['VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY'];
    if (!key) { reject(new Error('Google Maps n’est pas configuré.')); return; }
    window.socialtownMapsReady = () => { if (window.google?.maps) resolve(window.google.maps); else reject(new Error('Carte indisponible.')); };
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=socialtownMapsReady&channel=${import.meta.env['VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID'] ?? ''}&language=fr`;
    script.async = true; script.onerror = () => reject(new Error('Connexion à Google Maps impossible.')); document.head.appendChild(script);
  });
  return mapsLoading;
}

export function WorldPlaces({ initial = 'commerce', onClose }: { initial?: string; onClose: () => void }) {
  const { authed } = useIsAuthed();
  const search = useServerFn(searchWorldPlaces), detail = useServerFn(getWorldPlace);
  const mapElement = useRef<HTMLDivElement>(null), map = useRef<MapHandle | null>(null);
  const [query, setQuery] = useState(initial), [center, setCenter] = useState({ lat: 50.682, lng: 3.244 });
  const [places, setPlaces] = useState<Place[]>([]), [selected, setSelected] = useState<Place | null>(null);
  const [details, setDetails] = useState<Awaited<ReturnType<typeof getWorldPlace>> | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [ready, setReady] = useState(false), [searched, setSearched] = useState(false);
  const request = useRef(0), detailRequest = useRef(0);
  const sandbox = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
  useEffect(() => {
    if (sandbox) return;
    let disposed = false; let listener: { remove: () => void } | undefined;
    loadMap().then(api => {
      if (disposed || !mapElement.current) return;
      map.current = new api.Map(mapElement.current, { center, zoom: 14, clickableIcons: false, mapTypeControl: false, streetViewControl: false });
      listener = map.current.addListener('idle', () => { const p = map.current?.getCenter(); if (p) setCenter({ lat: p.lat(), lng: p.lng() }); }); setReady(true);
    }).catch(e => { if (!disposed) setError(e.message); });
    return () => { disposed = true; listener?.remove(); map.current = null; };
  }, [sandbox]);
  const choose = async (p: Place) => {
    const version = ++detailRequest.current; setSelected(p); setDetails(null); setError('');
    map.current?.panTo({ lat: p.lat, lng: p.lng });
    try { const d = await detail({ data: { id: p.id } }); if (version === detailRequest.current) setDetails(d); } catch (e) { if (version === detailRequest.current) setError(e instanceof Error ? e.message : 'Coordonnées indisponibles.'); }
  };
  useEffect(() => {
    if (!ready || !map.current || !window.google) return;
    const markers = places.map(p => { const m = new window.google.maps.Marker({ map: map.current, position: { lat: p.lat, lng: p.lng }, title: p.name }); const l = m.addListener('click', () => { void choose(p); }); return { m, l }; });
    return () => markers.forEach(({ m, l }) => { l.remove(); m.setMap(null); });
  }, [ready, places]);
  const lookup = async () => {
    if (!authed || sandbox || busy) return;
    const version = ++request.current; setBusy(true); setError(''); setSelected(null); setDetails(null); ++detailRequest.current;
    try { const rows = await search({ data: { query, ...center } }); if (version === request.current) { setPlaces(rows); setSearched(true); } } catch (e) { setError(e instanceof Error ? e.message : 'Recherche indisponible.'); } finally { if (version === request.current) setBusy(false); }
  };
  const actions = placeActionAvailability(details ?? {});
  return <section className="border-t border-border py-5 space-y-4" aria-label="Carte et lieux réels">
    <div className="flex justify-between gap-3"><div><p className="font-mono text-xs text-town-lemon">PASSERELLE MONDE RÉEL</p><h2 className="text-2xl font-bold mt-1">Commerces & professionnels</h2></div><Button variant="ghost" size="icon" aria-label="Fermer la carte" onClick={onClose}><X /></Button></div>
    <div className="flex flex-wrap gap-2">{['commerce', 'centre commercial', 'médecin', 'kinésithérapeute', 'infirmier'].map(q => <Button key={q} variant={query === q ? 'default' : 'outline'} size="sm" onClick={() => setQuery(q)}>{q}</Button>)}</div>
    <form className="flex gap-2" onSubmit={e => { e.preventDefault(); void lookup(); }}><input aria-label="Rechercher un lieu" value={query} onChange={e => setQuery(e.target.value)} className="min-w-0 flex-1" maxLength={180} placeholder="Commerce, professionnel, ville…" /><Button type="submit" disabled={!authed || sandbox || busy || query.trim().length < 2}><Search />{busy ? 'Recherche…' : 'Rechercher'}</Button></form>
    {!authed && <Button asChild variant="outline"><Link to="/auth">Se connecter pour rechercher des lieux</Link></Button>}
    <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => { navigator.geolocation?.getCurrentPosition(p => { const c = { lat: p.coords.latitude, lng: p.coords.longitude }; setCenter(c); map.current?.panTo(c); }, () => setError('Localisation refusée ou indisponible.')); }}><Navigation />Ma position</Button>{[{ name: 'Leers', lat: 50.682, lng: 3.244 }, { name: 'Tournai', lat: 50.607, lng: 3.389 }].map(c => <Button key={c.name} size="sm" variant="outline" onClick={() => { setCenter(c); map.current?.panTo(c); }}>{c.name}</Button>)}</div>
    <div ref={mapElement} className="world-map bg-secondary rounded-md">{sandbox && <p className="p-6 text-sm text-muted-foreground">Google Maps sera disponible sur le site déployé autorisé ; aucune recherche Google n’est exécutée ici.</p>}</div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <div className="grid gap-3 md:grid-cols-2"><div className="space-y-2">{places.map(p => <Button key={p.id} variant={selected?.id === p.id ? 'secondary' : 'outline'} className="w-full h-auto justify-start py-3 whitespace-normal text-left" onClick={() => { void choose(p); }}><MapPin className="shrink-0" /><span><span className="block font-bold">{p.name}</span><span className="block text-xs text-muted-foreground">{p.address}</span></span></Button>)}{searched && !places.length && <p className="text-sm">Aucun lieu trouvé dans cette recherche.</p>}</div>
    {selected && <article className="border border-border rounded-md p-4 space-y-3"><h3 className="text-xl font-bold">{selected.name}</h3><p className="text-sm text-muted-foreground">{selected.address}</p>{!details && !error && <p className="text-sm">Chargement des coordonnées…</p>}<div className="flex flex-wrap gap-2">{actions.phone && <Button asChild><a href={actions.phone}><Phone />Appeler</a></Button>}{actions.website && <Button asChild variant="outline"><a href={actions.website} target="_blank" rel="noopener noreferrer"><ExternalLink />{initial.includes('médecin') || initial.includes('kiné') || initial.includes('infirmier') ? 'Rendez-vous sur le site du professionnel' : 'Commander sur le site du commerce'}</a></Button>}{selected.mapsUrl && <Button asChild variant="outline"><a href={selected.mapsUrl} target="_blank" rel="noopener noreferrer"><MapPin />Voir sur Google Maps</a></Button>}</div><p className="text-xs text-muted-foreground">Référencement Google, pas une vérification professionnelle. Disponibilité, commande et rendez-vous sont confirmés uniquement par le prestataire ; aucun paiement n’est encaissé ici.</p></article>}</div>
    <p className="text-xs text-muted-foreground">Données Google Maps · Recherches limitées à 12 résultats, sans import mondial des entreprises. L’usage Google Maps peut entraîner des coûts.</p>
    <div className="flex gap-4 text-xs text-muted-foreground"><a href="https://maps.google.com/help/terms_maps/" target="_blank" rel="noopener noreferrer">Conditions Google Maps</a><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Confidentialité Google</a></div>
  </section>;
}