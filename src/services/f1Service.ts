import type { LiveSyncState, WeatherData, TelemetryData, LapData, RaceControlMessage, PitStop } from '../types';
import { DRIVER_NUMBER_MAP } from '../constants';

const BASE = 'https://api.openf1.org/v1';
const SESSION_TTL = 10 * 60 * 1000; // re-check session every 10 minutes

let cachedSessionKey: number | null = null;
let cachedSessionName: string | null = null;
let cachedMeetingKey: number | null = null;
let sessionLookupAt = 0;
let lastPositions: { driver_number: number; position: number }[] = [];
let syncInFlight: Promise<LiveSyncState | null> | null = null;
let backoffUntil = 0;

async function safeFetch<T>(url: string): Promise<T | null> {
  if (Date.now() < backoffUntil) return null;
  try {
    const res = await fetch(url);
    if (res.status === 429) {
      backoffUntil = Date.now() + 120_000;
      return null;
    }
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function isRateLimited(): boolean {
  return Date.now() < backoffUntil;
}

interface OpenF1Session {
  session_key: number; meeting_key: number; session_name: string; session_type: string;
  date_start: string; date_end: string; country_name?: string; circuit_short_name?: string;
}

async function refreshSession(force = false): Promise<OpenF1Session | null> {
  if (!force && cachedSessionKey && Date.now() - sessionLookupAt < SESSION_TTL) {
    return null;
  }
  const sessions = await safeFetch<OpenF1Session[]>(`${BASE}/sessions?meeting_key=latest`);
  if (!sessions || !sessions.length) return null;
  // Pick the session whose [date_start, date_end] contains "now", or the next upcoming, else the last one.
  const now = Date.now();
  const live = sessions.find((s) => {
    const start = new Date(s.date_start).getTime();
    const end = new Date(s.date_end).getTime();
    return now >= start && now <= end;
  });
  const upcoming = sessions
    .filter((s) => new Date(s.date_start).getTime() > now)
    .sort((a, b) => +new Date(a.date_start) - +new Date(b.date_start))[0];
  const chosen = live || upcoming || sessions[sessions.length - 1];
  cachedSessionKey = chosen.session_key;
  cachedSessionName = chosen.session_name;
  cachedMeetingKey = chosen.meeting_key;
  sessionLookupAt = Date.now();
  return chosen;
}

export async function getLatestSession() {
  return refreshSession(true);
}

async function fetchLatestWeather(): Promise<WeatherData | null> {
  // Prefer current session, then meeting (covers between-session windows).
  if (cachedSessionKey) {
    const sessionWeather = await safeFetch<WeatherData[]>(`${BASE}/weather?session_key=${cachedSessionKey}`);
    if (sessionWeather && sessionWeather.length) return sessionWeather[sessionWeather.length - 1];
  }
  const meetingWeather = await safeFetch<WeatherData[]>(`${BASE}/weather?meeting_key=latest`);
  if (meetingWeather && meetingWeather.length) return meetingWeather[meetingWeather.length - 1];
  return null;
}

export async function syncLiveData(): Promise<LiveSyncState | null> {
  if (syncInFlight) return syncInFlight;
  syncInFlight = doSync();
  try {
    return await syncInFlight;
  } finally {
    syncInFlight = null;
  }
}

async function doSync(): Promise<LiveSyncState | null> {
  if (Date.now() < backoffUntil) return null;
  const start = Date.now();
  await refreshSession();
  if (!cachedSessionKey) return null;

  const key = cachedSessionKey;
  const meetingKey = cachedMeetingKey;

  const [positionsRaw, weatherSession, raceControlRaw, pitRaw] = await Promise.all([
    safeFetch<{ driver_number: number; position: number; date: string }[]>(`${BASE}/position?session_key=${key}`),
    safeFetch<WeatherData[]>(`${BASE}/weather?session_key=${key}`),
    safeFetch<{ date: string; category: string; message: string; flag?: string; driver_number?: number }[]>(`${BASE}/race_control?session_key=${key}`),
    safeFetch<{ driver_number: number; lap_number: number; pit_duration: number }[]>(`${BASE}/pit?session_key=${key}`),
  ]);

  const latestPositions: Record<number, { driver_number: number; position: number }> = {};
  if (positionsRaw) {
    for (const p of positionsRaw) {
      latestPositions[p.driver_number] = { driver_number: p.driver_number, position: p.position };
    }
  }
  const positions = Object.values(latestPositions);
  if (positions.length) lastPositions = positions;

  // Weather: prefer session-specific, fall back to meeting-latest
  let weather: WeatherData | null = weatherSession && weatherSession.length ? weatherSession[weatherSession.length - 1] : null;
  if (!weather && meetingKey) {
    const meetingWeather = await safeFetch<WeatherData[]>(`${BASE}/weather?meeting_key=${meetingKey}`);
    if (meetingWeather && meetingWeather.length) weather = meetingWeather[meetingWeather.length - 1];
  }
  if (!weather) {
    const fallback = await safeFetch<WeatherData[]>(`${BASE}/weather?meeting_key=latest`);
    if (fallback && fallback.length) weather = fallback[fallback.length - 1];
  }

  const raceControl: RaceControlMessage[] = (raceControlRaw || [])
    .slice(-50)
    .reverse()
    .map((m) => ({
      timestamp: m.date,
      category: (m.category as RaceControlMessage['category']) || 'Other',
      message: m.message,
      flag: m.flag,
      driver: m.driver_number ? DRIVER_NUMBER_MAP[m.driver_number] : undefined,
    }));

  const pitStops: PitStop[] = (pitRaw || []).map((p) => ({
    driverCode: DRIVER_NUMBER_MAP[p.driver_number] || String(p.driver_number),
    lap: p.lap_number,
    duration: p.pit_duration,
  }));

  const state: LiveSyncState = {
    timestamp: Date.now(),
    latency: Date.now() - start,
    positions,
    weather,
    raceControl,
    pitStops,
    sessionKey: cachedSessionKey,
    sessionName: cachedSessionName,
  };

  try { localStorage.setItem('f1_live_sync', JSON.stringify(state)); } catch { /* quota */ }

  window.dispatchEvent(new CustomEvent('f1_live_sync_completed', { detail: { timestamp: state.timestamp } }));
  return state;
}

export async function getLapData(driverNumber: number): Promise<LapData[]> {
  await refreshSession();
  if (!cachedSessionKey) return [];
  const data = await safeFetch<LapData[]>(`${BASE}/laps?session_key=${cachedSessionKey}&driver_number=${driverNumber}`);
  return data || [];
}

function simulatedTelemetry(): TelemetryData {
  return {
    speed: 210 + Math.floor(Math.random() * 120),
    gear: 5 + Math.floor(Math.random() * 4),
    rpm: 10500 + Math.floor(Math.random() * 2000),
    drs: Math.random() < 0.2,
    throttle: 80 + Math.floor(Math.random() * 21),
    brake: Math.random() < 0.15 ? Math.floor(Math.random() * 100) : 0,
  };
}

export async function getLiveTelemetry(driverNumber?: number): Promise<TelemetryData> {
  if (!driverNumber || isRateLimited()) return simulatedTelemetry();
  await refreshSession();
  if (!cachedSessionKey) return simulatedTelemetry();
  const data = await safeFetch<TelemetryData[]>(`${BASE}/car_data?session_key=${cachedSessionKey}&driver_number=${driverNumber}`);
  if (!data || !data.length) return simulatedTelemetry();
  return data[data.length - 1];
}

export async function getWeather(): Promise<WeatherData | null> {
  return fetchLatestWeather();
}

export function getCachedSync(): LiveSyncState | null {
  try {
    const stored = localStorage.getItem('f1_live_sync');
    if (!stored) return null;
    return JSON.parse(stored) as LiveSyncState;
  } catch {
    return null;
  }
}

export function getLastPositions() { return lastPositions; }
