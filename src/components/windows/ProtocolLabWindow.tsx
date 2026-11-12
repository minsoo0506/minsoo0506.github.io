import { useState } from 'react';
import { ModbusLabWindow } from './ModbusLabWindow';
import { ProtocolScene } from './ProtocolScene';
import './protocol-lab.css';

type Field = { label: string; choices: [string, string][]; answer: string; hint: string };
type Scenario = {
  title: string;
  tag: string;
  context: string;
  task: string;
  wires: string[];
  targets: string[];
  fields: Field[];
  bytes: string;
  detail: string;
  source: string;
};
const scenarios: Record<string, Scenario> = {
  CAN: {
    title: 'Powertrain network',
    tag: 'AUTOMOTIVE / CLASSICAL CAN',
    context:
      'Bring the engine ECU and instrument cluster online. Route the differential pair, configure the bus, then send the engine speed frame.',
    task: 'Bench specification: 500 kbit/s, 120 Ω at each physical end. Standard identifier 0x180 carries a two-byte, big-endian RPM value.',
    wires: ['CAN-H', 'CAN-L'],
    targets: ['CAN-H', 'CAN-L'],
    fields: [
      {
        label: 'Bit rate',
        choices: [
          ['250', '250 kbit/s'],
          ['500', '500 kbit/s'],
          ['1000', '1 Mbit/s'],
        ],
        answer: '500',
        hint: 'Bit rate mismatch: both controllers must use 500 kbit/s.',
      },
      {
        label: 'Termination',
        choices: [
          ['none', 'No termination'],
          ['both', '120 Ω at both ends'],
          ['one', '120 Ω at one end'],
        ],
        answer: 'both',
        hint: 'Terminate both physical ends, not every ECU.',
      },
    ],
    bytes: '180  |  DLC 2  |  05 DC',
    detail:
      '0x05DC = 1500 rpm. This is a fictional signal map, not a universal vehicle CAN definition. The receiving controller acknowledges a valid frame; application decoding depends on the vehicle DBC.',
    source:
      'https://www.ti.com/document-viewer/lit/html/SLVT200/GUID-BED8CDA9-E8BA-4014-9160-4B9DB09812F0',
  },
  UART: {
    title: 'Environmental sensor console',
    tag: 'ASYNCHRONOUS / 3.3 V LOGIC',
    context:
      'Connect a development board to a sensor module. Cross TX and RX and establish a common reference before reading its console.',
    task: 'Sensor configuration: 115200 baud, 8 data bits, no parity, one stop bit. Both devices use 3.3 V logic.',
    wires: ['TX', 'RX', 'GND'],
    targets: ['RX', 'TX', 'GND'],
    fields: [
      {
        label: 'Baud rate',
        choices: [
          ['9600', '9600'],
          ['57600', '57600'],
          ['115200', '115200'],
        ],
        answer: '115200',
        hint: 'Baud rate mismatch: the sensor uses 115200 baud.',
      },
      {
        label: 'Frame format',
        choices: [
          ['8N1', '8N1'],
          ['8E1', '8E1'],
          ['8N2', '8N2'],
        ],
        answer: '8N1',
        hint: 'Use eight data bits, no parity and one stop bit.',
      },
    ],
    bytes: '54 45 4D 50 3D 32 33 2E 35',
    detail:
      'ASCII: TEMP=23.5. UART sends the least-significant data bit first, with an idle HIGH line and a LOW start bit. Logic-level UART cannot connect directly to RS-232 voltage levels.',
    source:
      'https://www.analog.com/en/resources/analog-dialogue/articles/uart-a-hardware-communication-protocol.html',
  },
  SPI: {
    title: 'Serial flash workbench',
    tag: 'SYNCHRONOUS / FULL DUPLEX',
    context:
      'Wire a microcontroller to an eight-pin serial flash. Read its JEDEC identification while monitoring the clock and chip-select.',
    task: 'Virtual part: SPI mode 0, active-low CS. Send 0x9F followed by three dummy bytes to clock out the response.',
    wires: ['SCK', 'MOSI', 'MISO', 'CS', 'GND'],
    targets: ['SCK', 'DI', 'DO', 'CS', 'GND'],
    fields: [
      {
        label: 'Clock mode',
        choices: [
          ['0', 'Mode 0 · CPOL 0 / CPHA 0'],
          ['1', 'Mode 1 · CPOL 0 / CPHA 1'],
          ['2', 'Mode 2 · CPOL 1 / CPHA 0'],
          ['3', 'Mode 3 · CPOL 1 / CPHA 1'],
        ],
        answer: '0',
        hint: 'This virtual part samples on the rising edge with the clock idle LOW.',
      },
      {
        label: 'Chip select',
        choices: [
          ['low', 'LOW during the transaction'],
          ['high', 'HIGH during the transaction'],
        ],
        answer: 'low',
        hint: 'CS must stay LOW across the command and response bytes.',
      },
    ],
    bytes: 'TX 9F 00 00 00  |  RX -- EF 40 18',
    detail:
      'The controller supplies all 32 clock pulses. DI receives MOSI; DO drives MISO. The first received byte is ignored. The remaining three bytes form the illustrative JEDEC ID.',
    source:
      'https://www.analog.com/en/resources/analog-dialogue/articles/introduction-to-spi-interface.html',
  },
  'I²C': {
    title: 'Addressable temperature node',
    tag: 'OPEN DRAIN / SHARED TWO-WIRE BUS',
    context:
      'Attach a temperature breakout to the board. Wire the shared bus and read a two-byte temperature register using a repeated START.',
    task: 'Virtual sensor: 7-bit address 0x48; temperature register 0x00. SDA and SCL require pull-ups to the shared 3.3 V supply.',
    wires: ['SDA', 'SCL', 'GND'],
    targets: ['SDA', 'SCL', 'GND'],
    fields: [
      {
        label: 'Device address',
        choices: [
          ['48', '0x48'],
          ['90', '0x90'],
          ['40', '0x40'],
        ],
        answer: '48',
        hint: '0x48 is the 7-bit address. 0x90 is the address byte after adding a write bit.',
      },
      {
        label: 'Pull-ups',
        choices: [
          ['fitted', 'SDA and SCL pulled up to 3.3 V'],
          ['none', 'No pull-ups'],
        ],
        answer: 'fitted',
        hint: 'Open-drain pins release the bus; pull-ups establish HIGH.',
      },
    ],
    bytes: 'S 90 A 00 A Sr 91 A 17 A 80 N P',
    detail:
      'S/ Sr/ P = START / repeated START / STOP. A = ACK, N = final controller NACK. This virtual sensor uses signed 8.8 fixed-point data: 0x1780 / 256 = 23.5 °C. Register formats vary between actual parts.',
    source: 'https://www.nxp.com/docs/en/user-guide/UM10204.pdf',
  },
};
const descriptions: Record<string, string> = {
  'RS-232': 'Modbus · sensor',
  'RS-485': 'Modbus · inverter',
  CAN: 'Automotive network',
  UART: 'Sensor console',
  SPI: 'Serial flash',
  'I²C': 'Temperature node',
};
export function ProtocolLabWindow() {
  const [selected, setSelected] = useState('RS-232');
  const [values, setValues] = useState<Record<string, string>>({});
  const [wires, setWires] = useState<Record<string, string>>({});
  const [pin, setPin] = useState<string | null>(null);
  const [message, setMessage] = useState('Connect the devices, then configure the bus.');
  const [success, setSuccess] = useState(false);
  const [sequence, setSequence] = useState(0);
  const scenario = scenarios[selected];
  const invalidate = () => {
    setSuccess(false);
    setMessage('Configuration changed. Transmit again to validate.');
  };
  const select = (name: string) => {
    setSelected(name);
    setValues({});
    setWires({});
    setPin(null);
    setSuccess(false);
    setSequence(0);
    setMessage('Connect the devices, then configure the bus.');
  };
  const send = () => {
    const wrong = scenario.wires.find((wire, i) => wires[wire] !== scenario.targets[i]);
    const field = scenario.fields.find((f) => values[f.label] !== f.answer);
    setSuccess(!wrong && !field);
    setMessage(
      wrong
        ? `Wiring fault: connect ${wrong} to ${
            scenario.targets[scenario.wires.indexOf(wrong)]
          }. Click a source pin, then its destination.`
        : field
        ? field.hint
        : 'Success · frame received and decoded.'
    );
    if (!wrong && !field) setSequence((s) => s + 1);
  };
  return (
    <div className="protocol-lab">
      <aside className="protocol-nav">
        <div className="protocol-brand">
          PROTOCOL<span>PLAYGROUND</span>
        </div>
        <p>SELECT AN INTERFACE</p>
        {Object.keys(descriptions).map((name) => (
          <button
            key={name}
            className={selected === name ? 'selected' : ''}
            onClick={() => select(name)}
          >
            <span>{name}</span>
            <small>{descriptions[name]}</small>
          </button>
        ))}
      </aside>
      <main className="protocol-content">
        {selected === 'RS-232' || selected === 'RS-485' ? (
          <ModbusLabWindow key={selected} initialMission={selected === 'RS-232' ? 1 : 2} />
        ) : (
          <div className="protocol-mission">
            <header>
              <span>{scenario.tag}</span>
              <h1>{scenario.title}</h1>
              <p>{scenario.context}</p>
            </header>
            <section className="protocol-work">
              <div className="protocol-title">
                HARDWARE BENCH <small>{success ? 'LINK ACTIVE' : 'AWAITING CONNECTION'}</small>
              </div>
              <ProtocolScene
                protocol={selected}
                active={success}
                wires={wires}
                sources={scenario.wires}
                targets={scenario.targets}
                selectedPin={pin}
                onSource={setPin}
                onTarget={(target) => {
                  if (pin) {
                    setWires((old) => ({ ...old, [pin]: target }));
                    setPin(null);
                    invalidate();
                  }
                }}
              />
              <p>
                Click a source pin and then a destination pin. Select an existing source to rewire
                it.
              </p>
              <p>{scenario.task}</p>
            </section>
            <section className="protocol-settings">
              <div className="protocol-title">CONTROLLER CONFIGURATION</div>
              <div className="protocol-fields">
                {scenario.fields.map((field) => (
                  <label key={field.label}>
                    {field.label}
                    <select
                      aria-label={field.label}
                      value={values[field.label] ?? ''}
                      onChange={(e) => {
                        setValues({ ...values, [field.label]: e.target.value });
                        invalidate();
                      }}
                    >
                      <option value="">Select…</option>
                      {field.choices.map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
              <button onClick={send}>▶ Transmit</button>
            </section>
            <div role="status" className={`protocol-feedback ${success ? 'success' : ''}`}>
              {message}
            </div>
            {success && (
              <div className="protocol-frame" key={sequence}>
                <b>TRANSACTION #{sequence.toString().padStart(3, '0')}</b>
                <pre>{scenario.bytes}</pre>
                <p>{scenario.detail}</p>
                <ProtocolTrace protocol={selected} />
              </div>
            )}
            <footer>
              Educational devices and signal maps.{' '}
              <a href={scenario.source} target="_blank" rel="noopener noreferrer">
                Protocol reference ↗
              </a>
            </footer>
          </div>
        )}
      </main>
    </div>
  );
}
function ProtocolTrace({ protocol }: { protocol: string }) {
  const rows =
    protocol === 'SPI'
      ? [
          ['CS', '100000000000000001'],
          ['SCK', '001010101010101010'],
          ['MOSI (0x9F)', '010011111100000000'],
        ]
      : protocol === 'UART'
      ? [['TX · 0x54 / 8N1', '10001010101']]
      : protocol === 'CAN'
      ? [
          ['CAN-H', '00110100110100'],
          ['CAN-L', '11001011001011'],
        ]
      : [
          ['SCL', '110101010101011'],
          ['SDA', '110010010001001'],
        ];
  return (
    <div className="protocol-trace">
      <span>
        {protocol === 'CAN'
          ? 'Differential activity sketch (not a complete CAN frame)'
          : 'Logic timing sketch · illustrative, not to scale'}
      </span>
      <svg
        viewBox={`0 0 640 ${rows.length * 40}`}
        role="img"
        aria-label={`${protocol} timing diagram`}
      >
        {rows.map(([label, bits], r) => (
          <g key={label}>
            <text x="0" y={r * 40 + 22} fill="#b6cbd5" fontSize="11">
              {label}
            </text>
            <path
              d={bits
                .split('')
                .map(
                  (v, i) =>
                    `${i ? 'L' : 'M'} ${145 + i * 26} ${r * 40 + (v === '1' ? 8 : 28)} H ${
                      171 + i * 26
                    }`
                )
                .join(' ')}
              fill="none"
              stroke={r % 2 ? '#eca855' : '#6bd8b2'}
              strokeWidth="2"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
