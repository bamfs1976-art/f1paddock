import type { Handler, HandlerResponse } from '@netlify/functions';

// Module-scoped cache. Netlify keeps the function warm so repeat hits get cache.
const cache = new Map<string, { data: unknown; status: number; ts: number }>();

// Fresh and stale windows per path. Live feeds turn over every 15 seconds;
// the schedule endpoints change a few times a season so they are held for
// hours and served stale for days if OpenF1 is unreachable.
const HOUR = 60 * 60_000;
const WINDOWS: Record<string, { ttl: number; stale: number }> = {
  meetings: { ttl: 24 * HOUR, stale: 7 * 24 * HOUR },
  sessions: { ttl: HOUR, stale: 7 * 24 * HOUR },
  drivers:  { ttl: HOUR, stale: 7 * 24 * HOUR },
};
const DEFAULT_WINDOW = { ttl: 15_000, stale: 5 * 60_000 };

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
  const { ttl: TTL_MS, stale: STALE_TTL_MS } = WINDOWS[path] || DEFAULT_WINDOW;

  // Fresh cache hit
  const cached = cache.get(url);
  if (cached && now - cached.ts < TTL_MS) {
    return {
      statusCode: cached.status,
      headers: { ...JSON_HEADERS, 'X-Cache': 'HIT', 'X-Cache-Timestamp': new Date(cached.ts).toISOString() },
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
          headers: {
            ...JSON_HEADERS,
            'X-Cache': 'STALE',
            'X-Cache-Timestamp': new Date(cached.ts).toISOString(),
            'X-Upstream-Status': String(res.status),
          },
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
      headers: { ...JSON_HEADERS, 'X-Cache': 'MISS', 'X-Cache-Timestamp': new Date(now).toISOString() },
      body: JSON.stringify(data),
    };
  } catch (err) {
    if (cached && now - cached.ts < STALE_TTL_MS) {
      return {
        statusCode: 200,
        headers: { ...JSON_HEADERS, 'X-Cache': 'STALE-FETCH-FAIL', 'X-Cache-Timestamp': new Date(cached.ts).toISOString() },
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
