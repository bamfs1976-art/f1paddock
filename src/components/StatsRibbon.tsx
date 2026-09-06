import { useDrivers, useSchedule, useSeasonResults } from '../services/seasonStore';

export default function StatsRibbon() {
  const { drivers, teams, status } = useDrivers();
  const schedule = useSchedule();
  const results = useSeasonResults();

  const loading = status === 'loading';
  const total = schedule.data?.length ?? 22;
  const completed = results.data?.length ?? null;
  const leader = drivers[0];
  const second = drivers[1];
  const gap = leader && second ? leader.pts - second.pts : null;
  const topTeam = teams[0];

  const stats = [
    { label: 'RACES', value: completed === null ? '--' : `${completed}/${total}` },
    { label: 'POINTS LEADER', value: loading ? '--' : leader?.code ?? '--' },
    { label: 'GAP TO P2', value: loading || gap === null ? '--' : `+${gap}` },
    { label: 'CONSTRUCTORS', value: loading ? '--' : topTeam?.name.toUpperCase() ?? '--' },
  ];

  return (
    <section aria-label="Season at a glance" className="border-y-2 border-ink bg-paper-2 grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-rule">
      {stats.map((s) => (
        <div key={s.label} className="px-4 py-3">
          <div className="label-mono">{s.label}</div>
          <div className="font-mono font-bold text-base mt-1">{s.value}</div>
        </div>
      ))}
    </section>
  );
}
