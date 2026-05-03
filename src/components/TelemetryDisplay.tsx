import { useEffect, useState } from 'react';
import { getLiveTelemetry } from '../services/f1Service';
import { DRIVERS } from '../constants';
import type { TelemetryData } from '../types';

export default function TelemetryDisplay() {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [driverId, setDriverId] = useState<string>(DRIVERS[0].id);
  const driver = DRIVERS.find((d) => d.id === driverId)!;

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const data = await getLiveTelemetry(driver.number);
      if (!cancelled) setTelemetry(data);
    };
    tick();
    // Poll faster when tab is visible. Pause when hidden.
    let interval: ReturnType<typeof setInterval> | null = null;
    const startInterval = () => {
      if (interval) clearInterval(interval);
      interval = setInterval(tick, 1000);
    };
    const onVis = () => {
      if (document.hidden) {
        if (interval) { clearInterval(interval); interval = null; }
      } else {
        startInterval();
      }
    };
    if (!document.hidden) startInterval();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [driver.number]);

  return (
    <section className="px-6 sm:px-10 py-6" aria-labelledby="telemetry-heading">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <span className="section-label">S 06 // LIVE TELEMETRY</span>
          <h2 id="telemetry-heading" className="font-serif text-2xl mt-2">Telemetry Stream</h2>
        </div>
        <select
          value={driverId}
          onChange={(e) => setDriverId(e.target.value)}
          className="bg-paper-2 border border-ink-3 px-3 py-2 font-mono text-xs"
          aria-label="Select driver"
        >
          {DRIVERS.map((d) => (
            <option key={d.id} value={d.id}>{d.code} · {d.name}</option>
          ))}
        </select>
      </div>

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
          <div className={`font-mono text-2xl font-bold mt-1 ${telemetry?.drs ? 'text-green-500' : 'text-ink-3'}`}>
            {telemetry?.drs ? 'OPEN' : 'CLOSED'}
          </div>
        </div>
        <div className="col-span-2">
          <div className="label-mono mb-1">THROTTLE</div>
          <div className="h-3 bg-paper-3">
            <div className="h-full bg-green-500 transition-all duration-200" style={{ width: `${telemetry?.throttle ?? 0}%` }} />
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
        <div className="border border-dashed border-ink-3 p-3 mt-3 label-mono text-ink-3">
          NO LIVE SESSION ACTIVE · SHOWING SIMULATED DATA
        </div>
      )}
    </section>
  );
}
