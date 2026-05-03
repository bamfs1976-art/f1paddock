import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { getLapData } from '../services/f1Service';
import { DRIVERS } from '../constants';
import type { LapData } from '../types';

interface Props {
  driverIds?: string[];
}

interface Row {
  lap: number;
  [code: string]: number | null | undefined;
}

export default function SpeedTraceChart({ driverIds = [DRIVERS[0].id, DRIVERS[1].id] }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const drivers = driverIds.map((id) => DRIVERS.find((d) => d.id === id)!).filter(Boolean);
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
  }, [driverIds]);

  const drivers = driverIds.map((id) => DRIVERS.find((d) => d.id === id)!).filter(Boolean);

  if (loading) {
    return <div className="label-mono text-ink-3 p-4">LOADING LAP DATA…</div>;
  }
  if (!rows.length) {
    return (
      <div className="border border-dashed border-ink-3 p-6 label-mono text-ink-3">
        NO LAP DATA AVAILABLE FOR THIS SESSION
      </div>
    );
  }

  return (
    <div className="border border-ink-3 bg-paper-2 p-3 h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows}>
          <CartesianGrid stroke="rgba(245,245,240,0.1)" />
          <XAxis dataKey="lap" stroke="rgba(245,245,240,0.6)" tick={{ fontSize: 10 }} />
          <YAxis stroke="rgba(245,245,240,0.6)" tick={{ fontSize: 10 }} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
          <Tooltip contentStyle={{ background: 'var(--color-paper-3)', border: '1px solid var(--color-ink-3)', fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
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
