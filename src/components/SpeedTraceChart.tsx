import { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { getLapData } from '../services/f1Service';
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
      await Promise.all(
        drivers.map(async (d) => {
          if (d.number) {
            lapsByDriver[d.code] = await getLapData(d.number);
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
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, status]);

  const drivers = ids.map((id) => DRIVERS.find((d) => d.id === id)!).filter(Boolean);

  if (loading) {
    return <div className="label-mono text-ink-3 p-4">LOADING LAP DATA…</div>;
  }
  if (!rows.length) {
    return (
      <div className="border border-dashed border-rule p-6 label-mono text-ink-3">
        NO LAP DATA AVAILABLE FOR THIS SESSION
      </div>
    );
  }

  return (
    <div className="border border-rule bg-paper-2 p-3 h-[300px]">
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
  );
}
