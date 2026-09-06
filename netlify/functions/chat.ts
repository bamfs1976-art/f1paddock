import type { Handler, HandlerResponse } from '@netlify/functions';
import { callClaudeWithHistory } from './utils/claude';
import { buildF1Context } from './utils/f1-context';

// Chat is never cached (every question is different) but it is rate limited
// per IP: 20 messages per rolling hour. The bucket map lives in module scope,
// so it only counts requests handled by this warm function instance. A cold
// start or a second instance starts a fresh count. That is acceptable for
// cost control on a dashboard; it is not a security boundary.
const RATE_WINDOW = 60 * 60 * 1000;
const RATE_MAX = 20;
const buckets = new Map<string, number[]>();

const JSON_HEADERS: Record<string, string> = { 'Content-Type': 'application/json' };

function rateLimit(ip: string): { ok: boolean; retryAfter?: number; remaining: number } {
  const now = Date.now();
  const arr = (buckets.get(ip) || []).filter((t) => now - t < RATE_WINDOW);
  if (arr.length >= RATE_MAX) {
    return { ok: false, retryAfter: Math.ceil((RATE_WINDOW - (now - arr[0])) / 1000), remaining: 0 };
  }
  arr.push(now);
  buckets.set(ip, arr);
  // Keep the map from growing without bound on a long-lived instance.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (!v.some((t) => now - t < RATE_WINDOW)) buckets.delete(k);
  }
  return { ok: true, remaining: RATE_MAX - arr.length };
}

const SYSTEM_BASE = `You are an expert Formula 1 analyst and commentator called Paddock AI. You have deep knowledge of F1 history, regulations, strategy and engineering, and the current season context below. Answer questions conversationally in British English. Be specific and factual. Use only the season data supplied for anything about 2026; if the data does not cover a question, say so rather than guessing. Never invent quotations, incidents or announcements. Keep answers concise (under 200 words unless the question demands more).`;

export const handler: Handler = async (event): Promise<HandlerResponse> => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Missing ANTHROPIC_API_KEY' }) };
  }

  const ip = event.headers['x-nf-client-connection-ip'] || event.headers['x-forwarded-for']?.split(',')[0].trim() || 'unknown';
  const limit = rateLimit(ip);
  if (!limit.ok) {
    const minutes = Math.max(1, Math.ceil((limit.retryAfter || 60) / 60));
    return {
      statusCode: 429,
      headers: { ...JSON_HEADERS, 'Retry-After': String(limit.retryAfter || 60) },
      body: JSON.stringify({
        error: 'Rate limit exceeded',
        message: `You have used your 20 Paddock AI messages for this hour. Try again in about ${minutes} minute${minutes === 1 ? '' : 's'}.`,
      }),
    };
  }

  let message = '';
  let history: { role: 'user' | 'assistant'; content: string }[] = [];
  try {
    const body = JSON.parse(event.body || '{}');
    message = typeof body.message === 'string' ? body.message.slice(0, 2000) : '';
    history = Array.isArray(body.history)
      ? body.history
          .filter((m: { role?: string; content?: string }) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
          .slice(-8)
      : [];
  } catch {
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Invalid body' }) };
  }
  if (!message.trim()) {
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Message is required' }) };
  }

  try {
    const ctx = await buildF1Context();
    const system = `${SYSTEM_BASE}\n\nCURRENT SEASON CONTEXT:\n${ctx.text}`;
    const messages: { role: 'user' | 'assistant'; content: string }[] = [
      ...history,
      { role: 'user', content: message },
    ];
    const text = await callClaudeWithHistory(system, messages, 1500);
    return {
      statusCode: 200,
      headers: { ...JSON_HEADERS, 'X-RateLimit-Remaining': String(limit.remaining) },
      body: JSON.stringify({ response: text }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: 'Chat failed', detail: (err as Error).message }),
    };
  }
};
