import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { CALENDAR } from '../constants';
import type { LiveSyncState } from '../types';
import WeatherBar from './WeatherBar';
import RaceControlFeed from './RaceControlFeed';
import CircuitMap from './ui/CircuitMap';
import SessionCountdown from './SessionCountdown';

interface Props {
  liveSync: LiveSyncState | null;
}

const STATUS_BADGE: Record<string, string> = {
  upcoming: 'border border-ink-3 text-ink-2',
  live: 'bg-racing text-white',
  completed: 'bg-paper-3 text-ink-2',
};

export default function RaceWeekendHub({ liveSync }: Props) {
  const [showRC, setShowRC] = useState(false);
  const next = CALENDAR.find((r) => r.isNext) || CALENDAR.find((r) => !r.isDone);
  if (!next) return null;

  return (
    <section className="px-6 sm:px-10 py-10" aria-labelledby="weekend-heading">
      <span className="section-label">S 07 // RACE WEEKEND</span>
      <h2 id="weekend-heading" className="font-serif text-3xl mt-3 mb-6">Race Weekend Hub</h2>

      <div className="border-2 border-ink bg-paper-2">
        <div className="p-4 sm:p-6 border-b border-ink-3 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl" aria-hidden="true">{next.flag}</span>
              <span className="label-mono">ROUND {next.round} · {next.country.toUpperCase()}</span>
            </div>
            <h3 className="font-serif text-2xl">{next.country} Grand Prix</h3>
            <p className="text-ink-2 text-sm">{next.circuit} · {next.location}</p>
          </div>
          <CircuitMap circuitId={next.circuitId} width={200} height={120} label={next.country} />
        </div>

        <div className="p-4 sm:p-6 grid sm:grid-cols-2 gap-4 border-b border-ink-3">
          <SessionCountdown />
          <WeatherBar weather={liveSync?.weather ?? null} />
        </div>

        {next.sessions && (
          <div className="p-4 sm:p-6 border-b border-ink-3">
            <div className="label-mono mb-3">SESSION SCHEDULE</div>
            <ul className="grid sm:grid-cols-2 gap-2">
              {next.sessions.map((s) => (
                <li key={s.type + s.date} className="flex items-center justify-between text-sm border border-ink-3 px-3 py-2">
                  <span className="font-mono">{s.type}</span>
                  <span className="text-ink-2 text-xs">{s.date} · {s.time}</span>
                  <span className={`font-mono text-[10px] uppercase px-2 py-0.5 ${STATUS_BADGE[s.status]}`}>{s.status}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="p-4 sm:p-6">
          <button
            onClick={() => setShowRC(!showRC)}
            className="flex items-center gap-2 label-mono mb-3"
            aria-expanded={showRC}
          >
            <ChevronDown size={14} className={`transition-transform ${showRC ? 'rotate-180' : ''}`} aria-hidden="true" />
            RACE CONTROL FEED
          </button>
          {showRC && (
            <RaceControlFeed messages={liveSync?.raceControl || []} maxItems={10} />
          )}
        </div>

        {liveSync?.pitStops && liveSync.pitStops.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-ink-3">
            <div className="label-mono mb-3">PIT STOP LOG</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Pit stop log">
                <thead>
                  <tr className="label-mono text-left border-b border-ink-3">
                    <th className="py-1 px-2">DRIVER</th>
                    <th className="py-1 px-2">LAP</th>
                    <th className="py-1 px-2">DURATION</th>
                  </tr>
                </thead>
                <tbody>
                  {liveSync.pitStops.slice(-10).reverse().map((p, i) => (
                    <tr key={i} className="border-b border-ink-3/30">
                      <td className="py-1.5 px-2 font-mono">{p.driverCode.toUpperCase()}</td>
                      <td className="py-1.5 px-2 font-mono">{p.lap}</td>
                      <td className="py-1.5 px-2 font-mono tabular-nums">{p.duration?.toFixed(2) ?? '--'}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
