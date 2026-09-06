import type { Handler, HandlerResponse } from '@netlify/functions';

// Read-through cache in front of Jolpica (the Ergast-compatible F1 API).
// Jolpica is rate limited at 500 requests per hour, so the design intent is
// one upstream call per path per hour regardless of site traffic. Netlify
// keeps the function warm, so this module-scoped Map survives between hits.
const cache = new Map<string, { data: unknown; status: number; ts: number }>();
const TTL_MS = 60 * 60_000;            // fresh for 60 minutes
const STALE_TTL_MS = 24 * 60 * 60_000; // serve stale for up to 24 hours if upstream fails

const BASE = 'https://api.jolpi.ca/ergast/f1/';

// Season, optional round, then one of four resources. Examples:
//   2026/driverStandings   2026/15/results   2026/races
const PATH_RE = /^\d{4}(\/\d{1,2})?\/(driverStandings|constructorStandings|results|races)$/;

const JSON_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, max-age=300',
};

function respond(
  status: number,
  body: unknown,
  extra: Record<string, string> = {}
): HandlerResponse {
  return { statusCode: status, headers: { ...JSON_HEADERS, ...extra }, body: JSON.stringify(body) };
}

export const handler: Handler = async (event): Promise<HandlerResponse> => {
  const path = event.queryStringParameters?.path || '';
  if (!PATH_RE.test(path)) {
    return respond(400, { error: 'Invalid or disallowed path', pattern: PATH_RE.source });
  }

  // Jolpica pages at 100 rows. Only numeric limit and offset are accepted.
  const limit = event.queryStringParameters?.limit;
  const offset = event.queryStringParameters?.offset;
  const params = new URLSearchParams();
  if (limit && /^\d{1,3}$/.test(limit)) params.set('limit', limit);
  if (offset && /^\d{1,5}$/.test(offset)) params.set('offset', offset);
  const qs = params.toString();

  const url = `${BASE}${path}.json${qs ? `?${qs}` : ''}`;
  const now = Date.now();
  const cached = cache.get(url);

  if (cached && now - cached.ts < TTL_MS) {
    return respond(cached.status, cached.data, {
      'X-Cache': 'HIT',
      'X-Cache-Timestamp': new Date(cached.ts).toISOString(),
    });
  }

  const serveStale = (reason: string, upstream?: number): HandlerResponse | null => {
    if (cached && now - cached.ts < STALE_TTL_MS) {
      return respond(cached.status, cached.data, {
        'X-Cache': reason,
        'X-Cache-Timestamp': new Date(cached.ts).toISOString(),
        ...(upstream ? { 'X-Upstream-Status': String(upstream) } : {}),
      });
    }
    return null;
  };

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'f1-paddock-intelligence (netlify function)' } });

    if (res.status === 429 || res.status >= 500) {
      return serveStale('STALE', res.status)
        ?? respond(503, { error: 'Upstream rate-limited or down', upstream: res.status });
    }
    if (!res.ok) {
      return respond(res.status, { error: `Jolpica returned ${res.status}` });
    }

    const data = await res.json();
    cache.set(url, { data, status: 200, ts: now });
    return respond(200, data, { 'X-Cache': 'MISS', 'X-Cache-Timestamp': new Date(now).toISOString() });
  } catch (err) {
    return serveStale('STALE-FETCH-FAIL')
      ?? respond(502, { error: 'Fetch failed', detail: (err as Error).message });
  }
};
