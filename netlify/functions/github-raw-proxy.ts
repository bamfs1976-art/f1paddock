import type { Handler, HandlerResponse } from '@netlify/functions';

// Read-through cache for a short allow-list of raw GitHub files. Used for the
// race prediction JSON published by deepan-alve/F1-model (GPL-3.0-or-later,
// credited in the UI) after qualifying each Saturday. Six hour TTL, two day
// stale window: the file changes once a week at most.
const cache = new Map<string, { data: unknown; ts: number }>();
const TTL_MS = 6 * 60 * 60_000;
const STALE_TTL_MS = 48 * 60 * 60_000;

const BASE = 'https://raw.githubusercontent.com/';
const ALLOWED = new Set([
  'deepan-alve/F1-model/main/data/results/upcoming_prediction.json',
]);

const JSON_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, max-age=900',
};

function respond(status: number, body: unknown, extra: Record<string, string> = {}): HandlerResponse {
  return { statusCode: status, headers: { ...JSON_HEADERS, ...extra }, body: JSON.stringify(body) };
}

export const handler: Handler = async (event): Promise<HandlerResponse> => {
  const path = event.queryStringParameters?.path || '';
  if (!ALLOWED.has(path)) {
    return respond(400, { error: 'Invalid or disallowed path', allowed: [...ALLOWED] });
  }

  const url = `${BASE}${path}`;
  const now = Date.now();
  const cached = cache.get(url);
  if (cached && now - cached.ts < TTL_MS) {
    return respond(200, cached.data, { 'X-Cache': 'HIT', 'X-Cache-Timestamp': new Date(cached.ts).toISOString() });
  }

  const serveStale = (reason: string): HandlerResponse | null =>
    cached && now - cached.ts < STALE_TTL_MS
      ? respond(200, cached.data, { 'X-Cache': reason, 'X-Cache-Timestamp': new Date(cached.ts).toISOString() })
      : null;

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'f1-paddock-intelligence (netlify function)' } });
    if (res.status === 404) {
      // No prediction published yet: cache the absence too so we do not poll GitHub on every hit.
      cache.set(url, { data: null, ts: now });
      return respond(200, null, { 'X-Cache': 'MISS', 'X-Cache-Timestamp': new Date(now).toISOString() });
    }
    if (!res.ok) {
      return serveStale('STALE') ?? respond(503, { error: 'Upstream unavailable', upstream: res.status });
    }
    const data = await res.json();
    cache.set(url, { data, ts: now });
    return respond(200, data, { 'X-Cache': 'MISS', 'X-Cache-Timestamp': new Date(now).toISOString() });
  } catch (err) {
    return serveStale('STALE-FETCH-FAIL') ?? respond(502, { error: 'Fetch failed', detail: (err as Error).message });
  }
};
