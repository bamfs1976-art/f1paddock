import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { fetchPaddockIntel } from '../services/aiService';
import type { PaddockIntelData, AnalysisItem } from '../types';
import SkeletonLoader from './ui/SkeletonLoader';
import { fmtClock } from '../utils/time';

const CACHE_KEY = 'f1_paddock_intel_cache';
const CACHE_TTL = 30 * 60 * 1000;

type Status = 'loading' | 'fresh' | 'stale' | 'unavailable';

function readCache(): { data: PaddockIntelData; ts: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.data?.analysis ? parsed : null;
  } catch {
    return null;
  }
}

export default function PaddockIntel() {
  const [data, setData] = useState<PaddockIntelData | null>(null);
  const [generatedAt, setGeneratedAt] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setData(cached.data);
      setGeneratedAt(cached.ts);
      if (Date.now() - cached.ts < CACHE_TTL) {
        setStatus('fresh');
        return;
      }
      setStatus('stale');
    }
    regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Regenerate keeps whatever is on screen until a fresh response arrives.
  // On failure the last cached response stays visible with its timestamp.
  const regenerate = async () => {
    setStatus('loading');
    const fresh = await fetchPaddockIntel();
    if (fresh?.analysis) {
      const ts = Date.now();
      setData(fresh);
      setGeneratedAt(ts);
      setStatus('fresh');
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data: fresh, ts })); } catch { /* quota */ }
      window.dispatchEvent(new CustomEvent('f1_paddock_intel_updated'));
      return;
    }
    const cached = readCache();
    if (cached) {
      setData(cached.data);
      setGeneratedAt(cached.ts);
      setStatus('stale');
    } else {
      setStatus('unavailable');
    }
  };

  const loading = status === 'loading' && !data;
  const analysis: AnalysisItem[] = data?.analysis || [];
  const intel = data?.paddockIntel || '';
  const racePreview = data?.racePreview;

  return (
    <section id="intel" className="px-6 sm:px-10 py-10 scroll-mt-14" aria-labelledby="intel-heading">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <span className="section-label">S 07 // PADDOCK INTEL</span>
          <h2 id="intel-heading" className="font-serif text-3xl mt-3">Paddock Intelligence</h2>
          {status === 'stale' && generatedAt && (
            <p className="label-mono mt-2" role="status">SHOWING ANALYSIS FROM {fmtClock(generatedAt)} · REGENERATION FAILED</p>
          )}
          {status === 'fresh' && generatedAt && (
            <p className="label-mono mt-2">GENERATED {fmtClock(generatedAt)}</p>
          )}
        </div>
        <button
          onClick={regenerate}
          disabled={status === 'loading'}
          className="bg-paper-2 border border-rule px-3 py-2 font-mono text-xs btn-press flex items-center gap-2 disabled:opacity-50 hover:border-ink"
          aria-label="Regenerate analysis"
        >
          <RefreshCw size={14} className={status === 'loading' ? 'animate-spin' : ''} aria-hidden="true" />
          REGENERATE ANALYSIS
        </button>
      </div>

      {status === 'unavailable' && (
        <div className="border border-dashed border-rule bg-paper-2 p-4 mb-6 flex items-center justify-between gap-3 flex-wrap" role="status">
          <span className="font-mono text-sm">Analysis unavailable. The generator did not respond and nothing is cached on this device.</span>
          <button onClick={regenerate} className="bg-paper-3 border border-rule px-3 py-1.5 font-mono text-xs btn-press hover:border-ink">REGENERATE ANALYSIS</button>
        </div>
      )}

      <div className="border-l-2 border-racing pl-4 py-3 mb-6 bg-paper-2">
        <div className="label-mono mb-2">STRATEGIC INTELLIGENCE SUMMARY</div>
        {loading ? <SkeletonLoader type="text" count={3} /> : intel ? (
          <p className="font-serif italic text-base leading-relaxed">{intel}</p>
        ) : (
          <p className="font-mono text-sm text-ink-2">No summary yet.</p>
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
              <article key={i} className="border border-rule bg-paper-2 p-4 space-y-2" aria-busy="true">
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
                  className={`border ${lead ? 'border-racing md:col-span-2' : 'border-rule'} bg-paper-2 p-4 card-lift`}
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : item.id)}
                    aria-expanded={isOpen}
                    className="text-left w-full"
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
                  </button>
                </article>
              );
            })}
      </div>
    </section>
  );
}
