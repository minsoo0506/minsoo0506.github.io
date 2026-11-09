import { useState } from 'react';
import './gpio-lab.css';

type Terminal = 'pa5' | 'pb3' | 'driver' | 'switch' | '12v' | 'ground';
const positions: Record<Terminal, [number, number]> = {
  pa5: [155, 305],
  pb3: [155, 185],
  driver: [310, 305],
  switch: [310, 185],
  '12v': [650, 65],
  ground: [740, 438],
};
const terminalNames: Record<Terminal, string> = {
  pa5: 'PA5',
  pb3: 'PB3',
  driver: 'J1',
  switch: 'J2',
  '12v': '+12V',
  ground: 'GND',
};

function Schematic({
  pa5,
  pb3,
  pending,
  choose,
}: {
  pa5: string;
  pb3: string;
  pending: Terminal | null;
  choose: (terminal: Terminal) => void;
}) {
  return (
    <svg
      className="circuit-svg"
      viewBox="0 0 850 490"
      aria-label="Interactive electrical schematic"
    >
      <g className="circuit-fixed" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="25" y="128" width="130" height="250" rx="4" />
        <path d="M310 185 H390 M390 100 V120 M390 168 V255 M390 300 V438 M390 100 V77 M520 65 H550 M590 65 H770 V190 H610 M610 65 V170 M610 210 V270 M610 340 V438 M540 305 H570 M610 438 H740 M480 305 H540 V380 M540 420 V438 M310 305 H400 M440 305 H480" />
        <rect x="550" y="54" width="40" height="22" />
        <rect x="376" y="120" width="28" height="48" />
        <rect x="400" y="294" width="40" height="22" />
        <rect x="529" y="380" width="22" height="40" />
        <path d="M390 255 v12 m0 23 v10 m0 -33 l24 19 M610 170 c-17 0 -17 10 0 10 c-17 0 -17 10 0 10 c-17 0 -17 10 0 10 c-17 0 -17 10 0 10 M770 190 V160 M770 125 V65 M755 125 H785 M755 160 L770 125 L785 160 Z M570 280 V330 M580 275 V335 M580 285 H610 V270 M580 325 H610 V340 M378 438 H402 M382 445 H398 M386 452 H394 M528 438 H552 M532 445 H548 M536 452 H544 M598 438 H622 M602 445 H618 M606 452 H614 M728 438 H752 M732 445 H748 M736 452 H744" />
      </g>
      <g className="circuit-labels">
        <text x="45" y="155" className="circuit-title">
          MCU
        </text>
        <text x="45" y="175">
          3.3 V LOGIC
        </text>
        <text x="110" y="180">
          PB3
        </text>
        <text x="110" y="300">
          PA5
        </text>
        <text x="370" y="66">
          +3.3 V
        </text>
        <text x="417" y="145">
          R1 10kΩ
        </text>
        <text x="413" y="265">
          SW1
        </text>
        <text x="412" y="282">
          NO
        </text>
        <text x="365" y="480">
          GND
        </text>
        <text x="402" y="286">
          R2
        </text>
        <text x="505" y="405">
          R3
        </text>
        <text x="625" y="315">
          Q1
        </text>
        <text x="625" y="332">
          N-MOS
        </text>
        <text x="575" y="168">
          K1
        </text>
        <text x="575" y="185">
          COIL
        </text>
        <text x="745" y="112">
          D1
        </text>
        <text x="700" y="235">
          CATHODE ↑
        </text>
        <text x="485" y="49">
          +12 V DC
        </text>
        <text x="557" y="48">
          F1
        </text>
        <text x="705" y="480">
          COMMON GND
        </text>
        <text x="278" y="174">
          J2
        </text>
        <text x="278" y="294">
          J1
        </text>
        <text x="180" y="105">
          SELECT TWO TERMINALS
        </text>
      </g>
      {[
        ['pa5', pa5],
        ['pb3', pb3],
      ].map(([source, target]) => {
        if (!target || !(target in positions)) return null;
        const [x1, y1] = positions[source as Terminal];
        const [x2, y2] = positions[target as Terminal];
        const middle = (x1 + x2) / 2;
        return (
          <path
            key={source}
            className={`circuit-jumper ${target === '12v' ? 'unsafe' : ''}`}
            d={`M ${x1} ${y1} H ${middle} V ${y2} H ${x2}`}
          />
        );
      })}
      {(Object.keys(positions) as Terminal[]).map((terminal) => {
        const [x, y] = positions[terminal];
        return (
          <g
            key={terminal}
            role="button"
            tabIndex={0}
            aria-label={`${terminalNames[terminal]} terminal`}
            aria-pressed={pending === terminal}
            className={`circuit-terminal ${pending === terminal ? 'selected' : ''}`}
            onClick={() => choose(terminal)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                choose(terminal);
              }
            }}
          >
            <circle cx={x} cy={y} r="13" />
            <circle cx={x} cy={y} r="4" />
          </g>
        );
      })}
    </svg>
  );
}

export function GpioLabWindow() {
  const [pa5, setPa5] = useState('');
  const [pb3, setPb3] = useState('');
  const [pending, setPending] = useState<Terminal | null>(null);
  const [verified, setVerified] = useState(false);
  const [outputMode, setOutputMode] = useState('');
  const [inputMode, setInputMode] = useState('');
  const [high, setHigh] = useState(false);
  const [closed, setClosed] = useState(false);
  const [seenRelay, setSeenRelay] = useState(false);
  const [seenInput, setSeenInput] = useState(false);
  const [status, setStatus] = useState(
    'Read the schematic, then assign each GPIO pin to a signal point.'
  );
  const relay = verified && outputMode === 'output' && high;
  const input = verified && inputMode === 'input' ? (closed ? 'LOW' : 'HIGH') : '—';
  const assign = (pin: 'pa5' | 'pb3', value: string) => {
    if (pin === 'pa5') setPa5(value);
    else setPb3(value);
    setVerified(false);
    setHigh(false);
    setSeenRelay(false);
    setSeenInput(false);
    setStatus('Wiring changed. Verify the connections before testing.');
  };
  const choose = (terminal: Terminal) => {
    if (!pending) {
      setPending(terminal);
      setStatus(`${terminalNames[terminal]} selected. Choose another terminal to connect.`);
      return;
    }
    if (terminal === pending) {
      setPending(null);
      setStatus('Selection cleared.');
      return;
    }
    const isPin = (t: Terminal): t is 'pa5' | 'pb3' => t === 'pa5' || t === 'pb3';
    if (isPin(pending) && !isPin(terminal)) assign(pending, terminal);
    else if (isPin(terminal) && !isPin(pending)) assign(terminal, pending);
    else setStatus('Connect one MCU pin to one circuit terminal.');
    setPending(null);
  };
  const verify = () => {
    setHigh(false);
    setSeenRelay(false);
    setSeenInput(false);
    if (pa5 === '12v' || pb3 === '12v') {
      setVerified(false);
      setStatus(
        'Unsafe connection: 12 V exceeds this 3.3 V GPIO domain. Select signal nodes, not the supply.'
      );
    } else if (pa5 !== 'driver' || pb3 !== 'switch') {
      setVerified(false);
      setStatus('Wiring mismatch. Follow PA5 to the gate resistor and PB3 to the switch node.');
    } else {
      setVerified(true);
      setStatus('Wiring verified. Set PA5 to output and PB3 to input, then test both signals.');
    }
  };
  const check = () => {
    if (!verified) setStatus('Verify wiring before testing.');
    else if (outputMode !== 'output' || inputMode !== 'input')
      setStatus('Configure PA5 as an output and PB3 as an input.');
    else if (!seenRelay) setStatus('Drive PA5 HIGH and confirm relay K1 energizes.');
    else if (!seenInput || !closed) setStatus('Close the level switch and observe PB3 read LOW.');
    else if (relay)
      setStatus('Return PA5 LOW to de-energize the relay before completing the test.');
    else setStatus('Mission complete: wiring, relay output and active-low level input verified.');
  };
  const reset = () => {
    setPa5('');
    setPb3('');
    setPending(null);
    setVerified(false);
    setOutputMode('');
    setInputMode('');
    setHigh(false);
    setClosed(false);
    setSeenRelay(false);
    setSeenInput(false);
    setStatus('Read the schematic, then assign each GPIO pin to a signal point.');
  };
  return (
    <div className="gpio-lab">
      <header className="bench-header">
        <div>
          <small>ENGINEERING BENCH / 01</small>
          <h1>
            GPIO <em>FIELD TEST</em>
          </h1>
          <p>Read the circuit. Assign the pins. Commission the I/O.</p>
        </div>
        <div className="bench-meta">
          TRAINING RIG
          <br />
          <b>3V3 / 12V DC</b>
          <br />
          SIMULATION ONLY
        </div>
      </header>
      <div className="bench-body">
        <section className="bench-brief">
          <span>WORK ORDER 001</span>
          <div>
            <strong>Tank high-level control</strong>
            <p>
              Connect the MCU to the relay driver and level switch. Verify the I/O, then return the
              relay to its safe OFF state.
            </p>
          </div>
          <span className={verified ? 'bench-ready' : ''}>
            {verified ? '● WIRING VERIFIED' : '○ WIRING REQUIRED'}
          </span>
        </section>
        <div className="bench-grid">
          <section className="bench-drawing">
            <div className="bench-heading">
              <span>01 / ELECTRICAL SCHEMATIC</span>
              <span>REV A · DC CONTROL</span>
            </div>
            <div className="schematic-scroll">
              <Schematic pa5={pa5} pb3={pb3} pending={pending} choose={choose} />
            </div>
            <div className="bench-drawing-footer">
              <span>J1 · DRIVER INPUT</span>
              <span>J2 · SWITCH NODE</span>
              <span>K1 · RELAY COIL</span>
            </div>
            <p className="bench-footnote">
              Select two circular terminals to connect a wire. Select the same point twice to
              cancel; reconnect a pin to replace its wire. K1 contacts and motor supply are omitted.
            </p>
          </section>
          <aside className="bench-side">
            <div className="bench-heading">
              <span>02 / PIN ASSIGNMENT</span>
              <span>MCU · 3V3</span>
            </div>
            <div className="bench-connections">
              <div>
                PA5 <b>{pa5 ? terminalNames[pa5 as Terminal] : 'NOT CONNECTED'}</b>
              </div>
              <div>
                PB3 <b>{pb3 ? terminalNames[pb3 as Terminal] : 'NOT CONNECTED'}</b>
              </div>
              <p>
                {pending
                  ? `${terminalNames[pending]} selected · choose another terminal`
                  : 'Select two terminals on the schematic.'}
              </p>
              <button
                onClick={() => {
                  setPa5('');
                  setPb3('');
                  setPending(null);
                  setVerified(false);
                  setHigh(false);
                  setSeenRelay(false);
                  setSeenInput(false);
                  setStatus('Wires cleared. Select two terminals to connect.');
                }}
              >
                Clear wires
              </button>
            </div>
            <button className="bench-verify" onClick={verify}>
              VERIFY WIRING →
            </button>
            <div className="bench-divider" />
            <div className="bench-heading">
              <span>03 / I/O TEST</span>
              <span>MANUAL</span>
            </div>
            <label>
              PA5 mode
              <select
                aria-label="PA5 mode"
                value={outputMode}
                onChange={(event) => {
                  setOutputMode(event.target.value);
                  setHigh(false);
                }}
              >
                <option value="">Select mode…</option>
                <option value="input">Input</option>
                <option value="output">Output · push-pull</option>
              </select>
            </label>
            <label>
              PB3 mode
              <select
                aria-label="PB3 mode"
                value={inputMode}
                onChange={(event) => setInputMode(event.target.value)}
              >
                <option value="">Select mode…</option>
                <option value="input">Input · high impedance</option>
                <option value="output">Output</option>
              </select>
            </label>
            <div className="bench-output">
              <button
                disabled={!verified || outputMode !== 'output'}
                onClick={() => setHigh(false)}
              >
                Drive LOW
              </button>
              <button
                disabled={!verified || outputMode !== 'output'}
                onClick={() => {
                  setHigh(true);
                  setSeenRelay(true);
                }}
              >
                Drive HIGH
              </button>
            </div>
            <div className="bench-indicator">
              <span
                role="img"
                aria-label={relay ? 'Relay energized' : 'Relay de-energized'}
                className={relay ? 'lamp on' : 'lamp'}
              />
              <span>K1 RELAY</span>
              <b>{relay ? 'ENERGIZED' : 'OFF'}</b>
            </div>
            <button
              className="bench-switch"
              onClick={() => {
                setClosed(!closed);
                if (!closed && verified && inputMode === 'input') setSeenInput(true);
              }}
            >
              {closed ? 'Open level switch' : 'Close level switch'}
            </button>
            <div className="bench-read">
              PB3 reads: <b>{input}</b>
            </div>
            <button className="bench-check" onClick={check}>
              CHECK MISSION
            </button>
            <button className="bench-reset" onClick={reset}>
              RESET RIG
            </button>
          </aside>
        </div>
        <div className="bench-status" role="status">
          <span>DIAGNOSTIC</span>
          {status}
        </div>
        <footer className="bench-notes">
          <b>DESIGN NOTES</b> · This is a simplified, non-isolated DC training circuit. The output
          directly controls a MOSFET gate, not the relay coil. The external 10 kΩ pull-up holds PB3
          HIGH when SW1 is open; closing SW1 reads LOW. The rig verifies wiring and logic only; it
          does not simulate current, contact bounce, timing, isolation, protection sizing or safety
          interlocks.
        </footer>
      </div>
    </div>
  );
}
