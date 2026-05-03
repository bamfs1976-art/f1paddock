import type { LiveSyncState, WeatherData, TelemetryData, LapData, RaceControlMessage, PitStop } from '../types';
import { DRIVER_NUMBER_MAP } from '../constants';

const BASE = 'https://api.openf1.org/v1';

let cachedSessionKey: number | null = null;
let cachedSessionName: string | null = null;
let lastPositions: { driver_number: number; position: number }[] = [];
let syncInFlight: Promise<LiveSyncState | null> | null = null;
let backoffUntil = 0;

async function safeFetch<T>(url: string): Promise<T | null> {
  if (Date.now() < backoffUntil) return null;
  try {
    const res = await fetch(url);
    if (res.status === 429) {
      // Back off for 2 minutes on rate limit
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

export async function getLatestSession() {
  const sessions = await safeFetch<{
    session_key: number; session_name: string; session_type: string;
    date_start: string; date_end: string; country_name?: string; circuit_short_name?: string;
  }[]>(`${BASE}/sessions?year=2026`);
  if (!sessions || !sessions.length) return null;
  const latest = sessions[sessions.length - 1];
  cachedSessionKey = latest.session_key;
  cachedSessionName = latest.session_name;
  return latest;
}

export async function syncLiveData(): Promise<LiveSyncState | null> {
  // Mutex: if a sync is already running, return the in-flight promise
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
  if (!cachedSessionKey) {
    await getLatestSession();
  }
  if (!cachedSessionKey) return null;

  const key = cachedSessionKey;

  const [positionsRaw, weatherRaw, raceControlRaw, pitRaw] = await Promise.all([
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

  const weather = weatherRaw && weatherRaw.length ? weatherRaw[weatherRaw.length - 1] : null;

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

  try {
    localStorage.setItem('f1_live_sync', JSON.stringify(state));
  } catch { /* quota */ }

  window.dispatchEvent(new CustomEvent('f1_live_sync_completed', { detail: { timestamp: state.timestamp } }));
  return state;
}

export async function getLapData(driverNumber: number): Promise<LapData[]> {
  if (!cachedSessionKey) await getLatestSession();
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
  if (!cachedSessionKey || !driverNumber || isRateLimited()) {
    return simulatedTelemetry();
  }
  const data = await safeFetch<TelemetryData[]>(`${BASE}/car_data?session_key=${cachedSessionKey}&driver_number=${driverNumber}`);
  if (!data || !data.length) return simulatedTelemetry();
  return data[data.length - 1];
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
