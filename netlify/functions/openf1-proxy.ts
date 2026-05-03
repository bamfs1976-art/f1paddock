import type { Handler, HandlerResponse } from '@netlify/functions';

// Module-scoped cache. Netlify keeps the function warm so repeat hits get cache.
const cache = new Map<string, { data: unknown; status: number; ts: number }>();
const TTL_MS = 15_000;
const STALE_TTL_MS = 5 * 60_000; // serve stale up to 5 min if upstream is rate-limited

const ALLOWED = new Set([
  'sessions',
  'meetings',
  'position',
  'weather',
  'race_control',
  'pit',
  'laps',
  'car_data',
  'drivers',
  'intervals',
  'stints',
]);

const JSON_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, max-age=10',
};

export const handler: Handler = async (event): Promise<HandlerResponse> => {
  const path = event.queryStringParameters?.path;
  const query = event.queryStringParameters?.query || '';

  if (!path || !ALLOWED.has(path)) {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: 'Invalid or disallowed path', allowed: [...ALLOWED] }),
    };
  }

  const url = `https://api.openf1.org/v1/${path}${query ? `?${query}` : ''}`;
  const now = Date.now();

  // Fresh cache hit
  const cached = cache.get(url);
  if (cached && now - cached.ts < TTL_MS) {
    return {
      statusCode: cached.status,
      headers: { ...JSON_HEADERS, 'X-Cache': 'HIT' },
      body: JSON.stringify(cached.data),
    };
  }

  try {
    const res = await fetch(url);

    // Upstream rate-limit or error: serve stale if we have it within stale window
    if (res.status === 429 || res.status >= 500) {
      if (cached && now - cached.ts < STALE_TTL_MS) {
        return {
          statusCode: cached.status,
          headers: { ...JSON_HEADERS, 'X-Cache': 'STALE', 'X-Upstream-Status': String(res.status) },
          body: JSON.stringify(cached.data),
        };
      }
      return {
        statusCode: 503,
        headers: JSON_HEADERS,
        body: JSON.stringify({ error: 'Upstream rate-limited or down', upstream: res.status }),
      };
    }

    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: JSON_HEADERS,
        body: JSON.stringify({ error: `OpenF1 returned ${res.status}` }),
      };
    }

    const data = await res.json();
    cache.set(url, { data, status: 200, ts: now });
    return {
      statusCode: 200,
      headers: { ...JSON_HEADERS, 'X-Cache': 'MISS' },
      body: JSON.stringify(data),
    };
  } catch (err) {
    if (cached && now - cached.ts < STALE_TTL_MS) {
      return {
        statusCode: 200,
        headers: { ...JSON_HEADERS, 'X-Cache': 'STALE-FETCH-FAIL' },
        body: JSON.stringify(cached.data),
      };
    }
    return {
      statusCode: 502,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: 'Fetch failed', detail: (err as Error).message }),
    };
  }
};
