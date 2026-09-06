import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { getPrediction, MODEL_REPO_URL, MODEL_AUTHOR, type Prediction } from '../services/predictionService';
import { useDrivers } from '../services/seasonStore';
import { SEASON } from '../services/standingsService';
import SkeletonLoader from './ui/SkeletonLoader';

interface Props {
  /** Round number of the next Grand Prix. The card hides itself for any other round. */
  round: number;
}

// Predicted top five for the next race from the credited open-source model.
// Renders nothing when no prediction exists for the current round, so a
// stale Saturday file never appears under the wrong Grand Prix.
export default function ModelViewCard({ round }: Props) {
  const [prediction, setPrediction] = useState<Prediction | null | undefined>(undefined);
  const { drivers } = useDrivers();

  useEffect(() => {
    let cancelled = false;
    getPrediction()
      .then((p) => { if (!cancelled) setPrediction(p); })
      .catch(() => { if (!cancelled) setPrediction(null); });
    return () => { cancelled = true; };
  }, [round]);

  if (prediction === undefined) {
    return (
      <div className="p-4 sm:p-6 border-t border-rule" aria-busy="true">
        <div className="label-mono mb-3">MODEL VIEW</div>
        <SkeletonLoader type="row" count={3} />
      </div>
    );
  }
  if (!prediction || prediction.round !== round || prediction.year !== SEASON) return null;

  const top = prediction.rows.slice(0, 5);

  return (
    <div className="p-4 sm:p-6 border-t border-rule">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <div className="label-mono">MODEL VIEW · PREDICTED TOP FIVE · {prediction.raceName.toUpperCase()}</div>
        {prediction.topFiveConfidence !== null && (
          <div className="label-mono">MODEL CONFIDENCE · {prediction.topFiveConfidence}%</div>
        )}
      </div>
      <ol className="border border-rule divide-y divide-rule" aria-label="Predicted finishing order">
        {top.map((r) => {
          const d = drivers.find((x) => x.id === r.id);
          return (
            <li key={r.code} className="grid grid-cols-[36px_4px_60px_1fr_80px] gap-2 px-3 py-2 items-center text-sm">
              <span className="font-mono font-bold tabular-nums">P{r.position}</span>
              <span className="h-6 w-1" style={{ background: d?.color || 'var(--color-rule)' }} aria-hidden="true" />
              <span className="font-mono font-bold">{r.code}</span>
              <span className="truncate">{d?.name || r.code}<span className="hidden sm:inline text-ink-2 text-xs"> · {d?.team || r.team}</span></span>
              <span className="font-mono tabular-nums text-right text-ink-2">{r.confidence !== null ? `${r.confidence}%` : '--'}</span>
            </li>
          );
        })}
      </ol>
      <p className="text-xs text-ink-2 mt-3 leading-relaxed">
        Prediction by the open-source{' '}
        <a href={MODEL_REPO_URL} target="_blank" rel="noopener noreferrer" className="underline decoration-racing decoration-2 underline-offset-2 text-ink inline-flex items-center gap-1">
          F1-model <ExternalLink size={12} aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span>
        </a>{' '}
        by {MODEL_AUTHOR}, a LightGBM ranker with adaptive Elo ratings, released under GPL-3.0. Confidence is the model's own figure per driver. Not affiliated with this site.
      </p>
    </div>
  );
}
