import { useEffect, useState } from 'react';
import { fetchPaddockIntel } from '../services/aiService';
import type { TickerItem } from '../types';
import { useDrivers } from '../services/seasonStore';

const CACHE_KEY = 'f1_paddock_intel_cache';

function readCachedTicker(): TickerItem[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.data?.ticker) && parsed.data.ticker.length ? parsed.data.ticker : null;
  } catch {
    return null;
  }
}

// The ticker scrolls once on load (one full pass of its content) and stops.
// It scrolls one more pass whenever PaddockIntel publishes new ticker items,
// and pauses under the pointer or keyboard focus.
export default function Ticker() {
  const { drivers } = useDrivers();
  const [items, setItems] = useState<TickerItem[] | null>(() => readCachedTicker());
  const [pass, setPass] = useState(0);

  useEffect(() => {
    if (items) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPaddockIntel();
        if (!cancelled && data?.ticker?.length) setItems(data.ticker);
      } catch { /* fallback to standings */ }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // PaddockIntel regenerated: swap in the new items and run one more pass.
  useEffect(() => {
    const onUpdate = () => {
      const next = readCachedTicker();
      if (next) {
        setItems(next);
        setPass((p) => p + 1);
      }
    };
    window.addEventListener('f1_paddock_intel_updated', onUpdate);
    return () => window.removeEventListener('f1_paddock_intel_updated', onUpdate);
  }, []);

  const list = items ?? drivers.slice(0, 8).map((d) => ({ sym: d.code, val: `${d.pts} PTS`, pts: d.team }));
  // Two copies: the keyframe moves by 50 percent, which is exactly one pass of the list.
  const repeated = [...list, ...list];

  return (
    <div
      className="border-y-2 border-ink bg-paper-2 overflow-hidden"
      role="marquee"
      aria-label="Season ticker. Pauses while focused."
      tabIndex={0}
    >
      <div key={`${pass}-${list.length}`} className="flex ticker-once whitespace-nowrap py-2">
        {repeated.map((item, i) => (
          <span key={i} className="font-mono text-xs px-4 flex items-center gap-2" aria-hidden={i >= list.length ? true : undefined}>
            <span className="inline-block w-1.5 h-1.5 bg-racing" aria-hidden="true" />
            <span className="font-bold">{item.sym}</span>
            <span>{item.val}</span>
            <span className="text-ink-3">·</span>
            <span className="text-ink-2">{item.pts}</span>
            <span className="text-ink-3 ml-4">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}
