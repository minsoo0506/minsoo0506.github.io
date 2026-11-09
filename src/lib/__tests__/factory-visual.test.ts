import { describe, expect, it } from 'vitest';
import { productVisual } from '../factory-visual';

describe('3D factory animation', () => {
  it('places products at the sensor and reject gate at their simulated times', () => {
    expect(productVisual(600, undefined).progress).toBeCloseTo(0.2);
    expect(productVisual(1800, undefined).progress).toBeCloseTo(0.6);
  });
  it('animates a rejected product off the belt and hides it after leaving', () => {
    expect(productVisual(1950, 'rejected').diversion).toBeGreaterThan(0);
    expect(productVisual(2300, 'rejected').visible).toBe(false);
    expect(productVisual(1950, 'missed').diversion).toBe(0);
  });
});
