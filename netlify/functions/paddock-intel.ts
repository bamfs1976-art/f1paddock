import type { Handler } from '@netlify/functions';
import { callClaude, extractJson } from './utils/claude';
import { buildF1Context } from './utils/f1-context';

// One generation per completed round per hour. The cache key is the last
// completed round so a new result invalidates the analysis on the next hit,
// and repeat page loads inside the hour never reach Anthropic.
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 60 * 60 * 1000;
let inFlight: Promise<unknown> | null = null;

const JSON_HEADERS = { 'Content-Type': 'application/json' };

const SYSTEM = `You are a Formula 1 analyst writing for a premium F1 intelligence dashboard. You write analysis, not news: you have no access to the paddock, press conferences or any reporting, so you never quote anyone and never describe events which are not in the data you are given. Write in British English. Be factual, specific and data-driven. Never use clichés or filler. Output ONLY valid JSON, no markdown.`;

function prompt(context: string, nextRace: string | null): string {
  return `${context}

Generate a JSON object with this exact shape:
{
  "analysis": [
    { "id": 1, "kicker": "CHAMPIONSHIP|STRATEGY|TEAM|DRIVER|TECHNICAL|REGULATION", "headline": "...", "body": "80-120 words...", "type": "lead" },
    { "id": 2-5, "kicker": "...", "headline": "...", "body": "80-120 words...", "type": "neutral" }
  ],
  "paddockIntel": "100 word strategic summary of the current championship state",
  "ticker": [
    { "sym": "DRIVER_OR_TEAM_CODE", "val": "stat value taken from the standings", "pts": "context" }
  ],
  "racePreview": {
    "circuit": "${nextRace || 'next round'}",
    "keyStorylines": "100 word preview grounded in the standings and recent podiums",
    "tyreExpectation": "50 word tyre strategy outlook based on circuit characteristics",
    "weatherOutlook": "One sentence saying no forecast data is available unless the context provides one"
  }
}

Rules for the five analysis items: each must be grounded only in the standings, podiums and schedule supplied above. Cite the numbers you use. No quotations of any kind. No invented incidents, penalties, injuries, contracts or announcements. If a section of the context is UNAVAILABLE, do not write about it.

Provide exactly 5 analysis items and 8 ticker items. Output JSON only.`;
}

export const handler: Handler = async () => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Missing ANTHROPIC_API_KEY' }) };
  }

  try {
    const ctx = await buildF1Context();
    const key = `round-${ctx.lastCompletedRound}`;
    const hit = cache.get(key);
    if (hit && Date.now() - hit.ts < CACHE_TTL) {
      return {
        statusCode: 200,
        headers: { ...JSON_HEADERS, 'X-Cache': 'HIT', 'X-Cache-Timestamp': new Date(hit.ts).toISOString() },
        body: JSON.stringify(hit.data),
      };
    }

    // Collapse concurrent misses into one generation.
    if (!inFlight) {
      inFlight = (async () => {
        const text = await callClaude(SYSTEM, prompt(ctx.text, ctx.nextRaceName), 3000);
        const data = extractJson(text);
        cache.set(key, { data, ts: Date.now() });
        return data;
      })().finally(() => { inFlight = null; });
    }
    const data = await inFlight;

    return {
      statusCode: 200,
      headers: { ...JSON_HEADERS, 'X-Cache': 'MISS', 'X-Cache-Timestamp': new Date().toISOString() },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: 'AI generation failed', detail: (err as Error).message }),
    };
  }
};
