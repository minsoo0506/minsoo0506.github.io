import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import {
  advanceFactory,
  createFactory,
  FINISH_TIME,
  PRODUCT_INTERVAL,
  SENSOR_TIME,
} from '../../lib/factory';
import './factory-control.css';

const FactoryScene3D = lazy(() =>
  import('./FactoryScene3D').then((module) => ({ default: module.FactoryScene3D }))
);

export function FactoryControlWindow() {
  const [game, setGame] = useState(createFactory);
  const [mode, setMode] = useState<'ready' | 'running' | 'paused'>('ready');
  const [delay, setDelay] = useState(600);
  const [duration, setDuration] = useState(400);
  const [no3d, setNo3d] = useState(false);
  const settings = useRef({ delay, duration });
  settings.current = { delay, duration };
  useEffect(() => {
    if (mode !== 'running') return;
    let last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const delta = now - last;
      last = now;
      setGame((previous) => advanceFactory(previous, previous.elapsed + delta, settings.current));
    }, 50);
    return () => window.clearInterval(timer);
  }, [mode]);
  useEffect(() => {
    if (game.finished) setMode('paused');
  }, [game.finished]);
  const reset = () => {
    setMode('ready');
    setGame(createFactory());
  };
  const active = game.products.some(
    (item) => item.pulse && item.pulse.start <= game.elapsed && game.elapsed < item.pulse.end
  );
  const sensorOn = game.products.some((item) => {
    const age = game.elapsed - (item.id - 1) * PRODUCT_INTERVAL;
    return age >= SENSOR_TIME && age < SENSOR_TIME + 200;
  });
  const remaining = Math.ceil((FINISH_TIME - game.elapsed) / 1000);
  const status =
    mode === 'ready'
      ? 'READY TO START'
      : game.finished
      ? 'RUN COMPLETE'
      : mode === 'paused'
      ? 'LINE PAUSED'
      : 'LINE RUNNING';
  return (
    <div className="factory">
      <header className="factory-title">
        <div>
          <span>PRODUCTION SYSTEMS / SIMULATOR</span>
          <h1>
            Factory Control <small>STAGE 01</small>
          </h1>
          <p>Inspect the line. Tune the timing. Catch the defects.</p>
        </div>
        <div className="factory-status">
          <i className={mode === 'running' && !game.finished ? 'online' : ''} />
          {status}
        </div>
      </header>
      <div className="factory-toolbar">
        <div>
          <b>{remaining}s</b>
          <span>TIME LEFT</span>
        </div>
        <div>
          <b>{game.rejected}/5</b>
          <span>DEFECTS SORTED</span>
        </div>
        <div>
          <b>{game.missed + game.falseRejects}</b>
          <span>ERRORS</span>
        </div>
        <div>
          <b>{game.score}</b>
          <span>SCORE</span>
        </div>
      </div>
      <div className="factory-main">
        <section className="factory-line-panel">
          <div className="factory-panel-head">
            <span>LINE 01 / INSPECTION</span>
            <span>● SIMULATED EQUIPMENT</span>
          </div>
          {!no3d ? (
            <div className="factory-scene factory-scene-3d">
              <Suspense fallback={<div className="factory-three-loading">Preparing 3D line…</div>}>
                <FactoryScene3D
                  game={game}
                  active={!!active}
                  sensorOn={sensorOn}
                  onUnavailable={() => setNo3d(true)}
                />
              </Suspense>
              <div className="factory-scene-caption">
                <span>● 3D LINE VIEW</span>
                <span>INSPECTION → REJECT → OUTFEED</span>
              </div>
              <div className="factory-scene-count">
                REJECTED <strong>{game.rejected + game.falseRejects}</strong>
              </div>
            </div>
          ) : (
            <div className="factory-scene">
              <div className="factory-sensor" style={{ left: '20%' }}>
                <span>INSPECTION</span>
                <i className={sensorOn ? 'on' : ''} />
                <div>⌄</div>
              </div>
              <div className="factory-actuator" style={{ left: '60%' }}>
                <span>REJECT GATE</span>
                <div className={`factory-cylinder ${active ? 'extended' : ''}`}>
                  <i />
                </div>
              </div>
              <div className="factory-products">
                {game.products.map((item) => {
                  const age = game.elapsed - (item.id - 1) * PRODUCT_INTERVAL;
                  if (
                    age < 0 ||
                    age > 2500 ||
                    item.outcome === 'rejected' ||
                    item.outcome === 'falseReject'
                  )
                    return null;
                  return (
                    <div
                      key={item.id}
                      className={`factory-product ${item.detected && item.defect ? 'defect' : ''}`}
                      style={{ left: `${(age / 3000) * 100}%` }}
                    >
                      <span>#{item.id.toString().padStart(2, '0')}</span>
                      <i />
                    </div>
                  );
                })}
              </div>
              <div
                className={`factory-belt ${mode === 'running' && !game.finished ? 'moving' : ''}`}
              >
                <div className="factory-belt-stripes" />
              </div>
              <div className="factory-track-label">
                <span>INFEED</span>
                <span>SENSOR</span>
                <span>REJECT</span>
                <span>OUTFEED →</span>
              </div>
              <div className="factory-bin">
                <span>REJECT BIN</span>
                <strong>{game.rejected + game.falseRejects}</strong>
              </div>
            </div>
          )}
          <div className="factory-legend">
            <span>
              <i /> NORMAL
            </span>
            <span>
              <i /> DEFECT AFTER INSPECTION
            </span>
            <span>SENSOR → GATE: 1,200 ms AT FIXED SPEED</span>
          </div>
        </section>
        <aside className="factory-control">
          <div className="factory-panel-head">CONTROL PANEL</div>
          <div className="factory-control-inner">
            <p className="factory-objective">
              <b>OBJECTIVE</b>
              <br />
              Sort 5 defective products without rejecting good ones.
            </p>
            <label htmlFor="factory-delay">
              Reject delay <b>{delay} ms</b>
            </label>
            <input
              id="factory-delay"
              type="range"
              min="0"
              max="2000"
              step="100"
              value={delay}
              onChange={(event) => setDelay(Number(event.target.value))}
            />
            <div className="factory-range">
              <span>0 ms</span>
              <span>2,000 ms</span>
            </div>
            <label htmlFor="factory-duration">
              Output duration <b>{duration} ms</b>
            </label>
            <input
              id="factory-duration"
              type="range"
              min="100"
              max="2500"
              step="100"
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
            />
            <div className="factory-range">
              <span>100 ms</span>
              <span>2,500 ms</span>
            </div>
            <p className="factory-hint">
              A defect triggers a timed output. Settings apply when a product reaches the sensor.
            </p>
            <div className="factory-io">
              <span>
                <i className={sensorOn ? 'on' : ''} /> IN · SENSOR{' '}
                <b>{sensorOn ? 'HIGH' : 'LOW'}</b>
              </span>
              <span>
                <i className={active ? 'on' : ''} /> OUT · REJECT <b>{active ? 'ON' : 'OFF'}</b>
              </span>
            </div>
            <button
              className="factory-start"
              disabled={game.finished}
              onClick={() => setMode(mode === 'running' ? 'paused' : 'running')}
            >
              {mode === 'ready' ? '▶  Start line' : mode === 'running' ? 'Ⅱ  Pause' : '▶  Resume'}
            </button>
            <button className="factory-reset" onClick={reset}>
              ↻ &nbsp; Restart
            </button>
          </div>
        </aside>
      </div>
      <section className="factory-monitor">
        <div className="factory-panel-head">
          <span>EVENT MONITOR</span>
          <span>ELAPSED / SIGNAL / EVENT</span>
        </div>
        <div className="factory-timeline" aria-label="Sensor and output event timeline">
          <div className="factory-timeline-row">
            <b>SENSOR</b>
            <div>
              {game.logs
                .filter((event) => event.text.startsWith('SENSOR'))
                .map((event, index) => (
                  <i
                    key={index}
                    title={`${(event.time / 1000).toFixed(2)}s ${event.text}`}
                    style={{ left: `${(event.time / FINISH_TIME) * 100}%` }}
                  />
                ))}
            </div>
          </div>
          <div className="factory-timeline-row output">
            <b>REJECT</b>
            <div>
              {game.products
                .filter((product) => product.pulse && product.pulse.start <= game.elapsed)
                .map((product) => {
                  const pulse = product.pulse!;
                  return (
                    <i
                      key={product.id}
                      title={`#${product.id}: ${(pulse.start / 1000).toFixed(2)}s–${(
                        pulse.end / 1000
                      ).toFixed(2)}s`}
                      style={{
                        left: `${(pulse.start / FINISH_TIME) * 100}%`,
                        width: `${
                          ((Math.min(pulse.end, game.elapsed, FINISH_TIME) - pulse.start) /
                            FINISH_TIME) *
                          100
                        }%`,
                      }}
                    />
                  );
                })}
            </div>
          </div>
          <div className="factory-timeline-scale">
            <span>0s</span>
            <span>{FINISH_TIME / 1000}s</span>
          </div>
        </div>
        <div className="factory-log" role="log" aria-label="Event monitor">
          {game.logs.length ? (
            game.logs
              .slice(-12)
              .reverse()
              .map((entry, index) => (
                <div key={`${entry.time}-${index}`}>
                  <time>{(entry.time / 1000).toFixed(2)}s</time>
                  <span>{entry.text}</span>
                </div>
              ))
          ) : (
            <p>System ready. Start the line to receive events.</p>
          )}
        </div>
      </section>
      {game.finished && (
        <section className="factory-results" aria-label="Run results">
          <div>
            <span>PRODUCTION REPORT</span>
            <h2>
              {game.rejected === 5 && game.falseRejects === 0 ? 'Perfect run!' : 'Run complete'}
            </h2>
            <p>
              Sorted {game.rejected}/5 defects · Missed {game.missed} · Wrongly rejected{' '}
              {game.falseRejects} · Passed {game.passed} good items
            </p>
            <p>
              {game.missed > 0
                ? 'Try matching the reject pulse to the product arrival at the gate.'
                : game.falseRejects > 0
                ? 'Try shortening the output pulse to avoid hitting the next product.'
                : 'All products were sorted correctly.'}
            </p>
          </div>
          <strong>
            {game.score}
            <small>POINTS</small>
          </strong>
        </section>
      )}
      <footer className="factory-footer">
        STAGE 01 · 10 PRODUCTS · VIRTUAL EQUIPMENT <span>Timing model is simplified for play.</span>
      </footer>
    </div>
  );
}
