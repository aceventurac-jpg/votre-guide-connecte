import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';

export const searchWorldPlaces = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ query: z.string().trim().min(2).max(180), lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).parse(input))
  .handler(async ({ data }) => {
    const key = process.env['GOOGLE_MAPS_API_KEY'];
    const lovableKey = process.env['LOVABLE_API_KEY'];
    if (!key || !lovableKey) throw new Error('Google Maps n’est pas configuré.');
    const response = await fetch('https://connector-gateway.lovable.dev/google_maps/places/v1/places:searchText', {
      method: 'POST', headers: { Authorization: `Bearer ${lovableKey}`, 'X-Connection-Api-Key': key, 'Content-Type': 'application/json', 'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.googleMapsUri' },
      body: JSON.stringify({ textQuery: data.query, languageCode: 'fr', pageSize: 12, locationBias: { circle: { center: { latitude: data.lat, longitude: data.lng }, radius: 10000 } } }),
    });
    if (!response.ok) {
      const body = await response.text(); console.error(`Google Maps [${response.status}]: ${body}`);
      if (response.status === 403) {
        let reason = ''; try { const error = JSON.parse(body); reason = error.error?.details?.find((d: { reason?: string }) => d.reason)?.reason ?? ''; } catch {}
        if (reason === 'API_KEY_HTTP_REFERRER_BLOCKED') throw new Error('Google Maps refuse la clé serveur : ses restrictions doivent être « Aucune » ou « Adresses IP » dans Google Cloud.');
        if (reason === 'API_KEY_SERVICE_BLOCKED') throw new Error('La clé serveur Google Maps doit autoriser Places API (New) dans Google Cloud.');
        throw new Error('Google Maps refuse la recherche (403). Vérifiez les restrictions de la clé serveur.');
      }
      throw new Error(`Recherche Google Maps indisponible (${response.status}).`);
    }
    const payload = await response.json() as { places?: Array<{ id: string; displayName?: { text?: string }; formattedAddress?: string; location?: { latitude: number; longitude: number }; googleMapsUri?: string }> };
    return (payload.places ?? []).filter(p => p.location && p.displayName?.text).map(p => ({ id: p.id, name: p.displayName?.text ?? '', address: p.formattedAddress ?? '', lat: p.location?.latitude ?? 0, lng: p.location?.longitude ?? 0, mapsUrl: p.googleMapsUri ?? '' }));
  });

export const getWorldPlace = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().regex(/^[A-Za-z0-9_-]+$/).max(250) }).parse(input))
  .handler(async ({ data }) => {
    const key = process.env['GOOGLE_MAPS_API_KEY'], lovableKey = process.env['LOVABLE_API_KEY'];
    if (!key || !lovableKey) throw new Error('Google Maps n’est pas configuré.');
    const response = await fetch(`https://connector-gateway.lovable.dev/google_maps/places/v1/places/${data.id}?languageCode=fr`, { headers: { Authorization: `Bearer ${lovableKey}`, 'X-Connection-Api-Key': key, 'X-Goog-FieldMask': 'id,displayName,formattedAddress,websiteUri,nationalPhoneNumber,googleMapsUri,businessStatus' } });
    if (!response.ok) { const body = await response.text(); console.error(`Google Maps [${response.status}]: ${body}`); throw new Error(response.status === 403 ? 'Google Maps refuse les coordonnées (403). Vérifiez que la clé serveur autorise Places API (New), sans restriction de site web.' : `Coordonnées indisponibles (${response.status}).`); }
    const place = await response.json() as { websiteUri?: string; nationalPhoneNumber?: string; googleMapsUri?: string; businessStatus?: string };
    return { website: place.websiteUri ?? '', phone: place.nationalPhoneNumber ?? '', mapsUrl: place.googleMapsUri ?? '', status: place.businessStatus ?? '' };
  });