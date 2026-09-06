import { proxyFetch } from './proxyClient';
import { DRIVER_CODE_MAP } from '../constants';

// Race predictions from the open-source F1-model by Deepan Alve
// (https://github.com/deepan-alve/F1-model, GPL-3.0-or-later). The repo
// publishes data/results/upcoming_prediction.json after qualifying each
// Saturday. Fetched through github-raw-proxy with a six hour cache and shown
// with a credit line, as the project's NOTICE asks.

export const MODEL_REPO_URL = 'https://github.com/deepan-alve/F1-model';
export const MODEL_AUTHOR = 'Deepan Alve';
const PROXY = '/.netlify/functions/github-raw-proxy';
const PATH = 'deepan-alve/F1-model/main/data/results/upcoming_prediction.json';

interface RawPrediction {
  year?: number;
  round?: number;
  race_name?: string;
  race_date_utc?: string;
  predictions?: {
    Abbreviation: string;
    TeamName?: string;
    PredictedPosition: number;
    Confidence?: number;
    DNFProbability?: number;
  }[];
}

export interface PredictionRow {
  position: number;
  code: string;
  id: string;
  team: string;
  confidence: number | null; // percent
  dnfProbability: number | null; // 0 to 1
}

export interface Prediction {
  year: number;
  round: number;
  raceName: string;
  raceDateUtc: string | null;
  rows: PredictionRow[];
  /** Mean of the stated confidence across the predicted top five, percent. */
  topFiveConfidence: number | null;
}

export async function getPrediction(): Promise<Prediction | null> {
  const params = new URLSearchParams({ path: PATH });
  const raw = await proxyFetch<RawPrediction | null>(`${PROXY}?${params.toString()}`, 'github:prediction');
  if (!raw || !Array.isArray(raw.predictions) || !raw.round || !raw.year) return null;

  const rows: PredictionRow[] = raw.predictions
    .filter((p) => p && typeof p.PredictedPosition === 'number' && typeof p.Abbreviation === 'string')
    .map((p) => {
      const code = p.Abbreviation.toUpperCase();
      return {
        position: p.PredictedPosition,
        code,
        id: DRIVER_CODE_MAP[code] || code.toLowerCase(),
        team: p.TeamName || '',
        confidence: typeof p.Confidence === 'number' ? Math.round(p.Confidence * 10) / 10 : null,
        dnfProbability: typeof p.DNFProbability === 'number' ? p.DNFProbability : null,
      };
    })
    .sort((a, b) => a.position - b.position);

  const top = rows.slice(0, 5).map((r) => r.confidence).filter((c): c is number => c !== null);
  return {
    year: raw.year,
    round: raw.round,
    raceName: raw.race_name || '',
    raceDateUtc: raw.race_date_utc || null,
    rows,
    topFiveConfidence: top.length ? Math.round((top.reduce((a, b) => a + b, 0) / top.length) * 10) / 10 : null,
  };
}
