import type { ScheduleRound, ScheduleSession, Race } from '../types';
import { CALENDAR } from '../constants';
import { getSeasonRaces, SEASON, type JolpicaRace } from './standingsService';
import { fetchOpenF1 } from './f1Service';

// The season schedule merged from three sources:
//   1. static circuit metadata (constants.CALENDAR): laps, distance, flag, map id
//   2. Jolpica `races`: every round with dates and session times, including
//      rounds which have not happened yet
//   3. OpenF1 `meetings` and `sessions`: only meetings which have started,
//      but with real session end times, meeting keys and session keys
// OpenF1 wins where both describe the same session because its date_end
// decides whether a session is live.

export interface OpenF1Meeting {
  meeting_key: number;
  meeting_name: string;
  meeting_official_name?: string;
  country_name?: string;
  circuit_short_name?: string;
  location?: string;
  date_start: string;
  gmt_offset?: string;
  year?: number;
}

export interface OpenF1Session {
  session_key: number;
  meeting_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end: string;
  country_name?: string;
  circuit_short_name?: string;
}

// Session lengths used to estimate an end time when Jolpica only has a start.
const DURATION_MIN: Record<string, number> = {
  'Practice 1': 60,
  'Practice 2': 60,
  'Practice 3': 60,
  'Sprint Qualifying': 44,
  'Sprint': 60,
  'Qualifying': 60,
  'Race': 120,
};

const JOLPICA_SESSIONS: { key: keyof JolpicaRaceSessions; name: string }[] = [
  { key: 'FirstPractice', name: 'Practice 1' },
  { key: 'SecondPractice', name: 'Practice 2' },
  { key: 'ThirdPractice', name: 'Practice 3' },
  { key: 'SprintQualifying', name: 'Sprint Qualifying' },
  { key: 'Sprint', name: 'Sprint' },
  { key: 'Qualifying', name: 'Qualifying' },
];

interface JolpicaRaceSessions {
  FirstPractice?: { date: string; time?: string };
  SecondPractice?: { date: string; time?: string };
  ThirdPractice?: { date: string; time?: string };
  SprintQualifying?: { date: string; time?: string };
  Sprint?: { date: string; time?: string };
  Qualifying?: { date: string; time?: string };
}

function isoFrom(date: string, time?: string): string {
  // Jolpica times are UTC ("13:00:00Z"). A missing time means the schedule
  // is provisional; assume 14:00 UTC so the countdown still lands on the day.
  const t = time ? (time.endsWith('Z') ? time : `${time}Z`) : '14:00:00Z';
  return new Date(`${date}T${t}`).toISOString();
}

function addMinutes(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

function daysBetween(a: string, b: string): number {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 86_400_000;
}

function staticRound(jr: JolpicaRace | null, round: number): Race | undefined {
  if (jr) {
    const byId = CALENDAR.find((c) => c.ergastId === jr.Circuit.circuitId);
    if (byId) return byId;
    const byDate = CALENDAR.find((c) => daysBetween(c.date, jr.date) <= 3);
    if (byDate) return byDate;
  }
  return CALENDAR.find((c) => c.round === round);
}

function jolpicaSessions(jr: JolpicaRace & JolpicaRaceSessions): ScheduleSession[] {
  const out: ScheduleSession[] = [];
  for (const { key, name } of JOLPICA_SESSIONS) {
    const s = jr[key];
    if (!s?.date) continue;
    const dateStart = isoFrom(s.date, s.time);
    out.push({ name, dateStart, dateEnd: addMinutes(dateStart, DURATION_MIN[name] || 60), source: 'jolpica' });
  }
  const raceStart = isoFrom(jr.date, jr.time);
  out.push({ name: 'Race', dateStart: raceStart, dateEnd: addMinutes(raceStart, DURATION_MIN.Race), source: 'jolpica' });
  return out.sort((a, b) => a.dateStart.localeCompare(b.dateStart));
}

function staticSessions(race: Race): ScheduleSession[] {
  const start = isoFrom(race.date, '14:00:00Z');
  return [{ name: 'Race', dateStart: start, dateEnd: addMinutes(start, DURATION_MIN.Race), source: 'static' }];
}

function mergeSessions(base: ScheduleSession[], live: OpenF1Session[]): ScheduleSession[] {
  if (!live.length) return base;
  const fromOpenF1: ScheduleSession[] = live.map((s) => ({
    name: s.session_name,
    dateStart: new Date(s.date_start).toISOString(),
    dateEnd: new Date(s.date_end).toISOString(),
    sessionKey: s.session_key,
    source: 'openf1' as const,
  }));
  // Keep any Jolpica session OpenF1 has not published (it publishes as they start).
  const names = new Set(fromOpenF1.map((s) => s.name));
  const rest = base.filter((s) => !names.has(s.name));
  return [...fromOpenF1, ...rest].sort((a, b) => a.dateStart.localeCompare(b.dateStart));
}

export async function getSchedule(): Promise<ScheduleRound[]> {
  const [jolpica, meetings, sessions] = await Promise.all([
    getSeasonRaces().catch(() => null),
    fetchOpenF1<OpenF1Meeting[]>('meetings', `year=${SEASON}`),
    fetchOpenF1<OpenF1Session[]>('sessions', `year=${SEASON}`),
  ]);

  const liveMeetings = (meetings || []).filter((m) => !/test/i.test(m.meeting_name));
  const sessionsByMeeting = new Map<number, OpenF1Session[]>();
  for (const s of sessions || []) {
    const arr = sessionsByMeeting.get(s.meeting_key) || [];
    arr.push(s);
    sessionsByMeeting.set(s.meeting_key, arr);
  }

  if (!jolpica && !liveMeetings.length) {
    throw new Error('Schedule unavailable from Jolpica and OpenF1');
  }

  const rounds: ScheduleRound[] = [];
  const total = jolpica ? jolpica.length : CALENDAR.length;

  for (let i = 0; i < total; i++) {
    const jr = jolpica ? (jolpica[i] as JolpicaRace & JolpicaRaceSessions) : null;
    const round = jr ? Number(jr.round) : CALENDAR[i].round;
    const meta = staticRound(jr, round);
    const raceDate = jr?.date || meta?.date || '';
    if (!raceDate) continue;

    const meeting = liveMeetings.find((m) => daysBetween(m.date_start, raceDate) <= 5);
    const liveSessions = meeting ? sessionsByMeeting.get(meeting.meeting_key) || [] : [];
    const baseSessions = jr ? jolpicaSessions(jr) : meta ? staticSessions(meta) : [];
    const merged = mergeSessions(baseSessions, liveSessions);
    const race = merged.find((s) => s.name === 'Race');

    rounds.push({
      round,
      country: meta?.country || meeting?.country_name || jr?.Circuit.Location?.country || '',
      flag: meta?.flag || '🏁',
      circuit: meta?.circuit || jr?.Circuit.circuitName || meeting?.circuit_short_name || '',
      circuitId: meta?.circuitId,
      ergastId: jr?.Circuit.circuitId || meta?.ergastId,
      date: raceDate,
      location: meta?.location || meeting?.location || jr?.Circuit.Location?.locality,
      laps: meta?.laps,
      distance: meta?.distance,
      name: meeting?.meeting_name || jr?.raceName || `${meta?.country || 'Unknown'} Grand Prix`,
      meetingKey: meeting?.meeting_key,
      raceStart: race?.dateStart,
      isSprint: merged.some((s) => s.name === 'Sprint'),
      sessions: merged,
    });
  }

  return rounds.sort((a, b) => a.round - b.round);
}

/** Index of the round whose sessions have not all finished yet. */
export function findNextRound(rounds: ScheduleRound[], now = Date.now()): ScheduleRound | null {
  for (const r of rounds) {
    const last = r.sessions[r.sessions.length - 1];
    const end = last ? new Date(last.dateEnd).getTime() : new Date(r.date).getTime() + 86_400_000;
    if (end > now) return r;
  }
  return null;
}

/** The session whose start-to-end window contains now, if any. */
export function findLiveSession(rounds: ScheduleRound[], now = Date.now()): { round: ScheduleRound; session: ScheduleSession } | null {
  for (const r of rounds) {
    for (const s of r.sessions) {
      if (new Date(s.dateStart).getTime() <= now && now <= new Date(s.dateEnd).getTime()) {
        return { round: r, session: s };
      }
    }
  }
  return null;
}

/** The first session which starts after now. */
export function findUpcomingSession(rounds: ScheduleRound[], now = Date.now()): { round: ScheduleRound; session: ScheduleSession } | null {
  let best: { round: ScheduleRound; session: ScheduleSession } | null = null;
  for (const r of rounds) {
    for (const s of r.sessions) {
      const start = new Date(s.dateStart).getTime();
      if (start > now && (!best || start < new Date(best.session.dateStart).getTime())) {
        best = { round: r, session: s };
      }
    }
  }
  return best;
}

/** The most recent session which has already ended; with `withKey`, only sessions OpenF1 has published. */
export function findLastFinishedSession(rounds: ScheduleRound[], now = Date.now(), withKey = false): { round: ScheduleRound; session: ScheduleSession } | null {
  let best: { round: ScheduleRound; session: ScheduleSession } | null = null;
  for (const r of rounds) {
    for (const s of r.sessions) {
      if (withKey && !s.sessionKey) continue;
      const end = new Date(s.dateEnd).getTime();
      if (end < now && (!best || end > new Date(best.session.dateEnd).getTime())) {
        best = { round: r, session: s };
      }
    }
  }
  return best;
}
