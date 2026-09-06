import { useEffect, useState } from 'react';
import { fetchPaddockIntel } from '../services/aiService';
import type { TickerItem } from '../types';
import { useDrivers } from '../services/seasonStore';

export default function Ticker() {
  const { drivers } = useDrivers();
  const [items, setItems] = useState<TickerItem[] | null>(null);
  const fallback: TickerItem[] = drivers.slice(0, 8).map((d) => ({
    sym: d.code, val: `${d.pts} PTS`, pts: d.team,
  }));

  useEffect(() => {
    (async () => {
      try {
        const cached = localStorage.getItem('f1_paddock_intel_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.data?.ticker) {
            setItems(parsed.data.ticker);
            return;
          }
        }
        const data = await fetchPaddockIntel();
        if (data?.ticker) setItems(data.ticker);
      } catch { /* fallback */ }
    })();
  }, []);

  const list = items ?? fallback;
  const repeated = [...list, ...list, ...list];

  return (
    <div className="border-y-2 border-ink bg-paper-2 overflow-hidden" aria-label="Live data ticker">
      <div className="flex ticker-scroll whitespace-nowrap py-2">
        {repeated.map((item, i) => (
          <span key={i} className="font-mono text-xs px-4 flex items-center gap-2">
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
