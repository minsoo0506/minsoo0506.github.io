/** Educational two-lag plant: G(s)=1.4 exp(-3s)/((8s+1)(24s+1)) °C/%.
 * Euler integration at 0.1 s. Actuator: 0..100%; ambient: 25 °C.
 * Parallel PID, derivative on measurement with 0.8 s low-pass filter.
 */
export type Gains = { kp: number; ki: number; kd: number; target: number };
export type Thermal = {
  time: number;
  temperature: number;
  heater: number;
  integral: number;
  derivative: number;
  previous: number;
  output: number;
  delay: number[];
  stable: number;
  peak: number;
  history: { time: number; temperature: number; target: number; output: number }[];
};
export const initialThermal = (target = 60): Thermal => ({
  time: 0,
  temperature: 25,
  heater: 0,
  integral: 0,
  derivative: 0,
  previous: 25,
  output: 0,
  delay: Array(30).fill(0),
  stable: 0,
  peak: 25,
  history: [{ time: 0, temperature: 25, target, output: 0 }],
});
export function stepThermal(s: Thermal, g: Gains, disturbance = 0): Thermal {
  const dt = 0.1,
    error = g.target - s.temperature;
  const derivative =
    s.derivative + (dt / (0.8 + dt)) * ((s.temperature - s.previous) / dt - s.derivative);
  const trial = g.ki === 0 ? 0 : s.integral + g.ki * error * dt;
  const raw = g.kp * error + trial - g.kd * derivative;
  const integral =
    (raw > 100 && error > 0) || (raw < 0 && error < 0) ? (g.ki === 0 ? 0 : s.integral) : trial;
  const output = Math.max(0, Math.min(100, g.kp * error + integral - g.kd * derivative));
  const delayed = s.delay[0];
  const heater = s.heater + (dt * (1.4 * delayed - s.heater)) / 8;
  const temperature = s.temperature + (dt * (25 + s.heater - s.temperature - disturbance)) / 24;
  const time = s.time + dt;
  return {
    time,
    temperature,
    heater,
    integral,
    derivative,
    previous: s.temperature,
    output,
    delay: [...s.delay.slice(1), output],
    stable: Math.abs(g.target - temperature) <= 2 ? s.stable + dt : 0,
    peak: Math.max(s.peak, temperature),
    history: [...s.history.slice(-1199), { time, temperature, target: g.target, output }],
  };
}
