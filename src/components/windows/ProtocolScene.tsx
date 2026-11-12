import { useId } from 'react';
type Props = {
  protocol: string;
  active: boolean;
  wires: Record<string, string>;
  sources: string[];
  targets: string[];
  selectedPin: string | null;
  onSource: (pin: string) => void;
  onTarget: (pin: string) => void;
};
export function ProtocolScene({
  protocol,
  active,
  wires,
  sources,
  targets,
  selectedPin,
  onSource,
  onTarget,
}: Props) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      className="protocol-scene"
      viewBox="0 0 800 390"
      role="group"
      aria-label={`${protocol} interactive hardware diagram`}
    >
      <defs>
        <linearGradient id={`${id}-metal`} x2="0" y2="1">
          <stop stopColor="#e9edf3" />
          <stop offset=".4" stopColor="#a2afc0" />
          <stop offset="1" stopColor="#516277" />
        </linearGradient>
        <linearGradient id={`${id}-pcb`} x2="1" y2="1">
          <stop stopColor="#197c6c" />
          <stop offset="1" stopColor="#094c4b" />
        </linearGradient>
        <pattern id={`${id}-grid`} width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 H0 V24" fill="none" stroke="#273849" strokeWidth=".5" />
        </pattern>
      </defs>
      <rect width="800" height="390" rx="12" fill="#111f2e" />
      <rect width="800" height="390" fill={`url(#${id}-grid)`} />
      <text x="25" y="30" fill="#7b9aaa" fontSize="10" letterSpacing="2">
        {protocol === 'CAN'
          ? 'VEHICLE NETWORK / ENGINE → INSTRUMENT CLUSTER'
          : 'EMBEDDED WORKBENCH / CONTROLLER → PERIPHERAL'}
      </text>
      {protocol === 'CAN' ? (
        <>
          <g transform="translate(30 45)">
            <path
              d="M8 95 L35 50 Q45 30 85 25 L165 25 Q195 25 220 62 L252 78 L260 110 L5 110Z"
              fill={`url(#${id}-metal)`}
              stroke="#dce6ef"
              strokeWidth="2"
            />
            <path d="M55 50 L86 35 L160 35 L188 64 L48 64Z" fill="#213748" />
            <path d="M117 35V64 M33 78H230" stroke="#627d90" />
            <circle cx="59" cy="109" r="22" fill="#0a101a" stroke="#718193" strokeWidth="5" />
            <circle cx="211" cy="109" r="22" fill="#0a101a" stroke="#718193" strokeWidth="5" />
            <rect x="25" y="140" width="205" height="48" rx="6" fill={`url(#${id}-metal)`} />
            {Array.from({ length: 12 }, (_, i) => (
              <path key={i} d={`M${40 + i * 15} 145v35`} stroke="#65768b" strokeWidth="3" />
            ))}
            <text x="128" y="172" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">
              ENGINE CONTROL UNIT
            </text>
          </g>
          <g transform="translate(500 70)">
            <path
              d="M0 120 Q0 5 135 5 Q270 5 270 120V170H0Z"
              fill="#030b12"
              stroke="#4c6277"
              strokeWidth="4"
            />
            {[75, 197].map((x, i) => (
              <g key={x}>
                <circle cx={x} cy="98" r="52" fill="#122231" stroke="#607a8a" strokeWidth="2" />
                {Array.from({ length: 11 }, (_, j) => (
                  <line
                    key={j}
                    x1={x}
                    x2={x}
                    y1="52"
                    y2="59"
                    stroke="#c0d0dc"
                    transform={`rotate(${j * 27 - 135} ${x} 98)`}
                  />
                ))}
                <line
                  x1={x}
                  y1="98"
                  x2={x}
                  y2="60"
                  stroke="#f08b57"
                  strokeWidth="3"
                  transform={`rotate(${active ? (i ? -25 : -65) : -135} ${x} 98)`}
                />
                <circle cx={x} cy="98" r="5" fill="#f08b57" />
                <text x={x} y="128" textAnchor="middle" fill="#c7d6df" fontSize="9">
                  {i ? 'km/h' : 'RPM ×1000'}
                </text>
              </g>
            ))}
            <text
              x="135"
              y="158"
              fill={active ? '#71e6b0' : '#718594'}
              textAnchor="middle"
              fontFamily="monospace"
              fontSize="15"
            >
              {active ? '1500 rpm · RX OK' : 'IGNITION ON · NO DATA'}
            </text>
          </g>
        </>
      ) : (
        <>
          <g transform="translate(35 60)">
            <rect
              width="235"
              height="195"
              rx="12"
              fill={`url(#${id}-pcb)`}
              stroke="#50a58d"
              strokeWidth="2"
            />
            {[
              [12, 12],
              [222, 12],
              [12, 181],
              [222, 181],
            ].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill="#162b35" stroke="#d1c186" />
            ))}
            <rect x="-8" y="66" width="40" height="49" rx="3" fill={`url(#${id}-metal)`} />
            <rect x="69" y="46" width="92" height="92" fill="#14232c" stroke="#8ca6a5" />
            {Array.from({ length: 10 }, (_, i) => (
              <g key={i} stroke="#c4cbb5" strokeWidth="4">
                <path
                  d={`M${74 + i * 9} 36v10 M${74 + i * 9} 138v10 M59 ${51 + i * 9}h10 M161 ${
                    51 + i * 9
                  }h10`}
                />
              </g>
            ))}
            <text x="115" y="88" fill="#d2e6df" textAnchor="middle" fontSize="14">
              MCU
            </text>
            <text x="115" y="107" fill="#79a799" textAnchor="middle" fontSize="9">
              3.3 V LOGIC
            </text>
            <text x="48" y="178" fill="#d4e9de" fontSize="10">
              DEVELOPMENT BOARD
            </text>
            <circle cx="205" cy="158" r="5" fill={active ? '#8dfc9c' : '#576b4e'} />
          </g>
          <g transform="translate(530 60)">
            <rect
              width="220"
              height="195"
              rx="9"
              fill={protocol === 'SPI' ? '#254e76' : '#386862'}
              stroke="#84a8b9"
              strokeWidth="2"
            />
            {[15, 205].map((x) => (
              <g key={x}>
                <circle cx={x} cy="15" r="5" fill="#172e3c" stroke="#d7c98a" />
                <circle cx={x} cy="180" r="5" fill="#172e3c" stroke="#d7c98a" />
              </g>
            ))}
            {protocol === 'SPI' ? (
              <>
                <rect x="57" y="43" width="106" height="90" rx="3" fill="#131d2b" />
                {Array.from({ length: 4 }, (_, i) => (
                  <g key={i} fill={`url(#${id}-metal)`}>
                    <rect x="39" y={51 + i * 22} width="18" height="10" />
                    <rect x="163" y={51 + i * 22} width="18" height="10" />
                  </g>
                ))}
                <circle cx="70" cy="55" r="3" fill="#758b99" />
                <text x="110" y="85" fill="#b4c6d7" textAnchor="middle" fontSize="12">
                  SERIAL FLASH
                </text>
                <text x="110" y="108" fill="#6b8b9f" textAnchor="middle" fontSize="11">
                  128 Mbit · SOIC-8
                </text>
              </>
            ) : (
              <>
                <rect x="57" y="33" width="105" height="108" rx="8" fill={`url(#${id}-metal)`} />
                {Array.from({ length: 6 }, (_, i) => (
                  <rect
                    key={i}
                    x="72"
                    y={45 + i * 14}
                    width="76"
                    height="6"
                    rx="3"
                    fill="#334b5e"
                  />
                ))}
                <circle cx="180" cy="115" r="12" fill="#172c3b" stroke="#bbccd4" />
                <path d="M174 115h12 M180 109v12" stroke="#9aafb9" />
              </>
            )}
            <text x="110" y="167" fill="#d3e9ee" textAnchor="middle" fontSize="10">
              {protocol === 'SPI'
                ? 'JEDEC ID PERIPHERAL'
                : protocol === 'UART'
                ? 'UART SENSOR MODULE'
                : 'I²C TEMPERATURE BREAKOUT'}
            </text>
          </g>
        </>
      )}
      {sources.map((source, i) => {
        const y = 282 + i * 20;
        const ti = targets.indexOf(wires[source]);
        return (
          <g key={source}>
            {ti >= 0 && (
              <path
                d={`M275 ${y} C365 ${y} 435 ${282 + ti * 20} 525 ${282 + ti * 20}`}
                fill="none"
                stroke={['#f1b866', '#72c9e7', '#b2a4f5', '#ee9baf', '#84cba6'][i]}
                strokeWidth="2"
              />
            )}
            <g
              role="button"
              tabIndex={0}
              aria-label={`Source ${source}`}
              onClick={() => onSource(source)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSource(source);
                }
              }}
              className="protocol-pin"
            >
              <rect
                x="175"
                y={y - 9}
                width="110"
                height="19"
                rx="4"
                fill={selectedPin === source ? '#a76b24' : '#263d51'}
              />
              <circle cx="275" cy={y} r="5" fill="#efc578" />
              <text x="186" y={y + 4} fill="#e2edf3" fontSize="11">
                {source}
              </text>
            </g>
          </g>
        );
      })}
      {targets.map((target, i) => (
        <g
          key={target}
          role="button"
          tabIndex={0}
          aria-label={`Destination ${target}`}
          onClick={() => onTarget(target)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onTarget(target);
            }
          }}
          className="protocol-pin"
        >
          <rect x="515" y={273 + i * 20} width="110" height="19" rx="4" fill="#263d51" />
          <circle cx="525" cy={282 + i * 20} r="5" fill="#efc578" />
          <text x="540" y={286 + i * 20} fill="#e2edf3" fontSize="11">
            {target}
          </text>
        </g>
      ))}
    </svg>
  );
}
