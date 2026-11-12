import { useId } from 'react';
export function TowerLamp({ on }: { on: boolean }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      className="tower-lamp"
      viewBox="0 0 180 390"
      role="img"
      aria-label={`Red tower lamp ${on ? 'on' : 'off'}`}
    >
      <defs>
        <linearGradient id={`${id}-metal`}>
          <stop stopColor="#a9b2ba" />
          <stop offset=".35" stopColor="#f7fafc" />
          <stop offset=".65" stopColor="#dfe5e8" />
          <stop offset="1" stopColor="#82909b" />
        </linearGradient>
        {['red', 'amber', 'green'].map((color, i) => (
          <linearGradient key={color} id={`${id}-${color}`}>
            <stop stopColor={['#731e24', '#70531b', '#164b42'][i]} />
            <stop
              offset=".45"
              stopColor={i === 0 && on ? '#ff766e' : ['#bb4e51', '#bb9648', '#367e70'][i]}
            />
            <stop offset="1" stopColor={['#77252a', '#6a511f', '#204e44'][i]} />
          </linearGradient>
        ))}
        <filter id={`${id}-glow`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>
      {on && (
        <rect
          x="45"
          y="35"
          width="90"
          height="76"
          rx="20"
          fill="#ff3838"
          opacity=".5"
          filter={`url(#${id}-glow)`}
        />
      )}
      <ellipse cx="90" cy="367" rx="52" ry="7" fill="#1d2b3b" opacity=".1" />
      <path d="M82 276H98V360H82Z" fill={`url(#${id}-metal)`} />
      <path d="M67 265H113L104 288H76Z" fill={`url(#${id}-metal)`} />
      <rect x="48" y="34" width="84" height="14" rx="5" fill={`url(#${id}-metal)`} />
      {['red', 'amber', 'green'].map((color, i) => (
        <g key={color}>
          <rect x="48" y={48 + i * 61} width="84" height="61" fill={`url(#${id}-${color})`} />
          {Array.from({ length: 15 }, (_, n) => (
            <path
              key={n}
              d={`M49 ${51 + i * 61 + n * 3.7}H131`}
              stroke={i === 0 && on ? '#ffb6aa' : '#d8d9bd'}
              strokeOpacity={on && i === 0 ? '.45' : '.18'}
            />
          ))}
          <path
            d={`M65 ${48 + i * 61}v61 M70 ${48 + i * 61}v61 M110 ${48 + i * 61}v61`}
            stroke="#fff"
            strokeOpacity=".2"
            strokeWidth="2"
          />
        </g>
      ))}
      <path d="M48 231H132V263Q130 278 90 278Q50 278 48 263Z" fill={`url(#${id}-metal)`} />
      <path d="M58 235v27 M122 235v27" stroke="#bac3ca" />
      <rect x="64" y="355" width="52" height="10" rx="3" fill={`url(#${id}-metal)`} />
    </svg>
  );
}
