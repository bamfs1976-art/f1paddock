interface Props {
  change: number;
}

export default function PositionChangeIndicator({ change }: Props) {
  if (change > 0) {
    return (
      <span className="font-mono text-[10px] text-green-500 tabular-nums" aria-label={`gained ${change} position${change === 1 ? '' : 's'}`}>
        ▲{change}
      </span>
    );
  }
  if (change < 0) {
    return (
      <span className="font-mono text-[10px] text-red-500 tabular-nums" aria-label={`lost ${Math.abs(change)} position${Math.abs(change) === 1 ? '' : 's'}`}>
        ▼{Math.abs(change)}
      </span>
    );
  }
  return <span className="font-mono text-[10px] text-ink-3" aria-label="no change">—</span>;
}
