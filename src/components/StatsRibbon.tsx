import { DRIVERS, CALENDAR } from '../constants';

export default function StatsRibbon() {
  const completed = CALENDAR.filter((r) => r.isDone).length;
  const total = CALENDAR.length;
  const leader = DRIVERS[0];
  const second = DRIVERS[1];
  const gap = typeof second.gap === 'number' ? Math.abs(second.gap) : 0;

  const stats = [
    { label: 'RACES', value: `${completed}/${total}` },
    { label: 'POINTS LEADER', value: leader.code },
    { label: 'GAP TO P2', value: `+${gap}` },
    { label: 'CONSTRUCTORS', value: 'McLAREN' },
  ];

  return (
    <div className="border-y-2 border-ink bg-paper-2 grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-ink-3">
      {stats.map((s) => (
        <div key={s.label} className="px-4 py-3">
          <div className="label-mono">{s.label}</div>
          <div className="font-mono font-bold text-base mt-1">{s.value}</div>
        </div>
      ))}
    </div>
  );
}
