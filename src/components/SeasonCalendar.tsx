import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { CALENDAR } from '../constants';
import type { Race } from '../types';
import TyreCompoundBadge from './ui/TyreCompoundBadge';
import CircuitMap from './ui/CircuitMap';

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase();
}

function RaceCard({ race }: { race: Race }) {
  const [open, setOpen] = useState(false);
  const isDone = race.isDone;
  const isNext = race.isNext;
  const borderClass = isNext ? 'border-racing' : isDone ? 'border-ink-3' : 'border-ink-3/40';

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
        onClick={() => isDone && setOpen(!open)}
        className="w-full text-left p-4 flex items-start justify-between gap-3"
        aria-expanded={isDone ? open : undefined}
        aria-controls={isDone ? `race-${race.round}` : undefined}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="label-mono">R{String(race.round).padStart(2, '0')}</span>
            <span className="text-2xl" aria-hidden="true">{race.flag}</span>
            <span className="label-mono text-ink-2">{fmtDate(race.date)}</span>
            {isNext && <span className="label-mono bg-racing text-white px-2 py-0.5">NEXT</span>}
            {isDone && <span className="label-mono text-ink-3">COMPLETED</span>}
          </div>
          <h3 className="font-serif text-lg leading-tight truncate">{race.country}</h3>
          <p className="text-xs text-ink-2 truncate">{race.circuit}</p>
          {isDone && race.winner && (
            <p className="label-mono mt-2 text-ink">WINNER · {race.winner.toUpperCase()}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <CircuitMap circuitId={race.circuitId} label={race.country} />
          {isDone && <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />}
        </div>
      </button>

      <AnimatePresence>
        {isDone && open && (
          <motion.div
            id={`race-${race.round}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-ink-3"
          >
            <div className="p-4 space-y-3">
              <div>
                <div className="label-mono mb-2">PODIUM</div>
                <div className="space-y-1.5">
                  {race.podiumDetailed?.map((p, i) => (
                    <div key={p.driver} className="flex items-center gap-3 font-mono text-sm">
                      <span className="text-ink-3 w-6">P{i + 1}</span>
                      <span className="font-bold w-12">{p.driver}</span>
                      <span className="text-ink-2 flex-1 truncate">{p.team}</span>
                      <span className="text-ink-3 tabular-nums">{p.gap}</span>
                    </div>
                  ))}
                </div>
              </div>
              {race.fastestLap && (
                <div className="border-t border-ink-3/40 pt-2">
                  <div className="label-mono mb-1">FASTEST LAP</div>
                  <div className="font-mono text-sm">{race.fastestLap.driver} · {race.fastestLap.time}</div>
                </div>
              )}
              {race.tyreCompounds && (
                <div className="border-t border-ink-3/40 pt-2">
                  <div className="label-mono mb-1">TYRE COMPOUNDS</div>
                  <div className="flex gap-2">
                    {race.tyreCompounds.map((c) => <TyreCompoundBadge key={c} compound={c} />)}
                  </div>
                </div>
              )}
              {race.weather && (
                <div className="border-t border-ink-3/40 pt-2 label-mono">
                  CONDITIONS · {race.weather.toUpperCase()}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

export default function SeasonCalendar() {
  return (
    <section className="px-6 sm:px-10 py-10" aria-labelledby="calendar-heading">
      <span className="section-label">S 03 // 2026 SEASON</span>
      <h2 id="calendar-heading" className="font-serif text-3xl mt-3 mb-6">Season Calendar</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CALENDAR.map((r) => <RaceCard key={r.round} race={r} />)}
      </div>
    </section>
  );
}
