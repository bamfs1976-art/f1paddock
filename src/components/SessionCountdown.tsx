import { useEffect, useState } from 'react';
import { CALENDAR } from '../constants';

function nextSessionTarget() {
  const race = CALENDAR.find((r) => r.isNext) || CALENDAR.find((r) => !r.isDone);
  if (!race) return null;
  const sessions = race.sessions;
  if (sessions && sessions.length) {
    const upcoming = sessions.find((s) => s.status === 'upcoming');
    if (upcoming) {
      const date = new Date(upcoming.date + 'T16:00:00Z');
      return { label: `${race.country.toUpperCase()} ${upcoming.type.toUpperCase()}`, target: date };
    }
  }
  return { label: `${race.country.toUpperCase()} RACE`, target: new Date(race.date + 'T15:00:00Z') };
}

export default function SessionCountdown() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  void tick;
  const target = nextSessionTarget();
  if (!target) return null;
  const diff = target.target.getTime() - Date.now();

  if (diff <= 0) {
    return (
      <div className="border border-racing bg-paper-2 p-4 flex items-center gap-3" aria-live="polite">
        <span className="w-3 h-3 bg-racing rounded-full pulse-dot" aria-hidden="true" />
        <span className="font-mono text-sm">SESSION LIVE — {target.label}</span>
      </div>
    );
  }

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  return (
    <div className="border border-ink-3 bg-paper-2 p-4">
      <div className="label-mono mb-2">NEXT SESSION · {target.label}</div>
      <div className="flex gap-4 font-mono text-2xl tabular-nums">
        <span><span className="font-bold">{d}</span><span className="text-ink-3 text-xs ml-1">d</span></span>
        <span><span className="font-bold">{String(h).padStart(2, '0')}</span><span className="text-ink-3 text-xs ml-1">h</span></span>
        <span><span className="font-bold">{String(m).padStart(2, '0')}</span><span className="text-ink-3 text-xs ml-1">m</span></span>
        <span><span className="font-bold">{String(s).padStart(2, '0')}</span><span className="text-ink-3 text-xs ml-1">s</span></span>
      </div>
    </div>
  );
}
