export const MOBILITY = {
  walk: { label: 'À pied', speed: 185 },
  car: { label: 'Voiture', speed: 520 },
  motorcycle: { label: 'Moto', speed: 450 },
  bicycle: { label: 'Vélo', speed: 300 },
  skate: { label: 'Skate', speed: 260 },
  rollers: { label: 'Rollers', speed: 240 },
} as const;
export type Mobility = keyof typeof MOBILITY;
export type StreetPosition = { x: number; y: number };
export function advanceStreet(position: StreetPosition, direction: StreetPosition, seconds: number, mode: Mobility): StreetPosition {
  const length = Math.hypot(direction.x, direction.y);
  if (!length) return position;
  const distance = MOBILITY[mode].speed * Math.max(0, Math.min(seconds, .05));
  return {
    x: Math.max(65, Math.min(1855, position.x + direction.x / length * distance)),
    y: Math.max(735, Math.min(955, position.y + direction.y / length * distance)),
  };
}
export function approachStreet(position: StreetPosition, target: StreetPosition, seconds: number, mode: Mobility) {
  const dx = target.x - position.x, dy = target.y - position.y;
  const distance = Math.hypot(dx, dy);
  const step = MOBILITY[mode].speed * Math.max(0, Math.min(seconds, .05));
  if (distance <= step) return { x: Math.max(65, Math.min(1855, target.x)), y: Math.max(735, Math.min(955, target.y)) };
  return advanceStreet(position, { x: dx, y: dy }, seconds, mode);
}