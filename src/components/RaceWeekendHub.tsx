import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { LiveSyncState, ScheduleSession } from '../types';
import WeatherBar from './WeatherBar';
import RaceControlFeed from './RaceControlFeed';
import CircuitMap from './ui/CircuitMap';
import SessionCountdown from './SessionCountdown';
import ModelViewCard from './ModelViewCard';
import SkeletonLoader from './ui/SkeletonLoader';
import DataNotice from './ui/DataNotice';
import { useSchedule, scheduleResource } from '../services/seasonStore';
import { findNextRound } from '../services/scheduleService';
import { fmtDayTime } from '../utils/time';
import { useNow } from '../hooks/useNow';

interface Props {
  liveSync: LiveSyncState | null;
}

type SessionStatus = 'upcoming' | 'live' | 'completed';

const STATUS_BADGE: Record<SessionStatus, string> = {
  upcoming: 'border border-rule text-ink-2',
  live: 'bg-racing-fill text-white',
  completed: 'bg-paper-3 text-ink-2',
};

function sessionStatus(s: ScheduleSession, now: number): SessionStatus {
  const start = new Date(s.dateStart).getTime();
  const end = new Date(s.dateEnd).getTime();
  if (now < start) return 'upcoming';
  if (now <= end) return 'live';
  return 'completed';
}

export default function RaceWeekendHub({ liveSync }: Props) {
  const [showRC, setShowRC] = useState(false);
  const now = useNow(30_000);
  const schedule = useSchedule();
  const next = schedule.data ? findNextRound(schedule.data, now) : null;

  return (
    <section id="weekend" className="px-6 sm:px-10 py-10 scroll-mt-14" aria-labelledby="weekend-heading">
      <span className="section-label">S 04 // RACE WEEKEND</span>
      <h2 id="weekend-heading" className="font-serif text-3xl mt-3 mb-6">Race Weekend Hub</h2>
      <DataNotice
        status={schedule.status}
        fetchedAt={schedule.fetchedAt}
        unavailableMessage="Race weekend schedule unavailable. Retrying in a minute."
        onRetry={() => scheduleResource.load(true)}
        className="mb-3"
      />

      <div className="border-2 border-ink bg-paper-2">
        {!next ? (
          <div className="p-4 sm:p-6" aria-busy={schedule.status === 'loading'}>
            {schedule.status === 'loading'
              ? <SkeletonLoader type="card" height="120px" />
              : <p className="label-mono text-ink-3">{schedule.status === 'unavailable' ? 'SCHEDULE UNAVAILABLE' : 'SEASON COMPLETE'}</p>}
          </div>
        ) : (
          <div className="p-4 sm:p-6 border-b border-rule flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl" aria-hidden="true">{next.flag}</span>
                <span className="label-mono">ROUND {next.round} · {next.country.toUpperCase()}{next.isSprint ? ' · SPRINT WEEKEND' : ''}</span>
              </div>
              <h3 className="font-serif text-2xl">{next.name}</h3>
              <p className="text-ink-2 text-sm">{next.circuit}{next.location ? ` · ${next.location}` : ''}</p>
            </div>
            <CircuitMap circuitId={next.circuitId} width={200} height={120} label={next.country} />
          </div>
        )}

        <div className="p-4 sm:p-6 grid sm:grid-cols-2 gap-4 border-b border-rule">
          <SessionCountdown />
          <WeatherBar weather={liveSync?.weather ?? null} />
        </div>

        {next && next.sessions.length > 0 && (
          <div className="p-4 sm:p-6 border-b border-rule">
            <div className="label-mono mb-3">SESSION SCHEDULE · TIMES IN YOUR ZONE</div>
            <ul className="grid sm:grid-cols-2 gap-2">
              {next.sessions.map((s) => {
                const status = sessionStatus(s, now);
                return (
                  <li key={s.name + s.dateStart} className="flex items-center justify-between gap-2 text-sm border border-rule px-3 py-2">
                    <span className="font-mono">{s.name}</span>
                    <span className="text-ink-2 text-xs">{fmtDayTime(s.dateStart)}</span>
                    <span className={`font-mono text-xs uppercase px-2 py-0.5 ${STATUS_BADGE[status]}`}>{status}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {next && <ModelViewCard round={next.round} />}

        <div className="p-4 sm:p-6 border-t border-rule">
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
          <div className="p-4 sm:p-6 border-t border-rule">
            <div className="label-mono mb-3">PIT STOP LOG</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Pit stop log">
                <thead>
                  <tr className="label-mono text-left border-b border-rule">
                    <th className="py-1 px-2">DRIVER</th>
                    <th className="py-1 px-2">LAP</th>
                    <th className="py-1 px-2">DURATION</th>
                  </tr>
                </thead>
                <tbody>
                  {liveSync.pitStops.slice(-10).reverse().map((p, i) => (
                    <tr key={i} className="border-b border-rule">
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
