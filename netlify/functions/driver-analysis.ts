import type { Handler } from '@netlify/functions';
import { callClaude, extractJson } from './utils/claude';
import { buildF1Context } from './utils/f1-context';

// Cached for an hour per (last completed round, driver pair). The pair is
// sorted so A vs B and B vs A share one generation.
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 60 * 60 * 1000;
const inFlight = new Map<string, Promise<unknown>>();

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const CODE_RE = /^[A-Z]{3}$/;

const SYSTEM = `You are an expert F1 performance analyst. Compare two drivers based only on their 2026 season standings and results supplied in the context. Write in British English. Be specific with the data points you are given and do not invent lap times, incidents or quotations. Output ONLY valid JSON, no markdown.`;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Missing ANTHROPIC_API_KEY' }) };
  }

  let driverA = 'NOR';
  let driverB = 'VER';
  try {
    const body = JSON.parse(event.body || '{}');
    if (typeof body.driverA === 'string' && CODE_RE.test(body.driverA)) driverA = body.driverA;
    if (typeof body.driverB === 'string' && CODE_RE.test(body.driverB)) driverB = body.driverB;
  } catch { /* keep defaults */ }
  if (driverA === driverB) {
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Pick two different drivers' }) };
  }

  try {
    const ctx = await buildF1Context();
    const pair = [driverA, driverB].sort();
    const key = `round-${ctx.lastCompletedRound}:${pair.join('-')}`;
    const swapped = pair[0] !== driverA;

    // The cached payload is stored A-first in sorted order; swap if the caller asked the other way round.
    const orient = (data: unknown) => {
      if (!swapped || !data || typeof data !== 'object') return data;
      const copy = { ...(data as Record<string, { driverA: number; driverB: number } | string>) };
      for (const k of ['paceRating', 'consistencyRating', 'tyreManagement', 'raceCraft']) {
        const v = copy[k];
        if (v && typeof v === 'object') copy[k] = { driverA: v.driverB, driverB: v.driverA };
      }
      return copy;
    };

    const hit = cache.get(key);
    if (hit && Date.now() - hit.ts < CACHE_TTL) {
      return {
        statusCode: 200,
        headers: { ...JSON_HEADERS, 'X-Cache': 'HIT', 'X-Cache-Timestamp': new Date(hit.ts).toISOString() },
        body: JSON.stringify(orient(hit.data)),
      };
    }

    let job = inFlight.get(key);
    if (!job) {
      const prompt = `${ctx.text}

Compare drivers ${pair[0]} (driverA) and ${pair[1]} (driverB) this ${new Date().getUTCFullYear()} season using only the context above.

Return JSON in this exact shape:
{
  "summary": "150-word factual comparison citing points, positions, wins and podiums from the context",
  "paceRating":         { "driverA": <1-10>, "driverB": <1-10> },
  "consistencyRating":  { "driverA": <1-10>, "driverB": <1-10> },
  "tyreManagement":     { "driverA": <1-10>, "driverB": <1-10> },
  "raceCraft":          { "driverA": <1-10>, "driverB": <1-10> },
  "verdict": "50-word verdict on who has been the stronger driver and why"
}

Where the context does not support a rating, keep both drivers within one point of each other and say so in the summary. Output JSON only.`;
      job = (async () => {
        const text = await callClaude(SYSTEM, prompt, 1500);
        const data = extractJson(text);
        cache.set(key, { data, ts: Date.now() });
        return data;
      })().finally(() => inFlight.delete(key));
      inFlight.set(key, job);
    }
    const data = await job;

    return {
      statusCode: 200,
      headers: { ...JSON_HEADERS, 'X-Cache': 'MISS', 'X-Cache-Timestamp': new Date().toISOString() },
      body: JSON.stringify(orient(data)),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: 'Driver analysis failed', detail: (err as Error).message }),
    };
  }
};
