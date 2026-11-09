import { describe, expect, it } from 'vitest';
import { createFactory, advanceFactory } from '../factory';

describe('factory simulation', () => {
  it('sorts five defective products when the pulse overlaps their arrival', () => {
    let state = createFactory();
    state = advanceFactory(state, 23000, { delay: 1200, duration: 400 });
    expect(state.finished).toBe(true);
    expect(state.rejected).toBe(5);
    expect(state.missed).toBe(0);
    expect(state.falseRejects).toBe(0);
    expect(state.logs.some((entry) => entry.text.includes('REJECT ON'))).toBe(true);
  });
  it('misses defects when the pulse ends before products reach the actuator', () => {
    const state = advanceFactory(createFactory(), 23000, { delay: 200, duration: 200 });
    expect(state.rejected).toBe(0);
    expect(state.missed).toBe(5);
  });
  it('captures timing settings at detection rather than retroactively', () => {
    const detected = advanceFactory(createFactory(), 700, { delay: 1200, duration: 400 });
    const result = advanceFactory(detected, 2500, { delay: 0, duration: 100 });
    expect(result.rejected).toBe(1);
  });
  it('counts a good product as wrongly rejected if a long pulse overlaps it', () => {
    const state = advanceFactory(createFactory(), 23000, { delay: 1800, duration: 2500 });
    expect(state.falseRejects).toBeGreaterThan(0);
  });
});
