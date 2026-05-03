import type { Handler } from '@netlify/functions';
import { callClaude, extractJson } from './utils/claude';
import { buildF1Context } from './utils/f1-context';

let cache: { data: unknown; ts: number } | null = null;
const CACHE_TTL = 60 * 1000;

const SYSTEM = `You are a Formula 1 journalist and analyst writing for a premium F1 intelligence dashboard. Write in British English. Be factual, specific and data-driven. Never use clichés or filler. Output ONLY valid JSON, no markdown.`;

const PROMPT = `${buildF1Context()}

Generate a JSON object with this exact shape:
{
  "news": [
    { "id": 1, "kicker": "STRATEGY|TECHNICAL|PADDOCK|DRIVER|REGULATION", "headline": "...", "body": "80-120 words...", "type": "lead" },
    { "id": 2-5, "kicker": "...", "headline": "...", "body": "80-120 words...", "type": "neutral" }
  ],
  "paddockIntel": "100 word strategic summary of the current championship state",
  "ticker": [
    { "sym": "DRIVER_OR_TEAM_CODE", "val": "stat value", "pts": "context" }
  ],
  "racePreview": {
    "circuit": "Miami International Autodrome",
    "keyStorylines": "100 word preview of next race storylines",
    "tyreExpectation": "50 word tyre strategy outlook",
    "weatherOutlook": "30 word weather forecast"
  }
}

Provide 5 news items and 8 ticker items. Output JSON only.`;

export const handler: Handler = async () => {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return { statusCode: 200, body: JSON.stringify(cache.data) };
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing ANTHROPIC_API_KEY' }) };
  }

  try {
    const text = await callClaude(SYSTEM, PROMPT, 3000);
    const data = extractJson(text);
    cache = { data, ts: Date.now() };
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'AI generation failed', detail: (err as Error).message }),
    };
  }
};
