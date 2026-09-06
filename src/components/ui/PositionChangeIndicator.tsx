interface Props {
  change: number;
}

export default function PositionChangeIndicator({ change }: Props) {
  if (change > 0) {
    return (
      <span className="font-mono text-xs text-gain tabular-nums" aria-label={`gained ${change} position${change === 1 ? '' : 's'}`}>
        ▲{change}
      </span>
    );
  }
  if (change < 0) {
    return (
      <span className="font-mono text-xs text-loss tabular-nums" aria-label={`lost ${Math.abs(change)} position${Math.abs(change) === 1 ? '' : 's'}`}>
        ▼{Math.abs(change)}
      </span>
    );
  }
  return <span className="font-mono text-xs text-ink-3" aria-label="no change">—</span>;
}
