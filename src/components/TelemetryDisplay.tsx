import { useEffect, useMemo, useState } from 'react';
import { getLiveTelemetry, getSessionLaps } from '../services/f1Service';
import { useDrivers, useSchedule } from '../services/seasonStore';
import { findLiveSession, findLastFinishedSession } from '../services/scheduleService';
import { DRIVER_NUMBER_MAP } from '../constants';
import { useNow } from '../hooks/useNow';
import type { TelemetryData } from '../types';
import SkeletonLoader from './ui/SkeletonLoader';

interface BestLap { id: string; code: string; name: string; team: string; color: string; lap: number; lapNumber: number }

function fmtLap(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  return `${m}:${s.toFixed(3).padStart(6, '0')}`;
}

// Live car data only while a session is in its live window. Outside that
// window the section shows the last session's best lap per driver from the
// laps feed. Nothing here is simulated: with no data the cells read "--".
export default function TelemetryDisplay() {
  const now = useNow(30_000);
  const schedule = useSchedule();
  const { drivers, status: driversStatus } = useDrivers();
  const live = schedule.data ? findLiveSession(schedule.data, now) : null;
  const last = schedule.data ? findLastFinishedSession(schedule.data, now) : null;
  const liveKey = live?.session.sessionKey ?? null;
  const lastKey = last?.session.sessionKey ?? null;

  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [driverId, setDriverId] = useState<string>('');
  const driver = drivers.find((d) => d.id === driverId) || drivers[0];
  const driverNumber = driver?.number;

  // Live car data: poll once a second while visible and a session is live.
  useEffect(() => {
    if (!liveKey || !driverNumber) { setTelemetry(null); return; }
    let cancelled = false;
    const tick = async () => {
      const data = await getLiveTelemetry(driverNumber);
      if (!cancelled) setTelemetry(data);
    };
    tick();
    let interval: ReturnType<typeof setInterval> | null = null;
    const start = () => { if (interval) clearInterval(interval); interval = setInterval(tick, 1000); };
    const onVis = () => {
      if (document.hidden) { if (interval) { clearInterval(interval); interval = null; } }
      else start();
    };
    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [liveKey, driverNumber]);

  // Last session best laps: one laps call for the whole session, computed per driver.
  const [bestLaps, setBestLaps] = useState<BestLap[] | null>(null);
  const [lapsStatus, setLapsStatus] = useState<'idle' | 'loading' | 'ready' | 'unavailable'>('idle');
  const [lapsAttempt, setLapsAttempt] = useState(0);
  useEffect(() => {
    if (liveKey || !lastKey || driversStatus === 'loading') return;
    let cancelled = false;
    setLapsStatus('loading');
    (async () => {
      const laps = await getSessionLaps(lastKey);
      if (cancelled) return;
      if (!laps) { setLapsStatus('unavailable'); return; }
      const best = new Map<number, { lap: number; lapNumber: number }>();
      for (const l of laps) {
        if (!l.lap_duration || l.is_pit_out_lap) continue;
        const cur = best.get(l.driver_number);
        if (!cur || l.lap_duration < cur.lap) best.set(l.driver_number, { lap: l.lap_duration, lapNumber: l.lap_number });
      }
      const rows: BestLap[] = [];
      for (const [num, b] of best) {
        const id = DRIVER_NUMBER_MAP[num];
        const d = drivers.find((x) => x.id === id);
        rows.push({
          id: id || String(num),
          code: d?.code || `#${num}`,
          name: d?.name || `Car ${num}`,
          team: d?.team || '',
          color: d?.color || 'var(--color-ink-3)',
          lap: b.lap,
          lapNumber: b.lapNumber,
        });
      }
      rows.sort((a, b) => a.lap - b.lap);
      setBestLaps(rows);
      setLapsStatus('ready');
    })();
    return () => { cancelled = true; };
    // drivers identity is stable per standings bundle; re-run only when the session or attempt changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveKey, lastKey, driversStatus, lapsAttempt]);

  const fastest = useMemo(() => bestLaps?.[0]?.lap ?? null, [bestLaps]);

  return (
    <section id="telemetry" className="px-6 sm:px-10 py-6 scroll-mt-14" aria-labelledby="telemetry-heading">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <span className="section-label">S 05 // LIVE TELEMETRY</span>
          <h2 id="telemetry-heading" className="font-serif text-2xl mt-2">
            {live ? 'Telemetry Stream' : 'Last session'}
          </h2>
          {live ? (
            <p className="label-mono mt-1 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-racing rounded-full pulse-dot" aria-hidden="true" />
              LIVE · {live.session.name.toUpperCase()} · {live.round.name.toUpperCase()}
            </p>
          ) : last ? (
            <p className="label-mono mt-1">{last.session.name.toUpperCase()} · {last.round.name.toUpperCase()} · BEST LAP PER DRIVER</p>
          ) : null}
        </div>
        {live && (
          <select
            value={driver?.id ?? ''}
            onChange={(e) => setDriverId(e.target.value)}
            className="bg-paper-2 border border-rule px-3 py-2 font-mono text-xs"
            aria-label="Select driver"
          >
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>{d.code} · {d.name}</option>
            ))}
          </select>
        )}
      </div>

      {live ? (
        <>
          <div className="border-2 border-ink bg-paper-2 p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="label-mono">SPEED</div>
              <div className="font-mono text-5xl tabular-nums font-bold mt-1">
                {telemetry?.speed ?? '---'}
                <span className="text-base text-ink-3 ml-1">KM/H</span>
              </div>
            </div>
            <div>
              <div className="label-mono">GEAR</div>
              <div className="font-mono text-5xl tabular-nums font-bold mt-1">{telemetry?.gear ?? '-'}</div>
            </div>
            <div>
              <div className="label-mono mb-1">RPM</div>
              <div className="font-mono text-2xl tabular-nums">{telemetry?.rpm ?? '----'}</div>
              <div className="h-2 bg-paper-3 mt-1">
                <div className="h-full bg-racing transition-all duration-200" style={{ width: `${Math.min(100, ((telemetry?.rpm ?? 0) / 13000) * 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="label-mono">DRS</div>
              <div className={`font-mono text-2xl font-bold mt-1 ${telemetry?.drs ? 'text-gain' : 'text-ink-3'}`}>
                {telemetry ? (telemetry.drs ? 'OPEN' : 'CLOSED') : '--'}
              </div>
            </div>
            <div className="col-span-2">
              <div className="label-mono mb-1">THROTTLE</div>
              <div className="h-3 bg-paper-3">
                <div className="h-full bg-gain transition-all duration-200" style={{ width: `${telemetry?.throttle ?? 0}%` }} />
              </div>
            </div>
            <div className="col-span-2">
              <div className="label-mono mb-1">BRAKE</div>
              <div className="h-3 bg-paper-3">
                <div className="h-full bg-racing transition-all duration-200" style={{ width: `${telemetry?.brake ?? 0}%` }} />
              </div>
            </div>
          </div>
          {!telemetry && (
            <div className="border border-dashed border-rule p-3 mt-3 font-mono text-sm" role="status">
              Waiting for car data from OpenF1. Values appear as soon as the feed delivers them.
            </div>
          )}
        </>
      ) : (
        <div className="border-2 border-ink bg-paper-2">
          {!schedule.data ? (
            <div className="p-4 font-mono text-sm" role="status" aria-busy={schedule.status === 'loading'}>
              {schedule.status === 'loading' ? <SkeletonLoader type="row" count={5} /> : 'Session data unavailable. Retrying in a minute.'}
            </div>
          ) : !lastKey ? (
            <div className="p-4 font-mono text-sm" role="status">No completed session with lap data yet this season.</div>
          ) : lapsStatus === 'loading' || lapsStatus === 'idle' ? (
            <div className="p-4" aria-busy="true"><SkeletonLoader type="row" count={8} /></div>
          ) : lapsStatus === 'unavailable' ? (
            <div className="p-4 flex items-center justify-between gap-3 flex-wrap font-mono text-sm" role="status">
              <span>Lap data unavailable. Retrying in a minute.</span>
              <button onClick={() => setLapsAttempt((n) => n + 1)} className="bg-paper-3 border border-rule px-3 py-1.5 text-xs btn-press hover:border-ink">RETRY NOW</button>
            </div>
          ) : bestLaps && bestLaps.length ? (
            <ol className="divide-y divide-rule" aria-label="Best lap per driver">
              <li className="grid grid-cols-[36px_4px_60px_1fr_90px_90px] gap-2 px-3 py-2 label-mono">
                <span>POS</span><span /><span>CODE</span><span>DRIVER</span><span className="text-right">BEST LAP</span><span className="text-right">GAP</span>
              </li>
              {bestLaps.map((b, i) => (
                <li key={b.id} className="grid grid-cols-[36px_4px_60px_1fr_90px_90px] gap-2 px-3 py-2 items-center text-sm hover-bar">
                  <span className="font-mono font-bold tabular-nums">{i + 1}</span>
                  <span className="h-6 w-1" style={{ background: b.color }} aria-hidden="true" />
                  <span className="font-mono font-bold">{b.code}</span>
                  <span className="truncate">{b.name}<span className="hidden sm:inline text-ink-2 text-xs"> · {b.team}</span></span>
                  <span className="font-mono tabular-nums text-right">{fmtLap(b.lap)}</span>
                  <span className="font-mono tabular-nums text-right text-ink-2">{fastest !== null && i > 0 ? `+${(b.lap - fastest).toFixed(3)}` : 'L' + b.lapNumber}</span>
                </li>
              ))}
            </ol>
          ) : (
            <div className="p-4 font-mono text-sm" role="status">No timed laps were recorded in that session.</div>
          )}
        </div>
      )}
    </section>
  );
}
