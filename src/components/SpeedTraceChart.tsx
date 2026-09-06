import { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { getLapData, getCurrentSessionInfo } from '../services/f1Service';
import type { LapData } from '../types';
import { useDrivers } from '../services/seasonStore';

interface Props {
  driverIds?: string[];
}

interface Row {
  lap: number;
  [code: string]: number | null | undefined;
}

export default function SpeedTraceChart({ driverIds }: Props) {
  const { drivers: DRIVERS, status } = useDrivers();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const ids = useMemo(
    () => driverIds ?? DRIVERS.slice(0, 2).map((d) => d.id),
    // Only re-derive when the top two actually change, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [driverIds, DRIVERS[0]?.id, DRIVERS[1]?.id]
  );

  useEffect(() => {
    if (status === 'loading') return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const drivers = ids.map((id) => DRIVERS.find((d) => d.id === id)!).filter(Boolean);
      const lapsByDriver: Record<string, LapData[]> = {};
      let failed = false;
      await Promise.all(
        drivers.map(async (d) => {
          if (d.number) {
            const laps = await getLapData(d.number);
            if (laps === null) failed = true;
            lapsByDriver[d.code] = laps || [];
          }
        })
      );
      const maxLaps = Math.max(0, ...Object.values(lapsByDriver).map((l) => l.length));
      const merged: Row[] = [];
      for (let i = 0; i < maxLaps; i++) {
        const row: Row = { lap: i + 1 };
        for (const d of drivers) {
          const lap = lapsByDriver[d.code]?.[i];
          row[d.code] = lap?.lap_duration ?? null;
        }
        merged.push(row);
      }
      if (!cancelled) {
        setRows(merged);
        setUnavailable(failed && merged.length === 0);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, status, attempt]);

  const drivers = ids.map((id) => DRIVERS.find((d) => d.id === id)!).filter(Boolean);

  if (loading) {
    return <div className="label-mono text-ink-3 p-4">LOADING LAP DATA…</div>;
  }
  const session = getCurrentSessionInfo();

  if (unavailable) {
    return (
      <div className="border border-dashed border-rule p-6 font-mono text-sm flex items-center justify-between gap-3 flex-wrap" role="status">
        <span>Lap data unavailable. Retrying in a minute.</span>
        <button onClick={() => setAttempt((n) => n + 1)} className="bg-paper-3 border border-rule px-3 py-1.5 text-xs btn-press hover:border-ink">RETRY NOW</button>
      </div>
    );
  }
  if (!rows.length) {
    return (
      <div className="border border-dashed border-rule p-6 font-mono text-sm" role="status">
        No lap data from OpenF1 for {session.name ? `the ${session.name}` : 'this session'} yet. Lap times appear once cars have run.
      </div>
    );
  }

  return (
    <div className="border border-rule bg-paper-2 p-3">
      {session.name && <div className="label-mono mb-2">SESSION · {session.name.toUpperCase()}</div>}
      <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows}>
          <CartesianGrid stroke="var(--color-rule)" />
          <XAxis dataKey="lap" stroke="var(--color-ink-2)" tick={{ fontSize: 12, fill: 'var(--color-ink-2)' }} />
          <YAxis stroke="var(--color-ink-2)" tick={{ fontSize: 12, fill: 'var(--color-ink-2)' }} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
          <Tooltip
            contentStyle={{ background: 'var(--color-paper-3)', border: '1px solid var(--color-rule)', fontSize: 12 }}
            labelStyle={{ color: 'var(--color-ink)' }}
            itemStyle={{ color: 'var(--color-ink)' }}
          />
          {/* Team colours stay on the lines; legend text is ink so it reads on light paper. */}
          <Legend wrapperStyle={{ fontSize: 12 }} formatter={(value) => <span style={{ color: 'var(--color-ink)' }}>{value}</span>} />
          {drivers.map((d) => (
            <Line
              key={d.id}
              type="monotone"
              dataKey={d.code}
              stroke={d.color}
              dot={{ r: 2 }}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
