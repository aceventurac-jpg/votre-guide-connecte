import { describe, expect, test } from 'vitest';
import { advanceStreet, approachStreet, MOBILITY } from './world-mobility';
describe('Shared street mobility', () => {
  test('all requested transports belong to the same world', () => {
    expect(Object.keys(MOBILITY)).toEqual(['walk', 'car', 'motorcycle', 'bicycle', 'skate', 'rollers']);
  });
  test('car advances faster than walking using the same controls', () => {
    expect(advanceStreet({ x: 100, y: 800 }, { x: 1, y: 0 }, .05, 'car').x).toBe(126);
    expect(advanceStreet({ x: 100, y: 800 }, { x: 1, y: 0 }, .05, 'walk').x).toBe(109.25);
  });
  test('diagonal movement does not increase speed', () => {
    const p = advanceStreet({ x: 100, y: 800 }, { x: 1, y: 1 }, .05, 'bicycle');
    expect(Math.hypot(p.x - 100, p.y - 800)).toBeCloseTo(15);
  });
  test('pointer destination never overshoots the commerce entrance', () => {
    expect(approachStreet({ x: 999, y: 800 }, { x: 1000, y: 800 }, .05, 'car')).toEqual({ x: 1000, y: 800 });
  });
});