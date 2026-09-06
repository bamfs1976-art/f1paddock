import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { fetchPaddockIntel } from '../services/aiService';
import type { PaddockIntelData, AnalysisItem } from '../types';
import SkeletonLoader from './ui/SkeletonLoader';

const CACHE_KEY = 'f1_paddock_intel_cache';
const CACHE_TTL = 30 * 60 * 1000;

export default function PaddockIntel() {
  const [data, setData] = useState<PaddockIntelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    let cached: { data: PaddockIntelData; ts: number } | null = null;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) cached = JSON.parse(raw);
    } catch { /* ignore */ }

    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setData(cached.data);
      setLoading(false);
      return;
    }
    refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    const fresh = await fetchPaddockIntel();
    if (fresh) {
      setData(fresh);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data: fresh, ts: Date.now() })); } catch { /* */ }
    }
    setLoading(false);
  };

  const analysis: AnalysisItem[] = data?.analysis || [];
  const intel = data?.paddockIntel || '';
  const racePreview = data?.racePreview;

  return (
    <section className="px-6 sm:px-10 py-10" aria-labelledby="intel-heading">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <span className="section-label">S 04 // PADDOCK INTEL</span>
          <h2 id="intel-heading" className="font-serif text-3xl mt-3">Paddock Intelligence</h2>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="bg-paper-2 border border-ink-3 px-3 py-2 font-mono text-xs btn-press flex items-center gap-2 disabled:opacity-50"
          aria-label="Refresh paddock intel"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
          REFRESH
        </button>
      </div>

      <div className="border-l-2 border-racing pl-4 py-3 mb-6 bg-paper-2">
        <div className="label-mono mb-2">STRATEGIC INTELLIGENCE SUMMARY</div>
        {loading ? <SkeletonLoader type="text" count={3} /> : intel ? (
          <p className="font-serif italic text-base leading-relaxed">{intel}</p>
        ) : (
          <p className="label-mono text-ink-3">ANALYSIS UNAVAILABLE</p>
        )}
      </div>

      {racePreview && !loading && (
        <div className="border-2 border-ink p-4 mb-6 bg-paper-2">
          <div className="label-mono mb-2">RACE PREVIEW · {racePreview.circuit.toUpperCase()}</div>
          <p className="text-sm mb-3 leading-relaxed">{racePreview.keyStorylines}</p>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div><span className="label-mono">TYRES · </span>{racePreview.tyreExpectation}</div>
            <div><span className="label-mono">WEATHER · </span>{racePreview.weatherOutlook}</div>
          </div>
        </div>
      )}

      <div className="label-mono mb-3">ANALYSIS · GENERATED FROM STANDINGS AND RESULTS, NOT NEWS</div>
      <div className="grid gap-4 md:grid-cols-2">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <article key={i} className="border border-ink-3 bg-paper-2 p-4 space-y-2">
                <SkeletonLoader type="bar" width="60px" />
                <SkeletonLoader type="text" />
                <SkeletonLoader type="text" count={3} />
              </article>
            ))
          : analysis.map((item) => {
              const isOpen = expanded === item.id;
              const lead = item.type === 'lead';
              return (
                <article
                  key={item.id}
                  className={`border ${lead ? 'border-racing md:col-span-2' : 'border-ink-3'} bg-paper-2 p-4 card-lift cursor-pointer`}
                  onClick={() => setExpanded(isOpen ? null : item.id)}
                >
                  <span className="inline-block label-mono px-2 py-0.5 bg-paper-3 text-ink mb-3">{item.kicker}</span>
                  <h3 className={`font-serif ${lead ? 'text-2xl' : 'text-lg'} leading-tight mb-2`}>{item.headline}</h3>
                  <AnimatePresence initial={false} mode="wait">
                    <motion.p
                      key={isOpen ? 'full' : 'short'}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`text-sm text-ink-2 leading-relaxed ${isOpen ? '' : 'line-clamp-3'}`}
                    >
                      {item.body}
                    </motion.p>
                  </AnimatePresence>
                </article>
              );
            })}
      </div>
    </section>
  );
}
