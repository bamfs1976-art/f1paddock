import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { fetchDriverAnalysis } from '../services/aiService';
import type { DriverAnalysis } from '../types';
import { useDrivers } from '../services/seasonStore';
import SkeletonLoader from './ui/SkeletonLoader';

interface Props {
  codeA: string;
  codeB: string;
  onClose: () => void;
}

function StatBar({
  label, valueA, valueB, colorA, colorB,
}: { label: string; valueA: number; valueB: number; colorA: string; colorB: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
      <div className="flex justify-end items-center gap-2">
        <span className="font-mono text-sm tabular-nums">{valueA.toFixed(1)}</span>
        <div className="h-3 bg-paper-3 relative w-full max-w-[160px]">
          <div className="absolute inset-y-0 right-0" style={{ width: `${valueA * 10}%`, background: colorA }} />
        </div>
      </div>
      <span className="label-mono whitespace-nowrap">{label}</span>
      <div className="flex items-center gap-2 w-full">
        <div className="h-3 bg-paper-3 relative w-full max-w-[160px]">
          <div className="absolute inset-y-0 left-0" style={{ width: `${valueB * 10}%`, background: colorB }} />
        </div>
        <span className="font-mono text-sm tabular-nums">{valueB.toFixed(1)}</span>
      </div>
    </div>
  );
}

export default function DriverComparison({ codeA, codeB, onClose }: Props) {
  const [analysis, setAnalysis] = useState<DriverAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { drivers: DRIVERS } = useDrivers();

  const driverA = DRIVERS.find((d) => d.code === codeA);
  const driverB = DRIVERS.find((d) => d.code === codeB);

  useEffect(() => {
    closeRef.current?.focus();
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    document.body.style.overflow = 'hidden';
    (async () => {
      const res = await fetchDriverAnalysis(codeA, codeB);
      setAnalysis(res);
      setLoading(false);
    })();
    return () => {
      window.removeEventListener('keydown', handle);
      document.body.style.overflow = '';
    };
  }, [codeA, codeB, onClose]);

  if (!driverA || !driverB) return null;

  const fallback: DriverAnalysis = {
    summary: `Comparing ${driverA.name} (${driverA.team}) and ${driverB.name} (${driverB.team}). AI analysis unavailable — showing static comparison.`,
    paceRating: { driverA: 8 - driverA.pos * 0.1, driverB: 8 - driverB.pos * 0.1 },
    consistencyRating: { driverA: 7.5, driverB: 7.5 },
    tyreManagement: { driverA: 7, driverB: 7 },
    raceCraft: { driverA: 8, driverB: 8 },
    verdict: `Both drivers bring distinct strengths to the grid this season.`,
  };
  const data = analysis || fallback;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-title"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-paper border-2 border-ink max-w-4xl w-full my-8"
      >
        <header className="flex items-center justify-between px-6 py-4 border-b border-ink-3">
          <h2 id="compare-title" className="font-serif text-2xl">
            <span className="label-mono mr-3">TELEMETRY COMPARISON</span>
            {codeA} <span className="text-ink-3">vs</span> {codeB}
          </h2>
          <button ref={closeRef} onClick={onClose} className="p-2 border border-ink-3 btn-press" aria-label="Close comparison">
            <X size={16} aria-hidden="true" />
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          {[driverA, driverB].map((d) => (
            <div key={d.id} className="p-6 border-r border-ink-3 last:border-r-0">
              <div className="h-1 mb-3" style={{ background: d.color }} aria-hidden="true" />
              <div className="label-mono">{d.country} · #{d.number}</div>
              <h3 className="font-serif text-2xl mt-1">{d.name}</h3>
              <p className="text-sm text-ink-2">{d.team}</p>
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="border border-ink-3 p-2"><div className="font-bold">{d.pts}</div><div className="label-mono">PTS</div></div>
                <div className="border border-ink-3 p-2"><div className="font-bold">P{d.pos}</div><div className="label-mono">POS</div></div>
                <div className="border border-ink-3 p-2"><div className="font-bold">{d.careerStats?.wins || 0}</div><div className="label-mono">WINS</div></div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-ink-3 space-y-4">
          {loading ? (
            <>
              <SkeletonLoader type="bar" count={4} />
              <p className="label-mono text-ink-3">ANALYSING TELEMETRY DATA…</p>
            </>
          ) : (
            <>
              <StatBar label="PACE" valueA={data.paceRating.driverA} valueB={data.paceRating.driverB} colorA={driverA.color} colorB={driverB.color} />
              <StatBar label="CONSISTENCY" valueA={data.consistencyRating.driverA} valueB={data.consistencyRating.driverB} colorA={driverA.color} colorB={driverB.color} />
              <StatBar label="TYRE MGMT" valueA={data.tyreManagement.driverA} valueB={data.tyreManagement.driverB} colorA={driverA.color} colorB={driverB.color} />
              <StatBar label="RACE CRAFT" valueA={data.raceCraft.driverA} valueB={data.raceCraft.driverB} colorA={driverA.color} colorB={driverB.color} />
            </>
          )}
        </div>

        {!loading && (
          <div className="p-6 border-t border-ink-3 bg-paper-2">
            <div className="label-mono mb-2">AI VERDICT</div>
            <p className="font-serif italic text-base mb-3">{data.verdict}</p>
            <p className="text-sm text-ink-2 leading-relaxed">{data.summary}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
