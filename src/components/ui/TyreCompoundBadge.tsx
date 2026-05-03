type Compound = 'soft' | 'medium' | 'hard' | 'inter' | 'wet';

interface Props {
  compound: Compound | string;
  size?: 'sm' | 'md';
}

const STYLES: Record<Compound, { bg: string; color: string; initial: string; label: string }> = {
  soft:   { bg: 'var(--color-tyre-soft)',   color: '#fff', initial: 'S', label: 'soft' },
  medium: { bg: 'var(--color-tyre-medium)', color: '#000', initial: 'M', label: 'medium' },
  hard:   { bg: 'var(--color-tyre-hard)',   color: '#000', initial: 'H', label: 'hard' },
  inter:  { bg: 'var(--color-tyre-inter)',  color: '#fff', initial: 'I', label: 'intermediate' },
  wet:    { bg: 'var(--color-tyre-wet)',    color: '#fff', initial: 'W', label: 'wet' },
};

export default function TyreCompoundBadge({ compound, size = 'sm' }: Props) {
  const key = compound.toLowerCase() as Compound;
  const style = STYLES[key] || STYLES.medium;
  const dim = size === 'sm' ? 18 : 24;
  return (
    <span
      className="inline-flex items-center justify-center font-mono font-bold border border-ink-3 rounded-full"
      style={{ background: style.bg, color: style.color, width: dim, height: dim, fontSize: size === 'sm' ? 10 : 12 }}
      aria-label={`${style.label} compound`}
      title={style.label}
    >
      {style.initial}
    </span>
  );
}
