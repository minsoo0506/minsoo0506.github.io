import { useState } from 'react';
import './modbus-lab.css';

type Mission = 1 | 2;
type Exchange = {
  request: string;
  response?: string;
  detail: string;
  time: string;
  parity: string;
  stopBits: string;
  baud: string;
};

function frame(bytes: number[]) {
  let crc = 0xffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = crc & 1 ? (crc >> 1) ^ 0xa001 : crc >> 1;
  }
  return [...bytes, crc & 0xff, crc >> 8]
    .map((byte) => byte.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');
}

function Waveform({
  packet,
  byteIndex,
  direction,
  mission,
  setByteIndex,
  setDirection,
}: {
  packet: Exchange;
  byteIndex: string;
  direction: string;
  mission: Mission;
  setByteIndex: (value: string) => void;
  setDirection: (value: string) => void;
}) {
  const bytes = (direction === 'RX' && packet.response ? packet.response : packet.request).split(
    ' '
  );
  const index = Math.min(Number(byteIndex), bytes.length - 1);
  const value = parseInt(bytes[index], 16);
  const data = Array.from({ length: 8 }, (_, i) => (value >> i) & 1);
  const parityBit =
    packet.parity === 'none'
      ? []
      : [(data.reduce((sum, bit) => sum + bit, 0) + (packet.parity === 'odd' ? 1 : 0)) % 2];
  const bits = [
    0,
    ...data,
    ...parityBit,
    ...Array.from({ length: Number(packet.stopBits) }, () => 1),
  ];
  const labels = [
    'START',
    ...data.map((_, i) => `D${i}`),
    ...(parityBit.length ? ['PARITY'] : []),
    ...Array.from({ length: Number(packet.stopBits) }, (_, i) => `STOP${i + 1}`),
  ];
  const width = bits.length * 56;
  const points = bits
    .map((bit, i) => `${i * 56},${bit ? 24 : 76} ${(i + 1) * 56},${bit ? 24 : 76}`)
    .join(' ');
  return (
    <section className="lab-wave">
      <div className="lab-section-title">
        <span>SIGNAL VIEW · UART LOGIC LEVEL</span>
        <span>
          {packet.baud} BAUD · {packet.parity.toUpperCase()} · {packet.stopBits} STOP
        </span>
      </div>
      <div className="lab-wave-controls">
        <label>
          Direction{' '}
          <select
            aria-label="Waveform direction"
            value={direction}
            onChange={(e) => {
              setDirection(e.target.value);
              setByteIndex('0');
            }}
          >
            <option value="TX">TX request</option>
            {packet.response && <option value="RX">RX response</option>}
          </select>
        </label>
        <label>
          Byte{' '}
          <select
            aria-label="Waveform byte"
            value={String(index)}
            onChange={(e) => setByteIndex(e.target.value)}
          >
            {bytes.map((byte, i) => (
              <option key={i} value={i}>
                {i + 1}: 0x{byte}
              </option>
            ))}
          </select>
        </label>
        <span>Data bits transmitted LSB first</span>
      </div>
      <div className="lab-wave-scroll">
        <svg
          role="img"
          aria-label={`UART waveform for byte ${bytes[index]}, ${direction}`}
          viewBox={`-36 0 ${width + 46} 115`}
        >
          <text x="-34" y="28">
            HIGH
          </text>
          <text x="-28" y="80">
            LOW
          </text>
          {bits.map((bit, i) => (
            <g key={i}>
              <line x1={i * 56} y1="8" x2={i * 56} y2="87" stroke="#365451" strokeDasharray="3 4" />
              <text x={i * 56 + 28} y="104" textAnchor="middle">
                {labels[i]}
              </text>
              <text x={i * 56 + 28} y="14" textAnchor="middle">
                {bit}
              </text>
            </g>
          ))}
          <polyline fill="none" stroke="#81e5b1" strokeWidth="3" points={points} />
        </svg>
      </div>
      <p>
        {mission === 2
          ? 'RS-485 uses a differential TRX+/TRX− pair; polarity and voltage levels depend on the transceiver. The trace shows decoded UART logic, not individual wire voltages.'
          : 'This is UART logic before the RS-232 transceiver, not the inverted bipolar RS-232 line voltage.'}{' '}
        Each bit lasts approximately {(1000000 / Number(packet.baud)).toFixed(1)} µs.
      </p>
    </section>
  );
}

export function ModbusLabWindow() {
  const [mission, setMission] = useState<Mission | null>(null);
  const [wires, setWires] = useState<Record<string, string>>({});
  const [baud, setBaud] = useState('');
  const [address, setAddress] = useState('');
  const [crcMode, setCrcMode] = useState('');
  const [parity, setParity] = useState('');
  const [stopBits, setStopBits] = useState('');
  const [register, setRegister] = useState('');
  const [command, setCommand] = useState('');
  const [running, setRunning] = useState(false);
  const [popup, setPopup] = useState('');
  const [byteIndex, setByteIndex] = useState('0');
  const [direction, setDirection] = useState('TX');
  const [status, setStatus] = useState('Select a mission to begin.');
  const [history, setHistory] = useState<Exchange[]>([]);
  const [selected, setSelected] = useState(0);
  const [hint, setHint] = useState(false);

  const start = (next: Mission) => {
    setMission(next);
    setWires({});
    setBaud('');
    setAddress('');
    setCrcMode('');
    setParity('');
    setStopBits('');
    setRegister('');
    setCommand('');
    setRunning(false);
    setPopup('');
    setByteIndex('0');
    setDirection('TX');
    setHistory([]);
    setSelected(0);
    setHint(false);
    setStatus(
      next === 1
        ? 'Choose the pin connections and serial settings, then read the sensor.'
        : 'Connect device 02 and read the inverter speed or send a run/stop command.'
    );
  };

  const send = () => {
    if (!mission) return;
    if (
      !baud ||
      !parity ||
      !stopBits ||
      !address ||
      !crcMode ||
      (mission === 1 && !register) ||
      (mission === 2 && (!command || (command === 'read' && !register)))
    ) {
      const message = 'Select all controller settings and an operation before sending a request.';
      setStatus(message);
      setPopup(message);
      return;
    }
    const expected: Record<string, string> =
      mission === 1 ? { TX: 'RX', RX: 'TX', GND: 'GND' } : { 'TRX+': 'TRX+', 'TRX-': 'TRX-' };
    const offset = Number(register);
    const write = mission === 2 && command !== 'read';
    const request = write
      ? frame([Number(address), 5, 0, 0, command === 'run' ? 255 : 0, 0])
      : frame([Number(address), 3, 0, offset, 0, 1]);
    let response: string | undefined;
    let detail = 'No response received. Inspect the physical connection and serial settings.';
    let message: string;
    if (Object.entries(expected).some(([pin, target]) => wires[pin] !== target)) {
      message = 'No response: check the connection and pin mapping.';
    } else if (baud !== '9600') {
      message = 'No response: check that both baud rates match.';
    } else if (parity !== 'even' || stopBits !== '1') {
      message = 'Framing mismatch: check parity and stop bits.';
    } else if (address !== (mission === 1 ? '1' : '2')) {
      message = 'Wrong device address: check the target device address.';
    } else if (crcMode !== 'valid') {
      message = 'No response: the request CRC is invalid.';
    } else if (write) {
      response = request;
      setRunning(command === 'run');
      message =
        command === 'run'
          ? 'Command accepted: inverter running.'
          : 'Command accepted: inverter stopped.';
      detail = `Function 05 writes virtual coil 0000 ${
        command === 'run' ? 'ON (FF 00)' : 'OFF (00 00)'
      }. The response echoes the request.`;
    } else if (offset === 99) {
      response = frame([Number(address), 0x83, 0x02]);
      message = 'Exception 02: Illegal data address.';
      detail =
        'Exception code 02: Illegal Data Address. Function 83 indicates an exception to function 03.';
    } else {
      const value = mission === 2 ? (running ? 1500 : 0) : offset === 0 ? 235 : 485;
      response = frame([Number(address), 3, 2, value >> 8, value & 0xff]);
      message =
        mission === 2
          ? `Read successful: inverter speed ${value} RPM.`
          : offset === 0
          ? 'Mission complete! Sensor temperature: 23.5 °C.'
          : 'Read successful: relative humidity 48.5%.';
      detail =
        mission === 2
          ? `Register 0000: simulated speed feedback ${value} RPM.`
          : offset === 0
          ? 'Register 0000: raw value 235, scaled by 10 = 23.5 °C.'
          : 'Register 0001: raw value 485, scaled by 10 = 48.5% RH.';
    }
    const exchange = {
      request:
        crcMode === 'valid'
          ? request
          : `${request.slice(0, -2)} ${request.endsWith('FF') ? 'FE' : 'FF'}`,
      response,
      detail,
      time: new Date().toLocaleTimeString(),
      parity,
      stopBits,
      baud,
    };
    setStatus(message);
    if (!response || (offset === 99 && !write)) setPopup(message);
    setSelected(history.length);
    setByteIndex('0');
    setDirection('TX');
    setHistory([...history, exchange]);
  };

  return (
    <div className="modbus-lab">
      <header className="lab-header">
        <div>
          <span className="lab-kicker">VIRTUAL HARDWARE SIMULATOR</span>
          <h1>Modbus Lab</h1>
          <p>Wire it up. Send a frame. Bring the sensor online.</p>
        </div>
        <span className="lab-badge">
          SIMULATION
          <br />
          NO HARDWARE REQUIRED
        </span>
      </header>
      <nav className="lab-missions" aria-label="Select mission">
        <button className={mission === 1 ? 'selected' : ''} onClick={() => start(1)}>
          <b>01</b>
          <span>
            <strong>RS-232</strong>
            <small>Connect the sensor</small>
          </span>
          <span>Start mission 1 →</span>
        </button>
        <button className={mission === 2 ? 'selected' : ''} onClick={() => start(2)}>
          <b>02</b>
          <span>
            <strong>RS-485</strong>
            <small>Control the inverter</small>
          </span>
          <span>Start mission 2 →</span>
        </button>
      </nav>
      {mission ? (
        <>
          <div className="lab-workspace">
            <section className="lab-panel lab-circuit" aria-label="Connection diagram">
              <div className="lab-section-title">
                <span>CONNECTION DIAGRAM</span>
                <span>{mission === 1 ? 'RS-232 · POINT TO POINT' : 'RS-485 · SHARED BUS'}</span>
              </div>
              <p>
                {mission === 1
                  ? 'Choose the sensor pin for each controller pin. Incorrect mappings prevent communication.'
                  : 'Choose the inverter terminal for each bus line. Device 02 is the target inverter.'}
              </p>
              <div className="lab-devices">
                <div className="lab-device">
                  <span>CONTROLLER</span>
                  <strong>MASTER</strong>
                  <small>UART · {baud || '—'} baud</small>
                </div>
                <div className="lab-wires">
                  {(mission === 1 ? ['TX', 'RX', 'GND'] : ['TRX+', 'TRX-']).map((wire) => (
                    <label key={wire} className={wires[wire] ? 'connected' : ''}>
                      <span>{wire}</span>
                      <i />
                      <select
                        aria-label={`Controller ${wire} connection`}
                        value={wires[wire] ?? ''}
                        onChange={(event) => setWires({ ...wires, [wire]: event.target.value })}
                      >
                        <option value="">Pin…</option>
                        {(mission === 1 ? ['TX', 'RX', 'GND'] : ['TRX+', 'TRX-']).map((pin) => (
                          <option key={pin} value={pin}>
                            {pin}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
                {mission === 1 ? (
                  <div className="lab-sensor" aria-label="Temperature and humidity sensor">
                    <div className="sensor-head">
                      <span>Temperature Sensor</span>
                      <span>●</span>
                    </div>
                    <div className="sensor-display">
                      <strong>
                        23.5<small>°C</small>
                      </strong>
                      <span>48.5% RH</span>
                    </div>
                    <div className="sensor-grille">
                      <i />
                      <i />
                      <i />
                      <i />
                      <i />
                    </div>
                    <div className="sensor-label">DEVICE 01 · 9600 / 8E1</div>
                  </div>
                ) : (
                  <div className="lab-inverter-assembly">
                    <div className="lab-inverter" aria-label="Simulated inverter">
                      <div className="inverter-top">
                        IVT · DEVICE 02 <span>●</span>
                      </div>
                      <div className="inverter-display">
                        <strong>{running ? 'RUN' : 'STOP'}</strong>
                        <small>{running ? '1500' : '0'} RPM</small>
                      </div>
                      <div className="inverter-keys">
                        <span>▲</span>
                        <span>▼</span>
                        <span>ENT</span>
                      </div>
                      <div className="inverter-vents">▰ ▰ ▰ ▰</div>
                      <div className="sensor-label">9600 / 8E1</div>
                    </div>
                    <div className="fan-link" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </div>
                    <div className="lab-fan">
                      <svg
                        role="img"
                        aria-label={running ? 'Fan running' : 'Fan stopped'}
                        viewBox="0 0 80 80"
                      >
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          fill="#c8d4cf"
                          stroke="#71847c"
                          strokeWidth="3"
                        />
                        <g className={running ? 'fan-rotor spinning' : 'fan-rotor'}>
                          <path
                            d="M40 38 C24 29 28 9 39 10 C49 10 49 23 43 36 Z M42 41 C58 30 73 44 66 52 C60 60 50 52 42 44 Z M37 42 C37 61 20 69 16 58 C12 48 26 42 37 39 Z"
                            fill="#496e68"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="6"
                            fill="#b6c7bf"
                            stroke="#3b5954"
                            strokeWidth="2"
                          />
                        </g>
                      </svg>
                      <span>{running ? 'RUNNING' : 'STOPPED'}</span>
                    </div>
                  </div>
                )}
              </div>
              {mission === 2 && (
                <p className="lab-note">
                  TRX+/TRX− carry the differential signal. A reference or isolation may be needed in
                  real installations to control common-mode voltage; A/B naming varies by vendor.
                </p>
              )}
            </section>
            <section className="lab-panel lab-settings">
              <div className="lab-section-title">CONTROLLER SETTINGS</div>
              <label>
                Baud rate
                <select
                  aria-label="Baud rate"
                  value={baud}
                  onChange={(event) => setBaud(event.target.value)}
                >
                  <option value="">Select baud rate…</option>
                  <option value="1200">1200 baud</option>
                  <option value="2400">2400 baud</option>
                  <option value="4800">4800 baud</option>
                  <option value="9600">9600 baud</option>
                  <option value="19200">19200 baud</option>
                  <option value="38400">38400 baud</option>
                  <option value="57600">57600 baud</option>
                  <option value="115200">115200 baud</option>
                </select>
              </label>
              <div className="lab-settings-row">
                <label>
                  Parity
                  <select
                    aria-label="Parity"
                    value={parity}
                    onChange={(event) => setParity(event.target.value)}
                  >
                    <option value="">Select…</option>
                    <option value="none">None</option>
                    <option value="even">Even</option>
                    <option value="odd">Odd</option>
                  </select>
                </label>
                <label>
                  Stop bits
                  <select
                    aria-label="Stop bits"
                    value={stopBits}
                    onChange={(event) => setStopBits(event.target.value)}
                  >
                    <option value="">Select…</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                </label>
              </div>
              <label>
                Device address
                <select
                  aria-label="Device address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                >
                  <option value="">Select address…</option>
                  <option value="1">01</option>
                  <option value="2">02</option>
                  <option value="3">03</option>
                  <option value="4">04</option>
                </select>
              </label>
              <label>
                {mission === 2 && (
                  <>
                    Inverter command
                    <select
                      aria-label="Inverter command"
                      value={command}
                      onChange={(event) => setCommand(event.target.value)}
                    >
                      <option value="">Select operation…</option>
                      <option value="read">Read speed · FC 03</option>
                      <option value="run">Run · FC 05</option>
                      <option value="stop">Stop · FC 05</option>
                    </select>
                  </>
                )}
              </label>
              {(mission === 1 || command === 'read') && (
                <label>
                  Register
                  <select
                    aria-label="Register"
                    value={register}
                    onChange={(event) => setRegister(event.target.value)}
                  >
                    <option value="">Select register…</option>
                    <option value="0">
                      {mission === 1 ? '0000 · Temperature' : '0000 · Speed (RPM)'}
                    </option>
                    {mission === 1 && <option value="1">0001 · Humidity</option>}
                    <option value="99">0063 · Unknown</option>
                  </select>
                </label>
              )}
              <label>
                Request CRC
                <select
                  aria-label="Request CRC"
                  value={crcMode}
                  onChange={(event) => setCrcMode(event.target.value)}
                >
                  <option value="">Select CRC mode…</option>
                  <option value="valid">Calculate automatically</option>
                  <option value="invalid">Corrupted</option>
                </select>
              </label>
              <div className="lab-fixed">
                8 data bits · device: 9600 / 8E1
                <br />
                {mission === 1 || command === 'read'
                  ? 'Function 03 · holding registers · count 1'
                  : 'Function 05 · virtual run coil 0000'}
                {mission === 2 && (
                  <>
                    <br />
                    Simulated device map; real inverter addresses vary.
                  </>
                )}
              </div>
              <button className="lab-send" onClick={send}>
                ▶ &nbsp; Send request
              </button>
            </section>
          </div>
          <div className="lab-status" role="status">
            <span>●</span> {status}
          </div>
          <div className="lab-tools">
            <span>
              SESSION <b>{history.length}</b> requests ·{' '}
              <b>{history.filter((item) => item.response).length}</b> replies
            </span>
            <button onClick={() => setHint(!hint)}>
              {hint ? 'Hide field notes' : 'Show field notes'}
            </button>
            <button
              onClick={() => {
                setHistory([]);
                setSelected(0);
              }}
            >
              Clear traffic
            </button>
          </div>
          {hint && (
            <div className="lab-hint">
              <b>FIELD NOTES</b> · Target:{' '}
              {mission === 1 ? 'device 01 via RS-232' : 'inverter 02 via RS-485'}. Device settings:
              9600 baud, 8E1. Verify each wire, address and CRC.{' '}
              {mission === 1
                ? 'Register 0000 stores temperature in tenths of a degree.'
                : 'Register 0000 reports RPM; virtual coil 0000 controls run/stop. This map is fictional.'}
            </div>
          )}
          <section className="lab-log">
            <div className="lab-section-title">
              <span>FRAME MONITOR</span>
              <span>MODBUS RTU · HEX</span>
            </div>
            {history.length ? (
              <>
                <div className="lab-traffic">
                  {history.map((packet, index) => (
                    <button
                      className={selected === index ? 'active' : ''}
                      key={index}
                      onClick={() => {
                        setSelected(index);
                        setByteIndex('0');
                        setDirection('TX');
                      }}
                    >
                      <span>{packet.time}</span> <b>TX #{index + 1}</b> {packet.request}
                      {packet.response && (
                        <span className="lab-rx">
                          <b>RX</b> {packet.response}
                        </span>
                      )}
                      {!packet.response && <span className="lab-timeout">TIMEOUT</span>}
                    </button>
                  ))}
                </div>
                <div className="lab-decode">
                  <strong>FRAME INSPECTOR · TX #{selected + 1}</strong>
                  <div className="lab-fields">
                    <span>
                      <small>ADDRESS</small>
                      {history[selected].request.slice(0, 2)}
                    </span>
                    <span>
                      <small>FUNCTION</small>
                      {history[selected].request.slice(3, 5)} ·{' '}
                      {history[selected].request.slice(3, 5) === '05'
                        ? 'Write coil'
                        : 'Read holding'}
                    </span>
                    <span>
                      <small>
                        {history[selected].request.slice(3, 5) === '05'
                          ? 'COIL / VALUE'
                          : 'START / COUNT'}
                      </small>
                      {history[selected].request.slice(6, 17)}
                    </span>
                    <span>
                      <small>CRC LO / HI</small>
                      {history[selected].request.slice(-5)}
                    </span>
                  </div>
                  <p>{history[selected].detail}</p>
                </div>
                <Waveform
                  packet={history[selected]}
                  byteIndex={byteIndex}
                  direction={direction}
                  mission={mission}
                  setByteIndex={setByteIndex}
                  setDirection={setDirection}
                />
              </>
            ) : (
              <p>Waiting for a request... Click a frame to inspect its fields.</p>
            )}
          </section>
        </>
      ) : (
        <div className="lab-welcome">
          <div className="lab-welcome-icon">⌁</div>
          <strong>Ready to connect?</strong>
          <p>Choose a mission above to explore Modbus RTU over serial.</p>
          <small>All signals and devices are simulated in your browser.</small>
        </div>
      )}
      <footer>
        MODBUS LAB <span>● VIRTUAL DEVICE ONLINE</span>
      </footer>
      {popup && (
        <div
          className="lab-dialog-backdrop"
          onKeyDown={(event) => {
            if (event.key === 'Escape') setPopup('');
          }}
        >
          <div
            className="lab-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="lab-dialog-title"
            aria-describedby="lab-dialog-message"
          >
            <div className="lab-dialog-title" id="lab-dialog-title">
              Connection hint{' '}
              <button aria-label="Close hint" onClick={() => setPopup('')}>
                ×
              </button>
            </div>
            <div className="lab-dialog-body">
              <span aria-hidden="true">!</span>
              <div>
                <strong>Request needs attention</strong>
                <p id="lab-dialog-message">{popup}</p>
                <small>Review the diagram and device settings, then try again.</small>
              </div>
            </div>
            <div className="lab-dialog-actions">
              <button autoFocus onClick={() => setPopup('')}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
