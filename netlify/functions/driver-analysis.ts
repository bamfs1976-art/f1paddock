import type { Handler } from '@netlify/functions';
import { callClaude, extractJson } from './utils/claude';
import { buildF1Context } from './utils/f1-context';

const SYSTEM = `You are an expert F1 performance analyst. Compare two drivers based on their 2026 season performance. Write in British English. Be specific with data points. Output ONLY valid JSON, no markdown.`;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing ANTHROPIC_API_KEY' }) };
  }

  let driverA = 'NOR';
  let driverB = 'VER';
  try {
    const body = JSON.parse(event.body || '{}');
    if (body.driverA) driverA = body.driverA;
    if (body.driverB) driverB = body.driverB;
  } catch { /* keep defaults */ }

  const prompt = `${buildF1Context()}

Compare drivers ${driverA} and ${driverB} this 2026 season.

Return JSON in this exact shape:
{
  "summary": "150-word factual comparison",
  "paceRating":         { "driverA": <1-10>, "driverB": <1-10> },
  "consistencyRating":  { "driverA": <1-10>, "driverB": <1-10> },
  "tyreManagement":     { "driverA": <1-10>, "driverB": <1-10> },
  "raceCraft":          { "driverA": <1-10>, "driverB": <1-10> },
  "verdict": "50-word verdict on who has been the stronger driver and why"
}

Output JSON only.`;

  try {
    const text = await callClaude(SYSTEM, prompt, 1500);
    const data = extractJson(text);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Driver analysis failed', detail: (err as Error).message }),
    };
  }
};
