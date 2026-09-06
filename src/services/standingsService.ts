import type { DriverStanding, ConstructorStanding, RoundResult, PodiumEntry } from '../types';
import { DRIVER_CODE_MAP, CONSTRUCTOR_ID_MAP, TEAM_COLORS } from '../constants';
import { proxyFetch } from './proxyClient';

// Every Jolpica call goes through the Netlify proxy, which caches each path for
// an hour. The browser never calls api.jolpi.ca directly.
export const SEASON = 2026;
const PROXY = '/.netlify/functions/jolpica-proxy';

// Jolpica (Ergast) response shapes. Only the fields the app reads are typed.
interface JDriver {
  driverId: string;
  permanentNumber?: string;
  code?: string;
  givenName: string;
  familyName: string;
}
interface JConstructor { constructorId: string; name: string }
interface JDriverStanding {
  position?: string;
  positionText?: string;
  points: string;
  wins: string;
  Driver: JDriver;
  Constructors: JConstructor[];
}
interface JConstructorStanding {
  position?: string;
  positionText?: string;
  points: string;
  wins: string;
  Constructor: JConstructor;
}
interface JStandingsList<T> { season: string; round: string; DriverStandings?: T[]; ConstructorStandings?: T[] }
interface JResult {
  position: string;
  positionText: string;
  points: string;
  Driver: JDriver;
  Constructor: JConstructor;
  status: string;
  Time?: { millis?: string; time: string };
  FastestLap?: { rank?: string; lap?: string; Time?: { time: string } };
}
interface JRace {
  season: string;
  round: string;
  raceName: string;
  date: string;
  time?: string;
  Circuit: { circuitId: string; circuitName: string; Location?: { locality?: string; country?: string } };
  Results?: JResult[];
}
interface JMRData {
  MRData: {
    total: string;
    limit: string;
    offset: string;
    StandingsTable?: { StandingsLists: JStandingsList<JDriverStanding | JConstructorStanding>[] };
    RaceTable?: { Races: JRace[] };
  };
}

function jolpica(path: string, extra: Record<string, string> = {}) {
  const params = new URLSearchParams({ path, ...extra });
  return proxyFetch<JMRData>(`${PROXY}?${params.toString()}`, `jolpica:${path}`);
}

function teamName(c: JConstructor | undefined): string {
  if (!c) return '';
  return CONSTRUCTOR_ID_MAP[c.constructorId] || c.name;
}

function toDriverStanding(s: JDriverStanding): DriverStanding {
  const code = (s.Driver.code || s.Driver.familyName.slice(0, 3)).toUpperCase();
  const team = teamName(s.Constructors[s.Constructors.length - 1]);
  return {
    position: Number(s.position || s.positionText) || 0,
    points: Number(s.points) || 0,
    wins: Number(s.wins) || 0,
    driverId: s.Driver.driverId,
    id: DRIVER_CODE_MAP[code] || code.toLowerCase(),
    code,
    number: Number(s.Driver.permanentNumber) || 0,
    name: `${s.Driver.givenName} ${s.Driver.familyName}`,
    team,
    color: TEAM_COLORS[team] || '#888888',
  };
}

function toConstructorStanding(s: JConstructorStanding): ConstructorStanding {
  const name = teamName(s.Constructor);
  return {
    position: Number(s.position || s.positionText) || 0,
    points: Number(s.points) || 0,
    wins: Number(s.wins) || 0,
    constructorId: s.Constructor.constructorId,
    name,
    color: TEAM_COLORS[name] || '#888888',
  };
}

/** Driver standings after `round`, or the latest available when omitted. */
export async function getDriverStandings(round?: number): Promise<DriverStanding[]> {
  const path = round ? `${SEASON}/${round}/driverStandings` : `${SEASON}/driverStandings`;
  const res = await jolpica(path);
  const list = res.MRData.StandingsTable?.StandingsLists[0];
  const rows = (list?.DriverStandings || []) as JDriverStanding[];
  return rows.map(toDriverStanding).sort((a, b) => a.position - b.position);
}

/** Constructor standings after `round`, or the latest available when omitted. */
export async function getConstructorStandings(round?: number): Promise<ConstructorStanding[]> {
  const path = round ? `${SEASON}/${round}/constructorStandings` : `${SEASON}/constructorStandings`;
  const res = await jolpica(path);
  const list = res.MRData.StandingsTable?.StandingsLists[0];
  const rows = (list?.ConstructorStandings || []) as JConstructorStanding[];
  return rows.map(toConstructorStanding).sort((a, b) => a.position - b.position);
}

/** The round number of the most recent race Jolpica has standings for. */
export async function getLastCompletedRound(): Promise<number> {
  const res = await jolpica(`${SEASON}/driverStandings`);
  const list = res.MRData.StandingsTable?.StandingsLists[0];
  return list ? Number(list.round) || 0 : 0;
}

function toRoundResult(race: JRace): RoundResult {
  const results = race.Results || [];
  const byPosition = [...results].sort((a, b) => Number(a.position) - Number(b.position));
  const podium: PodiumEntry[] = byPosition.slice(0, 3).map((r) => {
    const code = (r.Driver.code || r.Driver.familyName.slice(0, 3)).toUpperCase();
    return {
      code,
      id: DRIVER_CODE_MAP[code] || code.toLowerCase(),
      name: `${r.Driver.givenName} ${r.Driver.familyName}`,
      team: teamName(r.Constructor),
      gap: Number(r.position) === 1 ? '+0.000' : (r.Time?.time || r.status),
    };
  });
  const fl = results.find((r) => r.FastestLap?.rank === '1') || results.find((r) => r.FastestLap?.Time?.time);
  const flCode = fl ? (fl.Driver.code || fl.Driver.familyName.slice(0, 3)).toUpperCase() : undefined;
  return {
    round: Number(race.round),
    raceName: race.raceName,
    date: race.date,
    circuitId: race.Circuit.circuitId,
    circuitName: race.Circuit.circuitName,
    winner: podium[0]?.name,
    podium,
    fastestLap: fl && flCode && fl.FastestLap?.Time?.time
      ? { code: flCode, id: DRIVER_CODE_MAP[flCode] || flCode.toLowerCase(), time: fl.FastestLap.Time.time }
      : undefined,
    winnerTime: byPosition[0]?.Time?.time,
  };
}

/**
 * Every completed round of the season with winner, podium (with gaps) and
 * fastest lap. Jolpica pages results at 100 rows, so a full season is a
 * handful of proxy calls, each cached server-side for an hour.
 */
export async function getSeasonResults(): Promise<RoundResult[]> {
  const races = new Map<number, JRace>();
  let offset = 0;
  const limit = 100;
  for (let page = 0; page < 8; page++) {
    const res = await jolpica(`${SEASON}/results`, { limit: String(limit), offset: String(offset) });
    const chunk = res.MRData.RaceTable?.Races || [];
    for (const r of chunk) {
      const key = Number(r.round);
      const existing = races.get(key);
      if (existing) existing.Results = [...(existing.Results || []), ...(r.Results || [])];
      else races.set(key, { ...r, Results: [...(r.Results || [])] });
    }
    const total = Number(res.MRData.total) || 0;
    offset += limit;
    if (offset >= total || chunk.length === 0) break;
  }
  return [...races.values()].map(toRoundResult).sort((a, b) => a.round - b.round);
}

/** The Jolpica season schedule: every round with its date, circuit and session times. */
export async function getSeasonRaces(): Promise<JRace[]> {
  const res = await jolpica(`${SEASON}/races`);
  return res.MRData.RaceTable?.Races || [];
}
export type { JRace as JolpicaRace };
