import { useEffect, useState } from 'react';
import type { LiveSyncState } from '../types';

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
  return (
    <div className="hidden md:block fixed bottom-6 left-6 z-30 bg-paper-2 border border-rule px-3 py-2 overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
        <div className="scan-sweep absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-racing/15 to-transparent" />
      </div>
      <div className="relative flex items-center gap-3 font-mono text-xs">
        <span className="w-2 h-2 bg-gain rounded-full pulse-dot" aria-hidden="true" />
        <span className="text-ink font-bold">LIVE LINK</span>
        <span className="text-ink-2">SYNC {fmtTime(state.timestamp)}</span>
        <span className="text-ink-3">·</span>
        <span className="text-ink-2">{state.latency}ms</span>
        <span className="text-ink-3">·</span>
        <span className="text-ink-2">{age}s ago</span>
      </div>
    </div>
  );
}
