import { useEffect, useState } from 'react';
import { initialThermal, stepThermal } from '../../lib/thermal';
const presets = [
  { name: 'P only · offset', kp: 3, ki: 0, kd: 0 },
  { name: 'Aggressive PI · overshoot', kp: 12, ki: 1.5, kd: 0 },
  { name: 'Damped PID', kp: 4, ki: 0.18, kd: 25 },
];
export function PidStage() {
  const [gains, setGains] = useState({ target: 60, kp: 4, ki: 0.18, kd: 25 });
  const [running, setRunning] = useState(false);
  const [load, setLoad] = useState(false);
  const [state, setState] = useState(() => initialThermal());
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(
      () =>
        setState((old) => {
          let next = old;
          for (let i = 0; i < 5; i++) next = stepThermal(next, gains, load ? 12 : 0);
          return next;
        }),
      100
    );
    return () => clearInterval(timer);
  }, [running, gains, load]);
  const first = state.history[0].time,
    last = Math.max(first + 120, state.time);
  const ymax = Math.max(
    100,
    Math.ceil(Math.max(...state.history.map((p) => p.temperature), gains.target) / 20) * 20
  );
  const x = (t: number) => 50 + ((t - first) / (last - first)) * 650,
    y = (v: number) => 220 - (v / ymax) * 190;
  const points = state.history.map((p) => `${x(p.time)},${y(p.temperature)}`).join(' ');
  const reset = () => {
    setState(initialThermal(gains.target));
    setRunning(false);
    setLoad(false);
  };
  return (
    <div className="stage-lab">
      <header>
        <span>STAGE 03 / CLOSED-LOOP CONTROL</span>
        <h2>Thermal process · PID tuning</h2>
        <p>
          Tune a delayed thermal plant. Compare overshoot, steady-state error and disturbance
          rejection. Hold the target within ±2 °C for 10 simulated seconds.
        </p>
      </header>
      <div className="stage-panel">
        <div className="pid-presets">
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                setGains({ ...gains, kp: p.kp, ki: p.ki, kd: p.kd });
                reset();
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
        <div className="pid-metrics">
          {[
            ['SETPOINT', `${gains.target}°C`],
            ['PROCESS VALUE', `${state.temperature.toFixed(1)}°C`],
            ['HEATER OUTPUT', `${state.output.toFixed(1)}%`],
            [
              'PEAK / OVERSHOOT',
              `${state.peak.toFixed(1)}°C / ${Math.max(0, state.peak - gains.target).toFixed(1)}°C`,
            ],
          ].map(([name, value]) => (
            <div key={name}>
              <small>{name}</small>
              <b>{value}</b>
            </div>
          ))}
        </div>
        <div className="pid-chart">
          <svg viewBox="0 0 740 260" role="img" aria-label="Temperature trend">
            <text x="8" y="14" fill="#a7cbb8" fontSize="11">
              °C
            </text>
            {Array.from({ length: 6 }, (_, i) => (i * ymax) / 5).map((t) => (
              <g key={t}>
                <line x1="50" x2="700" y1={y(t)} y2={y(t)} stroke="#33555b" />
                <text x="12" y={y(t) + 4} fill="#9ab8bc" fontSize="10">
                  {t.toFixed(0)}
                </text>
              </g>
            ))}
            <polyline
              points={state.history.map((p) => `${x(p.time)},${y(p.target)}`).join(' ')}
              fill="none"
              stroke="#efbc64"
              strokeDasharray="5 4"
              strokeWidth="2"
            />
            <polyline points={points} fill="none" stroke="#70d9bc" strokeWidth="2.5" />
            {[0, 0.25, 0.5, 0.75, 1].map((f) => (
              <text
                key={f}
                x={50 + f * 650}
                y="242"
                fill="#a7cbb8"
                fontSize="10"
                textAnchor="middle"
              >
                {(first + f * (last - first)).toFixed(0)}s
              </text>
            ))}
          </svg>
          <span>Green: measured temperature · Gold: setpoint · 5× simulation speed</span>
        </div>
        <div className="pid-output">
          <span>Actuator demand</span>
          <meter aria-label="Heater demand" min="0" max="100" value={state.output} />
          <b>{state.output.toFixed(1)}%</b>
          <span>{state.time.toFixed(1)} s elapsed</span>
        </div>
        <div className="pid-settings">
          {[
            { key: 'target', label: 'Setpoint', min: 30, max: 100, step: 1 },
            { key: 'kp', label: 'Kp', min: 0, max: 20, step: 0.1 },
            { key: 'ki', label: 'Ki', min: 0, max: 2, step: 0.01 },
            { key: 'kd', label: 'Kd', min: 0, max: 60, step: 1 },
          ].map((p) => (
            <label key={p.key}>
              {p.label}
              <b>{gains[p.key as keyof typeof gains]}</b>
              <input
                type="range"
                aria-label={p.label}
                min={p.min}
                max={p.max}
                step={p.step}
                value={gains[p.key as keyof typeof gains]}
                onChange={(e) => {
                  setGains({ ...gains, [p.key]: Number(e.target.value) });
                  setState((old) => ({ ...old, stable: 0, peak: old.temperature }));
                }}
              />
            </label>
          ))}
        </div>
        <div className="stage-buttons">
          <button onClick={() => setRunning(!running)}>
            {running ? 'Pause simulation' : 'Start simulation'}
          </button>
          <button onClick={reset}>Reset</button>
          <button
            aria-pressed={load}
            onClick={() => {
              setLoad(!load);
              setState((old) => ({ ...old, stable: 0 }));
            }}
          >
            {load ? 'Remove cooling load' : 'Apply cooling load'}
          </button>
        </div>
        <div className="stage-message" role="status">
          {state.stable >= 10
            ? 'Target achieved · held within ±2 °C for 10 seconds.'
            : `In range: ${state.stable.toFixed(
                1
              )} / 10 s. Try aggressive PI to observe overshoot, then compare the damped PID preset.`}
        </div>
        <details className="pid-theory">
          <summary>Plant model & controller equations</summary>
          <p>
            G(s) = 1.4 e^(−3s) / [(8s + 1)(24s + 1)] °C/%. Two first-order lags model the heater and
            thermal mass. A 3 s transport delay means stored heat keeps raising temperature after
            power is reduced.
          </p>
          <p>
            u = clamp(Kp × error + integral − Kd × filtered dT/dt, 0, 100). Euler integration: 0.1
            s. Derivative filter time constant: 0.8 s. Conditional integration prevents windup while
            saturated. Derivative acts on the measurement to avoid setpoint kick. Kp: %/°C; Ki:
            %/(°C·s); Kd: %·s/°C.
          </p>
          <p>
            Presets reset the plant for a fair comparison. Sliders tune the controller live and
            reset peak/in-range metrics. The chart keeps the last 120 simulated seconds. This is a
            reproducible educational plant, not a calibrated heater model.
          </p>
          <a
            href="https://www.luisllamas.es/en/pid-controller-simulator/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Requested simulator reference ↗
          </a>{' '}
          ·{' '}
          <a
            href="https://www.mathworks.com/help/simulink/slref/pidcontroller.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            PID implementation reference ↗
          </a>
        </details>
      </div>
    </div>
  );
}
