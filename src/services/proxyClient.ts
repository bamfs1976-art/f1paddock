// Shared fetch helper for the Netlify proxies. Records the cache status the
// proxy reported (X-Cache, X-Cache-Timestamp) per logical key so components
// can label stale data with the time it was actually fetched.

export type CacheStatus = 'fresh' | 'stale';

export interface Freshness {
  status: CacheStatus;
  fetchedAt: number; // epoch ms of the upstream fetch the data came from
}

const freshness = new Map<string, Freshness>();

export class ProxyError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function proxyFetch<T>(url: string, key: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new ProxyError(`Proxy returned ${res.status}`, res.status);
  const cacheHeader = res.headers.get('X-Cache') || 'MISS';
  const tsHeader = res.headers.get('X-Cache-Timestamp');
  const fetchedAt = tsHeader ? Date.parse(tsHeader) : Date.now();
  freshness.set(key, {
    status: cacheHeader.startsWith('STALE') ? 'stale' : 'fresh',
    fetchedAt: Number.isFinite(fetchedAt) ? fetchedAt : Date.now(),
  });
  return (await res.json()) as T;
}

/** Freshness of the most recent response for a logical key (see standingsService). */
export function getFreshness(key: string): Freshness | null {
  return freshness.get(key) ?? null;
}

/** Worst-case freshness across several keys: stale if any is stale, oldest fetch time. */
export function combineFreshness(keys: string[]): Freshness | null {
  const found = keys.map((k) => freshness.get(k)).filter((f): f is Freshness => !!f);
  if (!found.length) return null;
  return {
    status: found.some((f) => f.status === 'stale') ? 'stale' : 'fresh',
    fetchedAt: Math.min(...found.map((f) => f.fetchedAt)),
  };
}
