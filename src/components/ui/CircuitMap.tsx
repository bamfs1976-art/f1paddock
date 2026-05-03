interface Props {
  circuitId?: string;
  width?: number;
  height?: number;
  label?: string;
}

const PATHS: Record<string, string> = {
  bahrain: 'M20 60 L60 30 L130 25 L170 50 L175 90 L150 115 L90 120 L50 100 Z M90 120 L100 80 L130 70',
  jeddah: 'M15 80 L40 35 L90 30 L140 45 L175 70 L165 110 L120 120 L70 110 L30 100 Z',
  melbourne: 'M25 50 L70 25 L130 30 L170 60 L160 105 L100 120 L40 105 L20 80 Z',
  suzuka: 'M30 30 L80 25 L130 50 L130 80 L100 70 L80 90 L120 110 L80 120 L30 100 Z',
  shanghai: 'M30 110 L40 50 L80 25 L130 30 L170 60 L165 95 L130 115 L80 120 Z M80 25 L100 75',
  miami: 'M20 70 L60 30 L120 25 L170 50 L175 95 L130 120 L70 115 L25 100 Z',
  imola: 'M30 100 L40 50 L80 25 L140 30 L170 70 L150 110 L100 120 L60 115 Z',
  monaco: 'M35 60 L70 30 L130 35 L160 60 L155 90 L120 115 L80 110 L40 90 Z M80 35 L90 80',
  barcelona: 'M30 60 L80 25 L150 30 L175 65 L160 100 L110 120 L60 115 L25 90 Z',
  montreal: 'M20 75 L60 30 L130 25 L170 55 L175 95 L120 120 L60 110 L25 90 Z',
  spielberg: 'M40 100 L30 60 L70 30 L130 30 L170 65 L160 100 L100 115 L70 110 Z',
  silverstone: 'M30 80 L60 30 L120 25 L160 45 L175 80 L150 115 L100 120 L50 110 L25 95 Z',
  spa: 'M25 80 L50 40 L100 25 L150 35 L175 70 L165 105 L120 120 L70 115 L25 100 Z M80 30 L90 80',
  hungary: 'M30 60 L70 30 L130 30 L170 60 L160 95 L120 115 L70 115 L30 95 Z',
  zandvoort: 'M30 50 L70 25 L130 30 L170 55 L170 95 L120 120 L60 115 L25 85 Z',
  monza: 'M20 60 L70 25 L130 25 L170 55 L165 100 L100 120 L40 105 L15 75 Z',
  baku: 'M25 100 L40 50 L80 25 L140 25 L170 55 L165 95 L100 120 L50 110 Z',
  singapore: 'M30 60 L70 30 L130 30 L170 65 L160 100 L100 120 L60 110 L25 90 Z',
  cota: 'M20 70 L50 30 L120 25 L170 50 L175 90 L130 120 L70 115 L25 95 Z',
  mexico: 'M30 90 L40 50 L80 25 L140 30 L170 60 L160 100 L100 115 L60 110 Z',
  interlagos: 'M30 75 L60 30 L120 30 L160 55 L165 95 L110 115 L50 110 L20 80 Z',
  lasvegas: 'M20 50 L60 30 L130 30 L170 55 L170 90 L120 115 L60 110 L20 85 Z',
  lusail: 'M30 60 L70 30 L130 30 L170 60 L165 100 L100 120 L50 105 L25 80 Z',
  yasmarina: 'M25 80 L50 40 L100 25 L150 35 L175 70 L150 115 L80 115 L25 95 Z',
};

export default function CircuitMap({ circuitId, width = 80, height = 50, label }: Props) {
  const path = circuitId ? PATHS[circuitId] : null;
  if (!path) {
    return (
      <div
        className="flex items-center justify-center border border-dashed border-ink-3 text-ink-3 label-mono"
        style={{ width, height, fontSize: 8 }}
        role="img"
        aria-label={label || 'circuit map unavailable'}
      >
        {label || 'CIRCUIT'}
      </div>
    );
  }
  return (
    <svg
      viewBox="0 0 200 140"
      width={width}
      height={height}
      role="img"
      aria-label={label || `${circuitId} circuit outline`}
    >
      <path d={path} fill="none" stroke="var(--color-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
