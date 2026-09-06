import { useSyncExternalStore } from 'react';
import type { Driver, Team, DriverStanding, ConstructorStanding, RoundResult, ScheduleRound } from '../types';
import { DRIVERS, TEAMS, TEAM_COLORS, SNAPSHOT_DATE } from '../constants';
import { getDriverStandings, getConstructorStandings, getSeasonResults, getLastCompletedRound } from './standingsService';
import { getSchedule } from './scheduleService';
import { combineFreshness } from './proxyClient';

// Small external store shared by every component which needs season data.
// Each resource loads once, dedupes in-flight requests, remembers the last
// good payload in localStorage and exposes one of four states:
//   loading      first load, nothing to show yet
//   fresh        served from a live proxy response
//   stale        served from the proxy's stale window or from localStorage
//   unavailable  no data and no cache

export type DataStatus = 'loading' | 'fresh' | 'stale' | 'unavailable';

export interface ResourceState<T> {
  data: T | null;
  status: DataStatus;
  fetchedAt: number | null;
  error: string | null;
}

const RETRY_MS = 60_000;
const MIN_RELOAD_GAP_MS = 60_000; // a stale resource is not re-requested more often than this

function createResource<T>(key: string, loader: () => Promise<T>, freshnessKeys: () => string[]) {
  const storageKey = `f1_cache_${key}`;
  let state: ResourceState<T> = { data: null, status: 'loading', fetchedAt: null, error: null };
  const listeners = new Set<() => void>();
  let inFlight: Promise<void> | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let hydrated = false;
  let lastAttempt = 0;

  const emit = () => listeners.forEach((l) => l());
  const set = (next: Partial<ResourceState<T>>) => {
    state = { ...state, ...next };
    emit();
  };

  const hydrate = () => {
    if (hydrated) return;
    hydrated = true;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { data: T; ts: number };
      if (parsed?.data) state = { data: parsed.data, status: 'stale', fetchedAt: parsed.ts, error: null };
    } catch { /* ignore corrupt cache */ }
  };

  const persist = (data: T, ts: number) => {
    try { localStorage.setItem(storageKey, JSON.stringify({ data, ts })); } catch { /* quota */ }
  };

  const load = (force = false): Promise<void> => {
    hydrate();
    if (inFlight) return inFlight;
    if (!force && state.status === 'fresh') return Promise.resolve();
    if (!force && Date.now() - lastAttempt < MIN_RELOAD_GAP_MS) return Promise.resolve();
    if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
    lastAttempt = Date.now();
    inFlight = (async () => {
      try {
        const data = await loader();
        const fresh = combineFreshness(freshnessKeys());
        const fetchedAt = fresh?.fetchedAt ?? Date.now();
        set({ data, status: fresh?.status === 'stale' ? 'stale' : 'fresh', fetchedAt, error: null });
        persist(data, fetchedAt);
      } catch (err) {
        const message = (err as Error).message || 'Request failed';
        if (state.data) set({ status: 'stale', error: message });
        else set({ status: 'unavailable', error: message });
        retryTimer = setTimeout(() => { retryTimer = null; load(true); }, RETRY_MS);
      } finally {
        inFlight = null;
      }
    })();
    return inFlight;
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    if (state.status !== 'fresh') load();
    return () => { listeners.delete(listener); };
  };

  const getSnapshot = () => state;

  return { load, subscribe, getSnapshot };
}

// Standings bundle: current and previous-round standings so position arrows
// compare like with like. Jolpica publishes the previous round at
// 2026/{round-1}/driverStandings.
export interface StandingsBundle {
  round: number;
  drivers: DriverStanding[];
  constructors: ConstructorStanding[];
  prevDrivers: DriverStanding[];
  prevConstructors: ConstructorStanding[];
}

async function loadStandings(): Promise<StandingsBundle> {
  const drivers = await getDriverStandings();
  if (!drivers.length) throw new Error('Jolpica returned no driver standings');
  // Same proxy path as above, so this is served from the server cache.
  const round = await getLastCompletedRound();
  const [constructors, prevDrivers, prevConstructors] = await Promise.all([
    getConstructorStandings(),
    round > 1 ? getDriverStandings(round - 1).catch(() => [] as DriverStanding[]) : Promise.resolve([] as DriverStanding[]),
    round > 1 ? getConstructorStandings(round - 1).catch(() => [] as ConstructorStanding[]) : Promise.resolve([] as ConstructorStanding[]),
  ]);
  return { round, drivers, constructors, prevDrivers, prevConstructors };
}

export const standingsResource = createResource<StandingsBundle>(
  'standings',
  loadStandings,
  () => ['jolpica:2026/driverStandings', 'jolpica:2026/constructorStandings']
);

export const resultsResource = createResource<RoundResult[]>(
  'results',
  getSeasonResults,
  () => ['jolpica:2026/results']
);

export const scheduleResource = createResource<ScheduleRound[]>(
  'schedule',
  getSchedule,
  () => ['jolpica:2026/races', 'openf1:meetings', 'openf1:sessions']
);

export function useResource<T>(resource: ReturnType<typeof createResource<T>>): ResourceState<T> {
  return useSyncExternalStore(resource.subscribe, resource.getSnapshot, resource.getSnapshot);
}

// Derived views ------------------------------------------------------------

const STATIC_BY_ID = new Map(DRIVERS.map((d) => [d.id, d]));
const STATIC_TEAM_BY_NAME = new Map(TEAMS.map((t) => [t.name, t]));

// Merged views are cached per bundle so consumers get stable array identities.
const driverViews = new WeakMap<StandingsBundle, Driver[]>();
const teamViews = new WeakMap<StandingsBundle, Team[]>();

/** Live standings merged with static bios and career stats. */
export function mergeDrivers(bundle: StandingsBundle): Driver[] {
  const cached = driverViews.get(bundle);
  if (cached) return cached;
  const view = buildDrivers(bundle);
  driverViews.set(bundle, view);
  return view;
}

function buildDrivers(bundle: StandingsBundle): Driver[] {
  const prevPos = new Map(bundle.prevDrivers.map((d) => [d.id, d.position]));
  const leaderPts = bundle.drivers[0]?.points ?? 0;
  return bundle.drivers.map((s) => {
    const base = STATIC_BY_ID.get(s.id);
    const prev = prevPos.get(s.id);
    return {
      id: s.id,
      pos: s.position,
      name: base?.name || s.name,
      code: s.code,
      number: s.number || base?.number,
      team: s.team,
      country: base?.country || '🏁',
      pts: s.points,
      gap: s.position === 1 ? 'LEADER' : s.points - leaderPts,
      color: TEAM_COLORS[s.team] || s.color,
      bio: base?.bio,
      careerStats: base?.careerStats,
      posChange: prev ? prev - s.position : 0,
      wins: s.wins,
    };
  });
}

export function mergeTeams(bundle: StandingsBundle): Team[] {
  const cached = teamViews.get(bundle);
  if (cached) return cached;
  const view = buildTeams(bundle);
  teamViews.set(bundle, view);
  return view;
}

function buildTeams(bundle: StandingsBundle): Team[] {
  const prevPos = new Map(bundle.prevConstructors.map((c) => [c.name, c.position]));
  return bundle.constructors.map((c) => {
    const base = STATIC_TEAM_BY_NAME.get(c.name);
    const prev = prevPos.get(c.name);
    return {
      id: base?.id || c.constructorId,
      pos: c.position,
      name: c.name,
      engine: base?.engine || '',
      country: base?.country || '🏁',
      pts: c.points,
      color: TEAM_COLORS[c.name] || c.color,
      posChange: prev ? prev - c.position : 0,
      wins: c.wins,
    };
  });
}

export interface DriversView {
  drivers: Driver[];
  teams: Team[];
  round: number;
  status: DataStatus;
  fetchedAt: number | null;
  snapshot: boolean; // true when the hardcoded constants are being shown
  retry: () => void;
}

/** Drivers and teams for any consumer. Falls back to the labelled snapshot only when nothing else exists. */
export function useDrivers(): DriversView {
  const s = useResource(standingsResource);
  if (s.data) {
    return {
      drivers: mergeDrivers(s.data),
      teams: mergeTeams(s.data),
      round: s.data.round,
      status: s.status,
      fetchedAt: s.fetchedAt,
      snapshot: false,
      retry: () => standingsResource.load(true),
    };
  }
  return {
    drivers: DRIVERS,
    teams: TEAMS,
    round: 3,
    status: s.status,
    fetchedAt: s.status === 'unavailable' ? Date.parse(SNAPSHOT_DATE) : null,
    snapshot: s.status === 'unavailable',
    retry: () => standingsResource.load(true),
  };
}

export function useSeasonResults() {
  return useResource(resultsResource);
}

export function useSchedule() {
  return useResource(scheduleResource);
}
