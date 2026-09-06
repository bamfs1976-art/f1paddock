import type { PaddockIntelData, DriverAnalysis } from '../types';

const BASE = '/.netlify/functions';

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export async function fetchPaddockIntel(): Promise<PaddockIntelData | null> {
  try {
    const res = await fetch(`${BASE}/paddock-intel`, { method: 'POST' });
    if (!res.ok) return null;
    return (await res.json()) as PaddockIntelData;
  } catch {
    return null;
  }
}

export async function fetchDriverAnalysis(driverA: string, driverB: string): Promise<DriverAnalysis | null> {
  try {
    const res = await fetch(`${BASE}/driver-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driverA, driverB }),
    });
    if (!res.ok) return null;
    return (await res.json()) as DriverAnalysis;
  } catch {
    return null;
  }
}

export async function sendChatMessage(
  message: string,
  history: { role: string; content: string }[]
): Promise<{ response: string } | null> {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) {
    if (res.status === 429) {
      let message = 'You have used your Paddock AI messages for this hour. Try again later.';
      try { message = (await res.json()).message || message; } catch { /* keep default */ }
      throw new RateLimitError(message);
    }
    return null;
  }
  return res.json();
}
