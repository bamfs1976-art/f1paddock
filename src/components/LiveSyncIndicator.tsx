import { useEffect, useState } from 'react';
import type { LiveSyncState } from '../types';
import { fmtClock } from '../utils/time';

interface Props {
  state: LiveSyncState | null;
}

function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString('en-GB', { hour12: false });
}

export default function LiveSyncIndicator({ state }: Props) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!state) return null;
  const age = Math.floor((now - state.timestamp) / 1000);
  const stale = !!state.stale;
  return (
    <div className="hidden md:block fixed bottom-6 left-6 z-30 bg-paper-2 border border-rule px-3 py-2 overflow-hidden" role="status">
      {!stale && (
        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none" aria-hidden="true">
          <div className="scan-sweep absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-racing/15 to-transparent" />
        </div>
      )}
      <div className="relative flex items-center gap-3 font-mono text-xs">
        <span className={`w-2 h-2 rounded-full ${stale ? 'bg-ink-3' : 'bg-gain pulse-dot'}`} aria-hidden="true" />
        <span className="text-ink font-bold">{stale ? 'STALE LINK' : 'LIVE LINK'}</span>
        {stale && state.dataTimestamp ? (
          <span className="text-ink-2">DATA FROM {fmtClock(state.dataTimestamp)}</span>
        ) : (
          <span className="text-ink-2">SYNC {fmtTime(state.timestamp)}</span>
        )}
        <span className="text-ink-3">·</span>
        <span className="text-ink-2">{state.latency}ms</span>
        <span className="text-ink-3">·</span>
        <span className="text-ink-2">{age}s ago</span>
      </div>
    </div>
  );
}
