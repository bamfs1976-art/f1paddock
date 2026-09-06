// Server-side reads of Jolpica and OpenF1 for the AI functions. Functions run
// on Netlify, so they call the upstream APIs directly with the same in-memory
// cache pattern as the proxies: one call per URL per hour, stale for a day.

const cache = new Map<string, { data: unknown; ts: number }>();
const failures = new Map<string, number>(); // negative cache so a dead URL is not retried on every request
const TTL_MS = 60 * 60_000;
const STALE_MS = 24 * 60 * 60_000;
const FAIL_TTL_MS = 5 * 60_000;

export const SEASON = 2026;
const JOLPICA = 'https://api.jolpi.ca/ergast/f1/';
const OPENF1 = 'https://api.openf1.org/v1/';

async function cachedJson<T>(url: string): Promise<T | null> {
  const now = Date.now();
  const hit = cache.get(url);
  if (hit && now - hit.ts < TTL_MS) return hit.data as T;
  const failedAt = failures.get(url);
  if (failedAt && now - failedAt < FAIL_TTL_MS) return hit && now - hit.ts < STALE_MS ? (hit.data as T) : null;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'f1-paddock-intelligence (netlify function)' } });
    if (!res.ok) throw new Error(`${res.status}`);
    const data = (await res.json()) as T;
    cache.set(url, { data, ts: now });
    failures.delete(url);
    return data;
  } catch {
    failures.set(url, now);
    if (hit && now - hit.ts < STALE_MS) return hit.data as T;
    return null;
  }
}

// Jolpica shapes (only the fields read here).
interface JDriver { driverId: string; code?: string; permanentNumber?: string; givenName: string; familyName: string }
interface JConstructor { constructorId: string; name: string }
export interface DriverRow { position: number; points: number; wins: number; code: string; name: string; team: string; number: string }
export interface ConstructorRow { position: number; points: number; wins: number; name: string }
export interface RoundPodium { round: number; raceName: string; date: string; podium: { code: string; name: string; team: string; gap: string }[] }
export interface UpcomingRound {
  round: number;
  raceName: string;
  date: string;
  circuit: string;
  locality: string;
  country: string;
  sessions: { name: string; start: string }[];
}

const CONSTRUCTOR_NAMES: Record<string, string> = {
  mercedes: 'Mercedes', ferrari: 'Ferrari', mclaren: 'McLaren', red_bull: 'Red Bull',
  haas: 'Haas', alpine: 'Alpine', rb: 'Racing Bulls', racing_bulls: 'Racing Bulls',
  audi: 'Audi', sauber: 'Audi', williams: 'Williams', cadillac: 'Cadillac', aston_martin: 'Aston Martin',
};
const team = (c?: JConstructor) => (c ? CONSTRUCTOR_NAMES[c.constructorId] || c.name : '');
const code = (d: JDriver) => (d.code || d.familyName.slice(0, 3)).toUpperCase();

export async function getDriverStandings(): Promise<{ round: number; rows: DriverRow[] } | null> {
  type R = { MRData: { StandingsTable: { StandingsLists: { round: string; DriverStandings: { position?: string; positionText?: string; points: string; wins: string; Driver: JDriver; Constructors: JConstructor[] }[] }[] } } };
  const res = await cachedJson<R>(`${JOLPICA}${SEASON}/driverStandings.json`);
  const list = res?.MRData?.StandingsTable?.StandingsLists?.[0];
  if (!list) return null;
  return {
    round: Number(list.round) || 0,
    rows: list.DriverStandings.map((s) => ({
      position: Number(s.position || s.positionText) || 0,
      points: Number(s.points) || 0,
      wins: Number(s.wins) || 0,
      code: code(s.Driver),
      name: `${s.Driver.givenName} ${s.Driver.familyName}`,
      team: team(s.Constructors[s.Constructors.length - 1]),
      number: s.Driver.permanentNumber || '',
    })).sort((a, b) => a.position - b.position),
  };
}

export async function getConstructorStandings(): Promise<ConstructorRow[] | null> {
  type R = { MRData: { StandingsTable: { StandingsLists: { ConstructorStandings: { position?: string; positionText?: string; points: string; wins: string; Constructor: JConstructor }[] }[] } } };
  const res = await cachedJson<R>(`${JOLPICA}${SEASON}/constructorStandings.json`);
  const list = res?.MRData?.StandingsTable?.StandingsLists?.[0];
  if (!list) return null;
  return list.ConstructorStandings.map((s) => ({
    position: Number(s.position || s.positionText) || 0,
    points: Number(s.points) || 0,
    wins: Number(s.wins) || 0,
    name: team(s.Constructor),
  })).sort((a, b) => a.position - b.position);
}

export async function getRoundPodium(round: number): Promise<RoundPodium | null> {
  type R = { MRData: { RaceTable: { Races: { round: string; raceName: string; date: string; Results: { position: string; Driver: JDriver; Constructor: JConstructor; status: string; Time?: { time: string } }[] }[] } } };
  const res = await cachedJson<R>(`${JOLPICA}${SEASON}/${round}/results.json`);
  const race = res?.MRData?.RaceTable?.Races?.[0];
  if (!race) return null;
  const top = [...race.Results].sort((a, b) => Number(a.position) - Number(b.position)).slice(0, 3);
  return {
    round: Number(race.round),
    raceName: race.raceName,
    date: race.date,
    podium: top.map((r, i) => ({
      code: code(r.Driver),
      name: `${r.Driver.givenName} ${r.Driver.familyName}`,
      team: team(r.Constructor),
      gap: i === 0 ? 'winner' : r.Time?.time || r.status,
    })),
  };
}

const SESSION_KEYS: [string, string][] = [
  ['FirstPractice', 'Practice 1'], ['SecondPractice', 'Practice 2'], ['ThirdPractice', 'Practice 3'],
  ['SprintQualifying', 'Sprint Qualifying'], ['Sprint', 'Sprint'], ['Qualifying', 'Qualifying'],
];

/** The next round which has not finished, with its session list. OpenF1 sessions replace Jolpica times when published. */
export async function getUpcomingRound(now = Date.now()): Promise<UpcomingRound | null> {
  type Race = { round: string; raceName: string; date: string; time?: string; Circuit: { circuitName: string; Location: { locality: string; country: string } } } & Record<string, { date: string; time?: string } | unknown>;
  type R = { MRData: { RaceTable: { Races: Race[] } } };
  const res = await cachedJson<R>(`${JOLPICA}${SEASON}/races.json`);
  const races = res?.MRData?.RaceTable?.Races || [];
  const next = races.find((r) => {
    const start = Date.parse(`${r.date}T${r.time || '14:00:00Z'}`);
    return start + 3 * 60 * 60_000 > now;
  });
  if (!next) return null;

  const sessions: { name: string; start: string }[] = [];
  for (const [key, name] of SESSION_KEYS) {
    const s = next[key] as { date: string; time?: string } | undefined;
    if (s?.date) sessions.push({ name, start: `${s.date}T${s.time || '14:00:00Z'}` });
  }
  sessions.push({ name: 'Race', start: `${next.date}T${next.time || '14:00:00Z'}` });

  // OpenF1 publishes the meeting once its first session starts; use its times when they belong to this weekend.
  type S = { session_name: string; date_start: string; meeting_key: number };
  const live = await cachedJson<S[]>(`${OPENF1}sessions?meeting_key=latest`);
  if (live?.length) {
    const sameWeekend = Math.abs(Date.parse(live[0].date_start) - Date.parse(next.date)) < 6 * 86_400_000;
    if (sameWeekend) {
      for (const s of live) {
        const i = sessions.findIndex((x) => x.name === s.session_name);
        if (i >= 0) sessions[i] = { name: s.session_name, start: s.date_start };
        else sessions.push({ name: s.session_name, start: s.date_start });
      }
    }
  }
  sessions.sort((a, b) => Date.parse(a.start) - Date.parse(b.start));

  return {
    round: Number(next.round),
    raceName: next.raceName,
    date: next.date,
    circuit: next.Circuit.circuitName,
    locality: next.Circuit.Location.locality,
    country: next.Circuit.Location.country,
    sessions,
  };
}
