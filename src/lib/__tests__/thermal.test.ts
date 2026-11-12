import { expect, it } from 'vitest';
import { initialThermal, stepThermal } from '../thermal';
function simulate(kp: number, ki: number, kd: number, seconds = 240) {
  let s = initialThermal();
  for (let i = 0; i < seconds * 10; i++) s = stepThermal(s, { kp, ki, kd, target: 60 });
  return s;
}
it('produces real overshoot for aggressive PI and a better-damped PID response', () => {
  const pi = simulate(12, 1.5, 0),
    pid = simulate(4, 0.18, 25);
  expect(pi.peak).toBeGreaterThan(65);
  expect(pid.peak).toBeLessThan(pi.peak);
  expect(Math.abs(pid.temperature - 60)).toBeLessThan(1);
  expect(pid.stable).toBeGreaterThan(10);
});
it('models transport delay, proportional offset and bounded actuation', () => {
  let s = initialThermal();
  for (let i = 0; i < 30; i++) s = stepThermal(s, { kp: 20, ki: 2, kd: 0, target: 100 });
  expect(s.temperature).toBe(25);
  expect(s.output).toBe(100);
  const p = simulate(3, 0, 0);
  expect(p.temperature).toBeLessThan(56);
  expect(p.temperature).toBeGreaterThan(45);
  expect(p.history.every((s) => s.output >= 0 && s.output <= 100)).toBe(true);
});
it('recovers from a cooling disturbance and removes integral action when Ki is zero', () => {
  let s = simulate(4, 0.18, 25);
  const before = s.temperature;
  for (let i = 0; i < 200; i++) s = stepThermal(s, { kp: 4, ki: 0.18, kd: 25, target: 60 }, 12);
  expect(s.temperature).toBeLessThan(before);
  for (let i = 0; i < 2200; i++) s = stepThermal(s, { kp: 4, ki: 0.18, kd: 25, target: 60 }, 12);
  expect(Math.abs(s.temperature - 60)).toBeLessThan(1);
  s = stepThermal(s, { kp: 4, ki: 0, kd: 25, target: 60 });
  expect(s.integral).toBe(0);
});
