import type { Handler } from '@netlify/functions';
import { callClaudeWithHistory } from './utils/claude';
import { buildF1Context } from './utils/f1-context';

const RATE_WINDOW = 60 * 1000;
const RATE_MAX = 10;
const buckets = new Map<string, number[]>();

function rateLimit(ip: string): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  const arr = (buckets.get(ip) || []).filter((t) => now - t < RATE_WINDOW);
  if (arr.length >= RATE_MAX) {
    return { ok: false, retryAfter: Math.ceil((RATE_WINDOW - (now - arr[0])) / 1000) };
  }
  arr.push(now);
  buckets.set(ip, arr);
  return { ok: true };
}

const SYSTEM_BASE = `You are an expert Formula 1 analyst and commentator called Paddock AI. You have deep knowledge of F1 history, regulations, strategy, engineering and the current 2026 season. Answer questions conversationally in British English. Be specific and factual. If you are unsure about something, say so. Keep answers concise (under 200 words unless the question demands more).`;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing ANTHROPIC_API_KEY' }) };
  }

  const ip = event.headers['x-forwarded-for']?.split(',')[0].trim() || 'unknown';
  const limit = rateLimit(ip);
  if (!limit.ok) {
    return {
      statusCode: 429,
      headers: { 'Retry-After': String(limit.retryAfter || 30) },
      body: JSON.stringify({ error: 'Rate limit exceeded' }),
    };
  }

  let message = '';
  let history: { role: 'user' | 'assistant'; content: string }[] = [];
  try {
    const body = JSON.parse(event.body || '{}');
    message = body.message || '';
    history = Array.isArray(body.history) ? body.history.slice(-8) : [];
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid body' }) };
  }
  if (!message.trim()) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Message is required' }) };
  }

  const system = `${SYSTEM_BASE}\n\nCURRENT SEASON CONTEXT:\n${buildF1Context()}`;
  const messages: { role: 'user' | 'assistant'; content: string }[] = [
    ...history,
    { role: 'user', content: message },
  ];

  try {
    const text = await callClaudeWithHistory(system, messages, 1500);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response: text }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Chat failed', detail: (err as Error).message }),
    };
  }
};
