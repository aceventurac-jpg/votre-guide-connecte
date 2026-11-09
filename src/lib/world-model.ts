export type WorldPoint = { x: number; z: number };
export const WORLD_PORTALS = [
  { id: 'recipes', label: 'Halles culinaires', x: -24, z: -9, to: '/recipes' },
  { id: 'troc', label: 'Atelier du troc', x: -12, z: -9, to: '/troc' },
  { id: 'social', label: 'Place des expériences', x: 0, z: -9, to: '/community' },
  { id: 'mall', label: 'Commerces & centres', x: 12, z: -9, to: null },
  { id: 'health', label: 'Santé & services', x: 24, z: -9, to: null },
  { id: 'camera', label: 'Studio caméra', x: -18, z: 11, to: '/camera' },
  { id: 'mission', label: 'Arène Street Arcade', x: 0, z: 11, to: null },
  { id: 'solutions', label: 'Services maison', x: 18, z: 11, to: '/solutions' },
] as const;
export function stepWorld(p: WorldPoint, target: WorldPoint, seconds: number): WorldPoint {
  const dx = target.x - p.x, dz = target.z - p.z;
  const distance = Math.hypot(dx, dz);
  const step = Math.min(distance, 10 * Math.max(0, Math.min(seconds, .05)));
  if (distance < .01) return p;
  return { x: Math.max(-32, Math.min(32, p.x + dx / distance * step)), z: Math.max(-5, Math.min(7, p.z + dz / distance * step)) };
}
export function worldDoor(p: WorldPoint) {
  return WORLD_PORTALS.find(d => Math.hypot(d.x - p.x, (d.z < 0 ? -4 : 6) - p.z) < 3.5);
}