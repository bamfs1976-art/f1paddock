type Compound = 'soft' | 'medium' | 'hard' | 'inter' | 'wet';

interface Props {
  compound: Compound | string;
  size?: 'sm' | 'md';
}

// Filled chips with the compound colour as background, never as text. Text
// colour is whichever of black or white measures higher on each fill:
// soft 4.68:1 black, medium 13.46:1 black, hard 21:1 black, inter 7.48:1 black, wet 4.89:1 white.
const STYLES: Record<Compound, { bg: string; color: string; initial: string; label: string }> = {
  soft:   { bg: 'var(--color-tyre-soft)',   color: '#000', initial: 'S', label: 'soft' },
  medium: { bg: 'var(--color-tyre-medium)', color: '#000', initial: 'M', label: 'medium' },
  hard:   { bg: 'var(--color-tyre-hard)',   color: '#000', initial: 'H', label: 'hard' },
  inter:  { bg: 'var(--color-tyre-inter)',  color: '#000', initial: 'I', label: 'intermediate' },
  wet:    { bg: 'var(--color-tyre-wet)',    color: '#fff', initial: 'W', label: 'wet' },
};

export default function TyreCompoundBadge({ compound, size = 'sm' }: Props) {
  const raw = compound.toLowerCase();
  const key = (raw === 'intermediate' ? 'inter' : raw) as Compound;
  const style = STYLES[key] || STYLES.medium;
  const dim = size === 'sm' ? 22 : 28;
  return (
    <span
      className="inline-flex items-center justify-center font-mono font-bold border border-rule rounded-full"
      style={{ background: style.bg, color: style.color, width: dim, height: dim, fontSize: 12 }}
      aria-label={`${style.label} compound`}
      title={style.label}
    >
      {style.initial}
    </span>
  );
}
