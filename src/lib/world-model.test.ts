import { describe, expect, test } from 'vitest';
import { stepWorld, worldDoor } from './world-model';
describe('Interactive Arcade world', () => {
  test('mouse and touch destination movement advances towards the same point', () => {
    expect(stepWorld({ x: 0, z: 0 }, { x: 12, z: 0 }, .05)).toEqual({ x: .5, z: 0 });
  });
  test('commerce entrance can be reached without leaving the street', () => {
    expect(worldDoor({ x: 12, z: -4 })?.id).toBe('mall');
    expect(worldDoor({ x: 12, z: 3 })).toBeUndefined();
  });
  test('health entrance is independently reachable', () => {
    expect(worldDoor({ x: 24, z: -4 })?.id).toBe('health');
  });
});