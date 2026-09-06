import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import type { RoundResult, ScheduleRound, Stint, WeatherData } from '../types';
import { CALENDAR } from '../constants';
import TyreCompoundBadge from './ui/TyreCompoundBadge';
import CircuitMap from './ui/CircuitMap';
import SkeletonLoader from './ui/SkeletonLoader';
import DataNotice from './ui/DataNotice';
import { useSchedule, useSeasonResults, scheduleResource, resultsResource } from '../services/seasonStore';
import { findNextRound } from '../services/scheduleService';
import { getStints, getSessionWeather } from '../services/f1Service';
import { fmtShortDate } from '../utils/time';
import { useNow } from '../hooks/useNow';

const COMPOUND_ORDER = ['soft', 'medium', 'hard', 'intermediate', 'inter', 'wet'];

function compoundsFromStints(stints: Stint[]): string[] {
  const set = new Set(stints.map((s) => (s.compound || '').toLowerCase()).filter(Boolean));
  return [...set].sort((a, b) => COMPOUND_ORDER.indexOf(a) - COMPOUND_ORDER.indexOf(b));
}

interface CardProps {
  race: ScheduleRound;
  result?: RoundResult;
  isNext: boolean;
  isDone: boolean;
}

function RaceCard({ race, result, isNext, isDone }: CardProps) {
  const [open, setOpen] = useState(false);
  const [compounds, setCompounds] = useState<string[] | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const borderClass = isNext ? 'border-racing' : isDone ? 'border-rule' : 'border-rule';
  const raceSessionKey = race.sessions.find((s) => s.name === 'Race' && s.sessionKey)?.sessionKey;

  // Tyre compounds and conditions come from OpenF1 for the race session, fetched
  // only when the card is opened so a full calendar does not fan out 22 calls.
  useEffect(() => {
    if (!open || !raceSessionKey || compounds !== null) return;
    let cancelled = false;
    (async () => {
      const [stints, w] = await Promise.all([getStints(raceSessionKey), getSessionWeather(raceSessionKey)]);
      if (cancelled) return;
      setCompounds(compoundsFromStints(stints));
      setWeather(w);
    })();
    return () => { cancelled = true; };
  }, [open, raceSessionKey, compounds]);

  const canOpen = isDone && !!result;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      className={`border-2 ${borderClass} bg-paper-2 card-lift`}
    >
      <button
        onClick={() => canOpen && setOpen(!open)}
        className="w-full text-left p-4 flex items-start justify-between gap-3"
        aria-expanded={canOpen ? open : undefined}
        aria-controls={canOpen ? `race-${race.round}` : undefined}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="label-mono">R{String(race.round).padStart(2, '0')}</span>
            <span className="text-2xl" aria-hidden="true">{race.flag}</span>
            <span className="label-mono text-ink-2">{fmtShortDate(race.date)}</span>
            {race.isSprint && <span className="label-mono border border-rule px-1.5 py-0.5">SPRINT</span>}
            {isNext && <span className="label-mono bg-racing-fill text-white px-2 py-0.5">NEXT</span>}
            {isDone && <span className="label-mono text-ink-3">COMPLETED</span>}
          </div>
          <h3 className="font-serif text-lg leading-tight truncate">{race.name}</h3>
          <p className="text-xs text-ink-2 truncate">{race.circuit}{race.location ? ` · ${race.location}` : ''}</p>
          {isDone && result?.winner && (
            <p className="label-mono mt-2 text-ink">WINNER · {result.winner.toUpperCase()}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <CircuitMap circuitId={race.circuitId} label={race.country} />
          {canOpen && <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />}
        </div>
      </button>

      <AnimatePresence>
        {canOpen && open && result && (
          <motion.div
            id={`race-${race.round}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-rule"
          >
            <div className="p-4 space-y-3">
              <div>
                <div className="label-mono mb-2">PODIUM</div>
                <div className="space-y-1.5">
                  {result.podium.map((p, i) => (
                    <div key={p.code} className="flex items-center gap-3 font-mono text-sm">
                      <span className="text-ink-3 w-6">P{i + 1}</span>
                      <span className="font-bold w-12">{p.code}</span>
                      <span className="text-ink-2 flex-1 truncate">{p.team}</span>
                      <span className="text-ink-3 tabular-nums">{i === 0 ? (result.winnerTime || p.gap) : p.gap}</span>
                    </div>
                  ))}
                </div>
              </div>
              {result.fastestLap && (
                <div className="border-t border-rule pt-2">
                  <div className="label-mono mb-1">FASTEST LAP</div>
                  <div className="font-mono text-sm">{result.fastestLap.code} · {result.fastestLap.time}</div>
                </div>
              )}
              {(race.laps || race.distance) && (
                <div className="border-t border-rule pt-2 label-mono">
                  {race.laps ? `${race.laps} LAPS` : ''}{race.laps && race.distance ? ' · ' : ''}{race.distance?.toUpperCase() || ''}
                </div>
              )}
              {raceSessionKey && (
                <div className="border-t border-rule pt-2">
                  <div className="label-mono mb-1">TYRE COMPOUNDS</div>
                  {compounds === null ? (
                    <SkeletonLoader type="bar" width="80px" />
                  ) : compounds.length ? (
                    <div className="flex gap-2">
                      {compounds.map((c) => <TyreCompoundBadge key={c} compound={c} />)}
                    </div>
                  ) : (
                    <div className="label-mono text-ink-3">NO STINT DATA</div>
                  )}
                </div>
              )}
              {weather && (
                <div className="border-t border-rule pt-2 label-mono">
                  CONDITIONS · {weather.rainfall > 0 ? 'WET' : 'DRY'} · AIR {Math.round(weather.air_temperature)}°C · TRACK {Math.round(weather.track_temperature)}°C
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

// Static fallback rounds so the calendar still renders when every proxy fails.
const STATIC_ROUNDS: ScheduleRound[] = CALENDAR.map((c) => ({
  ...c,
  name: `${c.country} Grand Prix`,
  isSprint: false,
  sessions: [],
}));

export default function SeasonCalendar() {
  const schedule = useSchedule();
  const results = useSeasonResults();
  const now = useNow(60_000);

  const rounds = schedule.data ?? (schedule.status === 'unavailable' ? STATIC_ROUNDS : null);
  const resultsByRound = useMemo(() => {
    const m = new Map<number, RoundResult>();
    for (const r of results.data || []) m.set(r.round, r);
    return m;
  }, [results.data]);
  const next = rounds ? findNextRound(rounds, now) : null;

  return (
    <section id="calendar" className="px-6 sm:px-10 py-10 scroll-mt-14" aria-labelledby="calendar-heading">
      <span className="section-label">S 01 // 2026 SEASON</span>
      <h2 id="calendar-heading" className="font-serif text-3xl mt-3 mb-6">Season Calendar</h2>
      <DataNotice
        status={schedule.status}
        fetchedAt={schedule.fetchedAt}
        snapshot={schedule.status === 'unavailable'}
        unavailableMessage="Schedule unavailable. Retrying in a minute."
        onRetry={() => scheduleResource.load(true)}
        className="mb-3"
      />
      {schedule.status !== 'unavailable' && (
        <DataNotice
          status={results.status}
          fetchedAt={results.fetchedAt}
          unavailableMessage="Race results unavailable. Completed rounds show without winners. Retrying in a minute."
          onRetry={() => resultsResource.load(true)}
          className="mb-3"
        />
      )}
      {!rounds ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonLoader key={i} type="card" height="140px" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rounds.map((r) => {
            const result = resultsByRound.get(r.round);
            const raceEnd = r.sessions.find((s) => s.name === 'Race')?.dateEnd;
            const isDone = !!result || (!!raceEnd && new Date(raceEnd).getTime() < now && next?.round !== r.round);
            return (
              <RaceCard
                key={r.round}
                race={r}
                result={result}
                isNext={next?.round === r.round}
                isDone={isDone}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
