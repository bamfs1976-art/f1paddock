import type { LiveSyncState, WeatherData, TelemetryData, LapData, RaceControlMessage, PitStop } from '../types';
import { DRIVER_NUMBER_MAP } from '../constants';

const BASE = 'https://api.openf1.org/v1';

let cachedSessionKey: number | null = null;
let cachedSessionName: string | null = null;
let lastPositions: { driver_number: number; position: number }[] = [];

async function safeFetch<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (err) {
    console.error('OpenF1 fetch failed', err);
    return null;
  }
}

export async function getLatestSession() {
  const sessions = await safeFetch<{ session_key: number; session_name: string; session_type: string; date_start: string; date_end: string }[]>(
    `${BASE}/sessions?year=2026`
  );
  if (!sessions || !sessions.length) return null;
  const latest = sessions[sessions.length - 1];
  cachedSessionKey = latest.session_key;
  cachedSessionName = latest.session_name;
  return latest;
}

export async function syncLiveData(): Promise<LiveSyncState | null> {
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

  // Latest position per driver
  const latestPositions: Record<number, { driver_number: number; position: number }> = {};
  if (positionsRaw) {
    for (const p of positionsRaw) {
      latestPositions[p.driver_number] = { driver_number: p.driver_number, position: p.position };
    }
  }
  const positions = Object.values(latestPositions);
  lastPositions = positions;

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
  if (!cachedSessionKey) {
    return simulatedTelemetry();
  }
  if (!driverNumber) return simulatedTelemetry();
  const data = await safeFetch<TelemetryData[]>(`${BASE}/car_data?session_key=${cachedSessionKey}&driver_number=${driverNumber}`);
  if (!data || !data.length) return simulatedTelemetry();
  const latest = data[data.length - 1];
  return latest;
}

export async function getWeather(): Promise<WeatherData | null> {
  if (!cachedSessionKey) await getLatestSession();
  if (!cachedSessionKey) return null;
  const data = await safeFetch<WeatherData[]>(`${BASE}/weather?session_key=${cachedSessionKey}`);
  if (!data || !data.length) return null;
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
